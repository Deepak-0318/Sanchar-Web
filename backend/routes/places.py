from fastapi import APIRouter
from helpers import (
    load_places_data,
    haversine,
    geocode_place,
    is_valid_hidden_gem,
    hidden_gem_rank,
    is_sanchar_hidden_gem
)

router = APIRouter(prefix="/places", tags=["Places"])

@router.post("/hidden/explore")
def explore_hidden_gems(payload: dict):
    preferred_location = payload.get("preferred_location")
    if not preferred_location:
        return []

    lat, lon = geocode_place(preferred_location)
    if lat is None:
        return []

    places = load_places_data()

    def find_within(radius_km):
        results = []
        for p in places:
            if not is_sanchar_hidden_gem(p):
                continue

            try:
                dist = haversine(
                    lat,
                    lon,
                    float(p["latitude"]),
                    float(p["longitude"])
                )
            except:
                continue

            if dist > radius_km:
                continue

            item = dict(p)
            item["distance_km"] = round(dist, 2)
            item["hidden_rank"] = hidden_gem_rank(p)
            results.append(item)

        results.sort(key=lambda x: (-x["hidden_rank"], x["distance_km"]))
        return results

    # 🔍 Pass 1: nearby
    results = find_within(5)

    # 🔁 Pass 2: expand search if empty
    if not results:
        results = find_within(20)

    return results[:5]
