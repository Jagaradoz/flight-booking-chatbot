import random

random.seed(42)

AIRCRAFT_CONFIGS = {
    "Boeing 737": {
        "rows": 30,
        "columns": ["A", "B", "C", "D", "E", "F"],
        "layout": "3-3",
        "sections": {
            "business": {"rows": range(1, 4), "extra_cost": 150},
            "economy_plus": {"rows": range(4, 8), "extra_cost": 25},
            "economy": {"rows": range(8, 31), "extra_cost": 0},
        },
        "seat_types": {
            "A": "window",
            "B": "middle",
            "C": "aisle",
            "D": "aisle",
            "E": "middle",
            "F": "window",
        },
    },
    "Airbus A320": {
        "rows": 32,
        "columns": ["A", "B", "C", "D", "E", "F"],
        "layout": "3-3",
        "sections": {
            "business": {"rows": range(1, 5), "extra_cost": 150},
            "economy_plus": {"rows": range(5, 10), "extra_cost": 25},
            "economy": {"rows": range(10, 33), "extra_cost": 0},
        },
        "seat_types": {
            "A": "window",
            "B": "middle",
            "C": "aisle",
            "D": "aisle",
            "E": "middle",
            "F": "window",
        },
    },
    "Boeing 787": {
        "rows": 40,
        "columns": ["A", "B", "C", "D", "E", "F", "G", "H", "J"],
        "layout": "3-3-3",
        "sections": {
            "business": {"rows": range(1, 6), "extra_cost": 200},
            "economy_plus": {"rows": range(6, 12), "extra_cost": 40},
            "economy": {"rows": range(12, 41), "extra_cost": 0},
        },
        "seat_types": {
            "A": "window",
            "B": "middle",
            "C": "aisle",
            "D": "aisle",
            "E": "middle",
            "F": "aisle",
            "G": "aisle",
            "H": "middle",
            "J": "window",
        },
    },
}


def generate_seat_map(aircraft: str) -> dict:
    """Generate a seat map with randomized occupancy for the given aircraft type."""
    config = AIRCRAFT_CONFIGS.get(aircraft)
    if not config:
        return {}

    seat_map = {}
    for section_name, section_info in config["sections"].items():
        for row in section_info["rows"]:
            for col in config["columns"]:
                seat_id = f"{row}{col}"
                occupied = random.random() < 0.35
                seat_map[seat_id] = {
                    "seat_id": seat_id,
                    "row": row,
                    "column": col,
                    "type": config["seat_types"][col],
                    "section": section_name,
                    "extra_cost": section_info["extra_cost"],
                    "occupied": occupied,
                }
    return seat_map


def get_aircraft_config(aircraft: str) -> dict | None:
    return AIRCRAFT_CONFIGS.get(aircraft)
