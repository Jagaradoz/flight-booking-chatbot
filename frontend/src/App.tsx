import { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { ChatWindow } from './components/ChatWindow';
import { ChatInput } from './components/ChatInput';
import { RightPanel } from './components/RightPanel';
import {
  sendMessage, resetConversation, checkHealth, fetchFlights,
  fetchSeatMap, selectSeatApi, setBaggageApi, setMealApi,
  createBookingApi, confirmBookingApi,
} from './lib/api';
import type { ToolData } from './lib/api';
import { Message, Flight, Seat, SeatMap, Booking } from './types';


function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
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
  const isProcessingRef = useRef(false);

  const mapFlights = (rawFlights: Record<string, unknown>[]): Flight[] => (
    rawFlights.map((flight) => ({
      flight_id: flight.flight_id as string,
      airline: flight.airline as string,
      origin: flight.origin as string,
      destination: flight.destination as string,
      departure_time: flight.departure_time as string,
      arrival_time: flight.arrival_time as string,
      duration: flight.duration as string,
      price: (flight.price_per_passenger ?? flight.price) as number,
      aircraft: flight.aircraft as string,
      date: (flight.date as string) || '',
    }))
  );

  const loadInitialFlights = async () => {
    try {
      const rawFlights = await fetchFlights();
      setFlights(mapFlights(rawFlights));
    } catch (error) {
      console.error('Failed to load flights:', error);
    }
  };

  useEffect(() => {
    checkHealth().then(setIsConnected);
    loadInitialFlights();
  }, []);

  const switchView = (view: 'flights' | 'seats' | 'addons' | 'booking') => {
    activeViewKeyRef.current += 1;
    setActiveView({ view, key: activeViewKeyRef.current });
  };

  const lockProcessing = () => {
    if (isProcessingRef.current) return false;
    isProcessingRef.current = true;
    setIsProcessing(true);
    return true;
  };

  const unlockProcessing = () => {
    isProcessingRef.current = false;
    setIsProcessing(false);
  };

  const invalidateBookingIfPending = () => {
    setBooking((prev) => {
      if (prev && prev.status === 'pending') {
        setBookingStep('customize');
        return null;
      }
      return prev;
    });
  };

  const parseSeatMapResponse = (result: Record<string, unknown>) => {
    const rawSeats = (result.seats as Record<string, unknown>[]) || [];
    const sections = result.sections as SeatMap['sections'];
    const seats: Seat[] = rawSeats.map((s) => ({
      seat_id: s.seat_id as string,
      type: s.type as Seat['type'],
      section: s.section as Seat['section'],
      extra_cost: s.extra_cost as number,
      occupied: false,
    }));
    return {
      flight_id: result.flight_id as string,
      aircraft: result.aircraft as string,
      total_seats: result.total_seats as number,
      available_seats: result.available_seats as number,
      occupied_seats: result.occupied_seats as number,
      sections: sections || {},
      seats,
    };
  };

  const processToolData = (toolData: ToolData[]) => {
    for (const { tool, result } of toolData) {
      if (result.error) continue;

      switch (tool) {
        case 'search_flights':
        case 'filter_flights': {
          const rawFlights = (result.flights as Record<string, unknown>[]) || [];
          setFlights(mapFlights(rawFlights));
          setBookingStep('select');
          switchView('flights');
          break;
        }
        case 'get_flight_details': {
          switchView('flights');
          break;
        }
        case 'get_seat_map': {
          const mapped = parseSeatMapResponse(result);
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
    if (!lockProcessing()) return;

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
      unlockProcessing();
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
      loadInitialFlights();
    } catch (err) {
      console.error('Failed to reset conversation:', err);
    }
  };

  const handleBookFlight = async (flightId: string) => {
    if (!lockProcessing()) return;
    try {
      // Reset downstream state when switching flights
      if (selectedFlightIdRef.current && selectedFlightIdRef.current !== flightId) {
        setSelectedSeatId(null);
        setBaggage(0);
        setMealPreference(null);
        setBooking(null);
      }
      const result = await fetchSeatMap(flightId);
      const mapped = parseSeatMapResponse(result as Record<string, unknown>);
      setSeatMap(mapped);
      selectedFlightIdRef.current = flightId;
      setSelectedSeatId(null);
      setBookingStep('customize');
      switchView('seats');
    } catch (err) {
      console.error('Failed to load seat map:', err);
    } finally {
      unlockProcessing();
    }
  };

  const handleSeatSelect = async (seatId: string) => {
    const flightId = selectedFlightIdRef.current;
    if (!flightId || !lockProcessing()) return;
    try {
      const result = await selectSeatApi(flightId, seatId);
      const seat = result.seat as Record<string, unknown> | undefined;
      if (seat) {
        setSelectedSeatId(seat.seat_id as string);
      }
      invalidateBookingIfPending();
    } catch (err) {
      console.error('Failed to select seat:', err);
    } finally {
      unlockProcessing();
    }
  };

  const handleBaggageChange = async (count: number) => {
    if (!lockProcessing()) return;
    try {
      await setBaggageApi(count);
      setBaggage(count);
      invalidateBookingIfPending();
    } catch (err) {
      console.error('Failed to update baggage:', err);
    } finally {
      unlockProcessing();
    }
  };

  const handleMealChange = async (meal: string) => {
    if (!lockProcessing()) return;
    try {
      await setMealApi(meal);
      setMealPreference(meal);
      invalidateBookingIfPending();
    } catch (err) {
      console.error('Failed to update meal:', err);
    } finally {
      unlockProcessing();
    }
  };

  const handleCreateBooking = async (name: string, email: string) => {
    if (!lockProcessing()) return;
    try {
      const result = await createBookingApi(name, email);
      const b = result.booking as Booking | undefined;
      if (b) {
        setBooking(b);
        setBookingStep('book');
        switchView('booking');
      }
    } catch (err) {
      console.error('Failed to create booking:', err);
    } finally {
      unlockProcessing();
    }
  };

  const handleConfirmBooking = async () => {
    if (!lockProcessing()) return;
    setIsConfirming(true);
    try {
      const result = await confirmBookingApi();
      const b = result.booking as Booking | undefined;
      if (b) {
        setBooking(b);
        setBookingStep('confirm');
        switchView('booking');

        const code = result.confirmation_code as string;
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Your booking has been confirmed! 🎉\n\n**Confirmation Code: ${code}**\n\n- **Passenger:** ${b.passenger.name}\n- **Flight:** ${b.flight.flight_id} — ${b.flight.origin} → ${b.flight.destination}\n- **Date:** ${b.flight.date}\n- **Seat:** ${b.seat}\n- **Total:** $${b.pricing.total}\n\nThank you for booking with us!`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (err) {
      console.error('Failed to confirm booking:', err);
    } finally {
      setIsConfirming(false);
      unlockProcessing();
    }
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
          <ChatInput onSendMessage={handleSendMessage} disabled={isProcessing} />
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
            bookingStep={bookingStep}
            disabled={isProcessing}
            isConfirming={isConfirming}
            onBookFlight={handleBookFlight}
            onSeatSelect={handleSeatSelect}
            onBaggageChange={handleBaggageChange}
            onMealChange={handleMealChange}
            onCreateBooking={handleCreateBooking}
            onConfirmBooking={handleConfirmBooking}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
