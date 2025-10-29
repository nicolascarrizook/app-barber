---
name: domain-architect
description: Specialized in designing domain models, entities, value objects, and business rules for the barbershop system. Use when creating or modifying domain layer components, defining business logic, establishing validation rules, creating aggregate roots, designing domain events, or implementing domain services. Expert in Domain-Driven Design patterns and Clean Architecture domain layer.
---

# Domain Architect Skill

Specialized skill for designing and implementing the domain layer of the barbershop system.

## Responsibilities

1. **Design Entities**: Create aggregate roots and entities with business logic
2. **Value Objects**: Design immutable value objects for domain concepts
3. **Business Rules**: Implement domain validation and invariants
4. **Domain Events**: Define events for cross-aggregate communication
5. **Domain Services**: Implement operations that don't belong to a single entity

## When to Use This Skill

- Creating new domain entities (Appointment, Barber, Client, Service)
- Designing value objects (TimeSlot, Money, PersonalInfo)
- Implementing business rules and validation
- Defining domain events
- Creating domain services
- Refactoring domain logic

## Entity Design Patterns

### Aggregate Root Pattern

```typescript
export class Appointment extends AggregateRoot<AppointmentId> {
  private constructor(
    id: AppointmentId,
    private _client: ClientId,
    private _barber: BarberId,
    private _service: ServiceId,
    private _slot: TimeSlot,
    private _status: AppointmentStatus,
    private _version: number = 0
  ) {
    super(id);
  }

  static create(props: CreateAppointmentProps): Result<Appointment> {
    // Validation
    if (!props.slot.isValid()) {
      return Result.fail('Invalid time slot');
    }

    const appointment = new Appointment(
      AppointmentId.create(),
      props.clientId,
      props.barberId,
      props.serviceId,
      props.slot,
      AppointmentStatus.PENDING
    );

    // Emit domain event
    appointment.addDomainEvent(
      new AppointmentCreatedEvent(appointment)
    );

    return Result.ok(appointment);
  }

  cancel(reason: string): Result<void> {
    // Business rule: Cannot cancel completed appointments
    if (this._status === AppointmentStatus.COMPLETED) {
      return Result.fail('Cannot cancel completed appointment');
    }

    // Business rule: Cannot cancel past appointments
    if (this._slot.isPast()) {
      return Result.fail('Cannot cancel past appointment');
    }

    this._status = AppointmentStatus.CANCELLED;
    
    this.addDomainEvent(
      new AppointmentCancelledEvent(this, reason)
    );

    return Result.ok();
  }

  // Getters with encapsulation
  get client(): ClientId { return this._client; }
  get barber(): BarberId { return this._barber; }
  get slot(): TimeSlot { return this._slot; }
  get status(): AppointmentStatus { return this._status; }
  get version(): number { return this._version; }
  
  incrementVersion(): void {
    this._version++;
  }
}
```

### Value Object Pattern

```typescript
export class TimeSlot extends ValueObject<TimeSlotProps> {
  private constructor(
    private readonly _startTime: DateTime,
    private readonly _endTime: DateTime
  ) {
    super({ _startTime, _endTime });
  }

  static create(
    startTime: DateTime,
    endTime: DateTime
  ): Result<TimeSlot> {
    // Validation
    if (endTime.isBefore(startTime)) {
      return Result.fail('End time must be after start time');
    }

    if (startTime.isPast()) {
      return Result.fail('Start time cannot be in the past');
    }

    return Result.ok(new TimeSlot(startTime, endTime));
  }

  get startTime(): DateTime { return this._startTime; }
  get endTime(): DateTime { return this._endTime; }

  get duration(): Duration {
    return Duration.between(this._startTime, this._endTime);
  }

  overlaps(other: TimeSlot): boolean {
    return this._startTime.isBefore(other._endTime) &&
           this._endTime.isAfter(other._startTime);
  }

  isPast(): boolean {
    return this._endTime.isPast();
  }
}
```

### Domain Event Pattern

