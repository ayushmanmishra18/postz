#!/bin/bash
# Quick Start Script for Thoughts App
# Run this to start both servers and test the frontend

echo "=========================================="
echo "  Thoughts App - Quick Start"
echo "=========================================="
echo ""

# Check if MongoDB is reachable
echo "📋 Checking MongoDB connection..."
echo ""

# Create uploads directory if it doesn't exist
if [ ! -d "server/uploads" ]; then
  mkdir -p server/uploads
  echo "📁 Created uploads directory"
fi

echo ""
echo "=========================================="
echo "  STEP 1: Start Backend Server"
echo "=========================================="
echo ""
echo "   Running: cd server && npx tsx src/index.ts"
echo "   Wait for: ✅ Connected to MongoDB"
echo ""

cd server && npx tsx src/index.ts &
SERVER_PID=$!
sleep 5

echo ""
echo "=========================================="
echo "  STEP 2: Start Frontend Server"
echo "=========================================="
echo ""
echo "   Running: npm start"
echo ""

cd .. && npm start &
CLIENT_PID=$!
sleep 5

echo ""
echo "=========================================="
echo "  ✅ Both servers are running!"
echo "=========================================="
echo ""
echo "   🌐 Frontend: http://localhost:8081"
echo "   🔧 Backend:  http://localhost:3000"
echo ""
echo "   To test on Web: Press 'w' in terminal"
echo "   To test on Android: Press 'a'"
echo "   To test on iOS: Press 'i'"
echo ""
echo "   To stop servers: Ctrl+C in both terminals"
echo ""
echo "=========================================="