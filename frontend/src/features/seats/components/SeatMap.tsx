import type { SeatMap as SeatMapType, Seat } from '@/features/seats/types';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Armchair } from 'lucide-react';

interface SeatMapProps {
  seatMap: SeatMapType | null;
  onSeatSelect?: (seatId: string) => void;
  selectedSeatId?: string | null;
  disabled?: boolean;
  onBack?: () => void;
  onNext?: () => void;
}

export function SeatMap({ seatMap, onSeatSelect, selectedSeatId, disabled, onBack, onNext }: SeatMapProps) {
  if (!seatMap) {
    return (
      <div className="flex items-center justify-center h-full p-6 sm:p-8">
        <div className="text-center">
          <Armchair className="h-12 w-12 sm:h-14 sm:w-14 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-base sm:text-lg font-medium text-foreground/60">No seat map available</p>
          <p className="text-xs sm:text-sm mt-1.5 text-muted-foreground">Select a flight to view seats</p>
        </div>
      </div>
    );
  }

  const getSeatColor = (seat: Seat) => {
    if (seat.seat_id === selectedSeatId) return 'bg-primary text-primary-foreground border-primary ring-2 ring-primary/50';
    if (seat.occupied) return 'bg-muted text-muted-foreground cursor-not-allowed opacity-50';
    
    switch (seat.section) {
      case 'business':
        return 'bg-primary/10 hover:bg-primary/20 border-primary/30 text-primary';
      case 'economy_plus':
        return 'bg-accent/20 hover:bg-accent/30 border-accent/40 text-accent-foreground';
      case 'economy':
        return 'bg-secondary hover:bg-secondary/80 border-border text-secondary-foreground';
      default:
        return 'bg-muted hover:bg-muted/80 text-muted-foreground';
    }
  };

  const getSeatIcon = (type: string) => {
    return type === 'window' ? '🪟' : type === 'aisle' ? '🚶' : '·';
  };

  const groupedSeats = seatMap.seats.reduce((acc, seat) => {
    const row = seat.seat_id.match(/\d+/)?.[0] || '0';
    if (!acc[row]) acc[row] = [];
    acc[row].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">Seat Map</h2>
          <span className="text-sm text-muted-foreground">{seatMap.aircraft}</span>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {seatMap.available_seats} of {seatMap.total_seats} seats available
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground">Seat selection is optional. You can continue without choosing one.</p>
      </div>

      <Card className="border-border">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 bg-primary/10 border border-primary/30 rounded"></div>
              <span className="text-muted-foreground">Business (+${seatMap.sections.business?.extra_cost || 0})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 bg-accent/20 border border-accent/40 rounded"></div>
              <span className="text-muted-foreground">Economy+ (+${seatMap.sections.economy_plus?.extra_cost || 0})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 bg-secondary border border-border rounded"></div>
              <span className="text-muted-foreground">Economy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 bg-muted opacity-50 rounded"></div>
              <span className="text-muted-foreground">Occupied</span>
            </div>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {Object.keys(groupedSeats).sort((a, b) => parseInt(a) - parseInt(b)).map(row => (
              <div key={row} className="flex items-center gap-2">
                <span className="text-xs font-medium w-6 text-muted-foreground">{row}</span>
                <div className="flex gap-1 flex-wrap">
                  {groupedSeats[row]
                    .sort((a, b) => a.seat_id.localeCompare(b.seat_id))
                    .map(seat => (
                      <button
                        key={seat.seat_id}
                        onClick={() => !seat.occupied && !disabled && onSeatSelect?.(seat.seat_id)}
                        disabled={seat.occupied || disabled}
                        aria-label={`Seat ${seat.seat_id}, ${seat.section} ${seat.type}${seat.extra_cost > 0 ? `, plus $${seat.extra_cost}` : ''}${seat.occupied ? ', occupied' : ''}${seat.seat_id === selectedSeatId ? ', selected' : ''}`}
                        aria-selected={seat.seat_id === selectedSeatId}
                        aria-disabled={seat.occupied || disabled}
                        className={`w-9 h-9 sm:w-10 sm:h-10 text-xs font-medium border rounded transition-colors ${getSeatColor(seat)}`}
                        title={`${seat.seat_id} - ${seat.section} - ${seat.type} ${seat.extra_cost > 0 ? `+$${seat.extra_cost}` : ''}`}
                      >
                        <div>{seat.seat_id.replace(/\d+/, '')}</div>
                        <div className="text-[10px]">{getSeatIcon(seat.type)}</div>
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between pt-4">
        <Button type="button" variant="outline" disabled={disabled} onClick={onBack}>
          Back
        </Button>
        <Button type="button" disabled={disabled} onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
}
