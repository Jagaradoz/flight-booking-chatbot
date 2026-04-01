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

export const createBookingApi = (passengerName: string, passengerEmail: string) =>
  directCall('/api/create-booking', {
    passenger_name: passengerName,
    passenger_email: passengerEmail,
  });

export const confirmBookingApi = () => directCall('/api/confirm-booking');
