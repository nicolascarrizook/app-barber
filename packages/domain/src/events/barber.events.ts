import { DomainEvent } from '../common/domain-event'
import { UniqueEntityID } from '../common/unique-entity-id'
import { Barber } from '../entities/barber.entity'
import { BarberStatusType } from '../value-objects/barber-status.vo'

/**
 * Event fired when a new barber is created
 */
export class BarberCreatedEvent extends DomainEvent {
  public readonly barber: Barber

  constructor(barber: Barber) {
    super(barber.barberId)
    this.barber = barber
  }

  getAggregateId(): UniqueEntityID {
    return this.barber.barberId
  }

  getEventData(): Record<string, any> {
    return {
      barberId: this.barber.barberId.toString(),
      name: this.barber.name.fullName,
      email: this.barber.email.value,
      phone: this.barber.phone.fullNumber,
      specialties: this.barber.specialties.toStringArray(),
      status: this.barber.status.status,
      commissionRate: this.barber.commissionRate,
      createdAt: this.barber.createdAt.toISOString()
    }
  }
}

/**
 * Event fired when a barber's information is updated
 */
export class BarberUpdatedEvent extends DomainEvent {
  public readonly barber: Barber

  constructor(barber: Barber) {
    super(barber.barberId)
    this.barber = barber
  }

  getAggregateId(): UniqueEntityID {
    return this.barber.barberId
  }

  getEventData(): Record<string, any> {
    return {
      barberId: this.barber.barberId.toString(),
      name: this.barber.name.fullName,
      email: this.barber.email.value,
      phone: this.barber.phone.fullNumber,
      specialties: this.barber.specialties.toStringArray(),
      commissionRate: this.barber.commissionRate,
      updatedAt: this.barber.updatedAt.toISOString()
    }
  }
}

/**
 * Event fired when a barber is activated
 */
export class BarberActivatedEvent extends DomainEvent {
  public readonly barber: Barber

  constructor(barber: Barber) {
    super(barber.barberId)
    this.barber = barber
  }

  getAggregateId(): UniqueEntityID {
    return this.barber.barberId
  }

  getEventData(): Record<string, any> {
    return {
      barberId: this.barber.barberId.toString(),
      name: this.barber.name.fullName,
      activatedAt: this.occurredAt.toISOString()
    }
  }
}

/**
 * Event fired when a barber is deactivated
 */
export class BarberDeactivatedEvent extends DomainEvent {
  public readonly barber: Barber
  public readonly reason: string

  constructor(barber: Barber, reason: string) {
    super(barber.barberId)
    this.barber = barber
    this.reason = reason
  }

  getAggregateId(): UniqueEntityID {
    return this.barber.barberId
  }

  getEventData(): Record<string, any> {
    return {
      barberId: this.barber.barberId.toString(),
      name: this.barber.name.fullName,
      reason: this.reason,
      deactivatedAt: this.occurredAt.toISOString()
    }
  }
}

/**
 * Event fired when a barber's status changes
 */
export class BarberStatusChangedEvent extends DomainEvent {
  public readonly barber: Barber
  public readonly previousStatus: BarberStatusType
  public readonly newStatus: BarberStatusType
  public readonly reason?: string

  constructor(
    barber: Barber,
    previousStatus: BarberStatusType,
    newStatus: BarberStatusType,
    reason?: string
  ) {
    super(barber.barberId)
    this.barber = barber
    this.previousStatus = previousStatus
    this.newStatus = newStatus
    this.reason = reason
  }

  getAggregateId(): UniqueEntityID {
    return this.barber.barberId
  }

  getEventData(): Record<string, any> {
    return {
      barberId: this.barber.barberId.toString(),
      name: this.barber.name.fullName,
      previousStatus: this.previousStatus,
      newStatus: this.newStatus,
      reason: this.reason,
      changedAt: this.occurredAt.toISOString()
    }
  }
}

/**
 * Event fired when a barber's schedule is updated
 */
export class BarberScheduleUpdatedEvent extends DomainEvent {
  public readonly barber: Barber

  constructor(barber: Barber) {
    super(barber.barberId)
    this.barber = barber
  }

  getAggregateId(): UniqueEntityID {
    return this.barber.barberId
  }

  getEventData(): Record<string, any> {
    return {
      barberId: this.barber.barberId.toString(),
      name: this.barber.name.fullName,
      workingDays: this.barber.schedule.workingDays,
      totalWeeklyHours: this.barber.schedule.getTotalWeeklyHours(),
      updatedAt: this.occurredAt.toISOString()
    }
  }
}

/**
 * Event fired when a barber's rating is updated
 */
export class BarberRatingUpdatedEvent extends DomainEvent {
  public readonly barber: Barber
  public readonly previousRating: number
  public readonly newRating: number

  constructor(barber: Barber, previousRating: number, newRating: number) {
    super(barber.barberId)
    this.barber = barber
    this.previousRating = previousRating
    this.newRating = newRating
  }

  getAggregateId(): UniqueEntityID {
    return this.barber.barberId
  }

  getEventData(): Record<string, any> {
    return {
      barberId: this.barber.barberId.toString(),
      name: this.barber.name.fullName,
      previousRating: this.previousRating,
      newRating: this.newRating,
      totalAppointments: this.barber.totalAppointments,
      updatedAt: this.occurredAt.toISOString()
    }
  }
}
