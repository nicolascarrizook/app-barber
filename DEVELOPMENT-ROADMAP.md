# 🚀 Development Roadmap - Sistema Barbería Profesional

## 📊 Índice de Complejidad (Perplejidad)

- **🟢 Baja (1-3)**: Tareas simples, bien definidas, sin dependencias complejas
- **🟡 Media (4-6)**: Requiere coordinación, lógica de negocio moderada
- **🟠 Alta (7-8)**: Lógica compleja, múltiples dependencias, requiere expertise
- **🔴 Crítica (9-10)**: Riesgo alto, componente crítico del sistema, arquitectura compleja

---

## 📋 FASE 0: PRE-SETUP Y DECISIONES ESTRATÉGICAS

### TASK-000: Decisiones de Arquitectura
**Complejidad**: 🟢 2
**Estimación**: 2 horas
**Responsable**: Product Owner + Arquitecto
**Dependencias**: Ninguna

**Decisiones requeridas**:
- [ ] Gateway de pagos: MercadoPago, Stripe, Otro
- [ ] Proveedor SMS/Email: SendGrid, Twilio, Otro
- [ ] Hosting: AWS, DigitalOcean, Railway
- [ ] App mobile: Fase 1 o posterior
- [ ] Multi-idioma: Desde inicio o posterior
- [ ] Base de datos: PostgreSQL confirmado
- [ ] Caché: Redis confirmado

**Resultado**: Documento de decisiones técnicas aprobado

---

## 🏗️ FASE 1: FUNDAMENTOS Y SETUP (Semanas 1-2)

### TASK-001: Inicializar Proyecto Monorepo
**Complejidad**: 🟡 4
**Estimación**: 8 horas
**Skill**: orchestrator
**Dependencias**: TASK-000

**Subtareas**:
1. [ ] Crear estructura de monorepo (Turborepo o Nx)
   - apps/api (NestJS)
   - apps/web (Next.js)
   - apps/admin (Next.js)
   - packages/domain
   - packages/shared
   - packages/ui

2. [ ] Configurar herramientas de desarrollo
   - ESLint + Prettier
   - TypeScript config compartido
   - Jest config compartido
   - Husky + lint-staged

3. [ ] Configurar scripts de automatización
   - npm run dev (todos los apps)
   - npm run build
   - npm run test
   - npm run lint

**Criterios de aceptación**:
- [x] Estructura de carpetas creada
- [x] Todos los apps pueden ejecutarse simultáneamente
- [x] Linting y formateo funcionando
- [x] Git hooks configurados

---

### TASK-002: Configurar Infrastructure Local
**Complejidad**: 🟡 5
**Estimación**: 6 horas
**Skill**: infrastructure-engineer
**Dependencias**: TASK-001

**Subtareas**:
1. [ ] Docker Compose setup
   - PostgreSQL 15
   - Redis 7
   - pgAdmin (opcional)
   - RedisInsight (opcional)

2. [ ] Scripts de inicialización
   - init-db.sh
   - seed-data.sh
   - reset-db.sh

3. [ ] Variables de entorno
   - .env.example
   - .env.development
   - .env.test

**Criterios de aceptación**:
- [x] `docker-compose up` inicia todos los servicios
- [x] Base de datos accesible
- [x] Redis accesible
- [x] Datos de ejemplo cargados

---

### TASK-003: Setup Backend Base (NestJS)
**Complejidad**: 🟡 6
**Estimación**: 10 horas
**Skill**: api-designer + infrastructure-engineer
**Dependencias**: TASK-001, TASK-002

**Subtareas**:
1. [ ] Configurar NestJS con arquitectura modular
   - AppModule
   - ConfigModule
   - DatabaseModule
   - AuthModule (estructura)

2. [ ] Integrar Prisma ORM
   - Schema.prisma base
   - Migrations setup
   - Prisma Client configurado

3. [ ] Configurar validación
   - class-validator
   - class-transformer
   - Pipes globales

4. [ ] Setup de testing
   - Jest configurado
   - Supertest para E2E
   - Test database setup

5. [ ] Configurar logging
   - Winston o Pino
   - Log levels
   - Request logging

**Criterios de aceptación**:
- [x] NestJS corriendo en puerto configurado
- [x] Conexión a base de datos funcionando
- [x] Validación global activada
- [x] Tests básicos pasando
- [x] Logs estructurados funcionando

---

### TASK-004: Setup Frontend Base (Next.js Web)
**Complejidad**: 🟡 5
**Estimación**: 8 horas
**Skill**: frontend-developer
**Dependencias**: TASK-001

**Subtareas**:
1. [ ] Configurar Next.js 14 (App Router)
   - Estructura de rutas
   - Layout base
   - Metadata

2. [ ] Configurar Tailwind CSS + shadcn/ui
   - Instalar dependencias
   - Configurar theme
   - Instalar componentes base

3. [ ] Configurar TanStack Query
   - QueryClientProvider
   - Configuración de caché
   - DevTools

4. [ ] Configurar Zustand
   - Store base
   - Persistencia (opcional)

5. [ ] Setup de testing frontend
   - Vitest
   - Testing Library
   - MSW para mocks

**Criterios de aceptación**:
- [x] Next.js corriendo en puerto configurado
- [x] Tailwind y shadcn/ui funcionando
- [x] TanStack Query configurado
- [x] Zustand funcionando
- [x] Tests básicos pasando

---

### TASK-005: Crear Domain Layer Base
**Complejidad**: 🟠 7
**Estimación**: 12 horas
**Skill**: domain-architect
**Dependencias**: TASK-001

**Subtareas**:
1. [ ] Crear clases base abstractas
   - `Entity<T>` base class
   - `AggregateRoot<T>` base class
   - `ValueObject<T>` base class
   - `DomainEvent` base class
   - `Result<T>` pattern

2. [ ] Crear tipos compartidos
   - `UniqueEntityID`
   - `Identifier<T>`
   - Error types

3. [ ] Crear interfaces de repositorio base
   - `IRepository<T>` interface
   - CRUD operations base

4. [ ] Documentar patrones DDD
   - Entity pattern
   - Value Object pattern
   - Aggregate pattern
   - Repository pattern

**Criterios de aceptación**:
- [x] Clases base implementadas y probadas
- [x] Tipos compartidos definidos
- [x] Interfaces documentadas
- [x] Tests unitarios >95% coverage

---

## 🎯 FASE 2: DOMAIN LAYER - ENTIDADES CORE (Semanas 3-4)

### TASK-010: Crear Value Objects Core
**Complejidad**: 🟡 5
**Estimación**: 10 horas
**Skill**: domain-architect
**Dependencias**: TASK-005

