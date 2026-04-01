from fastapi import APIRouter

import session_state
from ai.chat_orchestrator import reset_conversation

router = APIRouter(tags=["system"])


@router.get("/health")
def health():
    return {"status": "healthy"}


@router.post("/reset")
def reset():
    reset_conversation()
    session_state.reset()
    return {"message": "Conversation reset", "status": "success"}