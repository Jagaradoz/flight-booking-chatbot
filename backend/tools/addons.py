import state

BAGGAGE_PRICE_PER_BAG = 30

MEAL_OPTIONS = [
    "standard",
    "vegetarian",
    "vegan",
    "halal",
    "kosher",
    "gluten-free",
    "child",
]


def add_baggage(checked_bags: int) -> dict:
    """Add checked baggage to the current booking."""
    if checked_bags < 0:
        return {"error": "Number of bags cannot be negative."}
    if checked_bags > 5:
        return {"error": "Maximum of 5 checked bags allowed per passenger."}

    state.session["baggage"] = checked_bags
    total_cost = checked_bags * BAGGAGE_PRICE_PER_BAG

    return {
        "message": f"Added {checked_bags} checked bag(s) to your booking.",
        "checked_bags": checked_bags,
        "cost_per_bag": BAGGAGE_PRICE_PER_BAG,
        "total_baggage_cost": total_cost,
    }


def set_meal_preference(meal_type: str) -> dict:
    """Set the meal preference for the flight."""
    meal_type = meal_type.lower().strip()

    if meal_type not in MEAL_OPTIONS:
        return {
            "error": f"Unknown meal type: '{meal_type}'.",
            "available_options": MEAL_OPTIONS,
        }

    state.session["meal_preference"] = meal_type

    return {
        "message": f"Meal preference set to '{meal_type}'.",
        "meal_type": meal_type,
        "available_options": MEAL_OPTIONS,
    }
