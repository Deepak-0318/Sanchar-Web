from fastapi import APIRouter, HTTPException
from models.plan import HangoutPlan
from store import save_plan, get_plan_by_share_code
import random
import string

router = APIRouter()

def generate_share_code():
    return "".join(
        random.choices(string.ascii_uppercase + string.digits, k=6)
    )

@router.post("/plans")
def create_plan(payload: dict):
    share_code = generate_share_code()

    plan = HangoutPlan(
        shareCode=share_code,
        title=payload.get("title", "Hangout Plan"),
        mood=payload["mood"],
        budget=payload["budget"],
        places=payload["places"],
    )

    save_plan(plan)

    return {
        "shareCode": share_code,
        "plan": plan
    }

@router.get("/plans/share/{share_code}")
def get_shared_plan(share_code: str):
    plan = get_plan_by_share_code(share_code)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan
