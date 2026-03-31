export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Flight {
  flight_id: string;
  airline: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  price: number;
  aircraft: string;
  date: string;
}

export interface Seat {
  seat_id: string;
  type: 'window' | 'middle' | 'aisle';
  section: 'business' | 'economy_plus' | 'economy';
  extra_cost: number;
  occupied: boolean;
}

export interface SeatMap {
  flight_id: string;
  aircraft: string;
  total_seats: number;
  available_seats: number;
  occupied_seats: number;
  sections: {
    [key: string]: {
      available: number;
      extra_cost: number;
    };
  };
  seats: Seat[];
}

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
