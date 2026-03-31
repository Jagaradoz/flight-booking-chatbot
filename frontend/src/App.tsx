import { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { ChatWindow } from './components/ChatWindow';
import { ChatInput } from './components/ChatInput';
import { RightPanel } from './components/RightPanel';
import { sendMessage, resetConversation, checkHealth } from './lib/api';
import type { ToolData } from './lib/api';
import { Message, Flight, Seat, SeatMap, Booking } from './types';


function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [seatMap, setSeatMap] = useState<SeatMap | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [baggage, setBaggage] = useState(0);
  const [mealPreference, setMealPreference] = useState<string | null>(null);
  const [bookingStep, setBookingStep] = useState<'search' | 'select' | 'customize' | 'book' | 'confirm'>('search');
  const [activeView, setActiveView] = useState<{ view: 'flights' | 'seats' | 'addons' | 'booking'; key: number } | null>(null);
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const activeViewKeyRef = useRef(0);
  const selectedFlightIdRef = useRef<string | null>(null);

  useEffect(() => {
    checkHealth().then(setIsConnected);
  }, []);

  const switchView = (view: 'flights' | 'seats' | 'addons' | 'booking') => {
    activeViewKeyRef.current += 1;
    setActiveView({ view, key: activeViewKeyRef.current });
  };

  const processToolData = (toolData: ToolData[]) => {
    for (const { tool, result } of toolData) {
      if (result.error) continue;

      switch (tool) {
        case 'search_flights':
        case 'filter_flights': {
          const rawFlights = (result.flights as Record<string, unknown>[]) || [];
          const mapped: Flight[] = rawFlights.map((f) => ({
            flight_id: f.flight_id as string,
            airline: f.airline as string,
            origin: f.origin as string,
            destination: f.destination as string,
            departure_time: f.departure_time as string,
            arrival_time: f.arrival_time as string,
            duration: f.duration as string,
            price: (f.price_per_passenger ?? f.price) as number,
            aircraft: f.aircraft as string,
            date: f.date as string || '',
          }));
          setFlights(mapped);
          setBookingStep('select');
          switchView('flights');
          break;
        }
        case 'get_flight_details': {
          switchView('flights');
          break;
        }
        case 'get_seat_map': {
          const rawSeats = (result.seats as Record<string, unknown>[]) || [];
          const sections = result.sections as SeatMap['sections'];
          const seats: Seat[] = rawSeats.map((s) => ({
            seat_id: s.seat_id as string,
            type: s.type as Seat['type'],
            section: s.section as Seat['section'],
            extra_cost: s.extra_cost as number,
            occupied: false,
          }));
          const mapped: SeatMap = {
            flight_id: result.flight_id as string,
            aircraft: result.aircraft as string,
            total_seats: result.total_seats as number,
            available_seats: result.available_seats as number,
            occupied_seats: result.occupied_seats as number,
            sections: sections || {},
            seats,
          };
          setSeatMap(mapped);
          selectedFlightIdRef.current = result.flight_id as string;
          setBookingStep('customize');
          switchView('seats');
          break;
        }
        case 'select_seat': {
          const seat = result.seat as Record<string, unknown> | undefined;
          if (seat) {
            setSelectedSeatId(seat.seat_id as string);
          }
          break;
        }
        case 'add_baggage': {
          const bags = result.checked_bags as number;
          setBaggage(bags);
          break;
        }
        case 'set_meal_preference': {
          setMealPreference(result.meal_type as string);
          break;
        }
        case 'create_booking':
        case 'get_booking_summary': {
          const b = result.booking as Booking | undefined;
          if (b) {
            setBooking(b);
            setBookingStep(b.status === 'confirmed' ? 'confirm' : 'book');
            switchView('booking');
          }
          break;
        }
        case 'confirm_booking': {
          const b = result.booking as Booking | undefined;
          if (b) {
            setBooking(b);
            setBookingStep('confirm');
            switchView('booking');
          }
          break;
        }
      }
    }
  };

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
      const { text, tool_data } = await sendMessage(content);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      processToolData(tool_data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';

      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${errorMessage}`,
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
      setActiveView(null);
      setSelectedSeatId(null);
      selectedFlightIdRef.current = null;
    } catch (err) {
      console.error('Failed to reset conversation:', err);
    }
  };

  const handleSeatSelect = (seatId: string) => {
    const flightId = selectedFlightIdRef.current;
    if (flightId) {
      handleSendMessage(`Select seat ${seatId} on flight ${flightId}`);
    }
  };

  const handleBaggageChange = (count: number) => {
    handleSendMessage(`Set my checked baggage to ${count} bag${count !== 1 ? 's' : ''}`);
  };

  const handleMealChange = (meal: string) => {
    handleSendMessage(`Set my meal preference to ${meal}`);
  };

  const handleFlightSelect = (flightId: string) => {
    handleSendMessage(`Show me the seat map for flight ${flightId}`);
  };

  const handleConfirmBooking = () => {
    handleSendMessage('Confirm my booking');
  };

  return (
    <div className="flex flex-col h-screen">
      {!isConnected && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2 text-center text-sm text-destructive">
          Cannot connect to server. Please ensure the backend is running on http://localhost:8000
        </div>
      )}
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
            activeView={activeView}
            selectedSeatId={selectedSeatId}
            onFlightSelect={handleFlightSelect}
            onSeatSelect={handleSeatSelect}
            onBaggageChange={handleBaggageChange}
            onMealChange={handleMealChange}
            onConfirmBooking={handleConfirmBooking}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
