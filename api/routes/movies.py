from fastapi import APIRouter, HTTPException
from api.services.movie_service import get_movie_detail, get_movies_by_tag

router = APIRouter()


@router.get("/{movie_id}")
async def get_movie(movie_id: int):
    """Returns full TMDB + OMDb enriched data for a specific movie."""
    movie = await get_movie_detail(movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    return movie


@router.get("/tagged/{tag}")
async def get_tagged_movies(tag: str):
    """Returns a list of movies for a specific tag (popular, featured, new)."""
    movies = await get_movies_by_tag(tag)
    return movies
