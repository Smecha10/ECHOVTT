from pydantic_settings import BaseSettings
from typing import Literal
import json

class Settings(BaseSettings):
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    ai_provider: Literal["anthropic", "openai", "openai_compatible", "ollama", "ollama_cloud", "mock"] = "mock"
    ai_model: str = ""

    anthropic_api_key: str = ""

    openai_api_key: str = ""
    openai_base_url: str = "https://api.openai.com/v1"

    ollama_base_url: str = "http://localhost:11434/v1"
    ollama_model: str = "llama3.2"

    ollama_cloud_api_key: str = ""
    ollama_cloud_base_url: str = "https://ollama.com/api"
    ollama_cloud_model: str = "llama3.3:70b"

    image_provider: Literal["openai_dalle", "stability", "mock"] = "mock"
    stability_api_key: str = ""

    secret_key: str = "change-this-in-production-use-random-256bit-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    stripe_secret_key: str = ""
    stripe_publishable_key: str = ""
    payments_enabled: bool = False

    class Config:
        env_file = ".env"

settings = Settings()
