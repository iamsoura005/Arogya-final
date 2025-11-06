"""
Arogya Backend - FastAPI Server
Optional backend for integrating with real APIs and databases
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from datetime import datetime
import json
import os
from typing import Optional

# Import routers
try:
    from benchmarking.api import router as benchmarking_router
    from comparison.api import router as comparison_router
except ImportError:
    # Fallback for when backend is run as a module
    from backend.benchmarking.api import router as benchmarking_router
    from backend.comparison.api import router as comparison_router

app = FastAPI(title="Arogya API", version="2.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(benchmarking_router)
app.include_router(comparison_router)

# Serve artifacts directory as static files
ARTIFACT_PATH = os.getenv("ARTIFACT_LOCAL_PATH", "./backend/artifacts")
os.makedirs(ARTIFACT_PATH, exist_ok=True)
app.mount("/artifacts", StaticFiles(directory=ARTIFACT_PATH), name="artifacts")

# ============= Models =============

class User(BaseModel):
    email: str
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class ChatMessage(BaseModel):
    user_id: str
    consultation_id: str
    message: str
    timestamp: datetime

class ConsultationSummary(BaseModel):
    user_id: str
    consultation_type: str  # chat, voice, image
    summary: str
    ai_diagnosis_json: Optional[dict] = None
    timestamp: datetime

# ============= Endpoints =============

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "Arogya API is running", "version": "1.0.0"}

# Authentication Endpoints
@app.post("/auth/register")
async def register(user: User):
    """Register a new user"""
    return {
        "status": "success",
        "user_id": "user_123",
        "email": user.email,
        "message": "User registered successfully"
    }

@app.post("/auth/login")
async def login(user: User):
    """Login user"""
    return {
        "status": "success",
        "user_id": "user_123",
        "token": "mock_jwt_token_12345",
        "email": user.email
    }

# Consultation Endpoints
@app.get("/consultations/{user_id}")
async def get_consultations(user_id: str):
    """Get all consultations for a user"""
    return {
        "status": "success",
        "consultations": [
            {
                "id": "1",
                "type": "chat",
                "timestamp": "2024-10-20T10:30:00",
                "summary": "Consultation about headaches"
            },
            {
                "id": "2",
                "type": "voice",
                "timestamp": "2024-10-19T14:20:00",
                "summary": "Voice consultation for general wellness"
            }
        ]
    }

@app.post("/consultations/save")
async def save_consultation(consultation: ConsultationSummary):
    """Save a new consultation"""
    return {
        "status": "success",
        "consultation_id": "cons_456",
        "user_id": consultation.user_id,
        "message": "Consultation saved successfully"
    }

# AI Response Endpoints
@app.post("/ai/chat")
async def ai_chat(user_id: str, message: str):
    """Get AI response for chat consultation"""
    return {
        "status": "success",
        "response": "This is a mock AI response. In production, this would call the Gemini API.",
        "sources": [
            "Mayo Clinic Guidelines",
            "NIH Health Database",
            "CDC Information"
        ]
    }

@app.post("/ai/voice")
async def ai_voice(user_id: str, audio_url: str):
    """Process voice input and return audio response"""
    return {
        "status": "success",
        "transcript": "Mock transcription of your voice",
        "response": "Mock AI response to your voice input",
        "audio_url": "mock_tts_audio_url"
    }

@app.post("/ai/image-diagnosis")
async def image_diagnosis(file: UploadFile = File(...)):
    """Analyze medical image and provide diagnosis"""
    return {
        "status": "success",
        "condition": "Possible Pneumonia",
        "confidence": 0.82,
        "explanation": "The image shows characteristics consistent with pneumonia.",
        "recommendations": [
            "Seek immediate medical attention",
            "Get blood tests and sputum cultures",
            "Antibiotic therapy may be needed",
            "Rest and hydration are important",
            "Follow-up X-ray in 6 weeks"
        ]
    }

# Health Records Endpoints
@app.get("/health-records/{user_id}")
async def get_health_records(user_id: str):
    """Get user's health records"""
    return {
        "status": "success",
        "user_id": user_id,
        "health_status": "Good",
        "last_checkup": "2024-10-15",
        "allergies": [],
        "medications": []
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("API_PORT", 8000))
    print(f"Starting Arogya API on http://0.0.0.0:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
