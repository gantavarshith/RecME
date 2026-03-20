import httpx
import os
from dotenv import load_dotenv

load_dotenv()

TMDB_API_KEY = os.getenv("TMDB_API_KEY")
BASE_URL = "https://api.themoviedb.org/3"

class TMDBClient:
    def __init__(self):
        self.api_key = TMDB_API_KEY

    async def get_movie_details(self, movie_id: int):
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{BASE_URL}/movie/{movie_id}",
                params={"api_key": self.api_key}
            )
            return response.json()

    async def search_movies(self, query: str):
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{BASE_URL}/search/movie",
                params={"api_key": self.api_key, "query": query}
            )
            return response.json()
