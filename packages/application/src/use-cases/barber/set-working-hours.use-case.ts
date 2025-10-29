import { Result } from '@barbershop/domain/common/result'
import { Barber } from '@barbershop/domain/entities/barber.entity'
import { BarberId } from '@barbershop/domain/entities/barber-id.vo'
import { IBarberRepository } from '@barbershop/domain/repositories/barber.repository.interface'
import { BarberSchedule } from '@barbershop/domain/value-objects/barber-schedule.vo'

/**
 * Input DTO for SetWorkingHoursUseCase
 */
export interface SetWorkingHoursDTO {
  barberId: string
  schedule: {
    monday?: { startTime: string; endTime: string } | null
    tuesday?: { startTime: string; endTime: string } | null
    wednesday?: { startTime: string; endTime: string } | null
    thursday?: { startTime: string; endTime: string } | null
    friday?: { startTime: string; endTime: string } | null
    saturday?: { startTime: string; endTime: string } | null
    sunday?: { startTime: string; endTime: string } | null
  }
}

/**
 * Use Case: Set Working Hours
 *
 * Business Rules:
 * 1. Barber must exist
 * 2. Barber must be active to change schedule
 * 3. Valid time format (HH:MM)
 * 4. End time must be after start time
 * 5. null means the barber doesn't work that day
 *
 * This updates the barber's weekly working schedule.
 */
export class SetWorkingHoursUseCase {
  constructor(private readonly barberRepository: IBarberRepository) {}

  /**
   * Execute the use case
   *
   * @param dto - Input data transfer object
   * @returns Result with updated Barber entity
   */
  async execute(dto: SetWorkingHoursDTO): Promise<Result<Barber>> {
    // 1. Load barber
    const barberId = BarberId.create(dto.barberId)
    const barber = await this.barberRepository.findById(barberId)

    if (!barber) {
      return Result.fail<Barber>('Barber not found')
    }

    // 2. Create new schedule value object
    const scheduleResult = BarberSchedule.create(dto.schedule)
    if (scheduleResult.isFailure) {
      return Result.fail<Barber>(scheduleResult.error!)
    }

    const schedule = scheduleResult.value

    // 3. Update barber schedule
    const updateResult = barber.updateSchedule(schedule)
    if (updateResult.isFailure) {
      return Result.fail<Barber>(updateResult.error!)
    }

    // 4. Persist changes
    try {
      await this.barberRepository.save(barber)
    } catch (error) {
      return Result.fail<Barber>('Failed to save barber schedule')
    }

    // 5. Return success
    return Result.ok<Barber>(barber)
  }
}
