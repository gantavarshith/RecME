import motor.motor_asyncio
import asyncio

async def check_db():
    client = motor.motor_asyncio.AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["recme"]
    count = await db.watched.count_documents({})
    print(f"Watched count: {count}")
    
    cursor = db.watched.find({}).limit(5)
    async for doc in cursor:
        movie = doc.get("movie_data", {})
        print(f"Movie: {movie.get('title')} | Genres: {movie.get('genres')}")

if __name__ == "__main__":
    asyncio.run(check_db())
