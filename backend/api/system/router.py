from fastapi import APIRouter

import state
from chat import reset_conversation

router = APIRouter(tags=["system"])


@router.get("/health")
def health():
    return {"status": "healthy"}


@router.post("/reset")
def reset():
    reset_conversation()
    state.reset()
    return {"message": "Conversation reset", "status": "success"}
