import json, os
from typing import Dict, List
import pandas as pd
import google.generativeai as genai
from dotenv import load_dotenv
from helpers import vibe_match, haversine, estimate_visit_time, weather_score, load_places_data, geocode_place

# -------------------------------------------------
# CONFIG
# -------------------------------------------------
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
MODEL_NAME = "models/gemini-flash-latest"

SYSTEM_PROMPT_NARRATOR = "Explain the plan clearly and briefly."

# -------------------------------------------------
# INTENT DETECTION
# -------------------------------------------------

def detect_intent_type(message: str) -> str:
    """Detect if user wants to edit plan or ask for information"""
    message_lower = message.lower()
    
    # Plan editing keywords
    edit_keywords = [
        "move", "change", "replace", "remove", "add", "modify", 
        "switch", "update", "edit", "make it", "make the plan",
        "instead of", "rather than", "prefer", "substitute"
    ]
    
    # Time/schedule editing keywords  
    time_keywords = [
        "earlier", "later", "morning", "afternoon", "evening",
        "am", "pm", "o'clock", "relaxed", "rushed", "slow", "fast"
    ]
    
    # Check for plan editing indicators
    for keyword in edit_keywords + time_keywords:
        if keyword in message_lower:
            return "edit"
            
    # Default to info query
    return "info"


# -------------------------------------------------
# AGENT 1: INTENT PARSER
# -------------------------------------------------

def agent_1_intent_builder(user_input: Dict) -> Dict:
    msg = user_input.get("message", "").lower()

    intent = {
        "start_location": None,
        "preferred_location": None,
        "vibe": ["chill"],
        "budget_tier": "moderate",
        "time_available_hours": 3.0,
        "weather": "clear"
    }

    # ---------- VIBE ----------
    if "romantic" in msg:
        intent["vibe"] = ["romantic"]
    elif "fun" in msg or "lively" in msg:
        intent["vibe"] = ["fun"]
    elif "relaxed" in msg or "calm" in msg:
        intent["vibe"] = ["chill"]

    # ---------- BUDGET ----------
    if "premium" in msg or "luxury" in msg or "fine dining" in msg:
        intent["budget_tier"] = "premium"
    elif "budget" in msg or "cheap" in msg:
        intent["budget_tier"] = "budget"

    # ---------- TIME ----------
    if "full day" in msg or "entire day" in msg:
        intent["time_available_hours"] = 8.0
    elif "half day" in msg:
        intent["time_available_hours"] = 4.5
    elif "1-2" in msg or "1 to 2" in msg:
        intent["time_available_hours"] = 1.5
    elif "2-4" in msg or "2 to 4" in msg:
        intent["time_available_hours"] = 3.0

    # ---------- LOCATION NORMALIZATION ----------
    if "rr nagar" in msg or "rajarajeshwari" in msg:
        intent["preferred_location"] = "RR Nagar, Bengaluru"

    elif "mg road" in msg:
        intent["preferred_location"] = "MG Road, Bengaluru"

    elif "whitefield" in msg:
        intent["preferred_location"] = "Whitefield, Bengaluru"

    elif any(k in msg for k in [
        "ramanagara", "ramnagara", "bengaluru south",
        "kanakapura", "channapatna", "magadi"
    ]):
        intent["preferred_location"] = "Ramanagara, Bengaluru"

    return intent


# -------------------------------------------------
# AGENT 2: SCORING
# -------------------------------------------------

def agent_2_dataset_filter(df: pd.DataFrame, intent: Dict) -> pd.DataFrame:
    scored = []

    for _, r in df.iterrows():
        vibe_score = 1.0 if vibe_match(r, intent["vibe"]) else 0.5
        weather = weather_score(r, intent.get("weather", "clear"))

        final_score = round((vibe_score * 0.6) + (weather * 0.4), 3)

        row = r.to_dict()
        row["final_score"] = final_score
        scored.append(row)

    return (
        pd.DataFrame(scored)
        .sort_values(["final_score", "distance_km"], ascending=[False, True])
        .reset_index(drop=True)
    )


