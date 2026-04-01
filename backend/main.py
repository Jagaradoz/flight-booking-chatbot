import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator

from chat import append_assistant_message, chat, reset_conversation
import state
from tools.flights import list_flights
from tools.seats import get_seat_map, select_seat
from tools.addons import add_baggage, set_meal_preference
from tools.bookings import create_booking, confirm_booking

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Flight Booking Chatbot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Accept"],
)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=10000)


class SeatMapRequest(BaseModel):
    flight_id: str = Field(..., min_length=1, max_length=20)


class SelectSeatRequest(BaseModel):
    flight_id: str = Field(..., min_length=1, max_length=20)
    seat_id: str = Field(..., min_length=1, max_length=10)


class BaggageRequest(BaseModel):
    checked_bags: int = Field(..., ge=0, le=5)


class MealRequest(BaseModel):
    meal_type: str = Field(..., min_length=1, max_length=50)


class CreateBookingRequest(BaseModel):
    passenger_name: str = Field(..., min_length=1, max_length=200)
    passenger_email: str = Field(..., min_length=1, max_length=320)

    @field_validator("passenger_email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip()
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("Invalid email format")
        return v


def _direct_response(result: dict):
    if "error" in result:
        return JSONResponse(
            status_code=400,
            content={"status": "error", "message": result["error"], **result},
        )
    return {"status": "success", **result}


@app.post("/api/chat")
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
            content={"response": "Sorry, something went wrong. Please try again.", "tool_data": [], "status": "error"},
        )


@app.get("/api/health")
def health():
    return {"status": "healthy"}


@app.get("/api/flights")
def flights():
    return {"status": "success", **list_flights()}


@app.post("/api/reset")
def reset():
    reset_conversation()
    state.reset()
    return {"message": "Conversation reset", "status": "success"}


@app.post("/api/seat-map")
def seat_map_endpoint(request: SeatMapRequest):
    return _direct_response(get_seat_map(request.flight_id))


@app.post("/api/select-seat")
def select_seat_endpoint(request: SelectSeatRequest):
    return _direct_response(select_seat(request.flight_id, request.seat_id))


@app.post("/api/baggage")
def baggage_endpoint(request: BaggageRequest):
    return _direct_response(add_baggage(request.checked_bags))


@app.post("/api/meal")
def meal_endpoint(request: MealRequest):
    return _direct_response(set_meal_preference(request.meal_type))


@app.post("/api/create-booking")
def create_booking_endpoint(request: CreateBookingRequest):
    return _direct_response(create_booking(request.passenger_name, request.passenger_email))


@app.post("/api/confirm-booking")
def confirm_booking_endpoint():
    result = confirm_booking()
    if "error" not in result and result.get("assistant_summary"):
        append_assistant_message(result["assistant_summary"])
    return _direct_response(result)
