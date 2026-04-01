from fastapi import APIRouter

from api.common.responses import direct_response
from tools.addons import add_baggage, set_meal_preference

from .schemas import BaggageRequest, MealRequest

router = APIRouter(tags=["addons"])


@router.post("/baggage")
def baggage_endpoint(request: BaggageRequest):
    return direct_response(add_baggage(request.checked_bags))


@router.post("/meal")
def meal_endpoint(request: MealRequest):
    return direct_response(set_meal_preference(request.meal_type))
