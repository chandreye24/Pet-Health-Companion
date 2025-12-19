"""
Diagnostic script to check Hihi's data in the database
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

async def check_hihi_data():
    """Check all data for Hihi in the database"""
    
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
        print("=" * 70)
        print("DIAGNOSTIC REPORT FOR 'HIHI'")
        print("=" * 70)
        
        # Find the pet named "Hihi"
        pet = await db.pets.find_one({"name": "Hihi"})
        
        if not pet:
            print("\n❌ ERROR: Pet 'Hihi' not found in database")
            print("\nAvailable pets:")
            all_pets = await db.pets.find({}).to_list(length=None)
            for p in all_pets:
                print(f"  - {p['name']} (ID: {p['_id']})")
            return
        
        pet_id = str(pet["_id"])
        print(f"\n✅ Found pet 'Hihi'")
        print(f"   Pet ID: {pet_id}")
        print(f"   User ID: {pet.get('userId', 'N/A')}")
        print(f"   Breed: {pet.get('breed', 'N/A')}")
        print(f"   Age: {pet.get('age', 'N/A')}")
        
        # Check cached summary
        print("\n" + "=" * 70)
        print("CACHED SUMMARY (pet_health_summaries collection)")
        print("=" * 70)
        
        cached_summary = await db.pet_health_summaries.find_one({"petId": pet_id})
        
        if cached_summary:
            print(f"✅ Cached summary exists")
            print(f"   Summary ID: {cached_summary['_id']}")
            print(f"   Generated At: {cached_summary.get('generatedAt', 'N/A')}")
            print(f"   Season: {cached_summary.get('season', 'N/A')}")
            print(f"   Checks Analyzed: {cached_summary.get('checksAnalyzed', 0)}")
            print(f"   Has Location Data: {cached_summary.get('hasLocationData', False)}")
            print(f"\n   Summary Preview (first 200 chars):")
            summary_text = cached_summary.get('summary', 'No summary text')
            print(f"   {summary_text[:200]}...")
        else:
            print("❌ No cached summary found")
        
        # Check summary history
        print("\n" + "=" * 70)
        print("SUMMARY HISTORY (pet_health_summary_history collection)")
        print("=" * 70)
        
        summaries = await db.pet_health_summary_history.find({
            "petId": pet_id
        }).sort("generatedAt", -1).to_list(length=None)
        
        if summaries:
            print(f"✅ Found {len(summaries)} summaries in history")
            for idx, summary in enumerate(summaries, 1):
                gen_at = summary.get('generatedAt', 'Unknown')
                if isinstance(gen_at, datetime):
                    gen_at = gen_at.strftime('%Y-%m-%d %H:%M:%S')
                print(f"\n   Summary #{idx}:")
                print(f"      ID: {summary['_id']}")
                print(f"      Generated: {gen_at}")
                print(f"      Season: {summary.get('season', 'N/A')}")
                print(f"      Checks Analyzed: {summary.get('checksAnalyzed', 0)}")
                print(f"      Has Location: {summary.get('hasLocationData', False)}")
        else:
            print("❌ No summaries found in history")
        
        # Check symptom checks
        print("\n" + "=" * 70)
        print("SYMPTOM CHECKS (symptom_checks collection)")
        print("=" * 70)
        
        symptom_checks = await db.symptom_checks.find({
            "petId": pet_id
        }).sort("timestamp", -1).to_list(length=None)
        
        if symptom_checks:
            print(f"✅ Found {len(symptom_checks)} symptom checks")
            for idx, check in enumerate(symptom_checks[:5], 1):  # Show first 5
                timestamp = check.get('timestamp', 'Unknown')
                if isinstance(timestamp, datetime):
                    timestamp = timestamp.strftime('%Y-%m-%d %H:%M:%S')
                print(f"\n   Check #{idx}:")
                print(f"      ID: {check['_id']}")
                print(f"      Timestamp: {timestamp}")
                print(f"      Category: {check.get('category', 'N/A')}")
                print(f"      Risk Level: {check.get('riskLevel', 'N/A')}")
            if len(symptom_checks) > 5:
                print(f"\n   ... and {len(symptom_checks) - 5} more")
        else:
            print("❌ No symptom checks found")
        
        print("\n" + "=" * 70)
        print("DIAGNOSIS")
        print("=" * 70)
        
        if not summaries and not cached_summary:
            print("\n⚠️  ISSUE FOUND: No summaries exist for Hihi")
            print("   SOLUTION: Generate a new summary using the 'Generate Pet Summary' button")
        elif summaries and not cached_summary:
            print("\n⚠️  ISSUE FOUND: Summary history exists but no cached summary")
            print("   SOLUTION: The cached summary needs to be regenerated")
        elif not summaries and cached_summary:
            print("\n⚠️  ISSUE FOUND: Cached summary exists but no history")
            print("   This is unusual - history might have been deleted")
        else:
            print("\n✅ Both cached summary and history exist")
            print("   If summaries aren't showing in UI, check:")
            print("   1. Frontend is calling the correct API endpoint")
            print("   2. Pet ID matches between frontend and backend")
            print("   3. Browser console for any errors")
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
    finally:
        client.close()
        print("\n" + "=" * 70)
        print("Database connection closed")
        print("=" * 70)

if __name__ == "__main__":
    asyncio.run(check_hihi_data())