import os
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from pipeline import generate_hangout_plan
from routes.places import router as places_router
from store import save_plan, get_plan

# ----------------------------------
# Config
# ----------------------------------
FRONTEND_BASE_URL = os.getenv(
    "FRONTEND_BASE_URL",
    "http://localhost:5173"
)

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://sancharweb.vercel.app",
]

# ----------------------------------
# App Init
# ----------------------------------
app = FastAPI(title="Sanchar AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,   # ✅ IMPORTANT FIX
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(places_router)

# ----------------------------------
# Schemas
# ----------------------------------
class PlanRequest(BaseModel):
    user_input: dict
    start_lat: float
    start_lon: float

# ----------------------------------
# Routes
# ----------------------------------
@app.post("/generate-plan")
def generate_plan(req: PlanRequest):
    plan = generate_hangout_plan(
        req.user_input,
        req.start_lat,
        req.start_lon
    )

    plan_id = save_plan(plan)

    return {
        "plan_id": plan_id,
        "plan": plan,
        "share_url": f"{FRONTEND_BASE_URL}/share/{plan_id}"
    }

@app.get("/plan/{plan_id}")
def fetch_shared_plan(plan_id: str):
    plan = get_plan(plan_id)
    if not plan:
        return {"error": "Plan not found"}
    return plan
