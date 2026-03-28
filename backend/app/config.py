"""
Application configuration using Pydantic Settings
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables
    """
    # MongoDB Configuration
    mongodb_url: str
    database_name: str
    
    # JWT Configuration
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440  # 24 hours (reduced from 7 days for security)
    
    # CORS Configuration
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    
    # Security Configuration
    environment: str = "development"  # development, staging, production
    allowed_hosts: str = "localhost,127.0.0.1"  # For production trusted host middleware
    
    # AI Configuration
    gemini_api_key: str
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Convert comma-separated CORS origins to list"""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    @property
    def allowed_hosts_list(self) -> List[str]:
        """Convert comma-separated allowed hosts to list"""
        return [host.strip() for host in self.allowed_hosts.split(",")]


# Global settings instance
settings = Settings()