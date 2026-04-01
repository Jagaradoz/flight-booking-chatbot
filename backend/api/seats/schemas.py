from pydantic import BaseModel, Field


class SeatMapRequest(BaseModel):
    flight_id: str = Field(..., min_length=1, max_length=20)


class SelectSeatRequest(BaseModel):
    flight_id: str = Field(..., min_length=1, max_length=20)
    seat_id: str = Field(..., min_length=1, max_length=10)
