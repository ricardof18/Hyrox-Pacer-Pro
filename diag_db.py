from sqlalchemy import create_engine, text
import os

DATABASE_URL = "mysql+pymysql://hyroxuser:hyroxpass@localhost:3306/hyrox_pacer_db"
engine = create_engine(DATABASE_URL)

def check():
    try:
        with engine.connect() as conn:
            res = conn.execute(text("DESC simulations")).fetchall()
            with open("db_schema_output.txt", "w") as f:
                for r in res:
                    f.write(str(r) + "\n")
            print("Check complete. See db_schema_output.txt")
    except Exception as e:
        with open("db_schema_output.txt", "w") as f:
            f.write(f"Error: {e}")
        print(f"Error: {e}")

if __name__ == "__main__":
    check()
