from fastapi import APIRouter

from tools.flights import list_flights

router = APIRouter(tags=["flights"])


@router.get("/flights")
def flights():
    return {"status": "success", **list_flights()}
