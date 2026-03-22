import random
from fastapi import APIRouter
from pydantic import BaseModel
from api.services.movie_service import search_films, get_top_movies, get_mood_movies, _build_movie_pool

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


# ---------------------------------------------------------------------------
# NLU config
# ---------------------------------------------------------------------------

MOOD_KEYWORDS: dict[str, list[str]] = {
    "happy":    ["happy", "fun", "upbeat", "cheerful", "joyful", "light", "feel good", "feel-good", "wholesome"],
    "sad":      ["sad", "cry", "emotional", "heartbreak", "depressing", "tear", "melancholy", "moving", "touching"],
    "action":   ["action", "fight", "explosive", "fast paced", "fast-paced", "intense", "adrenaline", "chase", "war"],
    "horror":   ["horror", "scary", "spooky", "ghost", "fear", "frightening", "creepy", "haunt", "terrifying"],
    "romance":  ["romance", "romantic", "love story", "love", "date night", "relationship", "couples"],
    "comedy":   ["comedy", "funny", "laugh", "hilarious", "humor", "comic", "witty", "silly", "lighthearted"],
    "thriller": ["thriller", "suspense", "mystery", "tense", "mind-bending", "twist", "psychological", "whodunit"],
    "drama":    ["drama", "serious", "character driven", "character-driven", "realistic", "slice of life"],
    "scifi":    ["sci-fi", "science fiction", "scifi", "space", "future", "robot", "alien", "dystopia", "cyberpunk"],
    "animated": ["animated", "animation", "anime", "cartoon", "pixar", "disney", "studio ghibli"],
    "adventure":["adventure", "quest", "journey", "explore", "epic", "fantasy", "magical"],
}

DECADE_MAP: dict[str, tuple[str, str]] = {
    "80s":     ("1980-01-01", "1989-12-31"),
    "1980s":   ("1980-01-01", "1989-12-31"),
    "90s":     ("1990-01-01", "1999-12-31"),
    "1990s":   ("1990-01-01", "1999-12-31"),
    "2000s":   ("2000-01-01", "2009-12-31"),
    "2010s":   ("2010-01-01", "2019-12-31"),
    "2020s":   ("2020-01-01", "2029-12-31"),
    "classic": ("1900-01-01", "1980-12-31"),
    "classics":("1900-01-01", "1980-12-31"),
    "recent":  ("2020-01-01", "2099-12-31"),
    "modern":  ("2010-01-01", "2099-12-31"),
    "new":     ("2022-01-01", "2099-12-31"),
}

GREETINGS = {"hi", "hello", "hey", "sup", "yo", "hiya", "howdy"}
IDENTITY_QUERIES = {"who are you", "what can you do", "what are you", "help", "what do you do"}

VARIED_OPENERS = [
    "Great taste! Here are my picks:",
    "Here's what I'd recommend for you:",
    "I've got some excellent options:",
    "You're going to love these:",
    "Based on that, here are my top suggestions:",
    "Absolutely! Check these out:",
]

ENTERTAINMENT_KEYWORDS = [
    "movie", "film", "show", "actor", "actress", "director", "genre", "recommend",
    "watch", "cinema", "series", "plot", "cast", "sequel", "oscar", "award",
    "animated", "anime", "classic", "recent", "new release",
]


def _opener() -> str:
    return random.choice(VARIED_OPENERS)


def _detect_moods(message: str) -> list[str]:
    """Return ALL matched moods (supports multi-genre queries like 'action thriller')."""
    lower = message.lower()
    matched = []
    for mood, keywords in MOOD_KEYWORDS.items():
        if any(kw in lower for kw in keywords):
            matched.append(mood)
    return matched


def _detect_decade(message: str) -> tuple[str, str] | None:
    lower = message.lower()
    for token, bounds in DECADE_MAP.items():
        if token in lower:
            return bounds
    return None


SIMILAR_TRIGGERS = ["similar to", "like ", "films like", "movies like", "something like"]


