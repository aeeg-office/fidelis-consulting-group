#!/bin/bash
# AEEG Practice Buddy - Complete Deployment Script
# Run this script to start or restart all Practice Buddy services

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR/.."
BACKEND_DIR="$PROJECT_DIR/backend"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   AEEG Practice Buddy Deployment        ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}[1/6] Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is required but not installed.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

if ! command -v npx &> /dev/null; then
    echo -e "${RED}✗ npx not found${NC}"
    exit 1
fi

# Check PostgreSQL
if command -v psql &> /dev/null; then
    echo -e "${GREEN}✓ PostgreSQL available${NC}"
else
    echo -e "${YELLOW}⚠ PostgreSQL CLI not found, trying connection anyway...${NC}"
fi

# Check backend directory
if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}✗ Backend directory not found at $BACKEND_DIR${NC}"
    exit 1
fi

# Install dependencies
echo ""
echo -e "${YELLOW}[2/6] Installing backend dependencies...${NC}"
cd "$BACKEND_DIR"
npm install --silent 2>&1 | tail -1
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Database setup
echo ""
echo -e "${YELLOW}[3/6] Setting up database...${NC}"

# Check if .env exists
if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo -e "${YELLOW}⚠ Creating .env file from template...${NC}"
    cat > "$BACKEND_DIR/.env" << 'ENVEOF'
DATABASE_URL="postgresql://fidelis:fidelis@localhost:5432/practice_buddy?schema=public"
JWT_SECRET="practice-buddy-jwt-secret-change-in-production-aeeq-2024"
FRONTEND_URL="http://localhost:3000"
PORT=3001
NODE_ENV=development
ENVEOF
    echo -e "${GREEN}✓ .env created${NC}"
fi

# Push database schema
cd "$BACKEND_DIR"
npx prisma db push --skip-generate 2>&1 || {
    echo -e "${RED}✗ Database push failed. Check your PostgreSQL connection.${NC}"
    echo -e "  Ensure PostgreSQL is running and the database 'practice_buddy' exists."
    echo -e "  Run: sudo -u postgres createdb practice_buddy"
    exit 1
}
echo -e "${GREEN}✓ Database schema synced${NC}"

# Generate Prisma client
npx prisma generate 2>&1 | tail -1
echo -e "${GREEN}✓ Prisma client generated${NC}"

# Seed database
echo ""
echo -e "${YELLOW}[4/6] Seeding database with demo data...${NC}"
cd "$BACKEND_DIR"
npx tsx src/seed.ts 2>&1 && echo -e "${GREEN}✓ Database seeded${NC}" || echo -e "${YELLOW}⚠ Seed may have warnings (possibly already seeded)${NC}"

# Kill any existing practice-buddy process
echo ""
echo -e "${YELLOW}[5/6] Starting API server...${NC}"
pm2 delete practice-buddy-api 2>/dev/null || true
cd "$BACKEND_DIR"

# Start with PM2 if available, otherwise run directly
if command -v pm2 &> /dev/null; then
    pm2 start --name "practice-buddy-api" --interpreter npx tsx src/index.ts 2>&1
    pm2 save 2>/dev/null || true
    echo -e "${GREEN}✓ Server started via PM2${NC}"
else
    echo -e "${YELLOW}⚠ PM2 not found. Starting with nohup...${NC}"
    nohup npx tsx src/index.ts > /tmp/practice-buddy-api.log 2>&1 &
    echo $! > /tmp/practice-buddy-api.pid
    echo -e "${GREEN}✓ Server started (PID: $(cat /tmp/practice-buddy-api.pid))${NC}"
fi

# Wait for server to be ready
sleep 3

# Verify server is running
echo ""
echo -e "${YELLOW}[6/6] Verifying API health...${NC}"
HEALTH=$(curl -s http://localhost:3001/api/health 2>/dev/null)
if [ "$HEALTH" != "" ]; then
    echo -e "${GREEN}✓ API server is running at http://localhost:3001${NC}"
else
    echo -e "${RED}✗ API server failed to start. Check logs.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Deployment Complete!                    ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
echo -e "  API Server:  ${YELLOW}http://localhost:3001${NC}"
echo -e "  Health:      ${YELLOW}http://localhost:3001/api/health${NC}"
echo -e "  Frontend:    ${YELLOW}http://localhost:3000/practice-buddy${NC}"
echo ""
echo -e "  Demo Accounts:"
echo -e "    Admin:     admin / admin123"
echo -e "    Teacher:   teacher / teacher123"
echo -e "    Student:   student / student123"
echo -e "    Code:      AEEG-DEMO-2024"
echo ""
echo -e "  To stop:    ${YELLOW}pm2 delete practice-buddy-api${NC}"
echo -e "  To restart: ${YELLOW}pm2 restart practice-buddy-api${NC}"
echo -e "  To view logs: ${YELLOW}pm2 logs practice-buddy-api${NC}"
echo ""