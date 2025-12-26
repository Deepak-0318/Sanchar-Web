import os
import pandas as pd
from agents import (
    agent_1_intent_builder,
    agent_2_dataset_filter,
    agent_3_route_optimizer,
    agent_5_plan_narrator
)

# ---------- Load Dataset ----------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "places_final_ai_ready.csv")

df_places = pd.read_csv(DATA_PATH)

df_places["latitude"] = df_places["latitude"].astype(float)
df_places["longitude"] = df_places["longitude"].astype(float)


# ---------- Core Pipeline ----------
def generate_hangout_plan(user_input, start_lat, start_lon):
    # 1️⃣ Intent
    intent = agent_1_intent_builder(user_input)

    # 2️⃣ Dataset filtering (guaranteed fallback inside agent)
    candidates = agent_2_dataset_filter(df_places, intent)

    # 3️⃣ Route optimization (ONLY ONCE)
    optimized_plan = agent_3_route_optimizer(
        candidates,
        start_lat,
        start_lon,
        intent["time_available_hours"]
    )

    # 4️⃣ Total time calculation
    total_time = sum(p["visit_time_hr"] for p in optimized_plan)

    # 5️⃣ Narration (safe even if empty)
    narration = agent_5_plan_narrator(intent, optimized_plan)

    # 6️⃣ Final response (🔥 FRONTEND CONTRACT)
    return {
        "optimized_plan": optimized_plan,     # 👈 cards read this
        "summary": {
            "total_time_hr": round(total_time, 1),
            "budget_max": intent["budget_max"]
        },
        "narration": narration
    }
