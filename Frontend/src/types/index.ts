export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  meta?: CacheMeta;
  isLoading?: boolean;
  error?: string;
}

export interface CacheMeta {
  hit: boolean;
  score?: number;
  latency: number;
  model?: string;
  savedLatency?: number;
}

export interface CacheStats {
  avgSavedLatency: number;
  hitRate: number;
  totalQueries: number;
  totalHits: number;
  missMedianLatency: number;
  recentHits: RecentHit[];
}

export interface RecentHit {
  query: string;
  threshold: number;
  score: number;
  savedLatency: number;
  timestamp: number; // Unix timestamp from backend
}