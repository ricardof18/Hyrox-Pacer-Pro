from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime
import enum

class HyroxCategory(str, enum.Enum):
    OPEN = "Open"
    PRO = "Pro"
    DOUBLES = "Doubles"
    SINGLE_OPEN = "Single Open"
    SINGLE_PRO = "Single Pro"
    DOUBLES_MEN = "Doubles Men"
    DOUBLES_WOMEN = "Doubles Women"
    DOUBLES_PRO = "Doubles Pro"

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"
    PRO = "pro"
    COACH = "coach"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False) # Renamed from hashed_password based on prompt, though common practice is hashed_password. User asked for password_hash.
    full_name = Column(String(255))
    age = Column(Integer)
    categoria_hyrox = Column(Enum(HyroxCategory), default=HyroxCategory.OPEN)
    role = Column(Enum(UserRole), default=UserRole.USER)
    is_active = Column(Boolean, default=True)

    simulations = relationship("Simulation", back_populates="user")

class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    tempo_alvo = Column(String(50)) # stored as string "HH:MM:SS"
    json_resultados = Column(JSON) # Stores the split calculation
    created_at = Column(DateTime, default=datetime.utcnow)
    share_token = Column(String(100), unique=True, index=True, nullable=True)

    user = relationship("User", back_populates="simulations")

class RecoveryLog(Base):
    __tablename__ = "recovery_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    intensity = Column(Integer)
    protocol_name = Column(String(255))
    duration_minutes = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
