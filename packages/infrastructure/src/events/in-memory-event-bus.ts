import {
  IEventBus,
  EventHandler,
  EventBusConfig
} from '@barbershop/domain/events'
import { DomainEvent } from '@barbershop/domain/common/domain-event'

/**
 * In-Memory Event Bus Implementation
 *
 * Responsibilities:
 * - Register and manage event subscribers
 * - Publish domain events to all subscribers
 * - Handle errors and retries
 * - Track event history for debugging
 * - Support both sync and async handlers
 *
 * Clean Architecture: Infrastructure layer implementing domain interface
 */
export class InMemoryEventBus implements IEventBus {
  private readonly subscribers: Map<string, Set<EventHandler>>
  private readonly config: Required<EventBusConfig>
  private readonly eventHistory: DomainEvent[]

  constructor(config: EventBusConfig = {}) {
    this.subscribers = new Map()
    this.eventHistory = []

    // Default configuration
    this.config = {
      enableLogging: config.enableLogging ?? false,
      maxRetries: config.maxRetries ?? 3,
      handlerTimeout: config.handlerTimeout ?? 5000,
      throwOnError: config.throwOnError ?? false,
      enableHistory: config.enableHistory ?? false,
      maxHistorySize: config.maxHistorySize ?? 100
    }
  }

  /**
   * Subscribe to a specific event type
   */
  subscribe<T extends DomainEvent>(eventName: string, handler: EventHandler<T>): () => void {
    if (!this.subscribers.has(eventName)) {
      this.subscribers.set(eventName, new Set())
    }

    const handlers = this.subscribers.get(eventName)!
    handlers.add(handler as EventHandler)

    if (this.config.enableLogging) {
      console.log(`📢 Subscribed to event: ${eventName} (total: ${handlers.size})`)
    }

    // Return unsubscribe function
    return () => this.unsubscribe(eventName, handler as EventHandler)
  }

  /**
   * Subscribe to multiple event types with the same handler
   */
  subscribeToMany(eventNames: string[], handler: EventHandler): () => void {
    const unsubscribers = eventNames.map((eventName) => this.subscribe(eventName, handler))

    // Return function that unsubscribes from all events
    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe())
    }
  }

  /**
   * Unsubscribe from a specific event type
   */
  unsubscribe(eventName: string, handler: EventHandler): void {
    const handlers = this.subscribers.get(eventName)

    if (handlers) {
      handlers.delete(handler)

      if (this.config.enableLogging) {
        console.log(`📢 Unsubscribed from event: ${eventName} (remaining: ${handlers.size})`)
      }

      // Clean up empty sets
      if (handlers.size === 0) {
        this.subscribers.delete(eventName)
      }
    }
  }

  /**
   * Unsubscribe all handlers for a specific event
   */
  unsubscribeAll(eventName: string): void {
    const handlers = this.subscribers.get(eventName)

    if (handlers) {
      const count = handlers.size
      this.subscribers.delete(eventName)

      if (this.config.enableLogging) {
        console.log(`📢 Unsubscribed all handlers from event: ${eventName} (${count} handlers)`)
      }
    }
  }

  /**
   * Publish a single domain event
   */
  async publish(event: DomainEvent): Promise<void> {
    const eventName = event.constructor.name

    if (this.config.enableLogging) {
      console.log(`📤 Publishing event: ${eventName}`, {
        aggregateId: event.getAggregateId().toString(),
        occurredAt: event.occurredAt.toISOString()
      })
    }

    // Add to history if enabled
    if (this.config.enableHistory) {
      this.addToHistory(event)
    }

    const handlers = this.subscribers.get(eventName)

    if (!handlers || handlers.size === 0) {
      if (this.config.enableLogging) {
        console.log(`📭 No subscribers for event: ${eventName}`)
      }
      return
    }

    // Execute all handlers
    const handlerPromises = Array.from(handlers).map((handler) =>
      this.executeHandler(handler, event)
    )

    try {
      await Promise.all(handlerPromises)

      if (this.config.enableLogging) {
        console.log(`✅ Event published successfully: ${eventName} (${handlers.size} handlers)`)
      }
    } catch (error) {
      console.error(`❌ Error publishing event: ${eventName}`, error)

      if (this.config.throwOnError) {
        throw error
      }
    }
  }

  /**
   * Publish multiple domain events
   */
  async publishMany(events: DomainEvent[]): Promise<void> {
    if (this.config.enableLogging) {
      console.log(`📤 Publishing ${events.length} events`)
    }

    // Publish events sequentially to maintain order
    for (const event of events) {
      await this.publish(event)
    }
  }

  /**
   * Execute a single handler with retry logic and timeout
   */
  private async executeHandler(handler: EventHandler, event: DomainEvent): Promise<void> {
    let attempt = 0
    let lastError: Error | undefined

    while (attempt <= this.config.maxRetries) {
      try {
        // Wrap handler execution with timeout
        const handlerPromise = Promise.resolve(handler(event))
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Handler timeout after ${this.config.handlerTimeout}ms`))
          }, this.config.handlerTimeout)
        })

        await Promise.race([handlerPromise, timeoutPromise])

        // Success - exit retry loop
        return
      } catch (error) {
        lastError = error as Error
        attempt++

        if (attempt <= this.config.maxRetries) {
          if (this.config.enableLogging) {
            console.warn(
              `⚠️ Handler failed (attempt ${attempt}/${this.config.maxRetries}):`,
              error
            )
          }

          // Exponential backoff
          await this.sleep(Math.pow(2, attempt) * 100)
        }
      }
    }

    // All retries exhausted
    console.error(
      `❌ Handler failed after ${this.config.maxRetries} retries for event: ${event.constructor.name}`,
      lastError
    )

    if (this.config.throwOnError) {
      throw lastError
    }
  }

  /**
   * Get count of subscribers for a specific event
   */
  getSubscriberCount(eventName: string): number {
    const handlers = this.subscribers.get(eventName)
    return handlers ? handlers.size : 0
  }

  /**
   * Check if event has any subscribers
   */
  hasSubscribers(eventName: string): boolean {
    return this.getSubscriberCount(eventName) > 0
  }

  /**
   * Clear all event subscriptions
   */
  clear(): void {
    this.subscribers.clear()
    this.eventHistory.length = 0

    if (this.config.enableLogging) {
      console.log('🗑️ Cleared all event subscriptions and history')
    }
  }

  /**
   * Get all registered event names
   */
  getRegisteredEvents(): string[] {
    return Array.from(this.subscribers.keys())
  }

  /**
   * Get event history
   */
  getHistory(): ReadonlyArray<DomainEvent> {
    return this.eventHistory
  }

  /**
   * Add event to history
   */
  private addToHistory(event: DomainEvent): void {
    this.eventHistory.push(event)

    // Limit history size
    if (this.eventHistory.length > this.config.maxHistorySize) {
      this.eventHistory.shift()
    }
  }

  /**
   * Sleep utility for retry backoff
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

/**
 * Create In-Memory Event Bus instance
 *
 * @param config - Event bus configuration
 * @returns InMemoryEventBus instance
 */
export function createInMemoryEventBus(config?: EventBusConfig): InMemoryEventBus {
  return new InMemoryEventBus(config)
}
