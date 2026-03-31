import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ChatWindow } from './components/ChatWindow';
import { ChatInput } from './components/ChatInput';
import { RightPanel } from './components/RightPanel';
import { sendMessage, resetConversation } from './lib/api';
import { Message, Flight, SeatMap, Booking } from './types';

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'user',
    content: 'I need to fly from Bangkok to Tokyo on April 15th',
    timestamp: new Date('2026-03-31T14:50:00'),
  },
  {
    id: '2',
    role: 'assistant',
    content: 'I found several flights from Bangkok (BKK) to Tokyo Narita (NRT) on April 15th, 2026. I\'ve displayed all available options in the flight table on the right. The prices range from $400 to $520. Would you like me to help you select a specific flight or would you like to know more details about any of these options?',
    timestamp: new Date('2026-03-31T14:50:05'),
  },
  {
    id: '3',
    role: 'user',
    content: 'What\'s the cheapest option?',
    timestamp: new Date('2026-03-31T14:51:00'),
  },
  {
    id: '4',
    role: 'assistant',
    content: 'The cheapest option is **TG642** operated by Thai Airways at **$400**. However, please note that this is a red-eye flight departing at 23:30 and arriving at 07:45 the next day. If you prefer a daytime flight, TG640 departs at 09:00 for $450. Would you like to proceed with booking TG642, or would you prefer a different flight?',
    timestamp: new Date('2026-03-31T14:51:03'),
  },
  {
    id: '5',
    role: 'user',
    content: 'I\'ll take the TG640 morning flight. Can I see the seat map?',
    timestamp: new Date('2026-03-31T14:52:00'),
  },
  {
    id: '6',
    role: 'assistant',
    content: 'Great choice! TG640 is a Boeing 787 with comfortable seating. I\'ve loaded the seat map in the Seats tab on the right. You can see available seats in different sections:\n\n- **Business Class** (+$100): Rows 1-3 with extra legroom\n- **Economy Plus** (+$30): Rows 10-15 with more space\n- **Economy**: Rows 20-35 standard seating\n\nWould you like me to help you select a specific seat?',
    timestamp: new Date('2026-03-31T14:52:10'),
  },
  {
    id: '7',
    role: 'user',
    content: 'I\'d like a window seat in economy plus',
    timestamp: new Date('2026-03-31T14:53:00'),
  },
  {
    id: '8',
    role: 'assistant',
    content: 'Perfect! I can see several window seats available in Economy Plus. Here are some good options:\n\n- **12A** - Window seat, front of Economy Plus section\n- **13A** - Window seat, middle section\n- **14F** - Window seat, right side\n\nAll of these are $30 extra. Which one would you prefer?',
    timestamp: new Date('2026-03-31T14:53:08'),
  },
  {
    id: '9',
    role: 'user',
    content: 'I\'ll take 12A. Do I need to add baggage?',
    timestamp: new Date('2026-03-31T14:54:00'),
  },
  {
    id: '10',
    role: 'assistant',
    content: 'Excellent choice! Seat 12A has been reserved for you. \n\nRegarding baggage, you have a few options:\n- **Carry-on**: Included free (1 bag up to 7kg)\n- **Checked baggage**: $30 per bag (up to 23kg each, maximum 5 bags)\n\nWould you like to add any checked baggage to your booking?',
    timestamp: new Date('2026-03-31T14:54:05'),
  },
  {
    id: '11',
    role: 'user',
    content: 'Yes, I\'ll add 1 checked bag. Also, I need a vegetarian meal.',
    timestamp: new Date('2026-03-31T14:55:00'),
  },
  {
    id: '12',
    role: 'assistant',
    content: 'Perfect! I\'ve added:\n- **1 checked bag** ($30)\n- **Vegetarian meal** preference\n\nYou can review these in the Add-ons tab. Your current total is:\n- Base fare: $450\n- Seat upgrade (12A): $30\n- Checked baggage: $30\n- **Total: $510**\n\nTo complete your booking, I\'ll need your passenger details. What\'s your full name and email address?',
    timestamp: new Date('2026-03-31T14:55:10'),
  },
];

