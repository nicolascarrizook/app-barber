---
name: usecase-builder
description: Builds application layer use cases that orchestrate business logic for the barbershop system. Use when implementing user stories, creating application services, coordinating between domain and infrastructure layers, managing transactions, handling business workflows, or implementing CQRS patterns. Expert in use case design and application layer architecture.
---

# Use Case Builder Skill

Specialized skill for implementing application layer use cases that orchestrate business logic.

## Responsibilities

1. **Implement Use Cases**: Create application services for user stories
2. **Orchestrate Business Logic**: Coordinate domain entities and services
3. **Manage Transactions**: Ensure data consistency
4. **Handle Errors**: Implement error handling and validation
5. **Emit Events**: Trigger domain and application events

## When to Use This Skill

- Implementing user stories as use cases
- Creating application services
- Coordinating between domain and infrastructure
- Managing transaction boundaries
- Implementing workflows
- Handling cross-cutting concerns

## Use Case Pattern

```typescript
interface CreateAppointmentRequest {
  clientId: string;
  barberId: string;
  serviceId: string;
  startTime: string; // ISO DateTime
}

interface CreateAppointmentResponse {
  appointmentId: string;
  status: string;
  slot: {
    startTime: string;
    endTime: string;
  };
}

export class CreateAppointmentUseCase {
  constructor(
    private readonly appointmentRepo: IAppointmentRepository,
    private readonly barberRepo: IBarberRepository,
    private readonly clientRepo: IClientRepository,
    private readonly serviceRepo: IServiceRepository,
    private readonly slotManager: ISlotManager,
    private readonly conflictResolver: IConflictResolver,
    private readonly eventBus: IEventBus,
    private readonly logger: ILogger
  ) {}

  async execute(
    request: CreateAppointmentRequest
  ): Promise<Result<CreateAppointmentResponse>> {
    this.logger.info('Creating appointment', { request });

    try {
      // 1. Load required entities
      const [barber, client, service] = await Promise.all([
        this.barberRepo.findById(new BarberId(request.barberId)),
        this.clientRepo.findById(new ClientId(request.clientId)),
        this.serviceRepo.findById(new ServiceId(request.serviceId))
      ]);

      if (!barber) {
        return Result.fail('Barber not found');
      }
      if (!client) {
        return Result.fail('Client not found');
      }
      if (!service) {
        return Result.fail('Service not found');
      }

      // 2. Validate business rules
      if (!barber.canPerformService(service)) {
        return Result.fail('Barber cannot perform this service');
      }

      // 3. Create time slot
      const startTime = DateTime.fromISO(request.startTime);
      const endTime = startTime.plus(service.duration);
      
      const slotResult = TimeSlot.create(startTime, endTime);
      if (slotResult.isFailure) {
        return Result.fail(slotResult.error);
      }
      const slot = slotResult.value;

      // 4. Check barber availability
      if (!barber.isAvailableAt(slot)) {
        return Result.fail('Barber not available at this time');
      }

      // 5. Detect conflicts
      const conflicts = await this.conflictResolver.detectConflicts(
        barber.id,
        slot
      );

      if (conflicts.length > 0) {
        const alternatives = await this.conflictResolver
          .suggestAlternatives(request, conflicts[0]);
        
        return Result.fail(
          'Time slot conflict',
          { alternatives }
        );
      }

      // 6. Reserve slot with optimistic lock
      const reservation = await this.slotManager.reserveSlot(
        barber.id,
        slot,
        { clientId: client.id, serviceId: service.id }
      );

      if (reservation.isFailure) {
        return Result.fail('Failed to reserve slot');
      }

      // 7. Create appointment entity
      const appointmentResult = Appointment.create({
        client: client.id,
        barber: barber.id,
        service: service.id,
        slot,
        status: AppointmentStatus.PENDING,
        payment: PaymentInfo.pending(service.price)
      });

      if (appointmentResult.isFailure) {
        await this.slotManager.releaseSlot(reservation.value.id);
        return Result.fail(appointmentResult.error);
      }

      const appointment = appointmentResult.value;

      // 8. Persist with transaction
      try {
        await this.appointmentRepo.save(appointment);
      } catch (error) {
        await this.slotManager.releaseSlot(reservation.value.id);
        throw error;
      }

      // 9. Publish domain events
      const events = appointment.getDomainEvents();
      for (const event of events) {
        await this.eventBus.publish(event);
      }
      appointment.clearDomainEvents();

      // 10. Return response
      this.logger.info('Appointment created', { appointmentId: appointment.id });

      return Result.ok({
        appointmentId: appointment.id.value,
        status: appointment.status.value,
        slot: {
          startTime: slot.startTime.toISO(),
          endTime: slot.endTime.toISO()
        }
      });

    } catch (error) {
      this.logger.error('Error creating appointment', { error });
      return Result.fail('Unexpected error creating appointment');
    }
  }
}
```

