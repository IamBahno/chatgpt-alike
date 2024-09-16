import tiktoken
import os
import json
import numpy as np
from fastapi import FastAPI, HTTPException, APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi.responses import StreamingResponse
from sse_starlette.sse import EventSourceResponse
from openai import OpenAI
from dotenv import load_dotenv
from .schemas import ChatRequest,ChatResponse,ChatsListResponse, ChatListItem, Options, ChatResponse, PromptRequest, FirstPromptRequest, ModelsResponce,LLModel
from .database import get_db
from .models import User, Chat, ChatOption, ConversationEntry, Message
from .auth import get_current_user_or_none, get_current_user
from .converters import chat_model_to_chat_schema

router = APIRouter()
load_dotenv()

N_BEST_TOKENS_TYPE = "N_BEST_TOKENS"
N_LAST_TOKENS_TYPE = "N_LAST_TOKENS"

DEFAULT_OPTIONS = {
    "use_history":True,
    "llm_model":"gpt-3.5-turbo",
    "history_type":N_BEST_TOKENS_TYPE,  #predefined string
    "n_last_tokens":2000, # for the n last tokens
    "n_best_tokens":2000 # for the n best responses
    }


@router.get("/chats")
async def get_all_chats(db: Session = Depends(get_db),
                        user: User|None = Depends(get_current_user_or_none)) -> ChatsListResponse:
    if(user == None):
        return ChatsListResponse(chats=[])

    chats = db.query(Chat).filter(Chat.owner_id == user.id).all()
    chat_schemas = [ChatListItem(id=chat.id, title=chat.title) for chat in chats]
    return ChatsListResponse(chats=chat_schemas)
    


#returns just empty chat for initial rendering, no CRUD operations here
@router.get("/empty_chat")
async def get_empty_chat(db: Session = Depends(get_db)) -> ChatResponse:
    options = Options(**DEFAULT_OPTIONS)
    chat = ChatResponse(options=options,conversation_entries=[])
    return chat

@router.get("/chat")
async def get_chats(chat_request: ChatRequest = Depends(),db: Session = Depends(get_db),user: User = Depends(get_current_user)) -> ChatResponse:
    chat_model = db.query(Chat).filter(Chat.id == chat_request.chat_id).one()
    chat_schema = chat_model_to_chat_schema(chat_model)
    return chat_schema

def generate_chat_title(prompt:str,user : User):
    client = OpenAI(api_key = user.api_key)
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[ {"role": "system", "content": "You are a tool used to generate name of chat, based on user prompt. Return only the name of the chat. Dont put any quotes around the name or anything. And try to make it max 4 words long."},
                  {"role": "user", "content": prompt}],
        temperature=0.0,
    )
    return response.choices[0].message.content    

#TODO vektory
def save_chat_entry(chat : Chat,user_prompt: str, user_prompt_tokens:int, ai_response: str, ai_response_tokens: int, cost: float, embedding: bytes,db : Session):
    try:
        user_message = Message(
            text = user_prompt,
            tokens = user_prompt_tokens
        )
        ai_message = Message(
            text = ai_response,
            tokens = ai_response_tokens
        )
        conversation_entry = ConversationEntry(
            tokens = user_prompt_tokens + ai_response_tokens,
            cost = cost,
            user_prompt = user_message,
            ai_response = ai_message,
            chat = chat,
            embedding = embedding
        )
        db.add(conversation_entry)
        db.commit()
        print("ukldam entry do db")
    except Exception as e:
        db.rollback()
        print(f"Error saving to DB: {e}")

def generate_vector(prompt,response,user):
    client = OpenAI(api_key=user.api_key)
    embedding = client.embeddings.create(input=[f"{prompt};{response}"],model = "text-embedding-3-small").data[0].embedding
    np_embedding = np.array(embedding, dtype=np.float32)
    return np_embedding


