# @barbershop/api

**REST API** built with NestJS.

## Purpose

Presentation layer that exposes RESTful endpoints for the barbershop management system.

## Architecture

```
src/
├── modules/        # Feature modules
│   ├── appointments/
│   ├── barbers/
│   ├── clients/
│   └── services/
├── common/         # Shared middleware, guards, filters
│   ├── guards/
│   ├── interceptors/
│   └── filters/
└── config/         # Configuration
```

## Features

- RESTful API with NestJS
- JWT Authentication
- Role-based authorization (RBAC)
- Swagger/OpenAPI documentation
- Request validation with class-validator
- Error handling middleware
- Logging and monitoring

## Running

```bash
# Development
npm run dev

# Production build
npm run build
npm run start:prod

# Tests
npm run test
npm run test:e2e
```

## API Documentation

Once running, visit: `http://localhost:3000/api/docs`
