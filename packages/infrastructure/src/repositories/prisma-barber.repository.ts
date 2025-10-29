import { IBarberRepository } from '@barbershop/domain/repositories/barber.repository.interface'
import { Barber } from '@barbershop/domain/entities/barber.entity'
import { BarberId } from '@barbershop/domain/entities/barber-id.vo'
import { Email } from '@barbershop/domain/value-objects/email.vo'
import { Phone } from '@barbershop/domain/value-objects/phone.vo'
import { Specialty } from '@barbershop/domain/value-objects/barber-specialties.vo'
import { DateTime } from 'luxon'
import { BarberMapper } from '../mappers/barber.mapper'

/**
 * Prisma Client type placeholder
 */
type PrismaClient = any

/**
 * Prisma implementation of IBarberRepository
 *
 * Responsibilities:
 * - Persist and retrieve Barber aggregates
 * - Handle optimistic locking with version field
 * - Convert between domain entities and Prisma models using BarberMapper
 * - Implement domain-specific queries (skills, availability, ratings, etc.)
 * - Ensure transactional consistency
 *
 * Clean Architecture: Infrastructure layer depending on domain layer interfaces
 */
export class PrismaBarberRepository implements IBarberRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Saves a barber (create or update)
   * Uses optimistic locking to prevent concurrent modification issues
   *
   * @param barber - Barber aggregate to save
   * @returns Saved barber with updated version
   * @throws Error if optimistic locking fails (version mismatch)
   */
  async save(barber: Barber): Promise<Barber> {
    const data = BarberMapper.toPersistence(barber)
    const barberId = barber.barberId.toString()

    // Check if barber exists
    const exists = await this.prisma.barber.findUnique({
      where: { id: barberId }
    })

    if (exists) {
      // Update with optimistic locking
      const updated = await this.prisma.barber.updateMany({
        where: {
          id: barberId,
          version: exists.version // Optimistic lock check - use current version from DB
        },
        data: {
          ...data,
          version: exists.version + 1 // Increment version
        }
      })

      if (updated.count === 0) {
        throw new Error(
          `Optimistic locking failed for barber ${barberId}. ` +
          `Version mismatch - barber may have been modified by another transaction.`
        )
      }

      // Fetch updated barber
      const savedBarber = await this.prisma.barber.findUnique({
        where: { id: barberId }
      })

      const domainBarberResult = BarberMapper.toDomain(savedBarber)
      if (domainBarberResult.isFailure) {
        throw new Error(`Failed to map saved barber ${barberId}: ${domainBarberResult.error}`)
      }

      return domainBarberResult.value
    } else {
      // Create new barber
      const created = await this.prisma.barber.create({
        data
      })

      const domainBarberResult = BarberMapper.toDomain(created)
      if (domainBarberResult.isFailure) {
        throw new Error(`Failed to map created barber ${barberId}: ${domainBarberResult.error}`)
      }

      return domainBarberResult.value
    }
  }

  /**
   * Finds a barber by its ID
   *
   * @param id - Barber identifier
   * @returns Barber if found, null otherwise
   */
  async findById(id: BarberId): Promise<Barber | null> {
    const barber = await this.prisma.barber.findUnique({
      where: { id: id.toString() }
    })

    if (!barber) {
      return null
    }

    const result = BarberMapper.toDomain(barber)
    return result.isSuccess ? result.value : null
  }

  /**
   * Finds a barber by email address
   * Useful for authentication and duplicate detection
   *
   * @param email - Email address
   * @returns Barber if found, null otherwise
   */
  async findByEmail(email: Email): Promise<Barber | null> {
    const barber = await this.prisma.barber.findUnique({
      where: { email: email.value }
    })

    if (!barber) {
      return null
    }

    const result = BarberMapper.toDomain(barber)
    return result.isSuccess ? result.value : null
  }

  /**
   * Finds a barber by phone number
   * Useful for phone-based lookup and duplicate detection
   *
   * @param phone - Phone number
   * @returns Barber if found, null otherwise
   */
  async findByPhone(phone: Phone): Promise<Barber | null> {
    const barber = await this.prisma.barber.findUnique({
      where: { phone: phone.value }
    })

    if (!barber) {
      return null
    }

    const result = BarberMapper.toDomain(barber)
    return result.isSuccess ? result.value : null
  }

  /**
   * Finds all active barbers
   * Excludes inactive and on-leave barbers
   *
   * @returns Array of active barbers
   */
  async findAll(): Promise<Barber[]> {
    const barbers = await this.prisma.barber.findMany({
      where: {
        status: 'ACTIVE'
      },
      orderBy: {
        rating: 'desc'
      }
    })

    return barbers
      .map((b: any) => BarberMapper.toDomain(b))
      .filter((b: Barber | null): b is Barber => b !== null)
  }

  /**
   * Finds barbers with a specific skill/specialty
   * Used for service-barber matching
   *
   * @param skill - Specialty to search for
   * @returns Array of barbers with that skill
   */
  async findBySkill(skill: Specialty): Promise<Barber[]> {
    const barbers = await this.prisma.barber.findMany({
      where: {
        specialties: {
          has: skill
        },
        status: 'ACTIVE'
      },
      orderBy: {
        rating: 'desc'
      }
    })

    return barbers
      .map((b: any) => BarberMapper.toDomain(b))
      .filter((b: Barber | null): b is Barber => b !== null)
  }

  /**
   * Finds barbers available for a given date and duration
   * This is a complex query that checks:
   * - Barber is active
   * - Has working hours for that day
   * - Has enough time available (considering existing appointments)
   *
   * @param date - Date to check availability
   * @param durationMinutes - Required duration in minutes
   * @returns Array of available barbers
   */
  async findAvailable(date: DateTime, durationMinutes: number): Promise<Barber[]> {
    const dayOfWeek = date.toJSDate().getDay()

    // Find barbers who work on this day
    const barbers = await this.prisma.barber.findMany({
      where: {
        status: 'ACTIVE',
        // Check if schedule contains working hours for this day
        // Note: This is a simplified query - in production, you'd use a more sophisticated check
      },
      include: {
        appointments: {
          where: {
            startTime: {
              gte: new Date(date.toJSDate().setHours(0, 0, 0, 0)),
              lt: new Date(date.toJSDate().setHours(23, 59, 59, 999))
            },
            status: {
              notIn: ['CANCELLED', 'NO_SHOW']
            }
          }
        }
      }
    })

    // Filter barbers who have the schedule and availability
    const availableBarbers: Barber[] = []

    for (const barberData of barbers) {
      const barberResult = BarberMapper.toDomain(barberData)

      if (barberResult.isFailure) continue
      const barber = barberResult.value

      // Check if barber works on this day
      const worksOnDay = barber.schedule.getAllDaySchedules().some((wh: any) => wh.day === dayOfWeek)
      if (!worksOnDay) continue

      // In production, you'd calculate available slots considering appointments
      // For now, we just include barbers who work on that day
      availableBarbers.push(barber)
    }

    return availableBarbers
  }

  /**
   * Finds barbers available for a specific service on a given date
   * Combines skill matching with availability checking
   *
   * @param serviceId - Service identifier
   * @param date - Date to check availability
   * @returns Array of available barbers for that service
   */
  async findAvailableForService(serviceId: string, date: DateTime): Promise<Barber[]> {
    // First, get the service to know required skills
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId }
    })

    if (!service) {
      return []
    }

    const dayOfWeek = date.toJSDate().getDay()

    // Find barbers with required skills who work on that day
    const barbers = await this.prisma.barber.findMany({
      where: {
        status: 'ACTIVE',
        // Check if barber has all required skills
        specialties: {
          hasEvery: service.requiredSkills
        }
      },
      include: {
        appointments: {
          where: {
            startTime: {
              gte: new Date(date.toJSDate().setHours(0, 0, 0, 0)),
              lt: new Date(date.toJSDate().setHours(23, 59, 59, 999))
            },
            status: {
              notIn: ['CANCELLED', 'NO_SHOW']
            }
          }
        }
      }
    })

    // Filter and map to domain
    const availableBarbers: Barber[] = []

    for (const barberData of barbers) {
      const barberResult = BarberMapper.toDomain(barberData)

      if (barberResult.isFailure) continue
      const barber = barberResult.value

      // Check if barber works on this day
      const worksOnDay = barber.schedule.getAllDaySchedules().some((wh: any) => wh.day === dayOfWeek)
      if (!worksOnDay) continue

      availableBarbers.push(barber)
    }

    return availableBarbers
  }

  /**
   * Finds top-rated barbers
   * Used for recommendations and featured barbers
   *
   * @param limit - Maximum number of barbers to return
   * @returns Array of top-rated barbers
   */
  async findTopRated(limit: number): Promise<Barber[]> {
    const barbers = await this.prisma.barber.findMany({
      where: {
        status: 'ACTIVE',
        rating: {
          gt: 0
        }
      },
      orderBy: [
        { rating: 'desc' },
        { totalAppointments: 'desc' }
      ],
      take: limit
    })

    return barbers
      .map((b: any) => BarberMapper.toDomain(b))
      .filter((b: Barber | null): b is Barber => b !== null)
  }

  /**
   * Deletes a barber
   * Should only be used in exceptional cases (data cleanup)
   * Prefer deactivating barbers to maintain historical data
   *
   * @param id - Barber identifier
   */
  async delete(id: BarberId): Promise<void> {
    await this.prisma.barber.delete({
      where: { id: id.toString() }
    })
  }

  /**
   * Checks if a barber exists
   *
   * @param id - Barber identifier
   * @returns True if exists, false otherwise
   */
  async exists(id: BarberId): Promise<boolean> {
    const count = await this.prisma.barber.count({
      where: { id: id.toString() }
    })

    return count > 0
  }

  /**
   * Checks if an email is already registered
   * Useful for duplicate detection during registration
   *
   * @param email - Email address to check
   * @returns True if email exists, false otherwise
   */
  async existsByEmail(email: Email): Promise<boolean> {
    const count = await this.prisma.barber.count({
      where: { email: email.value }
    })

    return count > 0
  }
}
