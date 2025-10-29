import { EventHandler } from '@barbershop/domain/events'
import { DomainEvent } from '@barbershop/domain/common/domain-event'
import { ICacheService } from '@barbershop/domain/services'

/**
 * Simple Event Handlers
 *
 * Basic handlers that log events and perform cache invalidation.
 * More complex handlers (like email sending) should be added as the application grows.
 */

/**
 * Generic logging handler
 * Logs all domain events for debugging
 */
export function createLoggingHandler(): EventHandler {
  return async (event: DomainEvent) => {
    console.log(`📢 Domain Event: ${event.constructor.name}`, {
      aggregateId: event.getAggregateId().toString(),
      occurredAt: event.occurredAt.toISOString()
    })
  }
}

/**
 * Cache invalidation handler for barber events
 * Invalidates barber-related cache when barber data changes
 */
export function createBarberCacheInvalidationHandler(
  cacheService: ICacheService
): EventHandler {
  return async (event: DomainEvent) => {
    try {
      const eventName = event.constructor.name
      const aggregateId = event.getAggregateId().toString()

      console.log(`🔔 Cache invalidation for ${eventName}: ${aggregateId}`)

      // Invalidate barber detail cache
      await cacheService.delete(`barber:${aggregateId}`)

      // Invalidate barber availability cache
      await cacheService.deletePattern(`availability:barber:${aggregateId}:*`)

      // Invalidate barber schedule cache
      await cacheService.delete(`schedule:barber:${aggregateId}`)

      console.log(`✅ Cache invalidated for barber: ${aggregateId}`)
    } catch (error) {
      console.error(`❌ Error invalidating barber cache:`, error)
    }
  }
}

/**
 * Cache invalidation handler for client events
 * Invalidates client-related cache when client data changes
 */
export function createClientCacheInvalidationHandler(
  cacheService: ICacheService
): EventHandler {
  return async (event: DomainEvent) => {
    try {
      const eventName = event.constructor.name
      const aggregateId = event.getAggregateId().toString()

      console.log(`🔔 Cache invalidation for ${eventName}: ${aggregateId}`)

      // Invalidate client detail cache
      await cacheService.delete(`client:${aggregateId}`)

      console.log(`✅ Cache invalidated for client: ${aggregateId}`)
    } catch (error) {
      console.error(`❌ Error invalidating client cache:`, error)
    }
  }
}

/**
 * Generic cache invalidation handler
 * Can be used for any aggregate type
 */
export function createGenericCacheInvalidationHandler(
  cacheService: ICacheService,
  cacheKeyPrefix: string
): EventHandler {
  return async (event: DomainEvent) => {
    try {
      const eventName = event.constructor.name
      const aggregateId = event.getAggregateId().toString()

      console.log(`🔔 Generic cache invalidation for ${eventName}: ${aggregateId}`)

      // Invalidate all cache keys with the prefix
      await cacheService.deletePattern(`${cacheKeyPrefix}:${aggregateId}:*`)
      await cacheService.delete(`${cacheKeyPrefix}:${aggregateId}`)

      console.log(`✅ Cache invalidated with prefix ${cacheKeyPrefix}: ${aggregateId}`)
    } catch (error) {
      console.error(`❌ Error invalidating cache:`, error)
    }
  }
}