**Subtareas**:
1. [ ] **TimeSlot** Value Object
   - Propiedades: startTime, endTime
   - Métodos: overlaps(), duration(), isValid(), isPast()
   - Validaciones: endTime > startTime, no past slots
   - Tests: 15+ casos de prueba

2. [ ] **Money** Value Object
   - Propiedades: amount, currency
   - Métodos: add(), subtract(), multiply(), percentage()
   - Validaciones: amount >= 0, same currency for operations
   - Tests: 20+ casos de prueba

3. [ ] **Email** Value Object
   - Validación de formato
   - Normalización
   - Tests: 10+ casos

4. [ ] **Phone** Value Object
   - Validación de formato
   - Normalización internacional
   - Tests: 10+ casos

5. [ ] **PersonalInfo** Value Object
   - firstName, lastName, dateOfBirth
   - Validaciones
   - Tests: 8+ casos

6. [ ] **ContactInfo** Value Object
   - email, phone, address (opcional)
   - Validaciones
   - Tests: 10+ casos

**Criterios de aceptación**:
- [x] Todos los VOs inmutables
- [x] Validaciones completas
- [x] Tests unitarios >95% coverage
- [x] Documentación de cada VO

**Archivos a crear**:
```
packages/domain/src/value-objects/
├── time-slot.vo.ts
├── time-slot.vo.spec.ts
├── money.vo.ts
├── money.vo.spec.ts
├── email.vo.ts
├── email.vo.spec.ts
├── phone.vo.ts
├── phone.vo.spec.ts
├── personal-info.vo.ts
├── personal-info.vo.spec.ts
├── contact-info.vo.ts
└── contact-info.vo.spec.ts
```

---

### TASK-011: Crear Entidad Appointment
**Complejidad**: 🟠 8
**Estimación**: 16 horas
**Skill**: domain-architect
**Dependencias**: TASK-010

**Subtareas**:
1. [ ] Definir Appointment Entity
   - Propiedades: id, client, barber, service, slot, status, payment, notes, version
   - Estados: PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW
   - Aggregate Root

2. [ ] Implementar métodos de negocio
   - `create()` - Factory method con validaciones
   - `cancel(reason)` - Validar reglas de cancelación
   - `reschedule(newSlot)` - Validar disponibilidad
   - `start()` - Iniciar servicio
   - `complete(notes)` - Completar servicio
   - `markAsNoShow()` - Marcar no-show
   - `canBeCancelled()` - Regla de negocio
   - `canBeRescheduled()` - Regla de negocio

3. [ ] Crear Domain Events
   - AppointmentCreatedEvent
   - AppointmentCancelledEvent
   - AppointmentRescheduledEvent
   - AppointmentStartedEvent
   - AppointmentCompletedEvent
   - AppointmentNoShowEvent

4. [ ] Implementar validaciones de negocio
   - No crear turno en el pasado
   - No cancelar turno completado
   - No reprogramar turno pasado
   - Estado válido para cada transición

5. [ ] Tests exhaustivos
   - 40+ casos de prueba
   - Todos los estados y transiciones
   - Todos los eventos emitidos correctamente
   - Validaciones de negocio

**Criterios de aceptación**:
- [x] Entidad implementada con todos los métodos
- [x] Todos los domain events funcionando
- [x] Validaciones de negocio completas
- [x] Tests unitarios >95% coverage
- [x] Documentación completa

**Archivos a crear**:
```
packages/domain/src/entities/appointment/
├── appointment.entity.ts
├── appointment.entity.spec.ts
├── appointment-status.enum.ts
├── events/
│   ├── appointment-created.event.ts
│   ├── appointment-cancelled.event.ts
│   ├── appointment-rescheduled.event.ts
│   ├── appointment-started.event.ts
│   ├── appointment-completed.event.ts
│   └── appointment-no-show.event.ts
└── payment-info.vo.ts
```

---

### TASK-012: Crear Entidad Barber
**Complejidad**: 🟠 7
**Estimación**: 14 horas
**Skill**: domain-architect
**Dependencias**: TASK-010

**Subtareas**:
1. [ ] Definir Barber Entity
   - Propiedades: id, personalInfo, skills, schedule, status, commissionConfig
   - Estados: ACTIVE, INACTIVE, ON_BREAK
   - Aggregate Root

2. [ ] Crear Value Objects específicos
   - BarberSkill
   - WeeklySchedule
   - DaySchedule
   - CommissionConfig
   - Rating

3. [ ] Implementar métodos de negocio
   - `create()` - Factory method
   - `addSkill(skill)` - Agregar habilidad
   - `removeSkill(skillId)` - Remover habilidad
   - `setWorkingHours(schedule)` - Configurar horario
   - `isAvailableAt(slot)` - Verificar disponibilidad
   - `canPerformService(service)` - Verificar capacidad
   - `calculateCommission(revenue)` - Calcular comisión
   - `activate()` / `deactivate()` - Cambiar estado

4. [ ] Crear Domain Events
   - BarberCreatedEvent
   - BarberScheduleUpdatedEvent
   - BarberSkillAddedEvent
   - BarberSkillRemovedEvent
   - BarberActivatedEvent
   - BarberDeactivatedEvent

5. [ ] Tests exhaustivos
   - 35+ casos de prueba
   - Validaciones de schedule
   - Cálculo de disponibilidad
   - Cálculo de comisiones

**Criterios de aceptación**:
- [x] Entidad implementada con todos los métodos
- [x] Value Objects específicos creados
- [x] Lógica de disponibilidad correcta
- [x] Tests unitarios >95% coverage
- [x] Documentación completa

**Archivos a crear**:
```
packages/domain/src/entities/barber/
├── barber.entity.ts
├── barber.entity.spec.ts
├── barber-status.enum.ts
├── barber-skill.vo.ts
├── weekly-schedule.vo.ts
├── day-schedule.vo.ts
├── commission-config.vo.ts
├── rating.vo.ts
└── events/
    ├── barber-created.event.ts
    ├── barber-schedule-updated.event.ts
    ├── barber-skill-added.event.ts
    └── barber-skill-removed.event.ts
```

---

### TASK-013: Crear Entidad Client
**Complejidad**: 🟡 6
**Estimación**: 12 horas
**Skill**: domain-architect
**Dependencias**: TASK-010

**Subtareas**:
1. [ ] Definir Client Entity
   - Propiedades: id, personalInfo, contactInfo, preferences, segment, loyaltyPoints
   - Segmentos: REGULAR, VIP, PREMIUM
   - Aggregate Root

2. [ ] Crear Value Objects específicos
   - ClientPreferences
   - ClientSegment

3. [ ] Implementar métodos de negocio
   - `create()` - Factory method
   - `updatePreferences(prefs)` - Actualizar preferencias
   - `addLoyaltyPoints(points)` - Agregar puntos
   - `redeemLoyaltyPoints(points)` - Canjear puntos
   - `isVIP()` - Verificar status
   - `updateSegment()` - Recalcular segmento

