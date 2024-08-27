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

#TODO
@app.post("/store_api_key")
async def store_api_key(api_key: APIKey):
    return {"data": api_key}

#TODO
@app.get("/api/models")
async def get_ai_models():
    model1 = {"name":"gpt-3","displayName":"GPT-3","context_limit":4000}
    model2 = {"name":"gpt-4o","displayName":"GPT-4o","context_limit":8000}
    model3 = {"name":"gpt-davici3","displayName":"Davici-3","context_limit":4000}
    models = {"models":[model1,model2,model3]}
    return models

#TODO
@app.get("/api/threads")
async def get_chat_threads():
    model1 = {"name":"gpt-3","displayName":"GPT-3","context_limit":4000}
    model2 = {"name":"gpt-4o","displayName":"GPT-4o","context_limit":8000}
    model3 = {"name":"gpt-davici3","displayName":"Davici-3","context_limit":4000}
    models = {"models":[model1,model2,model3]}
    return models

class LoginCredentials(BaseModel):
    username: str
    password: str


#TODO
@app.post("/api/login")
async def login(credentials: LoginCredentials):
    print(f"username {credentials.username}")
    print(f"password {credentials.password}")
    response = {"success":True,"message":"Loggin, was succesful","api_key":"aaaaa"}
    # response = {"succes":False,"message":"Wrong name or password"}
    return response

class RegisterForm(BaseModel):
    username: str
    password: str

#TODO
@app.post("/api/register")
async def login(register_form: RegisterForm):
    response = {"succes":False,"message":"Username already used"}
    # response = {"succes":True,"message":"Register was succesful"}
    return response


# Root endpoint for testing
@app.get("/")
async def root():
    return {"message": "ChatGPT-like API with FastAPI is running!"}
