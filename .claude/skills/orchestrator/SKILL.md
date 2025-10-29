---
name: barbershop-orchestrator
description: Master orchestrator for developing a professional barbershop management system. Use when building, extending, or maintaining the barbershop system. Guides clean architecture implementation, coordinates specialized agents, ensures consistency across all modules, manages development phases, validates architecture compliance, and provides step-by-step development workflows for appointment booking, barber management, client management, payments with MercadoPago, and notifications with SendGrid.
---

# Barbershop System Orchestrator

Master orchestrator for coordinating the complete development of a professional barbershop management system using Clean Architecture and Domain-Driven Design.

## Project Configuration

**Decisions Taken:**
- Payment Gateway: MercadoPago + Cash
- Mobile App: Phase 2 (Web first)
- Notifications: SendGrid (Email) + SMS provider TBD
- Hosting: DigitalOcean
- Initial Language: Spanish
- Database: PostgreSQL 15
- Cache: Redis 7
- Backend: NestJS + TypeScript
- Frontend: Next.js 14

## Core Responsibilities

1. **Architecture Enforcement**: Ensure Clean Architecture principles across all modules
2. **Agent Coordination**: Delegate tasks to specialized development skills
3. **Quality Assurance**: Validate implementations against standards
4. **Development Flow**: Guide step-by-step implementation process
5. **Integration Management**: Coordinate inter-module dependencies
6. **Phase Management**: Track progress through 8 development phases

## Specialized Skills Coordination

Delegate to these skills for specific tasks:

### domain-architect
Create and modify domain entities, value objects, domain services, and business rules. Use for all domain layer work.

### usecase-builder
Implement application layer use cases that orchestrate business logic. Use for application services and workflows.

### infrastructure-engineer
Implement repositories, external API integrations (MercadoPago, SendGrid), database access, caching, and file storage.

### api-designer
Design REST endpoints, implement controllers, create DTOs, configure authentication/authorization, generate API documentation.

### frontend-developer
Build Next.js web application, create React components, implement state management, integrate with backend APIs.

### test-engineer
Write unit tests, integration tests, E2E tests with Playwright, perform load testing, configure CI/CD testing pipeline.

## Development Phases

### Phase 1: Foundation (Weeks 1-2)
**Objective**: Setup project structure and domain layer

**Tasks**:
1. Initialize monorepo structure
2. Configure NestJS backend
3. Create core domain entities: Appointment, Barber, Client, Service
4. Define value objects: TimeSlot, Money, PersonalInfo
5. Setup PostgreSQL with Prisma
6. Configure Redis for caching

**Deliverables**:
- Project structure complete
- Domain layer with core entities
- Database schema designed
- Tests for domain logic (>90% coverage)

### Phase 2: Booking Engine (Weeks 3-6)
**Objective**: Implement robust appointment scheduling system

**Components**:
- Slot Manager: Generate and manage time slots
- Conflict Resolver: Prevent double-booking with optimistic locking
- Appointment Lifecycle: Manage appointment states
- Waitlist Manager: Handle waiting list when slots full

**Critical Requirements**:
- ZERO overlapping appointments
- Real-time availability checking
- Optimistic locking with versioning
- Transaction management for slot reservation

**Use Cases to Implement**:
1. CreateAppointmentUseCase
2. CancelAppointmentUseCase
3. RescheduleAppointmentUseCase
4. CheckSlotAvailabilityUseCase
5. AddToWaitlistUseCase
6. ConfirmAppointmentUseCase
7. StartAppointmentUseCase
8. CompleteAppointmentUseCase

### Phase 3: Availability Engine (Weeks 7-8)
**Objective**: Manage barber schedules and availability

**Components**:
- Schedule Manager: Configure working hours, breaks, time-off
- Capacity Calculator: Calculate barber capacity and utilization
- Break Manager: Manage breaks dynamically

**Use Cases**:
1. SetWorkingHoursUseCase
2. AddScheduleExceptionUseCase
3. CalculateAvailabilityUseCase
4. SetTimeOffUseCase
5. GetAvailableSlotsUseCase

### Phase 4: Complementary Engines (Weeks 9-12)
**Objective**: Implement supporting systems

**Engines**:
1. Services Engine: Catalog, pricing, packages
2. Client Engine: Profiles, segmentation, loyalty
3. Payment Engine: MercadoPago integration + cash payments
4. Notification Engine: SendGrid email automation

### Phase 5: API Layer (Weeks 13-14)
**Objective**: Expose functionality via REST API

**Endpoints**:
- POST /auth/login
- POST /auth/register
- GET /barbers/availability
- POST /appointments
- PUT /appointments/:id
- DELETE /appointments/:id
- GET /services
- POST /payments

**Security**:
- JWT authentication
- Role-based authorization (ADMIN, MANAGER, BARBER, CLIENT)
- Rate limiting
- Input validation with class-validator

### Phase 6: Frontend (Weeks 15-17)
**Objective**: Build web applications

**Apps**:
1. Admin Dashboard (Next.js)
   - Calendar view of all appointments
   - Barber management
   - Service management
   - Analytics dashboard
   
