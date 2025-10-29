# Barbershop Management System

Professional barbershop management platform built with Clean Architecture and Domain-Driven Design principles.

## 🎯 Overview

Complete solution for managing barbershop operations including:
- Appointment booking with anti-overlap conflict detection
- Barber and client management
- Service catalog with pricing
- Payment processing (MercadoPago)
- Email notifications (Resend)
- Analytics and reporting
- Admin dashboard and client-facing app

## 🏗️ Architecture

This project follows **Clean Architecture** with **Domain-Driven Design (DDD)** patterns:

```
┌──────────────────────────────────────────────────────┐
│                 PRESENTATION LAYER                    │
│   Controllers | GraphQL Resolvers | WebSocket        │
│   (NestJS Controllers, DTOs)                         │
└───────────────────────┬──────────────────────────────┘
                        ▼
┌──────────────────────────────────────────────────────┐
│                 APPLICATION LAYER                     │
│    Use Cases | Application Services | DTOs           │
│    (Business orchestration, transaction boundaries)  │
└───────────────────────┬──────────────────────────────┘
                        ▼
┌──────────────────────────────────────────────────────┐
│                   DOMAIN LAYER                        │
│  Entities | Value Objects | Domain Services          │
│  Business Rules | Repository Interfaces              │
└───────────────────────┬──────────────────────────────┘
                        ▼
┌──────────────────────────────────────────────────────┐
│               INFRASTRUCTURE LAYER                    │
│  DB Repositories | External APIs | Cache | Storage   │
│  (Prisma, MercadoPago, Resend, Redis)               │
└──────────────────────────────────────────────────────┘
```

## 📦 Project Structure

```
barbershop-system/
├── packages/
│   ├── domain/           # Pure business logic (>95% coverage)
│   ├── application/      # Use cases and orchestration (>85% coverage)
│   ├── infrastructure/   # External integrations (>75% coverage)
│   └── shared/           # Common utilities
├── apps/
│   ├── api/              # REST API with NestJS
│   └── web/              # Admin & Client app with Next.js
├── docs/                 # Documentation
│   └── guides/           # Development guides
└── .claude/              # AI-assisted development skills
    └── skills/           # Specialized development agents
```

## 🚀 Tech Stack

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: NestJS with TypeScript 5.x
- **Database**: PostgreSQL 15 + Prisma ORM
- **Cache**: Redis 7
- **Auth**: Passport.js + JWT
- **Testing**: Jest + Supertest + Playwright
- **Real-time**: Socket.io

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand
- **Forms**: React Hook Form + Zod
- **HTTP**: TanStack Query
- **Testing**: Vitest + Testing Library

### Integrations
- **Payments**: MercadoPago
- **Email**: Resend
- **Hosting**: DigitalOcean

## 🛠️ Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- npm 10+

### Installation

1. **Clone and install dependencies**:
```bash
git clone <repository-url>
cd barbershop-system
npm install
```

2. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Setup database**:
```bash
cd packages/infrastructure
npm run prisma:migrate
npm run prisma:generate
```

4. **Run development servers**:
```bash
# Run all services
npm run dev

# Or individually:
cd apps/api && npm run dev      # API on port 3000
cd apps/web && npm run dev      # Web on port 3001
```

## 📚 Development

### Available Commands

```bash
# Development
npm run dev          # Start all apps in development mode
npm run build        # Build all packages and apps
npm run test         # Run all tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Lint all code
npm run format       # Format code with Prettier
npm run typecheck    # TypeScript type checking

# Package-specific
cd packages/domain && npm test           # Domain tests (>95% coverage)
cd packages/application && npm test     # Application tests (>85% coverage)
cd apps/api && npm run test:e2e        # E2E API tests
```

### Quality Gates

Before committing:
- ✅ All tests passing
- ✅ Coverage > 80% (>95% domain, >85% application)
- ✅ No linting errors
- ✅ No TypeScript errors
- ✅ Code formatted

## 🧪 Testing Strategy

### Test Pyramid

```
        /\
       /E2E\      ← Playwright (>60% coverage)
      /------\
     /Integr.\   ← Jest + Supertest (>85% coverage)
    /----------\
   /   Unit     \ ← Jest (>95% domain coverage)
  /--------------\
```

### Coverage Targets

| Layer | Target | Tool |
|-------|--------|------|
| Domain | >95% | Jest |
| Application | >85% | Jest + Mocks |
| Infrastructure | >75% | Jest + Test Containers |
| Presentation | >60% | Playwright |
| **Overall** | **>80%** | All |

## 🎯 Key Features

### 1. Appointment Booking (Anti-Overlap)
- Optimistic locking for conflict prevention
- Real-time availability checking
- Automatic conflict detection
- Waitlist management

### 2. Barber Management
- Profile management
- Schedule configuration
- Performance tracking
- Commission calculation

### 3. Client Management
- Profile management
- Booking history
- Preferences and notes
- Communication history

### 4. Payment Processing
- MercadoPago integration
- Multiple payment methods
- Invoice generation
- Payment history

### 5. Notifications
- Email notifications (Resend)
- Appointment confirmations
- Reminders
- Status updates

## 📖 Documentation

- [Development Roadmap](./DEVELOPMENT-ROADMAP.md) - 82+ tasks, 17 weeks
- [Strategic Decisions](./STRATEGIC-DECISIONS.md) - Technical choices
- [Skills Test Report](./SKILLS-TEST-REPORT.md) - AI agents verification
- [System Analysis](./docs/guides/barbershop-system-analysis.md) - Complete system design

### Architecture References

Located in `.claude/skills/orchestrator/references/`:
- [Architecture Guidelines](./docs/architecture-guidelines.md) - Clean Architecture patterns
- [Coding Standards](./docs/coding-standards.md) - TypeScript/Node.js conventions
- [Testing Strategy](./docs/testing-strategy.md) - Testing patterns and tools
- [Entities Catalog](./docs/entities-catalog.md) - All system entities

## 🤖 AI-Assisted Development

This project uses specialized AI skills for development:

### Orchestrator
Master coordinator that manages all development phases and delegates to specialized skills.

### Specialized Skills
1. **domain-architect**: Entities, value objects, business rules
2. **usecase-builder**: Use cases and application orchestration
3. **infrastructure-engineer**: Repositories, integrations, caching
4. **api-designer**: REST endpoints, DTOs, auth
5. **frontend-developer**: Next.js, React, UI components
6. **test-engineer**: Comprehensive testing at all levels

Usage:
```bash
# Skills are invoked automatically by the orchestrator
# See .claude/skills/ for detailed documentation
```

## 🔒 Security

- JWT authentication
- Role-based access control (RBAC)
- Input validation
- SQL injection prevention (Prisma)
- XSS protection
- CORS configuration
- Rate limiting

## 📊 Performance

- API response time: <200ms (p95)
- Frontend load time: <3s (3G)
- Database queries: <50ms (p95)
- Cache hit ratio: >80%

## 🚢 Deployment

### DigitalOcean Setup

1. **API Deployment** (Droplets)
2. **Database** (Managed PostgreSQL)
3. **Cache** (Managed Redis)
4. **Frontend** (App Platform)
5. **CI/CD** (GitHub Actions)

See deployment guides in `docs/deployment/` for detailed instructions.

## 📝 License

Private project - All rights reserved

## 👥 Contributors

Development coordinated by AI Orchestrator with specialized skills.

## 📞 Support

For issues and questions, see project documentation or contact the development team.

---

**Status**: ✅ Monorepo initialized - Ready for development (TASK-001 completed)

**Next Step**: TASK-010 - Create core value objects (TimeSlot, Money, Email, Phone)
