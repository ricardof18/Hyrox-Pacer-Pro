from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import pymysql

pymysql.install_as_MySQLdb()

DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://hyroxuser:hyroxpass@localhost/hyrox_pacer_db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