## Request/Response DTOs

```typescript
// Always define clear DTOs
export class CreateAppointmentRequestDto {
  @IsUUID()
  clientId: string;

  @IsUUID()
  barberId: string;

  @IsUUID()
  serviceId: string;

  @IsISO8601()
  startTime: string;
}

export class AppointmentResponseDto {
  id: string;
  clientId: string;
  barberId: string;
  serviceId: string;
  slot: TimeSlotDto;
  status: string;
  createdAt: string;
}
```

## Transaction Management

```typescript
// Use unit of work pattern for complex operations
export class RescheduleAppointmentUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly appointmentRepo: IAppointmentRepository,
    private readonly slotManager: ISlotManager,
    private readonly eventBus: IEventBus
  ) {}

  async execute(
    request: RescheduleRequest
  ): Promise<Result<void>> {
    // Start transaction
    await this.unitOfWork.start();

    try {
      // Load appointment
      const appointment = await this.appointmentRepo
        .findById(new AppointmentId(request.appointmentId));

      if (!appointment) {
        await this.unitOfWork.rollback();
        return Result.fail('Appointment not found');
      }

      // Create new slot
      const newSlot = TimeSlot.create(
        DateTime.fromISO(request.newStartTime),
        DateTime.fromISO(request.newEndTime)
      );

      if (newSlot.isFailure) {
        await this.unitOfWork.rollback();
        return Result.fail(newSlot.error);
      }

      // Reschedule
      const result = appointment.reschedule(newSlot.value);
      if (result.isFailure) {
        await this.unitOfWork.rollback();
        return result;
      }

      // Save changes
      await this.appointmentRepo.save(appointment);

      // Commit transaction
      await this.unitOfWork.commit();

      // Publish events (after commit)
      const events = appointment.getDomainEvents();
      for (const event of events) {
        await this.eventBus.publish(event);
      }

      return Result.ok();

    } catch (error) {
      await this.unitOfWork.rollback();
      throw error;
    }
  }
}
```

## Error Handling

```typescript
export class CancelAppointmentUseCase {
  async execute(
    request: CancelAppointmentRequest
  ): Promise<Result<void>> {
    try {
      const appointment = await this.appointmentRepo
        .findById(new AppointmentId(request.appointmentId));

      if (!appointment) {
        return Result.fail(
          'Appointment not found',
          ErrorCode.NOT_FOUND
        );
      }

      // Check permissions
      if (!this.canCancel(request.userId, appointment)) {
        return Result.fail(
          'Not authorized to cancel this appointment',
          ErrorCode.FORBIDDEN
        );
      }

      // Business logic
      const result = appointment.cancel(request.reason);
      if (result.isFailure) {
        return Result.fail(
          result.error,
          ErrorCode.BUSINESS_RULE_VIOLATION
        );
      }

      await this.appointmentRepo.save(appointment);

      // Publish event
      await this.eventBus.publish(
        new AppointmentCancelledEvent(appointment, request.reason)
      );

      return Result.ok();

    } catch (error) {
      if (error instanceof ConcurrencyException) {
        return Result.fail(
          'Appointment was modified. Please retry.',
          ErrorCode.CONCURRENCY_ERROR
        );
      }

      this.logger.error('Error cancelling appointment', { error });
      return Result.fail(
        'Unexpected error',
        ErrorCode.INTERNAL_ERROR
      );
    }
  }

  private canCancel(userId: string, appointment: Appointment): boolean {
    // Check if user is the client or has admin role
    return true; // Implement logic
  }
}
```

## Query Use Cases (CQRS)

