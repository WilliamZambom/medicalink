from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ChatMessage(BaseModel):
    """
    Schema para mensagem de entrada do usuário
    """
    message: str = Field(..., description="Pergunta do usuário")
    session_id: Optional[int] = Field(None, description="ID da sessão (opcional)")

class ChatResponse(BaseModel):
    """
    Schema para resposta do chatbot
    """
    response: str = Field(..., description="Resposta do assistente")
    session_id: int = Field(..., description="ID da sessão")
    timestamp: str = Field(..., description="Timestamp da resposta")

class ChatHistory(BaseModel):
    """
    Schema para histórico de mensagens
    """
    id: int
    content: str
    role: str  # 'user' ou 'assistant'
    timestamp: str

class SessionInfo(BaseModel):
    """
    Schema para informações da sessão
    """
    id: int
    created_at: str
    message_count: int

class UserFeedback(BaseModel):
    """
    Schema para feedback do usuário
    """
    message_id: int
    rating: int = Field(..., ge=1, le=5, description="Avaliação de 1 a 5 estrelas")
    comment: Optional[str] = Field(None, description="Comentário opcional")

class ExportData(BaseModel):
    """
    Schema para dados de exportação
    """
    session_id: int
    exported_at: str
    messages: List[dict]

class HealthCheck(BaseModel):
    """
    Schema para verificação de saúde da API
    """
    status: str
    timestamp: str
    database_connected: bool
