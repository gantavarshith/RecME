import datetime
import random
import time
from fastapi import APIRouter, Depends
from api.services.movie_service import _build_movie_pool, get_movie_detail
from api.dependencies import get_db, get_current_user_optional

router = APIRouter()

# In-memory cache: key -> (movie_dict, expires_at_timestamp)
_motd_cache: dict = {}


def _seconds_until_midnight() -> float:
    """Returns seconds remaining until next UTC midnight."""
    now = datetime.datetime.utcnow()
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

    # Collect IDs to exclude (watched + watchlist) for authenticated users
    exclude_ids: set = set()
    if current_user:
        try:
            watched_cursor = db.watched.find(
                {"user_id": current_user.id}, {"movie_data.id": 1}
            )
            watched_docs = await watched_cursor.to_list(length=1000)
            for doc in watched_docs:
                mid = doc.get("movie_data", {}).get("id")
                if mid is not None:
                    exclude_ids.add(str(mid))
                    exclude_ids.add(int(mid) if str(mid).isdigit() else mid)

            wl_cursor = db.watchlist.find(
                {"user_id": current_user.id}, {"movie_data.id": 1}
            )
            wl_docs = await wl_cursor.to_list(length=500)
            for doc in wl_docs:
                mid = doc.get("movie_data", {}).get("id")
                if mid is not None:
                    exclude_ids.add(str(mid))
                    exclude_ids.add(int(mid) if str(mid).isdigit() else mid)
        except Exception as e:
            print(f"[MOTD] Could not fetch user history: {e}")

    # Filter pool
    eligible = [m for m in pool if m.get("id") not in exclude_ids]
    if not eligible:
        eligible = pool  # fallback: ignore exclusions if everything is excluded

    # Only consider well-rated movies (>= 7.5) for MOTD
    premium = [m for m in eligible if (m.get("vote_average") or 0) >= 7.5]
    if not premium:
        premium = eligible

    # Deterministic random pick for this user + day
    date_ordinal = datetime.date.today().toordinal()
    user_seed = hash(user_key) if user_key != "guest" else 0
    rng = random.Random(date_ordinal + user_seed)
    chosen_basic = rng.choice(premium)

    # Enrich with full details (director, runtime, IMDb rating, backdrop)
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
