import { Result } from '@barbershop/domain/common/result'
import { Client } from '@barbershop/domain/entities/client.entity'
import { ClientId } from '@barbershop/domain/entities/client-id.vo'
import { IClientRepository } from '@barbershop/domain/repositories/client.repository.interface'

/**
 * Input DTO for AddLoyaltyPointsUseCase
 */
export interface AddLoyaltyPointsDTO {
  clientId: string
  points: number
  reason: string
}

/**
 * Use Case: Add Loyalty Points
 *
 * Business Rules:
 * 1. Client must exist
 * 2. Client must be active
 * 3. Points must be positive
 * 4. Reason is required for audit trail
 * 5. Automatically updates loyalty tier if threshold reached
 *
 * This awards loyalty points to a client.
 * Common triggers:
 * - Appointment completion
 * - Referral bonus
 * - Promotional campaigns
 */
export class AddLoyaltyPointsUseCase {
  constructor(private readonly clientRepository: IClientRepository) {}

  /**
   * Execute the use case
   *
   * @param dto - Input data transfer object
   * @returns Result with updated Client entity
   */
  async execute(dto: AddLoyaltyPointsDTO): Promise<Result<Client>> {
    // 1. Validate points
    if (dto.points <= 0) {
      return Result.fail<Client>('Points must be greater than 0')
    }

    if (!dto.reason || dto.reason.trim().length === 0) {
      return Result.fail<Client>('Reason is required')
    }

    // 2. Load client
    const clientId = ClientId.create(dto.clientId)
    const client = await this.clientRepository.findById(clientId)

    if (!client) {
      return Result.fail<Client>('Client not found')
    }

    // 3. Add loyalty points
    const addResult = client.addLoyaltyPoints(dto.points)
    if (addResult.isFailure) {
      return Result.fail<Client>(addResult.error!)
    }

    // 4. Persist changes
    try {
      await this.clientRepository.save(client)
    } catch (error) {
      return Result.fail<Client>('Failed to save loyalty points')
    }

    // 5. Return success
    return Result.ok<Client>(client)
  }
}