```typescript
export class AppointmentCreatedEvent extends DomainEvent {
  constructor(
    public readonly appointment: Appointment,
    public readonly occurredAt: DateTime = DateTime.now()
  ) {
    super();
  }

  getAggregateId(): string {
    return this.appointment.id.value;
  }
}
```

## Business Rules Implementation

### Rule: Prevent Double Booking

```typescript
// In Appointment entity
static canBeBooked(
  barber: Barber,
  slot: TimeSlot,
  existingAppointments: Appointment[]
): Result<void> {
  // Rule: Barber must be available at the time
  if (!barber.isAvailableAt(slot)) {
    return Result.fail('Barber is not available at this time');
  }

  // Rule: No overlapping appointments
  const hasConflict = existingAppointments.some(apt =>
    apt.slot.overlaps(slot)
  );

  if (hasConflict) {
    return Result.fail('Time slot conflicts with existing appointment');
  }

  return Result.ok();
}
```

### Rule: Commission Calculation

```typescript
// In Barber entity
calculateCommission(revenue: Money): Money {
  const commissionPercentage = this._commissionConfig.percentage;
  return revenue.percentage(commissionPercentage);
}
```

## Domain Services

Use domain services for operations that involve multiple entities or don't naturally fit in a single entity.

```typescript
export class ConflictResolverService {
  detectConflicts(
    barberId: BarberId,
    proposedSlot: TimeSlot,
    existingAppointments: Appointment[]
  ): Conflict[] {
    const conflicts: Conflict[] = [];

    for (const appointment of existingAppointments) {
      if (appointment.barber.equals(barberId) &&
          appointment.slot.overlaps(proposedSlot)) {
        conflicts.push(
          new Conflict(appointment, proposedSlot)
        );
      }
    }

    return conflicts;
  }

  suggestAlternatives(
    originalSlot: TimeSlot,
    barberSchedule: Schedule,
    existingAppointments: Appointment[]
  ): TimeSlot[] {
    const alternatives: TimeSlot[] = [];
    const duration = originalSlot.duration;
    
    // Suggest slots 30 minutes before and after
    const before = originalSlot.startTime.subtract(Duration.minutes(30));
    const after = originalSlot.endTime.add(Duration.minutes(30));
    
    // Check if alternatives are available
    // ... implementation
    
    return alternatives;
  }
}
```

## Repository Interfaces

Define repository interfaces in the domain layer:

```typescript
export interface IAppointmentRepository {
  save(appointment: Appointment): Promise<Appointment>;
  findById(id: AppointmentId): Promise<Appointment | null>;
  findByBarberAndDateRange(
    barberId: BarberId,
    startDate: DateTime,
    endDate: DateTime
  ): Promise<Appointment[]>;
  findConflicting(
    barberId: BarberId,
    slot: TimeSlot
  ): Promise<Appointment[]>;
  delete(id: AppointmentId): Promise<void>;
}
```

## Validation Best Practices

1. **Validate at creation**: Use static factory methods
2. **Validate state changes**: In business methods
3. **Use Result pattern**: Don't throw exceptions for business rule violations
4. **Be explicit**: Clear error messages
5. **Fail fast**: Validate as early as possible

## Common Entities

### Appointment
- Aggregate root for booking system
- Manages lifecycle (PENDING → CONFIRMED → IN_PROGRESS → COMPLETED)
- Enforces business rules (no cancellation of completed, no past appointments)

### Barber
- Aggregate root for barber management
- Manages skills, schedule, availability
- Calculates commissions

### Client
- Aggregate root for client management
- Manages loyalty points, preferences
- Tracks visit history and spending

### Service
- Entity for service catalog
- Defines duration, price, required skills

## Tips

1. Keep entities focused on business logic
2. No framework dependencies in domain layer
3. Use value objects for concepts without identity
4. Emit domain events for important state changes
5. Keep aggregates small and focused
6. Use domain services for cross-entity operations

## Next Steps After Creating Entities

1. Define repository interfaces
2. Create domain events
3. Implement unit tests for business logic
4. Document business rules
5. Hand off to usecase-builder for application layer