4. [ ] Crear Domain Events
   - ClientRegisteredEvent
   - ClientPreferencesUpdatedEvent
   - ClientSegmentChangedEvent
   - LoyaltyPointsAddedEvent
   - LoyaltyPointsRedeemedEvent

5. [ ] Tests exhaustivos
   - 30+ casos de prueba
   - Lógica de loyalty points
   - Cambio de segmentos
   - Validaciones

**Criterios de aceptación**:
- [x] Entidad implementada con todos los métodos
- [x] Lógica de loyalty funcionando
- [x] Segmentación automática
- [x] Tests unitarios >95% coverage
- [x] Documentación completa

**Archivos a crear**:
```
packages/domain/src/entities/client/
├── client.entity.ts
├── client.entity.spec.ts
├── client-segment.enum.ts
├── client-preferences.vo.ts
└── events/
    ├── client-registered.event.ts
    ├── client-preferences-updated.event.ts
    ├── client-segment-changed.event.ts
    ├── loyalty-points-added.event.ts
    └── loyalty-points-redeemed.event.ts
```

---

### TASK-014: Crear Entidad Service
**Complejidad**: 🟡 5
**Estimación**: 10 horas
**Skill**: domain-architect
**Dependencias**: TASK-010

**Subtareas**:
1. [ ] Definir Service Entity
   - Propiedades: id, name, description, duration, price, category, requiredSkills, active
   - Categorías: HAIRCUT, BEARD, STYLING, COLORING, TREATMENT
   - Aggregate Root

2. [ ] Crear Value Objects específicos
   - Duration
   - ServiceCategory

3. [ ] Implementar métodos de negocio
   - `create()` - Factory method
   - `updatePrice(price)` - Actualizar precio
   - `updateDuration(duration)` - Actualizar duración
   - `activate()` / `deactivate()` - Cambiar estado
   - `requiresSkill(skill)` - Verificar skill

4. [ ] Crear Domain Events
   - ServiceCreatedEvent
   - ServicePriceUpdatedEvent
   - ServiceDurationUpdatedEvent
   - ServiceActivatedEvent
   - ServiceDeactivatedEvent

5. [ ] Tests exhaustivos
   - 25+ casos de prueba
   - Validaciones de precio y duración
   - Estado activo/inactivo

**Criterios de aceptación**:
- [x] Entidad implementada con todos los métodos
- [x] Validaciones de negocio completas
- [x] Tests unitarios >95% coverage
- [x] Documentación completa

**Archivos a crear**:
```
packages/domain/src/entities/service/
├── service.entity.ts
├── service.entity.spec.ts
├── service-category.enum.ts
├── duration.vo.ts
└── events/
    ├── service-created.event.ts
    ├── service-price-updated.event.ts
    ├── service-duration-updated.event.ts
    ├── service-activated.event.ts
    └── service-deactivated.event.ts
```

---

### TASK-015: Crear Interfaces de Repositorios
**Complejidad**: 🟡 4
**Estimación**: 6 horas
**Skill**: domain-architect
**Dependencias**: TASK-011, TASK-012, TASK-013, TASK-014

**Subtareas**:
1. [ ] IAppointmentRepository
   - save(), findById(), findByBarberAndDate()
   - findConflicting(), delete()

2. [ ] IBarberRepository
   - save(), findById(), findAvailable()
   - findAll(), findBySkill()

3. [ ] IClientRepository
   - save(), findById(), findByEmail()
   - findAll(), search()

4. [ ] IServiceRepository
   - save(), findById(), findActive()
   - findByCategory(), search()

**Criterios de aceptación**:
- [x] Interfaces TypeScript bien definidas
- [x] Métodos documentados
- [x] Tipos de retorno claros

**Archivos a crear**:
```
packages/domain/src/repositories/
├── appointment.repository.interface.ts
├── barber.repository.interface.ts
├── client.repository.interface.ts
└── service.repository.interface.ts
```

---

## 🔧 FASE 3: APPLICATION LAYER - USE CASES CRÍTICOS (Semanas 5-7)

### TASK-020: Implementar CreateAppointmentUseCase
**Complejidad**: 🔴 9
**Estimación**: 20 horas
**Skill**: usecase-builder
**Dependencias**: TASK-011, TASK-012, TASK-013, TASK-014, TASK-015

**Subtareas**:
1. [ ] Implementar lógica del use case
   - Cargar entidades (barber, client, service)
   - Validar que barber puede realizar service
   - Crear TimeSlot basado en duración
   - Verificar disponibilidad del barber
   - Detectar conflictos con ConflictResolver
   - Reservar slot con lock optimista
   - Crear entidad Appointment
   - Persistir en transacción
   - Publicar domain events

2. [ ] Crear DTOs
   - CreateAppointmentRequest
   - CreateAppointmentResponse
   - Validators con class-validator

3. [ ] Implementar ConflictResolver service
   - detectConflicts()
   - suggestAlternatives()
   - Algoritmo de detección de solapamiento

4. [ ] Implementar SlotManager service
   - reserveSlot() con lock optimista
   - releaseSlot()
   - Gestión de reservas temporales

5. [ ] Tests exhaustivos
   - Unit tests del use case (mocks)
   - Integration tests con DB test
   - 50+ casos de prueba
   - Casos de conflicto
   - Casos de rollback
   - Casos de race conditions

**Criterios de aceptación**:
- [x] Use case implementado y probado
- [x] Prevención de double-booking funcionando
- [x] Lock optimista implementado
- [x] Tests >90% coverage
- [x] Documentación completa

**Archivos a crear**:
```
packages/application/src/use-cases/appointment/
├── create-appointment/
│   ├── create-appointment.use-case.ts
│   ├── create-appointment.use-case.spec.ts
│   ├── create-appointment.dto.ts
│   └── create-appointment.validator.ts
├── services/
│   ├── conflict-resolver.service.ts
│   ├── conflict-resolver.service.spec.ts
│   ├── slot-manager.service.ts
│   └── slot-manager.service.spec.ts
└── interfaces/
    ├── conflict-resolver.interface.ts
    └── slot-manager.interface.ts
```

---

### TASK-021: Implementar CancelAppointmentUseCase
**Complejidad**: 🟡 6
**Estimación**: 10 horas
**Skill**: usecase-builder
**Dependencias**: TASK-020

**Subtareas**:
1. [ ] Implementar lógica del use case
   - Cargar appointment por ID
   - Validar reglas de cancelación
   - Cancelar entidad
   - Liberar slot
   - Publicar domain events
   - Intentar asignar desde waitlist

