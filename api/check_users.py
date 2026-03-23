import motor.motor_asyncio
import asyncio

async def check_users():
    client = motor.motor_asyncio.AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["recme"]
    
    users = await db.users.find({}).to_list(length=10)
    print(f"Total Users: {len(users)}")
    for u in users:
        uid = u.get("id") or str(u.get("_id"))
        watched_count = await db.watched.count_documents({"user_id": uid})
        print(f"User: {u.get('email')} | ID: {uid} | Watched: {watched_count}")

if __name__ == "__main__":
    asyncio.run(check_users())
