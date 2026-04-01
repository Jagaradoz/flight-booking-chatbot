import secrets
import string

from data.airports import get_airport_info
from tools.addons import BAGGAGE_PRICE_PER_BAG
import state


def _generate_confirmation_code() -> str:
    chars = string.ascii_uppercase + string.digits
    return "BK" + "".join(secrets.choice(chars) for _ in range(6))


def build_confirmation_summary(booking: dict) -> str:
    confirmation_code = booking.get("confirmation_code", "Pending")
    return (
        "Your booking has been confirmed!\n\n"
        f"**Confirmation Code: {confirmation_code}**\n\n"
        f"- **Passenger:** {booking['passenger']['name']}\n"
        f"- **Flight:** {booking['flight']['flight_id']} — {booking['flight']['origin']} → {booking['flight']['destination']}\n"
        f"- **Date:** {booking['flight']['date']}\n"
        f"- **Seat:** {booking['seat']}\n"
        f"- **Total:** ${booking['pricing']['total']}\n\n"
        "Thank you for booking with us!"
    )


def create_booking(passenger_name: str, passenger_email: str) -> dict:
    """Initialize a booking with passenger details."""
    flight = state.session.get("selected_flight")
    if not flight:
        return {"error": "No flight selected. Please search and select a flight first."}

    state.session["passenger_name"] = passenger_name
    state.session["passenger_email"] = passenger_email

    seat = state.session.get("selected_seat")
    baggage = state.session.get("baggage", 0)
    meal = state.session.get("meal_preference")

    base_price = flight["price"]
    seat_extra = seat["extra_cost"] if seat else 0
    baggage_cost = baggage * BAGGAGE_PRICE_PER_BAG
    total = base_price + seat_extra + baggage_cost

    origin_info = get_airport_info(flight["origin"])
    dest_info = get_airport_info(flight["destination"])

    origin_city = origin_info["city"] if origin_info else flight["origin"]
    dest_city = dest_info["city"] if dest_info else flight["destination"]

    booking = {
        "status": "pending",
        "passenger": {"name": passenger_name, "email": passenger_email},
        "flight": {
            "flight_id": flight["flight_id"],
            "airline": flight["airline"],
            "origin": f"{origin_city} ({flight['origin']})",
            "destination": f"{dest_city} ({flight['destination']})",
            "date": flight["date"],
            "departure_time": flight["departure_time"],
            "arrival_time": flight["arrival_time"],
            "duration": flight["duration"],
        },
        "seat": seat["seat_id"] if seat else "Not selected",
        "seat_section": seat["section"] if seat else None,
        "baggage": f"{baggage} checked bag(s)" if baggage else "None",
        "meal": meal if meal else "None",
        "pricing": {
            "base_fare": base_price,
            "seat_upgrade": seat_extra,
            "baggage": baggage_cost,
            "total": total,
        },
    }

    state.session["booking"] = booking
    return {
        "message": "Booking created. Please review and confirm.",
        "booking": booking,
    }


def confirm_booking() -> dict:
    """Finalize the booking and generate a confirmation code."""
    booking = state.session.get("booking")
    if not booking:
        return {"error": "No booking to confirm. Please create a booking first."}

    if booking.get("status") == "confirmed":
        return {
            "error": "This booking is already confirmed.",
            "confirmation_code": booking.get("confirmation_code"),
        }

    code = _generate_confirmation_code()
    booking["status"] = "confirmed"
    booking["confirmation_code"] = code
    state.session["booking"] = booking

    return {
        "message": f"Booking confirmed! Your confirmation code is {code}.",
        "confirmation_code": code,
        "passenger_email": booking["passenger"]["email"],
        "assistant_summary": build_confirmation_summary(booking),
        "booking": booking,
    }


def get_booking_summary() -> dict:
    """Show the current booking details."""
    booking = state.session.get("booking")
    if booking:
        return {"booking": booking}

    flight = state.session.get("selected_flight")
    if not flight:
        return {"message": "No booking or flight selection in progress."}

    seat = state.session.get("selected_seat")
    baggage = state.session.get("baggage", 0)
    meal = state.session.get("meal_preference")

    return {
        "message": "Booking not yet created. Here is your current selection:",
        "selection": {
            "flight": flight["flight_id"],
            "airline": flight["airline"],
            "route": f"{flight['origin']} → {flight['destination']}",
            "date": flight["date"],
            "departure": flight["departure_time"],
            "price": flight["price"],
            "seat": seat["seat_id"] if seat else "Not selected",
            "baggage": f"{baggage} bag(s)" if baggage else "None",
            "meal": meal if meal else "None",
        },
    }
