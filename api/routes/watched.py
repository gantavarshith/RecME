from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from api.models.user_model import UserOut
from api.dependencies import get_db, get_current_user
from pydantic import BaseModel

router = APIRouter()

class WatchedMovie(BaseModel):
    id: str | int
    title: str
    poster_path: str | None = None
    vote_average: float | None = None
    release_date: str | None = None
    genres: List[str] = []
    genre_ids: List[int] = []

@router.get("/", response_model=List[WatchedMovie])
async def get_watched(current_user: UserOut = Depends(get_current_user), db = Depends(get_db)):
    cursor = db.watched.find({"user_id": current_user.id})
    watched = await cursor.to_list(length=500)
    return [WatchedMovie(**m["movie_data"]) for m in watched]

@router.post("/add")
async def add_to_watched(movie: WatchedMovie, current_user: UserOut = Depends(get_current_user), db = Depends(get_db)):
    # Check if already in watched
    existing = await db.watched.find_one({"user_id": current_user.id, "movie_data.id": movie.id})
    if existing:
        return {"message": "Already marked as watched"}
    
    await db.watched.insert_one({
        "user_id": current_user.id,
        "movie_data": movie.dict()
    })
    
    # Also remove from watchlist if it exists there
    await db.watchlist.delete_one({"user_id": current_user.id, "movie_data.id": movie.id})
    
    return {"message": "Added to watched"}

@router.delete("/remove/{movie_id}")
async def remove_from_watched(movie_id: str, current_user: UserOut = Depends(get_current_user), db = Depends(get_db)):
    # Check if string or int ID
    query_id = movie_id
    try:
        query_id = int(movie_id)
    except ValueError:
        pass

    result = await db.watched.delete_one({"user_id": current_user.id, "movie_data.id": query_id})
    if result.deleted_count == 0:
        await db.watched.delete_one({"user_id": current_user.id, "movie_data.id": str(movie_id)})
        
    return {"message": "Removed from watched"}
