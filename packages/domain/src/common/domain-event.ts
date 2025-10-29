import { UniqueEntityID } from './unique-entity-id'

/**
 * Base interface for all domain events
 * Domain events represent something that happened in the domain that domain experts care about
 */
export interface IDomainEvent {
  occurredAt: Date
  getAggregateId(): UniqueEntityID
}

/**
 * Abstract base class for domain events
 */
export abstract class DomainEvent implements IDomainEvent {
  public occurredAt: Date
  private aggregateId: UniqueEntityID

  constructor(aggregateId: UniqueEntityID) {
    this.aggregateId = aggregateId
    this.occurredAt = new Date()
  }

  public getAggregateId(): UniqueEntityID {
    return this.aggregateId
  }
}
