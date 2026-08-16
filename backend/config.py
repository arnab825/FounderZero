import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "Autonomous Co-Founder API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"

    # AI Configuration
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-3.7-flash"

    # Tools Configuration
    TAVILY_API_KEY: Optional[str] = None

    # Firebase Admin Configuration
    FIREBASE_CREDENTIALS_PATH: Optional[str] = None
    FIREBASE_PROJECT_ID: Optional[str] = None
    FIREBASE_CLIENT_EMAIL: Optional[str] = None
    FIREBASE_PRIVATE_KEY: Optional[str] = None
    FIREBASE_STORAGE_BUCKET: Optional[str] = None

    # Vercel Deployment Configuration
    VERCEL_TOKEN: Optional[str] = None
    VERCEL_PROJECT_NAME: Optional[str] = "autonomous-startup"

    # Local Sandbox Storage
    STATIC_SANDBOX_DIR: str = os.path.join(os.path.dirname(__file__), "static_sandbox")

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origins_list(self) -> List[str]:
        if not self.CORS_ORIGINS:
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()

# Ensure sandbox dir exists
os.makedirs(settings.STATIC_SANDBOX_DIR, exist_ok=True)
