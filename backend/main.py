import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from pipeline import (
    generate_hangout_plan,
    edit_hangout_plan
)

from agents import agent_1_intent_builder

from routes.places import router as places_router

from store import (
    save_plan,
    get_plan,
    create_session,
    get_session,
    update_session
)

FRONTEND_BASE_URL = os.getenv(
    "FRONTEND_BASE_URL",
    "https://sancharweb.vercel.app"
)

app = FastAPI(title="Sanchar AI")

# -------------------------------------------------
# CORS
# -------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://sancharweb.vercel.app",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(places_router)

# -------------------------------------------------
# MODELS
# -------------------------------------------------

class PlanRequest(BaseModel):
    user_input: dict
    start_lat: float
    start_lon: float

class ChatRequest(BaseModel):
    session_id: str
    message: str

class StartChatRequest(BaseModel):
    start_lat: float
    start_lon: float


# -------------------------------------------------
# HELPERS
# -------------------------------------------------

def missing_intent_fields(intent: dict):
    missing = []
    if not intent.get("vibe"):
        missing.append("mood or vibe")
    if intent.get("budget_max", 0) <= 0:
        missing.append("budget")
    if intent.get("time_available_hours", 0) <= 0:
        missing.append("time available")
    return missing


# -------------------------------------------------
# EXISTING PLAN API
# -------------------------------------------------

@app.post("/generate-plan")
def generate_plan(req: PlanRequest):
    plan = generate_hangout_plan(
        req.user_input,
        req.start_lat,
        req.start_lon
    )

    plan_id = save_plan(plan)

    return {
        "plan_id": plan_id,
        "plan": plan,
        "share_url": f"{FRONTEND_BASE_URL}/share/{plan_id}"
    }

@app.get("/plan/{plan_id}")
def fetch_shared_plan(plan_id: str):
    plan = get_plan(plan_id)
    if not plan:
        return {"error": "Plan not found"}
    return plan


# -------------------------------------------------
# CHAT FLOW (CONVERSATIONAL PLANNER)
# -------------------------------------------------

@app.post("/chat/start")
def start_chat(req: StartChatRequest):
    session_id = create_session()

    update_session(session_id, {
        "start_lat": req.start_lat,
        "start_lon": req.start_lon
    })

    return {
        "session_id": session_id,
        "message": "Hi! Tell me your mood, budget, and time available."
    }

@app.post("/chat")
def chat(req: ChatRequest):
    state = get_session(req.session_id)

    if not state:
        return {"error": "Invalid session"}

    # ---------------- FIRST MESSAGE ----------------
    if "intent" not in state:
        intent = agent_1_intent_builder({
            "message": req.message
        })

        missing = missing_intent_fields(intent)
        if missing:
            return {
                "ask": f"Could you tell me your {', '.join(missing)}?"
            }

        plan = generate_hangout_plan(
            intent,
            state["start_lat"],
            state["start_lon"]
        )

        update_session(req.session_id, {
            **state,
            "intent": plan["intent"],
            "plan": plan
        })

        return plan

    # ---------------- EDIT MESSAGE ----------------
    plan = edit_hangout_plan(
        state["plan"],
        req.message,
        state["start_lat"],
        state["start_lon"]
    )

    update_session(req.session_id, {
        **state,
        "intent": plan["intent"],
        "plan": plan
    })

    return plan
