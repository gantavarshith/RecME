import motor.motor_asyncio
import asyncio
import os
import httpx
from dotenv import load_dotenv

load_dotenv()
TMDB_KEY = os.getenv("TMDB_API_KEY", "")
print(f"Using TMDB Key: {TMDB_KEY[:5]}...")
GENRE_MAP = {
    28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
    80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
    14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
    9648: "Mystery", 10749: "Romance", 878: "Science Fiction",
    10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
}

async def migrate_genres():
    print("Starting genre migration...")
    client = motor.motor_asyncio.AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["recme"]
    
    cursor = db.watched.find({
        "$or": [
            {"movie_data.genres": {"$in": [None, []]}},
            {"movie_data.genres": {"$exists": False}}
        ]
    })
    count = 0
    
    async with httpx.AsyncClient() as tmdb_client:
        async for doc in cursor:
            movie_id = doc["movie_data"]["id"]
            title = doc["movie_data"]["title"]
            print(f"Migrating genres for: {title} ({movie_id})")
            
            try:
                # Fetch genres for this specific ID from TMDB
                # (Assuming the ID in doc is TMDB ID)
                r = await tmdb_client.get(
                    f"https://api.tmdb.org/3/movie/{movie_id}",
                    params={"api_key": TMDB_KEY},
                    timeout=5
                )
                if r.status_code == 200:
                    data = r.json()
                    tmdb_genres = data.get("genres", [])
                    # TMDB returns [{'id': 18, 'name': 'Drama'}]
                    genre_names = [g.get("name") for g in tmdb_genres]
                    
                    if genre_names:
                        await db.watched.update_one(
                            {"_id": doc["_id"]},
                            {"$set": {"movie_data.genres": genre_names}}
                        )
                        count += 1
            except Exception as e:
                print(f"Error migrating {title}: {e}")
            
            await asyncio.sleep(0.1) # Be nice to TMDB
            
    print(f"Migration complete. Updated {count} movies.")

if __name__ == "__main__":
    asyncio.run(migrate_genres())
