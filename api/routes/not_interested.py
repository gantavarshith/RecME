from fastapi import APIRouter, Depends, HTTPException
from api.dependencies import get_db, get_current_user
from api.models.user_model import UserOut
from pydantic import BaseModel
from typing import List, Union

router = APIRouter()

class NotInterestedMovie(BaseModel):
    id: Union[int, str]
    title: str
    poster_path: str = None
    vote_average: float = 0.0
    genre_ids: List[int] = []
    release_date: str = ""

@router.get("/")
async def get_not_interested(current_user: UserOut = Depends(get_current_user), db = Depends(get_db)):
    cursor = db.not_interested.find({"user_id": current_user.id})
    not_interested = await cursor.to_list(length=1000)
    return [m["movie_data"] for m in not_interested]

@router.post("/add")
async def add_not_interested(movie: NotInterestedMovie, current_user: UserOut = Depends(get_current_user), db = Depends(get_db)):
    # Check if already in not_interested
    existing = await db.not_interested.find_one({"user_id": current_user.id, "movie_data.id": movie.id})
    if existing:
        return {"message": "Already marked as not interested"}
    
    await db.not_interested.insert_one({
        "user_id": current_user.id,
        "movie_data": movie.dict()
    })
    
    # Also remove from watchlist if it exists there
    await db.watchlist.delete_one({"user_id": current_user.id, "movie_data.id": movie.id})
    
    return {"message": "Marked as not interested"}

@router.delete("/remove/{movie_id}")
async def remove_not_interested(movie_id: str, current_user: UserOut = Depends(get_current_user), db = Depends(get_db)):
    # Try both str and int
    result = await db.not_interested.delete_one({"user_id": current_user.id, "movie_data.id": movie_id})
    if result.deleted_count == 0 and movie_id.isdigit():
        result = await db.not_interested.delete_one({"user_id": current_user.id, "movie_data.id": int(movie_id)})
    
    return {"message": "Removed from not interested"}
