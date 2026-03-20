import httpx
import os
from dotenv import load_dotenv

load_dotenv()

OMDB_API_KEY = os.getenv("OMDB_API_KEY")
BASE_URL = "http://www.omdbapi.com/"

class OMDBClient:
    def __init__(self):
        self.api_key = OMDB_API_KEY

    async def get_movie_by_imdb_id(self, imdb_id: str):
        async with httpx.AsyncClient() as client:
            response = await client.get(
                BASE_URL,
                params={"apikey": self.api_key, "i": imdb_id}
            )
            return response.json()

    async def search_movies(self, query: str):
        async with httpx.AsyncClient() as client:
            response = await client.get(
                BASE_URL,
                params={"apikey": self.api_key, "s": query}
            )
            return response.json()
