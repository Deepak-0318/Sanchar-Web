import pandas as pd
from agents import (
    agent_2_dataset_filter,
    agent_3_route_optimizer,
    agent_5_plan_narrator
)
from helpers import load_places_data, haversine


def is_similar_place(p1, p2):
    return (
        p1["category"] == p2["category"]
        and p1["place_name"].split("(")[0].strip().lower()
        == p2["place_name"].split("(")[0].strip().lower()
    )


def generate_hangout_plan(intent, start_lat, start_lon):
    # -------------------------------------------------
    # LOAD DATA
    # -------------------------------------------------
    df = pd.DataFrame(load_places_data())

    df["latitude"] = pd.to_numeric(df["latitude"], errors="coerce")
    df["longitude"] = pd.to_numeric(df["longitude"], errors="coerce")
    df = df.dropna(subset=["latitude", "longitude"])

    if df.empty:
        return {
            "intent": intent,
            "optimized_plan": [],
            "narration": "No places available in the dataset."
        }

    # -------------------------------------------------
    # DISTANCE FROM START
    # -------------------------------------------------
    df["distance_km"] = df.apply(
        lambda r: haversine(start_lat, start_lon, r["latitude"], r["longitude"]),
        axis=1
    )

    # -------------------------------------------------
    # DISTANCE BUCKETING (ANTI-CLUSTER CORE FIX)
    # -------------------------------------------------
    df["distance_bucket"] = pd.cut(
        df["distance_km"],
        bins=[0, 0.8, 1.5, 3.0, 6.0, 10.0],
        labels=["very_close", "close", "mid", "far", "very_far"],
        include_lowest=True
    )

    # -------------------------------------------------
    # SELECT TOP PER BUCKET (NO AREA HARD-CODING)
    # -------------------------------------------------
    bucketed = []

    for bucket in ["very_close", "close", "mid"]:
        group = df[df["distance_bucket"] == bucket]
        if not group.empty:
            scored = agent_2_dataset_filter(group, intent)
            bucketed.append(scored.head(4))

    filtered_df = pd.concat(bucketed, ignore_index=True)

    if filtered_df.empty:
        filtered_df = df.nsmallest(8, "distance_km")

    # -------------------------------------------------
    # PREMIUM FILTER (SOFT)
    # -------------------------------------------------
    if intent.get("budget_tier") == "premium":
        premium_keywords = [
            "fine dining", "rooftop", "luxury",
            "cocktail", "wine", "experience"
        ]

        filtered_df = filtered_df[
            filtered_df["tags"].astype(str).str.lower().str.contains(
                "|".join(premium_keywords), na=False
            )
            | filtered_df["category"].isin(
                ["fine_dining", "rooftop", "experience"]
            )
        ]

    # -------------------------------------------------
    # ROMANTIC FILTER (SOFT, NOT EXCLUSIVE)
    # -------------------------------------------------
    if "romantic" in intent.get("vibe", []):
        filtered_df = filtered_df[
            filtered_df["category"].isin([
                "fine_dining", "cafe", "rooftop",
                "lake", "experience", "nature_park"
            ])
        ]

    if filtered_df.empty:
        filtered_df = df.nsmallest(6, "distance_km")

    # -------------------------------------------------
    # SCORING
    # -------------------------------------------------
    filtered = agent_2_dataset_filter(filtered_df, intent)

    # -------------------------------------------------
    # SOFT CATEGORY DIVERSITY
    # -------------------------------------------------
    filtered = (
        filtered
        .sort_values("final_score", ascending=False)
        .drop_duplicates(subset=["category"], keep="first")
    )

    # -------------------------------------------------
    # ROUTE OPTIMIZATION
    # -------------------------------------------------
    optimized_plan = agent_3_route_optimizer(
        filtered,
        start_lat,
        start_lon,
        intent.get("time_available_hours", 3)
    )

    # -------------------------------------------------
    # ENSURE ≥ 2 PLACES
    # -------------------------------------------------
    if len(optimized_plan) < 2:
        fallback = (
            filtered_df
            .sort_values("distance_km")
            .to_dict(orient="records")
        )

        existing = {p["place_name"] for p in optimized_plan}

        for r in fallback:
            if r["place_name"] not in existing:
                optimized_plan.append({
                    "place_id": r["place_id"],
                    "place_name": r["place_name"],
                    "category": r["category"],
                    "distance_km": round(r["distance_km"], 2),
                    "visit_time_hr": 1.5
                })
            if len(optimized_plan) >= 2:
                break

    # -------------------------------------------------
    # REMOVE NEAR DUPLICATES
    # -------------------------------------------------
    unique_plan = []
    for p in optimized_plan:
        if not any(is_similar_place(p, q) for q in unique_plan):
            unique_plan.append(p)
    optimized_plan = unique_plan

    # -------------------------------------------------
    # HALF-DAY ENFORCEMENT
    # -------------------------------------------------
    total_time = sum(p["visit_time_hr"] for p in optimized_plan)

    if intent.get("time_available_hours", 0) >= 4 and total_time < 4:
        fallback = (
            filtered_df
            .sort_values("distance_km")
            .to_dict(orient="records")
        )

        for r in fallback:
            if r["place_name"] not in {p["place_name"] for p in optimized_plan}:
                optimized_plan.append({
                    "place_id": r["place_id"],
                    "place_name": r["place_name"],
                    "category": r["category"],
                    "distance_km": round(r["distance_km"], 2),
                    "visit_time_hr": 1.5
                })
            if sum(p["visit_time_hr"] for p in optimized_plan) >= 4:
                break

    # -------------------------------------------------
    # NARRATION
    # -------------------------------------------------
    narration = agent_5_plan_narrator(intent, optimized_plan)
    max_dist = round(filtered_df["distance_km"].max(), 1)
    narration += f" (Places selected within {max_dist} km.)"

    return {
        "intent": intent,
        "optimized_plan": optimized_plan,
        "narration": narration
    }
