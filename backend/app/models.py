from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Text, LargeBinary, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String, unique = True)
    hashed_password = Column(String)
    api_key = Column(String, unique = True)
    is_registered = Column(Boolean)

    chats = relationship("Chat", back_populates="owner")


class ChatOption(Base):
    __tablename__ = 'chat_options'
    id = Column(Integer, primary_key=True, autoincrement=True)
    use_history = Column(Boolean)  # If use the history context
    llm_model = Column(String)
    history_type = Column(String) #last_tokens, n_best_responses
    n_last_tokens = Column(Integer) # for the n last tokens
    n_best_tokens = Column(Integer) # for the n best responses

    # Foreign key to the Chat table
    chat_id = Column(Integer, ForeignKey('chats.id'), nullable=False)    
    chat = relationship("Chat",back_populates="option")


class Chat(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String)

    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="chats")

    # One-to-one relationship with ChatOption
    option = relationship('ChatOption', uselist=False, back_populates='chat')

    conversation_entries = relationship("ConversationEntry", back_populates="chat")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    text = Column(Text)
    tokens = Column(Integer)

    conversation_entry_id = Column(Integer, ForeignKey("conversation_entries.id",ondelete="CASCADE"))

# stores the question the response and the context send with the question
class ConversationEntry(Base):
    __tablename__ = 'conversation_entries'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=func.now(), nullable=False)  # Timestamp of when the message was created
    vector = Column(LargeBinary) # Vector that represent the Entry
    tokens = Column(Integer)
    cost = Column(Float) # in dollars


 # Foreign keys for the user and AI messages
    user_message_id = Column(Integer, ForeignKey('messages.id'))
    ai_message_id = Column(Integer, ForeignKey('messages.id'))

    # Relationships to user and AI messages
    user_prompt = relationship('Message', foreign_keys=[user_message_id], backref='user_conversation_entry')
    ai_response = relationship('Message', foreign_keys=[ai_message_id], backref='ai_conversation_entry')


    # with chat
    chat_id = Column(Integer, ForeignKey('chats.id'))
    chat = relationship("Chat", back_populates="conversation_entries")

    # user_prompt = relationship('Message',uselist=False, backref = "conversation_entry")
    # ai_response = relationship('Message',uselist=False, backref = "conversation_entry")