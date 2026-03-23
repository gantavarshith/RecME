import os
import httpx
import asyncio
from dotenv import load_dotenv

async def test_lite():
    load_dotenv()
    api_key = os.getenv("LLM_API_KEY")
    model = "gemini-2.0-flash-lite-preview-02-05"
    print(f"Testing {model}...")
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    payload = {"contents": [{"parts": [{"text": "hi"}]}]}
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, timeout=30.0)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")

if __name__ == "__main__":
    asyncio.run(test_lite())
