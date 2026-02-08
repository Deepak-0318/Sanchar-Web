from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from routes import places, plans, schedule
import uuid
import time
from pipeline import generate_hangout_plan
from agents import agent_1_intent_builder
from store import create_session, get_session, update_session
from enhanced_pipeline import enhanced_pipeline
from intelligent_pipeline import initialize_intelligent_pipeline, intelligent_pipeline
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Sanchar AI")

app.include_router(places.router)
app.include_router(plans.router)
app.include_router(schedule.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://*.ngrok.io", "https://*.ngrok-free.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize intelligent pipeline
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
if DEEPSEEK_API_KEY:
    try:
        initialize_intelligent_pipeline(DEEPSEEK_API_KEY)
        print("✅ Intelligent Pipeline initialized with DeepSeek API")
    except Exception as e:
        print(f"⚠️ Failed to initialize Intelligent Pipeline: {e}")
else:
    print("⚠️ DEEPSEEK_API_KEY not found. Intelligent features disabled.")

# In-memory storage for share tokens
share_tokens = {}

class StartChatRequest(BaseModel):
    start_lat: float
    start_lon: float

class ChatRequest(BaseModel):
    session_id: str
    message: str
    preferred_location: Optional[str] = None
    weather: Optional[str] = None
    use_enhanced_rag: Optional[bool] = True  # Flag to use enhanced RAG
    use_intelligent_chat: Optional[bool] = False  # Disabled by default - use enhanced RAG with Groq
    use_current_location: Optional[bool] = False  # Flag for Nearby button

@app.post("/chat/start")
def start_chat(req: StartChatRequest):
    sid = create_session()
    session_data = {
        "start_lat": req.start_lat,
        "start_lon": req.start_lon
    }
    update_session(sid, session_data)
    print(f"Created session {sid} with data: {session_data}")
    return {"session_id": sid}

@app.post("/chat")
def chat(req: ChatRequest):
    try:
        print(f"Looking for session: {req.session_id}")
        state = get_session(req.session_id)
        print(f"Found session state: {state}")
        
        if not state:
            return {"narration": "Session expired. Please refresh and try again.", "optimized_plan": []}

        # Use Intelligent Chat Pipeline (DeepSeek + Embeddings)
        if req.use_intelligent_chat and intelligent_pipeline:
            return handle_intelligent_chat(req, state)
        
        # Use Enhanced RAG Pipeline
        elif req.use_enhanced_rag:
            return handle_enhanced_rag_chat(req, state)
        
        # Fallback to original pipeline
        else:
            return handle_original_chat(req, state)
        
    except Exception as e:
        print(f"Chat error: {e}")
        return {"narration": f"Error: {str(e)}", "optimized_plan": []}

def handle_intelligent_chat(req: ChatRequest, state: dict) -> dict:
    """Handle chat using intelligent pipeline with DeepSeek + Embeddings"""
    try:
        result = intelligent_pipeline.process_user_message(
            session_id=req.session_id,
            user_message=req.message,
            user_lat=state["start_lat"],
            user_lon=state["start_lon"]
        )
        
        # Store intelligent state
        state["intelligent_result"] = result
        update_session(req.session_id, state)
        
        # Format response based on result type
        if result["type"] == "follow_up_question":
            return {
                "narration": result["message"],
                "optimized_plan": [],
                "chat_type": "follow_up",
                "interests": result["interests"],
                "confidence": result["confidence"]
            }
        
        elif result["type"] == "negation_response":
            return {
                "narration": result["message"],
                "optimized_plan": [],
                "chat_type": "negation",
                "negation_count": result.get("negation_count", 0)
            }
        
        elif result["type"] in ["recommendations", "refined_recommendations"]:
            # Format recommendations for frontend compatibility
            formatted_recommendations = []
            for rec in result["recommendations"]:
                formatted_recommendations.append({
                    "place_id": rec["place_id"],
                    "place_name": rec["place_name"],
                    "category": rec["category"],
                    "distance_km": rec["distance_km"],
                    "visit_time_hr": rec["visit_time_hr"],
                    "budget_range": rec["budget_range"],
                    "famous_for": rec["famous_for"],
                    "area": rec["area"],
                    "similarity_score": rec["similarity_score"],
                    "vibe": rec["vibe"]
                })
            
            return {
                "narration": result["message"],
                "optimized_plan": formatted_recommendations,
                "chat_type": "recommendations",
                "interests": result["interests"],
                "confidence": result["confidence"],
                "search_info": result.get("search_info", {})
            }
        
        else:
            return {
                "narration": result.get("message", "I'm processing your request..."),
                "optimized_plan": [],
                "chat_type": "processing"
            }
            
    except Exception as e:
        print(f"Intelligent chat error: {e}")
        return {
            "narration": "I'm having trouble understanding. Could you tell me what kind of place you're looking for?",
            "optimized_plan": [],
            "chat_type": "error"
        }

def handle_enhanced_rag_chat(req: ChatRequest, state: dict) -> dict:
    """Handle chat using enhanced RAG pipeline"""
    try:
        # Check if this is initial plan generation or modification
        if "user_profile" not in state:
            # Initial plan generation - parse user inputs
            mood, budget, time = parse_initial_message(req.message)
            
            # Create user profile JSON
            user_profile = enhanced_pipeline.create_user_profile_json(
                mood=mood,
                budget=budget, 
                time=time,
                lat=state["start_lat"],
                lon=state["start_lon"],
                preferred_location=req.preferred_location or "",
                use_current_location=req.use_current_location or False
            )
            
            # Generate recommendations
            result = enhanced_pipeline.generate_recommendations(user_profile)
            
            # Store in session
            state["user_profile"] = result["user_profile"]
            state["current_recommendations"] = result["recommendations"]
            update_session(req.session_id, state)
            
            # Format response for frontend compatibility
            return {
                "narration": result["narration"],
                "optimized_plan": result["recommendations"],
                "search_info": {
                    "radius_used": result["search_radius_used"],
                    "total_found": result["total_places_found"]
                }
            }
        else:
            # Handle chat modifications
            result = enhanced_pipeline.handle_chat_modification(
                user_profile=state["user_profile"],
                current_recommendations=state.get("current_recommendations", []),
                chat_message=req.message
            )
            
            # Update session
            state["user_profile"] = result["user_profile"]
            state["current_recommendations"] = result["recommendations"]
            update_session(req.session_id, state)
            
            return {
                "narration": result["narration"],
                "optimized_plan": result["recommendations"],
                "search_info": {
                    "radius_used": result["search_radius_used"],
                    "total_found": result["total_places_found"]
                }
            }
            
    except Exception as e:
        print(f"Enhanced RAG error: {e}")
        return {"narration": f"Error processing request: {str(e)}", "optimized_plan": []}

def parse_initial_message(message: str) -> tuple:
    """Parse initial message to extract mood, budget, time"""
    parts = message.split(", ")
    mood = parts[0] if len(parts) > 0 else "chill"
    budget = parts[1] if len(parts) > 1 else "medium"
    time = parts[2] if len(parts) > 2 else "2-4"
    return mood, budget, time

def handle_original_chat(req: ChatRequest, state: dict) -> dict:
    """Handle chat using original pipeline (fallback)"""
    # Check if user wants to modify places
    message = req.message.lower()
    if "change" in message or "replace" in message:
        result = handle_place_replacement(req, state)
        return result
    elif "remove" in message or "delete" in message:
        result = handle_place_removal(req, state)
        return result
    
    # Generate new plan
    intent = agent_1_intent_builder({"message": req.message})
    if req.preferred_location:
        intent["preferred_location"] = req.preferred_location

    plan = generate_hangout_plan(
        intent,
        state["start_lat"],
        state["start_lon"]
    )

    # Update session with new plan
    state["plan"] = plan
    state["intent"] = intent
    update_session(req.session_id, state)
    return plan

def handle_place_replacement(req: ChatRequest, state):
    from helpers import load_places_data, haversine
    import pandas as pd
    import re
    
    try:
        current_plan = state.get("plan", {})
        if not current_plan.get("optimized_plan"):
            return {"narration": "No plan to modify. Please generate a plan first.", "optimized_plan": []}
        
        # Extract place index from message (1st, 2nd, 3rd, etc.)
        message = req.message.lower()
        place_index = 0  # default to first place
        
        if "2nd" in message or "second" in message:
            place_index = 1
        elif "3rd" in message or "third" in message:
            place_index = 2
        elif "4th" in message or "fourth" in message:
            place_index = 3
        elif "5th" in message or "fifth" in message:
            place_index = 4
        
        # Check if index is valid
        if place_index >= len(current_plan["optimized_plan"]):
            return {"narration": f"There's no place at position {place_index + 1} in your plan.", "optimized_plan": current_plan["optimized_plan"]}
        
        # Load all places
        df = pd.DataFrame(load_places_data())
        df["latitude"] = pd.to_numeric(df["latitude"], errors="coerce")
        df["longitude"] = pd.to_numeric(df["longitude"], errors="coerce")
        df = df.dropna(subset=["latitude", "longitude"])
        
        # Calculate distances from start location
        df["dist_start"] = df.apply(
            lambda r: haversine(state["start_lat"], state["start_lon"], r["latitude"], r["longitude"]),
            axis=1
        )
        
        # Get current place IDs to avoid duplicates
        current_place_ids = [p["place_id"] for p in current_plan["optimized_plan"]]
        
        # Find replacement place
        available_places = df[~df["place_id"].isin(current_place_ids)]
        if available_places.empty:
            return {"narration": "No alternative places available.", "optimized_plan": current_plan["optimized_plan"]}
        
        # Get the best alternative
        replacement = available_places.sort_values("dist_start").iloc[0]
        
        # Replace the specified place
        new_plan = current_plan["optimized_plan"].copy()
        old_place_name = new_plan[place_index]["place_name"]
        
        new_plan[place_index] = {
            "place_id": replacement["place_id"],
            "place_name": replacement["place_name"],
            "category": replacement["category"],
            "distance_km": round(replacement["dist_start"], 2),
            "visit_time_hr": 1.0
        }
        
        updated_plan = {
            "intent": current_plan.get("intent", {}),
            "optimized_plan": new_plan,
            "narration": f"I've replaced {old_place_name} with {replacement['place_name']}."
        }
        
        state["plan"] = updated_plan
        update_session(req.session_id, state)
        return updated_plan
        
    except Exception as e:
        return {"narration": "Sorry, I couldn't process that request. Please try again.", "optimized_plan": current_plan.get("optimized_plan", [])}

def handle_place_removal(req: ChatRequest, state):
    try:
        current_plan = state.get("plan", {})
        if not current_plan.get("optimized_plan"):
            return {"narration": "No plan to modify. Please generate a plan first.", "optimized_plan": []}
        
        # Extract place index from message
        message = req.message.lower()
        place_index = 0  # default to first place
        
        if "2nd" in message or "second" in message:
            place_index = 1
        elif "3rd" in message or "third" in message:
            place_index = 2
        elif "4th" in message or "fourth" in message:
            place_index = 3
        elif "5th" in message or "fifth" in message:
            place_index = 4
        
        # Check if index is valid
        if place_index >= len(current_plan["optimized_plan"]):
            return {"narration": f"There's no place at position {place_index + 1} in your plan.", "optimized_plan": current_plan["optimized_plan"]}
        
        # Remove the specified place
        new_plan = current_plan["optimized_plan"].copy()
        removed_place = new_plan.pop(place_index)
        
        updated_plan = {
            "intent": current_plan.get("intent", {}),
            "optimized_plan": new_plan,
            "narration": f"I've removed {removed_place['place_name']} from your plan."
        }
        
        state["plan"] = updated_plan
        update_session(req.session_id, state)
        return updated_plan
        
    except Exception as e:
        return {"narration": "Sorry, I couldn't process that request. Please try again.", "optimized_plan": current_plan.get("optimized_plan", [])}

@app.get("/chat/radius/{session_id}")
def get_search_radius(session_id: str):
    """Get current search radius for a session"""
    state = get_session(session_id)
    if not state or "user_profile" not in state:
        return {"radius_km": 2.0, "status": "default"}
    
    return {
        "radius_km": state["user_profile"]["location"]["search_radius_km"],
        "status": "active"
    }

@app.post("/chat/radius/{session_id}")
def update_search_radius(session_id: str, radius_km: float):
    """Update search radius for a session"""
    state = get_session(session_id)
    if not state:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if "user_profile" in state:
        state["user_profile"]["location"]["search_radius_km"] = max(1.0, min(radius_km, 50.0))
        update_session(session_id, state)
        
        # Regenerate recommendations with new radius
        result = enhanced_pipeline.generate_recommendations(state["user_profile"])
        state["current_recommendations"] = result["recommendations"]
        update_session(session_id, state)
        
        return {
            "narration": result["narration"],
            "optimized_plan": result["recommendations"],
            "search_info": {
                "radius_used": result["search_radius_used"],
                "total_found": result["total_places_found"]
            }
        }
    
    return {"message": "Radius updated", "radius_km": radius_km}
@app.post("/chat/refine/{session_id}")
def refine_search(session_id: str, refinement_message: str):
    """Refine search based on user feedback"""
    if not intelligent_pipeline:
        raise HTTPException(status_code=503, detail="Intelligent pipeline not available")
    
    try:
        result = intelligent_pipeline.refine_search(session_id, refinement_message)
        
        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])
        
        # Format for frontend
        formatted_recommendations = []
        for rec in result["recommendations"]:
            formatted_recommendations.append({
                "place_id": rec["place_id"],
                "place_name": rec["place_name"],
                "category": rec["category"],
                "distance_km": rec["distance_km"],
                "visit_time_hr": rec["visit_time_hr"],
                "budget_range": rec["budget_range"],
                "famous_for": rec["famous_for"],
                "similarity_score": rec["similarity_score"]
            })
        
        return {
            "narration": result["message"],
            "optimized_plan": formatted_recommendations,
            "interests": result["interests"],
            "search_info": result["search_info"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/chat/conversation/{session_id}")
def get_conversation_summary(session_id: str):
    """Get conversation summary for a session"""
    if not intelligent_pipeline:
        return {"error": "Intelligent pipeline not available"}
    
    return intelligent_pipeline.get_conversation_summary(session_id)

@app.delete("/chat/conversation/{session_id}")
def reset_conversation(session_id: str):
    """Reset conversation for a session"""
    if intelligent_pipeline:
        intelligent_pipeline.reset_conversation(session_id)
    
    return {"message": "Conversation reset successfully"}

@app.get("/system/stats")
def get_system_stats():
    """Get system statistics"""
    stats = {
        "enhanced_pipeline": "available",
        "intelligent_pipeline": "available" if intelligent_pipeline else "not_available"
    }
    
    if intelligent_pipeline:
        stats.update(intelligent_pipeline.get_system_stats())
    
    return stats

@app.post("/system/initialize")
def initialize_system():
    """Initialize or reinitialize the system"""
    try:
        if intelligent_pipeline:
            intelligent_pipeline.initialize_system()
            return {"message": "System initialized successfully"}
        else:
            return {"error": "Intelligent pipeline not available"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/share/generate")
def generate_share_token(req: dict):
    """Generate a new share token with expiration"""
    token = str(uuid.uuid4())[:8]  # Short token
    expiry = time.time() + 300  # 5 minutes from now
    
    share_tokens[token] = {
        "data": req,
        "expiry": expiry,
        "created": time.time()
    }
    
    return {"token": token, "path": f"/plan/{token}"}

@app.get("/share/{token}")
def get_shared_plan(token: str):
    """Retrieve shared plan by token"""
    if token not in share_tokens:
        raise HTTPException(status_code=404, detail="Link expired or invalid")
    
    token_data = share_tokens[token]
    
    # Check if expired
    if time.time() > token_data["expiry"]:
        del share_tokens[token]  # Clean up expired token
        raise HTTPException(status_code=404, detail="Link expired or invalid")
    
    return token_data["data"]

@app.get("/embeddings/search")
def search_embeddings(query: str, limit: int = 5):
    """Direct embedding search for testing"""
    if not intelligent_pipeline:
        raise HTTPException(status_code=503, detail="Intelligent pipeline not available")
    
    try:
        results = intelligent_pipeline.embedding_system.search_by_text(query, limit)
        return {"query": query, "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))