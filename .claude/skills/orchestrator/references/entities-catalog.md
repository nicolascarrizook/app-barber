# Entities Catalog - Barbershop System

Complete catalog of all domain entities in the barbershop management system.

## Aggregate Roots

### 1. Appointment

**Description**: Core entity representing a scheduled service between a client and barber.

**Properties**:
- `id: AppointmentId` (PK)
- `client: ClientId` (FK)
- `barber: BarberId` (FK)
- `service: ServiceId` (FK)
- `slot: TimeSlot` (Value Object)
- `status: AppointmentStatus` (Enum)
- `payment: PaymentInfo` (Value Object)
- `notes: string`
- `version: number` (for optimistic locking)
- `createdAt: DateTime`
- `updatedAt: DateTime`

**Business Methods**:
- `create(props)`: Static factory method
- `cancel(reason)`: Cancel appointment
- `reschedule(newSlot)`: Move to different time
- `start()`: Mark as in progress
- `complete(notes)`: Mark as completed
- `markAsNoShow()`: Client didn't show up
- `canBeCancelled()`: Check if cancellation allowed
- `canBeRescheduled()`: Check if rescheduling allowed

**Domain Events**:
- `AppointmentCreatedEvent`
- `AppointmentCancelledEvent`
- `AppointmentRescheduledEvent`
- `AppointmentStartedEvent`
- `AppointmentCompletedEvent`
- `AppointmentNoShowEvent`

**Invariants**:
- End time must be after start time
- Cannot modify completed appointments
- Cannot cancel past appointments
- Status transitions must follow valid state machine

---

### 2. Barber

**Description**: Represents a barber with their skills, schedule, and availability.

**Properties**:
- `id: BarberId` (PK)
- `personalInfo: PersonalInfo` (Value Object)
- `skills: BarberSkill[]` (Collection)
- `schedule: WeeklySchedule` (Value Object)
- `status: BarberStatus` (Enum: ACTIVE, INACTIVE, ON_LEAVE)
- `commissionConfig: CommissionConfig` (Value Object)
- `rating: Rating` (Value Object)
- `createdAt: DateTime`

**Business Methods**:
- `create(props)`: Static factory
- `addSkill(skill)`: Add new skill/certification
- `removeSkill(skillId)`: Remove skill
- `setWorkingHours(schedule)`: Update schedule
- `isAvailableAt(slot)`: Check availability
- `canPerformService(service)`: Validate capability
- `calculateCommission(revenue)`: Compute earnings

**Domain Events**:
- `BarberCreatedEvent`
- `BarberScheduleUpdatedEvent`
- `BarberSkillAddedEvent`
- `BarberSkillRemovedEvent`
- `BarberStatusChangedEvent`

**Invariants**:
- Must have at least one skill
- Working hours cannot overlap
- Status changes must be valid
- Commission percentage must be 0-100

---

### 3. Client

**Description**: Represents a customer who books appointments.

**Properties**:
- `id: ClientId` (PK)
- `personalInfo: PersonalInfo` (Value Object)
- `contactInfo: ContactInfo` (Value Object)
- `preferences: ClientPreferences` (Value Object)
- `segment: ClientSegment` (Enum: REGULAR, VIP, NEW)
- `loyaltyPoints: number`
- `totalVisits: number`
- `totalSpent: Money` (Value Object)
- `createdAt: DateTime`

**Business Methods**:
- `create(props)`: Static factory
- `updatePreferences(prefs)`: Modify preferences
- `addLoyaltyPoints(points)`: Add points
- `redeemLoyaltyPoints(points)`: Use points
- `isVIP()`: Check VIP status
- `recordVisit(amount)`: Track visit and spending

**Domain Events**:
- `ClientRegisteredEvent`
- `ClientPreferencesUpdatedEvent`
- `ClientSegmentChangedEvent`
- `LoyaltyPointsAddedEvent`
- `LoyaltyPointsRedeemedEvent`

**Invariants**:
- Email must be unique and valid
- Loyalty points cannot be negative
- Segment automatically updated based on criteria

---

### 4. Service

**Description**: A service offered by the barbershop (haircut, beard trim, etc.).

**Properties**:
- `id: ServiceId` (PK)
- `name: string`
- `description: string`
- `duration: Duration` (Value Object)
- `price: Money` (Value Object)
- `category: ServiceCategory` (Enum)
- `requiredSkills: BarberSkill[]`
- `active: boolean`
- `createdAt: DateTime`

