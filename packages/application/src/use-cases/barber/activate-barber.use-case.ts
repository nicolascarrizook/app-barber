import { Result } from '@barbershop/domain/common/result'
import { Barber } from '@barbershop/domain/entities/barber.entity'
import { BarberId } from '@barbershop/domain/entities/barber-id.vo'
import { IBarberRepository } from '@barbershop/domain/repositories/barber.repository.interface'

/**
 * Input DTO for ActivateBarberUseCase
 */
export interface ActivateBarberDTO {
  barberId: string
}

/**
 * Use Case: Activate Barber
 *
 * Business Rules:
 * 1. Barber must exist
 * 2. Barber must be inactive to activate
 * 3. Emits BarberActivatedEvent
 *
 * This activates a barber, allowing them to accept appointments.
 */
export class ActivateBarberUseCase {
  constructor(private readonly barberRepository: IBarberRepository) {}

  /**
   * Execute the use case
   *
   * @param dto - Input data transfer object
   * @returns Result with activated Barber entity
   */
  async execute(dto: ActivateBarberDTO): Promise<Result<Barber>> {
    // 1. Load barber
    const barberId = BarberId.create(dto.barberId)
    const barber = await this.barberRepository.findById(barberId)

    if (!barber) {
      return Result.fail<Barber>('Barber not found')
    }

    // 2. Activate barber
    const activateResult = barber.activate()
    if (activateResult.isFailure) {
      return Result.fail<Barber>(activateResult.error!)
    }

    // 3. Persist changes
    try {
      await this.barberRepository.save(barber)
    } catch (error) {
      return Result.fail<Barber>('Failed to activate barber')
    }

    // 4. Return success
    return Result.ok<Barber>(barber)
  }
}
