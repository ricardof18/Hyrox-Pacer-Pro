from pydantic import BaseModel, EmailStr
from typing import Optional, List
from .models import HyroxCategory, UserRole
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    age: Optional[int] = None
    categoria_hyrox: HyroxCategory = HyroxCategory.OPEN
    role: UserRole = UserRole.USER
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    
    class Config:
        from_attributes = True

class AdminUserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    categoria_hyrox: Optional[HyroxCategory] = None
    is_active: Optional[bool] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    user_name: Optional[str] = None
    user_role: Optional[str] = None
    user_email: Optional[str] = None

class SimulationBase(BaseModel):
    tempo_alvo: str
    json_resultados: dict

class SimulationCreate(SimulationBase):
    categoria_hyrox: Optional[str] = None
    preferred_run_pace: Optional[str] = None

class SimulationResponse(SimulationBase):
    id: int
    user_id: int
    created_at: datetime
    share_token: Optional[str] = None

    class Config:
        from_attributes = True

class PacerRequest(BaseModel):
    tempo_alvo: str
    categoria_hyrox: str
    preferred_run_pace: Optional[str] = None
    roxzone_minutes: Optional[float] = None
    is_elite: bool = False
    athlete_level: str = "Competitivo"


class RecoveryLogBase(BaseModel):
    intensity: int
    protocol_name: str
    duration_minutes: int

class RecoveryLogCreate(RecoveryLogBase):
    pass

class RecoveryLogResponse(RecoveryLogBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

