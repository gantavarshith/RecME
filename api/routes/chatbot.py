from fastapi import APIRouter
from pydantic import BaseModel
from api.services.movie_service import search_films, get_top_movies, get_mood_movies

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


MOOD_KEYWORDS = {
    "happy": ["happy", "fun", "upbeat", "cheerful", "joyful", "light"],
    "sad": ["sad", "cry", "emotional", "heartbreak", "depressing", "tear"],
    "action": ["action", "fight", "adventure", "explosive", "fast", "intense"],
    "horror": ["horror", "scary", "spooky", "ghost", "fear", "frightening", "creepy"],
    "romance": ["romance", "romantic", "love", "date", "relationship"],
    "comedy": ["comedy", "funny", "laugh", "hilarious", "humor", "comic"],
    "thriller": ["thriller", "suspense", "mystery", "tense", "mind", "twist"],
    "drama": ["drama", "serious", "story", "character", "realistic"],
    "scifi": ["sci-fi", "science fiction", "space", "future", "robot", "alien"],
}


def _detect_mood(message: str) -> str | None:
    lower = message.lower()
    for mood, keywords in MOOD_KEYWORDS.items():
        if any(kw in lower for kw in keywords):
            return mood
    return None


def _detect_query(message: str) -> str | None:
    """Extract a possible movie title/actor/genre from the message."""
    lower = message.lower()
    triggers = ["like", "similar to", "recommend", "suggest", "find", "search", "show me", "tell me about"]
    for trigger in triggers:
        if trigger in lower:
            # Extract everything after the trigger phrase
            idx = lower.index(trigger) + len(trigger)
            fragment = message[idx:].strip().strip('"\'').split("?")[0].strip()
            if len(fragment) > 2:
                return fragment
    return None


@router.post("/chat")
async def chat_with_agent(request: ChatRequest):
    """
    Smart chatbot that detects mood keywords and movie queries to give real recommendations.
    """
    message = request.message.strip()

    # Try mood-based recommendation first
    mood = _detect_mood(message)
    if mood:
        movies = await get_mood_movies(mood, top_k=5)
        if movies:
            titles = "\n".join(
                f"• **{m['title']}** ({m.get('release_date', '')[:4]})"
                f" — ⭐ {m.get('vote_average', 'N/A')}"
                + (f" · IMDb {m['imdb_rating']}" if m.get("imdb_rating") else "")
                for m in movies
            )
            return {
                "response": (
                    f"Here are some great **{mood}** movies for you:\n\n"
                    f"{titles}\n\n"
                    "Want more details on any of these? Just ask!"
                )
            }

    # Try search-based recommendation
    query = _detect_query(message)
    if query:
        movies = await search_films(query)
        if movies:
            titles = "\n".join(
                f"• **{m['title']}** ({m.get('release_date', '')[:4]})"
                f" — ⭐ {m.get('vote_average', 'N/A')}"
                + (f" · IMDb {m['imdb_rating']}" if m.get("imdb_rating") else "")
                for m in movies[:5]
            )
            return {
                "response": (
                    f"Here are some matches for **\"{query}\"**:\n\n"
                    f"{titles}\n\n"
                    "Would you like more details, or should I suggest something similar?"
                )
            }

    # Fallback: give top recommended films
    if any(kw in message.lower() for kw in ["recommend", "suggest", "best", "top", "what should", "what to watch"]):
        movies = await get_top_movies(top_k=5)
        titles = "\n".join(
            f"• **{m['title']}** ({m.get('release_date', '')[:4]})"
            f" — ⭐ {m.get('vote_average', 'N/A')}"
            + (f" · IMDb {m['imdb_rating']}" if m.get("imdb_rating") else "")
            for m in movies
        )
        return {
            "response": (
                "Here are my top picks right now:\n\n"
                f"{titles}\n\n"
                "Tell me your mood or a movie you like and I'll find something perfect for you! 🎬"
            )
        }

    # Generic helpful response
    return {
        "response": (
            "Hi! I'm your RecME AI assistant 🎬\n\n"
            "I can help you find the perfect movie. Try asking me:\n"
            "• *\"Something funny for tonight\"*\n"
            "• *\"Movies like Inception\"*\n"
            "• *\"Best sci-fi movies\"*\n"
            "• *\"I want something romantic\"*\n\n"
            "What are you in the mood for?"
        )
    }
