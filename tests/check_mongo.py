import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check_mongo():
    uri = "mongodb://localhost:27017/recme"
    print(f"Connecting to {uri}...")
    client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=5000)
    try:
        # The ismaster command is cheap and does not require auth.
        await client.admin.command('ismaster')
        print("SUCCESS: MongoDB is reachable.")
        
        db = client.get_database()
        print(f"Database: {db.name}")
        
        # Try a quick insert/delete
        res = await db.test_collection.insert_one({"test": "data"})
        print(f"SUCCESS: Inserted test document {res.inserted_id}")
        await db.test_collection.delete_one({"_id": res.inserted_id})
        print("SUCCESS: Deleted test document.")
        
    except Exception as e:
        print(f"FAILED: Could not connect to MongoDB: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(check_mongo())