2. Client Web App (Next.js)
   - Service selection
   - Barber selection
   - Interactive calendar for booking
   - Client profile and history

### Phase 7: Testing & QA (Weeks 18-19)
**Objective**: Comprehensive testing and optimization

**Testing Strategy**:
- Unit tests: Domain layer (>95% coverage)
- Integration tests: Use cases (>85% coverage)
- E2E tests: Critical flows with Playwright
- Load testing: Concurrent booking scenarios with k6
- Security audit: OWASP top 10

**Critical Scenarios**:
1. Multiple clients booking same slot simultaneously
2. Barber cancels appointment with waitlist
3. Client reschedules multiple times
4. Payment failure handling
5. Notification delivery failures

### Phase 8: Deployment (Week 20)
**Objective**: Production deployment on DigitalOcean

**Tasks**:
- Configure DigitalOcean App Platform
- Setup managed PostgreSQL database
- Configure managed Redis
- Setup GitHub Actions CI/CD
- Configure Sentry for error tracking
- Setup application monitoring
- Domain and SSL configuration

## Orchestrator Commands

### Initialize Project
```bash
# Start new barbershop project with all configurations
orchestrator setup-project barbershop-pro

# This creates:
# - Monorepo structure (apps/ and packages/)
# - Backend NestJS app
# - Frontend Next.js apps
# - Shared domain package
# - Database migrations
# - Docker setup for local development
# - GitHub Actions workflows
```

### Start Module
```bash
# Initialize new module following Clean Architecture
orchestrator start-module [module-name]

# Example:
orchestrator start-module booking-engine

# Creates:
# - Domain layer (entities, value objects, interfaces)
# - Application layer (use cases, DTOs)
# - Infrastructure layer (repositories, external services)
# - Presentation layer (controllers, DTOs)
# - Test structure
```

### Implement Use Case
```bash
# Generate use case with all boilerplate
orchestrator implement-usecase [module] [use-case-name]

# Example:
orchestrator implement-usecase booking-engine CreateAppointmentUseCase

# Generates:
# - Use case class with execute method
# - Request and Response DTOs
# - Unit test file
# - Integration test file
# - Updates module documentation
```

### Validate Architecture
```bash
# Check architectural compliance
orchestrator validate-architecture

# Validates:
# - Dependency rules (no circular dependencies)
# - Layer boundaries (domain doesn't depend on infrastructure)
# - Naming conventions
# - Test coverage thresholds
# - Code quality metrics
```

### Run Tests
```bash
# Execute test suite by layer
orchestrator test domain        # Domain layer unit tests
orchestrator test application   # Use case integration tests
orchestrator test e2e          # End-to-end tests
orchestrator test all          # Full test suite
```

## Architecture Patterns

### Entity Pattern
```typescript
// Domain entities are rich with business logic
export class Appointment extends AggregateRoot<AppointmentId> {
  private constructor(
    id: AppointmentId,
    private _client: ClientId,
    private _barber: BarberId,
    private _service: ServiceId,
    private _slot: TimeSlot,
    private _status: AppointmentStatus
  ) {
    super(id);
  }

  static create(props: CreateAppointmentProps): Result<Appointment> {
    // Validation and business rules
    const appointment = new Appointment(/*...*/);
    appointment.addDomainEvent(new AppointmentCreatedEvent(appointment));
    return Result.ok(appointment);
  }

  cancel(reason: string): Result<void> {
    if (this._status === AppointmentStatus.COMPLETED) {
      return Result.fail('Cannot cancel completed appointment');
    }
    this._status = AppointmentStatus.CANCELLED;
    this.addDomainEvent(new AppointmentCancelledEvent(this, reason));
    return Result.ok();
  }
}
```

### Use Case Pattern
```typescript
export class CreateAppointmentUseCase {
  constructor(
    private appointmentRepo: IAppointmentRepository,
    private barberRepo: IBarberRepository,
    private slotManager: ISlotManager,
    private conflictResolver: IConflictResolver
  ) {}

  async execute(request: CreateAppointmentRequest): Promise<Result<Appointment>> {
    // 1. Load entities
    const barber = await this.barberRepo.findById(request.barberId);
    
    // 2. Check business rules
    if (!barber.isAvailableAt(request.slot)) {
      return Result.fail('Barber not available');
    }
    
    // 3. Detect conflicts
    const conflicts = await this.conflictResolver.detect(request);
    if (conflicts.length > 0) {
      return Result.fail('Slot conflict detected');
    }
    
    // 4. Create entity
    const appointmentResult = Appointment.create(request);
    if (appointmentResult.isFailure) {
      return Result.fail(appointmentResult.error);
    }
    
    // 5. Persist
    await this.appointmentRepo.save(appointmentResult.value);
    
    return Result.ok(appointmentResult.value);
  }
}
```