def _detect_similarity_target(message: str) -> str | None:
    """Extract the reference movie title from a 'similar to X' query."""
    lower = message.lower()
    for trigger in SIMILAR_TRIGGERS:
        if trigger in lower:
            idx = lower.index(trigger) + len(trigger)
            fragment = message[idx:].strip().strip("\"'").split("?")[0].strip()
            if len(fragment) > 1:
                return fragment
    return None


def _detect_search_query(message: str) -> str | None:
    """Extract a movie title / actor / director (non-similarity queries only)."""
    # Skip if this is a similarity query — handled separately
    if _detect_similarity_target(message):
        return None
    lower = message.lower()
    triggers = [
        "movies about", "films about",
        "suggest", "find", "search", "show me", "tell me about",
        "starring", "directed by",
    ]
    for trigger in triggers:
        if trigger in lower:
            idx = lower.index(trigger) + len(trigger)
            fragment = message[idx:].strip().strip("\"'").split("?")[0].strip()
            if len(fragment) > 2:
                return fragment
    return None


def _is_greeting(message: str) -> bool:
    return message.lower().strip("!?.") in GREETINGS


def _is_identity(message: str) -> bool:
    return message.lower().strip("?!") in IDENTITY_QUERIES


def _is_vague(message: str) -> bool:
    vague = [
        "suggest movies", "recommend movies", "what to watch",
        "find me a film", "suggest a movie", "give me recommendations",
        "any recommendations", "what should i watch",
    ]
    return message.lower().strip("?!") in vague


def _is_unrelated(message: str) -> bool:
    lower = message.lower()
    if any(kw in lower for kw in ENTERTAINMENT_KEYWORDS):
        return False
    mood_kws = [kw for sub in MOOD_KEYWORDS.values() for kw in sub]
    if any(kw in lower for kw in mood_kws):
        return False
    if any(tok in lower for tok in DECADE_MAP):
        return False
    if _is_greeting(message) or _is_identity(message):
        return False
    return True


# ---------------------------------------------------------------------------
# Response formatters
# ---------------------------------------------------------------------------

def _format_movie(m: dict, idx: int) -> str:
    title = m.get("title", "Unknown")
    year = (m.get("release_date") or "")[:4] or "N/A"
    score = m.get("vote_average") or 0
    genres: list = m.get("genres") or []
    genre_str = ", ".join(genres[:2]) if genres else "Movie"
    director = m.get("director")
    overview = m.get("overview") or m.get("plot") or ""
    reason = (overview[:110].rstrip() + "…") if overview else "A critically acclaimed must-watch."

    rating_icon = "⭐⭐⭐" if score >= 8.0 else "⭐⭐" if score >= 7.0 else "⭐"
    dir_line = f"\n  🎬 Dir: **{director}**" if director else ""
    return (
        f"**{idx}. {title}** ({year})  {rating_icon} {score:.1f}\n"
        f"  🎭 {genre_str}{dir_line}\n"
        f"  _{reason}_"
    )


def _format_list(movies: list[dict], intro: str, outro: str = "") -> dict:
    body = "\n\n".join(_format_movie(m, i + 1) for i, m in enumerate(movies))
    text = f"{intro}\n\n{body}"
    if outro:
        text += f"\n\n{outro}"
    return {"response": text}


# ---------------------------------------------------------------------------
# Decade filter helper
# ---------------------------------------------------------------------------

async def _get_decade_picks(start: str, end: str, moods: list[str], top_k: int = 5) -> list[dict]:
    pool = await _build_movie_pool()
    filtered = [
        m for m in pool
        if start <= (m.get("release_date") or "0000") <= end
        and (m.get("vote_average") or 0) >= 7.0
    ]
    if moods:
        from api.services.movie_service import MOOD_GENRES, GENRE_MAP
        mood_genre_names = {
            GENRE_MAP[MOOD_GENRES[mood]]
            for mood in moods
            if mood in MOOD_GENRES and MOOD_GENRES[mood] in GENRE_MAP
        }
        scored = sorted(
            filtered,
            key=lambda m: (-len(set(m.get("genres", [])) & mood_genre_names), -(m.get("vote_average") or 0))
        )
        filtered = scored
    else:
        filtered = sorted(filtered, key=lambda m: -(m.get("vote_average") or 0))

    # Shuffle top window for variety
    window = filtered[:top_k * 3]
    random.shuffle(window)
    return window[:top_k]


