#!/bin/bash

echo "🚀 Setting up Dazzle Wheels with Supabase..."

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo "❌ backend/.env file not found!"
    echo "Please create backend/.env with your Supabase credentials first."
    echo "See SUPABASE_SETUP.md for instructions."
    exit 1
fi

# Navigate to backend
cd backend

echo "📦 Installing dependencies..."
npm install

echo "🔧 Generating Prisma client..."
npx prisma generate

echo "📊 Pushing schema to Supabase..."
npx prisma db push

echo "🌱 Seeding database with sample data..."
node migrate-to-supabase.js

echo "✅ Setup complete!"
echo ""
echo "🌐 Your Dazzle Wheels platform is ready!"
echo "👤 Admin login: admin@dazzlewheels.com / admin123"
echo "🔗 Frontend: http://localhost:3000"
echo "🔗 Backend: http://localhost:3001"
echo ""
echo "To start the servers:"
echo "Backend: cd backend && npm run start:dev"
echo "Frontend: cd frontend && npm run dev"