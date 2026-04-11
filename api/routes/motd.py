import datetime
import logging
import random
import time
from fastapi import APIRouter, Depends
from api.services.movie_service import _build_movie_pool, get_movie_detail
from api.dependencies import get_db, get_current_user_optional

logger = logging.getLogger(__name__)
router = APIRouter()

# In-memory cache: key -> (movie_dict, expires_at_timestamp)
_motd_cache: dict = {}


def _seconds_until_midnight() -> float:
    """Returns seconds remaining until next UTC midnight."""
    now = datetime.datetime.now(datetime.timezone.utc)
    midnight = (now + datetime.timedelta(days=1)).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    return (midnight - now).total_seconds()


@router.get("/")
async def get_movie_of_the_day(
    db=Depends(get_db),
    current_user=Depends(get_current_user_optional),
):
    """
    Returns one curated 'Movie of the Day'.
    - Changes daily (resets at UTC midnight).
    - Personalized for logged-in users: avoids their watched/watchlist movies.
    - Deterministic per user per day (same movie returned all day for the same user).
    - Guests get a global daily pick.
    """
    today_str = datetime.date.today().isoformat()
    user_key = current_user.id if current_user else "guest"
    cache_key = f"motd:{today_str}:{user_key}"

    # Serve from cache if still valid
    cached = _motd_cache.get(cache_key)
    if cached and time.time() < cached["expires_at"]:
        return cached["movie"]

    # Build the movie pool (cached hourly in movie_service)
    pool = await _build_movie_pool()
    if not pool:
        return {}

    # 1. Collect IDs to exclude (watched + watchlist + not_interested)
    exclude_ids: set = set()
    if current_user:
        try:
            for collection_name in ["watched", "watchlist", "not_interested"]:
                cursor = db[collection_name].find(
                    {"user_id": current_user.id},
                    {"movie_data.id": 1}
                )
                docs = await cursor.to_list(length=1000)
                for doc in docs:
                    mid = doc.get("movie_data", {}).get("id")
                    if mid is not None:
                        exclude_ids.add(str(mid))
                        if str(mid).isdigit():
                            exclude_ids.add(int(mid))
        except Exception as e:
            logger.warning("MOTD: Failed to fetch user history for exclusion: %s", e)

    # 2. Get premium movies pool (Deterministic order)
    # Sort pool by ID to ensure rng.shuffle or selection is stable across server restarts if pool order changes
    stable_pool = sorted(pool, key=lambda x: str(x.get('id', '')))
    premium = [m for m in stable_pool if (m.get("vote_average") or 0) >= 7.5]
    if not premium:
        premium = stable_pool

    # 3. Deterministic candidate sequence per day (Global seed)
    date_ordinal = datetime.date.today().toordinal()
    rng = random.Random(date_ordinal)

    # We shuffle a copy of the premium pool using the day's seed
    candidates = premium.copy()
    rng.shuffle(candidates)

    # Pick the first one that isn't excluded for this specific user
    chosen_basic = candidates[0] # Fallback
    for c in candidates:
        if c.get("id") not in exclude_ids:
            chosen_basic = c
            break

    # 4. Enrich with full details
    try:
        detailed = await get_movie_detail(int(chosen_basic["id"]))
        movie = detailed if detailed else chosen_basic
    except Exception:
        movie = chosen_basic

    # Cache until midnight
    expires_at = time.time() + _seconds_until_midnight()
    _motd_cache[cache_key] = {"movie": movie, "expires_at": expires_at}

    # Prune stale entries to avoid memory leaks
    stale_keys = [k for k, v in _motd_cache.items() if time.time() >= v["expires_at"]]
    for k in stale_keys:
        _motd_cache.pop(k, None)

    return movie
