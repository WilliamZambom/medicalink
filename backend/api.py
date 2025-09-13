from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from schemas import ChatMessage, ChatResponse, ChatHistory
from services.openai_service import OpenAIService
from db import get_db
from models import ChatSession, Message
from typing import List
import json
from datetime import datetime

router = APIRouter()

@router.post("/ask", response_model=ChatResponse)
async def ask_question(
    message: ChatMessage,
    db: Session = Depends(get_db)
):
    """
    Endpoint principal para fazer perguntas ao chatbot médico
    """
    try:
        # Criar nova sessão se não existir
        if not message.session_id:
            session = ChatSession()
            db.add(session)
            db.commit()
            db.refresh(session)
            session_id = session.id
        else:
            session_id = message.session_id
            session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
            if not session:
                raise HTTPException(status_code=404, detail="Sessão não encontrada")

        # Salvar mensagem do usuário
        user_message = Message(
            session_id=session_id,
            content=message.message,
            role="user",
            timestamp=datetime.utcnow()
        )
        db.add(user_message)

        # Obter resposta da OpenAI
        openai_service = OpenAIService()
        response_text = await openai_service.get_medical_response(message.message)

        # Salvar resposta do assistente
        assistant_message = Message(
            session_id=session_id,
            content=response_text,
            role="assistant",
            timestamp=datetime.utcnow()
        )
        db.add(assistant_message)
        db.commit()

        return ChatResponse(
            response=response_text,
            session_id=session_id,
            timestamp=datetime.utcnow().isoformat()
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

@router.get("/history/{session_id}", response_model=List[ChatHistory])
async def get_chat_history(session_id: int, db: Session = Depends(get_db)):
    """
    Obter histórico de conversa de uma sessão
    """
    messages = db.query(Message).filter(
        Message.session_id == session_id
    ).order_by(Message.timestamp).all()

    return [
        ChatHistory(
            id=msg.id,
            content=msg.content,
            role=msg.role,
            timestamp=msg.timestamp.isoformat()
        )
        for msg in messages
    ]

@router.get("/sessions")
async def get_sessions(db: Session = Depends(get_db)):
    """
    Listar todas as sessões de chat
    """
    sessions = db.query(ChatSession).order_by(ChatSession.created_at.desc()).all()
    return [
        {
            "id": session.id,
            "created_at": session.created_at.isoformat(),
            "message_count": len(session.messages)
        }
        for session in sessions
    ]

@router.delete("/sessions/{session_id}")
async def delete_session(session_id: int, db: Session = Depends(get_db)):
    """
    Deletar uma sessão de chat
    """
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    
    # Deletar mensagens associadas
    db.query(Message).filter(Message.session_id == session_id).delete()
    db.delete(session)
    db.commit()
    
    return {"message": "Sessão deletada com sucesso"}

@router.get("/export/{session_id}")
async def export_chat(session_id: int, db: Session = Depends(get_db)):
    """
    Exportar conversa em formato JSON
    """
    messages = db.query(Message).filter(
        Message.session_id == session_id
    ).order_by(Message.timestamp).all()

    if not messages:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")

    export_data = {
        "session_id": session_id,
        "exported_at": datetime.utcnow().isoformat(),
        "messages": [
            {
                "role": msg.role,
                "content": msg.content,
                "timestamp": msg.timestamp.isoformat()
            }
            for msg in messages
        ]
    }

    return export_data
