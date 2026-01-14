#!/bin/sh

echo "--- Running Database Migrations ---"
# Navigate to root to run migrate_db.py if it's there, or run from /app
python migrate_db.py

echo "--- Starting Uvicorn ---"
# Railway provides the PORT environment variable
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
