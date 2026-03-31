from data.flights import FLIGHTS
from data.seats import generate_seat_map
import state


def get_seat_map(flight_id: str) -> dict:
    """Display available and occupied seats for a specific flight."""
    flight_id = flight_id.upper()
    flight = next((f for f in FLIGHTS if f["flight_id"] == flight_id), None)

    if not flight:
        return {"error": f"Flight {flight_id} not found."}

    seat_map = generate_seat_map(flight["aircraft"])
    state.session["seat_map"] = seat_map
    state.session["selected_flight"] = flight

    available = [s for s in seat_map.values() if not s["occupied"]]
    occupied_count = len(seat_map) - len(available)

    sections_summary = {}
    for seat in available:
        sec = seat["section"]
        if sec not in sections_summary:
            sections_summary[sec] = {"available": 0, "extra_cost": seat["extra_cost"]}
        sections_summary[sec]["available"] += 1

    available_list = []
    for seat in available:
        available_list.append({
            "seat_id": seat["seat_id"],
            "type": seat["type"],
            "section": seat["section"],
            "extra_cost": seat["extra_cost"],
        })

    return {
        "flight_id": flight_id,
        "aircraft": flight["aircraft"],
        "total_seats": len(seat_map),
        "available_seats": len(available),
        "occupied_seats": occupied_count,
        "sections": sections_summary,
        "seats": available_list,
    }


def select_seat(flight_id: str, seat_id: str) -> dict:
    """Reserve a specific seat on a flight."""
    flight_id = flight_id.upper()
    seat_id = seat_id.upper()

    seat_map = state.session.get("seat_map")

    if not seat_map:
        return {"error": "No seat map loaded. Please view the seat map first."}

    current_flight = state.session.get("selected_flight")
    if not current_flight or current_flight["flight_id"] != flight_id:
        return {"error": f"Seat map is not loaded for flight {flight_id}. Please view its seat map first."}

    seat = seat_map.get(seat_id)
    if not seat:
        return {"error": f"Seat {seat_id} does not exist on this aircraft."}

    if seat["occupied"]:
        return {"error": f"Seat {seat_id} is already occupied. Please choose another seat."}

    seat["occupied"] = True
    state.session["selected_seat"] = seat

    return {
        "message": f"Seat {seat_id} has been reserved for you.",
        "seat": {
            "seat_id": seat["seat_id"],
            "type": seat["type"],
            "section": seat["section"],
            "extra_cost": seat["extra_cost"],
        },
    }
