# @barbershop/domain

**Domain Layer** - Pure business logic with zero framework dependencies.

## Purpose

Contains the core business rules and domain logic following Domain-Driven Design (DDD) principles. This layer is completely independent of external concerns.

## Architecture

```
src/
├── entities/         # Aggregate roots and entities
├── value-objects/    # Immutable value objects
├── events/           # Domain events
├── services/         # Domain services
├── repositories/     # Repository interfaces
└── common/           # Shared domain utilities
```

## Rules

- ✅ Pure TypeScript, no framework dependencies
- ✅ All business rules live here
- ✅ Immutable value objects
- ✅ Entities protect invariants
- ❌ NO database code
- ❌ NO HTTP requests
- ❌ NO external service calls
- ❌ NO framework decorators

## Dependencies

- **luxon**: DateTime handling (only external dependency allowed)

## Testing

- Target coverage: **>95%**
- Test type: Unit tests only
- Fast execution: <100ms entire suite

## Usage

```typescript
import { Appointment } from '@barbershop/domain/entities'
import { TimeSlot, Money } from '@barbershop/domain/value-objects'

const slot = TimeSlot.create(startTime, endTime).value
const result = Appointment.create({ client, barber, service, slot })
```
