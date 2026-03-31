import { useState, useEffect } from 'react';
import { Flight, SeatMap as SeatMapType, Booking } from '@/types';
import { FlightTable } from './FlightTable';
import { SeatMap } from './SeatMap';
import { AddOnsPanel } from './AddOnsPanel';
import { BookingSummary } from './BookingSummary';
import { Button } from './ui/button';
import { Plane, Armchair, ShoppingBag, FileText } from 'lucide-react';

type ViewMode = 'flights' | 'seats' | 'addons' | 'booking';

interface RightPanelProps {
  flights: Flight[];
  seatMap: SeatMapType | null;
  booking: Booking | null;
  baggage: number;
  mealPreference: string | null;
  activeView?: { view: ViewMode; key: number } | null;
  onSeatSelect?: (seatId: string) => void;
  onBaggageChange?: (count: number) => void;
  onMealChange?: (meal: string) => void;
}

export function RightPanel({
  flights,
  seatMap,
  booking,
  baggage,
  mealPreference,
  activeView,
  onSeatSelect,
  onBaggageChange,
  onMealChange,
}: RightPanelProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('flights');

  useEffect(() => {
    if (activeView) {
      setViewMode(activeView.view);
    }
  }, [activeView]);

  const hasFlights = flights.length > 0;
  const hasSeatMap = seatMap !== null;
  const hasBooking = booking !== null;

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="border-b border-border px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex gap-1 sm:gap-2 overflow-x-auto">
          <Button
            variant={viewMode === 'flights' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('flights')}
            className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0"
          >
            <Plane className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Flights</span>
            {hasFlights && <span className="ml-0.5 sm:ml-1 text-xs font-medium">{flights.length}</span>}
          </Button>
          <Button
            variant={viewMode === 'seats' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('seats')}
            disabled={!hasSeatMap}
            className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0"
          >
            <Armchair className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Seats</span>
          </Button>
          <Button
            variant={viewMode === 'addons' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('addons')}
            className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Add-ons</span>
          </Button>
          <Button
            variant={viewMode === 'booking' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('booking')}
            className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0"
          >
            <FileText className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Booking</span>
            {hasBooking && <span className="ml-1 w-1.5 h-1.5 bg-success rounded-full"></span>}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {viewMode === 'flights' && <FlightTable flights={flights} />}
        {viewMode === 'seats' && <SeatMap seatMap={seatMap} onSeatSelect={onSeatSelect} />}
        {viewMode === 'addons' && (
          <AddOnsPanel
            baggage={baggage}
            mealPreference={mealPreference}
            onBaggageChange={onBaggageChange}
            onMealChange={onMealChange}
          />
        )}
        {viewMode === 'booking' && <BookingSummary booking={booking} />}
      </div>
    </div>
  );
}
