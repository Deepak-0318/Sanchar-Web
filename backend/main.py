import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from pipeline import generate_hangout_plan
from routes.places import router as places_router
from store import save_plan, get_plan

FRONTEND_BASE_URL = os.getenv(
    "FRONTEND_BASE_URL",
    "https://sancharweb.vercel.app"
)

app = FastAPI(title="Sanchar AI")

# ✅ CORS MUST COME IMMEDIATELY AFTER APP INIT
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://sancharweb.vercel.app",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Routes AFTER middleware
app.include_router(places_router)

class PlanRequest(BaseModel):
    user_input: dict
    start_lat: float
    start_lon: float

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
