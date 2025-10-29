import { DomainEvent } from '../common/domain-event'
import { UniqueEntityID } from '../common/unique-entity-id'
import { Client } from '../entities/client.entity'
import { Money } from '../value-objects/money.vo'

/**
 * Event fired when a new client is created
 */
export class ClientCreatedEvent extends DomainEvent {
  public readonly client: Client

  constructor(client: Client) {
    super(client.clientId)
    this.client = client
  }

  getAggregateId(): UniqueEntityID {
    return this.client.clientId
  }

  getEventData(): Record<string, any> {
    return {
      clientId: this.client.clientId.toString(),
      name: this.client.fullName,
      email: this.client.email.value,
      phone: this.client.phone.fullNumber,
      status: this.client.status.status,
      createdAt: this.client.createdAt.toISOString()
    }
  }
}

/**
 * Event fired when a client's information is updated
 */
export class ClientUpdatedEvent extends DomainEvent {
  public readonly client: Client

  constructor(client: Client) {
    super(client.clientId)
    this.client = client
  }

  getAggregateId(): UniqueEntityID {
    return this.client.clientId
  }

  getEventData(): Record<string, any> {
    return {
      clientId: this.client.clientId.toString(),
      name: this.client.fullName,
      email: this.client.email.value,
      phone: this.client.phone.fullNumber,
      updatedAt: this.client.updatedAt.toISOString()
    }
  }
}

/**
 * Event fired when a client is activated
 */
export class ClientActivatedEvent extends DomainEvent {
  public readonly client: Client

  constructor(client: Client) {
    super(client.clientId)
    this.client = client
  }

  getAggregateId(): UniqueEntityID {
    return this.client.clientId
  }

  getEventData(): Record<string, any> {
    return {
      clientId: this.client.clientId.toString(),
      name: this.client.fullName,
      activatedAt: this.occurredAt.toISOString()
    }
  }
}

/**
 * Event fired when a client is deactivated
 */
export class ClientDeactivatedEvent extends DomainEvent {
  public readonly client: Client
  public readonly reason: string

  constructor(client: Client, reason: string) {
    super(client.clientId)
    this.client = client
    this.reason = reason
  }

  getAggregateId(): UniqueEntityID {
    return this.client.clientId
  }

  getEventData(): Record<string, any> {
    return {
      clientId: this.client.clientId.toString(),
      name: this.client.fullName,
      reason: this.reason,
      deactivatedAt: this.occurredAt.toISOString()
    }
  }
}

/**
 * Event fired when a client is suspended
 */
export class ClientSuspendedEvent extends DomainEvent {
  public readonly client: Client
  public readonly reason: string

  constructor(client: Client, reason: string) {
    super(client.clientId)
    this.client = client
    this.reason = reason
  }

  getAggregateId(): UniqueEntityID {
    return this.client.clientId
  }

  getEventData(): Record<string, any> {
    return {
      clientId: this.client.clientId.toString(),
      name: this.client.fullName,
      reason: this.reason,
      suspendedAt: this.occurredAt.toISOString()
    }
  }
}

/**
 * Event fired when a client is blocked
 */
export class ClientBlockedEvent extends DomainEvent {
  public readonly client: Client
  public readonly reason: string

  constructor(client: Client, reason: string) {
    super(client.clientId)
    this.client = client
    this.reason = reason
  }

  getAggregateId(): UniqueEntityID {
    return this.client.clientId
  }

  getEventData(): Record<string, any> {
    return {
      clientId: this.client.clientId.toString(),
      name: this.client.fullName,
      reason: this.reason,
      blockedAt: this.occurredAt.toISOString()
    }
  }
}

/**
 * Event fired when a client's preferences are updated
 */
export class ClientPreferencesUpdatedEvent extends DomainEvent {
  public readonly client: Client

  constructor(client: Client) {
    super(client.clientId)
    this.client = client
  }

  getAggregateId(): UniqueEntityID {
    return this.client.clientId
  }

  getEventData(): Record<string, any> {
    return {
      clientId: this.client.clientId.toString(),
      name: this.client.fullName,
      language: this.client.preferences.language,
      preferredBarbersCount: this.client.preferences.preferredBarbers.length,
      preferredServicesCount: this.client.preferences.preferredServices.length,
      updatedAt: this.occurredAt.toISOString()
    }
  }
}

/**
 * Event fired when a client completes an appointment
 */
export class ClientAppointmentCompletedEvent extends DomainEvent {
  public readonly client: Client
  public readonly amount: Money

  constructor(client: Client, amount: Money) {
    super(client.clientId)
    this.client = client
    this.amount = amount
  }

  getAggregateId(): UniqueEntityID {
    return this.client.clientId
  }

  getEventData(): Record<string, any> {
    return {
      clientId: this.client.clientId.toString(),
      name: this.client.fullName,
      amount: this.amount.amount,
      currency: this.amount.currency,
      totalAppointments: this.client.history.totalAppointments,
      completedAppointments: this.client.history.completedAppointments,
      loyaltyTier: this.client.loyaltyTier,
      lifetimeValue: this.client.history.lifetimeValue.amount,
      completedAt: this.occurredAt.toISOString()
    }
  }
}
