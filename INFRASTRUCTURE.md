# Infrastructure Setup Guide

## Overview

This project uses Docker Compose to manage local development infrastructure:
- **PostgreSQL 15**: Primary database
- **Redis 7**: Caching and session storage
- **pgAdmin**: Database management UI
- **RedisInsight**: Redis management UI

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Node.js 18+ installed
- Terminal access

## Quick Start

### 1. Start Infrastructure

```bash
# Make scripts executable (first time only)
chmod +x scripts/*.sh

# Start all services
./scripts/start-dev.sh
```

This will:
- Start PostgreSQL on port 5432
- Start Redis on port 6379
- Start pgAdmin on port 5050
- Start RedisInsight on port 8001

### 2. Setup Environment Variables

```bash
# Copy development environment file
cp .env.development .env
```

### 3. Run Database Migrations

```bash
cd apps/api
npx prisma migrate dev
```

### 4. Seed Database (Optional)

```bash
./scripts/seed-data.sh
```

## Service URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| PostgreSQL | `localhost:5432` | User: `barbershop_user`<br>Password: `barbershop_password`<br>Database: `barbershop` |
| Redis | `localhost:6379` | No password |
| pgAdmin | http://localhost:5050 | Email: `admin@barbershop.com`<br>Password: `admin` |
| RedisInsight | http://localhost:8001 | No credentials |

## Useful Scripts

### Start Development Environment
```bash
./scripts/start-dev.sh
```

### Stop Development Environment
```bash
./scripts/stop-dev.sh
```

### Reset Database
```bash
./scripts/reset-db.sh
```
⚠️ **Warning**: This deletes all data!

### Seed Database
```bash
./scripts/seed-data.sh
```

## Docker Commands

### View Running Containers
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Stop and Remove All Data
```bash
docker-compose down -v
```
⚠️ **Warning**: This deletes all volumes (data)!

## Database Management

### Using pgAdmin

1. Open http://localhost:5050
2. Login with credentials (see table above)
3. Add new server:
   - Name: `Barbershop Local`
   - Host: `postgres` (Docker internal network)
   - Port: `5432`
   - Username: `barbershop_user`
   - Password: `barbershop_password`

### Using Prisma Studio

```bash
cd apps/api
npx prisma studio
```

Opens at http://localhost:5555

## Redis Management

### Using RedisInsight

1. Open http://localhost:8001
2. Add database:
   - Host: `localhost`
   - Port: `6379`
   - Name: `Barbershop Local`

### Using Redis CLI

```bash
docker-compose exec redis redis-cli

# Test connection
127.0.0.1:6379> PING
PONG

# View all keys
127.0.0.1:6379> KEYS *

# Get a value
127.0.0.1:6379> GET key_name

# Flush all data (⚠️ careful!)
127.0.0.1:6379> FLUSHALL
```

## Troubleshooting

### PostgreSQL won't start
```bash
# Check if port 5432 is in use
lsof -i :5432

# Kill the process if needed
kill -9 <PID>

# Restart services
docker-compose restart postgres
```

### Redis won't start
```bash
# Check if port 6379 is in use
lsof -i :6379

# Restart services
docker-compose restart redis
```

### "Permission denied" on scripts
```bash
chmod +x scripts/*.sh
```

### Database migration errors
```bash
# Reset database
./scripts/reset-db.sh

# Or manually
cd apps/api
npx prisma migrate reset
```

### Docker out of space
```bash
# Remove unused containers and volumes
docker system prune -a --volumes

# WARNING: This removes ALL unused Docker data!
```

## Environment Variables

### Development (.env.development)
- Uses local Docker services
- Debug logging enabled
- Test payment credentials
- Relaxed rate limiting

### Test (.env.test)
- Separate test database
- Error-only logging
- Mocked external services
- No rate limiting

### Production (not in repo)
- Production database URL
- Redis cluster
- Real payment credentials
- Strict rate limiting
- Monitoring enabled

## Data Persistence

Docker volumes ensure data persists between container restarts:
- `postgres_data`: PostgreSQL data
- `redis_data`: Redis data
- `pgadmin_data`: pgAdmin settings
- `redis_insight_data`: RedisInsight settings

To completely reset (delete all data):
```bash
docker-compose down -v
```

## Health Checks

All services include health checks:
- PostgreSQL: `pg_isready` command
- Redis: `redis-cli ping` command

View health status:
```bash
docker-compose ps
```

## Network

All services run in a custom Docker network: `barbershop-network`

This allows services to communicate using service names:
- PostgreSQL: `postgres:5432`
- Redis: `redis:6379`

## Next Steps

After infrastructure is running:
1. ✅ Setup environment variables
2. ✅ Run database migrations
3. ✅ Seed database (optional)
4. 🚀 Start development: `npm run dev`

## Support

For issues:
1. Check Docker Desktop is running
2. Check logs: `docker-compose logs`
3. Restart services: `docker-compose restart`
4. Reset completely: `docker-compose down -v && ./scripts/start-dev.sh`
