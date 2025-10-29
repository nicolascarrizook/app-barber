import { DomainEvent } from '../common/domain-event'
import { UniqueEntityID } from '../common/unique-entity-id'
import { Service } from '../entities/service.entity'
import { Money } from '../value-objects/money.vo'
import { Duration } from '../value-objects/duration.vo'

/**
 * Event fired when a new service is created
 */
export class ServiceCreatedEvent extends DomainEvent {
  public readonly service: Service

  constructor(service: Service) {
    super(service.serviceId)
    this.service = service
  }

  getAggregateId(): UniqueEntityID {
    return this.service.serviceId
  }

  getEventData(): Record<string, any> {
    return {
      serviceId: this.service.serviceId.toString(),
      name: this.service.name,
      description: this.service.description,
      duration: this.service.duration.minutes,
      price: this.service.price.amount,
      currency: this.service.price.currency,
      category: this.service.category,
      requiredSkills: this.service.requiredSkills,
      isActive: this.service.isActive,
      createdAt: this.service.createdAt.toISOString()
    }
  }
}

/**
 * Event fired when a service's information is updated
 */
export class ServiceUpdatedEvent extends DomainEvent {
  public readonly service: Service
  public readonly updatedFields: string[]

  constructor(service: Service, updatedFields: string[]) {
    super(service.serviceId)
    this.service = service
    this.updatedFields = updatedFields
  }

  getAggregateId(): UniqueEntityID {
    return this.service.serviceId
  }

  getEventData(): Record<string, any> {
    return {
      serviceId: this.service.serviceId.toString(),
      name: this.service.name,
      description: this.service.description,
      category: this.service.category,
      updatedFields: this.updatedFields,
      updatedAt: this.service.updatedAt.toISOString()
    }
  }
}

/**
 * Event fired when a service's price is updated
 */
export class ServicePriceUpdatedEvent extends DomainEvent {
  public readonly service: Service
  public readonly oldPrice: Money
  public readonly newPrice: Money

  constructor(service: Service, oldPrice: Money, newPrice: Money) {
    super(service.serviceId)
    this.service = service
    this.oldPrice = oldPrice
    this.newPrice = newPrice
  }

  getAggregateId(): UniqueEntityID {
    return this.service.serviceId
  }

  getEventData(): Record<string, any> {
    return {
      serviceId: this.service.serviceId.toString(),
      name: this.service.name,
      oldPrice: this.oldPrice.amount,
      newPrice: this.newPrice.amount,
      currency: this.newPrice.currency,
      priceChange: this.newPrice.amount - this.oldPrice.amount,
      percentageChange: ((this.newPrice.amount - this.oldPrice.amount) / this.oldPrice.amount) * 100,
      updatedAt: this.occurredAt.toISOString()
    }
  }
}

/**
 * Event fired when a service's duration is updated
 */
export class ServiceDurationUpdatedEvent extends DomainEvent {
  public readonly service: Service
  public readonly oldDuration: Duration
  public readonly newDuration: Duration

  constructor(service: Service, oldDuration: Duration, newDuration: Duration) {
    super(service.serviceId)
    this.service = service
    this.oldDuration = oldDuration
    this.newDuration = newDuration
  }

  getAggregateId(): UniqueEntityID {
    return this.service.serviceId
  }

  getEventData(): Record<string, any> {
    return {
      serviceId: this.service.serviceId.toString(),
      name: this.service.name,
      oldDuration: this.oldDuration.minutes,
      newDuration: this.newDuration.minutes,
      durationChange: this.newDuration.minutes - this.oldDuration.minutes,
      updatedAt: this.occurredAt.toISOString()
    }
  }
}

/**
 * Event fired when a service is activated
 */
export class ServiceActivatedEvent extends DomainEvent {
  public readonly service: Service

  constructor(service: Service) {
    super(service.serviceId)
    this.service = service
  }

  getAggregateId(): UniqueEntityID {
    return this.service.serviceId
  }

  getEventData(): Record<string, any> {
    return {
      serviceId: this.service.serviceId.toString(),
      name: this.service.name,
      category: this.service.category,
      price: this.service.price.amount,
      currency: this.service.price.currency,
      duration: this.service.duration.minutes,
      activatedAt: this.occurredAt.toISOString()
    }
  }
}

/**
 * Event fired when a service is deactivated
 */
export class ServiceDeactivatedEvent extends DomainEvent {
  public readonly service: Service

  constructor(service: Service) {
    super(service.serviceId)
    this.service = service
  }

  getAggregateId(): UniqueEntityID {
    return this.service.serviceId
  }

  getEventData(): Record<string, any> {
    return {
      serviceId: this.service.serviceId.toString(),
      name: this.service.name,
      category: this.service.category,
      deactivatedAt: this.occurredAt.toISOString()
    }
  }
}
