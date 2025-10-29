import { DateTime } from 'luxon'
import { AggregateRoot } from '../common/aggregate-root'
import { Result } from '../common/result'
import { AppointmentId } from './appointment-id.vo'
import { ClientId } from './client-id.vo'
import { BarberId } from './barber-id.vo'
import { ServiceId } from './service-id.vo'
import { AppointmentStatus } from './appointment-status.enum'
import { TimeSlot } from '../value-objects/time-slot.vo'
import { PaymentInfo } from '../value-objects/payment-info.vo'
import {
  AppointmentCreatedEvent,
  AppointmentConfirmedEvent,
  AppointmentStartedEvent,
  AppointmentCompletedEvent,
  AppointmentCancelledEvent,
  AppointmentRescheduledEvent,
  AppointmentNoShowEvent
} from './events/appointment.events'

/**
 * Properties for creating an Appointment
 */
export interface CreateAppointmentProps {
  client: ClientId
  barber: BarberId
  service: ServiceId
  slot: TimeSlot
  payment: PaymentInfo
  notes?: string
}

/**
 * Internal properties of Appointment aggregate
 */
interface AppointmentProps {
  client: ClientId
  barber: BarberId
  service: ServiceId
  slot: TimeSlot
  status: AppointmentStatus
  payment: PaymentInfo
  notes: string
  version: number
  createdAt: DateTime
  updatedAt: DateTime
}

/**
 * Appointment Aggregate Root
 *
 * Core entity representing a booking in the barbershop system.
 * Manages the complete lifecycle of an appointment from creation to completion.
 *
 * Business Rules:
 * - Cannot be created for past time slots
 * - Cannot be cancelled if already completed
 * - Cannot be cancelled if time slot is in the past
 * - Must be confirmed before starting
 * - Must be in progress to complete
 * - Can only be rescheduled if not completed or cancelled
 *
 * State Machine:
 * PENDING → CONFIRMED → IN_PROGRESS → COMPLETED
 * PENDING → CONFIRMED → CANCELLED
 * PENDING → CONFIRMED → NO_SHOW
 */
export class Appointment extends AggregateRoot<AppointmentProps> {
  private constructor(props: AppointmentProps, id: AppointmentId) {
    super(props, id.getId())
  }

  /**
   * Creates a new appointment
   *
   * @param props - Appointment creation properties
   * @returns Result with new Appointment or error
   */
  static create(props: CreateAppointmentProps): Result<Appointment> {
    // Validate time slot
    if (!props.slot.isValid()) {
      return Result.fail('Invalid time slot')
    }

    if (props.slot.isPast()) {
      return Result.fail('Cannot create appointment in the past')
    }

    // Validate notes length
    if (props.notes && props.notes.length > 500) {
      return Result.fail('Notes cannot exceed 500 characters')
    }

    const appointmentId = AppointmentId.create()
    const now = DateTime.now()

    const appointment = new Appointment(
      {
        client: props.client,
        barber: props.barber,
        service: props.service,
        slot: props.slot,
        status: AppointmentStatus.PENDING,
        payment: props.payment,
        notes: props.notes || '',
        version: 0,
        createdAt: now,
        updatedAt: now
      },
      appointmentId
    )

    // Emit domain event
    appointment.addDomainEvent(new AppointmentCreatedEvent(appointment))

    return Result.ok(appointment)
  }

  /**
   * Confirms the appointment
   *
   * @returns Result indicating success or failure
   */
  confirm(): Result<void> {
    if (this.props.status !== AppointmentStatus.PENDING) {
      return Result.fail(`Cannot confirm appointment with status ${this.props.status}`)
    }

    if (this.props.slot.isPast()) {
      return Result.fail('Cannot confirm past appointment')
    }

    this.props.status = AppointmentStatus.CONFIRMED
    this.props.updatedAt = DateTime.now()

    this.addDomainEvent(new AppointmentConfirmedEvent(this))

    return Result.ok()
  }

  /**
   * Starts the appointment service
   *
   * @returns Result indicating success or failure
   */
  start(): Result<void> {
    if (this.props.status !== AppointmentStatus.CONFIRMED) {
      return Result.fail('Appointment must be confirmed before starting')
    }

    this.props.status = AppointmentStatus.IN_PROGRESS
    this.props.updatedAt = DateTime.now()

    this.addDomainEvent(new AppointmentStartedEvent(this))

    return Result.ok()
  }