async def _get_genre_similar_movies(reference_title: str, top_k: int = 5) -> tuple[list[dict], list[str]]:
    """
    Find movies with overlapping genres to `reference_title`.
    Returns (movies, genres_used) so the caller can name them in the response.
    Strategy:
      1. Search TMDB for the reference title to get its genres.
      2. Score every movie in the pool by genre overlap.
      3. Return the top_k highest-scoring, highest-rated films (excluding the source).
    """
    # Step 1: look up reference movie
    candidates = await search_films(reference_title)
    if not candidates:
        return [], []

    # Take the best-matching result (first, highest relevance from TMDB)
    source = candidates[0]
    source_genres: list[str] = source.get("genres") or []
    source_id = source.get("id")

    if not source_genres:
        return [], []

    source_genre_set = set(source_genres)

    # Step 2: score the pool
    pool = await _build_movie_pool()
    scored = []
    for m in pool:
        if m.get("id") == source_id:
            continue  # skip the source film itself
        overlap = len(set(m.get("genres") or []) & source_genre_set)
        if overlap > 0:
            scored.append((overlap, m.get("vote_average") or 0, m))

    # Sort by genre overlap desc, then rating desc
    scored.sort(key=lambda x: (-x[0], -x[1]))

    # Shuffle a window to add variety
    window = scored[:top_k * 4]
    random.shuffle(window)
    top = [item[2] for item in window[:top_k]]
    return top, source_genres


# ---------------------------------------------------------------------------
# Main chat endpoint
# ---------------------------------------------------------------------------

