import logging
from typing import List, Optional
from fastapi import APIRouter
from pydantic import BaseModel
from api.services.movie_service import search_films, get_top_movies, get_mood_movies
from src.agent.chatbot import ChatbotAgent

logger = logging.getLogger(__name__)
router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = None

@router.post("/chat")
async def chat_with_agent(request: ChatRequest):
    try:
        agent = ChatbotAgent() # Fresh agent

        message = request.message.strip()
        history = request.history or []

        # 1. Dynamic Context Injection
        context_movies = await search_films(message)
        context_str = ""
        if context_movies:
            context_str = "Recent/Relevant Movies from Database:\n"
            for m in context_movies[:8]:
                year = (m.get("release_date") or "")[:4] or "N/A"
                genres = ", ".join(m.get("genres") or [])
                context_str += f"- {m.get('title')} ({year}) | Genres: {genres} | Rating: {m.get('vote_average')}\n"

        # 2. Get AI Response
        ai_response = await agent.get_response(message, history=history, context=context_str)

        # 3. Handle missing key fallback
        if ai_response is None:
            return {"response": "I need a valid API key to function. Please set your LLM_API_KEY in the .env file! 🎬"}

        # 4. Smart Fallback if API fails (e.g. 403/404 because key lacks Gemini permissions or 429 Rate Limit)
        if any(term in ai_response for term in ["API Error", "Network Error", "Rate Limit"]):
            logger.warning("AI API returned error response: %s", ai_response[:100])
            if context_movies:
                fallback = "I'm having a little trouble connecting to my neural net right now, but based on your request, I found these great matches in our database:\n\n"
                for m in context_movies[:3]:
                    year = (m.get("release_date") or "")[:4] or "N/A"
                    fallback += f"🎬 **{m.get('title')} ({year})** - ⭐ {m.get('vote_average')}/10\n"
                return {"response": fallback}
            else:
                return {"response": "I'm experiencing a temporary network hiccup! However, if you're looking for something to watch, you can never go wrong with a classic like *The Godfather* or an epic like *Interstellar*."}

        return {"response": ai_response}
    except Exception as e:
        logger.error("Chatbot endpoint error: %s", repr(e), exc_info=True)
        return {"response": "I encountered an internal error. Please try again later."}
