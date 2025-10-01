import { CacheMeta, CacheStats, RecentHit } from '@/types';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? '/api' : 'http://localhost:8000');

// API client with error handling
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || 
          `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  async askQuestion(
    query: string,
    threshold: number
  ): Promise<{ response: string; meta: CacheMeta }> {
    return this.request('/ask', {
      method: 'POST',
      body: JSON.stringify({ query, threshold }),
    });
  }

  async getStats(window: '24h' | '7d'): Promise<CacheStats> {
    // For now, we'll use the same endpoint for both time windows
    // In a real implementation, you'd pass the window parameter
    const stats = await this.request<CacheStats>('/stats');
    
    // The backend already returns the correct format, no transformation needed
    return stats;
  }

  async healthCheck(): Promise<{ status: string; timestamp: number }> {
    return this.request('/health');
  }
}

// Create API client instance
const apiClient = new ApiClient(API_BASE_URL);

// Export API functions
export const askQuestion = (query: string, threshold: number) =>
  apiClient.askQuestion(query, threshold);

export const getStats = (window: '24h' | '7d') =>
  apiClient.getStats(window);

export const healthCheck = () =>
  apiClient.healthCheck();

// Export the client for advanced usage
export { apiClient };
