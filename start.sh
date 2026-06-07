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
echo "Press Ctrl+C to stop all services"
echo ""

npm run dev
