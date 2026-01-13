
from sqlalchemy.orm import Session
from app import models, database, auth

def seed_admin():
    db = next(database.get_db())
    admin_email = "admin@hyrox.com"
    try:
        admin = db.query(models.User).filter(models.User.email == admin_email).first()
        if not admin:
            print(f"Admin user not found. Creating...")
            hashed_password = auth.get_password_hash("admin123")
            new_admin = models.User(
                email=admin_email,
                password_hash=hashed_password,
                full_name="System Admin",
                age=30,
                categoria_hyrox=models.HyroxCategory.PRO,
                role=models.UserRole.ADMIN
            )
            db.add(new_admin)
            db.commit()
            print(f"SUCCESS: Admin user created: {admin_email} / admin123")
        else:
            print(f"INFO: Admin user already exists.")
    except Exception as e:
        print(f"ERROR: Failed to create admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()
