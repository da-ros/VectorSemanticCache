from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from llm import getTextResponse, getEmbedding
from db import save_cache, perform_search_cache
import time

server = FastAPI(title="Vector Semantic Cache API", version="1.0.0")

# Configure CORS
server.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3000", "http://127.0.0.1:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class QueryRequest(BaseModel):
    query: str
    threshold: Optional[float] = 0.70

class CacheMeta(BaseModel):
    hit: bool
    score: Optional[float] = None
    latency: float
    model: Optional[str] = None
    savedLatency: Optional[float] = None

class QueryResponse(BaseModel):
    response: str
    meta: CacheMeta

class RecentHit(BaseModel):
    query: str
    threshold: float
    score: float
    savedLatency: float
    timestamp: float

class CacheStats(BaseModel):
    avgSavedLatency: float
    hitRate: float
    totalQueries: int
    totalHits: int
    missMedianLatency: float
    recentHits: List[RecentHit]

class HealthResponse(BaseModel):
    status: str
    timestamp: float
# Health check endpoint
@server.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse(status="healthy", timestamp=time.time())

# Root route
@server.get("/")
async def home():
    return {"message": "Vector Semantic Cache API", "version": "1.0.0"}

# Ask question endpoint with proper error handling and metadata
@server.post("/ask", response_model=QueryResponse)
async def ask_question(request: QueryRequest):
    try:
        start_time = time.time()
        
        # Get query embedding
        query_vector = getEmbedding(request.query)
        
        # Search cache with threshold
        cache_response = list(perform_search_cache(query_vector, request.threshold))
        
        if len(cache_response) > 0:
            # Cache HIT
            hit_data = cache_response[0]
            response = hit_data["response"]
            score = hit_data.get("score", 0.0)
            latency = (time.time() - start_time) * 1000  # Convert to milliseconds
            
            meta = CacheMeta(
                hit=True,
                score=round(score, 2),
                latency=round(latency, 2),
                model="cached",
                savedLatency=round(800 + (latency * 0.1), 2)  # Estimate saved latency
            )
            
            print(f"Cache hit - Score: {score:.3f}, Latency: {latency:.2f}ms")
            
        else:
            # Cache MISS - generate new response
            llm_response = getTextResponse(request.query)
            document = {
                "response": llm_response, 
                "embeddings": query_vector, 
                "query": request.query
            }
            save_cache(document)
            
            latency = (time.time() - start_time) * 1000
            response = llm_response
            
            meta = CacheMeta(
                hit=False,
                latency=round(latency, 2),
                model="gpt-5-nano"
            )
            
            print(f"Cache miss - Latency: {latency:.2f}ms")
        
        return QueryResponse(response=response, meta=meta)
        
    except Exception as e:
        print(f"Error processing query: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

# Get cache statistics endpoint
@server.get("/stats", response_model=CacheStats)
async def get_stats():
    try:
        # This is a simplified version - in production you'd want more sophisticated stats
        # For now, return mock data that matches frontend expectations
        recent_hits = [
            RecentHit(
                query="how to build a pwa?",
                threshold=0.70,
                score=0.82,
                savedLatency=round(838.0, 2),
                timestamp=time.time() - 300  # 5 minutes ago
            )
        ]
        
        return CacheStats(
            avgSavedLatency=round(812.0, 2),
            hitRate=0.63,
            totalQueries=120,
            totalHits=80,
            missMedianLatency=round(980.0, 2),
            recentHits=recent_hits
        )
    except Exception as e:
        print(f"Error fetching stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")
