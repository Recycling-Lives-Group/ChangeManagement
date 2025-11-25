#!/bin/bash

echo "🚀 Setting up Change Management System..."
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✓ Node.js found: $(node --version)"

# Check for MongoDB
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB not found locally. You can:"
    echo "   1. Install MongoDB locally, or"
    echo "   2. Use MongoDB Atlas (cloud)"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "🔨 Building shared types..."
cd shared/types
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Failed to build shared types"
    exit 1
fi

cd ../..

echo ""
echo "⚙️  Setting up environment files..."

# Backend .env
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✓ Created backend/.env (please update with your settings)"
else
    echo "✓ backend/.env already exists"
fi

# Frontend .env
if [ ! -f frontend/.env ]; then
    cp frontend/.env.example frontend/.env
    echo "✓ Created frontend/.env"
else
    echo "✓ frontend/.env already exists"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your MongoDB URI and JWT secret"
echo "2. Start MongoDB: mongod"
echo "3. Run the application: npm run dev"
echo ""
echo "📚 Read QUICKSTART.md for detailed instructions"
