from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from openai import OpenAI
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Initialize FastAPI app
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class Request(BaseModel):
    prompt: str

class APIKey(BaseModel):
    api_key: str

def get_openai_generator(prompt: str):
    openai_stream = client.chat.completions.create(model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.0,
        stream=True)
    for event in openai_stream:
        if event.choices[0].delta.content:
            current_response = event.choices[0].delta.content

            # important format
            yield "data: " + current_response + "\n\n"

@app.post("/stream/sse")
async def stream(request: Request):
    return StreamingResponse(get_openai_generator(request.prompt), media_type='text/event-stream')

@app.post("/store_api_key")
async def store_api_key(api_key: APIKey):
    return {"data": api_key}

# Root endpoint for testing
@app.get("/")
async def root():
    return {"message": "ChatGPT-like API with FastAPI is running!"}
