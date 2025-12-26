from fastapi import FastAPI
from pydantic import BaseModel
from pipeline import generate_hangout_plan
from fastapi.middleware.cors import CORSMiddleware
from routes.places import router as places_router

app = FastAPI(title="Sanchar AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(places_router)

class PlanRequest(BaseModel):
    user_input: dict
    start_lat: float
    start_lon: float

@app.post("/generate-plan")
def generate_plan(req: PlanRequest):
    return generate_hangout_plan(
        req.user_input,
        req.start_lat,
        req.start_lon
    )
