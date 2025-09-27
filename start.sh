#!/bin/bash

# Car Rental Service Startup Script
# This script starts both the backend and frontend services automatically

echo "🚗 Starting Car Rental Service..."
echo "=================================="

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti :$port)
    if [ ! -z "$pid" ]; then
        echo "⚠️  Killing existing process on port $port (PID: $pid)"
        kill -9 $pid
        sleep 2
    fi
}

# Check for required tools
echo "🔍 Checking system requirements..."

if ! command_exists python3; then
    echo "❌ Python3 is not installed. Please install Python3 first."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install Node.js and npm first."
    exit 1
fi

echo "✅ System requirements satisfied"
echo ""

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/client"

# Check if directories exist
if [ ! -d "$BACKEND_DIR" ]; then
    echo "❌ Backend directory not found: $BACKEND_DIR"
    exit 1
fi

if [ ! -d "$FRONTEND_DIR" ]; then
    echo "❌ Frontend directory not found: $FRONTEND_DIR"
    exit 1
fi

# Kill existing processes on ports 3001 and 5173
echo "🔧 Cleaning up existing processes..."
kill_port 3001
kill_port 5173

# Install backend dependencies if needed
echo "📦 Setting up backend..."
cd "$BACKEND_DIR"

if [ ! -f "requirements.txt" ]; then
    echo "⚠️  No requirements.txt found in backend directory"
else
    echo "Installing Python dependencies..."
    if command_exists pip3; then
        pip3 install -r requirements.txt --quiet
    elif command_exists pip; then
        pip install -r requirements.txt --quiet
    else
        echo "❌ pip/pip3 not found. Please install pip first."
        exit 1
    fi
fi

# Install frontend dependencies if needed
echo "📦 Setting up frontend..."
cd "$FRONTEND_DIR"

if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install --silent
else
    echo "✅ Node.js dependencies already installed"
fi

echo ""
echo "🚀 Starting services..."
echo ""

# Start backend in background
echo "🔥 Starting backend server (FastAPI on port 3001)..."
cd "$BACKEND_DIR"
python3 src/app.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if ! port_in_use 3001; then
    echo "❌ Backend failed to start on port 3001"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Backend server started (PID: $BACKEND_PID)"

# Start frontend in background
echo "🎨 Starting frontend server (React + Vite on port 5173)..."
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 5

echo ""
echo "🎉 Car Rental Service is now running!"
echo "=================================="
echo "🔗 Frontend: http://localhost:5173"
echo "🔗 Backend API: http://localhost:3001"
echo "🔗 API Docs: http://localhost:3001/docs"
echo ""
echo "📝 Process IDs:"
echo "   Backend PID: $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "⏹️  To stop the services, press Ctrl+C or run:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "🌐 Opening browser..."

# Open browser (works on macOS, Linux, and WSL)
if command_exists open; then
    # macOS
    sleep 2 && open http://localhost:5173 &
elif command_exists xdg-open; then
    # Linux
    sleep 2 && xdg-open http://localhost:5173 &
elif command_exists cmd.exe; then
    # WSL
    sleep 2 && cmd.exe /c start http://localhost:5173 &
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Services stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

echo "✋ Press Ctrl+C to stop all services"
echo "📊 Watching logs..."
echo ""

# Wait for user to stop the script
wait
