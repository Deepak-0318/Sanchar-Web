import ast
import os
from math import radians, sin, cos, sqrt, atan2
import pandas as pd

# --------- Agent-2 helpers ----------

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

    expanded_keywords = []
    for v in vibe_keywords:
        expanded_keywords.extend(MOOD_TAG_MAP.get(v, [v]))

    tags_lower = [t.lower() for t in tags]

    return any(
        kw in tags_lower or kw in category
        for kw in expanded_keywords
    )

def weather_ok(row):
    weather = safe_list(row.get("weather_suitability", []))
    return any(w in ["clear", "cloudy", "all"] for w in weather)

# --------- Agent-3 helpers ----------

def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
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

# --------- DATA LOADER (Feature-2 uses this) ----------

def load_places_data():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(base_dir, "data", "places_final_ai_ready.csv")
    df = pd.read_csv(csv_path)
    return df.to_dict(orient="records")
