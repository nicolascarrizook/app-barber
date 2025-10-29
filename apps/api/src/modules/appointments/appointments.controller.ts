import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
  ConflictException,
  BadRequestException
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam
} from '@nestjs/swagger'
import { DateTime } from 'luxon'

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

// DTOs
import {
  CreateAppointmentDto,
  CancelAppointmentDto,
  RescheduleAppointmentDto,
  AppointmentResponseDto,
  AppointmentQueryDto
} from './dto'

// Value Objects
import { AppointmentId } from '@barbershop/domain/entities/appointment-id.vo'
import { ClientId } from '@barbershop/domain/entities/client-id.vo'
import { BarberId } from '@barbershop/domain/entities/barber-id.vo'
import { ServiceId } from '@barbershop/domain/entities/service-id.vo'

/**
 * Appointments Controller
 *
 * Handles all appointment-related HTTP endpoints
 * Maps REST requests to application layer use cases
 * Returns standardized DTO responses
 *
 * @tag appointments
 */
@Controller('appointments')
@ApiTags('appointments')
@ApiBearerAuth()
export class AppointmentsController {
  constructor(
    private readonly createAppointment: CreateAppointmentUseCase,
    private readonly cancelAppointment: CancelAppointmentUseCase,
    private readonly confirmAppointment: ConfirmAppointmentUseCase,
    private readonly completeAppointment: CompleteAppointmentUseCase,
    private readonly rescheduleAppointment: RescheduleAppointmentUseCase,
    private readonly startAppointment: StartAppointmentUseCase,
    private readonly markNoShow: MarkNoShowUseCase,
    private readonly findByClient: FindAppointmentsByClientUseCase,
    private readonly findByBarber: FindAppointmentsByBarberUseCase
  ) {}

  /**
   * Create new appointment
   *
   * Validates availability and prevents double-booking
   * Returns 409 Conflict if time slot is unavailable
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create new appointment',
    description:
      'Creates a new appointment with conflict detection. Validates barber availability and prevents double-booking.'
  })
  @ApiResponse({
    status: 201,
    description: 'Appointment created successfully',
    type: AppointmentResponseDto
  })
  @ApiResponse({
    status: 409,
    description: 'Time slot conflict - barber not available'
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or business rule violation'
  })
  async create(
    @Body() dto: CreateAppointmentDto
  ): Promise<AppointmentResponseDto> {
    const result = await this.createAppointment.execute({
      clientId: ClientId.create(dto.clientId),
      barberId: BarberId.create(dto.barberId),
      serviceId: ServiceId.create(dto.serviceId),
      startTime: DateTime.fromISO(dto.startTime),
      notes: dto.notes
    })

    if (result.isFailure) {
      // Check if it's a conflict error
      if (result.error.includes('conflict') || result.error.includes('not available')) {
        throw new ConflictException(result.error)
      }
      throw new BadRequestException(result.error)
    }

    return AppointmentResponseDto.fromDomain(result.value)
  }

  /**
   * Get appointment by ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get appointment by ID',
    description: 'Retrieves detailed information about a specific appointment'
  })
  @ApiParam({
    name: 'id',
    description: 'Appointment UUID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: 200,
    description: 'Appointment found',
    type: AppointmentResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'Appointment not found'
  })
  async findOne(@Param('id') id: string): Promise<AppointmentResponseDto> {
    // TODO: Implement GetAppointmentByIdUseCase
    throw new NotFoundException('Get by ID use case not yet implemented')
  }

  /**
   * List appointments with filters
   */
  @Get()
  @ApiOperation({
    summary: 'List appointments',
    description: 'Retrieves list of appointments with optional filters'
  })
  @ApiResponse({
    status: 200,
    description: 'List of appointments',
    type: [AppointmentResponseDto]
  })
  async findAll(
    @Query() query: AppointmentQueryDto
  ): Promise<AppointmentResponseDto[]> {
    // If filtering by client
    if (query.clientId) {
      const result = await this.findByClient.execute({
        clientId: ClientId.create(query.clientId),
        status: query.status,
        startDate: query.startDate ? DateTime.fromISO(query.startDate) : undefined,
        endDate: query.endDate ? DateTime.fromISO(query.endDate) : undefined
      })

      if (result.isFailure) {
        throw new BadRequestException(result.error)
      }

      return result.value.map(AppointmentResponseDto.fromDomain)
    }

    // If filtering by barber
    if (query.barberId) {
      const result = await this.findByBarber.execute({
        barberId: BarberId.create(query.barberId),
        status: query.status,
        startDate: query.startDate ? DateTime.fromISO(query.startDate) : undefined,
        endDate: query.endDate ? DateTime.fromISO(query.endDate) : undefined
      })

      if (result.isFailure) {
        throw new BadRequestException(result.error)
      }

      return result.value.map(AppointmentResponseDto.fromDomain)
    }

    // TODO: Implement general list without specific filter
    return []
  }

  /**
   * Get client appointments
   */
  @Get('client/:clientId')
  @ApiOperation({
    summary: 'Get client appointments',
    description: 'Retrieves all appointments for a specific client'
  })
  @ApiParam({
    name: 'clientId',
    description: 'Client UUID'
  })
  @ApiResponse({
    status: 200,
    description: 'Client appointments',
    type: [AppointmentResponseDto]
  })
  async findByClientId(
    @Param('clientId') clientId: string
  ): Promise<AppointmentResponseDto[]> {
    const result = await this.findByClient.execute({
      clientId: ClientId.create(clientId)
    })

    if (result.isFailure) {
      throw new BadRequestException(result.error)
    }

    return result.value.map(AppointmentResponseDto.fromDomain)
  }