2. [ ] Crear DTOs
   - CancelAppointmentRequest
   - CancelAppointmentResponse

3. [ ] Tests exhaustivos
   - 30+ casos de prueba
   - Validaciones de estado
   - Liberación de slot
   - Notificaciones

**Criterios de aceptación**:
- [x] Use case implementado y probado
- [x] Validaciones de negocio correctas
- [x] Tests >85% coverage

**Archivos a crear**:
```
packages/application/src/use-cases/appointment/
└── cancel-appointment/
    ├── cancel-appointment.use-case.ts
    ├── cancel-appointment.use-case.spec.ts
    └── cancel-appointment.dto.ts
```

---

### TASK-022: Implementar RescheduleAppointmentUseCase
**Complejidad**: 🟠 7
**Estimación**: 12 horas
**Skill**: usecase-builder
**Dependencias**: TASK-020

**Subtareas**:
1. [ ] Implementar lógica del use case
   - Cargar appointment
   - Validar que puede reprogramarse
   - Crear nuevo TimeSlot
   - Verificar disponibilidad nueva
   - Detectar conflictos
   - Liberar slot antiguo
   - Reservar slot nuevo
   - Actualizar entidad
   - Publicar domain events

2. [ ] Crear DTOs
   - RescheduleAppointmentRequest
   - RescheduleAppointmentResponse

3. [ ] Tests exhaustivos
   - 35+ casos de prueba
   - Casos de conflicto
   - Rollback en caso de error

**Criterios de aceptación**:
- [x] Use case implementado y probado
- [x] Transacción correcta (liberar + reservar)
- [x] Tests >85% coverage

**Archivos a crear**:
```
packages/application/src/use-cases/appointment/
└── reschedule-appointment/
    ├── reschedule-appointment.use-case.ts
    ├── reschedule-appointment.use-case.spec.ts
    └── reschedule-appointment.dto.ts
```

---

### TASK-023: Implementar GetAvailableSlotsUseCase
**Complejidad**: 🟠 7
**Estimación**: 14 horas
**Skill**: usecase-builder
**Dependencias**: TASK-012, TASK-014

**Subtareas**:
1. [ ] Implementar AvailabilityCalculator service
   - calculateAvailability()
   - Algoritmo de generación de slots
   - Considerar: horario laboral, breaks, turnos existentes, buffer time

2. [ ] Implementar lógica del use case
   - Cargar barber y service
   - Obtener horario del barber
   - Obtener turnos existentes
   - Calcular slots disponibles
   - Aplicar filtros (fecha, duración)
   - Cachear resultados en Redis

3. [ ] Crear DTOs
   - GetAvailableSlotsRequest
   - AvailableSlotResponse
   - AvailabilityFilters

4. [ ] Tests exhaustivos
   - 40+ casos de prueba
   - Casos con breaks
   - Casos con buffer time
   - Performance tests

**Criterios de aceptación**:
- [x] Algoritmo de disponibilidad correcto
- [x] Caché funcionando
- [x] Tests >85% coverage
- [x] Performance <200ms

**Archivos a crear**:
```
packages/application/src/use-cases/availability/
├── get-available-slots/
│   ├── get-available-slots.use-case.ts
│   ├── get-available-slots.use-case.spec.ts
│   └── get-available-slots.dto.ts
└── services/
    ├── availability-calculator.service.ts
    └── availability-calculator.service.spec.ts
```

---

### TASK-024: Implementar Use Cases de Barber
**Complejidad**: 🟡 6
**Estimación**: 12 horas
**Skill**: usecase-builder
**Dependencias**: TASK-012

**Subtareas**:
1. [ ] CreateBarberUseCase
2. [ ] UpdateBarberProfileUseCase
3. [ ] SetWorkingHoursUseCase
4. [ ] AddBarberSkillUseCase
5. [ ] ActivateBarberUseCase / DeactivateBarberUseCase
6. [ ] DTOs para cada use case
7. [ ] Tests para cada use case

**Criterios de aceptación**:
- [x] 5 use cases implementados
- [x] Tests >85% coverage para cada uno

---

### TASK-025: Implementar Use Cases de Client
**Complejidad**: 🟡 5
**Estimación**: 10 horas
**Skill**: usecase-builder
**Dependencias**: TASK-013

**Subtareas**:
1. [ ] RegisterClientUseCase
2. [ ] UpdateClientProfileUseCase
3. [ ] UpdateClientPreferencesUseCase
4. [ ] AddLoyaltyPointsUseCase
5. [ ] RedeemLoyaltyPointsUseCase
6. [ ] DTOs para cada use case
7. [ ] Tests para cada use case

**Criterios de aceptación**:
- [x] 5 use cases implementados
- [x] Tests >85% coverage para cada uno

---

### TASK-026: Implementar Use Cases de Service
**Complejidad**: 🟡 4
**Estimación**: 8 horas
**Skill**: usecase-builder
**Dependencias**: TASK-014

**Subtareas**:
1. [ ] CreateServiceUseCase
2. [ ] UpdateServiceUseCase
3. [ ] UpdateServicePricingUseCase
4. [ ] ActivateServiceUseCase / DeactivateServiceUseCase
5. [ ] DTOs para cada use case
6. [ ] Tests para cada use case

**Criterios de aceptación**:
- [x] 4 use cases implementados
- [x] Tests >85% coverage para cada uno

---

## 🗄️ FASE 4: INFRASTRUCTURE LAYER (Semanas 8-9)

### TASK-030: Implementar Prisma Schema
**Complejidad**: 🟠 7
**Estimación**: 12 horas
**Skill**: infrastructure-engineer
**Dependencias**: TASK-011, TASK-012, TASK-013, TASK-014

**Subtareas**:
1. [ ] Diseñar schema de base de datos
   - Tabla appointments
   - Tabla barbers
   - Tabla clients
   - Tabla services
   - Tabla schedules
   - Relaciones entre tablas

2. [ ] Implementar optimistic locking
   - Campo version en appointments
   - Índices para performance

3. [ ] Crear migrations
   - Initial migration
   - Seed data para desarrollo

4. [ ] Documentar schema
   - Diagrama ER
   - Descripción de tablas

**Criterios de aceptación**:
- [x] Schema.prisma completo
- [x] Migrations funcionando
- [x] Seed data cargado
- [x] Índices optimizados

**Archivos a crear**:
```
apps/api/prisma/
├── schema.prisma
├── migrations/
│   └── 20240115000000_initial/
│       └── migration.sql
├── seed.ts
└── README.md
```

---

### TASK-031: Implementar Repositories con Prisma
**Complejidad**: 🟠 8
**Estimación**: 20 horas
**Skill**: infrastructure-engineer
**Dependencias**: TASK-030

