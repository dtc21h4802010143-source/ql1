#!/bin/bash

set -e

echo "🚀 Modern HRMS - Local Development Startup"
echo "==========================================="
echo ""

# Check if node_modules exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing root dependencies..."
    npm install
fi

# Check backend node_modules
if [ ! -d "modern-stack/backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm --prefix modern-stack/backend install
fi

# Check frontend node_modules
if [ ! -d "modern-stack/frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm --prefix modern-stack/frontend install
fi

echo ""
echo "✅ All dependencies installed successfully!"
echo ""
echo "🎯 Starting Modern HRMS..."
echo "   Backend:  http://localhost:5000"
echo "   Frontend: http://localhost:5173"
echo "   API:      http://localhost:5000/api"
echo ""

# Start dev servers in background
npm run dev &
DEV_PID=$!

# Wait a few seconds for services to start
sleep 5

# Open browser automatically
echo "🌐 Opening browser..."
if [ "$(uname)" == "Darwin" ]; then
    # macOS
    open http://localhost:5173
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
    # Linux
    xdg-open http://localhost:5173 || true
fi

echo ""
echo "✨ Modern HRMS is ready!"
echo "   Press Ctrl+C to stop all services"
echo ""

# Wait for dev server process
wait $DEV_PID
