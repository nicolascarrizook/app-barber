import { Module } from '@nestjs/common'

// Controller
import { BarbersController } from './barbers.controller'

// Use Cases
import { CreateBarberUseCase } from '@barbershop/application/use-cases/barber/create-barber.use-case'
import { UpdateBarberProfileUseCase } from '@barbershop/application/use-cases/barber/update-barber-profile.use-case'
import { SetWorkingHoursUseCase } from '@barbershop/application/use-cases/barber/set-working-hours.use-case'
import { ActivateBarberUseCase } from '@barbershop/application/use-cases/barber/activate-barber.use-case'
import { DeactivateBarberUseCase } from '@barbershop/application/use-cases/barber/deactivate-barber.use-case'
import { AddBarberSkillUseCase } from '@barbershop/application/use-cases/barber/add-barber-skill.use-case'

// Repositories
import { PrismaBarberRepository } from '@barbershop/infrastructure/repositories/prisma-barber.repository'

// Domain Interfaces
import { IBarberRepository } from '@barbershop/domain/repositories/barber.repository.interface'

// Database
import { PrismaService } from '../database/prisma.service'

/**
 * Barbers Module
 *
 * Configures dependency injection for barber management:
 * - Controllers: HTTP endpoint handling
 * - Use Cases: Business logic orchestration
 * - Repositories: Data persistence
 *
 * @module BarbersModule
 */
@Module({
  controllers: [BarbersController],
  providers: [
    // Prisma Service
    PrismaService,

    // Repositories
    {
      provide: 'IBarberRepository',
      useClass: PrismaBarberRepository
    },

    // Use Cases
    {
      provide: CreateBarberUseCase,
      useFactory: (barberRepo: IBarberRepository) => {
        return new CreateBarberUseCase(barberRepo)
      },
      inject: ['IBarberRepository']
    },
    {
      provide: UpdateBarberProfileUseCase,
      useFactory: (barberRepo: IBarberRepository) => {
        return new UpdateBarberProfileUseCase(barberRepo)
      },
      inject: ['IBarberRepository']
    },
    {
      provide: SetWorkingHoursUseCase,
      useFactory: (barberRepo: IBarberRepository) => {
        return new SetWorkingHoursUseCase(barberRepo)
      },
      inject: ['IBarberRepository']
    },
    {
      provide: ActivateBarberUseCase,
      useFactory: (barberRepo: IBarberRepository) => {
        return new ActivateBarberUseCase(barberRepo)
      },
      inject: ['IBarberRepository']
    },
    {
      provide: DeactivateBarberUseCase,
      useFactory: (barberRepo: IBarberRepository) => {
        return new DeactivateBarberUseCase(barberRepo)
      },
      inject: ['IBarberRepository']
    },
    {
      provide: AddBarberSkillUseCase,
      useFactory: (barberRepo: IBarberRepository) => {
        return new AddBarberSkillUseCase(barberRepo)
      },
      inject: ['IBarberRepository']
    },
    // Export IBarberRepository for injection in controller
    {
      provide: IBarberRepository,
      useExisting: 'IBarberRepository'
    }
  ],
  exports: [
    CreateBarberUseCase,
    UpdateBarberProfileUseCase,
    SetWorkingHoursUseCase,
    ActivateBarberUseCase,
    DeactivateBarberUseCase,
    AddBarberSkillUseCase
  ]
})
export class BarbersModule {}
