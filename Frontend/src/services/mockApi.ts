import { CacheMeta, CacheStats, RecentHit } from '@/types';

// Simulated cache data
const cachedResponses = new Map([
  ['pwa best practices', {
    response: 'PWA best practices include: 1) Serve content over HTTPS for security, 2) Include a Web App Manifest for installability, 3) Implement a Service Worker for offline functionality, 4) Design responsive layouts that adapt to all screen sizes, 5) Optimize performance with lazy loading and code splitting, 6) Use proper caching strategies for assets and API responses.',
    embedding: [0.82, 0.45, 0.67, 0.91]
  }],
  ['semantic cache', {
    response: 'A semantic cache stores not just exact query matches but understands meaning through embeddings. It uses vector similarity to find related cached responses even when queries differ in wording. This reduces LLM API calls, lowers costs, and improves response times by serving pre-computed answers for semantically similar questions.',
    embedding: [0.76, 0.89, 0.54, 0.33]
  }],
  ['vector search', {
    response: 'Vector search enables finding similar items by comparing high-dimensional embeddings rather than exact keyword matches. It powers recommendation systems, semantic search, and similarity detection. Key components include embedding models, vector databases, and similarity metrics like cosine distance or dot product.',
    embedding: [0.71, 0.88, 0.62, 0.44]
  }],
  ['glassmorphism', {
    response: 'Glassmorphism is a design trend featuring translucent backgrounds with blur effects, creating a frosted glass appearance. Key properties include backdrop-filter blur, semi-transparent backgrounds, subtle borders, and layered depth. It works best with vibrant backgrounds and requires careful contrast management for accessibility.',
    embedding: [0.65, 0.43, 0.78, 0.55]
  }]
]);

// Helper to calculate cosine similarity
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Generate a simple embedding for demo purposes
function generateEmbedding(text: string): number[] {
  const words = text.toLowerCase().split(' ');
  return [
    words.includes('pwa') || words.includes('app') ? 0.8 : 0.3,
    words.includes('cache') || words.includes('semantic') ? 0.85 : 0.4,
    words.includes('vector') || words.includes('search') ? 0.75 : 0.35,
    words.includes('design') || words.includes('glass') ? 0.7 : 0.45
  ];
}

// Mock API endpoint for asking questions
export async function askQuestion(
  query: string,
  threshold: number
): Promise<{ response: string; meta: CacheMeta }> {
  // Simulate network delay
  const baseLatency = Math.floor(Math.random() * 100) + 50;
  await new Promise(resolve => setTimeout(resolve, baseLatency));

  const queryEmbedding = generateEmbedding(query);
  
  // Find best matching cached response
  let bestMatch = { key: '', score: 0, data: null as any };
  
  for (const [key, data] of cachedResponses.entries()) {
    const score = cosineSimilarity(queryEmbedding, data.embedding);
    if (score > bestMatch.score) {
      bestMatch = { key, score, data };
    }
  }

  // Check if score meets threshold
  if (bestMatch.score >= threshold && bestMatch.data) {
    // Cache HIT
    const hitLatency = Math.floor(Math.random() * 20) + 10;
    return {
      response: bestMatch.data.response,
      meta: {
        hit: true,
        score: bestMatch.score,
        latency: hitLatency,
        model: 'cached',
        savedLatency: 800 + Math.floor(Math.random() * 400)
      }
    };
  } else {
    // Cache MISS - generate new response
    const missLatency = Math.floor(Math.random() * 500) + 800;
    await new Promise(resolve => setTimeout(resolve, missLatency));
    
    const responses = [
      'Based on the latest information, here\'s what you need to know about your query...',
      'That\'s an interesting question! Let me provide you with comprehensive insights...',
      'Here\'s a detailed explanation tailored to your specific question...',
      'According to current best practices and recent developments...'
    ];
    
    return {
      response: responses[Math.floor(Math.random() * responses.length)] + 
        ' ' + query.split(' ').slice(0, 20).join(' ') + '... [Generated response with detailed information about the topic]',
      meta: {
        hit: false,
        latency: missLatency,
        model: 'gpt-5-nano'
      }
    };
  }
}

// Mock API for fetching statistics
export async function getStats(window: '24h' | '7d'): Promise<CacheStats> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const recentHits: RecentHit[] = [
    {
      query: 'how to build a pwa?',
      threshold: 0.70,
      score: 0.82,
      savedLatency: 838,
      timestamp: new Date(Date.now() - 1000 * 60 * 5)
    },
    {
      query: 'semantic cache implementation',
      threshold: 0.72,
      score: 0.79,
      savedLatency: 701,
      timestamp: new Date(Date.now() - 1000 * 60 * 12)
    },
    {
      query: 'vector search optimization tips',
      threshold: 0.80,
      score: 0.85,
      savedLatency: 911,
      timestamp: new Date(Date.now() - 1000 * 60 * 29)
    },
    {
      query: 'what is glassmorphism design?',
      threshold: 0.65,
      score: 0.88,
      savedLatency: 1024,
      timestamp: new Date(Date.now() - 1000 * 60 * 45)
    }
  ];

  return {
    avgSavedLatency: 812,
    hitRate: 0.63,
    totalQueries: window === '7d' ? 1247 : 120,
    totalHits: window === '7d' ? 785 : 80,
    missMedianLatency: 980,
    recentHits: window === '7d' ? [...recentHits, ...recentHits] : recentHits
  };
}