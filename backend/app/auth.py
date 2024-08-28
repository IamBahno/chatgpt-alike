from fastapi import FastAPI, Depends, HTTPException, status, APIRouter, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from .database import get_db
from .schemas import GeneralResponse, SetKeyRequest, RegisterRequest, LoginRequest
from sqlalchemy.orm import Session
from .models import User as UserModel
from sqlalchemy.exc import NoResultFound,IntegrityError 
import bcrypt
import os

router = APIRouter()

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
JWT_REFRESH_SECRET_KEY = 'JWT_REFRESH_SECRET_KEY'
REFRESH_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 password flow for token generation
# if used as depends, it will check if 
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# In-memory user "database" for demonstration purposes
fake_users_db = {
    "johndoe": {
        "username": "johndoe",
        "full_name": "John Doe",
        "email": "johndoe@example.com",
        "hashed_password": pwd_context.hash("password"),
        "disabled": False,
    },
    "api_key_test": {
        "username": "lopata",
        "full_name": "Lop Doe",
        "email": "johndoe@example.com",
        "hashed_password": pwd_context.hash("password"),
        "disabled": False,
    }
}


# Pydantic models
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None
    api_key: str | None = None

class User(BaseModel):
    username: str | None = None



def get_user_by_username(db, username: str,exception=NoResultFound):
    try:
        user = db.query(UserModel).filter(UserModel.username == username).one()
        return user
    except NoResultFound:
        raise exception

def get_user(db, id: int,exception=NoResultFound):
    try:
        user = db.query(UserModel).filter(UserModel.id == id).one()
        return user
    except NoResultFound:
        raise exception

def authenticate_user(db, username: str, password: str):
    try:
        user = get_user_by_username(db, username)
    except NoResultFound:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta if expires_delta else datetime.utcnow() + timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_REFRESH_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme),db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub",None)
        user_id: str = payload.get("user_id",None)
        if (username is None or username == "") and user_id is None:
            raise credentials_exception
        if user_id is None:
            raise credentials_exception
        user = get_user(db, id=user_id,exception=NoResultFound)
    except JWTError:
        raise credentials_exception
    except:
        raise credentials_exception
    if user is None:
        raise credentials_exception
    return user

async def get_current_user_or_create_one(request: Request,db: Session = Depends(get_db)):
    auth_header = request.headers.get("Authorization")
    token = None

    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]

    if token:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            username: str = payload.get("sub",None)
            user_id: str = payload.get("user_id",None)
            if (username is None or username == "") and user_id is None:
                raise JWTError 
            try:
                user = get_user(db, id=user_id,exception=NoResultFound)
                print("get old user by id")
            except NoResultFound:
                user = UserModel()
                print("generate new user, no user with id found in jwt")
        except JWTError: #didnt send valid jwt token
            print("create empty user")
            user =  UserModel()
    else:
        print("no token provided")
        user =  UserModel()
    return user

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Check if the hashed password matches the plain password
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def hash_password(password: str) -> str:
    # Generate a salt and hash the password
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed_password.decode('utf-8')  # Convert back to string for storage

#just for showcase at this point
@router.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(),db: Session = Depends(get_db)):
# async def login(form_data: LoginRequest,db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username,"user_id":user.id}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(
        data={"sub": user.username if user.username else "","user_id": user.id})
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@router.post("/register", response_model=Token)
async def register(register_data: RegisterRequest,db: Session = Depends(get_db)):
    if register_data.password != register_data.password_again:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match."
        )
    try:
        user = UserModel(hashed_password=hash_password(register_data.password),
                         username=register_data.username,
                         is_registered=True)
        db.add(user)
        db.commit()
        db.refresh(user)
    except IntegrityError as e:
        raise HTTPException(status_code=400, detail="Username already exists.")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username,"user_id":user.id}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(
        data={"sub": user.username,"user_id":user.id})
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

    
@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(refresh_token, JWT_REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_id: str = payload.get("user_id")
        if username is None or user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token.")
        user = get_user(db, id=user_id, exception=NoResultFound)
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found.")
        
        # Generate new access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(data={"sub": user.username, "user_id": user.id}, expires_delta=access_token_expires)
        new_refresh_token = create_refresh_token(data={"sub": user.username, "user_id": user.id})

        return {"access_token": access_token, "refresh_token": new_refresh_token, "token_type": "bearer"}
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate refresh token.")


#TODO dodelat funkcnost aby to mohl posilat i loglej user(mozna funguje tezko se testuje)
#TODO obcas user bez tokenu posle, kterej uz mel nekdo jinej(treba on), a vytvori se novej user se stejnym api_key, co udela uniquenest constraint
# if user is logged in update his api key and return token
# if user is not logged in create empty user with api key and return token
# if is not logged in but already gave api_key, update his model and return token 
@router.post("/api_key",response_model=Token)
async def set_api_key(set_key_request:SetKeyRequest,db: Session = Depends(get_db),
                      current_user: UserModel = Depends(get_current_user_or_create_one)):
    current_user.api_key = set_key_request.api_key
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": current_user.username if current_user.username else "","user_id":current_user.id}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(
        data={"sub": current_user.username if current_user.username else "","user_id":current_user.id})
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

