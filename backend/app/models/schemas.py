"""
Pydantic schemas for API requests and responses
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class Message(BaseModel):
    """Chat message structure"""

    role: str = Field(..., description="Message role (user/assistant/system)")
    content: str = Field(..., description="Message content")


class ChatRequest(BaseModel):
    """Request schema for /api/chat endpoint"""

    message: str = Field(..., min_length=1, max_length=1000, description="User message")
    conversation_history: list[Message] = Field(
        default_factory=list, description="Previous conversation messages"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "message": "こんにちは!",
                "conversation_history": [
                    {"role": "user", "content": "はじめまして"},
                    {"role": "assistant", "content": "こんにちは!よろしくお願いします!"},
                ],
            }
        }


class MouthCue(BaseModel):
    """Lip sync mouth cue data"""

    start: float = Field(..., description="Start time in seconds")
    end: float = Field(..., description="End time in seconds")
    value: str = Field(..., description="Phoneme/viseme value")


class LipSyncData(BaseModel):
    """Lip sync animation data"""

    duration: float = Field(default=0.0, description="Total duration in seconds")
    mouth_cues: list[MouthCue] = Field(
        default_factory=list, description="Mouth animation cues"
    )


class ChatResponse(BaseModel):
    """Response schema for /api/chat endpoint"""

    text: str = Field(..., description="AI response text")
    emotion: str = Field(default="neutral", description="Detected emotion")
    intensity: float = Field(default=0.5, ge=0.0, le=1.0, description="Emotion intensity")
    keywords: list[str] = Field(default_factory=list, description="Extracted keywords")
    audio_url: str = Field(default="", description="Audio file URL (future)")
    lip_sync_data: LipSyncData = Field(
        default_factory=LipSyncData, description="Lip sync data (future)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "text": "こんにちは!今日はどんなお話をしましょうか?",
                "emotion": "happy",
                "intensity": 0.8,
                "keywords": ["こんにちは", "お話"],
                "audio_url": "",
                "lip_sync_data": {"duration": 0.0, "mouth_cues": []},
            }
        }


class HealthResponse(BaseModel):
    """Response schema for /api/health endpoint"""

    status: str = Field(default="ok", description="Health status")
    timestamp: datetime = Field(default_factory=datetime.now, description="Current timestamp")
    environment: str = Field(..., description="Environment name")
    ai_backend: str = Field(..., description="AI backend in use (lm_studio/bedrock)")

    class Config:
        json_schema_extra = {
            "example": {
                "status": "ok",
                "timestamp": "2025-11-08T12:00:00",
                "environment": "local",
                "ai_backend": "lm_studio",
            }
        }