# -------------------------------------------------
# AGENT 3: ROUTE OPTIMIZER
# -------------------------------------------------

def agent_3_route_optimizer(df, lat, lon, time_limit):
    selected = []
    remaining = time_limit
    cur_lat, cur_lon = lat, lon

    for _, r in df.iterrows():
        dist = haversine(cur_lat, cur_lon, r["latitude"], r["longitude"])
        visit = estimate_visit_time(r["category"])
        travel = dist / 20  # avg speed

        if remaining >= visit + travel:
            selected.append({
                "place_id": r["place_id"],
                "place_name": r["place_name"],
                "category": r["category"],
                "distance_km": round(dist, 2),
                "visit_time_hr": visit
            })
            remaining -= (visit + travel)
            cur_lat, cur_lon = r["latitude"], r["longitude"]
        
        max_places = 5 if time_limit >= 7 else 3
        if len(selected) >= max_places:
            break

    return selected


# -------------------------------------------------
# AGENT 4: PLAN EDITING
# -------------------------------------------------

def edit_existing_plan(current_plan: dict, edit_instruction: str, start_lat: float, start_lon: float) -> dict:
    """Edit existing plan based on user instruction using RAG knowledge"""
    
    # Load places data for RAG
    df = pd.DataFrame(load_places_data())
    df["latitude"] = pd.to_numeric(df["latitude"], errors="coerce")
    df["longitude"] = pd.to_numeric(df["longitude"], errors="coerce")
    df = df.dropna(subset=["latitude", "longitude"])
    
    instruction_lower = edit_instruction.lower()
    
    try:
        # Use LLM to edit the plan with RAG context
        model = genai.GenerativeModel(
            MODEL_NAME,
            system_instruction=f"""
You are a travel plan editor for Bangalore. Edit the existing plan based on user instructions.

IMPORTANT RULES:
1. ONLY use places from the provided places database - DO NOT invent new places
2. When replacing places, find similar ones from the database
3. For time changes, adjust visit times but keep same places
4. For vibe changes ("more relaxed", "faster"), adjust visit durations
5. Return ONLY valid JSON in the EXACT same format as the current plan
6. Keep the same structure: intent, optimized_plan, narration

🔑 CURRENT PLAN TO EDIT:
{json.dumps(current_plan, indent=2)}

🔑 AVAILABLE PLACES DATABASE (first 20 places):
{df.head(20)[['place_name', 'category', 'area', 'tags', 'famous_for']].to_string()}

🔑 USER INSTRUCTION: {edit_instruction}
"""
        )
        
        # Create context for editing
        edit_prompt = f"""
Edit the plan based on this instruction: "{edit_instruction}"

Return the updated plan as valid JSON maintaining the exact same structure.
If replacing places, only use places from the provided database.
If changing timing, adjust visit_time_hr values appropriately.
"""
        
        response = model.generate_content(edit_prompt)
        edited_plan_text = response.text.strip()
        
        # Clean and parse JSON response
        if "```json" in edited_plan_text:
            edited_plan_text = edited_plan_text.split("```json")[1].split("```")[0]
        elif "```" in edited_plan_text:
            edited_plan_text = edited_plan_text.split("```")[1].split("```")[0]
            
        edited_plan = json.loads(edited_plan_text)
        
        # Validate that used places exist in database
        place_names = [p["place_name"] for p in edited_plan.get("optimized_plan", [])]
        valid_places = df["place_name"].tolist()
        
        for place_name in place_names:
            if place_name not in valid_places:
                # Fallback: return original plan if invalid places detected
                print(f"Invalid place detected: {place_name}")
                return current_plan
                
        return edited_plan
        
    except Exception as e:
        print(f"Plan editing failed: {e}")
        # Fallback: try simple text-based editing
        return _fallback_edit(current_plan, edit_instruction, df)