### Repository Pattern
```typescript
// Interface in domain layer
export interface IAppointmentRepository {
  save(appointment: Appointment): Promise<Appointment>;
  findById(id: AppointmentId): Promise<Appointment | null>;
  findConflicting(barberId: BarberId, slot: TimeSlot): Promise<Appointment[]>;
}

// Implementation in infrastructure layer
export class PrismaAppointmentRepository implements IAppointmentRepository {
  constructor(private prisma: PrismaClient) {}

  async save(appointment: Appointment): Promise<Appointment> {
    const data = AppointmentMapper.toPersistence(appointment);
    const saved = await this.prisma.appointment.create({ data });
    return AppointmentMapper.toDomain(saved);
  }
}
```

## Critical Anti-Overlapping Logic

**Problem**: Multiple users booking same slot simultaneously

**Solution**: Optimistic locking with version field

```typescript
// In Appointment entity
private _version: number = 0;

// In repository
async save(appointment: Appointment): Promise<Appointment> {
  const currentVersion = appointment.version;
  const newVersion = currentVersion + 1;
  
  const result = await this.prisma.appointment.updateMany({
    where: {
      id: appointment.id.value,
      version: currentVersion // Only update if version matches
    },
    data: {
      ...appointmentData,
      version: newVersion
    }
  });
  
  if (result.count === 0) {
    throw new ConcurrencyException('Appointment was modified by another transaction');
  }
  
  appointment.incrementVersion();
  return appointment;
}
```

**Algorithm**:
1. Client requests slot at 10:00 AM
2. System checks availability (no conflicts)
3. System attempts to reserve slot with version check
4. If another booking happened (version mismatch), transaction fails
5. Client receives conflict error with alternative suggestions
6. System uses `ConflictResolver` to suggest nearest available slots

## Quality Gates

Before advancing to next phase:

- [ ] All tests passing
- [ ] Code coverage meets threshold (Domain: 95%, Application: 85%, Overall: 80%)
- [ ] Architecture validation passes
- [ ] Code review completed
- [ ] Documentation updated
- [ ] No critical security vulnerabilities
- [ ] Performance benchmarks met

## Integration Points

### MercadoPago Integration
```typescript
// In infrastructure layer
export class MercadoPagoPaymentService implements IPaymentService {
  async processPayment(payment: PaymentRequest): Promise<PaymentResult> {
    const preference = {
      items: [{
        title: payment.description,
        unit_price: payment.amount,
        quantity: 1,
      }],
      back_urls: {
        success: `${config.appUrl}/payment/success`,
        failure: `${config.appUrl}/payment/failure`,
      },
      notification_url: `${config.apiUrl}/webhooks/mercadopago`,
    };
    
    const response = await mercadopago.preferences.create(preference);
    return PaymentResult.ok(response.body.init_point);
  }
}
```

### SendGrid Integration
```typescript
export class SendGridEmailService implements IEmailService {
  async send(email: Email): Promise<void> {
    await sgMail.send({
      to: email.to,
      from: config.fromEmail,
      subject: email.subject,
      html: email.html,
    });
  }
}
```

## Development Workflow

### Day-to-Day Development

1. **Check current phase**: Review phase objectives and tasks
2. **Identify next task**: Pick highest priority item
3. **Delegate to specialist skill**: Use appropriate skill for the task
4. **Implement with TDD**: Write tests first, then implementation
5. **Validate**: Run tests and architecture validation
6. **Document**: Update relevant documentation
7. **Commit**: Make atomic commits with clear messages

### Starting a New Feature

```bash
# Example: Adding appointment reminders

# 1. Plan feature
orchestrator plan-feature appointment-reminders

# 2. Domain changes (if needed)
domain-architect add-behavior Appointment scheduleReminder

# 3. Create use case
usecase-builder implement notifications ScheduleAppointmentReminderUseCase

# 4. Infrastructure (SendGrid integration)
infrastructure-engineer implement ReminderScheduler

# 5. API endpoint
api-designer create-endpoint POST /appointments/:id/schedule-reminder

# 6. Tests
test-engineer e2e-test ReminderFlow

# 7. Validate
orchestrator validate-architecture
```

## Troubleshooting

### Tests Failing
1. Check test output for specific errors
2. Verify mock configurations
3. Check database state (for integration tests)
4. Review recent changes for breaking modifications

### Architecture Violations
1. Run `orchestrator validate-architecture` for detailed report
2. Check dependency graph
3. Ensure interfaces are in correct layer
4. Verify imports follow layer rules

### Deployment Issues
1. Check environment variables
2. Verify database migrations ran
3. Review application logs in DigitalOcean
4. Check Sentry for runtime errors

## References

For detailed information, consult:
- `references/clean-architecture.md` - Clean Architecture patterns
- `references/ddd-patterns.md` - Domain-Driven Design guidance
- `references/entities-catalog.md` - All system entities
- `references/api-documentation.md` - API endpoints reference
- `references/deployment-guide.md` - DigitalOcean deployment steps
- `references/testing-strategy.md` - Testing approach and patterns

## Getting Started

To begin development:

1. Review this orchestrator documentation
2. Understand the 8 development phases
3. Familiarize yourself with specialized skills
4. Run `orchestrator setup-project barbershop-pro`
5. Follow Phase 1 tasks step by step
6. Use orchestrator commands for guidance

The orchestrator will guide you through each phase, ensuring a robust, professional system that prevents appointment conflicts and provides excellent user experience.
