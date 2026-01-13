from sqlalchemy import create_engine, text
import os

DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://hyroxuser:hyroxpass@localhost/hyrox_pacer_db")

engine = create_engine(DATABASE_URL)

def migrate():
    with engine.connect() as conn:
        try:
            # Check if 'is_active' column exists in 'users' table
            user_columns = conn.execute(text("SHOW COLUMNS FROM users")).fetchall()
            user_col_names = [c[0] for c in user_columns]
            
            if 'is_active' not in user_col_names:
                print("Adding 'is_active' column to 'users' table...")
                conn.execute(text("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE"))
                conn.commit()
                print("Success!")
            else:
                print("'is_active' already exists in 'users' table.")

        except Exception as e:
            print(f"Error during migration: {e}")

if __name__ == "__main__":
    migrate()
