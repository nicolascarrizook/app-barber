import { Entity } from './entity'
import { DomainEvent } from './domain-event'
import { UniqueEntityID } from './unique-entity-id'

/**
 * Base class for aggregate roots
 * An aggregate root is an entity that serves as the entry point to an aggregate
 * It ensures consistency of changes within the aggregate boundary
 */
export abstract class AggregateRoot<T> extends Entity<T> {
  private _domainEvents: DomainEvent[] = []

  get domainEvents(): DomainEvent[] {
    return this._domainEvents
  }

  /**
   * Adds a domain event to be dispatched
   */
  protected addDomainEvent(domainEvent: DomainEvent): void {
    this._domainEvents.push(domainEvent)
  }

  /**
   * Clears all domain events
   * Should be called after events are dispatched
   */
  public clearEvents(): void {
    this._domainEvents = []
  }

  /**
   * Marks aggregate for deletion by adding a deleted event
   */
  protected markAsDeleted(): void {
    // Subclasses should implement specific deletion events if needed
  }
}
