from fastapi import FastAPI, HTTPException
# from fastapi.responses import StreamingResponse
# from openai import OpenAI
# import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from typing import List
from . import models
from .database import SessionLocal, engine
from app import auth
from app import chat

models.Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    # allow_origins=["http://localhost:3000"],  # Update with your frontend URL
    allow_origins=["*"],  # Update with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/")
def root():
    return {"message": "Welcome to FastAPI with SQLAlchemy"}


app.include_router(auth.router, tags=['Notes'], prefix='/auth')
app.include_router(chat.router, tags=['Notes'], prefix='/chat')