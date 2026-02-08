from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from store import add_availability, best_time_slot, get_schedule

router = APIRouter(prefix="/schedule", tags=["Schedule"])

class AvailabilityRequest(BaseModel):
    session_id: str
    user: str
    slots: List[str]

@router.post("/availability")
def submit_availability(req: AvailabilityRequest):
    add_availability(req.session_id, req.user, req.slots)
    return {
        "status": "ok",
        "best_slot": best_time_slot(req.session_id)
    }

@router.get("/{session_id}")
def view_schedule(session_id: str):
    return {
        "slots": get_schedule(session_id),
        "best_slot": best_time_slot(session_id)
    }