  /**
   * Completes the appointment
   *
   * @param completionNotes - Optional notes about service completion
   * @returns Result indicating success or failure
   */
  complete(completionNotes?: string): Result<void> {
    if (this.props.status !== AppointmentStatus.IN_PROGRESS) {
      return Result.fail('Appointment must be in progress to complete')
    }

    if (completionNotes) {
      this.props.notes = completionNotes
    }

    this.props.status = AppointmentStatus.COMPLETED
    this.props.updatedAt = DateTime.now()

    this.addDomainEvent(new AppointmentCompletedEvent(this))

    return Result.ok()
  }

  /**
   * Cancels the appointment
   *
   * @param reason - Reason for cancellation
   * @returns Result indicating success or failure
   */
  cancel(reason: string): Result<void> {
    if (!this.canBeCancelled()) {
      return Result.fail('Appointment cannot be cancelled')
    }

    if (!reason || reason.trim().length === 0) {
      return Result.fail('Cancellation reason is required')
    }

    this.props.status = AppointmentStatus.CANCELLED
    this.props.notes = `${this.props.notes}\nCancellation reason: ${reason}`
    this.props.updatedAt = DateTime.now()

    this.addDomainEvent(new AppointmentCancelledEvent(this, reason))

    return Result.ok()
  }

  /**
   * Reschedules the appointment to a new time slot
   *
   * @param newSlot - New time slot
   * @returns Result indicating success or failure
   */
  reschedule(newSlot: TimeSlot): Result<void> {
    if (!this.canBeRescheduled()) {
      return Result.fail('Appointment cannot be rescheduled')
    }

    if (!newSlot.isValid() || newSlot.isPast()) {
      return Result.fail('Invalid new time slot')
    }

    const oldSlot = this.props.slot
    this.props.slot = newSlot
    this.props.updatedAt = DateTime.now()

    this.addDomainEvent(new AppointmentRescheduledEvent(this, oldSlot, newSlot))

    return Result.ok()
  }

  /**
   * Marks client as no-show
   *
   * @returns Result indicating success or failure
   */
  markAsNoShow(): Result<void> {
    if (this.props.status !== AppointmentStatus.CONFIRMED) {
      return Result.fail('Can only mark confirmed appointments as no-show')
    }

    if (!this.props.slot.isPast()) {
      return Result.fail('Can only mark as no-show after appointment time has passed')
    }

    this.props.status = AppointmentStatus.NO_SHOW
    this.props.updatedAt = DateTime.now()

    this.addDomainEvent(new AppointmentNoShowEvent(this))

    return Result.ok()
  }

  /**
   * Checks if appointment can be cancelled
   */
  canBeCancelled(): boolean {
    const cancellableStatuses = [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]
    return cancellableStatuses.includes(this.props.status) && !this.props.slot.isPast()
  }

  /**
   * Checks if appointment can be rescheduled
   */
  canBeRescheduled(): boolean {
    return this.canBeCancelled()
  }

  /**
   * Checks if this appointment overlaps with another
   *
   * @param other - Another appointment
   * @returns True if appointments overlap
   */
  overlapsWith(other: Appointment): boolean {
    // Only check overlap if same barber
    if (!this.props.barber.equals(other.props.barber)) {
      return false
    }

    // Ignore cancelled or no-show appointments
    const ignoredStatuses = [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW]
    if (ignoredStatuses.includes(this.props.status) || ignoredStatuses.includes(other.props.status)) {
      return false
    }

    return this.props.slot.overlaps(other.props.slot)
  }

  /**
   * Increments version for optimistic locking
   */
  incrementVersion(): void {
    this.props.version++
  }

  // Getters
  get appointmentId(): AppointmentId {
    return AppointmentId.fromString(this._id.toString())
  }

  get client(): ClientId {
    return this.props.client
  }

  get barber(): BarberId {
    return this.props.barber
  }

  get service(): ServiceId {
    return this.props.service
  }

  get slot(): TimeSlot {
    return this.props.slot
  }

  get status(): AppointmentStatus {
    return this.props.status
  }

  get payment(): PaymentInfo {
    return this.props.payment
  }

  get notes(): string {
    return this.props.notes
  }

  get version(): number {
    return this.props.version
  }

  get createdAt(): DateTime {
    return this.props.createdAt
  }

  get updatedAt(): DateTime {
    return this.props.updatedAt
  }
}
