import pandas as pd
import json
from typing import Dict, List, Optional
from helpers import load_places_data, haversine
from agents import agent_5_plan_narrator

class EnhancedRAGPipeline:
    def __init__(self):
        self.df = None
        self.load_data()
    
    def load_data(self):
        """Load and prepare the places dataset"""
        try:
            self.df = pd.DataFrame(load_places_data())
            self.df["latitude"] = pd.to_numeric(self.df["latitude"], errors="coerce")
            self.df["longitude"] = pd.to_numeric(self.df["longitude"], errors="coerce")
            self.df = self.df.dropna(subset=["latitude", "longitude"])
            print(f"Loaded {len(self.df)} places successfully")
        except Exception as e:
            print(f"Error loading data: {e}")
            self.df = pd.DataFrame()
    
    def extract_location_coordinates(self, preferred_location: str) -> tuple:
        """Extract coordinates from preferred location by matching with dataset"""
        if not preferred_location or preferred_location.lower() in ["current_location", ""]:
            return None, None
        
        # Clean and normalize the location name
        location_lower = preferred_location.lower().strip()
        
        # Search in area column first (most specific)
        area_matches = self.df[self.df["area"].str.lower().str.contains(location_lower, na=False)]
        if not area_matches.empty:
            # Get the centroid of all matching places
            avg_lat = area_matches["latitude"].mean()
            avg_lon = area_matches["longitude"].mean()
            return avg_lat, avg_lon
        
        # Search in place names
        name_matches = self.df[self.df["place_name"].str.lower().str.contains(location_lower, na=False)]
        if not name_matches.empty:
            avg_lat = name_matches["latitude"].mean()
            avg_lon = name_matches["longitude"].mean()
            return avg_lat, avg_lon
        
        # Search in category for broader matches
        category_matches = self.df[self.df["category"].str.lower().str.contains(location_lower, na=False)]
        if not category_matches.empty:
            avg_lat = category_matches["latitude"].mean()
            avg_lon = category_matches["longitude"].mean()
            return avg_lat, avg_lon
        
        return None, None
    
    def create_user_profile_json(self, mood: str, budget: str, time: str, 
                                lat: float, lon: float, preferred_location: str = "", 
                                use_current_location: bool = False) -> Dict:
        """Create structured JSON from user inputs"""
        # Store user's actual current location
        current_lat, current_lon = lat, lon
        
        # Use current location if explicitly requested (Nearby button) or if no preferred location
        search_lat, search_lon = lat, lon
        initial_radius = 2.0 if use_current_location else 5.0  # 2km for Nearby, 5km for location search (will expand if needed)
        
        if not use_current_location and preferred_location and preferred_location.lower() not in ["current_location", ""]:
            extracted_lat, extracted_lon = self.extract_location_coordinates(preferred_location)
            if extracted_lat is not None and extracted_lon is not None:
                search_lat, search_lon = extracted_lat, extracted_lon
        
        user_profile = {
            "preferences": {
                "mood": mood,
                "budget": budget,
                "time_available": time,
                "preferred_location": preferred_location or "current_location"
            },
            "location": {
                "latitude": search_lat,
                "longitude": search_lon,
                "search_radius_km": initial_radius
            },
            "current_location": {
                "latitude": current_lat,
                "longitude": current_lon
            },
            "constraints": {
                "max_places": 5,
                "visit_time_per_place": self._get_time_per_place(time)
            }
        }
        return user_profile
    
    def _get_time_per_place(self, time_category: str) -> float:
        """Convert time category to hours per place"""
        time_mapping = {
            "1-2": 0.5,
            "2-4": 0.8,
            "half-day": 1.0,
            "full-day": 1.5
        }
        return time_mapping.get(time_category, 1.0)
    
    def filter_places_by_distance(self, user_lat: float, user_lon: float, 
                                 radius_km: float = 2.0) -> pd.DataFrame:
        """Filter places within specified radius"""
        if self.df.empty:
            return pd.DataFrame()
        
        # Calculate distances
        self.df["distance_km"] = self.df.apply(
            lambda row: haversine(user_lat, user_lon, row["latitude"], row["longitude"]),
            axis=1
        )
        
        # Filter by distance
        nearby_places = self.df[self.df["distance_km"] <= radius_km].copy()
        return nearby_places.sort_values("distance_km")
    
    def score_places_by_preferences(self, places_df: pd.DataFrame, 
                                   user_profile: Dict) -> pd.DataFrame:
        """Score places based on user preferences"""
        if places_df.empty:
            return places_df
        
        mood = user_profile["preferences"]["mood"]
        budget = user_profile["preferences"]["budget"]
        
        # Initialize scores
        places_df["preference_score"] = 0.0
        
        # Mood scoring
        mood_mapping = {
            "chill": ["chill_relaxed", "general", "romantic"],
            "fun": ["fun_lively", "general", "adventure"],
            "romantic": ["romantic", "chill_relaxed", "general"],
            "adventure": ["adventure", "fun_lively", "general"]
        }
        
        mood_keywords = mood_mapping.get(mood, ["general"])
        for keyword in mood_keywords:
            mask = places_df["vibe"].str.contains(keyword, case=False, na=False)
            places_df.loc[mask, "preference_score"] += 0.4
        
        # Budget scoring
        budget_mapping = {
            "low": (0, 300),
            "medium": (200, 800),
            "high": (500, 2000)
        }
        
        if budget in budget_mapping:
            min_budget, max_budget = budget_mapping[budget]
            budget_mask = (
                (places_df["budget_min"] <= max_budget) & 
                (places_df["budget_max"] >= min_budget)
            )
            places_df.loc[budget_mask, "preference_score"] += 0.3
        
        # Distance scoring (closer is better)
        max_distance = places_df["distance_km"].max()
        if max_distance > 0:
            places_df["distance_score"] = 1 - (places_df["distance_km"] / max_distance)
            places_df["preference_score"] += places_df["distance_score"] * 0.3
        
        return places_df.sort_values("preference_score", ascending=False)
    
    def expand_search_radius(self, user_profile: Dict, current_results: int) -> Dict:
        """Expand search radius if insufficient results"""
        current_radius = user_profile["location"]["search_radius_km"]
        
        if current_results < 3:
            if current_radius < 10:
                user_profile["location"]["search_radius_km"] = 10.0
            elif current_radius < 20:
                user_profile["location"]["search_radius_km"] = 20.0
            elif current_radius < 50:
                user_profile["location"]["search_radius_km"] = 50.0
        
        return user_profile
    
    def generate_recommendations(self, user_profile: Dict) -> Dict:
        """Main RAG function to generate place recommendations"""
        user_lat = user_profile["location"]["latitude"]
        user_lon = user_profile["location"]["longitude"]
        radius = user_profile["location"]["search_radius_km"]
        max_places = user_profile["constraints"]["max_places"]
        
        # Get user's actual current location for distance calculation
        current_lat = user_profile.get("current_location", {}).get("latitude", user_lat)
        current_lon = user_profile.get("current_location", {}).get("longitude", user_lon)
        
        # Filter places by distance from search location
        nearby_places = self.filter_places_by_distance(user_lat, user_lon, radius)
        
        # If insufficient results, expand radius
        if len(nearby_places) < 3:
            user_profile = self.expand_search_radius(user_profile, len(nearby_places))
            radius = user_profile["location"]["search_radius_km"]
            nearby_places = self.filter_places_by_distance(user_lat, user_lon, radius)
        
        if nearby_places.empty:
            return {
                "user_profile": user_profile,
                "recommendations": [],
                "narration": "No places found within the search area. Try expanding your search radius.",
                "search_radius_used": radius,
                "total_places_found": 0
            }
        
        # Score places by preferences
        scored_places = self.score_places_by_preferences(nearby_places, user_profile)
        
        # Select top recommendations
        top_places = scored_places.head(max_places)
        
        # Format recommendations with distance from current location
        recommendations = []
        for _, place in top_places.iterrows():
            # Calculate distance from user's current location
            actual_distance = haversine(current_lat, current_lon, place["latitude"], place["longitude"])
            
            recommendations.append({
                "place_id": place["place_id"],
                "place_name": place["place_name"],
                "category": place["category"],
                "distance_km": round(actual_distance, 2),
                "visit_time_hr": user_profile["constraints"]["visit_time_per_place"],
                "preference_score": round(place["preference_score"], 3),
                "budget_range": f"₹{place['budget_min']}-{place['budget_max']}",
                "famous_for": place["famous_for"],
                "area": place["area"],
                "maps_url": f"https://www.google.com/maps/search/?api=1&query={place["place_name"]}+{place["area"]}".replace(" ", "+")
            })
        
        # Generate narration
        narration = self._generate_contextual_narration(user_profile, recommendations)
        
        return {
            "user_profile": user_profile,
            "recommendations": recommendations,
            "narration": narration,
            "search_radius_used": radius,
            "total_places_found": len(nearby_places)
        }
    
    def _generate_contextual_narration(self, user_profile: Dict, recommendations: List[Dict]) -> str:
        """Generate contextual narration based on user profile and recommendations"""
        if not recommendations:
            return "No suitable places found for your preferences."
        
        mood = user_profile["preferences"]["mood"]
        budget = user_profile["preferences"]["budget"]
        radius = user_profile["location"]["search_radius_km"]
        
        place_names = [place["place_name"] for place in recommendations]
        
        mood_descriptions = {
            "chill": "relaxing and peaceful",
            "fun": "lively and entertaining", 
            "romantic": "romantic and intimate",
            "adventure": "adventurous and exciting"
        }
        
        budget_descriptions = {
            "low": "budget-friendly",
            "medium": "moderately priced",
            "high": "premium"
        }
        
        mood_desc = mood_descriptions.get(mood, "enjoyable")
        budget_desc = budget_descriptions.get(budget, "suitable")
        
        narration = f"Here are a few places. Enjoy your day!! "
        
        # if len(place_names) > 3:
        #     narration += f" and {len(place_names) - 3} more great options"
        
        # narration += f"Hope you like to visit these"
        
        return narration

    def find_mentioned_place(self, message: str, current_recommendations: List[Dict]) -> int:
        """Find which place user mentioned in their message"""
        message_lower = message.lower()
        
        for i, place in enumerate(current_recommendations):
            place_name_lower = place["place_name"].lower()
            # Check if place name is mentioned in message
            if place_name_lower in message_lower:
                return i
            # Check partial matches (first word of place name)
            first_word = place_name_lower.split()[0]
            if len(first_word) > 3 and first_word in message_lower:
                return i
        return -1
    
    def replace_visited_place(self, user_profile: Dict, current_recommendations: List[Dict], 
                             visited_place_index: int) -> Dict:
        """Replace a visited place with similar alternative"""
        if visited_place_index < 0 or visited_place_index >= len(current_recommendations):
            return {
                "user_profile": user_profile,
                "recommendations": current_recommendations,
                "narration": "I couldn't identify which place you've visited. Could you be more specific?",
                "search_radius_used": user_profile["location"]["search_radius_km"],
                "total_places_found": len(current_recommendations)
            }
        
        visited_place = current_recommendations[visited_place_index]
        current_place_ids = [p["place_id"] for p in current_recommendations]
        
        # Get all places in the area - use SAME radius as original search
        user_lat = user_profile["location"]["latitude"]
        user_lon = user_profile["location"]["longitude"]
        radius = user_profile["location"]["search_radius_km"]
        
        # Get user's actual current location
        current_lat = user_profile.get("current_location", {}).get("latitude", user_lat)
        current_lon = user_profile.get("current_location", {}).get("longitude", user_lon)
        
        # Use same radius as original search to maintain area consistency
        nearby_places = self.filter_places_by_distance(user_lat, user_lon, radius)
        
        # Remove already recommended places
        available_places = nearby_places[~nearby_places["place_id"].isin(current_place_ids)]
        
        if available_places.empty:
            return {
                "user_profile": user_profile,
                "recommendations": current_recommendations,
                "narration": f"I understand you've visited {visited_place['place_name']}, but I couldn't find similar alternatives nearby.",
                "search_radius_used": radius,
                "total_places_found": len(current_recommendations)
            }
        
        # Score available places
        scored_places = self.score_places_by_preferences(available_places, user_profile)
        
        # Find best replacement
        replacement_place = scored_places.iloc[0]
        
        # Calculate distance from user's current location
        actual_distance = haversine(current_lat, current_lon, replacement_place["latitude"], replacement_place["longitude"])
        
        # Create new recommendations list
        new_recommendations = current_recommendations.copy()
        new_recommendations[visited_place_index] = {
            "place_id": replacement_place["place_id"],
            "place_name": replacement_place["place_name"],
            "category": replacement_place["category"],
            "distance_km": round(actual_distance, 2),
            "visit_time_hr": user_profile["constraints"]["visit_time_per_place"],
            "preference_score": round(replacement_place["preference_score"], 3),
            "budget_range": f"₹{replacement_place['budget_min']}-{replacement_place['budget_max']}",
            "famous_for": replacement_place["famous_for"],
            "area": replacement_place["area"],
            "maps_url": f"https://www.google.com/maps/search/?api=1&query={replacement_place["place_name"]}+{replacement_place["area"]}".replace(" ", "+")
        }
        
        return {
            "user_profile": user_profile,
            "recommendations": new_recommendations,
            "narration": f"I've replaced {visited_place['place_name']} with {replacement_place['place_name']}.",
            "search_radius_used": radius,
            "total_places_found": len(available_places) + len(current_recommendations)
        }

    def analyze_with_groq(self, user_message: str, current_recommendations: List[Dict]) -> str:
        """Use Groq to analyze user intent and return server-compatible command"""
        place_names = [place["place_name"] for place in current_recommendations]
        place_list = ", ".join(place_names)
        
        # Get categories from current recommendations
        categories = list(set([place.get("category", "") for place in current_recommendations]))
        categories_str = ", ".join(categories)
        
        prompt = f"""You are an intelligent travel assistant with strong spelling correction abilities. Analyze the user's message and determine their intent, even if there are typos or incomplete words.

Current recommendations: {place_list}
Current categories: {categories_str}
User message: "{user_message}"

IMPORTANT: Handle spelling errors and typos intelligently:
- "parks" → category:park
- "shoe park" → category:park (shoe is likely "show")
- "resturant" → category:restaurant
- "caffe" → category:cafe
- "templs" → category:temple

Your task: Respond with EXACTLY ONE of these commands:

1. "i've visited [place_name]" - If user mentions they've been to, visited, or gone to a SPECIFIC PLACE NAME
   Examples: "ive been to legacy brewery", "visited subko", "i have gone to bugle rock park", "been to that cafe"
   IMPORTANT: If the message contains a specific place name from recommendations, this takes priority!

2. "regenerate_all" - If user wants completely different recommendations or new plan
   Examples: "other options", "change the plan", "different places", "show something else", "new plan", "regenerate", "refresh"
   CRITICAL: "give other places", "other places", "something else", "different options" → regenerate_all

3. "exclude_category:[category]" - If user doesn't want a specific type of place
   Examples: "i dont want temples", "not interested in cafes", "no bars please"

4. "category:[category]" - If user wants to see a specific type of place (HANDLE TYPOS!)
   Examples: "show me cafes", "parks", "shoe park", "i want restaurants", "find parks", "any malls?", "templs", "give cafe"
   NOTE: Only use this if user mentions a SPECIFIC category name AND is NOT asking for "other/different" places!

5. "show me more options" - If user wants to expand search area
   Examples: "more places", "expand search", "wider area"

6. "general_conversation" - If user is greeting or asking about you
   Examples: "hi", "hello", "who are you", "how are you", "thanks"

7. "no_action" - For anything else that doesn't match above

Be smart about context:
- "other places", "different places", "something else" → regenerate_all (NOT category!)
- If message contains "new plan", "regenerate", "refresh" → regenerate_all
- If specific place name mentioned → i've visited [place_name]
- If specific category mentioned (cafe, park, restaurant) without "other/different" → category:[category]

Respond with ONLY the command, nothing else:"""
        
        try:
            import requests
            import os
            
            api_key = os.getenv("GROQ_API_KEY")
            
            if not api_key:
                return "no_action"
            
            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-3.1-8b-instant",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.05,
                    "max_tokens": 100
                },
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                groq_response = result["choices"][0]["message"]["content"].strip().lower()
                print(f"[GROQ DEBUG] User: '{user_message}' → Groq: '{groq_response}'")
                return groq_response
            else:
                print(f"[GROQ ERROR] Status: {response.status_code}")
                return "no_action"
                
        except Exception as e:
            return "no_action"


    def regenerate_all_recommendations(self, user_profile: Dict, current_recommendations: List[Dict]) -> Dict:
        """Regenerate entire plan excluding current places"""
        current_place_ids = [p["place_id"] for p in current_recommendations]
        
        user_lat = user_profile["location"]["latitude"]
        user_lon = user_profile["location"]["longitude"]
        radius = user_profile["location"]["search_radius_km"]
        max_places = user_profile["constraints"]["max_places"]
        
        # Get user's actual current location
        current_lat = user_profile.get("current_location", {}).get("latitude", user_lat)
        current_lon = user_profile.get("current_location", {}).get("longitude", user_lon)
        
        nearby_places = self.filter_places_by_distance(user_lat, user_lon, radius)
        available_places = nearby_places[~nearby_places["place_id"].isin(current_place_ids)]
        
        if available_places.empty:
            user_profile["location"]["search_radius_km"] = min(radius * 1.5, 50)
            return self.generate_recommendations(user_profile)
        
        scored_places = self.score_places_by_preferences(available_places, user_profile)
        top_places = scored_places.head(max_places)
        
        recommendations = []
        for _, place in top_places.iterrows():
            # Calculate distance from user's current location
            actual_distance = haversine(current_lat, current_lon, place["latitude"], place["longitude"])
            
            recommendations.append({
                "place_id": place["place_id"],
                "place_name": place["place_name"],
                "category": place["category"],
                "distance_km": round(actual_distance, 2),
                "visit_time_hr": user_profile["constraints"]["visit_time_per_place"],
                "preference_score": round(place["preference_score"], 3),
                "budget_range": f"₹{place['budget_min']}-{place['budget_max']}",
                "famous_for": place["famous_for"],
                "area": place["area"],
                "maps_url": f"https://www.google.com/maps/search/?api=1&query={place["place_name"]}+{place["area"]}".replace(" ", "+")
            })
        
        return {
            "user_profile": user_profile,
            "recommendations": recommendations,
            "narration": "I've generated a fresh set of recommendations matching your preferences!",
            "search_radius_used": radius,
            "total_places_found": len(available_places)
        }

    def filter_by_category(self, user_profile: Dict, category: str) -> Dict:
        """Filter recommendations by specific category"""
        user_lat = user_profile["location"]["latitude"]
        user_lon = user_profile["location"]["longitude"]
        radius = user_profile["location"]["search_radius_km"]
        max_places = user_profile["constraints"]["max_places"]
        
        # Get user's actual current location
        current_lat = user_profile.get("current_location", {}).get("latitude", user_lat)
        current_lon = user_profile.get("current_location", {}).get("longitude", user_lon)
        
        # Filter places by distance
        nearby_places = self.filter_places_by_distance(user_lat, user_lon, radius)
        
        # Filter by category (case-insensitive partial match)
        category_places = nearby_places[nearby_places["category"].str.lower().str.contains(category.lower(), na=False)]
        
        if category_places.empty:
            return {
                "user_profile": user_profile,
                "recommendations": [],
                "narration": f"No {category} places found in this area. Try a different category or expand your search.",
                "search_radius_used": radius,
                "total_places_found": 0
            }
        
        # Score places by preferences
        scored_places = self.score_places_by_preferences(category_places, user_profile)
        top_places = scored_places.head(max_places)
        
        recommendations = []
        for _, place in top_places.iterrows():
            # Calculate distance from user's current location
            actual_distance = haversine(current_lat, current_lon, place["latitude"], place["longitude"])
            
            recommendations.append({
                "place_id": place["place_id"],
                "place_name": place["place_name"],
                "category": place["category"],
                "distance_km": round(actual_distance, 2),
                "visit_time_hr": user_profile["constraints"]["visit_time_per_place"],
                "preference_score": round(place["preference_score"], 3),
                "budget_range": f"₹{place['budget_min']}-{place['budget_max']}",
                "famous_for": place["famous_for"],
                "area": place["area"],
                "maps_url": f"https://www.google.com/maps/search/?api=1&query={place["place_name"]}+{place["area"]}".replace(" ", "+")
            })
        
        return {
            "user_profile": user_profile,
            "recommendations": recommendations,
            "narration": f"Here are {len(recommendations)} {category} places in your area!",
            "search_radius_used": radius,
            "total_places_found": len(category_places)
        }

    def exclude_category(self, user_profile: Dict, exclude_category: str) -> Dict:
        """Exclude a category and show different recommendations"""
        user_lat = user_profile["location"]["latitude"]
        user_lon = user_profile["location"]["longitude"]
        radius = user_profile["location"]["search_radius_km"]
        max_places = user_profile["constraints"]["max_places"]
        
        # Get user's actual current location
        current_lat = user_profile.get("current_location", {}).get("latitude", user_lat)
        current_lon = user_profile.get("current_location", {}).get("longitude", user_lon)
        
        # Filter places by distance
        nearby_places = self.filter_places_by_distance(user_lat, user_lon, radius)
        
        # Exclude the specified category
        filtered_places = nearby_places[~nearby_places["category"].str.lower().str.contains(exclude_category.lower(), na=False)]
        
        if filtered_places.empty:
            return {
                "user_profile": user_profile,
                "recommendations": [],
                "narration": f"No other places found after excluding {exclude_category}. Try expanding your search.",
                "search_radius_used": radius,
                "total_places_found": 0
            }
        
        # Score places by preferences
        scored_places = self.score_places_by_preferences(filtered_places, user_profile)
        top_places = scored_places.head(max_places)
        
        recommendations = []
        for _, place in top_places.iterrows():
            # Calculate distance from user's current location
            actual_distance = haversine(current_lat, current_lon, place["latitude"], place["longitude"])
            
            recommendations.append({
                "place_id": place["place_id"],
                "place_name": place["place_name"],
                "category": place["category"],
                "distance_km": round(actual_distance, 2),
                "visit_time_hr": user_profile["constraints"]["visit_time_per_place"],
                "preference_score": round(place["preference_score"], 3),
                "budget_range": f"₹{place['budget_min']}-{place['budget_max']}",
                "famous_for": place["famous_for"],
                "area": place["area"],
                "maps_url": f"https://www.google.com/maps/search/?api=1&query={place["place_name"]}+{place["area"]}".replace(" ", "+")
            })
        
        return {
            "user_profile": user_profile,
            "recommendations": recommendations,
            "narration": f"Got it! Here are {len(recommendations)} places excluding {exclude_category}.",
            "search_radius_used": radius,
            "total_places_found": len(filtered_places)
        }

    def handle_chat_modification(self, user_profile: Dict, current_recommendations: List[Dict], 
                                chat_message: str) -> Dict:
        """Handle chat-based modifications to recommendations"""
        # Use Groq to analyze user intent
        groq_command = self.analyze_with_groq(chat_message, current_recommendations)
        
        # Process the Groq command
        if groq_command.startswith("exclude_category:"):
            category = groq_command.replace("exclude_category:", "").strip()
            return self.exclude_category(user_profile, category)
        
        elif groq_command.startswith("category:"):
            category = groq_command.replace("category:", "").strip()
            return self.filter_by_category(user_profile, category)
        
        elif "regenerate_all" in groq_command:
            return self.regenerate_all_recommendations(user_profile, current_recommendations)
        
        elif groq_command.startswith("i've visited"):
            place_name = groq_command.replace("i've visited ", "").strip()
            visited_place_index = self.find_mentioned_place(place_name, current_recommendations)
            if visited_place_index >= 0:
                return self.replace_visited_place(user_profile, current_recommendations, visited_place_index)
        
        elif "show me more options" in groq_command:
            user_profile["location"]["search_radius_km"] = min(
                user_profile["location"]["search_radius_km"] * 1.5, 50
            )
            return self.generate_recommendations(user_profile)
        
        elif "general_conversation" in groq_command:
            return {
                "user_profile": user_profile,
                "recommendations": current_recommendations,
                "narration": "Hello! I'm your travel assistant. I can help you replace places you've visited or find more options. What would you like to do?",
                "search_radius_used": user_profile["location"]["search_radius_km"],
                "total_places_found": len(current_recommendations)
            }
        
        # Default response
        return {
            "user_profile": user_profile,
            "recommendations": current_recommendations,
            "narration": "I'm here to help! You can ask me to replace places you've visited or find more options.",
            "search_radius_used": user_profile["location"]["search_radius_km"],
            "total_places_found": len(current_recommendations)
        }

# Global instance
enhanced_pipeline = EnhancedRAGPipeline()