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
