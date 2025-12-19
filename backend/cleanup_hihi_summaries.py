"""
Script to delete all health summaries for pet "Hihi" except the latest one
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def cleanup_hihi_summaries():
    """Delete all summaries for Hihi except the latest one"""
    
    # Get MongoDB connection string from environment
    mongodb_url = os.getenv("MONGODB_URL")
    database_name = os.getenv("DATABASE_NAME", "happy_tiger_run")
    
    if not mongodb_url:
        print("ERROR: MONGODB_URL not found in environment variables")
        return
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(mongodb_url)
    db = client[database_name]
    
    try:
        # Find the pet named "Hihi"
        pet = await db.pets.find_one({"name": "Hihi"})
        
        if not pet:
            print("ERROR: Pet 'Hihi' not found in database")
            return
        
        pet_id = str(pet["_id"])
        print(f"Found pet 'Hihi' with ID: {pet_id}")
        
        # Get all summaries for this pet, sorted by generation date (newest first)
        summaries = await db.pet_health_summary_history.find({
            "petId": pet_id
        }).sort("generatedAt", -1).to_list(length=None)
        
        print(f"\nFound {len(summaries)} total summaries for Hihi")
        
        if len(summaries) <= 1:
            print("Only 1 or fewer summaries exist. Nothing to delete.")
            return
        
        # Keep the first one (latest), delete the rest
        latest_summary = summaries[0]
        summaries_to_delete = summaries[1:]
        
        print(f"\nLatest summary (KEEPING):")
        print(f"  - ID: {latest_summary['_id']}")
        print(f"  - Generated: {latest_summary.get('generatedAt', 'Unknown')}")
        print(f"  - Season: {latest_summary.get('season', 'Unknown')}")
        print(f"  - Checks Analyzed: {latest_summary.get('checksAnalyzed', 0)}")
        
        print(f"\nSummaries to DELETE ({len(summaries_to_delete)}):")
        for idx, summary in enumerate(summaries_to_delete, 1):
            print(f"  {idx}. ID: {summary['_id']}, Generated: {summary.get('generatedAt', 'Unknown')}")
        
        # Ask for confirmation
        print(f"\n⚠️  WARNING: This will permanently delete {len(summaries_to_delete)} summaries!")
        confirm = input("Type 'DELETE' to confirm: ")
        
        if confirm != "DELETE":
            print("Operation cancelled.")
            return
        
        # Delete the old summaries
        delete_ids = [summary["_id"] for summary in summaries_to_delete]
        result = await db.pet_health_summary_history.delete_many({
            "_id": {"$in": delete_ids}
        })
        
        print(f"\n✅ Successfully deleted {result.deleted_count} summaries")
        print(f"✅ Kept the latest summary (ID: {latest_summary['_id']})")
        
        # Also update the cached summary to match the latest one
        await db.pet_health_summaries.update_one(
            {"petId": pet_id},
            {"$set": {
                "summary": latest_summary["summary"],
                "generatedAt": latest_summary["generatedAt"],
                "checksAnalyzed": latest_summary.get("checksAnalyzed", 0),
                "season": latest_summary.get("season", "Unknown"),
                "hasLocationData": latest_summary.get("hasLocationData", False),
                "updatedAt": datetime.utcnow()
            }},
            upsert=True
        )
        
        print("✅ Updated cached summary")
        
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
    finally:
        client.close()
        print("\nDatabase connection closed")

if __name__ == "__main__":
    print("=" * 60)
    print("Health Summary Cleanup Script for 'Hihi'")
    print("=" * 60)
    asyncio.run(cleanup_hihi_summaries())