# mel by fungovat pro prvni request i pro nasledujici
# TODO pridat instrukce
# #TODO pridat ten historickej context
# TODO pridat count vypocet
# TODO vectory
def get_openai_generator(prompt: str, options: ChatOption, chat: Chat,user:User,db: Session):
    client = OpenAI(api_key = user.api_key)
    openai_stream = client.chat.completions.create(
        model=options.llm_model,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.0,
        stream=True
    )
    encoding = tiktoken.encoding_for_model("gpt-3.5-turbo")
    full_response = ""  # To store the full response
    # Stream response from OpenAI
    for event in openai_stream:
        if event.choices[0].delta.content:
            current_response = event.choices[0].delta.content
            full_response += current_response  # Append to full response
            yield json.dumps({"type": "message", "data": current_response})  # Stream each piece of content

    # After streaming all data, send the final summary
    tokens_generated_count = len(encoding.encode(full_response))
    input_token_count = len(encoding.encode(prompt))
    cost = 0.0  # Example cost calculation
    yield json.dumps({"type": "final", "data": {"cost": cost, "chat_id": chat.id, "chat_title":chat.title}})

    # Perform post-processing, such as saving to the database

    embedding = generate_vector(prompt,full_response,user)
    embedding_bytes = embedding.tobytes()

    save_chat_entry(chat=chat,
                    user_prompt=prompt,
                    user_prompt_tokens=input_token_count,
                    ai_response=full_response,
                    ai_response_tokens=tokens_generated_count,
                    cost=cost,
                    db = db,
                    embedding=embedding_bytes)  # Save after streaming

# TODO umazat database transakce jak pudou
# TODO do budoucna dodelat ze se jmeno bude generovat pararelne/asynchrone
# TODO dodelat handling kdyz to selze
@router.post("/first_message")
async def respond_to_first_message(promt_request: FirstPromptRequest,db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.api_key in [None,""]:
        print("user nema api key")
        raise
    
    # dostanu user model
    user = db.merge(user)

    chat_title = generate_chat_title(promt_request.prompt,user)

    # vytvorim chat model
    chat = Chat(owner = user,title = chat_title)
    db.add(chat)
    db.commit()
    db.refresh(chat)

    # vytvorim chatoptions model
    chat_options = ChatOption(**promt_request.options.dict(), chat_id=chat.id)
    db.add(chat_options)
    db.commit()
    db.refresh(chat_options)


    # odstreamuju odpoved
    async def event_generator():
        generator = get_openai_generator(promt_request.prompt,promt_request.options,chat,user,db)
        for event in generator:
            print(f"data: {event}\n\n")
            yield f"data: {event}\n\n"
    
    return EventSourceResponse(event_generator())

# check if the options given by user differ to the options in db, if so updatet them
def check_update_options(db, options_schema : Options, options_model: ChatOption) -> ChatOption:
    is_updated = False
    user_options_dict = options_schema.dict()
    for key, value in user_options_dict.items():
        if getattr(options_model, key) != value:  # If any value differs
            setattr(options_model, key, value)  # Update the value
            is_updated = True
    if is_updated:
        db.add(options_model)
        db.commit()
        db.refresh(options_model)

    return options_model

# TODO dodelat handling kdyz to selze
@router.post("/message")
async def respond_to_message(promt_request: PromptRequest,db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.api_key in [None,""]:
        print("user nema api key")
        raise

    #vytahnu si chat
    chat = db.query(Chat).filter(Chat.id == promt_request.chat_id).first()
    # pokud zmeni chat options tak je prepisu a ulozim
    chat_options = check_update_options(db, promt_request.options,chat.option)
    # odstreamuju odpoved
    async def event_generator():
        generator = get_openai_generator(promt_request.prompt,chat_options,chat,user,db)
        for event in generator:
            print(f"data: {event}\n\n")
            yield f"data: {event}\n\n"
    
    return EventSourceResponse(event_generator())

# TODO
@router.get("/models")
async def models() -> ModelsResponce:
    model1 = LLModel(name="gpt-3.5-turbo",displayName="GPT-3",context_limit=4000,input_tokens_price = 0.5, output_tokens_price = 0.4 )
    model2 = LLModel(name="gpt-4",displayName="GPT-4",context_limit=8000,input_tokens_price = 0.5, output_tokens_price = 0.4 )
    model3 = LLModel(name="gpt-davici3",displayName="Davici-3",context_limit=4000,input_tokens_price = 0.5, output_tokens_price = 0.4 )
    return ModelsResponce(models = [model1,model2,model3])