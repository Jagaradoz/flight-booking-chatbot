from pydantic import BaseModel, Field


class BaggageRequest(BaseModel):
    checked_bags: int = Field(..., ge=0, le=5)


class MealRequest(BaseModel):
    meal_type: str = Field(..., min_length=1, max_length=50)
