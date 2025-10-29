#!/usr/bin/env python3
"""
Barbershop Project Setup Script
Initializes the complete project structure following Clean Architecture
"""

import os
import sys
import subprocess
import json
from pathlib import Path
from typing import Dict, List

class BarbershopProjectSetup:
    def __init__(self, project_name: str, base_path: str = "."):
        self.project_name = project_name
        self.base_path = Path(base_path) / project_name
        self.config = {
            "payment": "mercadopago",
            "email": "sendgrid",
            "hosting": "digitalocean",
            "database": "postgresql",
            "cache": "redis",
            "language": "es"
        }
    
    def create_directory_structure(self):
        """Create the monorepo directory structure"""
        print("📁 Creating directory structure...")
        
        directories = [
            # Root level
            "apps",
            "packages",
            "infrastructure",
            "docs",
            
            # Backend app
            "apps/api/src/domain/entities",
            "apps/api/src/domain/value-objects",
            "apps/api/src/domain/repositories",
            "apps/api/src/domain/services",
            "apps/api/src/domain/events",
            "apps/api/src/application/use-cases/appointment",
            "apps/api/src/application/use-cases/barber",
            "apps/api/src/application/use-cases/client",
            "apps/api/src/application/use-cases/service",
            "apps/api/src/application/use-cases/payment",
            "apps/api/src/application/dtos",
            "apps/api/src/infrastructure/database/repositories",
            "apps/api/src/infrastructure/database/migrations",
            "apps/api/src/infrastructure/external/mercadopago",
            "apps/api/src/infrastructure/external/sendgrid",
            "apps/api/src/infrastructure/cache",
            "apps/api/src/presentation/controllers",
            "apps/api/src/presentation/middleware",
            "apps/api/test/domain",
            "apps/api/test/application",
            "apps/api/test/integration",
            "apps/api/test/e2e",
            
            # Admin dashboard
            "apps/admin/src/components",
            "apps/admin/src/app",
            "apps/admin/src/lib",
            "apps/admin/src/hooks",
            
            # Client web app
            "apps/web/src/components",
            "apps/web/src/app",
            "apps/web/src/lib",
            "apps/web/src/hooks",
            
            # Shared packages
            "packages/domain",
            "packages/shared/src/types",
            "packages/shared/src/utils",
            "packages/ui/src/components",
            
            # Infrastructure
            "infrastructure/docker",
            "infrastructure/database",
            "infrastructure/nginx",
            
            # Documentation
            "docs/architecture",
            "docs/api",
            "docs/guides",
        ]
        
        for directory in directories:
            (self.base_path / directory).mkdir(parents=True, exist_ok=True)
        
        print("✅ Directory structure created")
    
    def create_root_config_files(self):
        """Create root-level configuration files"""
        print("⚙️  Creating configuration files...")
        
        # package.json
        package_json = {
            "name": self.project_name,
            "version": "0.1.0",
            "private": True,
            "workspaces": ["apps/*", "packages/*"],
            "scripts": {
                "dev": "turbo run dev",
                "build": "turbo run build",
                "test": "turbo run test",
                "test:coverage": "turbo run test:coverage",
                "lint": "turbo run lint",
                "format": "prettier --write \"**/*.{ts,tsx,md}\""
            },
            "devDependencies": {
                "turbo": "^1.10.0",
                "prettier": "^3.0.0",
                "@types/node": "^20.0.0",
                "typescript": "^5.0.0"
            }
        }
        
        self._write_json(self.base_path / "package.json", package_json)
        
        # turbo.json
        turbo_json = {
            "$schema": "https://turbo.build/schema.json",
            "pipeline": {
                "build": {
                    "dependsOn": ["^build"],
                    "outputs": ["dist/**", ".next/**"]
                },
                "test": {
                    "dependsOn": ["build"],
                    "outputs": ["coverage/**"]
                },
                "lint": {},
                "dev": {
                    "cache": False
                }
            }
        }
        
        self._write_json(self.base_path / "turbo.json", turbo_json)
        
        # .gitignore
        gitignore_content = """
node_modules/
dist/
.next/
.turbo/
.env
.env.local
.env.production
coverage/
*.log
.DS_Store
"""
        self._write_file(self.base_path / ".gitignore", gitignore_content)
        
        # README.md
        readme_content = f"""# {self.project_name.title()}

Professional barbershop management system built with Clean Architecture.

## Project Structure

```
{self.project_name}/
├── apps/
│   ├── api/          # NestJS backend API
│   ├── admin/        # Admin dashboard (Next.js)
│   └── web/          # Client web app (Next.js)
├── packages/
│   ├── domain/       # Shared domain logic
│   ├── shared/       # Shared utilities
│   └── ui/           # Shared UI components
├── infrastructure/   # Docker, deployment configs
└── docs/             # Documentation
```

## Tech Stack

- **Backend**: NestJS + TypeScript
- **Frontend**: Next.js 14 + React 18
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Payments**: MercadoPago
- **Email**: SendGrid
- **Hosting**: DigitalOcean

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Setup environment variables:
   ```bash
   cp apps/api/.env.example apps/api/.env
   ```

3. Start development:
   ```bash
   npm run dev
   ```

4. Run tests:
   ```bash
   npm test
   ```

## Development Phases

- [x] Phase 1: Foundation Setup
- [ ] Phase 2: Booking Engine
- [ ] Phase 3: Availability Engine
- [ ] Phase 4: Complementary Engines
- [ ] Phase 5: API Layer
- [ ] Phase 6: Frontend
- [ ] Phase 7: Testing & QA
- [ ] Phase 8: Deployment

## Architecture

This project follows Clean Architecture principles:
- **Domain Layer**: Business entities and rules
- **Application Layer**: Use cases and business logic orchestration
- **Infrastructure Layer**: External integrations, database, cache
- **Presentation Layer**: API controllers, web apps

See `docs/architecture/` for detailed documentation.
"""
        self._write_file(self.base_path / "README.md", readme_content)
        
        print("✅ Configuration files created")
    
    def create_backend_app(self):
        """Create NestJS backend application"""
        print("🔧 Setting up NestJS backend...")
        
        api_path = self.base_path / "apps/api"
        
        # package.json for backend
        package_json = {
            "name": "@barbershop/api",
            "version": "0.1.0",
            "private": True,
            "scripts": {
                "dev": "nest start --watch",
                "build": "nest build",
                "start": "node dist/main",
                "test": "jest",
                "test:watch": "jest --watch",
                "test:coverage": "jest --coverage",
                "lint": "eslint \"{src,test}/**/*.ts\""
            },
            "dependencies": {
                "@nestjs/common": "^10.0.0",
                "@nestjs/core": "^10.0.0",
                "@nestjs/platform-express": "^10.0.0",
                "@nestjs/config": "^3.0.0",
                "@nestjs/jwt": "^10.0.0",
                "@nestjs/passport": "^10.0.0",
                "@prisma/client": "^5.0.0",
                "passport": "^0.6.0",
                "passport-jwt": "^4.0.0",
                "bcrypt": "^5.1.0",
                "class-validator": "^0.14.0",
                "class-transformer": "^0.5.0",
                "redis": "^4.6.0"
            },
            "devDependencies": {
                "@nestjs/cli": "^10.0.0",
                "@nestjs/testing": "^10.0.0",
                "@types/jest": "^29.0.0",
                "@types/node": "^20.0.0",
                "jest": "^29.0.0",
                "ts-jest": "^29.0.0",
                "prisma": "^5.0.0"
            }
        }
        
        self._write_json(api_path / "package.json", package_json)
        
        # nest-cli.json
        nest_cli = {
            "$schema": "https://json.schemastore.org/nest-cli",
            "collection": "@nestjs/schematics",
            "sourceRoot": "src"
        }
        
        self._write_json(api_path / "nest-cli.json", nest_cli)
        
        # tsconfig.json
        tsconfig = {
            "compilerOptions": {
                "module": "commonjs",
                "declaration": True,
                "removeComments": True,
                "emitDecoratorMetadata": True,
                "experimentalDecorators": True,
                "allowSyntheticDefaultImports": True,
                "target": "ES2021",
                "sourceMap": True,
                "outDir": "./dist",
                "baseUrl": "./",
                "incremental": True,
                "skipLibCheck": True,
                "strictNullChecks": True,
                "noImplicitAny": True,
                "strictBindCallApply": True,
                "forceConsistentCasingInFileNames": True,
                "noFallthroughCasesInSwitch": True,
                "paths": {
                    "@domain/*": ["src/domain/*"],
                    "@application/*": ["src/application/*"],
                    "@infrastructure/*": ["src/infrastructure/*"],
                    "@presentation/*": ["src/presentation/*"]
                }
            }
        }
        
        self._write_json(api_path / "tsconfig.json", tsconfig)
        
        # .env.example
        env_example = """# Application
NODE_ENV=development
PORT=3001
API_URL=http://localhost:3001

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/barbershop

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=your-mercadopago-token
MERCADOPAGO_PUBLIC_KEY=your-mercadopago-public-key

# SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=no-reply@barbershop.com

# Frontend URLs
WEB_APP_URL=http://localhost:3000
ADMIN_APP_URL=http://localhost:3002
"""
        
        self._write_file(api_path / ".env.example", env_example)
        
        # Prisma schema
        prisma_schema = """
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Appointment {
  id         String   @id @default(uuid())
  clientId   String
  barberId   String
  serviceId  String
  startTime  DateTime
  endTime    DateTime
  status     String   @default("PENDING")
  notes      String?
  version    Int      @default(0)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  client  Client  @relation(fields: [clientId], references: [id])
  barber  Barber  @relation(fields: [barberId], references: [id])
  service Service @relation(fields: [serviceId], references: [id])
  payment Payment?
  rating  Rating?

  @@index([barberId, startTime])
  @@index([clientId])
  @@map("appointments")
}

model Barber {
  id          String   @id @default(uuid())
  firstName   String
  lastName    String
  email       String   @unique
  phone       String
  status      String   @default("ACTIVE")
  schedule    Json
  commission  Float    @default(0.5)
  rating      Float    @default(5.0)
  createdAt   DateTime @default(now())

  appointments Appointment[]
  skills       BarberSkill[]

  @@map("barbers")
}

model Client {
  id            String   @id @default(uuid())
  firstName     String
  lastName      String
  email         String   @unique
  phone         String
  preferences   Json?
  segment       String   @default("NEW")
  loyaltyPoints Int      @default(0)
  totalVisits   Int      @default(0)
  totalSpent    Float    @default(0)
  createdAt     DateTime @default(now())

  appointments Appointment[]
  ratings      Rating[]

  @@map("clients")
}

model Service {
  id              String   @id @default(uuid())
  name            String   @unique
  description     String
  durationMinutes Int
  price           Float
  category        String
  active          Boolean  @default(true)
  createdAt       DateTime @default(now())

  appointments Appointment[]

  @@map("services")
}

model Payment {
  id            String    @id @default(uuid())
  appointmentId String    @unique
  amount        Float
  method        String
  status        String    @default("PENDING")
  transactionId String?
  paidAt        DateTime?
  createdAt     DateTime  @default(now())

  appointment Appointment @relation(fields: [appointmentId], references: [id])

  @@map("payments")
}

model Rating {
  id            String   @id @default(uuid())
  appointmentId String   @unique
  clientId      String
  barberId      String
  score         Int
  comment       String?
  createdAt     DateTime @default(now())

  appointment Appointment @relation(fields: [appointmentId], references: [id])
  client      Client      @relation(fields: [clientId], references: [id])

  @@map("ratings")
}

model BarberSkill {
  id       String @id @default(uuid())
  barberId String
  skill    String

  barber Barber @relation(fields: [barberId], references: [id])

  @@unique([barberId, skill])
  @@map("barber_skills")
}
"""
        
        (api_path / "prisma").mkdir(exist_ok=True)
        self._write_file(api_path / "prisma/schema.prisma", prisma_schema)
        
        print("✅ Backend app created")
    
    def create_docker_setup(self):
        """Create Docker configuration for local development"""
        print("🐳 Creating Docker setup...")
        
        docker_compose = """version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: barbershop-postgres
    environment:
      POSTGRES_USER: barbershop
      POSTGRES_PASSWORD: barbershop123
      POSTGRES_DB: barbershop
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: barbershop-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
"""
        
        infra_path = self.base_path / "infrastructure/docker"
        self._write_file(infra_path / "docker-compose.yml", docker_compose)
        
        print("✅ Docker setup created")
    
    def create_github_actions(self):
        """Create GitHub Actions CI/CD workflow"""
        print("🔄 Creating GitHub Actions workflow...")
        
        workflow = """name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: barbershop_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm run test:coverage
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/barbershop_test
          REDIS_URL: redis://localhost:6379
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
  
  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to DigitalOcean
        run: |
          echo "Deployment to DigitalOcean will be configured here"
          # Add DigitalOcean deployment steps
"""
        
        github_path = self.base_path / ".github/workflows"
        github_path.mkdir(parents=True, exist_ok=True)
        self._write_file(github_path / "ci-cd.yml", workflow)
        
        print("✅ GitHub Actions workflow created")
    
    def _write_file(self, path: Path, content: str):
        """Write content to file"""
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, 'w') as f:
            f.write(content.strip())
    
    def _write_json(self, path: Path, data: Dict):
        """Write JSON to file"""
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, 'w') as f:
            json.dump(data, f, indent=2)
    
    def run(self):
        """Execute the complete setup"""
        print(f"\n🚀 Setting up {self.project_name}...\n")
        
        try:
            self.create_directory_structure()
            self.create_root_config_files()
            self.create_backend_app()
            self.create_docker_setup()
            self.create_github_actions()
            
            print(f"\n✨ Project {self.project_name} created successfully!")
            print(f"\n📍 Location: {self.base_path.absolute()}")
            print("\n📋 Next steps:")
            print(f"   1. cd {self.project_name}")
            print("   2. npm install")
            print("   3. docker-compose -f infrastructure/docker/docker-compose.yml up -d")
            print("   4. cd apps/api && npx prisma migrate dev --name init")
            print("   5. npm run dev")
            print("\n🎯 Start with Phase 1: Creating domain entities")
            
        except Exception as e:
            print(f"\n❌ Error during setup: {e}")
            sys.exit(1)

def main():
    if len(sys.argv) < 2:
        print("Usage: python setup_project.py <project-name>")
        sys.exit(1)
    
    project_name = sys.argv[1]
    setup = BarbershopProjectSetup(project_name)
    setup.run()

if __name__ == "__main__":
    main()
