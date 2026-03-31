import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ToolData {
  tool: string;
  result: Record<string, unknown>;
}

export interface ChatResponse {
  response: string;
  tool_data: ToolData[];
  status: 'success' | 'error';
}

export interface ResetResponse {
  message: string;
  status: 'success';
}

export interface HealthResponse {
  status: 'healthy';
}

export interface ChatResult {
  text: string;
  tool_data: ToolData[];
}

export const sendMessage = async (message: string): Promise<ChatResult> => {
  try {
    const response = await api.post<ChatResponse>('/api/chat', { message });
    if (response.data.status === 'error') {
      throw new Error(response.data.response);
    }
    return { text: response.data.response, tool_data: response.data.tool_data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data.response || 'Server error occurred');
      } else if (error.request) {
        throw new Error('Cannot connect to server. Please ensure the backend is running on http://localhost:8000');
      }
    }
    throw new Error('An unexpected error occurred');
  }
};

export const resetConversation = async (): Promise<void> => {
  try {
    await api.post<ResetResponse>('/api/reset');
  } catch (error) {
    console.error('Failed to reset conversation:', error);
    throw new Error('Failed to reset conversation');
  }
};

export const checkHealth = async (): Promise<boolean> => {
  try {
    const response = await api.get<HealthResponse>('/api/health');
    return response.data.status === 'healthy';
  } catch (error) {
    return false;
  }
};
