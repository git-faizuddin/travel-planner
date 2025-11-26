from pydantic_settings import BaseSettings
from pydantic import model_validator
from typing import List


class Settings(BaseSettings):
    # App settings
    app_name: str = "Hotel Recommendation API"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # Database settings
    database_url: str = "sqlite:///./data/hotel_recommendation.db"
    
    # CORS settings - read as string from env, convert to list
    cors_origins: str = "http://localhost:3000,http://localhost:3001"
    
    # API settings
    api_v1_prefix: str = "/api/v1"
    
    # OpenAI settings
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"  # Can use gpt-4o-mini, gpt-4, or gpt-3.5-turbo
    
    # Booking.com API settings
    booking_api_key: str = ""
    booking_api_url: str = "https://distribution-xml.booking.com/json"
    
    @model_validator(mode='after')
    def parse_cors_origins(self) -> 'Settings':
        """Convert comma-separated string to list after validation"""
        if isinstance(self.cors_origins, str):
            # Split comma-separated string and strip whitespace
            self._cors_origins_list = [
                origin.strip() 
                for origin in self.cors_origins.split(',') 
                if origin.strip()
            ]
        elif isinstance(self.cors_origins, list):
            self._cors_origins_list = self.cors_origins
        else:
            self._cors_origins_list = ["http://localhost:3000", "http://localhost:3001"]
        return self
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Get CORS origins as a list"""
        if hasattr(self, '_cors_origins_list'):
            return self._cors_origins_list
        # Fallback if validator hasn't run
        return [
            origin.strip() 
            for origin in self.cors_origins.split(',') 
            if origin.strip()
        ]
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()

