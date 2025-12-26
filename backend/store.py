from typing import Dict
from uuid import uuid4

PLAN_STORE: Dict[str, dict] = {}

def save_plan(plan: dict) -> str:
    pid = str(uuid4())
    PLAN_STORE[pid] = plan
    return pid

def get_plan(plan_id: str):
    return PLAN_STORE.get(plan_id)
