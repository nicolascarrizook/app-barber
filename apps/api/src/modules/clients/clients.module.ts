import { Module } from '@nestjs/common'

// Controller
import { ClientsController } from './clients.controller'

// Use Cases
import { RegisterClientUseCase } from '@barbershop/application/use-cases/client/register-client.use-case'
import { UpdateClientProfileUseCase } from '@barbershop/application/use-cases/client/update-client-profile.use-case'
import { UpdateClientPreferencesUseCase } from '@barbershop/application/use-cases/client/update-client-preferences.use-case'
import { AddLoyaltyPointsUseCase } from '@barbershop/application/use-cases/client/add-loyalty-points.use-case'
import { RedeemLoyaltyPointsUseCase } from '@barbershop/application/use-cases/client/redeem-loyalty-points.use-case'

// Repositories
import { PrismaClientRepository } from '@barbershop/infrastructure/repositories/prisma-client.repository'

// Domain Interfaces
import { IClientRepository } from '@barbershop/domain/repositories/client.repository.interface'

// Database
import { PrismaService } from '../database/prisma.service'

/**
 * Clients Module
 *
 * Configures dependency injection for client management:
 * - Controllers: HTTP endpoint handling
 * - Use Cases: Business logic orchestration
 * - Repositories: Data persistence
 *
 * @module ClientsModule
 */
@Module({
  controllers: [ClientsController],
  providers: [
    // Prisma Service
    PrismaService,

    // Repositories
    {
      provide: 'IClientRepository',
      useClass: PrismaClientRepository
    },

    // Use Cases
    {
      provide: RegisterClientUseCase,
      useFactory: (clientRepo: IClientRepository) => {
        return new RegisterClientUseCase(clientRepo)
      },
      inject: ['IClientRepository']
    },
    {
      provide: UpdateClientProfileUseCase,
      useFactory: (clientRepo: IClientRepository) => {
        return new UpdateClientProfileUseCase(clientRepo)
      },
      inject: ['IClientRepository']
    },
    {
      provide: UpdateClientPreferencesUseCase,
      useFactory: (clientRepo: IClientRepository) => {
        return new UpdateClientPreferencesUseCase(clientRepo)
      },
      inject: ['IClientRepository']
    },
    {
      provide: AddLoyaltyPointsUseCase,
      useFactory: (clientRepo: IClientRepository) => {
        return new AddLoyaltyPointsUseCase(clientRepo)
      },
      inject: ['IClientRepository']
    },
    {
      provide: RedeemLoyaltyPointsUseCase,
      useFactory: (clientRepo: IClientRepository) => {
        return new RedeemLoyaltyPointsUseCase(clientRepo)
      },
      inject: ['IClientRepository']
    },
    // Export IClientRepository for injection in controller
    {
      provide: IClientRepository,
      useExisting: 'IClientRepository'
    }
  ],
  exports: [
    RegisterClientUseCase,
    UpdateClientProfileUseCase,
    UpdateClientPreferencesUseCase,
    AddLoyaltyPointsUseCase,
    RedeemLoyaltyPointsUseCase
  ]
})
export class ClientsModule {}
