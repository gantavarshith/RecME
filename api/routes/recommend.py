import logging
import random

from fastapi import APIRouter, Depends, HTTPException, status
from api.services.movie_service import _build_movie_pool
from src.recommender.recommend import get_ai_recommendations
from api.dependencies import get_db, get_current_user_optional

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/")
async def get_recommendations(
    top_k: int = 5,
    shuffle: bool = False,
    db = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    """
    Returns AI personalized movies using integrated Hybrid CB+CF models.
    Lazy-trains on first load, serves instant predictions subsequently.
    Suppresses movies already marked as 'watched' by the current user.
    """
    # Use authenticated user ID if available, otherwise treat as anonymous
    effective_user_id = current_user.id if current_user else "anonymous"

    # Clamp top_k to a reasonable range to prevent abuse
    top_k = max(1, min(top_k, 50))

    # 1. Fetch watched IDs for this user to suppress them
    watched_ids: set = set()

    if current_user:
        for collection_name in ["watched", "watchlist", "not_interested"]:
            cursor = db[collection_name].find(
                {"user_id": str(effective_user_id)},
                {"movie_data.id": 1}
            )
            docs = await cursor.to_list(length=2000)
            for doc in docs:
                mid_raw = doc.get("movie_data", {}).get("id")
                if mid_raw is not None:
                    watched_ids.add(str(mid_raw))
                    try:
                        watched_ids.add(int(mid_raw))
                    except (ValueError, TypeError):
                        pass

    movies_pool = await _build_movie_pool()
    if not movies_pool:
        logger.warning("Movie pool is empty, returning no recommendations.")
        return []

    # Ask model for more than needed so we have room to filter
    requested_count = top_k
    # Fetch a large set of IDs from the engine for significant variety
    recommended_ids = get_ai_recommendations(effective_user_id, movies_pool, top_k=200)

    # Collect candidates for output.
    # If shuffle is ON, we pick from the top 100 available to ensure a "fresh" feel.
    CANDIDATE_LIMIT = 100 if shuffle else requested_count

    candidates = []
    seen_ids = set()

    for rid in recommended_ids:
        # Strict exclusion
        if rid in watched_ids:
            continue

        # Find movie in pool
        movie = next((m for m in movies_pool if str(m.get("id")) == str(rid) or m.get("id") == rid), None)
        if movie and movie.get("id") not in seen_ids:
            candidates.append(movie)
            seen_ids.add(movie["id"])

        if len(candidates) >= CANDIDATE_LIMIT:
            break

    # Padding if not enough candidates (rare)
    if len(candidates) < requested_count:
        pool_copy = sorted(movies_pool, key=lambda x: x.get('vote_average', 0), reverse=True)
        for m in pool_copy:
            mid = m.get('id')
            if mid not in seen_ids and mid not in watched_ids:
                candidates.append(m)
                seen_ids.add(mid)
            if len(candidates) >= requested_count:
                break

    # Shuffle ONLY if requested!
    if shuffle:
        random.shuffle(candidates)

    logger.debug("Returning %d recommendations for user '%s'.", min(len(candidates), requested_count), effective_user_id)
    return candidates[:requested_count]
