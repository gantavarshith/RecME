"""
Unified Movie Service - fast TMDB-first data, optional OMDb enrichment for detail views.
Uses in-memory TTL caching for instant subsequent responses.
"""
import asyncio
import os
import random
import time
from typing import Any, Optional

import httpx
from dotenv import load_dotenv

load_dotenv()

TMDB_KEY = os.getenv("TMDB_API_KEY", "")
OMDB_KEY = os.getenv("OMDB_API_KEY", "")
TMDB_BASE = "https://api.tmdb.org/3"
OMDB_BASE = "http://www.omdbapi.com/"
POSTER_BASE = "https://image.tmdb.org/t/p/w500"
BACKDROP_BASE = "https://image.tmdb.org/t/p/original"

# ---------------------------------------------------------------------------
# In-memory cache: store the FULL pool with TTL, shuffle on every access
# ---------------------------------------------------------------------------
_cache: dict[str, tuple[Any, float]] = {}
CACHE_TTL = 3600  # 1 hour — pool is refreshed hourly

# The full pool of high-quality movies (fetched once, shuffled each request)
_movie_pool: list[dict] = []
_pool_fetched_at: float = 0.0


def _cache_get(key: str) -> Optional[Any]:
    entry = _cache.get(key)
    if entry and (time.time() - entry[1]) < CACHE_TTL:
        return entry[0]
    return None


def _cache_set(key: str, value: Any) -> None:
    _cache[key] = (value, time.time())


# ---------------------------------------------------------------------------
# TMDB genre map (static, no API call needed)
# ---------------------------------------------------------------------------
GENRE_MAP: dict[int, str] = {
    28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
    80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
    14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
    9648: "Mystery", 10749: "Romance", 878: "Science Fiction",
    10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
}

MOOD_GENRES: dict[str, int] = {
    "happy":    35,     # Comedy
    "sad":      18,     # Drama
    "action":   28,     # Action
    "horror":   27,     # Horror
    "romance":  10749,  # Romance
    "comedy":   35,     # Comedy
    "scifi":    878,    # Science Fiction
    "drama":    18,     # Drama
    "animated": 16,     # Animation
    "thriller": 53,     # Thriller
}


# ---------------------------------------------------------------------------
# Raw HTTP helpers
# ---------------------------------------------------------------------------
async def _tmdb(client: httpx.AsyncClient, path: str, **params) -> dict:
    try:
        r = await client.get(
            f"{TMDB_BASE}{path}",
            params={"api_key": TMDB_KEY, **params},
            timeout=10,
        )
        r.raise_for_status()
        return r.json()
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"[TMDB ERROR] {path}: {repr(e)}")
        return {}


async def _omdb(client: httpx.AsyncClient, **params) -> dict:
    try:
        r = await client.get(
            OMDB_BASE,
            params={"apikey": OMDB_KEY, **params},
            timeout=6,
        )
        r.raise_for_status()
        return r.json()
    except Exception as e:
        print(f"[OMDb ERROR] {e}")
        return {}


# ---------------------------------------------------------------------------
# Shape a TMDB movie dict into our standard format
# ---------------------------------------------------------------------------
def _shape(movie: dict) -> dict:
    genre_ids = movie.get("genre_ids") or []
    genres = [GENRE_MAP.get(g, "") for g in genre_ids if g in GENRE_MAP]

    poster = movie.get("poster_path")
    backdrop = movie.get("backdrop_path")

    return {
        "id": movie.get("id"),
        "title": movie.get("title", ""),
        "overview": movie.get("overview", ""),
        "release_date": movie.get("release_date", ""),
        "poster_path": f"{POSTER_BASE}{poster}" if poster else None,
        "backdrop_path": f"{BACKDROP_BASE}{backdrop}" if backdrop else None,
        "vote_average": round(float(movie.get("vote_average") or 0), 1),
        "vote_count": movie.get("vote_count", 0),
        "genres": genres,
        "imdb_id": None,
        "imdb_rating": None,
        "director": None,
        "actors": None,
        "runtime": None,
    }


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

