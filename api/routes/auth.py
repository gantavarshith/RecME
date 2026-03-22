from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from api.models.user_model import UserCreate, UserOut, UserInDB, UserUpdate
from api.core.security import get_password_hash, verify_password, create_access_token
from api.dependencies import get_db, get_current_user
from google.oauth2 import id_token
from google.auth.transport import requests
import os
from datetime import datetime

import logging

logger = logging.getLogger(__name__)
router = APIRouter()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")

@router.post("/signup", response_model=UserOut)
async def signup(user_in: UserCreate, db = Depends(get_db)):
    print(f"DEBUG: signup called for {user_in.email}")
    logger.info(f"Attempting signup for email: {user_in.email}")
    # Check if user already exists
    print("DEBUG: Checking if user exists...")
    existing_user = await db.users.find_one({"email": user_in.email})
    print(f"DEBUG: existing_user result: {existing_user}")
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User with this email already exists"
        )
    
    # Hash password and create user
    hashed_pass = get_password_hash(user_in.password) if user_in.password else None
    user_db = UserInDB(
        **user_in.dict(exclude={"password"}),
        hashed_password=hashed_pass
    )
    
    await db.users.insert_one(user_db.dict())
    return UserOut(**user_db.dict())

@router.post("/login")
async def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends(), db = Depends(get_db)):
    logger.info(f"Attempting login for email: {form_data.username}")
    user = await db.users.find_one({"email": form_data.username})
    if not user or not user.get("hashed_password") or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(subject=user["id"])
    
    # Store in HTTP-only cookie as preferred by user
    response.set_cookie(
        key="access_token", 
        value=f"Bearer {access_token}", 
        httponly=True, 
        max_age=60*60*24*7, # 7 days
        samesite="lax"
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": UserOut(**user)
    }

@router.post("/google")
async def google_auth(response: Response, data: dict, db = Depends(get_db)):
    token = data.get("token")
    if not token:
        raise HTTPException(status_code=400, detail="Missing Google token")
    
    try:
        # Verify Google token
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
        
        email = idinfo['email']
        name = idinfo.get('name', email.split('@')[0])
        
        # Create user if not exists
        user = await db.users.find_one({"email": email})
        if not user:
            user_db = UserInDB(
                name=name,
                email=email,
                auth_provider="google"
            )
            await db.users.insert_one(user_db.dict())
            user = await db.users.find_one({"email": email})
        
        access_token = create_access_token(subject=user["id"])
        
        response.set_cookie(
            key="access_token", 
            value=f"Bearer {access_token}", 
            httponly=True, 
            max_age=60*60*24*7,
            samesite="lax"
        )
        
        return {
            "access_token": access_token, 
            "token_type": "bearer",
            "user": UserOut(**user)
        }
        
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Google token")

@router.get("/me", response_model=UserOut)
async def get_me(current_user: UserOut = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserOut)
async def update_profile(
    data: UserUpdate,
    current_user: UserOut = Depends(get_current_user),
    db = Depends(get_db)
):
    """Update the authenticated user's name."""
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"name": data.name}}
    )
    updated = await db.users.find_one({"id": current_user.id})
    return UserOut(**updated)

@router.delete("/account")
async def delete_account(
    response: Response,
    current_user: UserOut = Depends(get_current_user),
    db = Depends(get_db)
):
    """Permanently delete the user account and all associated data."""
    uid = current_user.id
    await db.users.delete_one({"id": uid})
    await db.watchlist.delete_many({"user_id": uid})
    await db.watched.delete_many({"user_id": uid})
    response.delete_cookie("access_token")
    return {"message": "Account deleted successfully"}

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logged out successfully"}
