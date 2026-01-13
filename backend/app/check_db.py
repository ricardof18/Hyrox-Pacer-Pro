import sys
import time
import os
from sqlalchemy import create_engine, text

def check_db():
    url = os.getenv("DATABASE_URL", "mysql+pymysql://hyroxuser:hyroxpass@localhost/hyrox_pacer_db")
    print(f"URL: {url}", flush=True)
    try:
        engine = create_engine(url)
        with engine.connect() as conn:
            print("Successfully connected to database!", flush=True)
            result = conn.execute(text("SHOW TABLES"))
            tables = [row[0] for row in result]
            print(f"Tables found: {tables}", flush=True)
    except Exception as e:
        print(f"Connection failed: {e}", flush=True)

if __name__ == "__main__":
    check_db()
