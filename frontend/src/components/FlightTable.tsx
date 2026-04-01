import { Flight } from '@/types';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Plane, Clock, Ticket } from 'lucide-react';

interface FlightTableProps {
  flights: Flight[];
  selectedFlightId?: string | null;
  onBookFlight?: (flightId: string) => void;
  disabled?: boolean;
}

export function FlightTable({ flights, selectedFlightId, onBookFlight, disabled }: FlightTableProps) {
  if (flights.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-6 sm:p-8">
        <div className="text-center">
          <Plane className="h-12 w-12 sm:h-14 sm:w-14 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-base sm:text-lg font-medium text-foreground/60">No flights available</p>
          <p className="text-xs sm:text-sm mt-1.5 text-muted-foreground">Search for flights in the chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-muted/20 p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <div className="flex items-baseline gap-2">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">Available Flights</h2>
          <span className="text-sm text-muted-foreground">({flights.length})</span>
        </div>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground">Choose a flight to continue. Seats and add-ons can be skipped later.</p>
      </div>
      <div className="space-y-3 sm:space-y-4">
        {flights.map((flight) => (
          <Card
            key={flight.flight_id}
            className={`overflow-hidden border-border transition-colors ${selectedFlightId === flight.flight_id ? 'border-primary ring-1 ring-primary/30' : 'hover:border-primary/30'}`}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex justify-between items-start mb-4 sm:mb-5">
                <div className="space-y-0.5">
                  <div className="text-xs sm:text-sm text-muted-foreground">{flight.airline}</div>
                  <div className="text-xl sm:text-2xl font-semibold text-foreground">{flight.flight_id}</div>
                </div>
                <div className="text-right space-y-0.5">
                  <div className="text-2xl sm:text-3xl font-bold text-primary">${flight.price}</div>
                  <div className="text-xs text-muted-foreground">per person</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-5">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">From</div>
                  <div className="text-base sm:text-lg font-semibold leading-tight text-foreground">{flight.origin_display ?? flight.origin}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{flight.origin_airport ?? flight.departure_time}</div>
                  {flight.origin_airport && (
                    <div className="text-xs sm:text-sm text-muted-foreground">Departs {flight.departure_time}</div>
                  )}
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-center space-y-1">
                    <Plane className="h-4 w-4 sm:h-5 sm:w-5 mx-auto text-muted-foreground/60" />
                    <div className="text-xs text-muted-foreground flex items-center gap-1 justify-center">
                      <Clock className="h-3 w-3" />
                      <span>{flight.duration}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">To</div>
                  <div className="text-base sm:text-lg font-semibold leading-tight text-foreground">{flight.destination_display ?? flight.destination}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{flight.destination_airport ?? flight.arrival_time}</div>
                  {flight.destination_airport && (
                    <div className="text-xs sm:text-sm text-muted-foreground">Arrives {flight.arrival_time}</div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 pt-3 sm:pt-4 border-t border-border">
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {flight.aircraft}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {flight.date}
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end pt-4 border-t border-border/60">
                <Button
                  type="button"
                  className={`sm:min-w-28 ${selectedFlightId === flight.flight_id ? 'ring-2 ring-primary/20 ring-offset-2 ring-offset-card' : 'shadow-sm'}`}
                  disabled={disabled}
                  onClick={() => onBookFlight?.(flight.flight_id)}
                >
                  <Ticket className="mr-2 h-4 w-4" />
                  {selectedFlightId === flight.flight_id ? 'Booked' : 'Book'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
