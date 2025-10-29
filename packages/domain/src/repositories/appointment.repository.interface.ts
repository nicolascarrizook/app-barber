import { Appointment } from '../entities/appointment.entity'
import { AppointmentId } from '../entities/appointment-id.vo'
import { BarberId } from '../entities/barber-id.vo'
import { ClientId } from '../entities/client-id.vo'
import { TimeSlot } from '../value-objects/time-slot.vo'
import { DateTime } from 'luxon'

/**
 * Repository interface for Appointment aggregate
 *
 * Defines the contract for persisting and retrieving appointments.
 * Implementation will be in the infrastructure layer using Prisma.
 */
export interface IAppointmentRepository {
  /**
   * Saves an appointment (create or update)
   *
   * @param appointment - Appointment to save
   * @returns Saved appointment with updated version
   */
  save(appointment: Appointment): Promise<Appointment>

  /**
   * Finds an appointment by its ID
   *
   * @param id - Appointment identifier
   * @returns Appointment if found, null otherwise
   */
  findById(id: AppointmentId): Promise<Appointment | null>

  /**
   * Finds all appointments for a specific barber on a given date
   *
   * @param barberId - Barber identifier
   * @param date - Date to search (ignores time)
   * @returns Array of appointments
   */
  findByBarberAndDate(barberId: BarberId, date: DateTime): Promise<Appointment[]>

  /**
   * Finds all appointments for a specific client
   *
   * @param clientId - Client identifier
   * @returns Array of appointments
   */
  findByClient(clientId: ClientId): Promise<Appointment[]>

  /**
   * Finds appointments that conflict with a given time slot for a barber
   * Used for overlap detection before creating new appointments
   *
   * @param barberId - Barber identifier
   * @param slot - Time slot to check
   * @returns Array of conflicting appointments
   */
  findConflicting(barberId: BarberId, slot: TimeSlot): Promise<Appointment[]>

  /**
   * Finds appointments within a date range for a barber
   * Useful for availability calculation
   *
   * @param barberId - Barber identifier
   * @param startDate - Range start date
   * @param endDate - Range end date
   * @returns Array of appointments in range
   */
  findByBarberAndDateRange(
    barberId: BarberId,
    startDate: DateTime,
    endDate: DateTime
  ): Promise<Appointment[]>

  /**
   * Deletes an appointment
   * Should only be used in exceptional cases, prefer cancellation
   *
   * @param id - Appointment identifier
   */
  delete(id: AppointmentId): Promise<void>

  /**
   * Checks if an appointment exists
   *
   * @param id - Appointment identifier
   * @returns True if exists, false otherwise
   */
  exists(id: AppointmentId): Promise<boolean>
}
