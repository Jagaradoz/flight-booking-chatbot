AIRPORTS = {
    "BKK": {"name": "Suvarnabhumi Airport", "city": "Bangkok", "country": "Thailand"},
    "NRT": {"name": "Narita International Airport", "city": "Tokyo", "country": "Japan"},
    "HND": {"name": "Haneda Airport", "city": "Tokyo", "country": "Japan"},
    "LAX": {"name": "Los Angeles International Airport", "city": "Los Angeles", "country": "USA"},
    "JFK": {"name": "John F. Kennedy International Airport", "city": "New York", "country": "USA"},
    "SIN": {"name": "Changi Airport", "city": "Singapore", "country": "Singapore"},
    "HKG": {"name": "Hong Kong International Airport", "city": "Hong Kong", "country": "China"},
    "ICN": {"name": "Incheon International Airport", "city": "Seoul", "country": "South Korea"},
    "SYD": {"name": "Sydney Kingsford Smith Airport", "city": "Sydney", "country": "Australia"},
    "LHR": {"name": "Heathrow Airport", "city": "London", "country": "United Kingdom"},
    "CDG": {"name": "Charles de Gaulle Airport", "city": "Paris", "country": "France"},
    "DXB": {"name": "Dubai International Airport", "city": "Dubai", "country": "UAE"},
    "SFO": {"name": "San Francisco International Airport", "city": "San Francisco", "country": "USA"},
    "TPE": {"name": "Taiwan Taoyuan International Airport", "city": "Taipei", "country": "Taiwan"},
    "KIX": {"name": "Kansai International Airport", "city": "Osaka", "country": "Japan"},
}


def get_airport_info(code: str) -> dict | None:
    return AIRPORTS.get(code.upper())


def is_valid_airport(code: str) -> bool:
    return code.upper() in AIRPORTS
