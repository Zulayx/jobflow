#!/bin/bash

# JobFlow - Job Application Tracker
# Startup script for macOS Terminal

SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )"
cd "$SCRIPT_DIR"

echo ""
echo "🚀 JobFlow - Starting..."
echo "========================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies for first run..."
    npm install
    echo ""
fi

# Check if database exists
if [ ! -f "prisma/dev.db" ]; then
    echo "🗄️  Setting up database..."
    npx prisma generate
    npx prisma db push
    echo ""
fi

echo "✅ Starting development server..."
echo "📍 Visit: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the dev server
npm run dev