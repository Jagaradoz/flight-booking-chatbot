import { useState } from 'react';
import type { Booking } from '@/features/bookings/types';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { CheckCircle2, Clock, Plane, User, Mail, Utensils, Luggage, MapPin, Loader2 } from 'lucide-react';

interface BookingSummaryProps {
  booking: Booking | null;
  showForm?: boolean;
  isConfirming?: boolean;
  disabled?: boolean;
  onBack?: () => void;
  onCreateBooking?: (name: string, email: string) => void;
  onConfirm?: () => void;
}

export function BookingSummary({ booking, showForm, isConfirming, disabled, onBack, onCreateBooking, onConfirm }: BookingSummaryProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  if (!booking && showForm) {
    const isValidEmail = email.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    const canSubmit = name.trim().length > 0 && isValidEmail && !disabled;

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (canSubmit) {
        onCreateBooking?.(name.trim(), email.trim());
      }
    };

    return (
      <div className="space-y-4">
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              Passenger Details
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground">Enter your details to create a booking</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-foreground" htmlFor="passenger-name">Full Name</label>
                <Input
                  id="passenger-name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={disabled}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-foreground" htmlFor="passenger-email">Email</label>
                <Input
                  id="passenger-email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={disabled}
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <Button type="button" variant="outline" disabled={disabled} onClick={onBack}>
                  Back
                </Button>
                <Button type="submit" disabled={!canSubmit}>
                  Next
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center h-full p-6 sm:p-8">
        <div className="text-center">
          <Clock className="h-12 w-12 sm:h-14 sm:w-14 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-base sm:text-lg font-medium text-foreground/60">No booking in progress</p>
          <p className="text-xs sm:text-sm mt-1.5 text-muted-foreground">Start by selecting a flight</p>
        </div>
      </div>
    );
  }

  const isConfirmed = booking.status === 'confirmed';

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">
            {isConfirmed ? 'Booking Confirmed' : 'Booking Confirmation'}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {isConfirmed ? 'Your trip is confirmed and your booking details are ready below.' : 'Review your itinerary and confirm your booking when you are ready.'}
        </p>
      </div>

      <Card className={isConfirmed ? 'border-success border-2' : 'border-border'}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            {isConfirmed ? (
              <>
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
                Booking Confirmed
              </>
            ) : (
              <>
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
                Pending Confirmation
              </>
            )}
          </CardTitle>
          {isConfirmed && booking.confirmation_code && (
            <div className="mt-3 p-3 sm:p-4 bg-success/5 border border-success/20 rounded-lg">
              <p className="text-xs sm:text-sm text-muted-foreground">Confirmation Code</p>
              <p className="text-xl sm:text-2xl font-bold text-success mt-1">{booking.confirmation_code}</p>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-2 sm:gap-3">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Passenger</p>
                <p className="font-semibold text-sm sm:text-base truncate">{booking.passenger.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-2 sm:gap-3">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Email</p>
                <p className="font-semibold text-sm sm:text-base truncate">{booking.passenger.email}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Plane className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <p className="font-semibold text-sm sm:text-base">Flight Details</p>
            </div>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Flight</span>
                <span className="font-medium text-right">{booking.flight.flight_id} - {booking.flight.airline}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Route</span>
                <span className="font-medium">{booking.flight.origin} → {booking.flight.destination}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{booking.flight.date}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Departure</span>
                <span className="font-medium">{booking.flight.departure_time}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Arrival</span>
                <span className="font-medium">{booking.flight.arrival_time}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">{booking.flight.duration}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Seat</span>
                </div>
                <span className="font-medium">{booking.seat}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Luggage className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Baggage</span>
                </div>
                <span className="font-medium">{booking.baggage}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Utensils className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Meal</span>
                </div>
                <span className="font-medium">{booking.meal}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="font-semibold mb-3 text-sm sm:text-base">Pricing Breakdown</p>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Fare</span>
                <span className="font-medium">${booking.pricing.base_fare}</span>
              </div>
              {booking.pricing.seat_upgrade > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seat Upgrade</span>
                  <span className="font-medium">${booking.pricing.seat_upgrade}</span>
                </div>
              )}
              {booking.pricing.baggage > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Baggage</span>
                  <span className="font-medium">${booking.pricing.baggage}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base sm:text-lg border-t border-border pt-2 mt-2">
                <span>Total</span>
                <span className="text-primary">${booking.pricing.total}</span>
              </div>
            </div>
          </div>

          {!isConfirmed && (
            <div className="pt-4">
              <Button onClick={onConfirm} className="w-full" disabled={isConfirming || disabled}>
                {isConfirming ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    CONFIRM
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
