import { Result } from '@barbershop/domain/common/result'
import { Barber } from '@barbershop/domain/entities/barber.entity'
import { BarberId } from '@barbershop/domain/entities/barber-id.vo'
import { IBarberRepository } from '@barbershop/domain/repositories/barber.repository.interface'

/**
 * Input DTO for DeactivateBarberUseCase
 */
export interface DeactivateBarberDTO {
  barberId: string
  reason?: string
}

/**
 * Use Case: Deactivate Barber
 *
 * Business Rules:
 * 1. Barber must exist
 * 2. Barber must be active to deactivate
 * 3. Emits BarberDeactivatedEvent
 * 4. Note: This does NOT cancel existing appointments
 *    (that should be handled separately if needed)
 *
 * This deactivates a barber, preventing new appointments.
 */
export class DeactivateBarberUseCase {
  constructor(private readonly barberRepository: IBarberRepository) {}

  /**
   * Execute the use case
   *
   * @param dto - Input data transfer object
   * @returns Result with deactivated Barber entity
   */
  async execute(dto: DeactivateBarberDTO): Promise<Result<Barber>> {
    // 1. Load barber
    const barberId = BarberId.create(dto.barberId)
    const barber = await this.barberRepository.findById(barberId)

    if (!barber) {
      return Result.fail<Barber>('Barber not found')
    }

    // 2. Deactivate barber
    const deactivateResult = barber.deactivate()
    if (deactivateResult.isFailure) {
      return Result.fail<Barber>(deactivateResult.error!)
    }

    // 3. Persist changes
    try {
      await this.barberRepository.save(barber)
    } catch (error) {
      return Result.fail<Barber>('Failed to deactivate barber')
    }

    // 4. Return success
    // Note: The reason is passed for potential event handling
    // but not stored on the entity (could be added to event if needed)
    return Result.ok<Barber>(barber)
  }
}
