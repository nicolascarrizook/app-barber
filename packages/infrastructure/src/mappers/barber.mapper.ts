import { Barber } from '@barbershop/domain/entities/barber.entity'
import { BarberId } from '@barbershop/domain/entities/barber-id.vo'
import { Email } from '@barbershop/domain/value-objects/email.vo'
import { Phone } from '@barbershop/domain/value-objects/phone.vo'
import { BarberSpecialties, Specialty } from '@barbershop/domain/value-objects/barber-specialties.vo'
import { BarberSchedule, DaySchedule } from '@barbershop/domain/value-objects/barber-schedule.vo'
import { BarberStatus } from '@barbershop/domain/value-objects/barber-status.vo'
import { BarberName } from '@barbershop/domain/value-objects/barber-name.vo'
import { Result } from '@barbershop/domain/common/result'
import { UniqueEntityID } from '@barbershop/domain/common/unique-entity-id'

/**
 * Prisma Barber type (from generated client)
 */
export type PrismaBarber = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  specialties: string[]
  schedule: any // JSONB
  status: string
  commissionRate: any // Decimal
  rating: any // Decimal
  totalAppointments: number
  profileImageUrl: string | null
  bio: string | null
  version: number
  createdAt: Date
  updatedAt: Date
}

/**
 * Mapper between Barber domain entity and Prisma persistence model
 *
 * Responsibilities:
 * - Convert domain entities to Prisma models (toPersistence)
 * - Convert Prisma models to domain entities (toDomain)
 * - Handle Value Object conversions (Email, Phone, Specialty, WorkingHours)
 * - Preserve aggregate invariants during conversion
 */
export class BarberMapper {
  /**
   * Maps a domain Barber entity to Prisma persistence model
   *
   * @param barber - Domain entity
   * @returns Prisma model ready for database operations
   */
  public static toPersistence(barber: Barber): Omit<PrismaBarber, 'createdAt' | 'updatedAt'> {
    const daySchedules = barber.schedule.getAllDaySchedules()

    return {
      id: barber.barberId.toString(),
      firstName: barber.name.firstName,
      lastName: barber.name.lastName,
      email: barber.email.value,
      phone: barber.phone.value,
      specialties: barber.specialties.specialties, // Array of Specialty enums
      schedule: daySchedules.map(ds => ({
        day: ds.day,
        isWorking: ds.isWorking,
        hours: ds.hours
      })),
      status: barber.status.toString(),
      commissionRate: barber.commissionRate,
      rating: barber.rating,
      totalAppointments: barber.totalAppointments,
      profileImageUrl: barber.profileImageUrl || null,
      bio: barber.bio || null,
      version: 0 // Will be managed by repository optimistic locking
    }
  }

  /**
   * Maps a Prisma persistence model to domain Barber entity
   *
   * @param raw - Prisma model from database
   * @returns Domain entity or null if conversion fails
   */
  public static toDomain(raw: PrismaBarber): Result<Barber> {
    // Create BarberId
    const barberId = BarberId.create(raw.id)

    // Create BarberName
    const nameResult = BarberName.create(raw.firstName, raw.lastName)
    if (nameResult.isFailure) {
      return Result.fail<Barber>(`Invalid barber name: ${nameResult.error}`)
    }

    // Create Email
    const emailResult = Email.create(raw.email)
    if (emailResult.isFailure) {
      return Result.fail<Barber>(`Invalid email: ${emailResult.error}`)
    }

    // Create Phone
    const phoneResult = Phone.create(raw.phone)
    if (phoneResult.isFailure) {
      return Result.fail<Barber>(`Invalid phone: ${phoneResult.error}`)
    }

    // Create BarberSpecialties from string array
    const specialtiesResult = BarberSpecialties.createFromStrings(raw.specialties)
    if (specialtiesResult.isFailure) {
      return Result.fail<Barber>(`Invalid specialties: ${specialtiesResult.error}`)
    }

    // Create BarberSchedule from schedule JSON
    const daySchedules: DaySchedule[] = Array.isArray(raw.schedule)
      ? raw.schedule.map((item: any) => ({
          day: item.day,
          isWorking: item.isWorking,
          hours: item.hours
        }))
      : []

    const scheduleResult = BarberSchedule.create(daySchedules)
    if (scheduleResult.isFailure) {
      return Result.fail<Barber>(`Invalid schedule: ${scheduleResult.error}`)
    }

    // Create BarberStatus
    const statusResult = BarberStatus.create(raw.status as any)
    if (statusResult.isFailure) {
      return Result.fail<Barber>(`Invalid status: ${statusResult.error}`)
    }

    // Create Barber entity
    const barberResult = Barber.create({
      name: nameResult.value,
      email: emailResult.value,
      phone: phoneResult.value,
      specialties: specialtiesResult.value,
      schedule: scheduleResult.value,
      commissionRate: Number(raw.commissionRate),
      profileImageUrl: raw.profileImageUrl || undefined,
      bio: raw.bio || undefined
    }, new UniqueEntityID(barberId.toString()))

    if (barberResult.isFailure) {
      return Result.fail<Barber>(`Failed to create barber: ${barberResult.error}`)
    }

    const barber = barberResult.value

    // Restore additional fields (rating, totalAppointments, status)
    // These would ideally be set through domain methods, but for reconstruction:
    ;(barber as any)._rating = Number(raw.rating)
    ;(barber as any)._totalAppointments = raw.totalAppointments
    ;(barber as any)._status = statusResult.value
    ;(barber as any)._createdAt = raw.createdAt
    ;(barber as any)._updatedAt = raw.updatedAt

    return Result.ok<Barber>(barber)
  }
}
