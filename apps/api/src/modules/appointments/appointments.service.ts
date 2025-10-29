import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { CreateAppointmentDto } from './dto/create-appointment.dto'
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto'
import { CancelAppointmentDto } from './dto/cancel-appointment.dto'
import { AppointmentQueryDto } from './dto/appointment-query.dto'
import { AppointmentResponseDto } from './dto/appointment-response.dto'

// Use Cases
import { CreateAppointmentUseCase } from '@barbershop/application/use-cases/appointment/create-appointment.use-case'
import { CancelAppointmentUseCase } from '@barbershop/application/use-cases/appointment/cancel-appointment.use-case'
import { RescheduleAppointmentUseCase } from '@barbershop/application/use-cases/appointment/reschedule-appointment.use-case'
import { StartAppointmentUseCase } from '@barbershop/application/use-cases/appointment/start-appointment.use-case'
import { CompleteAppointmentUseCase } from '@barbershop/application/use-cases/appointment/complete-appointment.use-case'
import { MarkNoShowUseCase } from '@barbershop/application/use-cases/appointment/mark-no-show.use-case'
import { FindAppointmentsByBarberUseCase } from '@barbershop/application/use-cases/appointment/find-appointments-by-barber.use-case'
import { FindAppointmentsByClientUseCase } from '@barbershop/application/use-cases/appointment/find-appointments-by-client.use-case'

// Repositories
import { IAppointmentRepository } from '@barbershop/domain/repositories/appointment.repository.interface'
import { IBarberRepository } from '@barbershop/domain/repositories/barber.repository.interface'
import { IClientRepository } from '@barbershop/domain/repositories/client.repository.interface'
import { IServiceRepository } from '@barbershop/domain/repositories/service.repository.interface'

// Domain
import { AppointmentId } from '@barbershop/domain/entities/appointment-id.vo'
import { BarberId } from '@barbershop/domain/entities/barber-id.vo'
import { ClientId } from '@barbershop/domain/entities/client-id.vo'
import { Appointment } from '@barbershop/domain/entities/appointment.entity'

/**
 * Appointments Service
 *
 * Orchestrates business operations for appointments
 * Delegates to use cases and handles response transformation
 */
@Injectable()
export class AppointmentsService {
  constructor(
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly barberRepository: IBarberRepository,
    private readonly clientRepository: IClientRepository,
    private readonly serviceRepository: IServiceRepository
  ) {}

  /**
   * Create a new appointment
   */
  async create(createDto: CreateAppointmentDto): Promise<AppointmentResponseDto> {
    const useCase = new CreateAppointmentUseCase(
      this.appointmentRepository,
      this.barberRepository,
      this.clientRepository,
      this.serviceRepository
    )

    const result = await useCase.execute({
      barberId: createDto.barberId,
      clientId: createDto.clientId,
      serviceId: createDto.serviceId,
      startTime: new Date(createDto.startTime),
      notes: createDto.notes
    })

    if (result.isFailure) {
      throw new BadRequestException(result.error)
    }

    return this.toResponseDto(result.value)
  }

  /**
   * Find appointment by ID
   */
  async findById(id: string): Promise<AppointmentResponseDto> {
    const appointmentId = AppointmentId.create(id)
    const appointment = await this.appointmentRepository.findById(appointmentId)

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`)
    }

    return this.toResponseDto(appointment)
  }

  /**
   * Find appointments with filters
   */
  async find(query: AppointmentQueryDto): Promise<AppointmentResponseDto[]> {
    let appointments: Appointment[] = []

    if (query.barberId) {
      const useCase = new FindAppointmentsByBarberUseCase(this.appointmentRepository)
      const result = await useCase.execute({
        barberId: query.barberId,
        from: query.from ? new Date(query.from) : undefined,
        to: query.to ? new Date(query.to) : undefined
      })

      if (result.isFailure) {
        throw new BadRequestException(result.error)
      }

      appointments = result.value
    } else if (query.clientId) {
      const useCase = new FindAppointmentsByClientUseCase(this.appointmentRepository)
      const result = await useCase.execute({
        clientId: query.clientId,
        from: query.from ? new Date(query.from) : undefined,
        to: query.to ? new Date(query.to) : undefined
      })

      if (result.isFailure) {
        throw new BadRequestException(result.error)
      }

      appointments = result.value
    } else {
      // Find all appointments (can be extended with pagination)
      appointments = await this.appointmentRepository.findAll()
    }

    return appointments.map((apt) => this.toResponseDto(apt))
  }

  /**
   * Cancel an appointment
   */
  async cancel(id: string, cancelDto: CancelAppointmentDto): Promise<AppointmentResponseDto> {
    const useCase = new CancelAppointmentUseCase(this.appointmentRepository)

    const result = await useCase.execute({
      appointmentId: id,
      reason: cancelDto.reason,
      cancelledBy: cancelDto.cancelledBy
    })

    if (result.isFailure) {
      throw new BadRequestException(result.error)
    }

    return this.toResponseDto(result.value)
  }

  /**
   * Reschedule an appointment
   */
  async reschedule(
    id: string,
    rescheduleDto: RescheduleAppointmentDto
  ): Promise<AppointmentResponseDto> {
    const useCase = new RescheduleAppointmentUseCase(
      this.appointmentRepository,
      this.barberRepository,
      this.serviceRepository
    )

    const result = await useCase.execute({
      appointmentId: id,
      newStartTime: new Date(rescheduleDto.newStartTime),
      reason: rescheduleDto.reason
    })

    if (result.isFailure) {
      throw new BadRequestException(result.error)
    }

    return this.toResponseDto(result.value)
  }

  /**
   * Start an appointment
   */
  async start(id: string): Promise<AppointmentResponseDto> {
    const useCase = new StartAppointmentUseCase(this.appointmentRepository)

    const result = await useCase.execute({ appointmentId: id })

    if (result.isFailure) {
      throw new BadRequestException(result.error)
    }

    return this.toResponseDto(result.value)
  }

  /**
   * Complete an appointment
   */
  async complete(id: string): Promise<AppointmentResponseDto> {
    const useCase = new CompleteAppointmentUseCase(this.appointmentRepository)

    const result = await useCase.execute({ appointmentId: id })

    if (result.isFailure) {
      throw new BadRequestException(result.error)
    }

    return this.toResponseDto(result.value)
  }

  /**
   * Mark appointment as no-show
   */
  async markNoShow(id: string): Promise<AppointmentResponseDto> {
    const useCase = new MarkNoShowUseCase(this.appointmentRepository)

    const result = await useCase.execute({ appointmentId: id })

    if (result.isFailure) {
      throw new BadRequestException(result.error)
    }

    return this.toResponseDto(result.value)
  }

  /**
   * Transform domain entity to response DTO
   */
  private toResponseDto(appointment: Appointment): AppointmentResponseDto {
    return {
      id: appointment.id.toString(),
      barberId: appointment.barber.toString(),
      clientId: appointment.client.toString(),
      serviceId: appointment.service.toString(),
      startTime: appointment.slot.startTime.toJSDate().toISOString(),
      endTime: appointment.slot.endTime.toJSDate().toISOString(),
      duration: appointment.slot.durationInMinutes,
      status: appointment.status.value,
      paymentStatus: appointment.payment.status,
      paymentMethod: appointment.payment.method,
      totalAmount: appointment.payment.amount.amount,
      currency: appointment.payment.amount.currency.code,
      notes: appointment.notes,
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString()
    }
  }
}
