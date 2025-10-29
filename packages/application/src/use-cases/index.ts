/**
 * Application Layer - Use Cases
 *
 * This module exports all use cases for the barbershop system.
 * Use cases orchestrate business logic by coordinating between
 * domain entities and infrastructure repositories.
 *
 * Organized by aggregate root:
 * - Appointment: Booking and scheduling operations
 * - Availability: Barber schedule and time slot management
 * - Barber: Barber profile and management operations
 * - Client: Client profile and loyalty operations
 * - Service: Service catalog and pricing operations
 */

// Appointment use cases
export * from './appointment'

// Availability use cases
export * from './availability'

// Barber use cases
export * from './barber'

// Client use cases
export * from './client'

// Service use cases
export * from './service'
