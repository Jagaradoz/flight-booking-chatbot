import { useState, useRef, useEffect } from 'react';
import { Header } from '@/app/components/Header';
import { setBaggageApi, setMealApi } from '@/features/addons/api';
import { createBookingApi, confirmBookingApi } from '@/features/bookings/api';
import type { Booking } from '@/features/bookings/types';
import { sendMessage } from '@/features/chat/api';
import { ChatInput } from '@/features/chat/components/ChatInput';
import { ChatWindow } from '@/features/chat/components/ChatWindow';
import type { Message, ToolData } from '@/features/chat/types';
import { fetchFlights } from '@/features/flights/api';
import type { Flight } from '@/features/flights/types';
import { fetchSeatMap, selectSeatApi } from '@/features/seats/api';
import type { Seat, SeatMap } from '@/features/seats/types';
import { resetConversation, checkHealth } from '@/features/system/api';
import { RightPanel } from '@/features/trip-panel/components/RightPanel';
import type { ActiveView, BookingStep, ViewMode } from '@/features/trip-panel/types';
import { Button } from '@/shared/ui/button';
import { RotateCcw, X } from 'lucide-react';

const STREAM_STEP_MS = 22;
const STREAM_FAST_STEP_MS = 14;


function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [seatMap, setSeatMap] = useState<SeatMap | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [baggage, setBaggage] = useState(0);
  const [mealPreference, setMealPreference] = useState<string | null>(null);
  const [bookingStep, setBookingStep] = useState<BookingStep>('search');
  const [activeView, setActiveView] = useState<ActiveView | null>(null);
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [isPanelDrawerOpen, setIsPanelDrawerOpen] = useState(false);
  const activeViewKeyRef = useRef(0);
  const selectedFlightIdRef = useRef<string | null>(null);
  const isProcessingRef = useRef(false);
  const processingTokenRef = useRef(0);
  const sessionVersionRef = useRef(0);
  const streamingTimeoutRef = useRef<number | null>(null);
  const assistantCycleRef = useRef(0);
  const inputFocusKeyRef = useRef(0);
  const [inputFocusKey, setInputFocusKey] = useState(0);
  const inputResetKeyRef = useRef(0);
  const [inputResetKey, setInputResetKey] = useState(0);
  const isAssistantBusy = isProcessing || isLoading || streamingMessage !== null;

  const requestInputFocus = () => {
    inputFocusKeyRef.current += 1;
    setInputFocusKey(inputFocusKeyRef.current);
  };

  const requestInputReset = () => {
    inputResetKeyRef.current += 1;
    setInputResetKey(inputResetKeyRef.current);
  };

  const clearStreamingTimeout = () => {
    if (streamingTimeoutRef.current !== null) {
      window.clearTimeout(streamingTimeoutRef.current);
      streamingTimeoutRef.current = null;
    }
  };

  const getStreamingStep = (remainingLength: number) => {
    if (remainingLength > 240) return 8;
    if (remainingLength > 120) return 5;
    if (remainingLength > 60) return 3;
    return 2;
  };

  const streamAssistantMessage = (content: string, cycleId: number) => {
    clearStreamingTimeout();

    const nextMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };

    if (!content) {
      if (cycleId !== assistantCycleRef.current) {
        return Promise.resolve();
      }
      setMessages((prev) => [...prev, { ...nextMessage, content }]);
      requestInputFocus();
      return Promise.resolve();
    }

    setStreamingMessage(nextMessage);

    return new Promise<void>((resolve) => {
      let visibleLength = 0;

      const tick = () => {
        if (cycleId !== assistantCycleRef.current) {
          clearStreamingTimeout();
          setStreamingMessage(null);
          resolve();
          return;
        }

        visibleLength = Math.min(content.length, visibleLength + getStreamingStep(content.length - visibleLength));
        const partialContent = content.slice(0, visibleLength);

        setStreamingMessage((prev) => (
          prev
            ? { ...prev, content: partialContent }
            : { ...nextMessage, content: partialContent }
        ));

        if (visibleLength >= content.length) {
          clearStreamingTimeout();
          setMessages((prev) => [...prev, { ...nextMessage, content }]);
          setStreamingMessage(null);
          requestInputFocus();
          resolve();
          return;
        }

        const delay = content.length > 180 ? STREAM_FAST_STEP_MS : STREAM_STEP_MS;
        streamingTimeoutRef.current = window.setTimeout(tick, delay);
      };

      streamingTimeoutRef.current = window.setTimeout(tick, STREAM_FAST_STEP_MS);
    });
  };

  const mapFlights = (rawFlights: Record<string, unknown>[]): Flight[] => (
    rawFlights.map((flight) => ({
      flight_id: flight.flight_id as string,
      airline: flight.airline as string,
      origin: flight.origin as string,
      destination: flight.destination as string,
      origin_display: flight.origin_display as string | undefined,
      destination_display: flight.destination_display as string | undefined,
      origin_airport: flight.origin_airport as string | undefined,
      destination_airport: flight.destination_airport as string | undefined,
      departure_time: flight.departure_time as string,
      arrival_time: flight.arrival_time as string,
      duration: flight.duration as string,
      price: (flight.price_per_passenger ?? flight.price) as number,
      aircraft: flight.aircraft as string,
      date: (flight.date as string) || '',
    }))
  );

  const loadInitialFlights = async () => {
    const sessionVersion = sessionVersionRef.current;
    try {
      const rawFlights = await fetchFlights();
      if (sessionVersion !== sessionVersionRef.current) return;
      setFlights(mapFlights(rawFlights));
    } catch (error) {
      console.error('Failed to load flights:', error);
    }
  };

  useEffect(() => {
    checkHealth().then(setIsConnected);
    loadInitialFlights();
  }, []);

  useEffect(() => () => {
    clearStreamingTimeout();
  }, []);

  useEffect(() => {
    if (!isPanelDrawerOpen) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isPanelDrawerOpen]);

  const switchView = (view: ViewMode) => {
    activeViewKeyRef.current += 1;
    setActiveView({ view, key: activeViewKeyRef.current });
  };

  const lockProcessing = () => {
    if (isProcessingRef.current) return false;
    processingTokenRef.current += 1;
    isProcessingRef.current = true;
    setIsProcessing(true);
    return processingTokenRef.current;
  };

  const unlockProcessing = (token?: number) => {
    if (typeof token === 'number' && token !== processingTokenRef.current) {
      return;
    }
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
          setSelectedFlightId(null);
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
          setSelectedFlightId(result.flight_id as string);
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
    const processingToken = lockProcessing();
    if (!processingToken) return;
    const cycleId = assistantCycleRef.current;
    const sessionVersion = sessionVersionRef.current;

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
      if (cycleId !== assistantCycleRef.current || sessionVersion !== sessionVersionRef.current) return;
      setIsLoading(false);
      processToolData(tool_data);
      await streamAssistantMessage(text, cycleId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      if (cycleId !== assistantCycleRef.current || sessionVersion !== sessionVersionRef.current) return;

      setIsLoading(false);
      await streamAssistantMessage(`Error: ${errorMessage}`, cycleId);
    } finally {
      unlockProcessing(processingToken);
    }
  };

  const handleReset = async () => {
    try {
      processingTokenRef.current += 1;
      sessionVersionRef.current += 1;
      assistantCycleRef.current += 1;
      await resetConversation();
      clearStreamingTimeout();
      setMessages([]);
      setStreamingMessage(null);
      setIsLoading(false);
      setFlights([]);
      setSeatMap(null);
      setBooking(null);
      setBaggage(0);
      setMealPreference(null);
      setIsConfirming(false);
      setBookingStep('search');
      switchView('flights');
      setIsPanelDrawerOpen(false);
      setSelectedFlightId(null);
      setSelectedSeatId(null);
      selectedFlightIdRef.current = null;
      unlockProcessing();
      loadInitialFlights();
      requestInputReset();
      requestInputFocus();
    } catch (err) {
      console.error('Failed to reset conversation:', err);
    }
  };

  const handleBookFlight = async (flightId: string) => {
    const processingToken = lockProcessing();
    if (!processingToken) return;
    const sessionVersion = sessionVersionRef.current;
    try {
      if (selectedFlightId !== flightId) {
        setSeatMap(null);
        setSelectedSeatId(null);
        setBaggage(0);
        setMealPreference(null);
        setBooking(null);
      }
      const result = await fetchSeatMap(flightId);
      if (sessionVersion !== sessionVersionRef.current) return;
      const mapped = parseSeatMapResponse(result as Record<string, unknown>);
      setSeatMap(mapped);
      setSelectedFlightId(flightId);
      selectedFlightIdRef.current = flightId;
      setBookingStep('customize');
      switchView('seats');
    } catch (err) {
      console.error('Failed to load seat map:', err);
    } finally {
      unlockProcessing(processingToken);
    }
  };

  const handleNextFromSeats = () => {
    switchView('addons');
  };

  const handleBackFromSeats = () => {
    switchView('flights');
  };

  const handleBackFromAddOns = () => {
    switchView('seats');
  };

  const handleNextFromAddOns = () => {
    switchView('booking');
  };

  const handleBackFromBooking = () => {
    switchView('addons');
  };

  const handleSeatSelect = async (seatId: string) => {
    const flightId = selectedFlightIdRef.current;
    if (!flightId) return;
    const processingToken = lockProcessing();
    if (!processingToken) return;
    const sessionVersion = sessionVersionRef.current;
    try {
      const result = await selectSeatApi(flightId, seatId);
      if (sessionVersion !== sessionVersionRef.current) return;
      const seat = result.seat as Record<string, unknown> | undefined;
      if (seat) {
        setSelectedSeatId(seat.seat_id as string);
      }
      invalidateBookingIfPending();
    } catch (err) {
      console.error('Failed to select seat:', err);
    } finally {
      unlockProcessing(processingToken);
    }
  };

  const handleBaggageChange = async (count: number) => {
    const processingToken = lockProcessing();
    if (!processingToken) return;
    const sessionVersion = sessionVersionRef.current;
    try {
      await setBaggageApi(count);
      if (sessionVersion !== sessionVersionRef.current) return;
      setBaggage(count);
      invalidateBookingIfPending();
    } catch (err) {
      console.error('Failed to update baggage:', err);
    } finally {
      unlockProcessing(processingToken);
    }
  };

  const handleMealChange = async (meal: string) => {
    const processingToken = lockProcessing();
    if (!processingToken) return;
    const sessionVersion = sessionVersionRef.current;
    try {
      await setMealApi(meal);
      if (sessionVersion !== sessionVersionRef.current) return;
      setMealPreference(meal);
      invalidateBookingIfPending();
    } catch (err) {
      console.error('Failed to update meal:', err);
    } finally {
      unlockProcessing(processingToken);
    }
  };

  const handleCreateBooking = async (name: string, email: string) => {
    const processingToken = lockProcessing();
    if (!processingToken) return;
    const sessionVersion = sessionVersionRef.current;
    try {
      const result = await createBookingApi(name, email);
      if (sessionVersion !== sessionVersionRef.current) return;
      const b = result.booking as Booking | undefined;
      if (b) {
        setBooking(b);
        setBookingStep('book');
        switchView('booking');
      }
    } catch (err) {
      console.error('Failed to create booking:', err);
    } finally {
      unlockProcessing(processingToken);
    }
  };

  const handleConfirmBooking = async () => {
    const processingToken = lockProcessing();
    if (!processingToken) return;
    const sessionVersion = sessionVersionRef.current;
    setIsConfirming(true);
    try {
      const result = await confirmBookingApi();
      if (sessionVersion !== sessionVersionRef.current) return;
      const b = result.booking as Booking | undefined;
      if (b) {
        setBooking(b);
        setBookingStep('confirm');
        switchView('booking');

        const code = result.confirmation_code as string;
        const assistantSummary = (result.assistant_summary as string | undefined) ?? `Your booking has been confirmed!\n\n**Confirmation Code: ${code}**\n\n- **Passenger:** ${b.passenger.name}\n- **Flight:** ${b.flight.flight_id} — ${b.flight.origin} → ${b.flight.destination}\n- **Date:** ${b.flight.date}\n- **Seat:** ${b.seat}\n- **Total:** $${b.pricing.total}\n\nThank you for booking with us!`;
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: assistantSummary,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (err) {
      console.error('Failed to confirm booking:', err);
    } finally {
      setIsConfirming(false);
      unlockProcessing(processingToken);
    }
  };

  const togglePanelDrawer = () => {
    setIsPanelDrawerOpen((prev) => !prev);
  };

  const closePanelDrawer = () => {
    setIsPanelDrawerOpen(false);
  };

  const rightPanelContent = (
    <RightPanel
      flights={flights}
      seatMap={seatMap}
      booking={booking}
      baggage={baggage}
      mealPreference={mealPreference}
      activeView={activeView}
      selectedFlightId={selectedFlightId}
      selectedSeatId={selectedSeatId}
      bookingStep={bookingStep}
      disabled={isProcessing}
      isConfirming={isConfirming}
      onBookFlight={handleBookFlight}
      onSeatSelect={handleSeatSelect}
      onBackFromSeats={handleBackFromSeats}
      onNextFromSeats={handleNextFromSeats}
      onBackFromAddOns={handleBackFromAddOns}
      onBaggageChange={handleBaggageChange}
      onMealChange={handleMealChange}
      onNextFromAddOns={handleNextFromAddOns}
      onBackFromBooking={handleBackFromBooking}
      onCreateBooking={handleCreateBooking}
      onConfirmBooking={handleConfirmBooking}
    />
  );

  return (
    <div className="flex flex-col h-screen">
      {!isConnected && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2 text-center text-sm text-destructive">
          Cannot connect to server. Please ensure the backend is running on http://localhost:8000
        </div>
      )}
      <Header onReset={handleReset} onTogglePanel={togglePanelDrawer} isPanelOpen={isPanelDrawerOpen} />
      <div className="relative flex flex-1 min-h-0 overflow-hidden lg:flex-row">
        <div className="flex min-h-0 w-full flex-1 flex-col lg:w-1/2 lg:border-r border-border">
          <ChatWindow messages={messages} isLoading={isLoading} streamingMessage={streamingMessage} bookingStep={bookingStep} />
          <ChatInput onSendMessage={handleSendMessage} isBusy={isAssistantBusy} focusRequestKey={inputFocusKey} resetRequestKey={inputResetKey} />
        </div>
        <div className="hidden lg:block lg:w-1/2 lg:overflow-hidden">
          {rightPanelContent}
        </div>

        <div
          className={`lg:hidden fixed inset-0 z-[80] transition-opacity duration-300 ${isPanelDrawerOpen ? 'pointer-events-auto bg-foreground/20 opacity-100 backdrop-blur-[2px]' : 'pointer-events-none opacity-0'}`}
          onClick={closePanelDrawer}
          aria-hidden="true"
        />
        <aside
          id="mobile-right-panel"
          className={`lg:hidden fixed inset-y-0 right-0 z-[90] flex h-screen w-full max-w-none flex-col border-l border-border bg-card shadow-2xl transition-transform duration-300 ease-out md:w-[70vw] ${isPanelDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
          aria-hidden={!isPanelDrawerOpen}
        >
          <div className="flex items-start justify-between border-b border-border px-4 py-3 gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Trip panel</p>
              <p className="text-xs text-muted-foreground">Flights, seats, extras, and booking details</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground focus-visible:ring-destructive"
                onClick={handleReset}
                aria-label="Reset booking flow"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-9 w-9"
                onClick={closePanelDrawer}
                aria-label="Close trip panel"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            {rightPanelContent}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;
