import logging

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from chat import chat

from .schemas import ChatRequest

logger = logging.getLogger(__name__)

router = APIRouter(tags=["chat"])


@router.post("/chat")
def chat_endpoint(request: ChatRequest):
    try:
        result = chat(request.message)
        return {
            "response": result["text"],
            "tool_data": result["tool_data"],
            "status": "success",
        }
    except Exception:
        logger.exception("Chat endpoint error")
        return JSONResponse(
            status_code=500,
            content={
                "response": "Sorry, something went wrong. Please try again.",
                "tool_data": [],
                "status": "error",
            },
        )
