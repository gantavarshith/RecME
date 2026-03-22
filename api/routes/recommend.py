from fastapi import APIRouter, Depends
from api.services.movie_service import _build_movie_pool
from src.recommender.recommend import get_ai_recommendations
from api.dependencies import get_db, get_current_user_optional
import random

router = APIRouter()

@router.get("/")
async def get_recommendations(
    user_id: str = "1", 
    top_k: int = 50, 
    db = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    """
    Returns AI personalized movies using integrated Hybrid CB+CF models.
    Lazy-trains on first load, serves instant predictions subsequently.
    Suppresses movies already marked as 'watched' by the current user.
    """
    # Use authenticated user ID if available, otherwise fallback to query param or "1"
    effective_user_id = current_user.id if current_user else user_id

    # 1. Fetch watched IDs for this user to suppress them
    watched_cursor = db.watched.find({"user_id": effective_user_id}, {"movie_data.id": 1})
    watched_docs = await watched_cursor.to_list(length=1000)
    watched_ids = {str(doc["movie_data"]["id"]) for doc in watched_docs}
    watched_ids.update({int(doc["movie_data"]["id"]) for doc in watched_docs if str(doc["movie_data"]["id"]).isdigit()})

    movies_pool = await _build_movie_pool()
    if not movies_pool:
        return []
        
    recommended_ids = get_ai_recommendations(effective_user_id, movies_pool, top_k=top_k * 2)

    
    # Map IDs back to objects, skipping watched ones
    final_movies = []
    seen_ids = set()

    # Collect a larger window (top_k * 3) so we have room to shuffle
    WINDOW = top_k * 3
    for rid in recommended_ids:
        if rid in watched_ids:
            continue

        for m in movies_pool:
            if m.get('id') == rid and rid not in seen_ids:
                final_movies.append(m)
                seen_ids.add(rid)
                break

        if len(final_movies) >= WINDOW:
            break

    # Padding logic (also avoiding watched) — fill up to WINDOW
    if len(final_movies) < WINDOW:
        pool_copy = movies_pool.copy()
        random.shuffle(pool_copy)
        for m in pool_copy:
            mid = m.get('id')
            if mid not in seen_ids and mid not in watched_ids:
                final_movies.append(m)
                seen_ids.add(mid)
            if len(final_movies) >= WINDOW:
                break

    # Shuffle the quality window so every request returns a fresh subset
    random.shuffle(final_movies)
    return final_movies[:top_k]

