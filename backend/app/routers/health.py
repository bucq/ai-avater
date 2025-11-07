"""
Health check endpoint
"""
from fastapi import APIRouter
from datetime import datetime

from app.models.schemas import HealthResponse
from app.config import get_settings

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint

    Returns:
        HealthResponse with status, timestamp, and environment info
    """
    settings = get_settings()

    return HealthResponse(
        status="ok",
        timestamp=datetime.now(),
        environment=settings.environment,
        ai_backend=settings.ai_backend,
    )
