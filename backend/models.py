from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class ChatSession(Base):
    """
    Modelo para sessões de chat
    """
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamento com mensagens
    messages = relationship("Message", back_populates="session", cascade="all, delete-orphan")

class Message(Base):
    """
    Modelo para mensagens do chat
    """
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"), nullable=False)
    content = Column(Text, nullable=False)
    role = Column(String(20), nullable=False)  # 'user' ou 'assistant'
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamento com sessão
    session = relationship("ChatSession", back_populates="messages")

class UserFeedback(Base):
    """
    Modelo para feedback dos usuários sobre as respostas
    """
    __tablename__ = "user_feedback"

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("messages.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5 estrelas
    comment = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
