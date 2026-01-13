
from app import database, models
from sqlalchemy import text

def verify():
    print("--- START VERIFICATION ---", flush=True)
    try:
        db = next(database.get_db())
        # Check tables
        result = db.execute(text("SHOW TABLES"))
        tables = [row[0] for row in result]
        print(f"Tables found: {tables}", flush=True)
        
        if 'users' in tables:
            # Check users
            users = db.query(models.User).all()
            print(f"User count: {len(users)}", flush=True)
            for u in users:
                print(f"User: {u.email}, Role: {u.role}", flush=True)
        else:
            print("Users table does not exist!", flush=True)
            
    except Exception as e:
        print(f"Error during verification: {e}", flush=True)
    print("--- END VERIFICATION ---", flush=True)

if __name__ == "__main__":
    verify()
