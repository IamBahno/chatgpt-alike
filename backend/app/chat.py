import tiktoken
import os
import json
from fastapi import FastAPI, HTTPException, APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi.responses import StreamingResponse
from sse_starlette.sse import EventSourceResponse
from openai import OpenAI
from dotenv import load_dotenv
from .schemas import ChatRequest,ChatResponse,ChatsListResponse, ChatListItem, Options, ChatResponse, PromptRequest, FirstPromptRequest, ModelsResponce,LLModel
from .database import get_db
from .models import User, Chat, ChatOption, ConversationEntry
from .auth import get_current_user_or_none, get_current_user
from .converters import chat_model_to_chat_schema

router = APIRouter()
load_dotenv()


DEFAULT_OPTIONS = {
    "use_history":True,
    "llm_model":"gpt-3.5-turbo",
    "history_type":"last_tokens",  #predefined string
    "n_last_tokens":2000, # for the n last tokens
    "n_best_tokens":2000 # for the n best responses
    }


#TODO oddelat zarazku
#TODO otestovat, kdyz ma user token
#TODO otestovat, kdyz ma user token a ma ulozeny chaty
@router.get("/chats")
async def get_all_chats(db: Session = Depends(get_db),
                        user: User|None = Depends(get_current_user_or_none)) -> ChatsListResponse:
    if(user == None):
        return ChatsListResponse(chats=[])
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

#TODO otestovat (vubec jsem netestoval)
@router.get("/chat")
async def get_chats(chat_request: ChatRequest,db: Session = Depends(get_db),user: User = Depends(get_current_user)) -> ChatResponse:
    chat_model = db.query(Chat).filter(Chat.id == chat_request.id).one()
    chat_schema = chat_model_to_chat_schema(chat_model)
    return chat_schema

#TODO komplet
def save_chat_entry(chat : Chat,user_prompt: str, user_prompt_tokens:int, ai_response: str, ai_response_tokens: int, cost: float):
    # Implement your database save logic here
    # For example, create a new conversation entry or message record
    db_session = Session()  # Get your DB session here
    try:
        # new_entry = ConversationEntry(text=full_response, tokens=token_count, cost=cost)
        print("ukldam dummy do db")
        new_entry = ConversationEntry()
        db_session.add(new_entry)
        db_session.commit()
    except Exception as e:
        db_session.rollback()
        print(f"Error saving to DB: {e}")
    finally:
        db_session.close()

# mel by fungovat pro prvni request i pro nasledujici
# #TODO pridat ten historickej context
# TODO pridat count vypocet
# TODO samozrejme otestovat
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
    save_chat_entry(chat=Chat,user_prompt=prompt,user_prompt_tokens=input_token_count,ai_response=full_response,ai_response_tokens=tokens_generated_count,cost=cost)  # Save after streaming

# TODO otestovat
# TODO umazat database transakce jak pudou
# TODO dodelat generator funkci
@router.post("/first_message")
async def respond_to_first_message(promt_request: FirstPromptRequest,db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.api_key in [None,""]:
        print("user nema api key")
        raise
    
    # dostanu user model
    # user = db.query(User).filter(User.id == user.id).first()
    user = db.merge(user)

    # vytvorim chat model
    chat = Chat(owner = user)
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
    model1 = LLModel(name="gpt-3",displayName="GPT-3",context_limit=4000,input_tokens_price = 0.5, output_tokens_price = 0.4 )
    model2 = LLModel(name="gpt-4o",displayName="GPT-4o",context_limit=8000,input_tokens_price = 0.5, output_tokens_price = 0.4 )
    model3 = LLModel(name="gpt-davici3",displayName="Davici-3",context_limit=4000,input_tokens_price = 0.5, output_tokens_price = 0.4 )
    return ModelsResponce(models = [model1,model2,model3])