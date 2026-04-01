from fastapi import APIRouter

from api.common.responses import direct_response
from tools.seats import get_seat_map, select_seat

from .schemas import SeatMapRequest, SelectSeatRequest

router = APIRouter(tags=["seats"])


@router.post("/seat-map")
def seat_map_endpoint(request: SeatMapRequest):
    return direct_response(get_seat_map(request.flight_id))


@router.post("/select-seat")
def select_seat_endpoint(request: SelectSeatRequest):
    return direct_response(select_seat(request.flight_id, request.seat_id))
