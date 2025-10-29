#!/bin/bash

# Reset database script
# This script drops the database, recreates it, and runs migrations

set -e

echo "🔄 Resetting database..."
echo "⚠️  WARNING: This will delete ALL data!"
read -p "Are you sure? (y/N) " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "❌ Database reset cancelled"
    exit 0
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must be run from project root directory"
    exit 1
fi

echo "📦 Navigating to API directory..."
cd apps/api

echo "🗑️  Dropping database..."
npx prisma migrate reset --force --skip-seed

echo "🔧 Running migrations..."
npx prisma migrate deploy

echo "🌱 Seeding database..."
npx prisma db seed

echo "✅ Database reset completed successfully!"
echo ""
echo "Database is now in a clean state with sample data."
