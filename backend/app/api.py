from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import openai
import os
from dotenv import load_dotenv

# Initialize FastAPI app
app = FastAPI()

load_dotenv()

# Set your OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")


# Pydantic model for request body
class ChatRequest(BaseModel):
    prompt: str
    max_tokens: int = 150
    temperature: float = 0.7

@app.post("/chat/")
async def chat(request: ChatRequest):
    try:
        # Call the OpenAI API
        response = openai.Completion.create(
            engine="text-davinci-003",  # You can use other engines like gpt-3.5-turbo if available
            prompt=request.prompt,
            max_tokens=request.max_tokens,
            temperature=request.temperature
        )
        
        # Extract the response text
        chat_response = response.choices[0].text.strip()
        return {"response": chat_response}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Root endpoint for testing
@app.get("/")
async def root():
    return {"message": "ChatGPT-like API with FastAPI is running!"}
