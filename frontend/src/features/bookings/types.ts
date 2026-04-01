import type { Flight } from '@/features/flights/types';
import type { Seat } from '@/features/seats/types';

export interface BookingState {
  selected_flight: Flight | null;
  selected_seat: Seat | null;
  baggage: number;
  meal_preference: string | null;
  passenger_name: string | null;
  passenger_email: string | null;
}

export interface Booking {
  status: 'pending' | 'confirmed';
  confirmation_code?: string;
  passenger: {
    name: string;
    email: string;
  };
  flight: {
    flight_id: string;
    airline: string;
    origin: string;
    destination: string;
    date: string;
    departure_time: string;
    arrival_time: string;
    duration: string;
  };
  seat: string;
  seat_section: string | null;
  baggage: string;
  meal: string;
  pricing: {
    base_fare: number;
    seat_upgrade: number;
    baggage: number;
    total: number;
  };
}
