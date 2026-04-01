export interface Flight {
  flight_id: string;
  airline: string;
  origin: string;
  destination: string;
  origin_display?: string;
  destination_display?: string;
  origin_airport?: string;
  destination_airport?: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  price: number;
  aircraft: string;
  date: string;
}
