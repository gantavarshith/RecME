import motor.motor_asyncio
import asyncio

async def check():
    client = motor.motor_asyncio.AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["recme"]
    
    total = await db.watched.count_documents({})
    null_count = await db.watched.count_documents({"user_id": None})
    empty_count = await db.watched.count_documents({"user_id": ""})
    
    print(f"Total entries: {total}")
    print(f"Null user_id: {null_count}")
    print(f"Empty user_id: {empty_count}")
    
    # Check if any user_id field is MISSING
    missing_count = await db.watched.count_documents({"user_id": {"$exists": False}})
    print(f"Missing user_id: {missing_count}")

if __name__ == "__main__":
    asyncio.run(check())
