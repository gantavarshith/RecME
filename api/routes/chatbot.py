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
            idx = lower.index(trigger) + len(trigger)
            fragment = message[idx:].strip().strip('"\'').split("?")[0].strip()
            if len(fragment) > 2:
                return fragment
    
    # Check if the message is just a movie title or genre without a trigger
    is_movie_related = any(kw in lower for kw in ["movie", "film", "show", "series", "watch", "director", "actor"])
    if is_movie_related and len(message) > 2:
        return message
        
    return None

def _is_unrelated(message: str) -> bool:
    """Detect if the query is unrelated to movies/entertainment."""
    lower = message.lower()
    entertainment_keywords = ["movie", "film", "show", "actor", "director", "genre", "recommend", "watch", "cinema", "netflix", "series", "plot", "cast"]
    if any(kw in lower for kw in entertainment_keywords):
        return False
        
    # Heuristic for generic "hi/hello"
    if lower in ["hi", "hello", "hey", "who are you", "what can you do"]:
        return False
        
    # If no entertainment keywords or mood keywords are found, it might be unrelated
    mood_keywords = [kw for sublist in MOOD_KEYWORDS.values() for kw in sublist]
    if any(kw in lower for kw in mood_keywords):
        return False
        
    return True


@router.post("/chat")
async def chat_with_agent(request: ChatRequest):
    """
    RecME AI Chatbot following strict User rules.
    """
    message = request.message.strip()
    lower_message = message.lower()

    # Rule 3: Unrelated query detection
    if _is_unrelated(message):
        return {"response": "I can only help with movies and entertainment recommendations. Try asking about a movie or genre!"}

    # Rule 6: Vague input detection
    vague_triggers = ["suggest movies", "recommend movies", "what to watch", "find me a film", "suggest a movie", "give me recommendations"]
    if any(trigger == lower_message for trigger in vague_triggers):
        return {"response": "What kind of movies are you in the mood for? (action, comedy, thriller, etc.)"}

    # Formatting helper for Rule 5
    def format_movie(m):
        year = m.get('release_date', 'N/A')[:4]
        genres = ", ".join(m.get('genre_names', ['Entertainment'])) if m.get('genre_names') else "Entertainment"
        # Simulated 1-line reason based on overview/rating
        reason = m.get('overview', 'A highly rated must-watch in this category.')[:80] + "..."
        return f"• **{m['title']}** ({year})\n  Genre: {genres}\n  Reason: {reason}"

    # Try mood-based recommendation first
    mood = _detect_mood(message)
    if mood:
        movies = await get_mood_movies(mood, top_k=5)
        if movies:
            titles = "\n\n".join(format_movie(m) for m in movies)
            return {
                "response": (
                    f"Hi there! I found some great **{mood}** films for your mood:\n\n"
                    f"{titles}\n\n"
                    "Let me know if you want to explore more!"
                )
            }

    # Try search-based recommendation
    query = _detect_query(message)
    if query:
        movies = await search_films(query)
        if movies:
            titles = "\n\n".join(format_movie(m) for m in movies[:5])
            return {
                "response": (
                    f"Hi there! Based on your interest in **\"{query}\"**, here are some top matches:\n\n"
                    f"{titles}\n\n"
                    "Would you like more details, or should I suggest something similar?"
                )
            }

    # Fallback: give top recommended films using specific structure
    if any(kw in lower_message for kw in ["recommend", "suggest", "best", "top", "what should", "what to watch"]):
        movies = await get_top_movies(top_k=5)
        titles = "\n\n".join(format_movie(m) for m in movies)
        return {
            "response": (
                "Hi there! Here are my top-tier picks for you today:\n\n"
                f"{titles}\n\n"
                "Tell me a genre or a movie you love, and I'll find something perfect! 🎬"
            )
        }

    # Generic help response (Rule 9: Friendly tone)
    return {
        "response": (
            "Hi there! I'm RecME AI 🎬\n\n"
            "I'm here to help you find your next favorite movie. Try asking me something like:\n"
            "• *\"Recommendations for a tense thriller\"*\n"
            "• *\"Movies similar to Inception\"*\n"
            "• *\"Show me the best action movies\"*\n\n"
            "What can I find for you right now?"
        )
    }
