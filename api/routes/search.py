from fastapi import APIRouter
from api.services.movie_service import search_films

router = APIRouter()


@router.get("/")
async def search_movies(query: str):
    """
    Search TMDB for movies matching the query.
    Results are enriched with OMDb data and cached.
    """
    if not query or not query.strip():
        return []
    movies = await search_films(query.strip())
    return movies
