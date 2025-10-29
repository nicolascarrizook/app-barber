import { Module } from '@nestjs/common'

// Controller
import { AvailabilityController } from './availability.controller'

// Use Case
import { GetAvailableSlotsUseCase } from '@barbershop/application/use-cases/availability/get-available-slots.use-case'

// Repositories
import { PrismaAppointmentRepository } from '@barbershop/infrastructure/repositories/prisma-appointment.repository'
import { PrismaBarberRepository } from '@barbershop/infrastructure/repositories/prisma-barber.repository'
import { PrismaServiceRepository } from '@barbershop/infrastructure/repositories/prisma-service.repository'

// Domain Interfaces
import { IAppointmentRepository } from '@barbershop/domain/repositories/appointment.repository.interface'
import { IBarberRepository } from '@barbershop/domain/repositories/barber.repository.interface'
import { IServiceRepository } from '@barbershop/domain/repositories/service.repository.interface'

// Database
import { PrismaService } from '../database/prisma.service'

/**
 * Availability Module
 *
 * Configures dependency injection for availability checking:
 * - Controller: HTTP endpoint handling
 * - Use Case: Available slots calculation
 * - Repositories: Data access for appointments, barbers, services
 *
 * @module AvailabilityModule
 */
@Module({
  controllers: [AvailabilityController],
  providers: [
    // Prisma Service (provided by DatabaseModule globally)
    PrismaService,

    // Repositories - Map interfaces to implementations
    {
      provide: 'IAppointmentRepository',
      useClass: PrismaAppointmentRepository
    },
    {
      provide: 'IBarberRepository',
      useClass: PrismaBarberRepository
    },
    {
      provide: 'IServiceRepository',
      useClass: PrismaServiceRepository
    },

    // Use Case
    {
      provide: GetAvailableSlotsUseCase,
      useFactory: (
        appointmentRepo: IAppointmentRepository,
        barberRepo: IBarberRepository,
        serviceRepo: IServiceRepository
      ) => {
        return new GetAvailableSlotsUseCase(
          appointmentRepo,
          barberRepo,
          serviceRepo
        )
      },
      inject: ['IAppointmentRepository', 'IBarberRepository', 'IServiceRepository']
    }
  ],
  exports: [GetAvailableSlotsUseCase]
})
export class AvailabilityModule {}
