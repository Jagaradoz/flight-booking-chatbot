# Flight Booking Chatbot
A conversational AI-powered flight booking system that transforms the traditional form-filling experience into natural, human-like conversations. Book flights, select seats, add baggage, and choose meals through simple chat interactions powered by OpenAI's GPT models.

## Purpose
Traditional flight booking websites overwhelm users with complex forms, dropdown menus, and multi-step processes. What if booking a flight could be as simple as texting a travel agent?

This project explores whether conversational AI can simplify the flight booking experience by:

**Natural Language Booking**: Replace rigid forms with flexible conversations where users describe their needs in their own words
**Context-Aware Assistance**: Maintain conversation history so users don't have to repeat themselves
**Intelligent Tool Use**: Leverage OpenAI's function calling to execute specific actions (search flights, select seats, process bookings) based on user intent
**Flexible Workflows**: Allow users to skip optional steps or change their minds mid-conversation

The goal isn't just to build a chatbot, but to demonstrate how AI agents can handle complex, multi-step workflows while maintaining a natural, user-friendly experience.

## Features
**Conversational Flight Search**: Natural language queries for finding flights by origin, destination, and date

- Automatic airport code recognition
- Intelligent date parsing
- Multi-passenger support
- Price and time filtering

**Interactive Seat Selection**: Choose seats through conversation or visual seat maps

- Real-time seat availability
- Seat type differentiation (Economy, Economy Plus, Business)
- Window, aisle, and middle seat preferences

**Flexible Add-ons**: Optional customization without mandatory steps

- Checked baggage with dynamic pricing
- Meal preferences (vegetarian, vegan, halal, etc.)
- Skip any optional features seamlessly

**Smart Booking Management**: End-to-end booking workflow with context awareness

- Passenger information collection
- Booking summary generation
- Confirmation code creation
- Email confirmation (simulated)

**Multi-turn Conversations**: Context-aware dialogue that remembers previous interactions

- Change selections mid-conversation
- Ask follow-up questions
- Natural error handling and clarifications

## Table of Contents
- [Flight Booking Chatbot](#flight-booking-chatbot)
  - [Purpose](#purpose)
  - [Features](#features)
  - [Table of Contents](#table-of-contents)
  - [Tech Stack](#tech-stack)
  - [Project Structure](#project-structure)
  - [Usage](#usage)
  - [API Documentation](#api-documentation)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)

## Tech Stack

| Technology | Role |
|------------|------|
| Python 3.8+ | Backend language |
| FastAPI | REST API framework |
| OpenAI API | GPT-4/GPT-3.5 for natural language understanding |
| React | Frontend framework |
| Vite | Build tool and dev server |
| TailwindCSS | Styling and responsive design |
| Lucide React | Icon library |
| Axios | HTTP client for API calls |

## Project Structure

```
flight-booking-chatbot/
├── backend/                           # Python FastAPI backend
│   ├── tools/                         # Tool functions for flight operations
│   └── data/                          # Mock data and database
└── frontend/                          # React frontend
    └── src/
        └── components/                # React components
```

**Data Flow:**
1. User types message → Frontend sends to backend
2. Backend receives message → Adds to conversation history
3. Backend calls OpenAI → Sends message + available tools
4. OpenAI analyzes → Decides which tool(s) to call
5. Backend executes tools → Runs functions, gets results
6. Backend sends results to OpenAI → AI formulates response
7. Backend returns response → Frontend displays to user

## Usage

**Basic Flight Search:**
```
"I need to fly from Bangkok to Tokyo on April 15th"
"Find me flights from LAX to JFK next Monday"
"Show me flights to Paris for 2 passengers"
```

**Seat Selection:**
```
"I'd like a window seat"
"Can I get seat 12A?"
"Show me available seats in business class"
```

**Add-ons:**
```
"Add 2 checked bags"
"I need a vegetarian meal"
"Add baggage and select a window seat"
```

**Booking:**
```
"My name is John Smith, email john@example.com"
"Confirm the booking"
"What's my total price?"
```

## API Documentation

**Base URL:** `http://localhost:8000`

### Endpoints

**POST /api/chat**
- Send a message to the chatbot
- Request body: `{ "message": "string" }`
- Response: `{ "response": "string", "status": "success" }`

**POST /api/reset**
- Clear conversation history and start fresh
- Response: `{ "message": "Conversation reset", "status": "success" }`

**GET /api/health**
- Check server status
- Response: `{ "status": "healthy" }`

## Getting Started

### Prerequisites

- **Python 3.8+**
- **Node.js 16+** and npm
- **OpenAI API Key** - Get one at [platform.openai.com](https://platform.openai.com)

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

4. **Start the backend server:**
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   Backend will run at `http://localhost:8000`

5. **Set up the frontend (in a new terminal):**
   ```bash
   cd frontend
   npm install
   ```

6. **Start the frontend development server:**
   ```bash
   npm run dev
   ```
   Frontend will run at `http://localhost:5173`

7. **Open your browser:**
   Navigate to `http://localhost:5173` and start chatting!