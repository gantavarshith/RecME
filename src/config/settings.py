from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    TMDB_API_KEY: str
    OMDB_API_KEY: str
    MONGODB_URL: str = "mongodb://127.0.0.1:27017/recme"
    SECRET_KEY: str
    LLM_API_KEY: str
    ALLOWED_ORIGINS: str = "*"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
