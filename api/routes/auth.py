import logging
import os
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from google.oauth2 import id_token
from google.auth.transport import requests

from api.models.user_model import UserCreate, UserOut, UserInDB, UserUpdate
from api.core.security import get_password_hash, verify_password, create_access_token
from api.dependencies import get_db, get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")

@router.post("/signup", response_model=UserOut)
async def signup(user_in: UserCreate, db = Depends(get_db)):
    logger.info("Signup attempt for email: %s", user_in.email)
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_in.email})
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
    logger.info("User created successfully: %s", user_in.email)
    return UserOut(**user_db.dict())

@router.post("/login")
async def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends(), db = Depends(get_db)):
    logger.info("Login attempt for email: %s", form_data.username)
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

    logger.info("Login successful for user: %s", form_data.username)
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
            logger.info("New Google user created: %s", email)

        access_token = create_access_token(subject=user["id"])

        response.set_cookie(
            key="access_token",
            value=f"Bearer {access_token}",
            httponly=True,
            max_age=60*60*24*7,
            samesite="lax"
        )

        logger.info("Google auth successful for: %s", email)
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
    await db.not_interested.delete_many({"user_id": uid})
    response.delete_cookie("access_token")
    logger.info("Account deleted for user: %s", uid)
    return {"message": "Account deleted successfully"}

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logged out successfully"}

@router.get("/stats")
async def get_stats(
    current_user: UserOut = Depends(get_current_user),
    db = Depends(get_db)
):
    """Calculate user analytics based on watched history."""
    # FETCH: Strictly user-specific data from 'watched' collection
    watched_cursor = db.watched.find({"user_id": current_user.id})
    watched = await watched_cursor.to_list(length=1000)

    logger.debug("Calculating stats for user %s (%s): %d films.", current_user.email, current_user.id, len(watched))

    genre_counts = {}

    for entry in watched:
        movie_data = entry.get("movie_data", {})

        # Flattened Genre Calculation (surgical)
        raw_genres = movie_data.get("genres") or []

        # Ensure we always process as a flat list
        if isinstance(raw_genres, (str, dict)):
            raw_genres = [raw_genres]

        for g in raw_genres:
            # Handle recursive lists or TMDB objects
            if isinstance(g, list):
                # Flatten one level deep
                for sub_g in g:
                    name = sub_g if isinstance(sub_g, str) else sub_g.get("name", "") if isinstance(sub_g, dict) else ""
                    if name:
                        norm = name.strip().title()
                        genre_counts[norm] = genre_counts.get(norm, 0) + 1
            else:
                name = g if isinstance(g, str) else g.get("name", "") if isinstance(g, dict) else ""
                if name:
                    norm = name.strip().title()
                    genre_counts[norm] = genre_counts.get(norm, 0) + 1

    # Sort and get top genre
    top_genre = "N/A"
    sorted_genres = sorted(genre_counts.items(), key=lambda x: x[1], reverse=True)
    if sorted_genres:
        top_genre = sorted_genres[0][0]

    return {
        "top_genre": top_genre,
        "watched_count": len(watched),
        "genre_distribution": dict(sorted_genres[:5])
    }
