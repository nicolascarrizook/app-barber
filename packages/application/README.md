# @barbershop/application

**Application Layer** - Use cases and application services.

## Purpose

Orchestrates domain entities and infrastructure services to implement business workflows. Defines transaction boundaries and coordinates application logic.

## Architecture

```
src/
├── use-cases/         # Application use cases
├── dtos/              # Data Transfer Objects
├── event-handlers/    # Domain event handlers
└── interfaces/        # Service interfaces
```

## Rules

- ✅ Orchestrate domain entities
- ✅ Define transaction boundaries
- ✅ Handle domain events
- ✅ Convert between DTOs and domain models
- ❌ NO business logic (delegate to domain)
- ❌ NO direct database access
- ❌ NO framework-specific code

## Dependencies

- **@barbershop/domain**: Domain layer only

## Testing

- Target coverage: **>85%**
- Test type: Integration tests with mocks
- Mock infrastructure dependencies

## Usage

```typescript
import { CreateAppointmentUseCase } from '@barbershop/application/use-cases'

const useCase = new CreateAppointmentUseCase(
  appointmentRepo,
  conflictResolver,
  eventBus
)

const result = await useCase.execute(request)
```
