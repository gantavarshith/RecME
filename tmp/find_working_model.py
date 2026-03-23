import os
import httpx
import asyncio
from dotenv import load_dotenv

async def test_all_models():
    load_dotenv()
    api_key = os.getenv("LLM_API_KEY")
    
    models = [
        "gemini-2.0-flash",
        "gemini-2.0-flash-exp",
        "gemini-2.0-flash-001",
        "gemini-2.0-flash-lite-preview-02-05",
        "gemini-2.0-pro-exp",
        "gemini-2.0-pro-exp-02-05",
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-pro"
    ]
    
    async with httpx.AsyncClient() as client:
        for model in models:
            print(f"Testing {model}...")
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
            payload = {"contents": [{"parts": [{"text": "hi"}]}]}
            try:
                response = await client.post(url, json=payload, timeout=10.0)
                print(f"  Status: {response.status_code}")
                if response.status_code == 200:
                    print(f"  Found working model: {model}")
                    return model
                else:
                    try:
                        data = response.json()
                        print(f"  Error: {data.get('error', {}).get('message')[:100]}")
                    except:
                        print(f"  Error: {response.text[:100]}")
            except Exception as e:
                print(f"  Failed: {e}")
    return None

if __name__ == "__main__":
    asyncio.run(test_all_models())
