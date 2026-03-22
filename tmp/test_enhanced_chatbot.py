import httpx
import asyncio

async def test_chatbot():
    url = "http://127.0.0.1:8007/chatbot/chat"
    
    # Test 1: Recommendation Query
    print("\n--- Test 1: Recommendation Query ---")
    payload = {"message": "Suggest movies like Inception", "history": []}
    async with httpx.AsyncClient() as client:
        r = await client.post(url, json=payload, timeout=30)
        print(r.json().get("response"))

    # Test 2: Informational Query
    print("\n--- Test 2: Informational Query ---")
    payload = {"message": "Who directed Interstellar?", "history": []}
    async with httpx.AsyncClient() as client:
        r = await client.post(url, json=payload, timeout=30)
        print(r.json().get("response"))

    # Test 3: Analytical Query
    print("\n--- Test 3: Analytical Query ---")
    payload = {"message": "Explain the ending of Shutter Island", "history": []}
    async with httpx.AsyncClient() as client:
        r = await client.post(url, json=payload, timeout=30)
        print(r.json().get("response"))

if __name__ == "__main__":
    asyncio.run(test_chatbot())
