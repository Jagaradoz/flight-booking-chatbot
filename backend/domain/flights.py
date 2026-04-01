import session_state
from data.airports import get_airport_info, is_valid_airport
from data.flights import FLIGHTS


def _format_airport_display(code: str) -> tuple[str, str]:
    info = get_airport_info(code)
    if not info:
        return code, code
    return f"{info['city']} ({code})", info["name"]


def _serialize_flight(flight: dict, passengers: int | None = None) -> dict:
    origin_display, origin_airport = _format_airport_display(flight["origin"])
    destination_display, destination_airport = _format_airport_display(flight["destination"])

    serialized = {
        "flight_id": flight["flight_id"],
        "airline": flight["airline"],
        "origin": flight["origin"],
        "destination": flight["destination"],
        "origin_display": origin_display,
        "destination_display": destination_display,
        "origin_airport": origin_airport,
        "destination_airport": destination_airport,
        "departure_time": flight["departure_time"],
        "arrival_time": flight["arrival_time"],
        "duration": flight["duration"],
        "price": flight["price"],
        "aircraft": flight["aircraft"],
        "date": flight["date"],
    }

    if passengers is not None:
        serialized["price_per_passenger"] = flight["price"]
        serialized["total_price"] = flight["price"] * passengers

    return serialized


def list_flights() -> dict:
    """Return the full flight catalog for initial browsing."""
    flights_out = []
    for flight in FLIGHTS:
        flights_out.append(_serialize_flight(flight))

    return {"flights": flights_out, "count": len(flights_out)}


def search_flights(origin: str, destination: str, date: str, passengers: int = 1) -> dict:
    """Search flights by origin, destination, and date."""
    origin = origin.upper()
    destination = destination.upper()

    if not is_valid_airport(origin):
        return {"error": f"Unknown airport code: {origin}"}
    if not is_valid_airport(destination):
        return {"error": f"Unknown airport code: {destination}"}

    results = [
        flight for flight in FLIGHTS
        if flight["origin"] == origin
        and flight["destination"] == destination
        and flight["date"] == date
    ]

    session_state.session["last_search_results"] = results

    if not results:
        origin_info = get_airport_info(origin)
        dest_info = get_airport_info(destination)
        return {
            "flights": [],
            "message": (
                f"No flights found from {origin_info['city']} ({origin}) "
                f"to {dest_info['city']} ({destination}) on {date}."
            ),
        }

    flights_out = []
    for flight in results:
        flights_out.append(_serialize_flight(flight, passengers=passengers))

    return {
        "flights": flights_out,
        "count": len(flights_out),
        "passengers": passengers,
    }


def filter_flights(
    max_price: int | None = None,
    airline: str | None = None,
    departure_after: str | None = None,
    departure_before: str | None = None,
) -> dict:
    """Filter the last search results by price, airline, or departure time."""
    results = session_state.session.get("last_search_results", [])
    if not results:
        return {"error": "No previous search results to filter. Please search for flights first."}

    filtered = list(results)

    if max_price is not None:
        filtered = [flight for flight in filtered if flight["price"] <= max_price]

    if airline is not None:
        filtered = [flight for flight in filtered if airline.lower() in flight["airline"].lower()]

    if departure_after is not None:
        filtered = [flight for flight in filtered if flight["departure_time"] >= departure_after]

    if departure_before is not None:
        filtered = [flight for flight in filtered if flight["departure_time"] <= departure_before]

    session_state.session["last_search_results"] = filtered

    if not filtered:
        return {"flights": [], "message": "No flights match the applied filters."}

    flights_out = []
    for flight in filtered:
        flights_out.append(_serialize_flight(flight))

    return {"flights": flights_out, "count": len(flights_out)}


def get_flight_details(flight_id: str) -> dict:
    """Get detailed information for a specific flight."""
    flight_id = flight_id.upper()
    flight = next((flight for flight in FLIGHTS if flight["flight_id"] == flight_id), None)

    if not flight:
        return {"error": f"Flight {flight_id} not found."}

    origin_info = get_airport_info(flight["origin"]) or {
        "name": flight["origin"],
        "city": flight["origin"],
        "country": "Unknown",
    }
    dest_info = get_airport_info(flight["destination"]) or {
        "name": flight["destination"],
        "city": flight["destination"],
        "country": "Unknown",
    }

    return {
        "flight_id": flight["flight_id"],
        "airline": flight["airline"],
        "origin": {
            "code": flight["origin"],
            "airport": origin_info["name"],
            "city": origin_info["city"],
            "country": origin_info["country"],
        },
        "destination": {
            "code": flight["destination"],
            "airport": dest_info["name"],
            "city": dest_info["city"],
            "country": dest_info["country"],
        },
        "departure_time": flight["departure_time"],
        "arrival_time": flight["arrival_time"],
        "duration": flight["duration"],
        "price": flight["price"],
        "aircraft": flight["aircraft"],
        "date": flight["date"],
    }


def select_flight(flight_id: str) -> dict:
    """Select a specific flight to proceed with booking."""
    flight_id = flight_id.upper()
    flight = next((f for f in FLIGHTS if f["flight_id"] == flight_id), None)

    if not flight:
        return {"error": f"Flight {flight_id} not found."}

    session_state.session["selected_flight"] = flight
    session_state.session["selected_seat"] = None
    session_state.session["seat_map"] = None
    session_state.session["baggage"] = 0
    session_state.session["meal_preference"] = None
    session_state.session["booking"] = None

    return {
        "message": f"Flight {flight_id} has been selected.",
        "flight_id": flight["flight_id"],
        "flight": _serialize_flight(flight),
    }