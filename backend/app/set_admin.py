import sys
import os

# Add the parent directory of 'app' to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pymysql
pymysql.install_as_MySQLdb()

from app.database import SessionLocal
from app.models import User

def set_admin():
    email = "ricardo_miguel31@hotmail.com"
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.role = 'admin'
            db.commit()
            print(f"--- SUCCESS: User {email} is now an admin ---")
        else:
            print(f"--- WARNING: User {email} not found ---")
    except Exception as e:
        print(f"--- ERROR: {e} ---")
    finally:
        db.close()

if __name__ == "__main__":
    set_admin()
