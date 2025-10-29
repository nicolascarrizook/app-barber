import { AggregateRoot } from '../common/aggregate-root'
import { UniqueEntityID } from '../common/unique-entity-id'
import { Result } from '../common/result'
import { BarberName } from '../value-objects/barber-name.vo'
import { BarberSpecialties, Specialty } from '../value-objects/barber-specialties.vo'
import { BarberSchedule } from '../value-objects/barber-schedule.vo'
import { BarberStatus, BarberStatusType } from '../value-objects/barber-status.vo'
import { Email } from '../value-objects/email.vo'
import { Phone } from '../value-objects/phone.vo'
import { Money } from '../value-objects/money.vo'
import {
  BarberCreatedEvent,
  BarberUpdatedEvent,
  BarberActivatedEvent,
  BarberDeactivatedEvent,
  BarberStatusChangedEvent
} from '../events/barber.events'

export interface BarberProps {
  name: BarberName
  email: Email
  phone: Phone
  specialties: BarberSpecialties
  schedule: BarberSchedule
  status: BarberStatus
  commissionRate: number // Percentage (0-100)
  rating: number // Average rating (0-5)
  totalAppointments: number
  profileImageUrl?: string
  bio?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateBarberProps {
  name: BarberName
  email: Email
  phone: Phone
  specialties: BarberSpecialties
  schedule?: BarberSchedule
  commissionRate?: number
  profileImageUrl?: string
  bio?: string
}

export class Barber extends AggregateRoot<BarberProps> {
  private constructor(props: BarberProps, id?: UniqueEntityID) {
    super(props, id)
  }

