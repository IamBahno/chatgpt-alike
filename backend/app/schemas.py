from pydantic import BaseModel
from typing import List
from datetime import datetime

class Options(BaseModel):
    use_history : bool
    llm_model : str
    history_type : str #predefined string
    n_last_tokens : int # for the n last tokens
    n_best_tokens : int # for the n best responses

class FirstPromptRequest(BaseModel):
    prompt : str
    options : Options
# cannot define responce, since the response is streaming

class PromptRequest(BaseModel):
    chat_id : int
    prompt : str
    options : Options

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    password: str
    password_again: str

class SetKeyRequest(BaseModel):
    api_key: str

class ChatListItem(BaseModel):
    title : str
    id : int

class ChatsListRequest(BaseModel):
    pass

class ChatsListResponse(BaseModel):
    chats : List[ChatListItem]    

class ChatRequest(BaseModel):
    chat_id : int

class ConversationEntry(BaseModel):
    user_prompt : str
    ai_response : str 
    cost : float
    time : datetime

class ChatResponse(BaseModel):
    options : Options 
    conversation_entries: List[ConversationEntry]

class GeneralResponse(BaseModel):
    succes : bool
    message : str

class LLModel(BaseModel):
    name : str
    displayName : str
    context_limt : int
    input_tokens_price : float
    output_tokens_price : float


class ModelsResponce(BaseModel):
    models : List[LLModel]

class User(BaseModel):
    username : str|None
    is_registered : bool
    api_key : str|None

class RefreshRequest(BaseModel):
    refresh_token : str