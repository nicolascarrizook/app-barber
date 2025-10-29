import { Barber } from '../entities/barber.entity'
import { BarberId } from '../entities/barber-id.vo'
import { Specialty } from '../value-objects/barber-specialties.vo'
import { Email } from '../value-objects/email.vo'
import { Phone } from '../value-objects/phone.vo'
import { DateTime } from 'luxon'

/**
 * Repository interface for Barber aggregate
 *
 * Defines the contract for persisting and retrieving barbers.
 * Implementation will be in the infrastructure layer using Prisma.
 */
export interface IBarberRepository {
  /**
   * Saves a barber (create or update)
   *
   * @param barber - Barber to save
   * @returns Saved barber with updated version
   */
  save(barber: Barber): Promise<Barber>

  /**
   * Finds a barber by its ID
   *
   * @param id - Barber identifier
   * @returns Barber if found, null otherwise
   */
  findById(id: BarberId): Promise<Barber | null>

  /**
   * Finds a barber by email address
   * Useful for authentication and user lookup
   *
   * @param email - Email address
   * @returns Barber if found, null otherwise
   */
  findByEmail(email: Email): Promise<Barber | null>

  /**
   * Finds a barber by phone number
   * Useful for uniqueness validation
   *
   * @param phone - Phone number
   * @returns Barber if found, null otherwise
   */
  findByPhone(phone: Phone): Promise<Barber | null>

  /**
   * Finds all active barbers
   *
   * @returns Array of active barbers
   */
  findAll(): Promise<Barber[]>

  /**
   * Finds active barbers with a specific skill/specialty
   *
   * @param skill - Specialty to filter by
   * @returns Array of barbers with that specialty
   */
  findBySkill(skill: Specialty): Promise<Barber[]>

  /**
   * Finds barbers available on a specific date and time slot
   * Considers barber schedule and existing appointments
   *
   * @param date - Date and time to check
   * @param durationMinutes - Duration of service in minutes
   * @returns Array of available barbers
   */
  findAvailable(date: DateTime, durationMinutes: number): Promise<Barber[]>

  /**
   * Finds barbers available for a specific service
   * Filters by required skills and availability
   *
   * @param serviceId - Service identifier
   * @param date - Date and time to check
   * @returns Array of barbers who can perform the service
   */
  findAvailableForService(serviceId: string, date: DateTime): Promise<Barber[]>

  /**
   * Finds top rated barbers
   * Useful for recommendations
   *
   * @param limit - Maximum number of barbers to return
   * @returns Array of top rated barbers
   */
  findTopRated(limit: number): Promise<Barber[]>

  /**
   * Deletes a barber
   * Should only be used in exceptional cases, prefer deactivation
   *
   * @param id - Barber identifier
   */
  delete(id: BarberId): Promise<void>

  /**
   * Checks if a barber exists
   *
   * @param id - Barber identifier
   * @returns True if exists, false otherwise
   */
  exists(id: BarberId): Promise<boolean>

  /**
   * Checks if an email is already registered
   *
   * @param email - Email address to check
   * @returns True if email exists, false otherwise
   */
  existsByEmail(email: Email): Promise<boolean>
}
