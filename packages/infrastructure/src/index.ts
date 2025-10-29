/**
 * Infrastructure Layer - Main Entry Point
 *
 * Exports:
 * - Repository implementations (Prisma)
 * - Mappers (Domain ↔ Persistence)
 * - External service adapters (MercadoPago, SendGrid)
 * - Caching services (Redis)
 * - Event infrastructure (Event Bus, Handlers)
 * - Configuration utilities
 *
 * Clean Architecture: This layer depends on Domain and Application layers
 */

// Repositories
export * from './repositories'

// Mappers
export * from './mappers'

// Caching
export * from './caching'

// External Services
export * from './external-services'

// Event Infrastructure
export * from './events'

// Database utilities (to be implemented)
// export * from './database'

// Configuration (to be implemented)
// export * from './config'
