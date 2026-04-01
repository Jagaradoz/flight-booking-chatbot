import { apiClient, axios } from '@/shared/api/client';

import type { ChatResult, ToolData } from './types';

interface ChatResponse {
  response: string;
  tool_data: ToolData[];
  status: 'success' | 'error';
}

export const sendMessage = async (message: string): Promise<ChatResult> => {
  try {
    const response = await apiClient.post<ChatResponse>('/api/chat', { message });
    if (response.data.status === 'error') {
      throw new Error(response.data.response);
    }

    return {
      text: response.data.response,
      tool_data: response.data.tool_data,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data.response || 'Server error occurred');
      }

      if (error.request) {
        throw new Error(
          'Cannot connect to server. Please ensure the backend is running on http://localhost:8000',
        );
      }
    }

    throw new Error('An unexpected error occurred');
  }
};
