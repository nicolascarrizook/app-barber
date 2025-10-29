#!/bin/bash

# Development startup script
# Starts all services needed for local development

set -e

echo "🚀 Starting development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running"
    echo "Please start Docker Desktop and try again"
    exit 1
fi

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check PostgreSQL
echo "🔍 Checking PostgreSQL..."
until docker-compose exec -T postgres pg_isready -U barbershop_user -d barbershop > /dev/null 2>&1; do
    echo "   PostgreSQL is starting up..."
    sleep 2
done
echo "✅ PostgreSQL is ready"

# Check Redis
echo "🔍 Checking Redis..."
until docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; do
    echo "   Redis is starting up..."
    sleep 2
done
echo "✅ Redis is ready"

echo ""
echo "✅ All services are ready!"
echo ""
echo "📊 Service URLs:"
echo "  PostgreSQL:    localhost:5432"
echo "  Redis:         localhost:6379"
echo "  pgAdmin:       http://localhost:5050"
echo "  RedisInsight:  http://localhost:8001"
echo ""
echo "🔐 Credentials:"
echo "  PostgreSQL:"
echo "    User:     barbershop_user"
echo "    Password: barbershop_password"
echo "    Database: barbershop"
echo ""
echo "  pgAdmin:"
echo "    Email:    admin@barbershop.com"
echo "    Password: admin"
echo ""
echo "💡 Next steps:"
echo "  1. Run migrations:  cd apps/api && npx prisma migrate dev"
echo "  2. Seed database:   npm run seed"
echo "  3. Start API:       npm run dev"
