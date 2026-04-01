from fastapi import APIRouter

from domain.flights import list_flights

router = APIRouter(tags=["flights"])


@router.get("/flights")
def flights():
    return {"status": "success", **list_flights()}
