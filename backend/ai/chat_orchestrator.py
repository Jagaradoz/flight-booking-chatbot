import json
import logging
import os

from ai.tool_definitions import TOOL_DEFINITIONS
from domain.addons import add_baggage, set_meal_preference
from domain.bookings import create_booking, confirm_booking, get_booking_summary
from domain.flights import filter_flights, get_flight_details, search_flights, select_flight
from domain.seats import get_seat_map, select_seat
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

logger = logging.getLogger(__name__)

MODEL = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")
MAX_TOOL_ITERATIONS = 10

_client: OpenAI | None = None


def _get_client() -> OpenAI:
    global _client
    if _client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError(
                "OPENAI_API_KEY is not set. "
                "Create a .env file in the backend directory with your key."
            )
        _client = OpenAI(api_key=api_key)
    return _client


SYSTEM_PROMPT = """You are a friendly and professional flight booking assistant. Your job is to help users search for flights, select seats, add baggage, choose meals, and complete their bookings through natural conversation.

Guidelines:
- Be concise but helpful. Present flight options clearly with key details (airline, times, price).
- When showing flight results, format them as a numbered list so users can easily pick one.
- Guide users step-by-step through the booking process, but don't force optional steps (seat selection, baggage, meals). Ask if they'd like these extras.
- Always confirm details before finalizing a booking.
- If the user asks about something outside flight booking, politely redirect the conversation.
- Use the available tools to search flights, manage seats, handle add-ons, and process bookings.
- When the user mentions a city name, infer the most common airport code for that city.
- All prices are in USD.
- Available dates for flights are on 2026-04-15. If a user asks for a different date, let them know that only April 15, 2026 is available in our demo system.
"""

FUNCTION_MAP = {
    "search_flights": search_flights,
    "filter_flights": filter_flights,
    "get_flight_details": get_flight_details,
    "select_flight": select_flight,
    "get_seat_map": get_seat_map,
    "select_seat": select_seat,
    "add_baggage": add_baggage,
    "set_meal_preference": set_meal_preference,
    "create_booking": create_booking,
    "confirm_booking": confirm_booking,
    "get_booking_summary": get_booking_summary,
}

conversation_history: list[dict] = []


def ensure_conversation_initialized():
    if not conversation_history:
        conversation_history.append({"role": "system", "content": SYSTEM_PROMPT})


def append_assistant_message(content: str):
    ensure_conversation_initialized()
    conversation_history.append({"role": "assistant", "content": content})


def reset_conversation():
    global conversation_history
    conversation_history = []


def _execute_tool_call(tool_call) -> str:
    func_name = tool_call.function.name
    func = FUNCTION_MAP.get(func_name)

    if not func:
        logger.warning("Unknown tool call requested: %s", func_name)
        return json.dumps({"error": f"Unknown function: {func_name}"})

    try:
        args = json.loads(tool_call.function.arguments)
    except json.JSONDecodeError:
        logger.error("Failed to parse arguments for %s", func_name)
        return json.dumps({"error": "Failed to parse function arguments."})

    try:
        result = func(**args)
    except Exception:
        logger.exception("Error executing tool %s", func_name)
        result = {"error": f"Tool '{func_name}' encountered an internal error."}

    return json.dumps(result)


def chat(user_message: str) -> dict:
    """Process a user message and return the assistant's response with tool data."""
    ensure_conversation_initialized()

    conversation_history.append({"role": "user", "content": user_message})

    tool_data: list[dict] = []

    for _ in range(MAX_TOOL_ITERATIONS):
        response = _get_client().chat.completions.create(
            model=MODEL,
            messages=conversation_history,
            tools=TOOL_DEFINITIONS,
        )

        choice = response.choices[0]
        message = choice.message

        conversation_history.append(message.to_dict())

        if message.tool_calls:
            for tool_call in message.tool_calls:
                result_json = _execute_tool_call(tool_call)
                conversation_history.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": result_json,
                })
                try:
                    parsed = json.loads(result_json)
                except json.JSONDecodeError:
                    parsed = {}
                tool_data.append({
                    "tool": tool_call.function.name,
                    "result": parsed,
                })
        else:
            return {"text": message.content, "tool_data": tool_data}

    logger.warning(
        "Tool loop hit max iterations (%d) for message: %s",
        MAX_TOOL_ITERATIONS,
        user_message[:100],
    )
    return {
        "text": "I'm sorry, I wasn't able to complete that request. Please try again.",
        "tool_data": tool_data,
    }