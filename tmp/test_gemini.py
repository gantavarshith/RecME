import os
import httpx
import json
import asyncio
from dotenv import load_dotenv

async def test_gemini():
    load_dotenv()
    api_key = os.getenv("LLM_API_KEY")
    print(f"Testing with key: {api_key[:10]}...")
    
    model_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    
    payload = {
        "contents": [{
            "parts": [{"text": "Say hello world"}]
        }]
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(model_url, json=payload, timeout=30.0)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")

if __name__ == "__main__":
    asyncio.run(test_gemini())
