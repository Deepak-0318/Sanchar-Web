import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from pipeline import generate_hangout_plan
from agents import (
    agent_1_intent_builder,
    agent_4_edit_interpreter,
    apply_edit_instruction,
    agent_5_plan_narrator
)
from store import create_session, get_session, update_session
from routes.places import router as places_router
from helpers import geocode_place

# -------------------------------------------------
# APP
# -------------------------------------------------

app = FastAPI(title="Sanchar AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://sancharweb.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(places_router)

# -------------------------------------------------
# MODELS
# -------------------------------------------------

class StartChatRequest(BaseModel):
    start_lat: Optional[float]
    start_lon: Optional[float]


class ChatRequest(BaseModel):
    session_id: str
    message: str
    location: Optional[str] = None


# -------------------------------------------------
# CHAT START
# -------------------------------------------------

@app.post("/chat/start")
def start_chat(req: StartChatRequest):
    if req.start_lat is None or req.start_lon is None:
        raise HTTPException(400, "start_lat and start_lon required")

    session_id = create_session()
    update_session(session_id, {
        "start_lat": req.start_lat,
        "start_lon": req.start_lon
    })

    return {"session_id": session_id}


# -------------------------------------------------
# CHAT
# -------------------------------------------------

@app.post("/chat")
def chat(req: ChatRequest):
    state = get_session(req.session_id)
    if not state:
        raise HTTPException(400, "Invalid session")

    message = req.message.strip()

    # =================================================
    # FIRST MESSAGE → GENERATE PLAN
    # =================================================
    if "plan" not in state:
        intent = agent_1_intent_builder({"message": message})

        start_lat = state["start_lat"]
        start_lon = state["start_lon"]

        # ✅ EXPLICIT LOCATION OVERRIDE
        if req.location:
            lat, lon = geocode_place(req.location)
            if lat is not None and lon is not None:
                start_lat, start_lon = lat, lon

        print("PLANNING AROUND:", start_lat, start_lon)

        plan = generate_hangout_plan(
            intent,
            start_lat,
            start_lon
        )

        update_session(req.session_id, {
            **state,
            "intent": intent,
            "plan": plan
        })

        return plan

    # =================================================
    # EDIT MODE (AGENT-4)
    # =================================================
    instruction = agent_4_edit_interpreter(message)

    if instruction.get("action"):
        old_plan = state["plan"]["optimized_plan"]

        new_plan = apply_edit_instruction(
            old_plan,
            instruction
        )

        narration = agent_5_plan_narrator(
            state["intent"],
            new_plan
        )

        updated = {
            "intent": state["intent"],
            "optimized_plan": new_plan,
            "narration": narration
        }

        update_session(req.session_id, {
            **state,
            "plan": updated
        })

        return updated

    # =================================================
    # FALLBACK
    # =================================================
    return {
        "ask": "Got it. You can remove, reorder, or replace places."
    }
