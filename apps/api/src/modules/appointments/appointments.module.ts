import { Module } from '@nestjs/common'

// Controller
import { AppointmentsController } from './appointments.controller'

// Use Cases
import { CreateAppointmentUseCase } from '@barbershop/application/use-cases/appointment/create-appointment.use-case'
import { CancelAppointmentUseCase } from '@barbershop/application/use-cases/appointment/cancel-appointment.use-case'
import { ConfirmAppointmentUseCase } from '@barbershop/application/use-cases/appointment/confirm-appointment.use-case'
import { CompleteAppointmentUseCase } from '@barbershop/application/use-cases/appointment/complete-appointment.use-case'
import { RescheduleAppointmentUseCase } from '@barbershop/application/use-cases/appointment/reschedule-appointment.use-case'
import { StartAppointmentUseCase } from '@barbershop/application/use-cases/appointment/start-appointment.use-case'
import { MarkNoShowUseCase } from '@barbershop/application/use-cases/appointment/mark-no-show.use-case'
import { FindAppointmentsByClientUseCase } from '@barbershop/application/use-cases/appointment/find-appointments-by-client.use-case'
import { FindAppointmentsByBarberUseCase } from '@barbershop/application/use-cases/appointment/find-appointments-by-barber.use-case'

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
 * Appointments Module
 *
 * Configures dependency injection for appointment management:
 * - Controllers: HTTP endpoint handling
 * - Use Cases: Business logic orchestration
 * - Repositories: Data persistence
 *
 * @module AppointmentsModule
 */
@Module({
  controllers: [AppointmentsController],
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

    // Use Cases - Register all appointment use cases
    {
      provide: CreateAppointmentUseCase,
      useFactory: (
        appointmentRepo: IAppointmentRepository,
        barberRepo: IBarberRepository,
        serviceRepo: IServiceRepository
      ) => {
        return new CreateAppointmentUseCase(
          appointmentRepo,
          barberRepo,
          serviceRepo
        )
      },
      inject: ['IAppointmentRepository', 'IBarberRepository', 'IServiceRepository']
    },
    {
      provide: CancelAppointmentUseCase,
      useFactory: (appointmentRepo: IAppointmentRepository) => {
        return new CancelAppointmentUseCase(appointmentRepo)
      },
      inject: ['IAppointmentRepository']
    },
    {
      provide: ConfirmAppointmentUseCase,
      useFactory: (appointmentRepo: IAppointmentRepository) => {
        return new ConfirmAppointmentUseCase(appointmentRepo)
      },
      inject: ['IAppointmentRepository']
    },
    {
      provide: CompleteAppointmentUseCase,
      useFactory: (appointmentRepo: IAppointmentRepository) => {
        return new CompleteAppointmentUseCase(appointmentRepo)
      },
      inject: ['IAppointmentRepository']
    },
    {
      provide: RescheduleAppointmentUseCase,
      useFactory: (
        appointmentRepo: IAppointmentRepository,
        barberRepo: IBarberRepository
      ) => {
        return new RescheduleAppointmentUseCase(appointmentRepo, barberRepo)
      },
      inject: ['IAppointmentRepository', 'IBarberRepository']
    },
    {
      provide: StartAppointmentUseCase,
      useFactory: (appointmentRepo: IAppointmentRepository) => {
        return new StartAppointmentUseCase(appointmentRepo)
      },
      inject: ['IAppointmentRepository']
    },
    {
      provide: MarkNoShowUseCase,
      useFactory: (appointmentRepo: IAppointmentRepository) => {
        return new MarkNoShowUseCase(appointmentRepo)
      },
      inject: ['IAppointmentRepository']
    },
    {
      provide: FindAppointmentsByClientUseCase,
      useFactory: (appointmentRepo: IAppointmentRepository) => {
        return new FindAppointmentsByClientUseCase(appointmentRepo)
      },
      inject: ['IAppointmentRepository']
    },
    {
      provide: FindAppointmentsByBarberUseCase,
      useFactory: (appointmentRepo: IAppointmentRepository) => {
        return new FindAppointmentsByBarberUseCase(appointmentRepo)
      },
      inject: ['IAppointmentRepository']
    }
  ],
  exports: [
    // Export use cases for potential reuse in other modules
    CreateAppointmentUseCase,
    CancelAppointmentUseCase,
    ConfirmAppointmentUseCase,
    CompleteAppointmentUseCase,
    RescheduleAppointmentUseCase,
    StartAppointmentUseCase,
    MarkNoShowUseCase,
    FindAppointmentsByClientUseCase,
    FindAppointmentsByBarberUseCase
  ]
})
export class AppointmentsModule {}
