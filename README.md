# Flight Booking Chatbot

A conversational AI flight booking system built on OpenAI function calling. Users book flights through natural chat instead of forms. The AI interprets intent, invokes the right tools, and guides the workflow from search to confirmation. All flight data is mock/in-memory.

## Features

- **Conversational booking**: search, select, customize, and confirm entirely through chat
- **Parallel UI**: right panel updates live from tool data — seat map, flight list, booking summary
- **Optional steps**: seat selection, baggage, and meal preference can all be skipped
- **Manual flow**: users can also click through the UI panels directly without chatting
- **Mock data**: flights, seats, and airports are all static in-memory data — no real bookings

## Tools

The AI has access to 11 tools:

| Tool | Purpose |
|------|---------|
| `search_flights` | Find flights by origin, destination, and date |
| `filter_flights` | Narrow last search results by price, airline, or time |
| `get_flight_details` | Get full details for a specific flight |
| `select_flight` | Mark a flight as selected for booking |
| `get_seat_map` | Load available seats for a flight |
| `select_seat` | Reserve a specific seat |
| `add_baggage` | Set number of checked bags |
| `set_meal_preference` | Set in-flight meal preference |
| `create_booking` | Create a booking with passenger details |
| `confirm_booking` | Finalize and generate a confirmation code |
| `get_booking_summary` | Show current booking or selection state |

## Tech Stack

| Technology | Role |
|------------|------|
| Python 3.10+ | Backend language |
| FastAPI | REST API framework |
| OpenAI API (`gpt-4.1-mini`) | Natural language understanding and tool calling |
| TypeScript + React 18 | Frontend |
| Vite | Build tool and dev server |
| TailwindCSS | Styling |
| shadcn/ui | Component primitives |
| react-markdown | Markdown rendering for chat messages |
| Lucide React | Icons |
| Axios | HTTP client |

## Project Structure

```
flight-booking-chatbot/
├── backend/
│   ├── ai/                # OpenAI chat loop and tool definitions
│   ├── api/               # FastAPI routers (chat, flights, seats, addons, bookings, system)
│   ├── domain/            # Tool function implementations
│   ├── data/              # Mock flight, seat, and airport data
└── frontend/
    └── src/
        ├── app/           # Root App component and layout
        ├── features/      # Feature modules (chat, flights, seats, addons, bookings, trip-panel)
        └── shared/        # API client, UI primitives, utilities
```

## Booking Flow

**Select → Customize → Book → Confirm**

Works via chat or manual UI interaction:
- **Select**: search for flights, pick one
- **Customize**: choose a seat, add baggage, set meal preference (all optional)
- **Book**: enter passenger name and email
- **Confirm**: review summary and confirm to get a confirmation code

## API

**Base URL:** `http://localhost:8000`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | Send a message; returns `{ response, tool_data, status }` |
| `POST` | `/api/reset` | Reset conversation and session state |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/flights` | List all available flights |
| `POST` | `/api/seat-map` | Get seat map for a flight |
| `POST` | `/api/select-seat` | Select a seat |
| `POST` | `/api/add-baggage` | Set checked bag count |
| `POST` | `/api/set-meal` | Set meal preference |
| `POST` | `/api/create-booking` | Create a booking |
| `POST` | `/api/confirm-booking` | Confirm a booking |

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 16+ and npm
- OpenAI API key — [platform.openai.com](https://platform.openai.com)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/flight-booking-chatbot.git
   cd flight-booking-chatbot
   ```

2. **Set up the backend:**
   ```bash
   cd backend
   python3 -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Configure environment variables:**
   ```bash
   cp ../.env.example .env
   # Edit .env and add your OpenAI API key:
   # OPENAI_API_KEY=sk-your-api-key-here
   ```

4. **Start the backend:**
   ```bash
   uvicorn main:app --reload --port 8000
   ```

5. **Set up and start the frontend (new terminal):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

6. Open `http://localhost:5173` and start chatting.
