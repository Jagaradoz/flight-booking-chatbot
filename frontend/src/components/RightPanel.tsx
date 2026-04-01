import { useState, useEffect } from 'react';
import { Flight, SeatMap as SeatMapType, Booking } from '@/types';
import { FlightTable } from './FlightTable';
import { SeatMap } from './SeatMap';
import { AddOnsPanel } from './AddOnsPanel';
import { BookingSummary } from './BookingSummary';

type ViewMode = 'flights' | 'seats' | 'addons' | 'booking';
type BookingStep = 'search' | 'select' | 'customize' | 'book' | 'confirm';

interface RightPanelProps {
  flights: Flight[];
  seatMap: SeatMapType | null;
  booking: Booking | null;
  baggage: number;
  mealPreference: string | null;
  activeView?: { view: ViewMode; key: number } | null;
  selectedFlightId?: string | null;
  selectedSeatId?: string | null;
  bookingStep: BookingStep;
  disabled?: boolean;
  isConfirming?: boolean;
  onBookFlight?: (flightId: string) => void;
  onSeatSelect?: (seatId: string) => void;
  onBackFromSeats?: () => void;
  onNextFromSeats?: () => void;
  onBackFromAddOns?: () => void;
  onBaggageChange?: (count: number) => void;
  onMealChange?: (meal: string) => void;
  onNextFromAddOns?: () => void;
  onBackFromBooking?: () => void;
  onCreateBooking?: (name: string, email: string) => void;
  onConfirmBooking?: () => void;
}

export function RightPanel({
  flights,
  seatMap,
  booking,
  baggage,
  mealPreference,
  activeView,
  selectedFlightId,
  selectedSeatId,
  bookingStep,
  disabled,
  isConfirming,
  onBookFlight,
  onSeatSelect,
  onBackFromSeats,
  onNextFromSeats,
  onBackFromAddOns,
  onBaggageChange,
  onMealChange,
  onNextFromAddOns,
  onBackFromBooking,
  onCreateBooking,
  onConfirmBooking,
}: RightPanelProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('flights');

  useEffect(() => {
    if (activeView) {
      setViewMode(activeView.view);
      return;
    }

    if (bookingStep === 'search' || bookingStep === 'select') {
      setViewMode('flights');
    }
  }, [activeView, bookingStep]);

  const effectiveView = bookingStep === 'search' || bookingStep === 'select'
    ? 'flights'
    : viewMode;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        {effectiveView === 'flights' && (
          <FlightTable
            flights={flights}
            selectedFlightId={selectedFlightId}
            onBookFlight={onBookFlight}
            disabled={disabled}
          />
        )}
        {effectiveView === 'seats' && (
          <SeatMap
            seatMap={seatMap}
            onSeatSelect={onSeatSelect}
            selectedSeatId={selectedSeatId}
            disabled={disabled}
            onBack={onBackFromSeats}
            onNext={onNextFromSeats}
          />
        )}
        {effectiveView === 'addons' && (
          <AddOnsPanel
            baggage={baggage}
            mealPreference={mealPreference}
            onBaggageChange={onBaggageChange}
            onMealChange={onMealChange}
            disabled={disabled}
            onBack={onBackFromAddOns}
            onNext={onNextFromAddOns}
          />
        )}
        {effectiveView === 'booking' && (
          <BookingSummary
            booking={booking}
            showForm={bookingStep === 'customize' || bookingStep === 'book'}
            isConfirming={isConfirming}
            disabled={disabled}
            onBack={onBackFromBooking}
            onCreateBooking={onCreateBooking}
            onConfirm={onConfirmBooking}
          />
        )}
      </div>
    </div>
  );
}
