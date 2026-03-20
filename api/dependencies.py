from motor.motor_asyncio import AsyncIOMotorClient
from src.config.settings import settings

client = AsyncIOMotorClient(settings.MONGODB_URL)
db = client.get_database()

async def get_db():
    return db

def get_current_user():
    pass
