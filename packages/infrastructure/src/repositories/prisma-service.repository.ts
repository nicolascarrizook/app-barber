import { IServiceRepository } from '@barbershop/domain/repositories/service.repository.interface'
import { Service } from '@barbershop/domain/entities/service.entity'
import { ServiceId } from '@barbershop/domain/entities/service-id.vo'
import { ServiceCategory } from '@barbershop/domain/entities/service-category.enum'
import { Duration } from '@barbershop/domain/value-objects/duration.vo'
import { Money } from '@barbershop/domain/value-objects/money.vo'
import { ServiceMapper } from '../mappers/service.mapper'

/**
 * Prisma Client type placeholder
 */
type PrismaClient = any

/**
 * Prisma implementation of IServiceRepository
 *
 * Responsibilities:
 * - Persist and retrieve Service aggregates
 * - Handle optimistic locking with version field
 * - Convert between domain entities and Prisma models using ServiceMapper
 * - Implement domain-specific queries (catalog, skills, pricing, etc.)
 * - Ensure transactional consistency
 *
 * Clean Architecture: Infrastructure layer depending on domain layer interfaces
 */
export class PrismaServiceRepository implements IServiceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Saves a service (create or update)
   * Uses optimistic locking to prevent concurrent modification issues
   *
   * @param service - Service aggregate to save
   * @returns Saved service with updated version
   * @throws Error if optimistic locking fails (version mismatch)
   */
  async save(service: Service): Promise<Service> {
    const data = ServiceMapper.toPersistence(service)
    const serviceId = service.serviceId.toString()

    // Check if service exists
    const exists = await this.prisma.service.findUnique({
      where: { id: serviceId }
    })

    if (exists) {
      // Update with optimistic locking
      const updated = await this.prisma.service.updateMany({
        where: {
          id: serviceId,
          version: 0 // version managed by repository // Optimistic lock check
        },
        data: {
          ...data,
          version: 0 // version managed by repository + 1 // Increment version
        }
      })

      if (updated.count === 0) {
        throw new Error(
          `Optimistic locking failed for service ${serviceId}. ` +
          `Version mismatch - service may have been modified by another transaction.`
        )
      }

      // Fetch updated service
      const savedService = await this.prisma.service.findUnique({
        where: { id: serviceId }
      })

      const domainServiceResult = ServiceMapper.toDomain(savedService)
      if (domainServiceResult.isFailure) {
        throw new Error(`Failed to map saved service ${serviceId}: ${domainServiceResult.error}`)
      }

      return domainServiceResult.value
    } else {
      // Create new service
      const created = await this.prisma.service.create({
        data
      })

      const domainServiceResult = ServiceMapper.toDomain(created)
      if (domainServiceResult.isFailure) {
        throw new Error(`Failed to map created service ${serviceId}: ${domainServiceResult.error}`)
      }

      return domainServiceResult.value
    }
  }

  /**
   * Finds a service by its ID
   *
   * @param id - Service identifier
   * @returns Service if found, null otherwise
   */
  async findById(id: ServiceId): Promise<Service | null> {
    const service = await this.prisma.service.findUnique({
      where: { id: id.toString() }
    })

    if (!service) {
      return null
    }

    const result = ServiceMapper.toDomain(service)
    return result.isSuccess ? result.value : null
  }

  /**
   * Finds all active services
   * Excludes deactivated services
   *
   * @returns Array of active services
   */
  async findActive(): Promise<Service[]> {
    const services = await this.prisma.service.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        category: 'asc'
      }
    })

    return services
      .map((s: any) => ServiceMapper.toDomain(s))
      .filter((s: Service | null): s is Service => s !== null)
  }

  /**
   * Finds all services (active and inactive)
   *
   * @returns Array of all services
   */
  async findAll(): Promise<Service[]> {
    const services = await this.prisma.service.findMany({
      orderBy: [
        { isActive: 'desc' },
        { category: 'asc' }
      ]
    })

    return services
      .map((s: any) => ServiceMapper.toDomain(s))
      .filter((s: Service | null): s is Service => s !== null)
  }

  /**
   * Finds services by category
   *
   * @param category - Service category to filter by
   * @param activeOnly - Whether to include only active services (default: true)
   * @returns Array of services in that category
   */
  async findByCategory(category: ServiceCategory, activeOnly: boolean = true): Promise<Service[]> {
    const services = await this.prisma.service.findMany({
      where: {
        category,
        ...(activeOnly && { isActive: true })
      },
      orderBy: {
        name: 'asc'
      }
    })

    return services
      .map((s: any) => ServiceMapper.toDomain(s))
      .filter((s: Service | null): s is Service => s !== null)
  }

  /**
   * Finds services that require a specific skill
   * Useful for barber-service matching
   *
   * @param skill - Skill/specialty name
   * @returns Array of services requiring that skill
   */
  async findByRequiredSkill(skill: string): Promise<Service[]> {
    const services = await this.prisma.service.findMany({
      where: {
        requiredSkills: {
          has: skill
        },
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return services
      .map((s: any) => ServiceMapper.toDomain(s))
      .filter((s: Service | null): s is Service => s !== null)
  }

  /**
   * Finds services within a price range
   *
   * @param minPrice - Minimum price (inclusive)
   * @param maxPrice - Maximum price (inclusive)
   * @param activeOnly - Whether to include only active services (default: true)
   * @returns Array of services within price range
   */
  async findByPriceRange(minPrice: Money, maxPrice: Money, activeOnly: boolean = true): Promise<Service[]> {
    const services = await this.prisma.service.findMany({
      where: {
        currency: minPrice.currency, // Ensure same currency
        price: {
          gte: minPrice.amount,
          lte: maxPrice.amount
        },
        ...(activeOnly && { isActive: true })
      },
      orderBy: {
        price: 'asc'
      }
    })

    return services
      .map((s: any) => ServiceMapper.toDomain(s))
      .filter((s: Service | null): s is Service => s !== null)
  }

  /**
   * Finds services within a duration range
   * Useful for time-slot based booking
   *
   * @param minDuration - Minimum duration (inclusive)
   * @param maxDuration - Maximum duration (inclusive)
   * @param activeOnly - Whether to include only active services (default: true)
   * @returns Array of services within duration range
   */
  async findByDurationRange(
    minDuration: Duration,
    maxDuration: Duration,
    activeOnly: boolean = true
  ): Promise<Service[]> {
    const services = await this.prisma.service.findMany({
      where: {
        durationMinutes: {
          gte: minDuration.minutes,
          lte: maxDuration.minutes
        },
        ...(activeOnly && { isActive: true })
      },
      orderBy: {
        durationMinutes: 'asc'
      }
    })

    return services
      .map((s: any) => ServiceMapper.toDomain(s))
      .filter((s: Service | null): s is Service => s !== null)
  }

  /**
   * Searches services by name and description
   * Case-insensitive partial match
   *
   * @param searchTerm - Search term (minimum 2 characters)
   * @param activeOnly - Whether to include only active services (default: true)
   * @returns Array of matching services
   */
  async search(searchTerm: string, activeOnly: boolean = true): Promise<Service[]> {
    if (searchTerm.length < 2) {
      return []
    }

    const services = await this.prisma.service.findMany({
      where: {
        OR: [
          {
            name: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          }
        ],
        ...(activeOnly && { isActive: true })
      },
      orderBy: {
        name: 'asc'
      },
      take: 50 // Limit results
    })

    return services
      .map((s: any) => ServiceMapper.toDomain(s))
      .filter((s: Service | null): s is Service => s !== null)
  }

  /**
   * Finds most popular services
   * Based on booking frequency
   *
   * @param limit - Maximum number of services to return
   * @returns Array of popular services ordered by booking count
   */
  async findPopular(limit: number): Promise<Service[]> {
    // This requires aggregating appointment counts
    // For now, we'll return active services ordered by name
    // In production, you'd add a bookingCount field or aggregate from appointments
    const services = await this.prisma.service.findMany({
      where: {
        isActive: true
      },
      include: {
        _count: {
          select: { appointments: true }
        }
      },
      orderBy: {
        appointments: {
          _count: 'desc'
        }
      },
      take: limit
    })

    return services
      .map((s: any) => ServiceMapper.toDomain(s))
      .filter((s: Service | null): s is Service => s !== null)
  }

  /**
   * Finds services that a specific barber can perform
   * Matches barber specialties with service required skills
   *
   * @param barberId - Barber identifier
   * @param activeOnly - Whether to include only active services (default: true)
   * @returns Array of services the barber can perform
   */
  async findByBarberSkills(barberId: string, activeOnly: boolean = true): Promise<Service[]> {
    // Get barber's specialties
    const barber = await this.prisma.barber.findUnique({
      where: { id: barberId },
      select: { specialties: true }
    })

    if (!barber) {
      return []
    }

    // Find services where all required skills are in barber's specialties
    const services = await this.prisma.service.findMany({
      where: {
        // All required skills must be in barber's specialties
        requiredSkills: {
          isEmpty: false
        },
        ...(activeOnly && { isActive: true })
      }
    })

    // Filter services where barber has all required skills
    const matchingServices = services.filter((service: any) => {
      return service.requiredSkills.every((skill: string) =>
        barber.specialties.includes(skill)
      )
    })

    return matchingServices
      .map((s: any) => ServiceMapper.toDomain(s))
      .filter((s: Service | null): s is Service => s !== null)
  }

  /**
   * Deletes a service
   * Should only be used in exceptional cases
   * Prefer deactivating services to maintain historical data
   *
   * @param id - Service identifier
   */
  async delete(id: ServiceId): Promise<void> {
    await this.prisma.service.delete({
      where: { id: id.toString() }
    })
  }

  /**
   * Checks if a service exists
   *
   * @param id - Service identifier
   * @returns True if exists, false otherwise
   */
  async exists(id: ServiceId): Promise<boolean> {
    const count = await this.prisma.service.count({
      where: { id: id.toString() }
    })

    return count > 0
  }

  /**
   * Checks if a service name is already used
   * Useful for duplicate detection
   *
   * @param name - Service name to check
   * @returns True if name exists, false otherwise
   */
  async existsByName(name: string): Promise<boolean> {
    const count = await this.prisma.service.count({
      where: { name }
    })

    return count > 0
  }
}
