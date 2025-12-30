from typing import Dict
from uuid import uuid4

PLAN_STORE: Dict[str, dict] = {}

def save_plan(plan: dict) -> str:
    pid = str(uuid4())
    PLAN_STORE[pid] = plan
    return pid

def get_plan(plan_id: str):
    return PLAN_STORE.get(plan_id)

SESSION_STORE = {}

def create_session():
    sid = str(uuid4())
    SESSION_STORE[sid] = {}
    return sid

def update_session(sid, data):
    SESSION_STORE[sid] = data

def get_session(sid):
    return SESSION_STORE.get(sid)