```typescript
// For read operations, use simpler query use cases
export class GetBarberAvailabilityUseCase {
  constructor(
    private readonly barberRepo: IBarberRepository,
    private readonly appointmentRepo: IAppointmentRepository,
    private readonly slotGenerator: ISlotGenerator,
    private readonly cache: ICacheService
  ) {}

  async execute(
    request: GetBarberAvailabilityRequest
  ): Promise<Result<AvailabilityResponse>> {
    const cacheKey = `availability:${request.barberId}:${request.date}`;
    
    // Try cache first
    const cached = await this.cache.get<AvailabilityResponse>(cacheKey);
    if (cached) {
      return Result.ok(cached);
    }

    // Load barber
    const barber = await this.barberRepo
      .findById(new BarberId(request.barberId));

    if (!barber) {
      return Result.fail('Barber not found');
    }

    // Get existing appointments
    const date = DateTime.fromISO(request.date);
    const appointments = await this.appointmentRepo
      .findByBarberAndDate(barber.id, date);

    // Generate available slots
    const slots = this.slotGenerator.generate(
      barber.schedule,
      date,
      appointments,
      request.serviceDuration
    );

    const response: AvailabilityResponse = {
      barberId: barber.id.value,
      date: request.date,
      availableSlots: slots.map(slot => ({
        startTime: slot.startTime.toISO(),
        endTime: slot.endTime.toISO()
      }))
    };

    // Cache for 5 minutes
    await this.cache.set(cacheKey, response, 300);

    return Result.ok(response);
  }
}
```

## Event Handlers

```typescript
// React to domain events
@EventHandler(AppointmentCompletedEvent)
export class UpdateBarberStatsHandler {
  constructor(
    private readonly barberRepo: IBarberRepository
  ) {}

  async handle(event: AppointmentCompletedEvent): Promise<void> {
    const appointment = event.appointment;
    
    const barber = await this.barberRepo
      .findById(appointment.barber);

    if (barber) {
      barber.recordCompletedAppointment();
      await this.barberRepo.save(barber);
    }
  }
}
```

## Best Practices

1. **Single Responsibility**: Each use case does one thing
2. **Dependency Injection**: Use constructor injection
3. **Transaction Boundaries**: Use cases define transaction scope
4. **Event Publishing**: Publish events after persistence
5. **Error Handling**: Use Result pattern, not exceptions
6. **Logging**: Log important actions
7. **Validation**: Validate at boundaries
8. **Caching**: Cache read-heavy queries

## Testing Use Cases

```typescript
describe('CreateAppointmentUseCase', () => {
  let useCase: CreateAppointmentUseCase;
  let appointmentRepo: MockAppointmentRepository;
  let barberRepo: MockBarberRepository;
  let conflictResolver: MockConflictResolver;

  beforeEach(() => {
    appointmentRepo = new MockAppointmentRepository();
    barberRepo = new MockBarberRepository();
    conflictResolver = new MockConflictResolver();
    
    useCase = new CreateAppointmentUseCase(
      appointmentRepo,
      barberRepo,
      // ... other dependencies
    );
  });

  it('should create appointment when no conflicts', async () => {
    // Arrange
    const request = {
      clientId: 'client-123',
      barberId: 'barber-123',
      serviceId: 'service-123',
      startTime: '2024-01-15T10:00:00Z'
    };

    barberRepo.add(createTestBarber());
    conflictResolver.setConflicts([]);

    // Act
    const result = await useCase.execute(request);

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(appointmentRepo.appointments).toHaveLength(1);
  });

  it('should fail when barber not available', async () => {
    // Test implementation
  });
});
```

## Common Use Cases to Implement

### Booking Engine
- CreateAppointmentUseCase
- CancelAppointmentUseCase
- RescheduleAppointmentUseCase
- ConfirmAppointmentUseCase
- StartAppointmentUseCase
- CompleteAppointmentUseCase

### Availability
- GetBarberAvailabilityUseCase
- SetWorkingHoursUseCase
- AddScheduleExceptionUseCase

### Client Management
- RegisterClientUseCase
- UpdateClientPreferencesUseCase
- GetClientHistoryUseCase

### Payments
- ProcessPaymentUseCase
- RefundPaymentUseCase
- GenerateInvoiceUseCase
