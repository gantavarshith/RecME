import traceback
from passlib.context import CryptContext
try:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    pwd_context.hash("pass")
except Exception as e:
    with open("error.log", "w") as f:
        traceback.print_exc(file=f)
