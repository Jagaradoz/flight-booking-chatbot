from data.flights import FLIGHTS
from data.airports import is_valid_airport, get_airport_info
import state


def search_flights(origin: str, destination: str, date: str, passengers: int = 1) -> dict:
    """Search flights by origin, destination, and date."""
    origin = origin.upper()
    destination = destination.upper()

    if not is_valid_airport(origin):
        return {"error": f"Unknown airport code: {origin}"}
    if not is_valid_airport(destination):
        return {"error": f"Unknown airport code: {destination}"}

    results = [
        f for f in FLIGHTS
        if f["origin"] == origin
        and f["destination"] == destination
        and f["date"] == date
    ]

    state.session["last_search_results"] = results

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
    for f in results:
        flights_out.append({
            "flight_id": f["flight_id"],
            "airline": f["airline"],
            "origin": f["origin"],
            "destination": f["destination"],
            "departure_time": f["departure_time"],
            "arrival_time": f["arrival_time"],
            "duration": f["duration"],
            "price_per_passenger": f["price"],
            "total_price": f["price"] * passengers,
            "aircraft": f["aircraft"],
            "date": f["date"],
        })

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
    results = state.session.get("last_search_results", [])
    if not results:
        return {"error": "No previous search results to filter. Please search for flights first."}

    filtered = list(results)

    if max_price is not None:
        filtered = [f for f in filtered if f["price"] <= max_price]

    if airline is not None:
        filtered = [f for f in filtered if airline.lower() in f["airline"].lower()]

    if departure_after is not None:
        filtered = [f for f in filtered if f["departure_time"] >= departure_after]

    if departure_before is not None:
        filtered = [f for f in filtered if f["departure_time"] <= departure_before]

    state.session["last_search_results"] = filtered

    if not filtered:
        return {"flights": [], "message": "No flights match the applied filters."}

    flights_out = []
    for f in filtered:
        flights_out.append({
            "flight_id": f["flight_id"],
            "airline": f["airline"],
            "origin": f["origin"],
            "destination": f["destination"],
            "departure_time": f["departure_time"],
            "arrival_time": f["arrival_time"],
            "duration": f["duration"],
            "price": f["price"],
            "aircraft": f["aircraft"],
            "date": f["date"],
        })

    return {"flights": flights_out, "count": len(flights_out)}


def get_flight_details(flight_id: str) -> dict:
    """Get detailed information for a specific flight."""
    flight_id = flight_id.upper()
    flight = next((f for f in FLIGHTS if f["flight_id"] == flight_id), None)

    if not flight:
        return {"error": f"Flight {flight_id} not found."}

    origin_info = get_airport_info(flight["origin"])
    dest_info = get_airport_info(flight["destination"])

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
