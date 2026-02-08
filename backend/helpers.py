import ast
import os
from math import radians, sin, cos, sqrt, atan2
import pandas as pd
import requests

# -------------------------
# MOOD → TAG MAP (USED BY agents.py)
# -------------------------
MOOD_TAG_MAP = {
    "chill": ["solo", "couple", "family", "nature", "park", "lake"],
    "fun": ["friends", "adventure"],
    "romantic": ["couple"],
    "family": ["family"],
    "solo": ["solo"]
}

# -------------------------
# REQUIRED BY agents.py
# -------------------------
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

# -------------------------
# DISTANCE (HAVERSINE)
# -------------------------
def haversine(lat1, lon1, lat2, lon2):
    try:
        lat1, lon1, lat2, lon2 = map(float, [lat1, lon1, lat2, lon2])
    except:
        return float("inf")

    R = 6371
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    return R * 2 * atan2(sqrt(a), sqrt(1 - a))

# -------------------------
# VISIT TIME
# -------------------------
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

# -------------------------
# DATA LOADING
# -------------------------
def load_places_data():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(base_dir, "data", "places_final_ai_ready.csv")
    df = pd.read_csv(csv_path)
    return df.to_dict(orient="records")

# -------------------------
# WEATHER (USED BY agents.py)
# -------------------------
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

# -------------------------
# SAFE GEOCODING (NO CRASH)
# -------------------------
def geocode_place(place_name):
    if not place_name or not isinstance(place_name, str):
        return None, None

    # Bangalore fallbacks
    fallback_map = {
    "mg road": (12.9758, 77.6033),
    "mg road bangalore": (12.9758, 77.6033),
    "rr nagar": (12.9130, 77.5286),
    "rajarajeshwari nagar": (12.9130, 77.5286),
    "bangalore": (12.9716, 77.5946),
    "bengaluru": (12.9716, 77.5946)
}


    key = place_name.lower().strip()
    if key in fallback_map:
        return fallback_map[key]

    try:
        res = requests.get(
            "https://nominatim.openstreetmap.org/search",
            params={"q": place_name, "format": "json", "limit": 1},
            headers={"User-Agent": "SancharAI/1.0"},
            timeout=10
        )

        if res.status_code != 200:
            return None, None

        data = res.json()
        if not data:
            return None, None

        return float(data[0]["lat"]), float(data[0]["lon"])

    except Exception as e:
        print("Geocoding failed:", e)
        return None, None

# =====================================================
# HIDDEN GEM LOGIC (DATA-TRUTH FIRST – FINAL)
# =====================================================

def normalize_bool(val):
    """
    Handles: TRUE, ' TRUE', '\\tTRUE', 'FALSE', etc.
    """
    if val is None:
        return False
    return str(val).strip().lower() == "true"

def is_valid_hidden_gem(row):
    """
    STRICT filter using places_final_ai_ready.csv
    """

    # 1️⃣ Dataset truth
    if not normalize_bool(row.get("is_hidden_gem")):
        return False

    # 2️⃣ Popularity ceiling
    try:
        popularity = float(row.get("popularity_score", 10))
    except:
        popularity = 10

    if popularity > 8.2:
        return False

    return True

EXCLUDED_CATEGORIES = [
    "food",
    "restaurant",
    "cafe",
    "dining"
]

EXCLUDED_KEYWORDS = [
    "restaurant",
    "cafe",
    "bistro",
    "kitchen",
    "hotel",
    "temple",
    "swamy temple"
]

def is_sanchar_hidden_gem(row):
    """
    Final Sanchar-level hidden gem filter
    """

    # Dataset truth
    if not is_valid_hidden_gem(row):
        return False

    category = str(row.get("category", "")).lower()
    name = str(row.get("place_name", "")).lower()
    famous_for = str(row.get("famous_for", "")).lower()

    # Exclude mainstream food / dining
    if category in EXCLUDED_CATEGORIES:
        return False

    # Exclude mainstream keywords
    combined = name + " " + famous_for
    for k in EXCLUDED_KEYWORDS:
        if k in combined:
            return False

    return True

def hidden_gem_rank(row):
    """
    Ranking among already-valid hidden gems
    Lower popularity + higher data quality = better
    """
    popularity = float(row.get("popularity_score", 10))
    quality = float(row.get("data_quality_score", 0.5))
    return round((10 - popularity) + quality, 2)
