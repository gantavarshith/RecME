from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    TMDB_API_KEY: str
    OMDB_API_KEY: str
    MONGODB_URL: str = "mongodb://localhost:27017/recme"
    SECRET_KEY: str
    LLM_API_KEY: str

    class Config:
        env_file = ".env"

settings = Settings()
