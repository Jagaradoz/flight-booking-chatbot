from pydantic import BaseModel, Field, field_validator


class CreateBookingRequest(BaseModel):
    passenger_name: str = Field(..., min_length=1, max_length=200)
    passenger_email: str = Field(..., min_length=1, max_length=320)

    @field_validator("passenger_email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        value = value.strip()
        if "@" not in value or "." not in value.split("@")[-1]:
            raise ValueError("Invalid email format")
        return value
