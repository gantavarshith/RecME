import asyncio
import logging
import os
from typing import Optional, List

import httpx

from src.config.settings import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are RecME AI — an expert film assistant.
Your job is to handle ALL types of film-related queries intelligently.
You must first understand the user's intent and then respond accordingly.

There are 3 types of queries:

1. Recommendation Queries:
- User asks for movie suggestions.
- Format: 🎬 Movie Name (Year). Reason: ... (suggest 3–5 movies max, explain WHY for each).

2. Informational Queries:
- User asks facts about movies/actors/directors.
- Format: Give direct, accurate answers.

3. Analytical / Opinion Queries:
- User asks for explanations or opinions.
- Format: Explain clearly in 3–6 lines.

RULES:
- DO NOT recommend movies unless the user is asking for recommendations.
- DO NOT refuse film-related questions.
- Stay strictly within movies, actors, directors, genres, film industry.
- Be concise but engaging. Avoid generic answers.
- If unsure, say "Based on common knowledge" and answer reasonably.
"""

class ChatbotAgent:
    def __init__(self):
        self.api_key = os.getenv("LLM_API_KEY") or settings.LLM_API_KEY
        self.system_prompt = SYSTEM_PROMPT

    async def get_response(self, user_message: str, history: Optional[List[dict]] = None, context: str = ""):
        """
        Calls Gemini API with the system prompt, conversation history, and search context.
        """
        if not self.api_key:
            return None

        model_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={self.api_key}"

        # Prepare messages for Gemini format
        full_system_msg = self.system_prompt
        if context:
            full_system_msg += f"\n\nUSEFUL MOVIE DATA FROM DATABASE:\n{context}\nUse this data to ensure accuracy if relevant."

        contents = []

        if history:
            for msg in history:
                role = "user" if msg["role"] == "user" else "model"
                contents.append({
                    "role": role,
                    "parts": [{"text": msg["content"]}]
                })

        contents.append({
            "role": "user",
            "parts": [{"text": user_message}]
        })

        payload = {
            "system_instruction": {
                "parts": [{"text": full_system_msg}]
            },
            "contents": contents,
            "generationConfig": {
                "temperature": 0.7,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 1024,
            }
        }

        for attempt in range(3):
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.post(model_url, json=payload, timeout=30.0)
                    data = response.json()

                    if response.status_code == 429:
                        logger.warning("Gemini 429 rate limit hit. Retry attempt %d/3...", attempt + 1)
                        await asyncio.sleep(attempt + 1)
                        continue

                    if response.status_code != 200:
                        error_msg = data.get("error", {}).get("message", "Unknown API error")
                        logger.error("Gemini API error %d: %s", response.status_code, error_msg)
                        return f"API Error ({response.status_code}): {error_msg}"

                    if "candidates" in data and len(data["candidates"]) > 0:
                        text = data["candidates"][0]["content"]["parts"][0]["text"]
                        return text
                    return "I'm sorry, I couldn't generate a response. Please try again."
            except Exception as e:
                if attempt < 2:
                    logger.warning("Gemini request attempt %d failed: %s. Retrying...", attempt + 1, repr(e))
                    await asyncio.sleep(1)
                    continue
                logger.error("Gemini request failed after 3 attempts: %s", repr(e))
                return f"Network Error: {repr(e)}"

        return "I'm having trouble connecting to my AI core (Rate Limit). Please try again in a few seconds."
