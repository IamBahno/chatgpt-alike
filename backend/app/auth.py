from fastapi import FastAPI, Depends, HTTPException, status, APIRouter
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from .database import get_db
from .schemas import GeneralResponse, SetKeyRequest
from sqlalchemy.orm import Session
from .models import User as UserModel
from sqlalchemy.exc import NoResultFound 

router = APIRouter()

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 password flow for token generation
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

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
    email: str | None = None
    full_name: str | None = None
    disabled: bool | None = None

class UserInDB(User):
    hashed_password: str
    api_key: str

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_user_by_username(db, username: str,exception=NoResultFound):
    try:
        user = db.query(UserModel).filter(UserModel.username == username).one()
        return user
    except NoResultFound:
        raise exception
    # return UserInDB(**user_dict)

def get_user_by_api_key(db, api_key: str,exception=NoResultFound):
    try:
        print(f"finding: {api_key}")
        users = db.query(UserModel).all()
        for i in users:
            print(i.id,i.api_key)
        user = db.query(UserModel).filter(UserModel.api_key == api_key).one()
        return user
    except NoResultFound:
        raise exception

def authenticate_user(fake_db, username: str, password: str):
    user = get_user_by_username(fake_db, username)
    if not user:
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

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub",None)
        api_key: str = payload.get("api_key",None)
        if username is None and api_key is None:
            raise credentials_exception
        token_data = TokenData(username=username)
        if username is None:
            user = get_user_by_api_key(fake_users_db, api_key=token_data.api_key)
        else:
            user = get_user_by_username(fake_users_db, username==token_data.username)
    except JWTError:
        raise credentials_exception
    except:
        raise credentials_exception
    if user is None:
        raise credentials_exception
    return user

async def get_current_user_or_create_one(set_key_request:SetKeyRequest,token: str = Depends(oauth2_scheme),db: Session = Depends(get_db),):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub",None)
        api_key: str = payload.get("api_key",None)
        if username is None and api_key is None:
            raise JWTError 
        if username is None or username == "":
            try:
                user = get_user_by_api_key(db, api_key=api_key,exception=NoResultFound)
                print("get old user by old api key")
            except NoResultFound:
                user = UserModel()
                print("generate new user, no user with api key found in jwt")
        else:
            print("2")
            user = get_user_by_username(db, username==username, exception=JWTError)
        # print(user.id)
        # print(user.api_key)
    except JWTError: #didnt send valid jwt token
        print("create empty user")
        user =  UserModel()
    return user


@router.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(),db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username,"api_key":user.api_key}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


#TODO dodelat funkcnost aby to mohl posilat i loglej user
#TODO zkontrolovat jak to funguje kdyz se opakuje api_key
# if user is logged in update his api key and return token
# if user is not logged in create empty user with api key and return key
# if is not logged in but already gave api_key, update his model and return token 
@router.post("/api_key",response_model=Token)
async def set_api_key(set_key_request:SetKeyRequest,db: Session = Depends(get_db),
                      current_user: User = Depends(get_current_user_or_create_one)):
    current_user.api_key = set_key_request.api_key
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": current_user.username if current_user.username else "","api_key":current_user.api_key if current_user.api_key else ""}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