**Subtareas**:
1. [ ] PrismaAppointmentRepository
   - Implementar todos los métodos de interface
   - Mappers: Domain ↔ Persistence
   - Optimistic locking con version field
   - findConflicting() con queries complejas

2. [ ] PrismaBarberRepository
   - Implementar todos los métodos
   - Mappers
   - Query de disponibilidad

3. [ ] PrismaClientRepository
   - Implementar todos los métodos
   - Mappers
   - Search con full-text

4. [ ] PrismaServiceRepository
   - Implementar todos los métodos
   - Mappers
   - Filtros por categoría

5. [ ] Tests de integración
   - Tests con DB test
   - Tests de optimistic locking
   - Tests de conflictos
   - 100+ casos de prueba total

**Criterios de aceptación**:
- [x] 4 repositorios implementados
- [x] Mappers bidireccionales funcionando
- [x] Optimistic locking funcionando
- [x] Tests de integración >80% coverage
- [x] Performance optimizada

**Archivos a crear**:
```
packages/infrastructure/src/database/repositories/
├── prisma-appointment.repository.ts
├── prisma-appointment.repository.spec.ts
├── prisma-barber.repository.ts
├── prisma-barber.repository.spec.ts
├── prisma-client.repository.ts
├── prisma-client.repository.spec.ts
├── prisma-service.repository.ts
├── prisma-service.repository.spec.ts
└── mappers/
    ├── appointment.mapper.ts
    ├── barber.mapper.ts
    ├── client.mapper.ts
    └── service.mapper.ts
```

---

### TASK-032: Implementar Redis Cache Service
**Complejidad**: 🟡 5
**Estimación**: 8 horas
**Skill**: infrastructure-engineer
**Dependencias**: TASK-002

**Subtareas**:
1. [ ] RedisCacheService
   - get<T>(), set<T>(), delete(), clear()
   - TTL management
   - Serialization/Deserialization

2. [ ] Cache strategies
   - Availability cache
   - Session cache
   - Rate limiting

3. [ ] Tests
   - Unit tests
   - Integration tests con Redis test

**Criterios de aceptación**:
- [x] Service implementado
- [x] Strategies documentadas
- [x] Tests >80% coverage

**Archivos a crear**:
```
packages/infrastructure/src/cache/
├── redis-cache.service.ts
├── redis-cache.service.spec.ts
├── cache-keys.constants.ts
└── strategies/
    ├── availability-cache.strategy.ts
    └── session-cache.strategy.ts
```

---

### TASK-033: Implementar Integraciones Externas
**Complejidad**: 🟠 7
**Estimación**: 16 horas
**Skill**: infrastructure-engineer
**Dependencias**: TASK-000

**Subtareas**:
1. [ ] MercadoPagoAdapter (o Stripe)
   - processPayment()
   - processRefund()
   - handleWebhook()
   - Tests con mocks

2. [ ] SendGridAdapter (o Twilio SendGrid)
   - sendEmail()
   - Templates management
   - Tests con mocks

3. [ ] SMS Provider (Twilio)
   - sendSMS()
   - Templates
   - Tests con mocks

4. [ ] File Storage (S3 o Cloudinary)
   - uploadFile()
   - deleteFile()
   - getSignedUrl()
   - Tests con mocks

**Criterios de aceptación**:
- [x] 4 adapters implementados
- [x] Interfaces definidas en application
- [x] Tests con mocks >75% coverage
- [x] Documentación de configuración

**Archivos a crear**:
```
packages/infrastructure/src/external-services/
├── payment/
│   ├── mercadopago.adapter.ts
│   ├── mercadopago.adapter.spec.ts
│   └── payment.interface.ts (en application)
├── email/
│   ├── sendgrid.adapter.ts
│   ├── sendgrid.adapter.spec.ts
│   └── email.interface.ts (en application)
├── sms/
│   ├── twilio.adapter.ts
│   ├── twilio.adapter.spec.ts
│   └── sms.interface.ts (en application)
└── storage/
    ├── s3.adapter.ts
    ├── s3.adapter.spec.ts
    └── storage.interface.ts (en application)
```

---

### TASK-034: Implementar Event Bus
**Complejidad**: 🟡 6
**Estimación**: 10 horas
**Skill**: infrastructure-engineer
**Dependencias**: TASK-011, TASK-012, TASK-013, TASK-014

**Subtareas**:
1. [ ] EventBus implementation
   - publish()
   - subscribe()
   - Event handlers registry

2. [ ] Event Handlers
   - SendAppointmentConfirmationHandler
   - SendCancellationNoticeHandler
   - NotifyBarberHandler
   - UpdateCacheHandler

3. [ ] Tests
   - Unit tests
   - Integration tests

**Criterios de aceptación**:
- [x] EventBus implementado
- [x] 4+ handlers implementados
- [x] Tests >80% coverage

**Archivos a crear**:
```
packages/infrastructure/src/events/
├── event-bus.service.ts
├── event-bus.service.spec.ts
└── handlers/
    ├── send-appointment-confirmation.handler.ts
    ├── send-cancellation-notice.handler.ts
    ├── notify-barber.handler.ts
    └── update-cache.handler.ts
```

---

## 🌐 FASE 5: API LAYER (Semanas 10-11)

### TASK-040: Implementar Authentication & Authorization
**Complejidad**: 🟠 8
**Estimación**: 16 horas
**Skill**: api-designer
**Dependencias**: TASK-003

**Subtareas**:
1. [ ] JWT Strategy con Passport
   - JwtAuthGuard
   - JWT sign/verify
   - Refresh tokens

2. [ ] Roles & Permissions
   - RolesGuard
   - Roles decorator
   - RBAC implementation
   - Roles: ADMIN, MANAGER, BARBER, CLIENT

3. [ ] Auth endpoints
   - POST /auth/login
   - POST /auth/register
   - POST /auth/refresh
   - POST /auth/logout

4. [ ] Tests
   - Unit tests
   - E2E tests

**Criterios de aceptación**:
- [x] JWT funcionando
- [x] RBAC implementado
- [x] Endpoints de auth funcionando
- [x] Tests >80% coverage

**Archivos a crear**:
```
apps/api/src/modules/auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.controller.spec.ts
├── auth.service.ts
├── strategies/
│   └── jwt.strategy.ts
├── guards/
│   ├── jwt-auth.guard.ts
│   └── roles.guard.ts
├── decorators/
│   ├── roles.decorator.ts
│   └── current-user.decorator.ts
└── dto/
    ├── login.dto.ts
    ├── register.dto.ts
    └── auth-response.dto.ts
```

---

### TASK-041: Implementar Appointments Controller
**Complejidad**: 🟡 6
**Estimación**: 12 horas
**Skill**: api-designer
**Dependencias**: TASK-020, TASK-021, TASK-022, TASK-040

