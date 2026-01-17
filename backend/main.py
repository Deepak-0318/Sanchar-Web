from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from pipeline import generate_hangout_plan
from agents import agent_1_intent_builder, detect_intent_type, edit_existing_plan, answer_info_query
from store import create_session, get_session, update_session

app = FastAPI(title="Sanchar AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StartChatRequest(BaseModel):
    start_lat: float
    start_lon: float

class ChatRequest(BaseModel):
    session_id: str
    message: str
    preferred_location: Optional[str] = None

class SurveyRequest(BaseModel):
    session_id: str
    time_hours: float
    budget: str  # "budget", "moderate", "premium" 
    vibe: str    # "chill", "fun", "romantic"
    preferred_location: Optional[str] = "MG Road, Bengaluru"

@app.post("/chat/start")
def start_chat(req: StartChatRequest):
    sid = create_session()
    update_session(sid, req.dict())
    return {"session_id": sid}

@app.post("/plan/generate")
def generate_plan(req: SurveyRequest):
    """Generate initial plan from user survey"""
    state = get_session(req.session_id)
    if not state:
        raise HTTPException(400, "Invalid session")

    # Build intent from survey
    intent = {
        "vibe": [req.vibe],
        "budget_tier": req.budget,
        "time_available_hours": req.time_hours,
        "preferred_location": req.preferred_location or "MG Road, Bengaluru",
        "weather": "clear"
    }

    plan = generate_hangout_plan(
        intent,
        state["start_lat"],
        state["start_lon"]
    )

    # Store the plan in session state
    update_session(req.session_id, {
        "plan": plan,
        "intent": intent,
        "start_lat": state["start_lat"], 
        "start_lon": state["start_lon"]
    })
    return plan

@app.post("/chat")
def chat(req: ChatRequest):
    """Handle both plan editing and informational queries"""
    state = get_session(req.session_id)
    if not state:
        raise HTTPException(400, "Invalid session")

    # Detect if this is a plan edit or info query
    intent_type = detect_intent_type(req.message)
    
    if intent_type == "edit":
        # User wants to edit existing plan
        current_plan = state.get("plan")
        if not current_plan:
            raise HTTPException(400, "No existing plan to edit. Generate a plan first.")
            
        # Edit the existing plan using RAG knowledge base
        updated_plan = edit_existing_plan(
            current_plan=current_plan,
            edit_instruction=req.message,
            start_lat=state["start_lat"],
            start_lon=state["start_lon"]
        )
        
        # Update session with new plan
        update_session(req.session_id, {
            **state,
            "plan": updated_plan
        })
        
        # Return ONLY the JSON plan for edits
        return updated_plan
        
    else:
        # User wants information about places (normal RAG query)
        response = answer_info_query(
            message=req.message,
            preferred_location=req.preferred_location
        )
        return {"type": "info", "response": response}
