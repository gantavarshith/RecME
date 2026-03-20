from fastapi import APIRouter
from api.services.movie_service import get_top_movies

router = APIRouter()


@router.get("/")
async def get_recommendations(user_id: str = "1", top_k: int = 20):
    """
    Returns highly-rated, validated movies from TMDB + OMDb.
    Results are cached for 1 hour for fast subsequent responses.
    """
    movies = await get_top_movies(top_k=min(top_k, 40))
    return movies
