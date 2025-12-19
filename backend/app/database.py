"""
MongoDB database connection using Motor (async driver)
"""
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional
from app.config import settings


class Database:
    """MongoDB database connection manager"""
    
    client: Optional[AsyncIOMotorClient] = None
    database: Optional[AsyncIOMotorDatabase] = None


db = Database()


async def connect_to_mongo() -> None:
    """
    Connect to MongoDB Atlas using Motor async driver
    """
    try:
        db.client = AsyncIOMotorClient(settings.mongodb_url)
        db.database = db.client[settings.database_name]
        
        # Verify connection by pinging the database
        await db.client.admin.command('ping')
        print(f"[SUCCESS] Connected to MongoDB database: {settings.database_name}")
    except Exception as e:
        print(f"[ERROR] Failed to connect to MongoDB: {e}")
        raise


async def close_mongo_connection() -> None:
    """
    Close MongoDB connection
    """
    if db.client:
        db.client.close()
        print("[SUCCESS] Closed MongoDB connection")


def get_database() -> AsyncIOMotorDatabase:
    """
    Get the database instance
    
    Returns:
        AsyncIOMotorDatabase: The MongoDB database instance
    
    Raises:
        RuntimeError: If database is not initialized
    """
    if db.database is None:
        raise RuntimeError("Database is not initialized. Call connect_to_mongo() first.")
    return db.database