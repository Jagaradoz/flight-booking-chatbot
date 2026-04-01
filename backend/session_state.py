"""In-memory session state for a single user. Resets on server restart."""


def _empty_state() -> dict:
    return {
        "last_search_results": [],
        "selected_flight": None,
        "seat_map": None,
        "selected_seat": None,
        "baggage": 0,
        "meal_preference": None,
        "passenger_name": None,
        "passenger_email": None,
        "booking": None,
    }


session: dict = _empty_state()


def reset():
    global session
    session = _empty_state()