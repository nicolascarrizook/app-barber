import { IAppointmentRepository } from '@barbershop/domain/repositories/appointment.repository.interface'
import { Appointment } from '@barbershop/domain/entities/appointment.entity'
import { AppointmentId } from '@barbershop/domain/entities/appointment-id.vo'
import { BarberId } from '@barbershop/domain/entities/barber-id.vo'
import { ClientId } from '@barbershop/domain/entities/client-id.vo'
import { DateTime } from 'luxon'
import { TimeSlot } from '@barbershop/domain/value-objects/time-slot.vo'
import { AppointmentMapper } from '../mappers/appointment.mapper'

/**
 * Prisma Client type placeholder
 * In production, this would be: import { PrismaClient } from '@prisma/client'
 */
type PrismaClient = any

/**
 * Prisma implementation of IAppointmentRepository
 *
 * Responsibilities:
 * - Persist and retrieve Appointment aggregates
 * - Handle optimistic locking with version field
 * - Convert between domain entities and Prisma models using AppointmentMapper
 * - Implement domain-specific queries (conflicts, availability, etc.)
 * - Ensure transactional consistency
 *
 * Clean Architecture: Infrastructure layer depending on domain layer interfaces
 */
export class PrismaAppointmentRepository implements IAppointmentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Saves an appointment (create or update)
   * Uses optimistic locking to prevent concurrent modification issues
   *
   * @param appointment - Appointment aggregate to save
   * @returns Saved appointment with updated version
   * @throws Error if optimistic locking fails (version mismatch)
   */
  async save(appointment: Appointment): Promise<Appointment> {
    const data = AppointmentMapper.toPersistence(appointment)
    const appointmentId = appointment.appointmentId.toString()

    // Check if appointment exists
    const exists = await this.prisma.appointment.findUnique({
      where: { id: appointmentId }
    })

    if (exists) {
      // Update with optimistic locking
      // Ensure version matches before updating
      const updated = await this.prisma.appointment.updateMany({
        where: {
          id: appointmentId,
          version: 0 // version managed by repository // Optimistic lock check
        },
        data: {
          ...data,
          version: 0 // version managed by repository + 1 // Increment version
        }
      })

      if (updated.count === 0) {
        throw new Error(
          `Optimistic locking failed for appointment ${appointmentId}. ` +
          `Version mismatch - appointment may have been modified by another transaction.`
        )
      }

      // Fetch updated appointment
      const savedAppointment = await this.prisma.appointment.findUnique({
        where: { id: appointmentId }
      })

      const domainAppointmentResult = AppointmentMapper.toDomain(savedAppointment)


      if (domainAppointmentResult.isFailure) {
        throw new Error(`Failed to map saved appointment ${appointmentId}: ${domainAppointmentResult.error}`)
      }

      return domainAppointmentResult.value
    } else {
      // Create new appointment
      const created = await this.prisma.appointment.create({
        data
      })

      const domainAppointmentResult = AppointmentMapper.toDomain(created)


      if (domainAppointmentResult.isFailure) {
        throw new Error(`Failed to map created appointment ${appointmentId}: ${domainAppointmentResult.error}`)
      }

      return domainAppointmentResult.value
    }
  }

  /**
   * Finds an appointment by its ID
   *
   * @param id - Appointment identifier
   * @returns Appointment if found, null otherwise
   */
  async findById(id: AppointmentId): Promise<Appointment | null> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: id.toString() }
    })

    if (!appointment) {
      return null
    }

    const result = AppointmentMapper.toDomain(appointment)


    return result.isSuccess ? result.value : null
  }

  /**
   * Finds all appointments for a specific barber on a given date
   *
   * @param barberId - Barber identifier
   * @param date - Date to query
   * @returns Array of appointments for that barber on that date
   */
  async findByBarberAndDate(barberId: BarberId, date: DateTime): Promise<Appointment[]> {
    const startOfDay = new Date(date.toJSDate())
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date.toJSDate())
    endOfDay.setHours(23, 59, 59, 999)

    const appointments = await this.prisma.appointment.findMany({
      where: {
        barberId: barberId.toString(),
        startTime: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    })

    return appointments
      .map((apt: any) => AppointmentMapper.toDomain(apt))
      .filter((apt: Appointment | null): apt is Appointment => apt !== null)
  }

  /**
   * Finds all appointments for a specific client
   *
   * @param clientId - Client identifier
   * @returns Array of client's appointments
   */
  async findByClient(clientId: ClientId): Promise<Appointment[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        clientId: clientId.toString()
      },
      orderBy: {
        startTime: 'desc'
      }
    })

    return appointments
      .map((apt: any) => AppointmentMapper.toDomain(apt))
      .filter((apt: Appointment | null): apt is Appointment => apt !== null)
  }

  /**
   * Finds appointments that conflict with a given time slot for a barber
   * Critical for double-booking prevention
   *
   * @param barberId - Barber identifier
   * @param timeSlot - Time slot to check for conflicts
   * @returns Array of conflicting appointments
   */
  async findConflicting(barberId: BarberId, timeSlot: TimeSlot): Promise<Appointment[]> {
    // Find appointments where:
    // (newStart < existingEnd) AND (newEnd > existingStart)
    // This catches all overlapping scenarios
    const appointments = await this.prisma.appointment.findMany({
      where: {
        barberId: barberId.toString(),
        startTime: {
          lt: timeSlot.endTime.toJSDate()
        },
        endTime: {
          gt: timeSlot.startTime.toJSDate()
        },
        status: {
          notIn: ['CANCELLED', 'NO_SHOW'] // Only active appointments count
        }
      }
    })

    return appointments
      .map((apt: any) => AppointmentMapper.toDomain(apt))
      .filter((apt: Appointment | null): apt is Appointment => apt !== null)
  }

  /**
   * Finds all appointments for a barber within a date range
   *
   * @param barberId - Barber identifier
   * @param startDate - Start of date range
   * @param endDate - End of date range
   * @returns Array of appointments in that range
   */
  async findByBarberAndDateRange(
    barberId: BarberId,
    startDate: DateTime,
    endDate: DateTime
  ): Promise<Appointment[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        barberId: barberId.toString(),
        startTime: {
          gte: startDate.toJSDate(),
          lte: endDate.toJSDate()
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    })

    return appointments
      .map((apt: any) => AppointmentMapper.toDomain(apt))
      .filter((apt: Appointment | null): apt is Appointment => apt !== null)
  }

  /**
   * Deletes an appointment
   * Should only be used in exceptional cases (GDPR, data cleanup)
   * Prefer cancellation for normal business operations
   *
   * @param id - Appointment identifier
   */
  async delete(id: AppointmentId): Promise<void> {
    await this.prisma.appointment.delete({
      where: { id: id.toString() }
    })
  }

  /**
   * Checks if an appointment exists
   *
   * @param id - Appointment identifier
   * @returns True if exists, false otherwise
   */
  async exists(id: AppointmentId): Promise<boolean> {
    const count = await this.prisma.appointment.count({
      where: { id: id.toString() }
    })

    return count > 0
  }
}
