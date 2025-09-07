#!/bin/bash

echo "🐳 Starting production environment with Docker..."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "📝 Creating .env file from .env.example..."
  cp .env.example .env
  echo "⚠️  Please update the environment variables in .env file for production"
  echo "⚠️  For full production security, use: docker-compose -f docker-compose.yml -f docker-compose.prod.yml up"
  exit 1
fi

# Validate required environment variables
if [ -z "$NEXTAUTH_SECRET" ] || [ -z "$GOOGLE_CLIENT_ID" ] || [ -z "$GOOGLE_CLIENT_SECRET" ]; then
  echo "❌ Required environment variables are missing!"
  echo "   Please set: NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET"
  echo "   You can set them in .env file or export them directly"
  exit 1
fi

echo "✅ Environment validation passed"

# Start the production environment (basic setup)
echo "🚀 Starting basic production environment..."
echo "💡 For enhanced security, consider using: docker-compose -f docker-compose.yml -f docker-compose.prod.yml up"
docker-compose up --build -d

echo "🚀 Production environment started!"
echo "📖 Visit http://localhost:3000 to see the application"
echo "📊 View logs with: docker-compose logs -f"
echo "🔍 Check health: curl http://localhost:3000/api/health"