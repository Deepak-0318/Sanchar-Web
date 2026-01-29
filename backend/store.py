from typing import Dict
from uuid import uuid4
from models.plan import HangoutPlan

# -----------------------------
# SESSION STORE (UNCHANGED LOGIC)
# -----------------------------

SESSION_STORE: Dict[str, dict] = {}

def create_session():
    sid = str(uuid4())
    SESSION_STORE[sid] = {}
    return sid

def update_session(sid, data):
    SESSION_STORE[sid] = data

def get_session(sid):
    return SESSION_STORE.get(sid)

# -----------------------------
# PLAN STORE (SHAREABLE LINKS)
# -----------------------------

PLAN_STORE: Dict[str, HangoutPlan] = {}

def save_plan(plan: HangoutPlan):
    PLAN_STORE[plan.shareCode] = plan
    return plan.shareCode

def get_plan_by_share_code(share_code: str):
    return PLAN_STORE.get(share_code)
