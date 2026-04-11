from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
import uuid

class UserBase(BaseModel):
    name: str
    email: EmailStr
    auth_provider: str = "local"  # "local" or "google"

class UserCreate(UserBase):
    password: Optional[str] = None

class UserInDB(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    hashed_password: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserOut(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: str
