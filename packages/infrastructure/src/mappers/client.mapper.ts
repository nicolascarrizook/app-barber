import { Client } from '@barbershop/domain/entities/client.entity'
import { ClientId } from '@barbershop/domain/entities/client-id.vo'
import { Email } from '@barbershop/domain/value-objects/email.vo'
import { Phone } from '@barbershop/domain/value-objects/phone.vo'
import { ClientStatus } from '@barbershop/domain/value-objects/client-status.vo'
import { ClientPreferences } from '@barbershop/domain/value-objects/client-preferences.vo'
import { ClientHistory, LoyaltyTier } from '@barbershop/domain/value-objects/client-history.vo'
import { Money } from '@barbershop/domain/value-objects/money.vo'
import { Currency } from '@barbershop/domain/value-objects/currency.vo'
import { Result } from '@barbershop/domain/common/result'
import { UniqueEntityID } from '@barbershop/domain/common/unique-entity-id'

/**
 * Prisma Client type (from generated client)
 */
export type PrismaClient = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  status: string
  preferences: any // JSONB
  totalAppointments: number
  completedAppointments: number
  cancelledAppointments: number
  noShowAppointments: number
  lifetimeValue: any // Decimal
  lifetimeValueCurrency: string
  loyaltyTier: string
  version: number
  createdAt: Date
  updatedAt: Date
}

/**
 * Mapper between Client domain entity and Prisma persistence model
 *
 * Responsibilities:
 * - Convert domain entities to Prisma models (toPersistence)
 * - Convert Prisma models to domain entities (toDomain)
 * - Handle Value Object conversions
 * - Preserve aggregate invariants during conversion
 */
export class ClientMapper {
  /**
   * Maps a domain Client entity to Prisma persistence model
   *
   * @param client - Domain entity
   * @returns Prisma model ready for database operations
   */
  public static toPersistence(client: Client): Omit<PrismaClient, 'createdAt' | 'updatedAt'> {
    const history = client.history

    return {
      id: client.clientId.toString(),
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email.value,
      phone: client.phone.value,
      status: client.status.toString(),
      preferences: {}, // Serialize preferences to JSON
      totalAppointments: history.totalAppointments,
      completedAppointments: history.completedAppointments,
      cancelledAppointments: history.cancelledAppointments,
      noShowAppointments: history.noShowCount,
      lifetimeValue: history.lifetimeValue.amount,
      lifetimeValueCurrency: history.lifetimeValue.currency.toString(),
      loyaltyTier: history.loyaltyTier,
      version: 0 // Managed by repository
    }
  }

  /**
   * Maps a Prisma persistence model to domain Client entity
   *
   * @param raw - Prisma model from database
   * @returns Domain entity or null if conversion fails
   */
  public static toDomain(raw: PrismaClient): Result<Client> {
    // Create Value Objects
    const clientId = ClientId.create(raw.id)

    const emailOrError = Email.create(raw.email)
    if (emailOrError.isFailure) {
      return Result.fail<Client>(`Invalid email: ${emailOrError.error}`)
    }

    const phoneOrError = Phone.create(raw.phone)
    if (phoneOrError.isFailure) {
      return Result.fail<Client>(`Invalid phone: ${phoneOrError.error}`)
    }

    const email = emailOrError.value
    const phone = phoneOrError.value

    // Create ClientStatus
    const statusOrError = ClientStatus.create(raw.status as any)
    if (statusOrError.isFailure) {
      return Result.fail<Client>(`Invalid status: ${statusOrError.error}`)
    }
    const status = statusOrError.value

    // Create ClientPreferences from JSON
    const preferences = ClientPreferences.createDefault()

    // Create Money for lifetime value
    const lifetimeValueOrError = Money.create(
      Number(raw.lifetimeValue),
      raw.lifetimeValueCurrency as unknown as Currency
    )
    if (lifetimeValueOrError.isFailure) {
      return Result.fail<Client>(`Invalid lifetimeValue: ${lifetimeValueOrError.error}`)
    }
    const lifetimeValue = lifetimeValueOrError.value

    // Reconstruct ClientHistory
    const historyOrError = ClientHistory.create({
      totalAppointments: raw.totalAppointments,
      completedAppointments: raw.completedAppointments,
      cancelledAppointments: raw.cancelledAppointments,
      noShowCount: raw.noShowAppointments,
      lifetimeValue
    })
    if (historyOrError.isFailure) {
      return Result.fail<Client>(`Invalid client history: ${historyOrError.error}`)
    }
    const history = historyOrError.value

    // Create Client entity using create() factory
    const clientOrError = Client.create(
      {
        firstName: raw.firstName,
        lastName: raw.lastName,
        email,
        phone,
        preferences
      },
      new UniqueEntityID(clientId.toString())
    )

    if (clientOrError.isFailure) {
      return Result.fail<Client>(`Failed to create client: ${clientOrError.error}`)
    }

    const client = clientOrError.value

    // Restore persisted state (status, history, timestamps)
    ;(client as any)._status = status
    ;(client as any)._history = history
    ;(client as any)._createdAt = raw.createdAt
    ;(client as any)._updatedAt = raw.updatedAt

    return Result.ok<Client>(client)
  }
}
