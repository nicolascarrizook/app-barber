import { Result } from '@barbershop/domain/common/result'
import { Barber } from '@barbershop/domain/entities/barber.entity'
import { BarberId } from '@barbershop/domain/entities/barber-id.vo'
import { IBarberRepository } from '@barbershop/domain/repositories/barber.repository.interface'
import { BarberName } from '@barbershop/domain/value-objects/barber-name.vo'
import { Phone } from '@barbershop/domain/value-objects/phone.vo'

/**
 * Input DTO for UpdateBarberProfileUseCase
 */
export interface UpdateBarberProfileDTO {
  barberId: string
  firstName?: string
  lastName?: string
  phone?: string
  profileImageUrl?: string
  bio?: string
}

/**
 * Use Case: Update Barber Profile
 *
 * Business Rules:
 * 1. Barber must exist
 * 2. If phone is updated, must be unique
 * 3. Bio maximum 1000 characters
 * 4. Cannot update email (would require identity verification)
 *
 * This updates basic barber information.
 */
export class UpdateBarberProfileUseCase {
  constructor(private readonly barberRepository: IBarberRepository) {}

  /**
   * Execute the use case
   *
   * @param dto - Input data transfer object
   * @returns Result with updated Barber entity
   */
  async execute(dto: UpdateBarberProfileDTO): Promise<Result<Barber>> {
    // 1. Load barber
    const barberId = BarberId.create(dto.barberId)
    const barber = await this.barberRepository.findById(barberId)

    if (!barber) {
      return Result.fail<Barber>('Barber not found')
    }

    // 2. Validate phone uniqueness if being updated
    if (dto.phone && dto.phone !== barber.phone.value) {
      const existingByPhone = await this.barberRepository.findByPhone(dto.phone)
      if (existingByPhone && !existingByPhone.barberId.equals(barberId)) {
        return Result.fail<Barber>('A barber with this phone already exists')
      }
    }

    // 3. Create value objects for updates
    let name: BarberName | undefined
    if (dto.firstName || dto.lastName) {
      const nameResult = BarberName.create({
        firstName: dto.firstName || barber.name.firstName,
        lastName: dto.lastName || barber.name.lastName
      })
      if (nameResult.isFailure) {
        return Result.fail<Barber>(nameResult.error!)
      }
      name = nameResult.value
    }

    let phone: Phone | undefined
    if (dto.phone) {
      const phoneResult = Phone.create(dto.phone)
      if (phoneResult.isFailure) {
        return Result.fail<Barber>(phoneResult.error!)
      }
      phone = phoneResult.value
    }

    // 4. Update barber entity
    const updateResult = barber.updateInfo({
      name: name,
      phone: phone,
      profileImageUrl: dto.profileImageUrl,
      bio: dto.bio
    })

    if (updateResult.isFailure) {
      return Result.fail<Barber>(updateResult.error!)
    }

    // 5. Persist changes
    try {
      await this.barberRepository.save(barber)
    } catch (error) {
      return Result.fail<Barber>('Failed to save barber updates')
    }

    // 6. Return success
    return Result.ok<Barber>(barber)
  }
}
