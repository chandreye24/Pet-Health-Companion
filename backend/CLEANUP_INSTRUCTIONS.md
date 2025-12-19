# Health Summary Cleanup Instructions

This document explains how to clean up old health summaries for a pet, keeping only the latest one.

## Script: `cleanup_hihi_summaries.py`

This script will:
1. Find the pet named "Hihi" in the database
2. List all health summaries for that pet
3. Keep the latest summary and delete all older ones
4. Update the cached summary to match the latest one

## Prerequisites

- Python 3.8+
- MongoDB connection configured in `.env` file
- Required packages: `motor`, `python-dotenv`

## How to Run

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Make sure your `.env` file has the correct MongoDB connection:
   ```
   MONGODB_URL=your_mongodb_connection_string
   DATABASE_NAME=happy_tiger_run
   ```

3. Run the cleanup script:
   ```bash
   python cleanup_hihi_summaries.py
   ```

4. The script will:
   - Show you all summaries found for "Hihi"
   - Display which summary will be kept (the latest one)
   - List all summaries that will be deleted
   - Ask for confirmation before deleting

5. Type `DELETE` when prompted to confirm the deletion

## What Gets Deleted

- All health summaries in the `pet_health_summary_history` collection for "Hihi" EXCEPT the most recent one
- The cached summary in `pet_health_summaries` will be updated to match the latest summary

## What Gets Kept

- The most recent health summary (sorted by `generatedAt` field)
- This summary will remain in both:
  - `pet_health_summary_history` collection (for history)
  - `pet_health_summaries` collection (for quick access/caching)

## Safety Features

- The script requires explicit confirmation (`DELETE`) before deleting anything
- Shows you exactly what will be deleted before proceeding
- Only affects summaries for the pet named "Hihi"
- Does not affect any other pets or data

## Example Output

```
============================================================
Health Summary Cleanup Script for 'Hihi'
============================================================
Found pet 'Hihi' with ID: 507f1f77bcf86cd799439011

Found 5 total summaries for Hihi

Latest summary (KEEPING):
  - ID: 507f1f77bcf86cd799439012
  - Generated: 2025-01-15 10:30:00
  - Season: Winter
  - Checks Analyzed: 3

Summaries to DELETE (4):
  1. ID: 507f1f77bcf86cd799439013, Generated: 2025-01-14 09:20:00
  2. ID: 507f1f77bcf86cd799439014, Generated: 2025-01-13 15:45:00
  3. ID: 507f1f77bcf86cd799439015, Generated: 2025-01-12 11:10:00
  4. ID: 507f1f77bcf86cd799439016, Generated: 2025-01-11 14:30:00

⚠️  WARNING: This will permanently delete 4 summaries!
Type 'DELETE' to confirm: DELETE

✅ Successfully deleted 4 summaries
✅ Kept the latest summary (ID: 507f1f77bcf86cd799439012)
✅ Updated cached summary

Database connection closed
```

## Troubleshooting

### "Pet 'Hihi' not found in database"
- Check that the pet name is exactly "Hihi" (case-sensitive)
- Verify you're connected to the correct database

### "MONGODB_URL not found in environment variables"
- Make sure your `.env` file exists in the backend directory
- Check that `MONGODB_URL` is properly set in the `.env` file

### Connection errors
- Verify your MongoDB connection string is correct
- Check your network connection
- Ensure MongoDB Atlas allows connections from your IP address