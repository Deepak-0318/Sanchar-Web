import json, os
from typing import Dict, List
import pandas as pd
import google.generativeai as genai
from dotenv import load_dotenv
from helpers import vibe_match, haversine, estimate_visit_time, safe_list, weather_score

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
MODEL_NAME = "models/gemini-flash-latest"

SYSTEM_PROMPT_INTENT = "You are Agent-1. Output ONLY valid JSON."
SYSTEM_PROMPT_NARRATOR = "Explain the plan clearly and briefly."

def agent_1_intent_builder(user_input: Dict) -> Dict:
    try:
        model = genai.GenerativeModel(
            model_name=MODEL_NAME,
            system_instruction=SYSTEM_PROMPT_INTENT
        )
        res = model.generate_content(json.dumps(user_input))
        intent = json.loads(res.text)
    except:
        intent = {}

    budget = float(user_input.get("budget") or 1000)

    intent["vibe"] = intent.get("vibe") or [user_input.get("mood", "chill")]
    intent["budget_min"] = float(intent.get("budget_min") or 0)
    intent["budget_max"] = float(intent.get("budget_max") or budget)

    time_str = user_input.get("time_available", "2-4 hours")
    intent["time_available_hours"] = (
        1.5 if "1-2" in time_str else
        3.0 if "2-4" in time_str else
        5.0 if "4-6" in time_str else 3.0
    )

    intent.setdefault("preferences", {})
    intent["preferences"].setdefault("weather_adaptive", True)
    intent["weather"] = user_input.get("weather", "clear")

    return intent

# ---------------- AGENT 2 ----------------

def agent_2_dataset_filter(df: pd.DataFrame, intent: Dict) -> pd.DataFrame:
    budget_max = float(intent["budget_max"])
    budget_min = float(intent["budget_min"])
    current_weather = intent.get("weather", "clear")

    base = df[
        (df["budget_min"] <= budget_max) &
        (df["budget_max"] >= budget_min)
    ].copy()

    if base.empty:
        base = df.copy()

    if "data_quality_score" in base.columns:
        base = base[base["data_quality_score"] >= 0.4]

    scored = []

    for _, row in base.iterrows():
        r = row.to_dict()

        vibe_score = 1.0 if vibe_match(row, intent["vibe"]) else 0.5
        w_score = weather_score(row, current_weather)

        final_score = (vibe_score * 0.6) + (w_score * 0.4)

        r["final_score"] = round(final_score, 3)
        r["is_hidden_gem_flag"] = str(r.get("is_hidden_gem", "")).lower() in ["true","1","yes","y"]
        scored.append(r)

    scored_df = pd.DataFrame(scored)

    return scored_df.sort_values(
        by=["final_score", "is_hidden_gem_flag", "popularity_score"],
        ascending=[False, False, False]
    ).reset_index(drop=True)

# ---------------- AGENT 3 ----------------

def agent_3_route_optimizer(
    places: pd.DataFrame,
    start_lat: float,
    start_lon: float,
    time_available_hours: float
) -> List[Dict]:

    selected = []
    remaining_time = time_available_hours
    cur_lat, cur_lon = start_lat, start_lon

    places = places.copy()
    places["distance"] = places.apply(
        lambda r: haversine(cur_lat, cur_lon, r["latitude"], r["longitude"]),
        axis=1
    )

    places = places.sort_values(by=["final_score", "distance"], ascending=[False, True])

    for _, r in places.iterrows():
        visit = estimate_visit_time(r.get("category"))
        travel = r["distance"] / 20
        total = visit + travel

        if not selected or remaining_time >= total:
            selected.append({
                "place_id": r["place_id"],
                "place_name": r["place_name"],
                "category": r["category"],
                "distance_km": round(r["distance"], 2),
                "visit_time_hr": visit,
                "is_hidden_gem": r.get("is_hidden_gem_flag", False)
            })

            remaining_time -= total
            cur_lat, cur_lon = r["latitude"], r["longitude"]

        if len(selected) >= 3:
            break

    return selected

# ---------------- AGENT 5 ----------------

def agent_5_plan_narrator(intent: Dict, optimized_plan: List[Dict]) -> str:
    if not optimized_plan:
        return "No suitable places found. Try adjusting your inputs."

    try:
        model = genai.GenerativeModel(
            model_name=MODEL_NAME,
            system_instruction=SYSTEM_PROMPT_NARRATOR
        )
        res = model.generate_content(
            json.dumps({"intent": intent, "plan": optimized_plan}),
            generation_config={"temperature": 0.4}
        )
        return res.text.strip()
    except:
        names = ", ".join(p["place_name"] for p in optimized_plan)
        return f"We’ve created a balanced plan featuring {names}, optimized for your mood, time, and weather."