**Business Methods**:
- `create(props)`: Static factory
- `updatePrice(newPrice)`: Change price
- `setDuration(duration)`: Update duration
- `activate()`: Make available
- `deactivate()`: Remove from catalog
- `requiresSkill(skill)`: Check skill requirement

**Domain Events**:
- `ServiceCreatedEvent`
- `ServicePriceUpdatedEvent`
- `ServiceActivatedEvent`
- `ServiceDeactivatedEvent`

**Invariants**:
- Duration must be positive
- Price must be positive
- Name must be unique
- Must have at least one required skill

---

## Entities (Not Aggregate Roots)

### 5. Payment

**Description**: Payment record for an appointment.

**Properties**:
- `id: PaymentId` (PK)
- `appointmentId: AppointmentId` (FK)
- `amount: Money` (Value Object)
- `method: PaymentMethod` (Enum: CASH, MERCADOPAGO, CARD)
- `status: PaymentStatus` (Enum: PENDING, COMPLETED, FAILED, REFUNDED)
- `transactionId: string` (for MercadoPago)
- `paidAt: DateTime`
- `createdAt: DateTime`

**Parent**: Appointment aggregate

---

### 6. Schedule

**Description**: Weekly schedule for a barber.

**Properties**:
- `id: ScheduleId` (PK)
- `barberId: BarberId` (FK)
- `workingDays: WorkingDay[]`
- `exceptions: ScheduleException[]`
- `breaks: Break[]`

**Parent**: Barber aggregate

---

### 7. Rating

**Description**: Client rating for a completed appointment.

**Properties**:
- `id: RatingId` (PK)
- `appointmentId: AppointmentId` (FK)
- `clientId: ClientId` (FK)
- `barberId: BarberId` (FK)
- `score: number` (1-5)
- `comment: string`
- `createdAt: DateTime`

**Parent**: Appointment aggregate

---

## Value Objects

### TimeSlot
```typescript
{
  startTime: DateTime
  endTime: DateTime
  duration: Duration
}
```

### Money
```typescript
{
  amount: number
  currency: Currency (default: ARS)
}
```

### PersonalInfo
```typescript
{
  firstName: string
  lastName: string
  fullName: string (computed)
}
```

### ContactInfo
```typescript
{
  email: Email
  phone: PhoneNumber
  preferredChannel: ContactChannel
}
```

### ClientPreferences
```typescript
{
  preferredBarber: BarberId | null
  preferredTimeSlots: TimeSlot[]
  communicationPreferences: CommunicationPrefs
  notes: string
}
```

### CommissionConfig
```typescript
{
  percentage: number
  bonusRules: BonusRule[]
}
```

### PaymentInfo
```typescript
{
  totalAmount: Money
  paidAmount: Money
  remainingAmount: Money
  method: PaymentMethod
  status: PaymentStatus
}
```

---

## Enums

### AppointmentStatus
- PENDING
- CONFIRMED
- IN_PROGRESS
- COMPLETED
- CANCELLED
- NO_SHOW
- RESCHEDULED

### BarberStatus
- ACTIVE
- INACTIVE
- ON_LEAVE

### ServiceCategory
- HAIRCUT
- BEARD
- COMBO
- STYLING
- OTHER

### PaymentMethod
- CASH
- MERCADOPAGO
- CARD
- TRANSFER

### PaymentStatus
- PENDING
- COMPLETED
- FAILED
- REFUNDED

### ClientSegment
- NEW (< 3 visits)
- REGULAR (3-10 visits)
- VIP (> 10 visits or high spending)

### ContactChannel
- EMAIL
- SMS
- WHATSAPP
- PHONE

---

## Domain Services

### ConflictResolver
Detects and resolves appointment scheduling conflicts.

### SlotManager
Generates available time slots based on barber schedules and existing appointments.

### CommissionCalculator
Calculates barber commissions based on completed appointments.

### LoyaltyPointsCalculator
Determines loyalty points earned from appointments.

---

## Repository Interfaces

All defined in domain layer:

- `IAppointmentRepository`
- `IBarberRepository`
- `IClientRepository`
- `IServiceRepository`
- `IPaymentRepository`
- `IScheduleRepository`
- `IRatingRepository`

Implementations in infrastructure layer using Prisma ORM.
