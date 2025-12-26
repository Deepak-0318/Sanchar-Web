from fastapi import APIRouter, Query
from helpers import load_places_data, haversine

router = APIRouter(
    prefix="/places",
    tags=["Places"]
)

@router.get("/hidden/explore")
def explore_hidden_gems(
    lat: float = Query(...),
    lon: float = Query(...),
    radius_km: float = Query(10),
    category: str | None = None
):
    places = load_places_data()
    results = []

    for p in places:
        is_hidden = str(p.get("is_hidden_gem", "")).strip().lower()
        if is_hidden not in ["true", "1", "yes", "y"]:
            continue

        if category and category.lower() not in str(p.get("category", "")).lower():
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

        if dist <= radius_km:
            item = dict(p)
            item["distance_km"] = round(dist, 2)
            results.append(item)

    results.sort(
        key=lambda x: (x["distance_km"], -float(x.get("popularity_score", 0)))
    )

    return results
