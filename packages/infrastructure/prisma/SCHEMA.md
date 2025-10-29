# Database Schema Documentation

## Overview

This document describes the database schema for the Barbershop Management System. The schema follows Clean Architecture principles and supports Domain-Driven Design patterns.

## Entity Relationship Diagram

```
┌─────────────────┐
│     BARBERS     │
├─────────────────┤
│ id (PK)         │
│ first_name      │
│ last_name       │
│ email (UK)      │
│ phone (UK)      │
│ specialties[]   │
│ schedule (JSON) │
│ status          │
│ commission_rate │
│ rating          │
│ total_appts     │
│ profile_img_url │
│ bio             │
│ version         │◄─────┐
│ created_at      │      │
│ updated_at      │      │
└─────────────────┘      │
                         │
                         │ barber_id (FK)
                         │
                    ┌────┴────────────┐
                    │  APPOINTMENTS   │
                    ├─────────────────┤
                    │ id (PK)         │
                    │ barber_id (FK)  │
                    │ client_id (FK)  │
                    │ service_id (FK) │
                    │ start_time      │
                    │ end_time        │
                    │ status          │
                    │ payment_data    │
                    │ notes           │
                    │ cancellation    │
                    │ cancelled_at    │
                    │ version         │
                    │ created_at      │
                    │ updated_at      │
                    └─────────────────┘
                         │         │
                         │         │
        ┌────────────────┘         └────────────────┐
        │                                           │
        │ client_id (FK)                service_id (FK)
        │                                           │
┌───────▼─────────┐                      ┌─────────▼───────┐
│    CLIENTS      │                      │    SERVICES     │
├─────────────────┤                      ├─────────────────┤
│ id (PK)         │                      │ id (PK)         │
│ first_name      │                      │ name (UK)       │
│ last_name       │                      │ description     │
│ email (UK)      │                      │ duration_mins   │
│ phone (UK)      │                      │ price           │
│ status          │                      │ currency        │
│ preferences     │                      │ category        │
│ total_appts     │                      │ required_skills│
│ completed_appts │                      │ is_active       │
│ cancelled_appts │                      │ version         │
│ no_show_appts   │                      │ created_at      │
│ lifetime_value  │                      │ updated_at      │
│ ltv_currency    │                      └─────────────────┘
│ total_points    │
│ first_visit     │
│ last_visit      │
│ loyalty_tier    │
│ notes           │
│ version         │
│ created_at      │
│ updated_at      │
└─────────────────┘


┌─────────────────────┐
│   DOMAIN_EVENTS     │
├─────────────────────┤
│ id (PK)             │
│ event_type          │
│ aggregate_type      │
│ aggregate_id        │
│ version             │
│ event_data (JSON)   │
│ occurred_at         │
│ processed_at        │
└─────────────────────┘
```

## Tables

### 1. BARBERS

**Purpose**: Stores barber/stylist information and availability.

**Key Features**:
- Optimistic locking with `version` field
- Array of specialties (e.g., HAIRCUT, BEARD, STYLING, COLORING, TREATMENT)
- JSONB schedule for working hours per day
- Performance metrics (rating, total appointments)
- Commission rate tracking

**Status Values**: ACTIVE, INACTIVE, ON_LEAVE

**Indexes**:
- `barbers_email_idx` - Fast email lookups
- `barbers_status_idx` - Filter by status
- `barbers_specialties_idx` - Search by skills

**Sample Data**:
```sql
-- Juan Pérez - Senior Barber
{
  "specialties": ["HAIRCUT", "BEARD", "STYLING"],
  "schedule": {
    "monday": {"start": "09:00", "end": "18:00", "available": true},
    ...
  },
  "commission_rate": 50.00,
  "rating": 4.8
}
```

---

### 2. CLIENTS

**Purpose**: Client information with loyalty program and history tracking.

