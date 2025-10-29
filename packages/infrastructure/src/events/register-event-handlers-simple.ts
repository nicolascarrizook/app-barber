import { IEventBus } from '@barbershop/domain/events'
import { ICacheService } from '@barbershop/domain/services'
import {
  createLoggingHandler,
  createBarberCacheInvalidationHandler,
  createClientCacheInvalidationHandler
} from './handlers/simple-event.handlers'

/**
 * Event Handler Registration Configuration
 */
export interface SimpleEventHandlerDependencies {
  eventBus: IEventBus
  cacheService: ICacheService
}

/**
 * Register simple domain event handlers
 *
 * This registers basic event handlers for logging and cache invalidation.
 * Should be called during application initialization.
 *
 * @param deps - Dependencies required by event handlers
 */
export function registerSimpleEventHandlers(deps: SimpleEventHandlerDependencies): void {
  const { eventBus, cacheService } = deps

  console.log('📢 Registering simple domain event handlers...')

  // Register logging handler for all events
  const loggingHandler = createLoggingHandler()

  // Barber Events - with cache invalidation
  const barberCacheHandler = createBarberCacheInvalidationHandler(cacheService)
  eventBus.subscribe('BarberCreatedEvent', loggingHandler)
  eventBus.subscribe('BarberActivatedEvent', barberCacheHandler)
  eventBus.subscribe('BarberDeactivatedEvent', barberCacheHandler)
  eventBus.subscribe('BarberScheduleUpdatedEvent', barberCacheHandler)
  eventBus.subscribe('BarberServicesUpdatedEvent', barberCacheHandler)

  // Client Events - with cache invalidation
  const clientCacheHandler = createClientCacheInvalidationHandler(cacheService)
  eventBus.subscribe('ClientCreatedEvent', loggingHandler)
  eventBus.subscribe('ClientUpdatedEvent', clientCacheHandler)
  eventBus.subscribe('ClientActivatedEvent', clientCacheHandler)
  eventBus.subscribe('ClientDeactivatedEvent', clientCacheHandler)
  eventBus.subscribe('ClientPreferencesUpdatedEvent', clientCacheHandler)
  eventBus.subscribe('ClientAppointmentCompletedEvent', clientCacheHandler)

  const registeredEvents = eventBus.getRegisteredEvents()
  console.log(`✅ Registered handlers for ${registeredEvents.length} events:`, registeredEvents)
}

/**
 * Unregister all event handlers
 * Useful for cleanup in tests or application shutdown
 */
export function unregisterAllEventHandlers(eventBus: IEventBus): void {
  console.log('🗑️ Unregistering all event handlers...')

  const events = eventBus.getRegisteredEvents()

  events.forEach((eventName) => {
    eventBus.unsubscribeAll(eventName)
  })

  console.log(`✅ Unregistered ${events.length} event handlers`)
}