  /**
   * Get barber appointments
   */
  @Get('barber/:barberId')
  @ApiOperation({
    summary: 'Get barber appointments',
    description: "Retrieves all appointments for a specific barber's schedule"
  })
  @ApiParam({
    name: 'barberId',
    description: 'Barber UUID'
  })
  @ApiResponse({
    status: 200,
    description: 'Barber appointments',
    type: [AppointmentResponseDto]
  })
  async findByBarberId(
    @Param('barberId') barberId: string
  ): Promise<AppointmentResponseDto[]> {
    const result = await this.findByBarber.execute({
      barberId: BarberId.create(barberId)
    })

    if (result.isFailure) {
      throw new BadRequestException(result.error)
    }

    return result.value.map(AppointmentResponseDto.fromDomain)
  }

  /**
   * Cancel appointment
   */
  @Patch(':id/cancel')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Cancel appointment',
    description: 'Cancels an existing appointment with optional reason'
  })
  @ApiParam({
    name: 'id',
    description: 'Appointment UUID'
  })
  @ApiResponse({
    status: 204,
    description: 'Appointment cancelled successfully'
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot cancel appointment (invalid state or business rule)'
  })
  @ApiResponse({
    status: 404,
    description: 'Appointment not found'
  })
  async cancel(
    @Param('id') id: string,
    @Body() dto: CancelAppointmentDto
  ): Promise<void> {
    const result = await this.cancelAppointment.execute({
      appointmentId: AppointmentId.create(id),
      reason: dto.reason
    })

    if (result.isFailure) {
      if (result.error.includes('not found')) {
        throw new NotFoundException(result.error)
      }
      throw new BadRequestException(result.error)
    }
  }

  /**
   * Confirm appointment
   */
  @Patch(':id/confirm')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Confirm appointment',
    description: 'Changes appointment status from PENDING to CONFIRMED'
  })
  @ApiParam({
    name: 'id',
    description: 'Appointment UUID'
  })
  @ApiResponse({
    status: 204,
    description: 'Appointment confirmed successfully'
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot confirm appointment (invalid state)'
  })
  async confirm(@Param('id') id: string): Promise<void> {
    const result = await this.confirmAppointment.execute({
      appointmentId: AppointmentId.create(id)
    })

    if (result.isFailure) {
      if (result.error.includes('not found')) {
        throw new NotFoundException(result.error)
      }
      throw new BadRequestException(result.error)
    }
  }

  /**
   * Start appointment
   */
  @Patch(':id/start')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Start appointment',
    description: 'Marks appointment as IN_PROGRESS when service begins'
  })
  @ApiParam({
    name: 'id',
    description: 'Appointment UUID'
  })
  @ApiResponse({
    status: 204,
    description: 'Appointment started successfully'
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot start appointment (invalid state)'
  })
  async start(@Param('id') id: string): Promise<void> {
    const result = await this.startAppointment.execute({
      appointmentId: AppointmentId.create(id)
    })

    if (result.isFailure) {
      if (result.error.includes('not found')) {
        throw new NotFoundException(result.error)
      }
      throw new BadRequestException(result.error)
    }
  }

  /**
   * Complete appointment
   */
  @Patch(':id/complete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Complete appointment',
    description: 'Marks appointment as COMPLETED and updates metrics'
  })
  @ApiParam({
    name: 'id',
    description: 'Appointment UUID'
  })
  @ApiResponse({
    status: 204,
    description: 'Appointment completed successfully'
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot complete appointment (invalid state)'
  })
  async complete(@Param('id') id: string): Promise<void> {
    const result = await this.completeAppointment.execute({
      appointmentId: AppointmentId.create(id)
    })

    if (result.isFailure) {
      if (result.error.includes('not found')) {
        throw new NotFoundException(result.error)
      }
      throw new BadRequestException(result.error)
    }
  }

  /**
   * Mark appointment as no-show
   */
  @Patch(':id/no-show')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Mark as no-show',
    description: 'Marks appointment as NO_SHOW when client does not arrive'
  })
  @ApiParam({
    name: 'id',
    description: 'Appointment UUID'
  })
  @ApiResponse({
    status: 204,
    description: 'Appointment marked as no-show'
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot mark as no-show (invalid state)'
  })
  async markAsNoShow(@Param('id') id: string): Promise<void> {
    const result = await this.markNoShow.execute({
      appointmentId: AppointmentId.create(id)
    })

    if (result.isFailure) {
      if (result.error.includes('not found')) {
        throw new NotFoundException(result.error)
      }
      throw new BadRequestException(result.error)
    }
  }

  /**
   * Reschedule appointment
   */
  @Patch(':id/reschedule')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reschedule appointment',
    description: 'Changes appointment time and optionally barber'
  })
  @ApiParam({
    name: 'id',
    description: 'Appointment UUID'
  })
  @ApiResponse({
    status: 200,
    description: 'Appointment rescheduled successfully',
    type: AppointmentResponseDto
  })
  @ApiResponse({
    status: 409,
    description: 'New time slot not available'
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot reschedule appointment'
  })
  async reschedule(
    @Param('id') id: string,
    @Body() dto: RescheduleAppointmentDto
  ): Promise<AppointmentResponseDto> {
    const result = await this.rescheduleAppointment.execute({
      appointmentId: AppointmentId.create(id),
      newStartTime: DateTime.fromISO(dto.newStartTime),
      newBarberId: dto.newBarberId
        ? BarberId.create(dto.newBarberId)
        : undefined
    })

    if (result.isFailure) {
      if (result.error.includes('not found')) {
        throw new NotFoundException(result.error)
      }
      if (result.error.includes('conflict') || result.error.includes('not available')) {
        throw new ConflictException(result.error)
      }
      throw new BadRequestException(result.error)
    }

    return AppointmentResponseDto.fromDomain(result.value)
  }
}