**Key Features**:
- Optimistic locking with `version` field
- JSONB preferences (language, contact method, notifications)
- Comprehensive appointment history metrics
- Loyalty points system with tier tracking
- Lifetime value tracking in ARS currency
- First and last visit dates for retention analysis

**Status Values**: ACTIVE, INACTIVE, SUSPENDED, BLOCKED

**Loyalty Tiers**: BRONZE (0-50 pts), SILVER (51-150 pts), GOLD (151-300 pts), PLATINUM (301+ pts)

**Indexes**:
- `clients_email_idx` - Fast email lookups
- `clients_phone_idx` - Fast phone lookups
- `clients_status_idx` - Filter by status
- `clients_loyalty_tier_idx` - Segment by loyalty tier

**Sample Data**:
```sql
-- Pedro Martínez - Gold Tier Client
{
  "preferences": {
    "language": "es",
    "receivePromotions": true,
    "receiveReminders": true,
    "preferredContactMethod": "whatsapp"
  },
  "total_points": 150,
  "loyalty_tier": "GOLD",
  "lifetime_value": 12500.00
}
```

---

### 3. SERVICES

**Purpose**: Service catalog with pricing and duration.

**Key Features**:
- Optimistic locking with `version` field
- Price in ARS currency (configurable)
- Duration in minutes for scheduling
- Array of required skills to match with barbers
- Category classification
- Active/inactive flag for soft deletion

**Categories**: HAIRCUT, BEARD, STYLING, COLORING, TREATMENT

**Indexes**:
- `services_name_idx` - Fast service lookup
- `services_category_idx` - Filter by category
- `services_is_active_idx` - Show only active services

**Sample Data**:
```sql
-- Corte de Cabello Premium
{
  "name": "Corte de Cabello Premium",
  "duration_minutes": 45,
  "price": 1200.00,
  "currency": "ARS",
  "category": "HAIRCUT",
  "required_skills": ["HAIRCUT", "STYLING"]
}
```

---

### 4. APPOINTMENTS

**Purpose**: Appointment scheduling with conflict detection.

**Key Features**:
- Optimistic locking with `version` field for concurrency control
- Foreign keys to barbers, clients, and services
- Time slot tracking (start_time, end_time)
- JSONB payment data for flexible payment info storage
- Cancellation tracking with reason and timestamp

**Status Values**: PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW

**Indexes**:
- `appointments_barber_id_start_time_idx` - Barber availability
- `appointments_client_id_idx` - Client history
- `appointments_service_id_idx` - Service analytics
- `appointments_status_idx` - Filter by status
- `appointments_start_time_end_time_idx` - Time range queries
- **Composite Index** for conflict detection: `barber_id + start_time + end_time + status`

**Conflict Detection**:
The composite index enables efficient detection of scheduling conflicts:
```sql
-- Check if barber is available at given time
SELECT * FROM appointments
WHERE barber_id = $1
  AND status NOT IN ('CANCELLED', 'NO_SHOW')
  AND start_time < $endTime
  AND end_time > $startTime;
```

---

### 5. DOMAIN_EVENTS

**Purpose**: Event sourcing and audit trail (optional).

**Key Features**:
- Stores domain events for all aggregates
- JSONB event data for flexible event payloads
- Processing status tracking
- Version tracking for event replay

**Event Types**:
- Barber: BarberCreated, BarberUpdated, BarberActivated, BarberDeactivated
- Client: ClientCreated, ClientUpdated, ClientActivated, ClientSuspended
- Service: ServiceCreated, ServiceUpdated, ServicePriceUpdated
- Appointment: AppointmentCreated, AppointmentConfirmed, AppointmentCompleted, AppointmentCancelled

**Indexes**:
- `domain_events_aggregate_type_aggregate_id_idx` - Event replay by aggregate
- `domain_events_event_type_idx` - Filter by event type
- `domain_events_occurred_at_idx` - Temporal queries

---

