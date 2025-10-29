import { Result } from '@barbershop/domain/common/result'
import { Client } from '@barbershop/domain/entities/client.entity'
import { IClientRepository } from '@barbershop/domain/repositories/client.repository.interface'
import { Email } from '@barbershop/domain/value-objects/email.vo'
import { Phone } from '@barbershop/domain/value-objects/phone.vo'
import { ClientPreferences } from '@barbershop/domain/value-objects/client-preferences.vo'

/**
 * Input DTO for RegisterClientUseCase
 */
export interface RegisterClientDTO {
  firstName: string
  lastName: string
  email: string
  phone: string
  preferences?: {
    language?: 'es' | 'en'
    receivePromotions?: boolean
    receiveReminders?: boolean
    preferredContactMethod?: 'email' | 'sms' | 'whatsapp'
  }
  notes?: string
}

/**
 * Use Case: Register Client
 *
 * Business Rules:
 * 1. Email must be unique
 * 2. Phone must be unique
 * 3. First and last name required (2-50 characters)
 * 4. Valid email format
 * 5. Valid phone format
 * 6. Default preferences if not provided
 *
 * This registers a new client in the system.
 */
export class RegisterClientUseCase {
  constructor(private readonly clientRepository: IClientRepository) {}

  /**
   * Execute the use case
   *
   * @param dto - Input data transfer object
   * @returns Result with created Client entity
   */
  async execute(dto: RegisterClientDTO): Promise<Result<Client>> {
    // 1. Validate email uniqueness
    const emailResult = Email.create(dto.email)
    if (emailResult.isFailure) {
      return Result.fail<Client>(emailResult.error!)
    }

    const existingByEmail = await this.clientRepository.findByEmail(emailResult.value)
    if (existingByEmail) {
      return Result.fail<Client>('A client with this email already exists')
    }

    // 2. Validate phone uniqueness
    const phoneResult = Phone.create(dto.phone)
    if (phoneResult.isFailure) {
      return Result.fail<Client>(phoneResult.error!)
    }

    const existingByPhone = await this.clientRepository.findByPhone(phoneResult.value)
    if (existingByPhone) {
      return Result.fail<Client>('A client with this phone already exists')
    }

    // 3. Create preferences value object if provided
    let preferences: ClientPreferences | undefined
    if (dto.preferences) {
      const preferencesResult = ClientPreferences.create(dto.preferences)
      if (preferencesResult.isFailure) {
        return Result.fail<Client>(preferencesResult.error!)
      }
      preferences = preferencesResult.value
    }

    // 4. Create client entity
    const clientResult = Client.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: emailResult.value,
      phone: phoneResult.value,
      preferences: preferences,
      notes: dto.notes
    })

    if (clientResult.isFailure) {
      return Result.fail<Client>(clientResult.error!)
    }

    const client = clientResult.value

    // 5. Persist client
    try {
      await this.clientRepository.save(client)
    } catch (error) {
      return Result.fail<Client>('Failed to save client to database')
    }

    // 6. Return success
    return Result.ok<Client>(client)
  }
}
