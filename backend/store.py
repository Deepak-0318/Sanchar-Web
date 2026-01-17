from typing import Dict
from uuid import uuid4

PLAN_STORE: Dict[str, dict] = {}

def save_plan(plan: dict) -> str:
    pid = str(uuid4())
    PLAN_STORE[pid] = plan
    return pid

def get_plan(plan_id: str):
    return PLAN_STORE.get(plan_id)

# Enhanced session storage with better data handling
SESSION_STORE = {}

def create_session():
    sid = str(uuid4())
    SESSION_STORE[sid] = {}
    return sid

def update_session(sid, data):
    """Update session data (merge with existing data)"""
    if sid not in SESSION_STORE:
        SESSION_STORE[sid] = {}
    SESSION_STORE[sid].update(data)

def get_session(sid):
    return SESSION_STORE.get(sid)

def get_session_plan(sid):
    """Get the current plan for a session"""
    session = SESSION_STORE.get(sid, {})
    return session.get("plan")

def set_session_plan(sid, plan):
    """Set/update the plan for a session"""
    if sid not in SESSION_STORE:
        SESSION_STORE[sid] = {}
    SESSION_STORE[sid]["plan"] = plan
