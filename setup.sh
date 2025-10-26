#!/bin/bash

echo "🚀 Haas Trade Hub - Complete Setup Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Get to root directory
cd "$(dirname "$0")"

# Step 1: Start PostgreSQL
print_info "Step 1: Starting PostgreSQL..."
sudo service postgresql start
if [ $? -eq 0 ]; then
    print_success "PostgreSQL started"
else
    print_error "Failed to start PostgreSQL"
    exit 1
fi

# Step 2: Create database
print_info "Step 2: Creating database..."
psql -U postgres -d postgres -c "CREATE DATABASE haas_trade_hub;" 2>/dev/null
if psql -U postgres -d postgres -lqt | cut -d \| -f 1 | grep -qw haas_trade_hub; then
    print_success "Database 'haas_trade_hub' ready"
else
    print_error "Failed to create database"
    exit 1
fi

# Step 3: Build backend
print_info "Step 3: Building backend..."
cd backend
npm install
npm run build
if [ $? -eq 0 ]; then
    print_success "Backend built successfully"
else
    print_error "Backend build failed"
    exit 1
fi

# Step 4: Run migrations
print_info "Step 4: Running database migrations..."
npm run migrate
if [ $? -eq 0 ]; then
    print_success "Migrations completed"
else
    print_error "Migrations failed"
    exit 1
fi

# Step 5: Seed database
print_info "Step 5: Seeding database with sample data..."
npm run seed
if [ $? -eq 0 ]; then
    print_success "Database seeded (20 classes, 5 users)"
else
    print_error "Seeding failed"
fi

# Step 6: Setup frontend
print_info "Step 6: Setting up frontend..."
cd ../frontend
npm install
if [ $? -eq 0 ]; then
    print_success "Frontend dependencies installed"
else
    print_error "Frontend installation failed"
    exit 1
fi

# Step 7: Configure frontend for Codespaces
print_info "Step 7: Configuring frontend for Codespaces..."

# Check if we're in Codespaces
if [ -n "$CODESPACE_NAME" ]; then
    # Get the Codespace URL
    BACKEND_URL="https://${CODESPACE_NAME}-5000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
    echo "NEXT_PUBLIC_API_URL=${BACKEND_URL}/api" > .env.local
    print_success "Frontend configured for Codespaces"
    print_info "Backend URL: ${BACKEND_URL}/api"
else
    # Local development
    echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
    print_success "Frontend configured for localhost"
fi

echo ""
echo "=========================================="
print_success "Setup Complete!"
echo "=========================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1️⃣  Start Backend:"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "2️⃣  Start Frontend (in a new terminal):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "3️⃣  Test Credentials:"
echo "   Email: alice.chen@haas.berkeley.edu"
echo "   Password: Password123!"
echo ""
echo "🌐 In Codespaces:"
echo "   - Go to PORTS tab"
echo "   - Make ports 3000 and 5000 PUBLIC"
echo "   - Click globe icon on port 3000 to open app"
echo ""