def _fallback_edit(current_plan: dict, instruction: str, places_df: pd.DataFrame) -> dict:
    """Simple text-based editing fallback"""
    instruction_lower = instruction.lower()
    optimized_plan = current_plan["optimized_plan"].copy()
    
    # Handle time adjustments
    if "relaxed" in instruction_lower or "slow" in instruction_lower:
        for place in optimized_plan:
            place["visit_time_hr"] = min(place.get("visit_time_hr", 1.0) * 1.5, 3.0)
            
    elif "faster" in instruction_lower or "quick" in instruction_lower:
        for place in optimized_plan:
            place["visit_time_hr"] = max(place.get("visit_time_hr", 1.0) * 0.7, 0.5)
    
    # Handle simple replacements
    for place in optimized_plan:
        place_name = place["place_name"].lower()
        
        if "lalbagh" in instruction_lower and "lalbagh" in place_name:
            # Try to replace with Cubbon Park
            cubbon_matches = places_df[places_df["place_name"].str.contains("Cubbon", case=False, na=False)]
            if not cubbon_matches.empty:
                cubbon = cubbon_matches.iloc[0]
                place["place_name"] = cubbon["place_name"]
                place["place_id"] = cubbon["place_id"]
                place["category"] = cubbon["category"]
    
    return {
        **current_plan,
        "optimized_plan": optimized_plan,
        "narration": current_plan["narration"] + " (Modified)"
    }


def answer_info_query(message: str, preferred_location: str = None) -> str:
    """Answer informational questions using RAG knowledge base"""
    
    # Load places data
    df = pd.DataFrame(load_places_data())
    
    # Filter relevant places based on query
    message_lower = message.lower()
    relevant_places = []
    
    # Simple keyword matching for relevant places
    for _, place in df.iterrows():
        place_name = str(place.get("place_name", "")).lower()
        category = str(place.get("category", "")).lower() 
        famous_for = str(place.get("famous_for", "")).lower()
        area = str(place.get("area", "")).lower()
        
        # Check if query keywords match place information
        query_words = message_lower.split()
        for word in query_words:
            if len(word) > 3 and (word in place_name or word in category or word in famous_for or word in area):
                relevant_places.append(place.to_dict())
                break
                
    # Limit to top 10 most relevant places
    relevant_places = relevant_places[:10]
    
    if not relevant_places:
        return "I don't have specific information about that in my Bangalore places database. Could you ask about a specific place or category?"
    
    try:
        # Use LLM to generate response based on RAG data
        model = genai.GenerativeModel(
            MODEL_NAME,
            system_instruction=f"""
You are a Bangalore travel assistant. Answer the user's question using ONLY the provided places database.

DATABASE CONTEXT:
{json.dumps(relevant_places, indent=2)}

Provide helpful, accurate information based only on this data. Do not invent or hallucinate places.
"""
        )
        
        response = model.generate_content(f"Question: {message}")
        return response.text.strip()
        
    except Exception as e:
        print(f"Info query failed: {e}")
        # Fallback response
        place_names = [p["place_name"] for p in relevant_places]
        return f"I found these relevant places: {', '.join(place_names[:5])}. Could you be more specific about what you'd like to know?"


# -------------------------------------------------
# AGENT 4: EDIT (OLD STUBS - KEEP FOR COMPATIBILITY)
# -------------------------------------------------

def agent_4_edit_interpreter(message: str) -> dict:
    return {}

def apply_edit_instruction(plan: List[Dict], instruction: Dict) -> List[Dict]:
    return plan


# -------------------------------------------------
# AGENT 5: NARRATION
# -------------------------------------------------

def agent_5_plan_narrator(intent: Dict, plan: List[Dict]) -> str:
    if not plan:
        return "No suitable places found."

    try:
        model = genai.GenerativeModel(
            MODEL_NAME,
            system_instruction=SYSTEM_PROMPT_NARRATOR
        )
        res = model.generate_content(json.dumps(plan))
        return res.text.strip()
    except:
        names = ", ".join(p["place_name"] for p in plan)
        return f"We’ve created a balanced plan featuring {names}."
