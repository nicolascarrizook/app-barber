import { Result } from '@barbershop/domain/common/result'
import { Client } from '@barbershop/domain/entities/client.entity'
import { ClientId } from '@barbershop/domain/entities/client-id.vo'
import { IClientRepository } from '@barbershop/domain/repositories/client.repository.interface'

/**
 * Input DTO for RedeemLoyaltyPointsUseCase
 */
export interface RedeemLoyaltyPointsDTO {
  clientId: string
  points: number
  reason: string
}

/**
 * Use Case: Redeem Loyalty Points
 *
 * Business Rules:
 * 1. Client must exist
 * 2. Client must be active
 * 3. Points must be positive
 * 4. Client must have enough points
 * 5. Reason is required for audit trail
 * 6. May update loyalty tier if points drop below threshold
 *
 * This redeems loyalty points from a client.
 * Common uses:
 * - Discount on appointment
 * - Gift redemption
 * - Special offers
 */
export class RedeemLoyaltyPointsUseCase {
  constructor(private readonly clientRepository: IClientRepository) {}

  /**
   * Execute the use case
   *
   * @param dto - Input data transfer object
   * @returns Result with updated Client entity
   */
  async execute(dto: RedeemLoyaltyPointsDTO): Promise<Result<Client>> {
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

    // 3. Verify client has enough points
    if (client.history.totalPoints < dto.points) {
      return Result.fail<Client>(
        `Insufficient loyalty points. Available: ${client.history.totalPoints}, Required: ${dto.points}`
      )
    }

    // 4. Redeem loyalty points
    const redeemResult = client.redeemLoyaltyPoints(dto.points)
    if (redeemResult.isFailure) {
      return Result.fail<Client>(redeemResult.error!)
    }

    // 5. Persist changes
    try {
      await this.clientRepository.save(client)
    } catch (error) {
      return Result.fail<Client>('Failed to save loyalty points redemption')
    }

    // 6. Return success
    return Result.ok<Client>(client)
  }
}
