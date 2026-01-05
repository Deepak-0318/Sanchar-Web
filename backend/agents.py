import json, os
from typing import Dict, List
import pandas as pd
import google.generativeai as genai
from dotenv import load_dotenv
from helpers import vibe_match, haversine, estimate_visit_time, weather_score

# -------------------------------------------------
# CONFIG
# -------------------------------------------------
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
MODEL_NAME = "models/gemini-flash-latest"

SYSTEM_PROMPT_NARRATOR = "Explain the plan clearly and briefly."

# -------------------------------------------------
# AGENT 1: INTENT PARSER
# -------------------------------------------------

def agent_1_intent_builder(user_input: Dict) -> Dict:
    msg = user_input.get("message", "").lower()

    intent = {
        "start_location": None,
        "preferred_location": None,
        "vibe": ["chill"],
        "budget_tier": "moderate",
        "time_available_hours": 3.0,
        "weather": "clear"
    }

    # ---------- VIBE ----------
    if "romantic" in msg:
        intent["vibe"] = ["romantic"]
    elif "fun" in msg or "lively" in msg:
        intent["vibe"] = ["fun"]
    elif "relaxed" in msg or "calm" in msg:
        intent["vibe"] = ["chill"]

    # ---------- BUDGET ----------
    if "premium" in msg or "luxury" in msg or "fine dining" in msg:
        intent["budget_tier"] = "premium"
    elif "budget" in msg or "cheap" in msg:
        intent["budget_tier"] = "budget"

    # ---------- TIME ----------
    if "full day" in msg or "entire day" in msg:
        intent["time_available_hours"] = 8.0
    elif "half day" in msg:
        intent["time_available_hours"] = 4.5
    elif "1-2" in msg or "1 to 2" in msg:
        intent["time_available_hours"] = 1.5
    elif "2-4" in msg or "2 to 4" in msg:
        intent["time_available_hours"] = 3.0

    # ---------- LOCATION NORMALIZATION ----------
    if "rr nagar" in msg or "rajarajeshwari" in msg:
        intent["preferred_location"] = "RR Nagar, Bengaluru"

    elif "mg road" in msg:
        intent["preferred_location"] = "MG Road, Bengaluru"

    elif "whitefield" in msg:
        intent["preferred_location"] = "Whitefield, Bengaluru"

    elif any(k in msg for k in [
        "ramanagara", "ramnagara", "bengaluru south",
        "kanakapura", "channapatna", "magadi"
    ]):
        intent["preferred_location"] = "Ramanagara, Bengaluru"

    return intent


# -------------------------------------------------
# AGENT 2: SCORING
# -------------------------------------------------

def agent_2_dataset_filter(df: pd.DataFrame, intent: Dict) -> pd.DataFrame:
    scored = []

    for _, r in df.iterrows():
        vibe_score = 1.0 if vibe_match(r, intent["vibe"]) else 0.5
        weather = weather_score(r, intent.get("weather", "clear"))

        final_score = round((vibe_score * 0.6) + (weather * 0.4), 3)

        row = r.to_dict()
        row["final_score"] = final_score
        scored.append(row)

    return (
        pd.DataFrame(scored)
        .sort_values(["final_score", "distance_km"], ascending=[False, True])
        .reset_index(drop=True)
    )


# -------------------------------------------------
# AGENT 3: ROUTE OPTIMIZER
# -------------------------------------------------

def agent_3_route_optimizer(df, lat, lon, time_limit):
    selected = []
    remaining = time_limit
    cur_lat, cur_lon = lat, lon

    for _, r in df.iterrows():
        dist = haversine(cur_lat, cur_lon, r["latitude"], r["longitude"])
        visit = estimate_visit_time(r["category"])
        travel = dist / 20  # avg speed

        if remaining >= visit + travel:
            selected.append({
                "place_id": r["place_id"],
                "place_name": r["place_name"],
                "category": r["category"],
                "distance_km": round(dist, 2),
                "visit_time_hr": visit
            })
            remaining -= (visit + travel)
            cur_lat, cur_lon = r["latitude"], r["longitude"]
        
        max_places = 5 if time_limit >= 7 else 3
        if len(selected) >= max_places:
            break

    return selected


# -------------------------------------------------
# AGENT 4: EDIT (SAFE STUB)
# -------------------------------------------------

def agent_4_edit_interpreter(message: str) -> dict:
    return {}

def apply_edit_instruction(plan: List[Dict], instruction: Dict) -> List[Dict]:
    return plan


# -------------------------------------------------
# AGENT 5: NARRATION
# -------------------------------------------------

def agent_5_plan_narrator(intent: Dict, plan: List[Dict]) -> str:
    if not plan:
        return "No suitable places found."

    try:
        model = genai.GenerativeModel(
            MODEL_NAME,
            system_instruction=SYSTEM_PROMPT_NARRATOR
        )
        res = model.generate_content(json.dumps(plan))
        return res.text.strip()
    except:
        names = ", ".join(p["place_name"] for p in plan)
        return f"We’ve created a balanced plan featuring {names}."
