"""
Local development server for FastAPI

This script runs the FastAPI app with Uvicorn for local development.
Provides hot reload and better debugging compared to running through SAM CLI.

Usage:
    python local_server.py

Features:
    - Auto-reload on code changes
    - Debug mode enabled
    - Loads .env file automatically
    - Swagger UI available at http://localhost:8000/docs
"""
import uvicorn
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Enable auto-reload on code changes
        log_level="info",
    )
