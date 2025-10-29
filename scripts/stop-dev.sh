#!/bin/bash

# Development shutdown script
# Stops all Docker services

set -e

echo "🛑 Stopping development environment..."

# Stop Docker services
docker-compose down

echo "✅ All services stopped"
echo ""
echo "💡 To remove volumes (delete all data), run:"
echo "   docker-compose down -v"
