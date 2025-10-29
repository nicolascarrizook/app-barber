import { DomainEvent } from '../common/domain-event'

/**
 * Event Handler Function
 * Function that handles a specific domain event
 */
export type EventHandler<T extends DomainEvent = DomainEvent> = (event: T) => Promise<void> | void

/**
 * Event Subscriber Interface
 *
 * Allows subscribing to domain events and handling them.
 * Follows the Observer pattern for loose coupling between components.
 */
export interface IEventSubscriber {
  /**
   * Subscribe to a specific event type
   *
   * @param eventName - Name of the event to subscribe to
   * @param handler - Function to handle the event
   * @returns Unsubscribe function
   */
  subscribe<T extends DomainEvent>(eventName: string, handler: EventHandler<T>): () => void

  /**
   * Subscribe to multiple event types with the same handler
   *
   * @param eventNames - Array of event names to subscribe to
   * @param handler - Function to handle all events
   * @returns Unsubscribe function
   */
  subscribeToMany(eventNames: string[], handler: EventHandler): () => void

  /**
   * Unsubscribe from a specific event type
   *
   * @param eventName - Name of the event to unsubscribe from
   * @param handler - Handler function to remove
   */
  unsubscribe(eventName: string, handler: EventHandler): void

  /**
   * Unsubscribe all handlers for a specific event
   *
   * @param eventName - Name of the event
   */
  unsubscribeAll(eventName: string): void
}

/**
 * Event Publisher Interface
 *
 * Publishes domain events to all registered subscribers.
 * Supports both synchronous and asynchronous event handling.
 */
export interface IEventPublisher {
  /**
   * Publish a single domain event
   *
   * @param event - Domain event to publish
   * @returns Promise that resolves when all handlers complete
   */
  publish(event: DomainEvent): Promise<void>

  /**
   * Publish multiple domain events
   *
   * @param events - Array of domain events to publish
   * @returns Promise that resolves when all handlers complete
   */
  publishMany(events: DomainEvent[]): Promise<void>

  /**
   * Get count of subscribers for a specific event
   *
   * @param eventName - Name of the event
   * @returns Number of subscribers
   */
  getSubscriberCount(eventName: string): number

  /**
   * Check if event has any subscribers
   *
   * @param eventName - Name of the event
   * @returns True if event has subscribers
   */
  hasSubscribers(eventName: string): boolean
}

/**
 * Event Bus Interface
 *
 * Combines publisher and subscriber interfaces.
 * Central hub for domain event communication.
 */
export interface IEventBus extends IEventPublisher, IEventSubscriber {
  /**
   * Clear all event subscriptions
   * Useful for testing and cleanup
   */
  clear(): void

  /**
   * Get all registered event names
   *
   * @returns Array of event names
   */
  getRegisteredEvents(): string[]
}

/**
 * Event Handler Metadata
 * Configuration for event handlers
 */
export interface EventHandlerMetadata {
  /** Event name to handle */
  eventName: string

  /** Handler function */
  handler: EventHandler

  /** Handler priority (higher = executed first) */
  priority?: number

  /** Whether handler should run asynchronously */
  async?: boolean

  /** Maximum retry attempts on failure */
  retries?: number

  /** Handler identifier for debugging */
  id?: string
}

/**
 * Event Bus Configuration
 */
export interface EventBusConfig {
  /** Enable detailed logging */
  enableLogging?: boolean

  /** Maximum number of retries for failed handlers */
  maxRetries?: number

  /** Timeout for async handlers (ms) */
  handlerTimeout?: number

  /** Whether to throw on handler errors */
  throwOnError?: boolean

  /** Enable event history tracking */
  enableHistory?: boolean

  /** Maximum history size */
  maxHistorySize?: number
}
