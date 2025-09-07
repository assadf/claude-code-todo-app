#!/bin/bash

echo "🐳 Starting development environment with Docker..."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "📝 Creating .env file from .env.example..."
  cp .env.example .env
  echo "⚠️  Please update the Google OAuth credentials in .env file"
fi

# Start the development environment
docker-compose --profile dev up --build

echo "🚀 Development environment started!"
echo "📖 Visit http://localhost:3000 to see the application"