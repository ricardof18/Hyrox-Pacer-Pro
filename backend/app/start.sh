#!/bin/sh

echo "--- Running Database Migrations ---"
python migrate_db.py

echo "--- Starting Uvicorn ---"
# Railway provides the PORT environment variable. Standard module is app.main:app
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
