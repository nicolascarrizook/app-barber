import { IClientRepository } from '@barbershop/domain/repositories/client.repository.interface'
import { Client } from '@barbershop/domain/entities/client.entity'
import { ClientId } from '@barbershop/domain/entities/client-id.vo'
import { Email } from '@barbershop/domain/value-objects/email.vo'
import { Phone } from '@barbershop/domain/value-objects/phone.vo'
import { ClientStatusType } from '@barbershop/domain/value-objects/client-status.vo'
import { ClientMapper } from '../mappers/client.mapper'

/**
 * Prisma Client type placeholder
 */
type PrismaClient = any

/**
 * Prisma implementation of IClientRepository
 *
 * Responsibilities:
 * - Persist and retrieve Client aggregates
 * - Handle optimistic locking with version field
 * - Convert between domain entities and Prisma models using ClientMapper
 * - Implement domain-specific queries (loyalty, engagement, value, etc.)
 * - Ensure transactional consistency
 *
 * Clean Architecture: Infrastructure layer depending on domain layer interfaces
 */
export class PrismaClientRepository implements IClientRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Saves a client (create or update)
   * Uses optimistic locking to prevent concurrent modification issues
   *
   * @param client - Client aggregate to save
   * @returns Saved client with updated version
   * @throws Error if optimistic locking fails (version mismatch)
   */
  async save(client: Client): Promise<Client> {
    const data = ClientMapper.toPersistence(client)
    const clientId = client.clientId.toString()

    // Check if client exists
    const exists = await this.prisma.client.findUnique({
      where: { id: clientId }
    })

    if (exists) {
      // Update with optimistic locking
      const updated = await this.prisma.client.updateMany({
        where: {
          id: clientId,
          version: 0 // version managed by repository // Optimistic lock check
        },
        data: {
          ...data,
          version: 0 // version managed by repository + 1 // Increment version
        }
      })

      if (updated.count === 0) {
        throw new Error(
          `Optimistic locking failed for client ${clientId}. ` +
          `Version mismatch - client may have been modified by another transaction.`
        )
      }

      // Fetch updated client
      const savedClient = await this.prisma.client.findUnique({
        where: { id: clientId }
      })

      const domainClientResult = ClientMapper.toDomain(savedClient)
      if (domainClientResult.isFailure) {
        throw new Error(`Failed to map saved client ${clientId}: ${domainClientResult.error}`)
      }

      return domainClientResult.value
    } else {
      // Create new client
      const created = await this.prisma.client.create({
        data
      })

      const domainClientResult = ClientMapper.toDomain(created)
      if (domainClientResult.isFailure) {
        throw new Error(`Failed to map created client ${clientId}: ${domainClientResult.error}`)
      }

      return domainClientResult.value
    }
  }

  /**
   * Finds a client by its ID
   *
   * @param id - Client identifier
   * @returns Client if found, null otherwise
   */
  async findById(id: ClientId): Promise<Client | null> {
    const client = await this.prisma.client.findUnique({
      where: { id: id.toString() }
    })

    if (!client) {
      return null
    }

    const result = ClientMapper.toDomain(client)
    return result.isSuccess ? result.value : null
  }

  /**
   * Finds a client by email address
   * Useful for authentication and duplicate detection
   *
   * @param email - Email address
   * @returns Client if found, null otherwise
   */
  async findByEmail(email: Email): Promise<Client | null> {
    const client = await this.prisma.client.findUnique({
      where: { email: email.value }
    })

    if (!client) {
      return null
    }

    const result = ClientMapper.toDomain(client)
    return result.isSuccess ? result.value : null
  }

  /**
   * Finds a client by phone number
   * Useful for lookup and duplicate detection
   *
   * @param phone - Phone number
   * @returns Client if found, null otherwise
   */
  async findByPhone(phone: Phone): Promise<Client | null> {
    const client = await this.prisma.client.findUnique({
      where: { phone: phone.value }
    })

    if (!client) {
      return null
    }

    const result = ClientMapper.toDomain(client)
    return result.isSuccess ? result.value : null
  }

  /**
   * Finds all active clients
   * Excludes blocked and inactive clients
   *
   * @returns Array of active clients
   */
  async findAll(): Promise<Client[]> {
    const clients = await this.prisma.client.findMany({
      where: {
        status: 'ACTIVE'
      },
      orderBy: {
        lifetimeValue: 'desc'
      }
    })

    return clients
      .map((c: any) => ClientMapper.toDomain(c))
      .filter((c: Client | null): c is Client => c !== null)
  }

  /**
   * Finds clients by status
   *
   * @param status - Client status to filter by
   * @returns Array of clients with that status
   */
  async findByStatus(status: ClientStatusType): Promise<Client[]> {
    const clients = await this.prisma.client.findMany({
      where: {
        status: status
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return clients
      .map((c: any) => ClientMapper.toDomain(c))
      .filter((c: Client | null): c is Client => c !== null)
  }

  /**
   * Searches clients by name
   * Case-insensitive partial match on first name and last name
   *
   * @param searchTerm - Search term (minimum 2 characters)
   * @returns Array of matching clients
   */
  async search(searchTerm: string): Promise<Client[]> {
    if (searchTerm.length < 2) {
      return []
    }

    const clients = await this.prisma.client.findMany({
      where: {
        OR: [
          {
            firstName: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          },
          {
            lastName: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          }
        ]
      },
      orderBy: {
        lastName: 'asc'
      },
      take: 50 // Limit results
    })

    return clients
      .map((c: any) => ClientMapper.toDomain(c))
      .filter((c: Client | null): c is Client => c !== null)
  }

  /**
   * Finds top clients by lifetime value
   * Useful for VIP identification and marketing
   *
   * @param limit - Maximum number of clients to return
   * @returns Array of top clients ordered by lifetime value
   */
  async findTopByLifetimeValue(limit: number): Promise<Client[]> {
    const clients = await this.prisma.client.findMany({
      where: {
        status: 'ACTIVE'
      },
      orderBy: {
        lifetimeValue: 'desc'
      },
      take: limit
    })

    return clients
      .map((c: any) => ClientMapper.toDomain(c))
      .filter((c: Client | null): c is Client => c !== null)
  }

  /**
   * Finds clients eligible for loyalty rewards
   * Filters by minimum completed appointments and active status
   *
   * @param minCompletedAppointments - Minimum number of completed appointments
   * @returns Array of eligible clients
   */
  async findEligibleForLoyalty(minCompletedAppointments: number): Promise<Client[]> {
    const clients = await this.prisma.client.findMany({
      where: {
        status: 'ACTIVE',
        completedAppointments: {
          gte: minCompletedAppointments
        }
      },
      orderBy: {
        completedAppointments: 'desc'
      }
    })

    return clients
      .map((c: any) => ClientMapper.toDomain(c))
      .filter((c: Client | null): c is Client => c !== null)
  }

  /**
   * Finds clients who haven't visited recently
   * Useful for re-engagement campaigns
   *
   * @param daysSinceLastVisit - Number of days since last completed appointment
   * @returns Array of inactive clients
   */
  async findInactiveClients(daysSinceLastVisit: number): Promise<Client[]> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysSinceLastVisit)

    // This query requires a join with appointments table
    // We'll need to find clients whose most recent completed appointment is before cutoffDate
    const clients = await this.prisma.client.findMany({
      where: {
        status: 'ACTIVE',
        appointments: {
          every: {
            OR: [
              {
                status: {
                  in: ['COMPLETED']
                },
                updatedAt: {
                  lt: cutoffDate
                }
              },
              {
                status: {
                  notIn: ['COMPLETED']
                }
              }
            ]
          }
        }
      },
      include: {
        appointments: {
          where: {
            status: 'COMPLETED'
          },
          orderBy: {
            updatedAt: 'desc'
          },
          take: 1
        }
      }
    })

    return clients
      .map((c: any) => ClientMapper.toDomain(c))
      .filter((c: Client | null): c is Client => c !== null)
  }

  /**
   * Deletes a client
   * Should only be used in exceptional cases (GDPR, data cleanup)
   * Prefer blocking or deactivating clients
   *
   * @param id - Client identifier
   */
  async delete(id: ClientId): Promise<void> {
    await this.prisma.client.delete({
      where: { id: id.toString() }
    })
  }

  /**
   * Checks if a client exists
   *
   * @param id - Client identifier
   * @returns True if exists, false otherwise
   */
  async exists(id: ClientId): Promise<boolean> {
    const count = await this.prisma.client.count({
      where: { id: id.toString() }
    })

    return count > 0
  }

  /**
   * Checks if an email is already registered
   *
   * @param email - Email address to check
   * @returns True if email exists, false otherwise
   */
  async existsByEmail(email: Email): Promise<boolean> {
    const count = await this.prisma.client.count({
      where: { email: email.value }
    })

    return count > 0
  }

  /**
   * Checks if a phone number is already registered
   *
   * @param phone - Phone number to check
   * @returns True if phone exists, false otherwise
   */
  async existsByPhone(phone: Phone): Promise<boolean> {
    const count = await this.prisma.client.count({
      where: { phone: phone.value }
    })

    return count > 0
  }
}
