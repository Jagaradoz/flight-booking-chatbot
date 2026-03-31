from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from chat import chat, reset_conversation
import state

app = FastAPI(title="Flight Booking Chatbot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str


@app.post("/api/chat")
def chat_endpoint(request: ChatRequest):
    try:
        result = chat(request.message)
        return {
            "response": result["text"],
            "tool_data": result["tool_data"],
            "status": "success",
        }
    except Exception as e:
        return {"response": f"Sorry, something went wrong: {str(e)}", "tool_data": [], "status": "error"}


@app.get("/api/health")
def health():
    return {"status": "healthy"}


@app.post("/api/reset")
def reset():
    reset_conversation()
    state.reset()
    return {"message": "Conversation reset", "status": "success"}
