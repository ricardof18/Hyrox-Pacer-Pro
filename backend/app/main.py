from fastapi import FastAPI, Depends, HTTPException, status, APIRouter
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import timedelta
from typing import List, Optional
import uuid
from . import models, database, schemas, auth, pacer
from fastapi.staticfiles import StaticFiles
import os

# Create tables
def migrate_schema():
    try:
        print("--- STARTING SCHEMA MIGRATION ---", flush=True)
        with database.engine.begin() as conn:
            # Check for columns in users table
            result = conn.execute(text("SHOW COLUMNS FROM users"))
            existing_columns = [row[0] for row in result.fetchall()]
            
            # Columns to check and add
            required_columns = {
                "full_name": "VARCHAR(255)",
                "age": "INTEGER",
                "categoria_hyrox": "VARCHAR(50)",
                "role": "VARCHAR(50)",
                "is_active": "BOOLEAN DEFAULT TRUE"
            }
            
            for col, col_type in required_columns.items():
                if col not in existing_columns:
                    print(f"--- MIGRATION: Adding missing column '{col}' ---", flush=True)
                    conn.execute(text(f"ALTER TABLE users ADD COLUMN {col} {col_type}"))
    except Exception as e:
        print(f"--- MIGRATION ERROR: {e} ---", flush=True)

app = FastAPI(title="Hyrox Pacer Pro API")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create API Router
api_router = APIRouter(prefix="/api")

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.on_event("startup")
def startup_event():
    try:
        migrate_schema()
        models.Base.metadata.create_all(bind=database.engine)
        
        db = database.SessionLocal()
        try:
            admin_email = "admin@hyrox.com"
            admin = db.query(models.User).filter(models.User.email == admin_email).first()
            if not admin:
                hashed_password = auth.get_password_hash("admin123")
                new_admin = models.User(
                    email=admin_email,
                    password_hash=hashed_password,
                    full_name="System Admin",
                    role=models.UserRole.ADMIN,
                    is_active=True
                )
                db.add(new_admin)
                db.commit()
                print("--- SEED: Admin user created ---", flush=True)
        finally:
            db.close()
            
    except Exception as e:
        print(f"--- STARTUP ERROR: {e} ---", flush=True)

@api_router.post("/signup", response_model=schemas.UserResponse)
def signup(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        password_hash=hashed_password,
        full_name=user.full_name,
        age=user.age,
        categoria_hyrox=user.categoria_hyrox,
        role=user.role 
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@api_router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled",
        )
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_name": user.full_name,
        "user_role": user.role,
        "user_email": user.email
    }

@api_router.get("/users/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@api_router.post("/calculate-pacer")
def calculate_pacer(request: schemas.PacerRequest):
    try:
        result = pacer.calculate_splits(
            request.tempo_alvo, 
            request.categoria_hyrox, 
            request.preferred_run_pace,
            request.roxzone_minutes
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/simulations", response_model=schemas.SimulationResponse)
def create_simulation(simulation: schemas.SimulationCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_sim = models.Simulation(
        user_id=current_user.id,
        tempo_alvo=simulation.tempo_alvo,
        json_resultados=simulation.json_resultados,
        share_token=str(uuid.uuid4())
    )
    db.add(db_sim)
    db.commit()
    db.refresh(db_sim)
    return db_sim

@api_router.get("/share/{token}", response_model=schemas.SimulationResponse)
def get_shared_simulation(token: str, db: Session = Depends(database.get_db)):
    sim = db.query(models.Simulation).filter(models.Simulation.share_token == token).first()
    if not sim:
        raise HTTPException(status_code=404, detail="Shared plan not found")
    return sim

@api_router.get("/simulations/me", response_model=List[schemas.SimulationResponse])
def read_my_simulations(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    simulations = db.query(models.Simulation).filter(models.Simulation.user_id == current_user.id).order_by(models.Simulation.created_at.desc()).all()
    return simulations

@api_router.delete("/simulations/{simulation_id}")
def delete_simulation(simulation_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    sim = db.query(models.Simulation).filter(models.Simulation.id == simulation_id, models.Simulation.user_id == current_user.id).first()
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found")
    db.delete(sim)
    db.commit()
    return {"message": "Simulation deleted"}

@api_router.get("/admin/users", response_model=List[schemas.UserResponse])
def admin_read_users(
    skip: int = 0, 
    limit: int = 100, 
    role: Optional[models.UserRole] = None,
    q: Optional[str] = None,
    db: Session = Depends(database.get_db), 
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    query = db.query(models.User)
    if role:
        query = query.filter(models.User.role == role)
    if q:
        query = query.filter(
            (models.User.email.contains(q)) | (models.User.full_name.contains(q))
        )
    return query.offset(skip).limit(limit).all()

@api_router.patch("/admin/users/{user_id}", response_model=schemas.UserResponse)
def admin_update_user(
    user_id: int, 
    update: schemas.AdminUserUpdate, 
    db: Session = Depends(database.get_db), 
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if update.full_name is not None:
        user.full_name = update.full_name
    if update.role is not None:
        user.role = update.role
    if update.categoria_hyrox is not None:
        user.categoria_hyrox = update.categoria_hyrox
    if update.is_active is not None:
        user.is_active = update.is_active
        
    db.commit()
    db.refresh(user)
    return user

@api_router.post("/admin/users/{user_id}/reset-password")
def admin_reset_password(
    user_id: int, 
    db: Session = Depends(database.get_db), 
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    temp_password = "Hyrox" + str(uuid.uuid4())[:8]
    user.password_hash = auth.get_password_hash(temp_password)
    db.commit()
    
    return {"message": "Password reset successful", "temporary_password": temp_password}

@api_router.post("/recovery/logs", response_model=schemas.RecoveryLogResponse)
def create_recovery_log(log: schemas.RecoveryLogCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_log = models.RecoveryLog(
        user_id=current_user.id,
        intensity=log.intensity,
        protocol_name=log.protocol_name,
        duration_minutes=log.duration_minutes
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

@api_router.get("/recovery/logs/me", response_model=List[schemas.RecoveryLogResponse])
def read_my_recovery_logs(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    logs = db.query(models.RecoveryLog).filter(models.RecoveryLog.user_id == current_user.id).order_by(models.RecoveryLog.created_at.desc()).all()
    return logs

@api_router.post("/users/upgrade")
def upgrade_user(request: auth.UpgradeRequest, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    if request.new_role not in ["pro", "coach"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    current_user.role = request.new_role
    db.commit()
    return {"message": f"Successfully upgraded to {request.new_role}", "role": request.new_role}

# Include the API router
app.include_router(api_router)

# --- FRONTEND SERVING & DEFINITIVE SPA FALLBACK ---
# O Docker coloca o frontend em /app/static
STATIC_PATH = "/app/static"

# 1. Montar assets se a pasta existir
if os.path.exists(os.path.join(STATIC_PATH, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_PATH, "assets")), name="assets")

# 2. Rota Catch-all (SPA Fallback)
@app.get("/{catchall:path}")
async def serve_frontend(catchall: str):
    # Se for um pedido para a API que não existe, mantém o 404 de API
    if catchall.startswith("api/"):
        return {"detail": "Not Found"}

    # Tenta servir ficheiros reais (favicon, etc)
    full_path = os.path.join(STATIC_PATH, catchall)
    if os.path.exists(full_path) and os.path.isfile(full_path):
        return FileResponse(full_path)

    # Serve o index.html para QUALQUER outra rota (ex: /dashboard)
    # Isto permite que o React/Vue trate do roteamento
    index_file = os.path.join(STATIC_PATH, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    
    return {"detail": "Frontend assets not found"}
