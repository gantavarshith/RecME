import logging

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from bson.objectid import ObjectId

from src.config.settings import settings
from api.models.user_model import UserOut

logger = logging.getLogger(__name__)

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)


async def get_db(request: Request):
    return request.app.mongodb


async def get_current_user(request: Request, token: str = Depends(oauth2_scheme), db=Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # If oauth2_scheme didn't find a token in the header, try the cookie
    if not token:
        cookie_token = request.cookies.get("access_token")
        if cookie_token and cookie_token.startswith("Bearer "):
            token = cookie_token.replace("Bearer ", "")

    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            logger.warning("Token payload missing 'sub' claim. Payload keys: %s", list(payload.keys()))
            raise credentials_exception
    except JWTError as e:
        logger.warning("JWT decode failed: %s", e)
        raise credentials_exception

    # Try finding by our custom 'id' field (UUID string)
    user = await db.users.find_one({"id": user_id})

    # Fallback: Try finding by MongoDB's native '_id'
    if user is None:
        try:
            # Try as ObjectId if it looks like one
            if len(user_id) == 24:
                user = await db.users.find_one({"_id": ObjectId(user_id)})

            # Also try as raw string if _id was stored as string
            if user is None:
                user = await db.users.find_one({"_id": user_id})
        except Exception as e:
            logger.warning("Error during fallback user search for '%s': %s", user_id, e)

    if user is None:
        logger.warning("User '%s' not found in MongoDB (searched 'id' and '_id').", user_id)
        raise credentials_exception

    return UserOut(**user)


async def get_current_user_optional(request: Request, db=Depends(get_db)):
    auth_header = request.headers.get("Authorization")
    token = None

    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.replace("Bearer ", "")
    else:
        # Check cookie
        cookie_token = request.cookies.get("access_token")
        if cookie_token and cookie_token.startswith("Bearer "):
            token = cookie_token.replace("Bearer ", "")

    if not token:
        return None

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None

        # Try finding by our custom 'id' field
        user = await db.users.find_one({"id": user_id})

        # Fallback to _id
        if user is None:
            try:
                if len(user_id) == 24:
                    user = await db.users.find_one({"_id": ObjectId(user_id)})
                if user is None:
                    user = await db.users.find_one({"_id": user_id})
            except Exception:
                pass

        if user:
            return UserOut(**user)
    except Exception:
        return None
    return None
