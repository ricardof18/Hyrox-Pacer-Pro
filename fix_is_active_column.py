from sqlalchemy import create_engine, text
import os

# Database connection URL (adjust if needed to match docker-compose or local env)
DATABASE_URL = "mysql+pymysql://hyroxuser:hyroxpass@localhost:3306/hyrox_pacer_db"

def fix_missing_columns():
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        print("Checking for missing column 'is_active' in 'users' table...")
        
        # Check if the column exists
        result = conn.execute(text("SHOW COLUMNS FROM users LIKE 'is_active'"))
        column_exists = result.fetchone() is not None
        
        if not column_exists:
            print("Column 'is_active' not found. Adding it now...")
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE"))
                conn.commit()
                print("Column 'is_active' added successfully!")
            except Exception as e:
                print(f"Error adding column: {e}")
        else:
            print("Column 'is_active' already exists.")

if __name__ == "__main__":
    fix_missing_columns()
