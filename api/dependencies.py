from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from api.core.security import SECRET_KEY, ALGORITHM
from api.models.user_model import UserOut

_client = None

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

from fastapi import Request

async def get_db(request: Request):
    return request.app.mongodb

async def get_current_user(token: str = Depends(oauth2_scheme), db = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    try:
        user = await db.users.find_one({"id": user_id})
    except Exception as e:
        print(f"DEBUG: database error in get_current_user: {e}")
        raise credentials_exception

    if user is None:
        raise credentials_exception
    return UserOut(**user)