## Design Patterns

### 1. Optimistic Locking

All aggregate roots (Barbers, Clients, Services, Appointments) include a `version` field that:
- Starts at 1 on creation
- Increments on each update
- Prevents lost updates in concurrent scenarios

**Usage Example**:
```sql
-- Update with optimistic lock
UPDATE barbers
SET rating = $newRating, version = version + 1
WHERE id = $id AND version = $expectedVersion;

-- Check if update succeeded
IF (rowcount = 0) THEN
  RAISE EXCEPTION 'Concurrent modification detected';
END IF;
```

### 2. Soft Deletion

Instead of hard deletes, entities use status fields:
- Barbers: `status = 'INACTIVE'`
- Clients: `status = 'INACTIVE'` or `'SUSPENDED'`
- Services: `is_active = false`
- Appointments: `status = 'CANCELLED'`

### 3. JSONB for Flexibility

Complex nested data stored as JSONB for:
- **Barber schedules**: Variable working hours per day
- **Client preferences**: Language, notifications, contact methods
- **Payment data**: Flexible payment information
- **Domain events**: Variable event payloads

### 4. Audit Trail

All entities include:
- `created_at`: Automatic timestamp on creation
- `updated_at`: Automatic timestamp on updates
- Domain events table for complete audit history

---

## Business Rules Enforced by Schema

### Unique Constraints
- Barber email must be unique
- Barber phone must be unique
- Client email must be unique
- Client phone must be unique
- Service name must be unique

### Referential Integrity
- Appointments must reference valid barber, client, and service
- Cascade behavior: RESTRICT (prevent deletion of referenced entities)

### Data Validation (Application Layer)
- Email format validation
- Phone format validation (E.164)
- Date/time ranges for appointments
- Currency validation
- Skill matching (barber skills vs service requirements)

---

## Performance Considerations

### Index Strategy
- **Email/Phone indexes**: Fast authentication and lookup
- **Status indexes**: Efficient filtering of active/inactive entities
- **Time-based indexes**: Optimized appointment scheduling queries
- **Composite indexes**: Conflict detection without full table scans

### Expected Query Patterns
1. Find available barbers for specific time slot and service
2. Get client appointment history
3. Calculate barber performance metrics
4. Search appointments by date range
5. Loyalty program analytics

### Scalability
- Partitioning strategy: Partition appointments by date range (monthly)
- Archive strategy: Move old appointments to archive tables
- Caching strategy: Cache active services, barber schedules

---

## Migration Strategy

### Initial Migration
```bash
# Create database
createdb barbershop

# Run migration
psql -d barbershop -f migrations/20250929000000_initial_schema/migration.sql

# Verify tables
psql -d barbershop -c "\dt"
```

### Seed Data
```bash
# Load development data
npm run prisma:seed

# Verify data
psql -d barbershop -c "SELECT COUNT(*) FROM barbers;"
```

### Future Migrations
- Use Prisma Migrate for schema evolution
- Always include rollback scripts
- Test migrations on staging before production
- Backup database before migration

---

## Security Considerations

### PII Protection
- Client email, phone, and notes contain PII
- Implement column-level encryption if required
- Apply GDPR compliance for data retention

### Access Control
- Application-level authorization
- Row-level security policies (if needed)
- Audit logging for sensitive operations

### Injection Prevention
- Use parameterized queries
- Validate all user inputs
- Sanitize JSONB data

---

## Maintenance

### Regular Tasks
- **Daily**: Monitor query performance
- **Weekly**: Review slow query log
- **Monthly**: Analyze table bloat and vacuum
- **Quarterly**: Review and optimize indexes

### Monitoring Queries
```sql
-- Table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;

-- Slow queries (requires pg_stat_statements extension)
SELECT
  query,
  calls,
  total_time,
  mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-10-29 | Initial schema with all core entities |

---

## References

- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Clean Architecture Principles](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
