#!/bin/bash

# Vector Semantic Cache - Development Startup Script
echo "🚀 Starting Vector Semantic Cache Development Environment..."

# Check if we're in the right directory
if [ ! -d "Backend" ] || [ ! -d "Frontend" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Function to start backend
start_backend() {
    echo "🔧 Starting FastAPI Backend..."
    cd Backend
    
    # Check if virtual environment exists
    if [ ! -d "venv" ]; then
        echo "📦 Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install dependencies
    echo "📦 Installing Python dependencies..."
    pip install -r requirements.txt
    
    # Start FastAPI server
    echo "🚀 Starting FastAPI server on http://localhost:8000"
    uvicorn app:server --host 0.0.0.0 --port 8000 --reload &
    
    # Store PID for cleanup
    BACKEND_PID=$!
    cd ..
}

# Function to start frontend
start_frontend() {
    echo "🎨 Starting React Frontend..."
    cd Frontend
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing Node.js dependencies..."
        npm install
    fi
    
    # Start Vite development server
    echo "🚀 Starting Vite dev server on http://localhost:8080"
    npm run dev &
    
    # Store PID for cleanup
    FRONTEND_PID=$!
    cd ..
}

# Function to cleanup processes
cleanup() {
    echo "🛑 Shutting down development servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start both services
start_backend
sleep 2
start_frontend

echo ""
echo "✅ Development environment started!"
echo "📱 Frontend: http://localhost:8080"
echo "🔧 Backend API: http://localhost:8000"
echo "📊 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for processes
wait
