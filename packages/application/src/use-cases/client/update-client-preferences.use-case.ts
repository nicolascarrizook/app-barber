import { Result } from '@barbershop/domain/common/result'
import { Client } from '@barbershop/domain/entities/client.entity'
import { ClientId } from '@barbershop/domain/entities/client-id.vo'
import { IClientRepository } from '@barbershop/domain/repositories/client.repository.interface'
import { ClientPreferences } from '@barbershop/domain/value-objects/client-preferences.vo'

/**
 * Input DTO for UpdateClientPreferencesUseCase
 */
export interface UpdateClientPreferencesDTO {
  clientId: string
  language?: 'es' | 'en'
  receivePromotions?: boolean
  receiveReminders?: boolean
  preferredContactMethod?: 'email' | 'sms' | 'whatsapp'
}

/**
 * Use Case: Update Client Preferences
 *
 * Business Rules:
 * 1. Client must exist
 * 2. Client must be active
 * 3. Valid preference values
 * 4. Emits ClientPreferencesUpdatedEvent
 *
 * This updates the client's communication and notification preferences.
 */
export class UpdateClientPreferencesUseCase {
  constructor(private readonly clientRepository: IClientRepository) {}

  /**
   * Execute the use case
   *
   * @param dto - Input data transfer object
   * @returns Result with updated Client entity
   */
  async execute(dto: UpdateClientPreferencesDTO): Promise<Result<Client>> {
    // 1. Load client
    const clientId = ClientId.create(dto.clientId)
    const client = await this.clientRepository.findById(clientId)

    if (!client) {
      return Result.fail<Client>('Client not found')
    }

    // 2. Create new preferences (merging with existing)
    const currentPrefs = client.preferences
    const preferencesData = {
      language: dto.language ?? currentPrefs.language,
      receivePromotions: dto.receivePromotions ?? currentPrefs.receivePromotions,
      receiveReminders: dto.receiveReminders ?? currentPrefs.receiveReminders,
      preferredContactMethod: dto.preferredContactMethod ?? currentPrefs.preferredContactMethod
    }

    const preferencesResult = ClientPreferences.create(preferencesData)
    if (preferencesResult.isFailure) {
      return Result.fail<Client>(preferencesResult.error!)
    }

    // 3. Update client preferences
    const updateResult = client.updatePreferences(preferencesResult.value)
    if (updateResult.isFailure) {
      return Result.fail<Client>(updateResult.error!)
    }

    // 4. Persist changes
    try {
      await this.clientRepository.save(client)
    } catch (error) {
      return Result.fail<Client>('Failed to save client preferences')
    }

    // 5. Return success
    return Result.ok<Client>(client)
  }
}
