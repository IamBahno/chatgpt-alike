from pydantic import BaseModel
from typing import List
from datetime import datetime

class Options(BaseModel):
    ai_model : str
    use_history : bool
    llm_model : str
    history_type : str #predefined string
    n_last_tokens : int # for the n last tokens
    n_best_tokens : int # for the n best responses

class PromptRequest(BaseModel):
    prompt : str
    options : Options
# cannot define responce, since the response is streaming


# class LoginRequest(BaseModel):
#     username: str
#     password: str

class RegisterRequest(BaseModel):
    username: str
    password: str

class SetKeyRequest(BaseModel):
    api_key: str

class ChatListItem(BaseModel):
    name : str
    id : int

class ChatsListRequest(BaseModel):
    pass

class ChatsListResponse(BaseModel):
    chats : List[ChatListItem]    

class ChatRequest(BaseModel):
    id : int

class ConversationEntry(BaseModel):
    user_prompt : str
    ai_response : str 
    cost : float
    time : datetime

class ChatResponse(BaseModel):
    options : Options 
    conversetion_entries: List[ConversationEntry]

class GeneralResponse(BaseModel):
    succes : bool
    message : str
