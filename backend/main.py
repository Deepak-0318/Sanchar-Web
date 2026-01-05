from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from pipeline import generate_hangout_plan
from agents import agent_1_intent_builder
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

@app.post("/chat/start")
def start_chat(req: StartChatRequest):
    sid = create_session()
    update_session(sid, req.dict())
    return {"session_id": sid}

@app.post("/chat")
def chat(req: ChatRequest):
    state = get_session(req.session_id)
    if not state:
        raise HTTPException(400, "Invalid session")

    intent = agent_1_intent_builder({"message": req.message})
    if req.preferred_location:
        intent["preferred_location"] = req.preferred_location

    plan = generate_hangout_plan(
        intent,
        state["start_lat"],
        state["start_lon"]
    )

    update_session(req.session_id, {"plan": plan, "intent": intent})
    return plan
