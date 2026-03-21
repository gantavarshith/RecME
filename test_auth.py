import httpx
import asyncio

async def test():
    async with httpx.AsyncClient() as client:
        res = await client.post("http://127.0.0.1:8009/auth/signup", json={
            "name": "Test1",
            "email": "test112@example.com",
            "password": "pass"
        })
        print("Signup result:", res.status_code, res.text)
        
        if res.status_code in [200, 201, 400]:
            res2 = await client.post("http://127.0.0.1:8009/auth/login", data={
                "username": "test112@example.com",
                "password": "pass"
            })
            print("Login result:", res2.status_code, res2.text)

asyncio.run(test())
