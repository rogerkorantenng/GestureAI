from pydantic_settings import BaseSettings
from pydantic import field_validator
from functools import lru_cache
from typing import Union


class Settings(BaseSettings):
    # API Keys
    gemini_api_key: str = ""

    # Google Cloud
    gcp_project_id: str = ""
    gcp_region: str = "us-central1"

    # CORS - accepts comma-separated string or list
    cors_origins: Union[list[str], str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:8080",
    ]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    # App Settings
    debug: bool = True
    app_name: str = "GestureAI API"
    app_version: str = "2.0.0"

    # Gemini Settings
    gemini_model: str = "gemini-2.5-flash"
    gemini_live_model: str = "gemini-2.0-flash-live-001"

    # Processing Settings
    max_frame_size: int = 1280
    frame_quality: int = 85

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
