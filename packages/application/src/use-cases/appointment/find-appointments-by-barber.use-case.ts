import { Appointment } from '@barbershop/domain/entities/appointment.entity'
import { BarberId } from '@barbershop/domain/entities/barber-id.vo'
import { Result } from '@barbershop/domain/common/result'
import { IAppointmentRepository } from '@barbershop/domain/repositories/appointment.repository.interface'
import { DateTime } from 'luxon'

/**
 * Input DTO for FindAppointmentsByBarberUseCase
 */
export interface FindAppointmentsByBarberDTO {
  barberId: string
  date?: Date // Optional - specific date to query
  startDate?: Date // Optional - date range start
  endDate?: Date // Optional - date range end
  includeCompleted?: boolean
  includeCancelled?: boolean
}

/**
 * Use Case: Find Appointments By Barber
 *
 * Business Rules:
 * 1. Barber ID must be valid
 * 2. Can query by specific date OR date range (not both)
 * 3. If date range provided, startDate must be before endDate
 * 4. By default, only return active appointments (not completed/cancelled)
 * 5. Without date filters, returns all appointments
 * 6. Sort results by start time (earliest first for scheduling)
 *
 * This use case supports barber schedule management and day planning.
 */
export class FindAppointmentsByBarberUseCase {
  constructor(private readonly appointmentRepository: IAppointmentRepository) {}

  /**
   * Execute the use case
   *
   * @param dto - Input data transfer object
   * @returns Result with array of appointments or error message
   */
  async execute(dto: FindAppointmentsByBarberDTO): Promise<Result<Appointment[]>> {
    // 1. Validate barber ID
    const barberId = BarberId.create(dto.barberId)

    // 2. Validate that only one type of date filter is provided
    if (dto.date && (dto.startDate || dto.endDate)) {
      return Result.fail<Appointment[]>(
        'Cannot specify both specific date and date range'
      )
    }

    // 3. Validate date range if provided
    if (dto.startDate && dto.endDate) {
      if (dto.startDate >= dto.endDate) {
        return Result.fail<Appointment[]>('Start date must be before end date')
      }
    }

    // 4. Query appointments based on filters
    let appointments: Appointment[]

    if (dto.date) {
      // Query by specific date
      const date = DateTime.fromJSDate(dto.date)

      appointments = await this.appointmentRepository.findByBarberAndDate(barberId, date)
    } else if (dto.startDate && dto.endDate) {
      // Query by date range
      const startDate = DateTime.fromJSDate(dto.startDate)
      const endDate = DateTime.fromJSDate(dto.endDate)

      appointments = await this.appointmentRepository.findByBarberAndDateRange(
        barberId,
        startDate,
        endDate
      )
    } else {
      // Query all appointments for barber (no date filter)
      // Note: Repository doesn't have findByBarber method
      // We'll use findByBarberAndDateRange with a wide range
      const startDate = DateTime.fromJSDate(new Date(2020, 0, 1))
      const endDate = DateTime.fromJSDate(new Date(2030, 11, 31))

      appointments = await this.appointmentRepository.findByBarberAndDateRange(
        barberId,
        startDate,
        endDate
      )
    }

    // 5. Filter by status if requested
    if (!dto.includeCompleted) {
      appointments = appointments.filter(apt => apt.status !== 'COMPLETED')
    }

    if (!dto.includeCancelled) {
      appointments = appointments.filter(apt =>
        apt.status !== 'CANCELLED' && apt.status !== 'NO_SHOW'
      )
    }

    // 6. Sort by start time (earliest first for barber scheduling)
    appointments.sort((a, b) => {
      return a.slot.startTime.toJSDate().getTime() -
             b.slot.startTime.toJSDate().getTime()
    })

    return Result.ok<Appointment[]>(appointments)
  }
}
