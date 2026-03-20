from fastapi import APIRouter
from api.services.movie_service import get_mood_movies

router = APIRouter()


@router.get("/")
async def recommend_by_mood(mood: str, top_k: int = 20):
    """
    Returns movies matching the given mood.
    Supported moods: happy, sad, action, horror, romance, comedy, scifi, drama, animated, thriller.
    """
    movies = await get_mood_movies(mood=mood, top_k=min(top_k, 30))
    return movies
