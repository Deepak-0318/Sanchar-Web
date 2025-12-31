import ast
import os
from math import radians, sin, cos, sqrt, atan2
import pandas as pd
import requests

MOOD_TAG_MAP = {
    "chill": ["solo", "couple", "family", "nature", "park", "lake"],
    "fun": ["friends", "adventure"],
    "romantic": ["couple"],
    "family": ["family"],
    "solo": ["solo"]
}

def safe_list(val):
    if isinstance(val, list):
        return val
    if isinstance(val, str):
        try:
            return ast.literal_eval(val)
        except:
            return []
    return []

def vibe_match(row, vibe_keywords):
    tags = safe_list(row.get("tags", []))
    category = str(row.get("category", "")).lower()

    expanded = []
    for v in vibe_keywords:
        expanded.extend(MOOD_TAG_MAP.get(v, [v]))

    tags_lower = [t.lower() for t in tags]

    return any(k in tags_lower or k in category for k in expanded)

def haversine(lat1, lon1, lat2, lon2):
    try:
        lat1 = float(lat1)
        lon1 = float(lon1)
        lat2 = float(lat2)
        lon2 = float(lon2)
    except (TypeError, ValueError):
        return float("inf")  # invalid distance → auto-rejected later

    R = 6371
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)

    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c


CATEGORY_TIME_MAP = {
    "food": 1.5,
    "cafe": 1.5,
    "nature_park": 1.0,
    "lake": 1.0,
    "mall": 2.0,
    "religious": 1.0,
    "other": 1.5
}

def estimate_visit_time(category):
    return CATEGORY_TIME_MAP.get(category, 1.5)

def load_places_data():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(base_dir, "data", "places_final_ai_ready.csv")
    df = pd.read_csv(csv_path)
    return df.to_dict(orient="records")

def weather_score(row, current_weather):
    suitability = safe_list(row.get("weather_suitability", []))
    suitability = [s.lower() for s in suitability]

    if current_weather in suitability:
        return 1.0
    if "all" in suitability:
        return 0.8
    if current_weather == "rainy" and any("indoor" in s for s in suitability):
        return 0.9

    return 0.4

def geocode_place(place_name: str):
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": place_name,
        "format": "json",
        "limit": 1
    }

    res = requests.get(url, params=params, headers={"User-Agent": "SancharAI"})
    data = res.json()

    if not data:
        return None, None

    return float(data[0]["lat"]), float(data[0]["lon"])