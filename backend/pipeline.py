import pandas as pd
from agents import (
    agent_2_dataset_filter,
    agent_5_plan_narrator
)
from helpers import load_places_data, haversine, geocode_place

MAX_PLACES = 5


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
            "narration": "No places available."
        }

    # -------------------------------------------------
    # DESTINATION GEO
    # -------------------------------------------------
    preferred_location = intent.get("preferred_location")
    dest_lat, dest_lon = geocode_place(preferred_location)

    if dest_lat is None:
        return {
            "intent": intent,
            "optimized_plan": [],
            "narration": "Could not locate preferred destination."
        }

    # -------------------------------------------------
    # DISTANCES
    # -------------------------------------------------
    df["dist_start"] = df.apply(
        lambda r: haversine(start_lat, start_lon, r["latitude"], r["longitude"]),
        axis=1
    )

    df["dist_dest"] = df.apply(
        lambda r: haversine(dest_lat, dest_lon, r["latitude"], r["longitude"]),
        axis=1
    )

    # 🔑 AGENT COMPATIBILITY COLUMN
    df["distance_km"] = df["dist_dest"]

    # -------------------------------------------------
    # ON-ROUTE (near start + moving toward destination)
    # -------------------------------------------------
    on_route_df = df[
        (df["dist_start"] <= 5) &
        (df["dist_dest"] <= 7)
    ].copy()

    on_route_df = agent_2_dataset_filter(on_route_df, intent)

    on_route_df = (
        on_route_df
        .sort_values(["final_score", "dist_start"], ascending=[False, True])
        .head(2)
    )

    # -------------------------------------------------
    # DESTINATION CLUSTER (MG ROAD AREA)
    # -------------------------------------------------
    dest_df = df[df["dist_dest"] <= 3].copy()

    dest_df = agent_2_dataset_filter(dest_df, intent)

    dest_df = (
        dest_df
        .sort_values(["final_score", "dist_dest"], ascending=[False, True])
        .head(3)
    )

    # -------------------------------------------------
    # MERGE → 5 PLACES
    # -------------------------------------------------
    final_df = pd.concat([on_route_df, dest_df]).drop_duplicates(
        subset=["place_id"]
    )

    # SAFETY FILL
    if len(final_df) < MAX_PLACES:
        extra = (
            agent_2_dataset_filter(df, intent)
            .sort_values(["final_score", "distance_km"])
            .head(MAX_PLACES - len(final_df))
        )
        final_df = pd.concat([final_df, extra])

    # -------------------------------------------------
    # FORMAT OUTPUT
    # -------------------------------------------------
    optimized_plan = []
    for _, r in final_df.head(MAX_PLACES).iterrows():
        optimized_plan.append({
            "place_id": r["place_id"],
            "place_name": r["place_name"],
            "category": r["category"],
            "distance_km": round(r["dist_dest"], 2),
            "visit_time_hr": 1.0
        })

    narration = agent_5_plan_narrator(intent, optimized_plan)
    narration += f" (Destination focus: {preferred_location})"

    return {
        "intent": intent,
        "optimized_plan": optimized_plan,
        "narration": narration
    }
