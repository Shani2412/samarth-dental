#!/bin/bash
# Samarth Dental Care — One-click start script

echo ""
echo "🦷  Samarth Dental Care"
echo "━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if node_modules exist
if [ ! -d "node_modules" ] || [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm run install:all
  echo ""
fi

# Check backend .env
if grep -q "YOUR_PASSWORD" backend/.env 2>/dev/null; then
  echo "⚠️  WARNING: Please edit backend/.env and set your DATABASE_URL"
  echo "   Then run: npm run db:migrate"
  echo ""
fi

echo "🚀 Starting servers..."
echo "   Frontend → http://localhost:3000"
echo "   Backend  → http://localhost:5000"
echo ""
npm run dev
