#!/bin/bash

echo "🔍 Haas Trade Hub - Diagnostic Check"
echo "======================================"
echo ""

# Check if we're in Codespaces
if [ -n "$CODESPACE_NAME" ]; then
    echo "✅ Running in GitHub Codespaces: $CODESPACE_NAME"
    echo ""
else
    echo "ℹ️  Not running in Codespaces (local environment)"
    echo ""
fi

# Check backend process
echo "1️⃣ Checking Backend Process..."
if pgrep -f "ts-node src/index.ts" > /dev/null || pgrep -f "node.*backend" > /dev/null; then
    echo "✅ Backend process is running"
else
    echo "❌ Backend is NOT running!"
    echo "   → Run: cd backend && npm run dev"
fi
echo ""

# Check frontend process
echo "2️⃣ Checking Frontend Process..."
if pgrep -f "next dev" > /dev/null; then
    echo "✅ Frontend process is running"
else
    echo "❌ Frontend is NOT running!"
    echo "   → Run: cd frontend && npm run dev"
fi
echo ""

# Check frontend .env.local
echo "3️⃣ Checking Frontend Configuration..."
if [ -f "frontend/.env.local" ]; then
    echo "✅ frontend/.env.local exists"
    echo "   Content:"
    cat frontend/.env.local | sed 's/^/   /'
else
    echo "❌ frontend/.env.local is MISSING!"
    echo "   → Create it with: echo 'NEXT_PUBLIC_API_URL=<your-backend-url>/api' > frontend/.env.local"
fi
echo ""

# Check backend .env
echo "4️⃣ Checking Backend Configuration..."
if [ -f "backend/.env" ]; then
    echo "✅ backend/.env exists"
    echo "   Database: $(grep DB_NAME backend/.env | cut -d= -f2)"
else
    echo "❌ backend/.env is MISSING!"
fi
echo ""

# Test backend health endpoint
echo "5️⃣ Testing Backend Health..."
HEALTH_RESPONSE=$(curl -s http://localhost:5000/health 2>&1)
if echo "$HEALTH_RESPONSE" | grep -q "ok"; then
    echo "✅ Backend is responding on localhost:5000"
    echo "   Response: $HEALTH_RESPONSE"
else
    echo "❌ Backend is NOT responding on localhost:5000"
    echo "   Error: $HEALTH_RESPONSE"
fi
echo ""

# Check PostgreSQL
echo "6️⃣ Checking PostgreSQL..."
if sudo service postgresql status 2>/dev/null | grep -q "online\|active"; then
    echo "✅ PostgreSQL is running"

    # Check if database exists
    if sudo -u postgres psql -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw haas_trade_hub; then
        echo "✅ Database 'haas_trade_hub' exists"

        # Check if tables exist
        TABLE_COUNT=$(sudo -u postgres psql -d haas_trade_hub -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs)
        if [ "$TABLE_COUNT" -gt "0" ]; then
            echo "✅ Database has $TABLE_COUNT tables"
        else
            echo "❌ Database has NO tables - run migrations!"
            echo "   → Run: cd backend && npm run migrate"
        fi
    else
        echo "❌ Database 'haas_trade_hub' does NOT exist"
        echo "   → Create it: sudo -u postgres psql -c 'CREATE DATABASE haas_trade_hub;'"
    fi
else
    echo "❌ PostgreSQL is NOT running"
    echo "   → Start it: sudo service postgresql start"
fi
echo ""

echo "======================================"
echo "📋 Summary"
echo "======================================"
echo ""
echo "If you see any ❌ above, fix those issues first."
echo ""
echo "For Codespaces users:"
echo "1. Go to PORTS tab and find your backend URL (port 5000)"
echo "2. Update frontend/.env.local with that URL + /api"
echo "3. Restart frontend: pkill -f 'next dev' && cd frontend && npm run dev"
echo ""
echo "Test backend directly:"
echo "  curl http://localhost:5000/health"
echo ""
