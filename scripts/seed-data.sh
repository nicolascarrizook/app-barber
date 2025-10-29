#!/bin/bash

# Seed data script for development environment
# This script loads sample data into the database

set -e

echo "🌱 Starting database seeding..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 3

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must be run from project root directory"
    exit 1
fi

# Run Prisma seed
echo "📦 Running Prisma seed..."
cd apps/api
npx prisma db seed

echo "✅ Database seeding completed successfully!"
echo ""
echo "Sample data loaded:"
echo "  - 3 Barbers (active)"
echo "  - 10 Clients (various segments)"
echo "  - 8 Services (all categories)"
echo "  - 20 Appointments (various statuses)"
echo ""
echo "Default admin credentials:"
echo "  Email: admin@barbershop.com"
echo "  Password: Admin123!"
