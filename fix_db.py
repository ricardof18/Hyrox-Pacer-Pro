from sqlalchemy import create_engine, text
import os

DATABASE_URL = "mysql+pymysql://hyroxuser:hyroxpass@localhost:3306/hyrox_pacer_db"
engine = create_engine(DATABASE_URL)

def migrate():
    output = []
    try:
        with engine.connect() as conn:
            # Check current columns
            res = conn.execute(text("DESC simulations")).fetchall()
            col_names = [r[0] for r in res]
            output.append(f"Current columns: {col_names}")
            
            if 'data' in col_names:
                output.append("Found 'data', renaming to 'created_at'...")
                conn.execute(text("ALTER TABLE simulations CHANGE data created_at DATETIME"))
                conn.commit()
                output.append("Success!")
            elif 'created_at' in col_names:
                output.append("'created_at' already exists.")
            else:
                output.append("Neither 'data' nor 'created_at' found. Something is wrong.")
    except Exception as e:
        output.append(f"Error: {e}")
    
    with open("migration_result.txt", "w") as f:
        f.write("\n".join(output))
    print("Migration attempt finished. See migration_result.txt")

if __name__ == "__main__":
    migrate()
