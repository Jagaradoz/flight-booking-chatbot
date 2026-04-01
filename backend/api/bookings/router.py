from fastapi import APIRouter

from api.common.responses import direct_response
from chat import append_assistant_message
from tools.bookings import confirm_booking, create_booking

from .schemas import CreateBookingRequest

router = APIRouter(tags=["bookings"])


@router.post("/create-booking")
def create_booking_endpoint(request: CreateBookingRequest):
    return direct_response(
        create_booking(request.passenger_name, request.passenger_email)
    )


@router.post("/confirm-booking")
def confirm_booking_endpoint():
    result = confirm_booking()
    if "error" not in result and result.get("assistant_summary"):
        append_assistant_message(result["assistant_summary"])
    return direct_response(result)
