from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from src.config.settings import settings
from api.models.user_model import UserOut

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


async def get_db(request: Request):
    return request.app.mongodb


async def get_current_user(token: str = Depends(oauth2_scheme), db=Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            print(f"AUTH DEBUG: Token payload missing 'sub'. Payload keys: {list(payload.keys())}")
            raise credentials_exception
    except JWTError as e:
        print(f"AUTH DEBUG: JWT Decode failed: {e}. Secret starts with: {SECRET_KEY[:4]}...")
        raise credentials_exception

    try:
        user = await db.users.find_one({"id": user_id})
    except Exception as e:
        print(f"AUTH DEBUG: Database error while searching for user '{user_id}': {e}")
        raise credentials_exception

    if user is None:
        print(f"AUTH DEBUG: Token valid, but user '{user_id}' not found in MongoDB.")
        raise credentials_exception

    return UserOut(**user)


async def get_current_user_optional(request: Request, db=Depends(get_db)):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None

    token = auth_header.replace("Bearer ", "")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        user = await db.users.find_one({"id": user_id})
        if user:
            return UserOut(**user)
    except Exception:
        return None
    return None
