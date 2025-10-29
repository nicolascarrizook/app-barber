import { Result } from '@barbershop/domain/common/result'
import { Client } from '@barbershop/domain/entities/client.entity'
import { ClientId } from '@barbershop/domain/entities/client-id.vo'
import { IClientRepository } from '@barbershop/domain/repositories/client.repository.interface'
import { Phone } from '@barbershop/domain/value-objects/phone.vo'

/**
 * Input DTO for UpdateClientProfileUseCase
 */
export interface UpdateClientProfileDTO {
  clientId: string
  firstName?: string
  lastName?: string
  phone?: string
  notes?: string
}

/**
 * Use Case: Update Client Profile
 *
 * Business Rules:
 * 1. Client must exist
 * 2. If phone is updated, must be unique
 * 3. First and last name must be valid if provided (2-50 characters)
 * 4. Cannot update email (would require identity verification)
 *
 * This updates basic client information.
 */
export class UpdateClientProfileUseCase {
  constructor(private readonly clientRepository: IClientRepository) {}

  /**
   * Execute the use case
   *
   * @param dto - Input data transfer object
   * @returns Result with updated Client entity
   */
  async execute(dto: UpdateClientProfileDTO): Promise<Result<Client>> {
    // 1. Load client
    const clientId = ClientId.create(dto.clientId)
    const client = await this.clientRepository.findById(clientId)

    if (!client) {
      return Result.fail<Client>('Client not found')
    }

    // 2. Validate phone uniqueness if being updated
    let phone: Phone | undefined
    if (dto.phone && dto.phone !== client.phone.value) {
      const phoneResult = Phone.create(dto.phone)
      if (phoneResult.isFailure) {
        return Result.fail<Client>(phoneResult.error!)
      }

      const existingByPhone = await this.clientRepository.findByPhone(phoneResult.value)
      if (existingByPhone && !existingByPhone.clientId.equals(clientId)) {
        return Result.fail<Client>('A client with this phone already exists')
      }

      phone = phoneResult.value
    }

    // 3. Update client entity
    const updateResult = client.updateProfile({
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: phone,
      notes: dto.notes
    })

    if (updateResult.isFailure) {
      return Result.fail<Client>(updateResult.error!)
    }

    // 4. Persist changes
    try {
      await this.clientRepository.save(client)
    } catch (error) {
      return Result.fail<Client>('Failed to save client updates')
    }

    // 5. Return success
    return Result.ok<Client>(client)
  }
}
