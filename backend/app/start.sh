#!/bin/sh

echo "--- Running Database Migrations ---"
python migrate_db.py

echo "--- Setting Admin Role ---"
python app/set_admin.py

echo "--- Starting Uvicorn ---"
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
