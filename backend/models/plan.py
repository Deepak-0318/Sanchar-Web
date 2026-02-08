from pydantic import BaseModel
from typing import List, Dict, Union
from datetime import datetime
import uuid

class HangoutPlan(BaseModel):
    id: str = str(uuid.uuid4())
    shareCode: str
    title: str
    mood: str
    budget: Union[str, int]  # Accept both string and int
    places: List[Dict]
    createdAt: datetime = datetime.utcnow()
