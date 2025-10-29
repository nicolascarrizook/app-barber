import { Client } from '../entities/client.entity'
import { ClientId } from '../entities/client-id.vo'
import { Email } from '../value-objects/email.vo'
import { Phone } from '../value-objects/phone.vo'
import { ClientStatusType } from '../value-objects/client-status.vo'

/**
 * Repository interface for Client aggregate
 *
 * Defines the contract for persisting and retrieving clients.
 * Implementation will be in the infrastructure layer using Prisma.
 */
export interface IClientRepository {
  /**
   * Saves a client (create or update)
   *
   * @param client - Client to save
   * @returns Saved client with updated version
   */
  save(client: Client): Promise<Client>

  /**
   * Finds a client by its ID
   *
   * @param id - Client identifier
   * @returns Client if found, null otherwise
   */
  findById(id: ClientId): Promise<Client | null>

  /**
   * Finds a client by email address
   * Useful for authentication and duplicate detection
   *
   * @param email - Email address
   * @returns Client if found, null otherwise
   */
  findByEmail(email: Email): Promise<Client | null>

  /**
   * Finds a client by phone number
   * Useful for lookup and duplicate detection
   *
   * @param phone - Phone number
   * @returns Client if found, null otherwise
   */
  findByPhone(phone: Phone): Promise<Client | null>

  /**
   * Finds all active clients
   * Excludes blocked and inactive clients
   *
   * @returns Array of active clients
   */
  findAll(): Promise<Client[]>

  /**
   * Finds clients by status
   *
   * @param status - Client status to filter by
   * @returns Array of clients with that status
   */
  findByStatus(status: ClientStatusType): Promise<Client[]>

  /**
   * Searches clients by name
   * Case-insensitive partial match on first name and last name
   *
   * @param searchTerm - Search term (minimum 2 characters)
   * @returns Array of matching clients
   */
  search(searchTerm: string): Promise<Client[]>

  /**
   * Finds top clients by lifetime value
   * Useful for VIP identification and marketing
   *
   * @param limit - Maximum number of clients to return
   * @returns Array of top clients ordered by lifetime value
   */
  findTopByLifetimeValue(limit: number): Promise<Client[]>

  /**
   * Finds clients eligible for loyalty rewards
   * Filters by minimum completed appointments and active status
   *
   * @param minCompletedAppointments - Minimum number of completed appointments
   * @returns Array of eligible clients
   */
  findEligibleForLoyalty(minCompletedAppointments: number): Promise<Client[]>

  /**
   * Finds clients who haven't visited recently
   * Useful for re-engagement campaigns
   *
   * @param daysSinceLastVisit - Number of days since last completed appointment
   * @returns Array of inactive clients
   */
  findInactiveClients(daysSinceLastVisit: number): Promise<Client[]>

  /**
   * Deletes a client
   * Should only be used in exceptional cases (GDPR, data cleanup)
   * Prefer blocking or deactivating clients
   *
   * @param id - Client identifier
   */
  delete(id: ClientId): Promise<void>

  /**
   * Checks if a client exists
   *
   * @param id - Client identifier
   * @returns True if exists, false otherwise
   */
  exists(id: ClientId): Promise<boolean>

  /**
   * Checks if an email is already registered
   *
   * @param email - Email address to check
   * @returns True if email exists, false otherwise
   */
  existsByEmail(email: Email): Promise<boolean>

  /**
   * Checks if a phone number is already registered
   *
   * @param phone - Phone number to check
   * @returns True if phone exists, false otherwise
   */
  existsByPhone(phone: Phone): Promise<boolean>
}
