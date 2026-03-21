import asyncio
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

TMDB_KEY = os.getenv("TMDB_API_KEY", "")

async def test_search():
    async with httpx.AsyncClient() as client:
        r = await client.get(
            f"https://api.themoviedb.org/3/search/movie",
            params={"api_key": TMDB_KEY, "query": "inception", "include_adult": "false", "page": 1},
            timeout=10,
        )
        print("Status:", r.status_code)
        
        try:
            data = r.json()
            results = data.get("results", [])
            print("Found results:", len(results))
            if results:
                print("First result:", results[0].get("title"))
        except Exception as e:
            print("Error parsing json:", e)
            print("Text:", r.text)

asyncio.run(test_search())
