/**
 * Appointment lifecycle states
 *
 * State transitions:
 * PENDING → CONFIRMED → IN_PROGRESS → COMPLETED
 * PENDING → CONFIRMED → CANCELLED
 * PENDING → CONFIRMED → NO_SHOW
 */
export enum AppointmentStatus {
  /**
   * Initial state - appointment created but not confirmed
   */
  PENDING = 'PENDING',

  /**
   * Appointment confirmed by client or automatically
   */
  CONFIRMED = 'CONFIRMED',

  /**
   * Service has started
   */
  IN_PROGRESS = 'IN_PROGRESS',

  /**
   * Service completed successfully
   */
  COMPLETED = 'COMPLETED',

  /**
   * Appointment cancelled by client or barber
   */
  CANCELLED = 'CANCELLED',

  /**
   * Client didn't show up for appointment
   */
  NO_SHOW = 'NO_SHOW'
}