**Subtareas**:
1. [ ] Endpoints CRUD
   - POST /appointments (create)
   - GET /appointments/:id (get by id)
   - GET /appointments (list with filters)
   - PATCH /appointments/:id/cancel
   - PATCH /appointments/:id/reschedule
   - PATCH /appointments/:id/start
   - PATCH /appointments/:id/complete
   - PATCH /appointments/:id/no-show

2. [ ] DTOs y validation
   - Request DTOs con class-validator
   - Response DTOs
   - Query DTOs (filters, pagination)

3. [ ] Authorization
   - Solo CLIENT puede crear para sí mismo
   - ADMIN/MANAGER pueden crear para cualquiera
   - BARBER puede ver sus turnos

4. [ ] Tests E2E
   - 40+ casos de prueba
   - Auth tests
   - Validation tests
   - Business rules tests

**Criterios de aceptación**:
- [x] 8 endpoints implementados
- [x] Validación completa
- [x] Authorization correcta
- [x] Tests E2E >80% coverage
- [x] Swagger docs generados

**Archivos a crear**:
```
apps/api/src/modules/appointments/
├── appointments.module.ts
├── appointments.controller.ts
├── appointments.controller.spec.ts
├── appointments.e2e-spec.ts
└── dto/
    ├── create-appointment.dto.ts
    ├── cancel-appointment.dto.ts
    ├── reschedule-appointment.dto.ts
    ├── appointment-response.dto.ts
    └── appointments-query.dto.ts
```

---

### TASK-042: Implementar Barbers Controller
**Complejidad**: 🟡 5
**Estimación**: 10 horas
**Skill**: api-designer
**Dependencias**: TASK-024, TASK-040

**Subtareas**:
1. [ ] Endpoints CRUD
   - POST /barbers
   - GET /barbers/:id
   - GET /barbers
   - PATCH /barbers/:id
   - DELETE /barbers/:id (soft delete)
   - PATCH /barbers/:id/schedule
   - GET /barbers/available

2. [ ] DTOs y validation
3. [ ] Authorization (ADMIN, MANAGER)
4. [ ] Tests E2E

**Criterios de aceptación**:
- [x] 7 endpoints implementados
- [x] Tests E2E >80% coverage
- [x] Swagger docs generados

---

### TASK-043: Implementar Clients Controller
**Complejidad**: 🟡 5
**Estimación**: 10 horas
**Skill**: api-designer
**Dependencias**: TASK-025, TASK-040

**Subtareas**:
1. [ ] Endpoints CRUD
   - POST /clients
   - GET /clients/:id
   - GET /clients
   - PATCH /clients/:id
   - GET /clients/me (profile propio)
   - PATCH /clients/me/preferences

2. [ ] DTOs y validation
3. [ ] Authorization
4. [ ] Tests E2E

**Criterios de aceptación**:
- [x] 6 endpoints implementados
- [x] Tests E2E >80% coverage
- [x] Swagger docs generados

---

### TASK-044: Implementar Services Controller
**Complejidad**: 🟡 4
**Estimación**: 8 horas
**Skill**: api-designer
**Dependencias**: TASK-026, TASK-040

**Subtareas**:
1. [ ] Endpoints CRUD
   - POST /services
   - GET /services/:id
   - GET /services (público)
   - PATCH /services/:id
   - DELETE /services/:id (soft delete)

2. [ ] DTOs y validation
3. [ ] Authorization (ADMIN, MANAGER para write)
4. [ ] Tests E2E

**Criterios de aceptación**:
- [x] 5 endpoints implementados
- [x] Tests E2E >80% coverage
- [x] Swagger docs generados

---

### TASK-045: Implementar Availability Controller
**Complejidad**: 🟡 5
**Estimación**: 8 horas
**Skill**: api-designer
**Dependencias**: TASK-023, TASK-040

**Subtareas**:
1. [ ] Endpoints
   - GET /availability/barbers/:barberId/slots
   - GET /availability/services/:serviceId/slots
   - POST /availability/check (verificar slot específico)

2. [ ] DTOs y validation
3. [ ] Cache headers
4. [ ] Tests E2E

**Criterios de aceptación**:
- [x] 3 endpoints implementados
- [x] Cache funcionando
- [x] Tests E2E >80% coverage

---

### TASK-046: Configurar Swagger Documentation
**Complejidad**: 🟢 3
**Estimación**: 4 horas
**Skill**: api-designer
**Dependencias**: TASK-041, TASK-042, TASK-043, TASK-044, TASK-045

**Subtareas**:
1. [ ] Configurar Swagger module
2. [ ] Agregar decorators @ApiTags, @ApiOperation
3. [ ] Documentar responses
4. [ ] Documentar authentication
5. [ ] Agregar ejemplos

**Criterios de aceptación**:
- [x] Swagger UI funcionando en /api/docs
- [x] Todos los endpoints documentados
- [x] Ejemplos completos

---

## 🎨 FASE 6: FRONTEND WEB CLIENT (Semanas 12-14)

### TASK-050: Implementar Diseño Base y Layout
**Complejidad**: 🟡 5
**Estimación**: 10 horas
**Skill**: frontend-developer
**Dependencias**: TASK-004

**Subtareas**:
1. [ ] Layout principal
   - Header con navegación
   - Footer
   - Sidebar (si aplica)
   - Responsive design

2. [ ] Componentes base de shadcn/ui
   - Button, Input, Select
   - Card, Dialog, Sheet
   - Form components
   - Toast notifications

3. [ ] Theme configuration
   - Color palette
   - Typography
   - Dark mode support

4. [ ] Navigation
   - Next.js Link components
   - Active route highlighting

**Criterios de aceptación**:
- [x] Layout responsive funcionando
- [x] Componentes base instalados
- [x] Theme configurado
- [x] Navegación funcionando

---

### TASK-051: Implementar Authentication UI
**Complejidad**: 🟡 6
**Estimación**: 12 horas
**Skill**: frontend-developer
**Dependencias**: TASK-050, TASK-040

**Subtareas**:
1. [ ] Login page
   - Formulario con validación
   - Error handling
   - Redirect después de login

2. [ ] Register page
   - Formulario multi-step si aplica
   - Validación en tiempo real

3. [ ] Auth state management (Zustand)
   - useAuthStore
   - Persistencia de token
   - Auto-refresh de token

4. [ ] Protected routes
   - Middleware de autenticación
   - Redirect a login si no autenticado

**Criterios de aceptación**:
- [x] Login/Register funcionando
- [x] Token management correcto
- [x] Protected routes funcionando
- [x] UX fluida

---

### TASK-052: Implementar Service Catalog Page
**Complejidad**: 🟡 5
**Estimación**: 10 horas
**Skill**: frontend-developer
**Dependencias**: TASK-051, TASK-044

