import json
from typing import Dict, List
import os

import pandas as pd
import google.generativeai as genai
from dotenv import load_dotenv

from helpers import vibe_match, weather_ok, haversine, estimate_visit_time

# ============================================================
# 🔑 API KEY SETUP
# ============================================================

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY not found in environment variables")

genai.configure(api_key=GEMINI_API_KEY)

MODEL_NAME = "models/gemini-flash-latest"

# ============================================================
# 🧠 SYSTEM PROMPTS
# ============================================================

SYSTEM_PROMPT_INTENT = """
You are Agent-1 (Intent Builder) for Sanchar.
Output ONLY valid JSON. No explanation.
"""

SYSTEM_PROMPT_NARRATOR = """
You are Agent-5 (Plan Narrator) for Sanchar.
Explain the plan calmly, clearly, and concisely.
"""

# ============================================================
# 🔧 PROMPT BUILDERS
# ============================================================

def build_user_prompt(user_input: Dict) -> str:
    return f"""
User Input:
{json.dumps(user_input, indent=2)}
"""

def build_narration_prompt(intent: Dict, plan: List[Dict]) -> str:
    return f"""
User Intent:
{json.dumps(intent, indent=2)}

Final Plan:
{json.dumps(plan, indent=2)}
"""

# ============================================================
# 🤖 AGENT 1 — INTENT BUILDER (CRASH-PROOF)
# ============================================================

def agent_1_intent_builder(user_input: Dict) -> Dict:
    try:
        model = genai.GenerativeModel(
            model_name=MODEL_NAME,
            system_instruction=SYSTEM_PROMPT_INTENT
        )

        response = model.generate_content(build_user_prompt(user_input))
        text = response.text.strip()

        try:
            intent = json.loads(text)
        except:
            start = text.find("{")
            end = text.rfind("}") + 1
            intent = json.loads(text[start:end])

    except Exception:
        # 🛑 DEV / QUOTA FALLBACK
        intent = {}

    # -------------------------------
    # 🔒 HARD NORMALIZATION (MANDATORY)
    # -------------------------------

    user_budget = float(user_input.get("budget") or 1000)

    intent["vibe"] = intent.get("vibe") or user_input.get("mood", "chill")
    intent["budget_min"] = float(intent.get("budget_min") or 0)
    intent["budget_max"] = float(intent.get("budget_max") or user_budget)

    time_str = user_input.get("time_available", "2-4 hours")

    if "1-2" in time_str:
        time_hours = 1.5
    elif "2-4" in time_str:
        time_hours = 3.0
    elif "4-6" in time_str:
        time_hours = 5.0
    else:
        time_hours = 3.0

    intent["time_available_hours"] = float(
        intent.get("time_available_hours") or time_hours
    )

    intent.setdefault("preferences", {})
    intent["preferences"].setdefault("prefer_hidden_gems", True)
    intent["preferences"].setdefault("weather_adaptive", True)
    intent["preferences"].setdefault("avoid_crowds", False)

    return intent

# ============================================================
# 🧮 AGENT 2 — DATASET FILTER (NON-EMPTY GUARANTEED)
# ============================================================

def agent_2_dataset_filter(df: pd.DataFrame, intent: Dict) -> pd.DataFrame:
    budget_max = float(intent.get("budget_max") or 1000)
    budget_min = float(intent.get("budget_min") or 0)

    # 1️⃣ Strict budget
    base = df[
        (df["budget_min"] <= budget_max) &
        (df["budget_max"] >= budget_min)
    ].copy()

    # 2️⃣ Soft budget fallback
    if base.empty:
        relaxed_budget = budget_max * 1.5
        base = df[df["budget_min"] <= relaxed_budget].copy()

    # 3️⃣ Emergency fallback
    if base.empty:
        return df.copy().reset_index(drop=True)

    # 4️⃣ Quality + vibe
    strict = base.copy()

    if "data_quality_score" in strict.columns:
        strict = strict[strict["data_quality_score"] >= 0.6]

    if "vibe" in intent:
        strict = strict[
            strict.apply(lambda r: vibe_match(r, intent["vibe"]), axis=1)
        ]

    if intent.get("preferences", {}).get("weather_adaptive", False):
        strict = strict[
            strict.apply(lambda r: weather_ok(r), axis=1)
        ]

    if not strict.empty:
        return _sort_places(strict).reset_index(drop=True)

    # 5️⃣ Relaxed quality
    relaxed = base.copy()

    if "data_quality_score" in relaxed.columns:
        relaxed = relaxed[relaxed["data_quality_score"] >= 0.4]

    if not relaxed.empty:
        return _sort_places(relaxed).reset_index(drop=True)

    return _sort_places(base).reset_index(drop=True)

def _sort_places(df: pd.DataFrame) -> pd.DataFrame:
    cols = []
    if "is_hidden_gem" in df.columns:
        cols.append("is_hidden_gem")
    if "popularity_score" in df.columns:
        cols.append("popularity_score")

    if cols:
        return df.sort_values(by=cols, ascending=[False] * len(cols))

    return df

# ============================================================
# 🗺️ AGENT 3 — ROUTE OPTIMIZER
# ============================================================

def agent_3_route_optimizer(
    places: pd.DataFrame,
    start_lat: float,
    start_lon: float,
    time_available_hours: float
) -> List[Dict]:

    # 🛑 Absolute safety
    if places is None or places.empty:
        return []

    selected = []
    remaining_time = time_available_hours
    current_lat, current_lon = start_lat, start_lon

    places = places.copy()

    # Distance calc
    places["distance"] = places.apply(
        lambda r: haversine(
            current_lat,
            current_lon,
            float(r["latitude"]),
            float(r["longitude"])
        ),
        axis=1
    )

    places = places.sort_values(by="distance")

    for _, row in places.iterrows():

        # ✅ SAFE visit time
        visit_time = estimate_visit_time(row.get("category")) or 1.0
        travel_time = row["distance"] / 20
        total_time = visit_time + travel_time

        # ✅ Always allow first place (critical)
        if not selected or remaining_time >= total_time:
            selected.append({
                "place_id": row.get("place_id"),
                "place_name": row.get("place_name"),
                "category": row.get("category"),
                "distance_km": round(row["distance"], 2),
                "visit_time_hr": visit_time
            })

            remaining_time -= total_time
            current_lat, current_lon = row["latitude"], row["longitude"]

        # MVP cap
        if len(selected) >= 3:
            break

    return selected

# ============================================================
# 📝 AGENT 5 — PLAN NARRATOR (QUOTA-SAFE)
# ============================================================

def agent_5_plan_narrator(intent: Dict, optimized_plan: List[Dict]) -> str:
    if not optimized_plan:
        return (
            "We couldn’t find suitable places that fit all your constraints right now. "
            "Try increasing your budget or changing the mood or time."
        )

    try:
        model = genai.GenerativeModel(
            model_name=MODEL_NAME,
            system_instruction=SYSTEM_PROMPT_NARRATOR
        )

        response = model.generate_content(
            build_narration_prompt(intent, optimized_plan),
            generation_config={"temperature": 0.4}
        )

        return response.text.strip()

    except Exception:
        # 🛑 SAFE FALLBACK (NO GEMINI)
        names = ", ".join(p["place_name"] for p in optimized_plan)
        return (
            f"We’ve created a balanced plan featuring {names}. "
            "This itinerary is optimized for your time, budget, and mood, "
            "ensuring a smooth and enjoyable hangout experience."
        )
