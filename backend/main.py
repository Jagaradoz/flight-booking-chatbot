from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.addons import router as addons_router
from api.bookings import router as bookings_router
from api.chat import router as chat_router
from api.flights import router as flights_router
from api.seats import router as seats_router
from api.system import router as system_router

app = FastAPI(title="Flight Booking Chatbot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Accept"],
)

app.include_router(system_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(flights_router, prefix="/api")
app.include_router(seats_router, prefix="/api")
app.include_router(addons_router, prefix="/api")
app.include_router(bookings_router, prefix="/api")

