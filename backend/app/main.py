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
from app import api


models.Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app.include_router(api.router, tags=['Notes'], prefix='')