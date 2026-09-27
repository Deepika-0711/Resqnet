import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from incident_analyzer import IncidentAnalyzer
from decision_engine import DecisionEngine

app = FastAPI(
    title="RESQNET AI Incident Intelligence Engine",
    description="Microservice for NLP emergency information extraction, priority assessment, and hazard detection.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class IncidentTextRequest(BaseModel):
    text: str
    location_hint: Optional[str] = None

class IncidentAnalysisResponse(BaseModel):
    incident_type: str
    location: str
    people_count: int
    injury_indicators: List[str]
    road_obstruction: bool
    fire_smoke: bool
    access_difficulty: bool
    priority: str
    priority_score: int
    priority_factors: List[Dict[str, Any]]
    reasoning: List[str]
    disclaimer: str

@app.get("/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": "RESQNET AI Service",
        "version": "1.0.0-bharat-infra"
    }

@app.post("/analyze", response_model=IncidentAnalysisResponse)
def analyze_incident(req: IncidentTextRequest):
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="Incident text cannot be empty")

    # 1. Structured variable extraction
    extracted = IncidentAnalyzer.parse_text(req.text)
    if req.location_hint:
        extracted["location"] = req.location_hint

    # 2. Transparent priority evaluation
    priority_data = DecisionEngine.assess_priority(extracted)

    return {
        "incident_type": extracted["incident_type"],
        "location": extracted["location"],
        "people_count": extracted["people_count"],
        "injury_indicators": extracted["injury_indicators"],
        "road_obstruction": extracted["road_obstruction"],
        "fire_smoke": extracted["fire_smoke"],
        "access_difficulty": extracted["access_difficulty"],
        "priority": priority_data["priority"],
        "priority_score": priority_data["priority_score"],
        "priority_factors": priority_data["priority_factors"],
        "reasoning": priority_data["reasoning"],
        "disclaimer": priority_data["disclaimer"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
