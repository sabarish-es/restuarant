#!/bin/bash

# Restaurant App - Complete Setup & Run Script
# This script sets up and runs the entire application

set -e  # Exit on error

echo "================================"
echo "Restaurant App - Setup & Run"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "${YELLOW}Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js v18+${NC}"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js $NODE_VERSION found${NC}"
echo ""

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm found${NC}"
echo ""

# Check MySQL
echo -e "${YELLOW}Checking MySQL...${NC}"
if command -v mysql &> /dev/null; then
    echo -e "${GREEN}✓ MySQL found${NC}"
else
    echo -e "${YELLOW}⚠ MySQL not found in PATH. Make sure MySQL Server is running.${NC}"
fi
echo ""

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}Creating .env.local file...${NC}"
    cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3001/api
JWT_SECRET=restaurant_app_secret_key_change_in_production
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=restaurant_db
PORT=3001
NODE_ENV=development
EOF
    echo -e "${GREEN}✓ Created .env.local${NC}"
    echo -e "${YELLOW}Please update DB_PASSWORD with your MySQL password${NC}"
    echo ""
fi

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Initialize database
echo -e "${YELLOW}Initializing database...${NC}"
npm run db:init || echo -e "${RED}Database initialization failed. Make sure MySQL is running with correct credentials.${NC}"
echo ""

# Create admin user
echo -e "${YELLOW}Creating admin user...${NC}"
echo "Default admin credentials:"
echo "  Username: admin"
echo "  Password: admin123"
echo "  Role: admin"
echo ""
npm run db:create-admin || true
echo ""

# Final instructions
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "${YELLOW}To start the application, run one of the following:${NC}"
echo ""
echo -e "${GREEN}Option 1: Run frontend and backend together (recommended)${NC}"
echo "  npm run dev"
echo ""
echo -e "${GREEN}Option 2: Run them separately for debugging${NC}"
echo "  Terminal 1: npm run backend"
echo "  Terminal 2: npx next dev"
echo ""
echo -e "${YELLOW}Access URLs:${NC}"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:3001/api"
echo "  API Health: http://localhost:3001/api/health"
echo ""
echo -e "${YELLOW}Login Credentials:${NC}"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo -e "${YELLOW}Important Notes:${NC}"
echo "  1. Make sure MySQL Server is running"
echo "  2. Check .env.local for correct database credentials"
echo "  3. Frontend will be available at http://localhost:3000"
echo "  4. Backend will serve on http://localhost:3001"
echo ""
echo -e "${YELLOW}For more details, see FULL_ANALYSIS_AND_FIXES.md${NC}"
echo ""
