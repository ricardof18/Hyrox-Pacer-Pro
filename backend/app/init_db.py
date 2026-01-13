
import logging
import time
from sqlalchemy import create_engine, text
from app import models, database

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db():
    retries = 30
    while retries > 0:
        try:
            logger.info("Attempting to connect to database...")
            # Try to create an engine and connect
            engine = database.engine
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            logger.info("Database connection successful.")
            
            # Debug: Print registered tables
            print(f"Registered tables in metadata: {models.Base.metadata.tables.keys()}", flush=True)

            logger.info("Creating tables...")
            models.Base.metadata.create_all(bind=engine)
            logger.info("Tables created successfully.")
            return
        except Exception as e:
            logger.warning(f"Database not ready yet. Error: {e}")
            retries -= 1
            time.sleep(2)
            logger.info(f"Retrying... ({retries} attempts left)")

    logger.error("Could not connect to database after multiple attempts.")

if __name__ == "__main__":
    print("Starting DB Initialization...")
    init_db()
