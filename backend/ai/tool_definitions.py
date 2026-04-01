"""OpenAI function-calling tool schemas for all 10 tool functions."""

TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "search_flights",
            "description": (
                "Search for available flights by origin airport code, destination airport code, "
                "and travel date. Returns a list of matching flights with prices and schedules."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "origin": {
                        "type": "string",
                        "description": "Origin airport IATA code (e.g. BKK, LAX, NRT)",
                    },
                    "destination": {
                        "type": "string",
                        "description": "Destination airport IATA code (e.g. NRT, JFK, SIN)",
                    },
                    "date": {
                        "type": "string",
                        "description": "Travel date in YYYY-MM-DD format (e.g. 2026-04-15)",
                    },
                    "passengers": {
                        "type": "integer",
                        "description": "Number of passengers (default 1)",
                        "default": 1,
                    },
                },
                "required": ["origin", "destination", "date"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "filter_flights",
            "description": (
                "Filter the most recent flight search results by maximum price, airline name, "
                "or departure time range. Must have searched for flights first."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "max_price": {
                        "type": "integer",
                        "description": "Maximum price per passenger in USD",
                    },
                    "airline": {
                        "type": "string",
                        "description": "Airline name to filter by (partial match)",
                    },
                    "departure_after": {
                        "type": "string",
                        "description": "Only show flights departing after this time (HH:MM format)",
                    },
                    "departure_before": {
                        "type": "string",
                        "description": "Only show flights departing before this time (HH:MM format)",
                    },
                },
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_flight_details",
            "description": (
                "Get detailed information about a specific flight including airport details, "
                "aircraft type, and full schedule."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "flight_id": {
                        "type": "string",
                        "description": "The flight ID (e.g. TG640, AA100)",
                    },
                },
                "required": ["flight_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_seat_map",
            "description": (
                "Display the seat map for a specific flight showing available and occupied seats, "
                "seat types (window/middle/aisle), sections (business/economy plus/economy), "
                "and extra costs."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "flight_id": {
                        "type": "string",
                        "description": "The flight ID to show the seat map for",
                    },
                },
                "required": ["flight_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "select_seat",
            "description": (
                "Reserve a specific seat on a flight. The seat map must be loaded first "
                "using get_seat_map."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "flight_id": {
                        "type": "string",
                        "description": "The flight ID",
                    },
                    "seat_id": {
                        "type": "string",
                        "description": "The seat identifier (e.g. 12A, 3F)",
                    },
                },
                "required": ["flight_id", "seat_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "add_baggage",
            "description": (
                "Add checked baggage to the current booking. Each bag costs $30. "
                "Maximum 5 bags per passenger."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "checked_bags": {
                        "type": "integer",
                        "description": "Number of checked bags to add (0-5)",
                    },
                },
                "required": ["checked_bags"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "set_meal_preference",
            "description": (
                "Set the in-flight meal preference. Available options: standard, vegetarian, "
                "vegan, halal, kosher, gluten-free, child."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "meal_type": {
                        "type": "string",
                        "description": "Meal preference type",
                        "enum": [
                            "standard",
                            "vegetarian",
                            "vegan",
                            "halal",
                            "kosher",
                            "gluten-free",
                            "child",
                        ],
                    },
                },
                "required": ["meal_type"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "select_flight",
            "description": (
                "Select a specific flight the user has chosen to proceed with booking. "
                "Call this after the user confirms which flight they want. "
                "This sets the flight for the booking session and resets any previous seat or add-on selections."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "flight_id": {
                        "type": "string",
                        "description": "The flight ID to select (e.g. TG640, AA100)",
                    },
                },
                "required": ["flight_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "create_booking",
            "description": (
                "Create a booking with passenger details. A flight must be selected first. "
                "This generates a booking summary for review before confirmation."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "passenger_name": {
                        "type": "string",
                        "description": "Full name of the passenger",
                    },
                    "passenger_email": {
                        "type": "string",
                        "description": "Email address of the passenger",
                    },
                },
                "required": ["passenger_name", "passenger_email"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "confirm_booking",
            "description": (
                "Finalize and confirm the current booking. Generates a confirmation code. "
                "A booking must be created first using create_booking."
            ),
            "parameters": {
                "type": "object",
                "properties": {},
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_booking_summary",
            "description": (
                "Show the current booking details or selection progress. Works at any stage "
                "of the booking process."
            ),
            "parameters": {
                "type": "object",
                "properties": {},
                "required": [],
            },
        },
    },
]