import { DomainEvent } from '../../common/domain-event'
import { TimeSlot } from '../../value-objects/time-slot.vo'
import type { Appointment } from '../appointment.entity'

/**
 * Event emitted when a new appointment is created
 */
export class AppointmentCreatedEvent extends DomainEvent {
  constructor(public readonly appointment: Appointment) {
    super(appointment.appointmentId.getId())
  }
}

/**
 * Event emitted when an appointment is confirmed
 */
export class AppointmentConfirmedEvent extends DomainEvent {
  constructor(public readonly appointment: Appointment) {
    super(appointment.appointmentId.getId())
  }
}

/**
 * Event emitted when an appointment service starts
 */
export class AppointmentStartedEvent extends DomainEvent {
  constructor(public readonly appointment: Appointment) {
    super(appointment.appointmentId.getId())
  }
}

/**
 * Event emitted when an appointment is completed
 */
export class AppointmentCompletedEvent extends DomainEvent {
  constructor(public readonly appointment: Appointment) {
    super(appointment.appointmentId.getId())
  }
}

/**
 * Event emitted when an appointment is cancelled
 */
export class AppointmentCancelledEvent extends DomainEvent {
  constructor(
    public readonly appointment: Appointment,
    public readonly reason: string
  ) {
    super(appointment.appointmentId.getId())
  }
}

/**
 * Event emitted when an appointment is rescheduled
 */
export class AppointmentRescheduledEvent extends DomainEvent {
  constructor(
    public readonly appointment: Appointment,
    public readonly oldSlot: TimeSlot,
    public readonly newSlot: TimeSlot
  ) {
    super(appointment.appointmentId.getId())
  }
}

/**
 * Event emitted when a client doesn't show up for appointment
 */
export class AppointmentNoShowEvent extends DomainEvent {
  constructor(public readonly appointment: Appointment) {
    super(appointment.appointmentId.getId())
  }
}
