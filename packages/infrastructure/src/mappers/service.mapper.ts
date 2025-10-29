import { Service } from '@barbershop/domain/entities/service.entity'
import { ServiceId } from '@barbershop/domain/entities/service-id.vo'
import { ServiceCategory } from '@barbershop/domain/entities/service-category.enum'
import { Duration } from '@barbershop/domain/value-objects/duration.vo'
import { Money } from '@barbershop/domain/value-objects/money.vo'
import { Currency } from '@barbershop/domain/value-objects/currency.vo'
import { Result } from '@barbershop/domain/common/result'
import { UniqueEntityID } from '@barbershop/domain/common/unique-entity-id'

/**
 * Prisma Service type (from generated client)
 */
export type PrismaService = {
  id: string
  name: string
  description: string
  durationMinutes: number
  price: any // Decimal
  currency: string
  category: string
  requiredSkills: string[]
  isActive: boolean
  version: number
  createdAt: Date
  updatedAt: Date
}

/**
 * Mapper between Service domain entity and Prisma persistence model
 *
 * Responsibilities:
 * - Convert domain entities to Prisma models (toPersistence)
 * - Convert Prisma models to domain entities (toDomain)
 * - Handle Value Object conversions
 * - Preserve aggregate invariants during conversion
 */
export class ServiceMapper {
  /**
   * Maps a domain Service entity to Prisma persistence model
   *
   * @param service - Domain entity
   * @returns Prisma model ready for database operations
   */
  public static toPersistence(service: Service): Omit<PrismaService, 'createdAt' | 'updatedAt'> {
    return {
      id: service.serviceId.toString(),
      name: service.name,
      description: service.description,
      durationMinutes: service.duration.minutes,
      price: service.price.amount,
      currency: service.price.currency.toString(),
      category: service.category,
      requiredSkills: [...service.requiredSkills],
      isActive: service.isActive,
      version: 0 // Managed by repository
    }
  }

  /**
   * Maps a Prisma persistence model to domain Service entity
   *
   * @param raw - Prisma model from database
   * @returns Domain entity or null if conversion fails
   */
  public static toDomain(raw: PrismaService): Result<Service> {
    // Create Value Objects
    const serviceId = ServiceId.create(raw.id)

    // Create Duration
    const durationOrError = Duration.create(raw.durationMinutes)
    if (durationOrError.isFailure) {
      return Result.fail<Service>(`Invalid duration: ${durationOrError.error}`)
    }
    const duration = durationOrError.value

    // Create Money for price
    const priceOrError = Money.create(
      Number(raw.price),
      raw.currency as unknown as Currency
    )
    if (priceOrError.isFailure) {
      return Result.fail<Service>(`Invalid price: ${priceOrError.error}`)
    }
    const price = priceOrError.value

    // Validate category
    if (!Object.values(ServiceCategory).includes(raw.category as ServiceCategory)) {
      return Result.fail<Service>(`Invalid category: ${raw.category}`)
    }
    const category = raw.category as ServiceCategory

    // Create Service entity using create() factory
    const serviceOrError = Service.create({
      name: raw.name,
      description: raw.description,
      duration,
      price,
      category,
      requiredSkills: raw.requiredSkills
    })

    if (serviceOrError.isFailure) {
      return Result.fail<Service>(`Failed to create service: ${serviceOrError.error}`)
    }

    const service = serviceOrError.value

    // Restore serviceId and persisted state
    ;(service as any)._serviceId = serviceId
    ;(service as any)._isActive = raw.isActive
    ;(service as any)._createdAt = raw.createdAt
    ;(service as any)._updatedAt = raw.updatedAt

    return Result.ok<Service>(service)
  }
}
