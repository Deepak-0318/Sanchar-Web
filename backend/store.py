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

# -----------------------------
# SCHEDULE STORE
# -----------------------------

SCHEDULE_STORE = {}

def add_availability(session_id: str, user: str, slots: list):
    if session_id not in SCHEDULE_STORE:
        SCHEDULE_STORE[session_id] = {"slots": {}}

    for slot in slots:
        SCHEDULE_STORE[session_id]["slots"].setdefault(slot, [])
        if user not in SCHEDULE_STORE[session_id]["slots"][slot]:
            SCHEDULE_STORE[session_id]["slots"][slot].append(user)

def get_schedule(session_id: str):
    return SCHEDULE_STORE.get(session_id, {"slots": {}})

def best_time_slot(session_id: str):
    data = get_schedule(session_id)["slots"]
    if not data:
        return None

    return max(data.items(), key=lambda x: len(x[1]))[0]
