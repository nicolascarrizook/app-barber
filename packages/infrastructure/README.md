# @barbershop/infrastructure

**Infrastructure Layer** - Repositories, external services, and infrastructure concerns.

## Purpose

Implements technical concerns including database access, external API integrations, caching, and file storage while keeping domain layer pure.

## Architecture

```
src/
├── database/             # Database configuration
│   └── prisma/          # Prisma schema and migrations
├── repositories/         # Repository implementations
├── external-services/    # Third-party integrations
│   ├── mercadopago/     # Payment gateway
│   └── sendgrid/        # Email service
├── caching/             # Redis caching
└── config/              # Infrastructure config
```

## Rules

- ✅ Implement repository interfaces from domain
- ✅ Implement service interfaces from application
- ✅ Handle database transactions
- ✅ Manage external API calls
- ❌ NO business logic
- ✅ Must be easily replaceable

## Dependencies

- **@barbershop/domain**: Domain interfaces
- **@barbershop/application**: Application interfaces
- **@prisma/client**: Database ORM
- **ioredis**: Redis caching
- **mercadopago**: Payment processing
- **@sendgrid/mail**: Email service

## Testing

- Target coverage: **>75%**
- Test type: Integration tests with real DB (test containers)
- Verify data persistence and external calls

## Usage

```typescript
import { PrismaAppointmentRepository } from '@barbershop/infrastructure/repositories'
import { MercadoPagoAdapter } from '@barbershop/infrastructure/external-services'

const appointmentRepo = new PrismaAppointmentRepository(prisma)
const paymentService = new MercadoPagoAdapter(config)
```
