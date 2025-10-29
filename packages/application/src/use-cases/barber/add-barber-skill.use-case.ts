import { Result } from '@barbershop/domain/common/result'
import { Barber } from '@barbershop/domain/entities/barber.entity'
import { BarberId } from '@barbershop/domain/entities/barber-id.vo'
import { IBarberRepository } from '@barbershop/domain/repositories/barber.repository.interface'
import { BarberSpecialties } from '@barbershop/domain/value-objects/barber-specialties.vo'

/**
 * Input DTO for AddBarberSkillUseCase
 */
export interface AddBarberSkillDTO {
  barberId: string
  specialty: string
}

/**
 * Use Case: Add Barber Skill
 *
 * Business Rules:
 * 1. Barber must exist
 * 2. Barber must be active to add skills
 * 3. Specialty must be valid
 * 4. Cannot add duplicate specialty
 *
 * This adds a new skill/specialty to the barber's capabilities.
 */
export class AddBarberSkillUseCase {
  constructor(private readonly barberRepository: IBarberRepository) {}

  /**
   * Execute the use case
   *
   * @param dto - Input data transfer object
   * @returns Result with updated Barber entity
   */
  async execute(dto: AddBarberSkillDTO): Promise<Result<Barber>> {
    // 1. Load barber
    const barberId = BarberId.create(dto.barberId)
    const barber = await this.barberRepository.findById(barberId)

    if (!barber) {
      return Result.fail<Barber>('Barber not found')
    }

    // 2. Get current specialties and add new one
    const currentSpecialties = barber.specialties.toStringArray()

    // Check if specialty already exists
    if (currentSpecialties.includes(dto.specialty)) {
      return Result.fail<Barber>('Barber already has this specialty')
    }

    const updatedSpecialties = [...currentSpecialties, dto.specialty]

    // 3. Create new specialties value object
    const specialtiesResult = BarberSpecialties.create(updatedSpecialties)
    if (specialtiesResult.isFailure) {
      return Result.fail<Barber>(specialtiesResult.error!)
    }

    // 4. Update barber specialties
    const updateResult = barber.updateSpecialties(specialtiesResult.value)
    if (updateResult.isFailure) {
      return Result.fail<Barber>(updateResult.error!)
    }

    // 5. Persist changes
    try {
      await this.barberRepository.save(barber)
    } catch (error) {
      return Result.fail<Barber>('Failed to save barber specialties')
    }

    // 6. Return success
    return Result.ok<Barber>(barber)
  }
}
