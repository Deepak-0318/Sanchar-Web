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
    # CALCULATE DISTANCES FROM CURRENT LOCATION
    # -------------------------------------------------
    df["dist_start"] = df.apply(
        lambda r: haversine(start_lat, start_lon, r["latitude"], r["longitude"]),
        axis=1
    )

    # Set distance_km for agent compatibility
    df["distance_km"] = df["dist_start"]

    # -------------------------------------------------
    # FILTER BY PROXIMITY - STRICT NEARBY ONLY
    # -------------------------------------------------
    preferred_location = intent.get("preferred_location")
    
    if not preferred_location or preferred_location == "Current Location":
        # For nearby search, only show places within 5km
        nearby_df = df[df["dist_start"] <= 5].copy()
        
        if nearby_df.empty:
            # If no places within 5km, expand to 10km
            nearby_df = df[df["dist_start"] <= 10].copy()
            
        if nearby_df.empty:
            return {
                "intent": intent,
                "optimized_plan": [],
                "narration": "No places found within 10km of your location."
            }
        
        # Apply agent filtering and get top 5 closest places
        filtered_df = agent_2_dataset_filter(nearby_df, intent)
        final_df = (
            filtered_df
            .sort_values(["final_score", "dist_start"], ascending=[False, True])
            .head(MAX_PLACES)
        )
        
        location_text = "your current location"
    else:
        # Handle specific location requests
        dest_lat, dest_lon = geocode_place(preferred_location)
        
        if dest_lat is None:
            # Fallback to current location
            dest_lat, dest_lon = start_lat, start_lon
            preferred_location = "Current Location"
        
        df["dist_dest"] = df.apply(
            lambda r: haversine(dest_lat, dest_lon, r["latitude"], r["longitude"]),
            axis=1
        )
        
        # Find places near the destination
        dest_df = df[df["dist_dest"] <= 5].copy()
        
        if dest_df.empty:
            dest_df = df[df["dist_dest"] <= 10].copy()
            
        if dest_df.empty:
            return {
                "intent": intent,
                "optimized_plan": [],
                "narration": f"No places found near {preferred_location}."
            }
        
        filtered_df = agent_2_dataset_filter(dest_df, intent)
        final_df = (
            filtered_df
            .sort_values(["final_score", "dist_dest"], ascending=[False, True])
            .head(MAX_PLACES)
        )
        
        location_text = preferred_location

    # -------------------------------------------------
    # FORMAT OUTPUT
    # -------------------------------------------------
    optimized_plan = []
    for _, r in final_df.iterrows():
        optimized_plan.append({
            "place_id": r["place_id"],
            "place_name": r["place_name"],
            "category": r["category"],
            "distance_km": round(r["dist_start"], 2),
            "visit_time_hr": 1.0
        })

    if not optimized_plan:
        return {
            "intent": intent,
            "optimized_plan": [],
            "narration": "No suitable places found. Try adjusting your preferences."
        }

    narration = agent_5_plan_narrator(intent, optimized_plan)
    if location_text != "your current location":
        narration += f" (Near {location_text})"

    return {
        "intent": intent,
        "optimized_plan": optimized_plan,
        "narration": narration
    }
