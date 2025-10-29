import { Service } from '../entities/service.entity'
import { ServiceId } from '../entities/service-id.vo'
import { ServiceCategory } from '../entities/service-category.enum'
import { Duration } from '../value-objects/duration.vo'
import { Money } from '../value-objects/money.vo'

/**
 * Repository interface for Service aggregate
 *
 * Defines the contract for persisting and retrieving services.
 * Implementation will be in the infrastructure layer using Prisma.
 */
export interface IServiceRepository {
  /**
   * Saves a service (create or update)
   *
   * @param service - Service to save
   * @returns Saved service with updated version
   */
  save(service: Service): Promise<Service>

  /**
   * Finds a service by its ID
   *
   * @param id - Service identifier
   * @returns Service if found, null otherwise
   */
  findById(id: ServiceId): Promise<Service | null>

  /**
   * Finds all active services
   * Excludes deactivated services
   *
   * @returns Array of active services
   */
  findActive(): Promise<Service[]>

  /**
   * Finds all services (active and inactive)
   *
   * @returns Array of all services
   */
  findAll(): Promise<Service[]>

  /**
   * Finds services by category
   *
   * @param category - Service category to filter by
   * @param activeOnly - Whether to include only active services (default: true)
   * @returns Array of services in that category
   */
  findByCategory(category: ServiceCategory, activeOnly?: boolean): Promise<Service[]>

  /**
   * Finds services that require a specific skill
   * Useful for barber-service matching
   *
   * @param skill - Skill/specialty name
   * @returns Array of services requiring that skill
   */
  findByRequiredSkill(skill: string): Promise<Service[]>

  /**
   * Finds services within a price range
   *
   * @param minPrice - Minimum price (inclusive)
   * @param maxPrice - Maximum price (inclusive)
   * @param activeOnly - Whether to include only active services (default: true)
   * @returns Array of services within price range
   */
  findByPriceRange(minPrice: Money, maxPrice: Money, activeOnly?: boolean): Promise<Service[]>

  /**
   * Finds services within a duration range
   * Useful for time-slot based booking
   *
   * @param minDuration - Minimum duration (inclusive)
   * @param maxDuration - Maximum duration (inclusive)
   * @param activeOnly - Whether to include only active services (default: true)
   * @returns Array of services within duration range
   */
  findByDurationRange(
    minDuration: Duration,
    maxDuration: Duration,
    activeOnly?: boolean
  ): Promise<Service[]>

  /**
   * Searches services by name and description
   * Case-insensitive partial match
   *
   * @param searchTerm - Search term (minimum 2 characters)
   * @param activeOnly - Whether to include only active services (default: true)
   * @returns Array of matching services
   */
  search(searchTerm: string, activeOnly?: boolean): Promise<Service[]>

  /**
   * Finds most popular services
   * Based on booking frequency
   *
   * @param limit - Maximum number of services to return
   * @returns Array of popular services ordered by booking count
   */
  findPopular(limit: number): Promise<Service[]>

  /**
   * Finds services that a specific barber can perform
   * Matches barber specialties with service required skills
   *
   * @param barberId - Barber identifier
   * @param activeOnly - Whether to include only active services (default: true)
   * @returns Array of services the barber can perform
   */
  findByBarberSkills(barberId: string, activeOnly?: boolean): Promise<Service[]>

  /**
   * Deletes a service
   * Should only be used in exceptional cases
   * Prefer deactivating services to maintain historical data
   *
   * @param id - Service identifier
   */
  delete(id: ServiceId): Promise<void>

  /**
   * Checks if a service exists
   *
   * @param id - Service identifier
   * @returns True if exists, false otherwise
   */
  exists(id: ServiceId): Promise<boolean>

  /**
   * Checks if a service name is already used
   * Useful for duplicate detection
   *
   * @param name - Service name to check
   * @returns True if name exists, false otherwise
   */
  existsByName(name: string): Promise<boolean>
}