**Subtareas**:
1. [ ] Services list component
   - Grid/List view
   - Service card component
   - Filtros por categoría
   - Search

2. [ ] Service detail modal
   - Descripción completa
   - Precio y duración
   - Botón "Reservar"

3. [ ] API integration con TanStack Query
   - useServices hook
   - Cache strategy
   - Error handling

**Criterios de aceptación**:
- [x] Lista de servicios funcionando
- [x] Filtros y búsqueda funcionando
- [x] Modal de detalle funcionando
- [x] API integration correcta

---

### TASK-053: Implementar Barber Selection Page
**Complejidad**: 🟡 6
**Estimación**: 12 horas
**Skill**: frontend-developer
**Dependencias**: TASK-052, TASK-042

**Subtareas**:
1. [ ] Barbers list component
   - Grid de barberos
   - Barber card con foto, nombre, rating
   - Filtro por skills

2. [ ] Barber detail modal
   - Bio
   - Skills
   - Rating y reviews
   - Disponibilidad preview

3. [ ] API integration
   - useBarbers hook
   - useAvailableBarbers hook
   - Cache strategy

**Criterios de aceptación**:
- [x] Lista de barberos funcionando
- [x] Filtros funcionando
- [x] Modal de detalle funcionando
- [x] API integration correcta

---

### TASK-054: Implementar Booking Calendar Component
**Complejidad**: 🟠 8
**Estimación**: 20 horas
**Skill**: frontend-developer
**Dependencias**: TASK-053, TASK-045

**Subtareas**:
1. [ ] Calendar component
   - Date picker (shadcn/ui Calendar)
   - Vista mensual
   - Días disponibles/no disponibles

2. [ ] Time slots component
   - Grid de slots disponibles
   - Indicador de disponibilidad
   - Selección de slot
   - Refresh automático

3. [ ] Booking state management (Zustand)
   - useBookingStore
   - Persistencia en sessionStorage
   - Reset on complete

4. [ ] API integration
   - useAvailableSlots hook
   - Polling o real-time updates
   - Error handling

5. [ ] Performance optimization
   - Virtualización de slots si muchos
   - Debounce en búsqueda
   - Memoization

**Criterios de aceptación**:
- [x] Calendar funcionando
- [x] Slots disponibles correctos
- [x] Selección de slot funcionando
- [x] Performance optimizada
- [x] UX fluida

---

### TASK-055: Implementar Booking Confirmation Flow
**Complejidad**: 🟡 6
**Estimación**: 12 horas
**Skill**: frontend-developer
**Dependencias**: TASK-054, TASK-041

**Subtareas**:
1. [ ] Booking summary component
   - Servicio seleccionado
   - Barbero seleccionado
   - Fecha y hora
   - Precio
   - Botón confirmar

2. [ ] Confirmation modal
   - Detalles finales
   - Notas opcionales
   - Términos y condiciones

3. [ ] API integration
   - useCreateAppointment mutation
   - Error handling
   - Conflict handling (sugerir alternativas)
   - Success feedback

4. [ ] Success page
   - Confirmación visual
   - Detalles del turno
   - Opciones: agregar a calendario, compartir

**Criterios de aceptación**:
- [x] Summary funcionando
- [x] Confirmación exitosa
- [x] Manejo de errores y conflictos
- [x] Success page funcionando

---

### TASK-056: Implementar User Profile & Appointments History
**Complejidad**: 🟡 6
**Estimación**: 12 horas
**Skill**: frontend-developer
**Dependencias**: TASK-051, TASK-041, TASK-043

**Subtareas**:
1. [ ] Profile page
   - Ver datos personales
   - Editar perfil
   - Preferencias
   - Loyalty points

2. [ ] Appointments history
   - Lista de turnos (upcoming, past)
   - Filtros
   - Acciones: cancelar, reprogramar

3. [ ] API integration
   - useProfile hook
   - useUpdateProfile mutation
   - useAppointments hook
   - useCancelAppointment mutation

**Criterios de aceptación**:
- [x] Profile page funcionando
- [x] History page funcionando
- [x] Edición funcionando
- [x] Acciones funcionando

---

## 🎛️ FASE 7: FRONTEND ADMIN DASHBOARD (Semanas 15-16)

### TASK-060: Implementar Admin Dashboard Overview
**Complejidad**: 🟡 6
**Estimación**: 12 horas
**Skill**: frontend-developer
**Dependencias**: TASK-051

**Subtareas**:
1. [ ] Dashboard layout
   - Sidebar con navegación
   - Header con user menu
   - Main content area

2. [ ] KPI cards
   - Turnos hoy
   - Ingresos del día
   - Utilización
   - Clientes nuevos

3. [ ] Charts
   - Ingresos por día (line chart)
   - Turnos por barbero (bar chart)
   - Servicios más populares (pie chart)

4. [ ] API integration
   - useMetrics hook
   - Real-time updates si aplica

**Criterios de aceptación**:
- [x] Dashboard funcionando
- [x] KPIs actualizados
- [x] Charts renderizados
- [x] Responsive

---

### TASK-061: Implementar Admin Appointments Calendar
**Complejidad**: 🟠 8
**Estimación**: 16 horas
**Skill**: frontend-developer
**Dependencias**: TASK-060, TASK-041

**Subtareas**:
1. [ ] Full calendar component (React Big Calendar)
   - Vista día/semana/mes
   - Turnos renderizados
   - Color-coding por estado

2. [ ] Appointment actions
   - Crear turno (modal)
   - Ver detalle (modal)
   - Editar turno
   - Cancelar turno
   - Marcar como completado
   - Drag & drop para reprogramar

3. [ ] Filters
   - Por barbero
   - Por servicio
   - Por estado

4. [ ] API integration
   - useAppointments hook con filters
   - CRUD mutations
   - Optimistic updates

**Criterios de aceptación**:
- [x] Calendar funcionando
- [x] CRUD funcionando
- [x] Drag & drop funcionando
- [x] Filters funcionando
- [x] Performance optimizada

---

### TASK-062: Implementar Admin Barbers Management
**Complejidad**: 🟡 6
**Estimación**: 12 horas
**Skill**: frontend-developer
**Dependencias**: TASK-060, TASK-042

**Subtareas**:
1. [ ] Barbers list page
   - Table con datos
   - Actions: edit, delete, activate/deactivate
   - Search y filtros

2. [ ] Create/Edit barber modal
   - Formulario completo
   - Upload de foto
   - Skills management
   - Schedule configuration

3. [ ] API integration
   - useBarbers hook
   - CRUD mutations

**Criterios de aceptación**:
- [x] List page funcionando
- [x] CRUD funcionando
- [x] Schedule configuration funcionando

