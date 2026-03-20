import os
from dotenv import load_dotenv

load_dotenv()

class ChatbotAgent:
    def __init__(self):
        self.api_key = os.getenv("LLM_API_KEY")

    def get_response(self, user_message: str):
        """
        Sends message to LLM and returns response.
        """
        # Placeholder logic
        return f"Chatbot received: {user_message}. I'm processing your movie request!"
