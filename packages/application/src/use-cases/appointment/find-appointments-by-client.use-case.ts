import { Appointment } from '@barbershop/domain/entities/appointment.entity'
import { ClientId } from '@barbershop/domain/entities/client-id.vo'
import { Result } from '@barbershop/domain/common/result'
import { IAppointmentRepository } from '@barbershop/domain/repositories/appointment.repository.interface'
import { DateTime } from 'luxon'

/**
 * Input DTO for FindAppointmentsByClientUseCase
 */
export interface FindAppointmentsByClientDTO {
  clientId: string
  startDate?: Date
  endDate?: Date
  includeCompleted?: boolean
  includeCancelled?: boolean
}

/**
 * Use Case: Find Appointments By Client
 *
 * Business Rules:
 * 1. Client ID must be valid
 * 2. If date range provided, startDate must be before endDate
 * 3. By default, only return active appointments (not completed/cancelled)
 * 4. Date range is optional - without it, returns all appointments
 * 5. Sort results by start time (most recent first)
 *
 * This use case supports client appointment history and upcoming bookings.
 */
export class FindAppointmentsByClientUseCase {
  constructor(private readonly appointmentRepository: IAppointmentRepository) {}

  /**
   * Execute the use case
   *
   * @param dto - Input data transfer object
   * @returns Result with array of appointments or error message
   */
  async execute(dto: FindAppointmentsByClientDTO): Promise<Result<Appointment[]>> {
    // 1. Validate client ID
    const clientId = ClientId.create(dto.clientId)

    // 2. Validate date range if provided
    if (dto.startDate && dto.endDate) {
      if (dto.startDate >= dto.endDate) {
        return Result.fail<Appointment[]>('Start date must be before end date')
      }
    }

    // 3. Query appointments based on date range
    let appointments: Appointment[]

    if (dto.startDate && dto.endDate) {
      // Use date range query
      const startDate = DateTime.fromJSDate(dto.startDate)
      const endDate = DateTime.fromJSDate(dto.endDate)

      // Note: Repository doesn't have findByClientAndDateRange yet
      // For now, get all client appointments and filter
      appointments = await this.appointmentRepository.findByClient(clientId)

      // Filter by date range
      appointments = appointments.filter(apt => {
        const aptDate = apt.slot.startTime
        return aptDate.toJSDate() >= startDate.toJSDate() &&
               aptDate.toJSDate() <= endDate.toJSDate()
      })
    } else {
      // Get all appointments for client
      appointments = await this.appointmentRepository.findByClient(clientId)
    }

    // 4. Filter by status if requested
    if (!dto.includeCompleted) {
      appointments = appointments.filter(apt => apt.status !== 'COMPLETED')
    }

    if (!dto.includeCancelled) {
      appointments = appointments.filter(apt =>
        apt.status !== 'CANCELLED' && apt.status !== 'NO_SHOW'
      )
    }

    // 5. Sort by start time (most recent first)
    appointments.sort((a, b) => {
      return b.slot.startTime.toJSDate().getTime() -
             a.slot.startTime.toJSDate().getTime()
    })

    return Result.ok<Appointment[]>(appointments)
  }
}
