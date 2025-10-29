/**
 * Domain Event Handlers
 *
 * Event handlers that respond to domain events and trigger side effects:
 * - Send emails (confirmations, notifications)
 * - Invalidate cache
 * - Update external systems
 * - Trigger workflows
 */

export * from './simple-event.handlers'
