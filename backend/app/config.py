"""
Configuration management for AI Avatar Backend

Handles environment-specific settings for:
- Local development (LM Studio)
- Lambda environment (AWS Bedrock)
"""
from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Literal


class Settings(BaseSettings):
    """Application settings with environment variable support"""

    # Environment
    environment: Literal["local", "development", "production"] = "local"
    log_level: str = "INFO"

    # LM Studio Configuration (Local Development)
    lm_studio_endpoint: str = "http://localhost:1234"
    lm_studio_model: str = "google/gemma-3-1b"
    lm_studio_timeout: int = 60

    # AWS Bedrock Configuration (Lambda)
    bedrock_model_id: str = "amazon.nova-micro-v1:0"
    bedrock_region: str = "us-east-1"
    aws_region: str = "ap-northeast-1"

    # API Configuration
    api_title: str = "AI Avatar API"
    api_version: str = "1.0.0"
    cors_origins: list[str] = ["*"]  # Restrict in production

    @property
    def is_local(self) -> bool:
        """Check if running in local development mode"""
        return self.environment in ["local", "development"]

    @property
    def is_production(self) -> bool:
        """Check if running in production mode"""
        return self.environment == "production"

    @property
    def ai_backend(self) -> Literal["lm_studio", "bedrock"]:
        """Determine which AI backend to use"""
        return "lm_studio" if self.is_local else "bedrock"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance

    Uses lru_cache to ensure settings are only loaded once
    """
    return Settings()