const MOCK_FLIGHTS: Flight[] = [
  {
    flight_id: 'TG640',
    airline: 'Thai Airways',
    origin: 'BKK',
    destination: 'NRT',
    departure_time: '09:00',
    arrival_time: '17:15',
    duration: '6h 15m',
    price: 450,
    aircraft: 'Boeing 787',
    date: '2026-04-15',
  },
  {
    flight_id: 'NH848',
    airline: 'ANA',
    origin: 'BKK',
    destination: 'NRT',
    departure_time: '11:30',
    arrival_time: '19:45',
    duration: '6h 15m',
    price: 520,
    aircraft: 'Boeing 787',
    date: '2026-04-15',
  },
  {
    flight_id: 'JL708',
    airline: 'Japan Airlines',
    origin: 'BKK',
    destination: 'NRT',
    departure_time: '14:00',
    arrival_time: '22:15',
    duration: '6h 15m',
    price: 480,
    aircraft: 'Airbus A320',
    date: '2026-04-15',
  },
  {
    flight_id: 'TG642',
    airline: 'Thai Airways',
    origin: 'BKK',
    destination: 'NRT',
    departure_time: '23:30',
    arrival_time: '07:45',
    duration: '6h 15m',
    price: 400,
    aircraft: 'Boeing 737',
    date: '2026-04-15',
  },
];

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [seatMap, setSeatMap] = useState<SeatMap | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [baggage, setBaggage] = useState(0);
  const [mealPreference, setMealPreference] = useState<string | null>(null);
  const [bookingStep, setBookingStep] = useState<'search' | 'select' | 'customize' | 'book' | 'confirm'>('search');

  useEffect(() => {
    setMessages(MOCK_MESSAGES);
    setFlights(MOCK_FLIGHTS);
    setBookingStep('search');
  }, []);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await sendMessage(content);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      extractFlights(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ Error: ${errorMessage}`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      await resetConversation();
      setMessages([]);
      setFlights([]);
      setSeatMap(null);
      setBooking(null);
      setBaggage(0);
      setMealPreference(null);
      setBookingStep('search');
    } catch (err) {
      console.error('Failed to reset conversation:', err);
    }
  };

  const extractFlights = (response: string) => {
    try {
      const flightPattern = /```json\s*([\s\S]*?)```/;
      const match = response.match(flightPattern);
      
      if (match && match[1]) {
        const parsedData = JSON.parse(match[1]);
        if (Array.isArray(parsedData)) {
          setFlights(parsedData);
          setBookingStep('select');
        } else if (parsedData.flights && Array.isArray(parsedData.flights)) {
          setFlights(parsedData.flights);
          setBookingStep('select');
        } else if (parsedData.seats) {
          setSeatMap(parsedData);
          setBookingStep('customize');
        } else if (parsedData.booking) {
          setBooking(parsedData.booking);
          setBookingStep(parsedData.booking.status === 'confirmed' ? 'confirm' : 'book');
        }
      }
    } catch (err) {
      console.log('No structured data to extract');
    }
  };

  const handleSeatSelect = (seatId: string) => {
    console.log('Seat selected:', seatId);
  };

  const handleBaggageChange = (count: number) => {
    setBaggage(count);
  };

  const handleMealChange = (meal: string) => {
    setMealPreference(meal);
  };

  return (
    <div className="flex flex-col h-screen">
      <Header onReset={handleReset} />
      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        <div className="flex flex-col w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r border-border">
          <ChatWindow messages={messages} isLoading={isLoading} bookingStep={bookingStep} />
          <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
        </div>
        <div className="w-full lg:w-1/2 overflow-hidden">
          <RightPanel
            flights={flights}
            seatMap={seatMap}
            booking={booking}
            baggage={baggage}
            mealPreference={mealPreference}
            onSeatSelect={handleSeatSelect}
            onBaggageChange={handleBaggageChange}
            onMealChange={handleMealChange}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