---

### TASK-063: Implementar Admin Clients Management
**Complejidad**: 🟡 5
**Estimación**: 10 horas
**Skill**: frontend-developer
**Dependencias**: TASK-060, TASK-043

**Subtareas**:
1. [ ] Clients list page
   - Table con datos
   - Search y filtros
   - Segmentación (VIP, etc)

2. [ ] Client detail modal
   - Datos personales
   - Historial de turnos
   - Loyalty points
   - Estadísticas

3. [ ] API integration

**Criterios de aceptación**:
- [x] List page funcionando
- [x] Detail modal funcionando
- [x] Filters funcionando

---

### TASK-064: Implementar Admin Services Management
**Complejidad**: 🟡 5
**Estimación**: 10 horas
**Skill**: frontend-developer
**Dependencias**: TASK-060, TASK-044

**Subtareas**:
1. [ ] Services list page
   - Table con datos
   - Actions: edit, delete, activate/deactivate

2. [ ] Create/Edit service modal
   - Formulario completo
   - Upload de imagen
   - Pricing
   - Duration
   - Required skills

3. [ ] API integration

**Criterios de aceptación**:
- [x] List page funcionando
- [x] CRUD funcionando
- [x] Pricing y duration funcionando

---

## ✅ FASE 8: TESTING & QA (Semanas 17-18)

### TASK-070: Testing Completo del Sistema
**Complejidad**: 🟠 8
**Estimación**: 40 horas
**Skill**: test-engineer
**Dependencias**: Todas las fases anteriores

**Subtareas**:
1. [ ] **Unit Tests Audit**
   - Verificar coverage >95% en domain
   - Verificar coverage >85% en application
   - Completar tests faltantes

2. [ ] **Integration Tests**
   - Tests de repositorios con DB test
   - Tests de use cases con mocks
   - Tests de event handlers

3. [ ] **E2E Tests con Playwright**
   - Flujo completo de reserva
   - Flujo de cancelación
   - Flujo de reprogramación
   - Flujo de registro/login
   - Admin: CRUD de barberos
   - Admin: CRUD de servicios
   - Admin: Gestión de turnos

4. [ ] **Load Testing con k6**
   - Test de carga en endpoints críticos
   - Test de concurrencia (double-booking)
   - Test de stress

5. [ ] **Security Testing**
   - Authentication tests
   - Authorization tests
   - SQL injection tests
   - XSS tests

6. [ ] **Accessibility Testing**
   - axe-core tests
   - Keyboard navigation
   - Screen reader compatibility

**Criterios de aceptación**:
- [x] Coverage global >80%
- [x] Todos los flujos E2E pasando
- [x] Performance tests pasando
- [x] Security tests pasando
- [x] Accessibility tests pasando

---

### TASK-071: Bug Fixing & Refactoring
**Complejidad**: 🟡 6
**Estimación**: 30 horas
**Skill**: Todos los skills
**Dependencias**: TASK-070

**Subtareas**:
1. [ ] Fix de bugs encontrados en testing
2. [ ] Refactoring de código duplicado
3. [ ] Optimizaciones de performance
4. [ ] Mejoras de UX basadas en testing
5. [ ] Actualización de documentación

**Criterios de aceptación**:
- [x] Todos los bugs críticos solucionados
- [x] Code quality mejorado
- [x] Performance optimizado

---

## 🚀 FASE 9: DEPLOYMENT & DEVOPS (Semanas 19-20)

### TASK-080: Setup CI/CD Pipeline
**Complejidad**: 🟡 6
**Estimación**: 12 horas
**Skill**: infrastructure-engineer
**Dependencias**: TASK-070

**Subtareas**:
1. [ ] GitHub Actions workflow
   - Build
   - Tests
   - Linting
   - Type checking

2. [ ] Deployment automation
   - Deploy backend to production
   - Deploy frontend to Vercel/Netlify
   - Database migrations

3. [ ] Environment management
   - Development
   - Staging
   - Production

**Criterios de aceptación**:
- [x] Pipeline funcionando
- [x] Deployment automático
- [x] Rollback capability

---

### TASK-081: Setup Monitoring & Logging
**Complejidad**: 🟡 5
**Estimación**: 10 horas
**Skill**: infrastructure-engineer
**Dependencias**: TASK-080

**Subtareas**:
1. [ ] Sentry para error tracking
2. [ ] DataDog o NewRelic para APM
3. [ ] CloudWatch o Grafana para métricas
4. [ ] Alerting configuration

**Criterios de aceptación**:
- [x] Error tracking funcionando
- [x] APM funcionando
- [x] Alertas configuradas

---

### TASK-082: Documentación Final
**Complejidad**: 🟢 3
**Estimación**: 8 horas
**Skill**: Todos
**Dependencias**: TASK-081

**Subtareas**:
1. [ ] README completo
2. [ ] Documentación de API actualizada
3. [ ] Guías de deployment
4. [ ] Runbooks para operations
5. [ ] Changelog

**Criterios de aceptación**:
- [x] Documentación completa y actualizada
- [x] Guías probadas

---

## 📊 RESUMEN DE ESTIMACIONES

### Por Fase
- **Fase 0**: 2 horas
- **Fase 1**: 56 horas (7 días)
- **Fase 2**: 78 horas (10 días)
- **Fase 3**: 120 horas (15 días)
- **Fase 4**: 76 horas (9.5 días)
- **Fase 5**: 90 horas (11 días)
- **Fase 6**: 88 horas (11 días)
- **Fase 7**: 66 horas (8 días)
- **Fase 8**: 70 horas (9 días)
- **Fase 9**: 30 horas (4 días)

**Total: 676 horas ≈ 85 días laborales ≈ 17 semanas**

### Por Complejidad
- 🟢 Baja (1-3): ~40 horas
- 🟡 Media (4-6): ~320 horas
- 🟠 Alta (7-8): ~280 horas
- 🔴 Crítica (9-10): ~36 horas

---

## 📝 NOTAS IMPORTANTES

1. **Dependencias Críticas**: Las tareas marcadas como críticas (🔴) deben ser revisadas por arquitecto senior

2. **Testing Continuo**: No esperar a Fase 8 para tests. Cada tarea debe incluir sus propios tests

3. **Code Reviews**: Todas las tareas deben pasar por code review antes de merge

4. **Documentation**: Documentar mientras se desarrolla, no al final

5. **Performance**: Monitorear performance desde el inicio, no optimizar prematuramente pero sí medir

6. **Security**: Security by design, no como afterthought

---

## 🎯 PRÓXIMO PASO

**Comenzar con TASK-000**: Tomar decisiones estratégicas antes de iniciar desarrollo.

¿Listo para comenzar? 🚀
