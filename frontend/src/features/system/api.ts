import { apiClient } from '@/shared/api/client';

interface ResetResponse {
  message: string;
  status: 'success';
}

interface HealthResponse {
  status: 'healthy';
}

export const resetConversation = async (): Promise<void> => {
  try {
    await apiClient.post<ResetResponse>('/api/reset');
  } catch (error) {
    console.error('Failed to reset conversation:', error);
    throw new Error('Failed to reset conversation');
  }
};

export const checkHealth = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get<HealthResponse>('/api/health');
    return response.data.status === 'healthy';
  } catch (error) {
    return false;
  }
};