@router.post("/chat")
async def chat_with_agent(request: ChatRequest):
    message = request.message.strip()
    lower = message.lower()

    # Unrelated query
    if _is_unrelated(message):
        return {"response": "I only know movies! 🎬 Ask me for recommendations by genre, mood, decade, or a film you already love."}

    # Greeting
    if _is_greeting(message):
        return {
            "response": (
                "Hey! 👋 I'm **RecME AI** — your personal movie guide.\n\n"
                "Try asking me:\n"
                "• *\"Recommend a tense psychological thriller\"*\n"
                "• *\"Movies similar to Inception\"*\n"
                "• *\"Best sci-fi films from the 90s\"*\n"
                "• *\"Something funny for date night\"*\n\n"
                "What are you in the mood for? 🍿"
            )
        }

    # Identity
    if _is_identity(message):
        return {
            "response": (
                "I'm **RecME AI** 🤖🎬 — an AI movie recommendation engine.\n\n"
                "I can help you:\n"
                "• Find movies by **mood** (happy, scary, romantic…)\n"
                "• Discover **similar movies** to one you love\n"
                "• Browse by **decade** (80s classics, recent 2020s…)\n"
                "• Explore by **genre** or director\n\n"
                "What do you want to watch?"
            )
        }

    # Vague request
    if _is_vague(message):
        return {
            "response": (
                "I'd love to help! 🎬 Tell me a bit more — try:\n\n"
                "• A **mood** (action, comedy, horror, romance…)\n"
                "• A **movie you loved** that I can match\n"
                "• A **decade** (80s, 90s, 2000s…)\n"
                "• A **director or actor** you enjoy\n\n"
                "The more detail you give, the better I can match you!"
            )
        }

    # Decade filter (optionally combined with mood)
    decade_bounds = _detect_decade(message)
    moods = _detect_moods(message)

    if decade_bounds:
        start, end = decade_bounds
        decade_label = next(tok for tok in DECADE_MAP if tok in lower)
        movies = await _get_decade_picks(start, end, moods, top_k=5)
        if movies:
            mood_label = f" {'/'.join(moods)}" if moods else ""
            return _format_list(
                movies,
                intro=f"{_opener()} Top{mood_label} films from the **{decade_label}**:",
                outro="Want me to filter by genre or jump to another era? 🎞️"
            )

    # Mood-based (multi-genre supported)
    if moods:
        primary_mood = moods[0]
        movies = await get_mood_movies(primary_mood, top_k=20)

        if len(moods) > 1:
            from api.services.movie_service import MOOD_GENRES, GENRE_MAP
            secondary_genres = {
                GENRE_MAP[MOOD_GENRES[mood]]
                for mood in moods[1:]
                if mood in MOOD_GENRES and MOOD_GENRES[mood] in GENRE_MAP
            }
            movies = sorted(
                movies,
                key=lambda m: -len(set(m.get("genres", [])) & secondary_genres)
            )

        top = movies[:5]
        if top:
            mood_label = " + ".join(moods)
            return _format_list(
                top,
                intro=f"{_opener()} Perfect **{mood_label}** films:",
                outro="Tap any title to explore, or tell me if you want a different vibe! 🎬"
            )

    # Similarity query — genre-based, NOT name-based
    similarity_target = _detect_similarity_target(message)
    if similarity_target:
        similar_movies, source_genres = await _get_genre_similar_movies(similarity_target, top_k=5)
        if similar_movies:
            genre_label = " / ".join(source_genres[:2]) if source_genres else "similar"
            return _format_list(
                similar_movies,
                intro=f"{_opener()} These **{genre_label}** films share the same spirit as **{similarity_target}**:",
                outro="Want more in this style or a different mood? Just ask! 🎬"
            )
        return {
            "response": (
                f"I couldn't find a movie called **\"{similarity_target}\"** to base the recommendations on.\n\n"
                "Try:\n"
                "• Spelling out the full title\n"
                "• Describing what you liked about it instead (e.g. *\"tense thrillers with a mind-bending twist\"*)\n"
            )
        }

    # Search-based (actor / director / specific query)
    query = _detect_search_query(message)
    if not query:
        has_film_word = any(kw in lower for kw in ENTERTAINMENT_KEYWORDS)
        if has_film_word and len(message) > 4:
            query = message

    if query:
        movies = await search_films(query)
        if movies:
            top = [m for m in movies if (m.get("vote_average") or 0) >= 6.0][:5]
            if not top:
                top = movies[:5]
            return _format_list(
                top,
                intro=f"{_opener()} Best matches for **\"{query}\"**:",
                outro="Want something more specific? Describe a mood or genre! 🔍"
            )
        return {
            "response": (
                f"I couldn't find exact results for **\"{query}\"**, but I can still help!\n\n"
                "Try:\n"
                "• A broader term (director name, genre keyword)\n"
                "• *\"Movies similar to [title]\"*\n"
                "• Describing your **mood** instead"
            )
        }

    # Keyword fallback: best / top / must-watch
    if any(kw in lower for kw in ["best", "top", "greatest", "must watch", "must-watch", "essential", "recommend"]):
        movies = await get_top_movies(top_k=5)
        return _format_list(
            movies,
            intro=f"{_opener()} Some of the finest films right now:",
            outro="Tell me a genre, decade, or a movie you love and I'll tailor this further! 🍿"
        )

    # Final fallback
    return {
        "response": (
            "Not sure what you're looking for — let me help! 🎬\n\n"
            "Try:\n"
            "• *\"Recommend a feel-good comedy\"*\n"
            "• *\"Movies similar to The Dark Knight\"*\n"
            "• *\"Best films from the 90s\"*\n"
            "• *\"Something romantic for tonight\"*\n\n"
            "What do you have in mind?"
        )
    }
