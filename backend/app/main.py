"""
FastAPI + Mangum main application

This is the entry point for both:
- Local development (Uvicorn)
- AWS Lambda (Mangum)
"""
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from app.config import get_settings
from app.routers import health, chat

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Get settings
settings = get_settings()

# Create FastAPI app
app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    description="AI Avatar Backend API - Chat with AI-powered 3D avatar",
    docs_url="/docs" if settings.is_local else None,  # Disable docs in production
    redoc_url="/redoc" if settings.is_local else None,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(health.router, prefix="/api")
app.include_router(chat.router, prefix="/api")


@app.on_event("startup")
async def startup_event():
    """Log startup information"""
    logger.info(f"Starting AI Avatar API")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"AI Backend: {settings.ai_backend}")
    if settings.ai_backend == "lm_studio":
        logger.info(f"LM Studio endpoint: {settings.lm_studio_endpoint}")
        logger.info(f"LM Studio model: {settings.lm_studio_model}")
    else:
        logger.info(f"Bedrock model: {settings.bedrock_model_id}")
        logger.info(f"Bedrock region: {settings.bedrock_region}")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AI Avatar Backend API",
        "version": settings.api_version,
        "environment": settings.environment,
        "ai_backend": settings.ai_backend,
        "docs_url": "/docs" if settings.is_local else None,
    }


# Lambda handler (for AWS Lambda + API Gateway)
handler = Mangum(app, lifespan="off")