async def _build_movie_pool() -> list[dict]:
    """Fetch a large pool of high-quality movies from TMDB (runs at most once per hour)."""
    global _movie_pool, _pool_fetched_at
    if _movie_pool and (time.time() - _pool_fetched_at) < CACHE_TTL:
        return _movie_pool

    async with httpx.AsyncClient() as client:
        pages = await asyncio.gather(
            _tmdb(client, "/discover/movie",
                  sort_by="vote_average.desc",
                  **{"vote_count.gte": 2000, "vote_average.gte": 7.0,
                     "with_original_language": "en", "page": 1}),
            _tmdb(client, "/discover/movie",
                  sort_by="vote_average.desc",
                  **{"vote_count.gte": 2000, "vote_average.gte": 7.0,
                     "with_original_language": "en", "page": 2}),
            _tmdb(client, "/discover/movie",
                  sort_by="vote_average.desc",
                  **{"vote_count.gte": 2000, "vote_average.gte": 7.0,
                     "with_original_language": "en", "page": 3}),
            _tmdb(client, "/movie/popular",
                  **{"page": 1}),
            _tmdb(client, "/movie/popular",
                  **{"page": 2}),
            _tmdb(client, "/movie/top_rated",
                  **{"page": 1}),
        )

    seen: set = set()
    raw: list[dict] = []
    for page in pages:
        for m in page.get("results", []):
            mid = m.get("id")
            if mid and mid not in seen and m.get("poster_path"):
                seen.add(mid)
                raw.append(m)

    # Keep only movies with at least a 6.5 rating
    filtered = [m for m in raw if (m.get("vote_average") or 0) >= 6.5]
    _movie_pool = [_shape(m) for m in filtered]
    _pool_fetched_at = time.time()
    return _movie_pool


async def get_top_movies(top_k: int = 20) -> list[dict]:
    """
    Each call returns a freshly shuffled subset of the high-quality movie pool.
    The pool is cached for 1 hour; the shuffle is always fresh.
    """
    pool = await _build_movie_pool()
    shuffled = pool.copy()
    random.shuffle(shuffled)
    return shuffled[:top_k]


async def _build_mood_pool(mood_key: str) -> list[dict]:
    """Fetch a large pool of exact genre movies for a mood."""
    cache_key = f"pool_mood:{mood_key}"
    cached = _cache_get(cache_key)
    if cached is not None:
        return cached

    genre_id = MOOD_GENRES.get(mood_key, 28)

    async with httpx.AsyncClient() as client:
        pages = await asyncio.gather(
            _tmdb(client, "/discover/movie",
                  sort_by="vote_average.desc",
                  **{"vote_count.gte": 500, "vote_average.gte": 6.8,
                     "with_genres": genre_id, "with_original_language": "en", "page": 1}),
            _tmdb(client, "/discover/movie",
                  sort_by="vote_average.desc",
                  **{"vote_count.gte": 500, "vote_average.gte": 6.8,
                     "with_genres": genre_id, "with_original_language": "en", "page": 2}),
            _tmdb(client, "/discover/movie",
                  sort_by="popularity.desc",
                  **{"vote_count.gte": 300, "vote_average.gte": 6.5,
                     "with_genres": genre_id, "page": 1}),
            _tmdb(client, "/discover/movie",
                  sort_by="popularity.desc",
                  **{"vote_count.gte": 300, "vote_average.gte": 6.5,
                     "with_genres": genre_id, "page": 2}),
        )

    seen: set = set()
    raw: list[dict] = []
    for page in pages:
        for m in page.get("results", []):
            mid = m.get("id")
            if mid and mid not in seen and m.get("poster_path"):
                seen.add(mid)
                raw.append(m)

    pool = [_shape(m) for m in raw if (m.get("vote_average") or 0) >= 6.5]
    _cache_set(cache_key, pool)
    return pool

async def get_mood_movies(mood: str, top_k: int = 20) -> list[dict]:
    """
    Returns shuffled exact-genre movies for the mood.
    """
    mood_key = mood.lower().strip()
    pool = await _build_mood_pool(mood_key)
    
    shuffled = pool.copy()
    random.shuffle(shuffled)
    return shuffled[:top_k]


