import { apiClient, axios } from '@/shared/api/client';

interface FlightsResponse {
  status: 'success';
  flights: Record<string, unknown>[];
  count: number;
}

export const fetchFlights = async (): Promise<Record<string, unknown>[]> => {
  try {
    const response = await apiClient.get<FlightsResponse>('/api/flights');
    return response.data.flights;
  } catch (error) {
    if (axios.isAxiosError(error) && error.request) {
      throw new Error(
        'Cannot connect to server. Please ensure the backend is running on http://localhost:8000',
      );
    }

    throw new Error('Failed to load flights');
  }
};
