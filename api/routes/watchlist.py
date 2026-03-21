from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from api.models.user_model import UserOut
from api.dependencies import get_db, get_current_user
from pydantic import BaseModel

router = APIRouter()

class WatchlistMovie(BaseModel):
    id: str | int
    title: str
    poster_path: str | None = None
    vote_average: float | None = None
    release_date: str | None = None

@router.get("/", response_model=List[WatchlistMovie])
async def get_watchlist(current_user: UserOut = Depends(get_current_user), db = Depends(get_db)):
    cursor = db.watchlist.find({"user_id": current_user.id})
    watchlist = await cursor.to_list(length=100)
    return [WatchlistMovie(**m["movie_data"]) for m in watchlist]

@router.post("/add")
async def add_to_watchlist(movie: WatchlistMovie, current_user: UserOut = Depends(get_current_user), db = Depends(get_db)):
    # Check if already in watchlist
    existing = await db.watchlist.find_one({"user_id": current_user.id, "movie_data.id": movie.id})
    if existing:
        return {"message": "Already in watchlist"}
    
    await db.watchlist.insert_one({
        "user_id": current_user.id,
        "movie_data": movie.dict()
    })
    return {"message": "Added to watchlist"}

@router.delete("/remove/{movie_id}")
async def remove_from_watchlist(movie_id: str, current_user: UserOut = Depends(get_current_user), db = Depends(get_db)):
    # Check if string or int ID
    query_id = movie_id
    try:
        query_id = int(movie_id)
    except ValueError:
        pass

    result = await db.watchlist.delete_one({"user_id": current_user.id, "movie_data.id": query_id})
    if result.deleted_count == 0:
        # try as string if int fail
        await db.watchlist.delete_one({"user_id": current_user.id, "movie_data.id": str(movie_id)})
        
    return {"message": "Removed from watchlist"}
