import json, os
from typing import Dict, List
import pandas as pd
import google.generativeai as genai
from dotenv import load_dotenv
from helpers import vibe_match, haversine, estimate_visit_time, weather_score

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
MODEL_NAME = "models/gemini-flash-latest"

SYSTEM_PROMPT_NARRATOR = "Explain the plan clearly and briefly."


# ---------------- AGENT 1: INTENT ----------------

def agent_1_intent_builder(user_input: Dict) -> Dict:
    msg = user_input.get("message", "").lower()

    intent = {
        "vibe": ["chill"],
        "budget_min": 0,
        "budget_max": 1000,
        "time_available_hours": 3.0,
        "weather": "clear"
    }

    # ---------------- VIBE ----------------
    if "romantic" in msg:
        intent["vibe"] = ["romantic"]
    elif "fun" in msg or "lively" in msg:
        intent["vibe"] = ["fun"]
    elif "relaxed" in msg or "calm" in msg:
        intent["vibe"] = ["chill"]

    # ---------------- BUDGET ----------------
    if "premium" in msg or "luxury" in msg or "fine dining" in msg:
        intent["budget_tier"] = "premium"

    # ---------------- TIME ----------------
    if "half day" in msg:
        intent["time_available_hours"] = 4.5
    elif "1-2" in msg or "1 to 2" in msg:
        intent["time_available_hours"] = 1.5
    elif "2-4" in msg or "2 to 4" in msg:
        intent["time_available_hours"] = 3.0

    # ---------------- LOCATION (CANONICAL) ----------------
    # Bengaluru core
    if "rr nagar" in msg or "rajarajeshwari" in msg:
        intent["location"] = "RR Nagar, Bengaluru"

    elif "mg road" in msg:
        intent["location"] = "MG Road, Bengaluru"

    elif "whitefield" in msg:
        intent["location"] = "Whitefield, Bengaluru"

    # Bengaluru South / Ramanagara normalization
    elif any(k in msg for k in [
        "ramanagara",
        "ramnagara",
        "bengaluru south",
        "kanakapura",
        "channapatna",
        "magadi"
    ]):
        intent["location"] = "Ramanagara, Bengaluru South"

    return intent


# ---------------- AGENT 2: SCORING ----------------

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


# ---------------- AGENT 3: ROUTE ----------------

def agent_3_route_optimizer(df, lat, lon, time_limit):
    selected = []
    remaining = time_limit
    cur_lat, cur_lon = lat, lon

    for _, r in df.iterrows():
        dist = haversine(cur_lat, cur_lon, r["latitude"], r["longitude"])
        visit = estimate_visit_time(r["category"])
        travel = dist / 20  # avg 20km/h

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

        if len(selected) == 3:
            break

    return selected


# ---------------- AGENT 5: NARRATION ----------------

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

# ---------------- AGENT 4: EDIT INTERPRETER (STUB) ----------------

def agent_4_edit_interpreter(message: str) -> dict:
    """
    Placeholder for future conversational edits
    (remove place, swap place, etc.)
    """
    return {}

# ---------------- AGENT 4 HELPERS ----------------

def apply_edit_instruction(plan: List[Dict], instruction: Dict) -> List[Dict]:
    """
    Placeholder for future edit operations like:
    - remove place
    - swap place
    - add place
    """
    return plan