  public static create(props: CreateBarberProps, id?: UniqueEntityID): Result<Barber> {
    // Validate commission rate
    const commissionRate = props.commissionRate !== undefined ? props.commissionRate : 50
    if (commissionRate < 0 || commissionRate > 100) {
      return Result.fail<Barber>('Commission rate must be between 0 and 100')
    }

    // Validate bio length
    if (props.bio && props.bio.trim().length > 1000) {
      return Result.fail<Barber>('Bio must not exceed 1000 characters')
    }

    // Use default schedule if not provided
    let schedule = props.schedule
    if (!schedule) {
      const scheduleResult = BarberSchedule.createDefault()
      if (scheduleResult.isFailure) {
        return Result.fail<Barber>(scheduleResult.error!)
      }
      schedule = scheduleResult.value
    }

    const barber = new Barber(
      {
        name: props.name,
        email: props.email,
        phone: props.phone,
        specialties: props.specialties,
        schedule: schedule,
        status: BarberStatus.createActive(),
        commissionRate: commissionRate,
        rating: 0,
        totalAppointments: 0,
        profileImageUrl: props.profileImageUrl?.trim(),
        bio: props.bio?.trim(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      id
    )

    // Add domain event
    const isNewBarber = !id
    if (isNewBarber) {
      barber.addDomainEvent(new BarberCreatedEvent(barber))
    }

    return Result.ok<Barber>(barber)
  }

  // Getters
  get barberId(): UniqueEntityID {
    return this._id
  }

  get name(): BarberName {
    return this.props.name
  }

  get email(): Email {
    return this.props.email
  }

  get phone(): Phone {
    return this.props.phone
  }

  get specialties(): BarberSpecialties {
    return this.props.specialties
  }

  get schedule(): BarberSchedule {
    return this.props.schedule
  }

  get status(): BarberStatus {
    return this.props.status
  }

  get commissionRate(): number {
    return this.props.commissionRate
  }

  get rating(): number {
    return this.props.rating
  }

  get totalAppointments(): number {
    return this.props.totalAppointments
  }

  get profileImageUrl(): string | undefined {
    return this.props.profileImageUrl
  }

  get bio(): string | undefined {
    return this.props.bio
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  // Business logic

  /**
   * Updates barber basic information
   */
  updateInfo(props: {
    name?: BarberName
    phone?: Phone
    profileImageUrl?: string
    bio?: string
  }): Result<void> {
    if (props.bio && props.bio.trim().length > 1000) {
      return Result.fail<void>('Bio must not exceed 1000 characters')
    }

    if (props.name) {
      this.props.name = props.name
    }

    if (props.phone) {
      this.props.phone = props.phone
    }

    if (props.profileImageUrl !== undefined) {
      this.props.profileImageUrl = props.profileImageUrl.trim() || undefined
    }

    if (props.bio !== undefined) {
      this.props.bio = props.bio.trim() || undefined
    }

    this.props.updatedAt = new Date()
    this.addDomainEvent(new BarberUpdatedEvent(this))

    return Result.ok<void>()
  }

  /**
   * Updates barber specialties
   */
  updateSpecialties(specialties: BarberSpecialties): Result<void> {
    if (!this.status.isActive()) {
      return Result.fail<void>('Cannot update specialties of inactive barber')
    }

    this.props.specialties = specialties
    this.props.updatedAt = new Date()
    this.addDomainEvent(new BarberUpdatedEvent(this))

    return Result.ok<void>()
  }

  /**
   * Updates barber schedule
   */
  updateSchedule(schedule: BarberSchedule): Result<void> {
    this.props.schedule = schedule
    this.props.updatedAt = new Date()
    this.addDomainEvent(new BarberUpdatedEvent(this))

    return Result.ok<void>()
  }

  /**
   * Updates commission rate
   */
  updateCommissionRate(rate: number): Result<void> {
    if (rate < 0 || rate > 100) {
      return Result.fail<void>('Commission rate must be between 0 and 100')
    }

    this.props.commissionRate = rate
    this.props.updatedAt = new Date()
    this.addDomainEvent(new BarberUpdatedEvent(this))

    return Result.ok<void>()
  }

  /**
   * Activates the barber
   */
  activate(): Result<void> {
    if (this.status.isActive()) {
      return Result.ok<void>()
    }

    const statusResult = this.status.activate()
    if (statusResult.isFailure) {
      return Result.fail<void>(statusResult.error!)
    }

    this.props.status = statusResult.value
    this.props.updatedAt = new Date()
    this.addDomainEvent(new BarberActivatedEvent(this))

    return Result.ok<void>()
  }

  /**
   * Deactivates the barber
   */
  deactivate(reason: string): Result<void> {
    if (this.status.isInactive()) {
      return Result.ok<void>()
    }

    const statusResult = this.status.deactivate(reason)
    if (statusResult.isFailure) {
      return Result.fail<void>(statusResult.error!)
    }

    this.props.status = statusResult.value
    this.props.updatedAt = new Date()
    this.addDomainEvent(new BarberDeactivatedEvent(this, reason))

    return Result.ok<void>()
  }

  /**
   * Sets barber on leave
   */
  setOnLeave(reason: string): Result<void> {
    const statusResult = this.status.setOnLeave(reason)
    if (statusResult.isFailure) {
      return Result.fail<void>(statusResult.error!)
    }

    const previousStatus = this.props.status.status
    this.props.status = statusResult.value
    this.props.updatedAt = new Date()
    this.addDomainEvent(new BarberStatusChangedEvent(this, previousStatus, BarberStatusType.ON_LEAVE, reason))

    return Result.ok<void>()
  }

  /**
   * Suspends the barber
   */
  suspend(reason: string): Result<void> {
    const statusResult = this.status.suspend(reason)
    if (statusResult.isFailure) {
      return Result.fail<void>(statusResult.error!)
    }

    const previousStatus = this.props.status.status
    this.props.status = statusResult.value
    this.props.updatedAt = new Date()
    this.addDomainEvent(new BarberStatusChangedEvent(this, previousStatus, BarberStatusType.SUSPENDED, reason))

    return Result.ok<void>()
  }

  /**
   * Checks if barber can accept new appointments
   */
  canAcceptAppointments(): boolean {
    return this.status.canAcceptAppointments() && this.schedule.totalWorkingDays > 0
  }

  /**
   * Checks if barber has a specific specialty
   */
  hasSpecialty(specialty: Specialty): boolean {
    return this.props.specialties.hasSpecialty(specialty)
  }

  /**
   * Updates rating after new appointment review
   */
  updateRating(newRating: number): Result<void> {
    if (newRating < 0 || newRating > 5) {
      return Result.fail<void>('Rating must be between 0 and 5')
    }

    // Calculate new average rating
    const totalRating = this.props.rating * this.props.totalAppointments
    const newTotalAppointments = this.props.totalAppointments + 1
    const newAverageRating = (totalRating + newRating) / newTotalAppointments

    this.props.rating = Math.round(newAverageRating * 100) / 100 // Round to 2 decimals
    this.props.totalAppointments = newTotalAppointments
    this.props.updatedAt = new Date()

    return Result.ok<void>()
  }

  /**
   * Calculates commission for a given amount
   */
  calculateCommission(amount: Money): Result<Money> {
    return amount.percentage(this.props.commissionRate)
  }

  /**
   * Checks if barber is available (active and working)
   */
  isAvailable(): boolean {
    return this.canAcceptAppointments()
  }

  /**
   * Gets formatted name for display
   */
  getDisplayName(): string {
    return this.props.name.fullName
  }
}
