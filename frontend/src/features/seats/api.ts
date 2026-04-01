import { apiClient } from '@/shared/api/client';

interface DirectResponse {
  status: 'success' | 'error';
  message?: string;
  [key: string]: unknown;
}

const directCall = async <T extends DirectResponse>(
  url: string,
  body?: Record<string, unknown>,
): Promise<T> => {
  const response = await apiClient.post<T>(url, body);
  if (response.data.status === 'error') {
    throw new Error(response.data.message || 'An error occurred');
  }

  return response.data;
};

export const fetchSeatMap = (flightId: string) =>
  directCall('/api/seat-map', { flight_id: flightId });

export const selectSeatApi = (flightId: string, seatId: string) =>
  directCall('/api/select-seat', { flight_id: flightId, seat_id: seatId });