async def get_movies_by_tag(tag: str, limit: int = 20) -> list[dict]:
    """
    Fetch movies by tag: popular, featured, or new.
    Uses specialized TMDB endpoints for each.
    """
    tag = tag.lower().strip()
    
    if tag == "featured":
        # For featured, we cache the pool of movies, but shuffle the output every time
        pool_key = f"tag_pool_v1:{tag}"
        pool = _cache_get(pool_key)
        
        if pool is None:
            async with httpx.AsyncClient() as client:
                pages = await asyncio.gather(
                    _tmdb(client, "/movie/top_rated", page=1),
                    _tmdb(client, "/movie/top_rated", page=2),
                    _tmdb(client, "/movie/top_rated", page=3),
                )
                raw_results = []
                for p in pages:
                    raw_results.extend(p.get("results", []))
                
                if not raw_results:
                    return []
                
                # Shape the pool
                pool = [_shape(m) for m in raw_results if m.get("poster_path")]
                if pool:
                    _cache_set(pool_key, pool)
        
        if pool:
            shuffled = list(pool)
            random.shuffle(shuffled)
            print(f"[DEBUG] Shuffling featured pool of {len(pool)} movies. First is now: {shuffled[0].get('title')}")
            return shuffled[:limit]
        return []

    cache_key = f"tag_v5:{tag}:{limit}"
    cached = _cache_get(cache_key)
    if cached is not None:
        return cached

    async with httpx.AsyncClient() as client:
        if tag == "popular":
            # TMDB Popular movies
            data = await _tmdb(client, "/movie/popular", page=1)
        elif tag == "new":
            # TMDB Now Playing movies
            data = await _tmdb(client, "/movie/now_playing", page=1)
        else:
            return []

    raw = data.get("results", [])
    if not raw:
        return []

    # Shape and limit
    result = [_shape(m) for m in raw if m.get("poster_path")][:limit]
    
    if result:
        _cache_set(cache_key, result)
        
    return result


async def search_films(query: str, page: int = 1) -> list[dict]:
    # Direct fetch matching the test script to avoid connection issues
    async with httpx.AsyncClient() as client:
        try:
            r = await client.get(
                f"{TMDB_BASE}/search/movie",
                params={"api_key": TMDB_KEY, "query": query, "page": 1},
                timeout=10,
            )
            data = r.json()
            raw = data.get("results", [])
            raw.sort(key=lambda m: (m.get("vote_average") or 0) * (m.get("popularity") or 1), reverse=True)
            return [_shape(m) for m in raw[:30] if m.get("poster_path")]
        except Exception as e:
            print("Search films error:", e)
            return []


async def get_movie_detail(movie_id: int) -> Optional[dict]:
    """
    Full detail for a single movie: TMDB details + OMDb enrichment.
    Called only when user opens the movie detail page.
    """
    cache_key = f"detail:{movie_id}"
    cached = _cache_get(cache_key)
    if cached is not None:
        return cached

    async with httpx.AsyncClient() as client:
        detail = await _tmdb(client, f"/movie/{movie_id}",
                             append_to_response="external_ids,credits")
        if not detail.get("id"):
            return None

        imdb_id = detail.get("imdb_id") or (
            (detail.get("external_ids") or {}).get("imdb_id")
        )
        omdb: dict = {}
        if imdb_id:
            omdb = await _omdb(client, i=imdb_id, plot="short")

    genres = [g["name"] for g in detail.get("genres", [])]
    poster = detail.get("poster_path")
    backdrop = detail.get("backdrop_path")

    director = None
    crew = (detail.get("credits") or {}).get("crew", [])
    for p in crew:
        if p.get("job") == "Director":
            director = p.get("name")
            break

    cast = (detail.get("credits") or {}).get("cast", [])
    actors = ", ".join(p["name"] for p in cast[:4] if p.get("name"))

    result = {
        "id": detail.get("id"),
        "title": detail.get("title", ""),
        "overview": detail.get("overview", ""),
        "release_date": detail.get("release_date", ""),
        "poster_path": f"{POSTER_BASE}{poster}" if poster else None,
        "backdrop_path": f"{BACKDROP_BASE}{backdrop}" if backdrop else None,
        "vote_average": round(float(detail.get("vote_average") or 0), 1),
        "vote_count": detail.get("vote_count", 0),
        "runtime": detail.get("runtime"),
        "genres": genres,
        "imdb_id": imdb_id,
        "imdb_rating": omdb.get("imdbRating") if omdb.get("imdbRating") not in (None, "N/A") else None,
        "metascore": omdb.get("Metascore") if omdb.get("Metascore") not in (None, "N/A") else None,
        "rated": omdb.get("Rated") if omdb.get("Rated") not in (None, "N/A") else None,
        "awards": omdb.get("Awards") if omdb.get("Awards") not in (None, "N/A") else None,
        "director": director or (omdb.get("Director") if omdb.get("Director") not in (None, "N/A") else None),
        "actors": actors or (omdb.get("Actors") if omdb.get("Actors") not in (None, "N/A") else None),
        "plot": omdb.get("Plot") if omdb.get("Plot") not in (None, "N/A") else None,
    }
    _cache_set(cache_key, result)
    return result
