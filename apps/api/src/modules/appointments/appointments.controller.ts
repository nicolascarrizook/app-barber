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
  BadRequestException,
  UseGuards,
  ForbiddenException
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam
} from '@nestjs/swagger'
import { DateTime } from 'luxon'

// Guards and decorators
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { UserRole } from '../auth/auth.service'

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
 * Authorization rules:
 * - CLIENT: Can create for themselves, view own appointments
 * - BARBER: Can view their appointments, manage (start, complete, no-show)
 * - ADMIN/MANAGER: Full access to all operations
 *
 * @tag appointments
 */
@Controller('appointments')
@ApiTags('appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
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
   *
   * Authorization:
   * - CLIENT: Can only create for themselves (clientId must match userId)
   * - ADMIN/MANAGER: Can create for anyone
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.CLIENT, UserRole.ADMIN, UserRole.MANAGER)
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
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions'
  })
  async create(
    @Body() dto: CreateAppointmentDto,
    @CurrentUser() user: any
  ): Promise<AppointmentResponseDto> {
    // Validate CLIENT can only create for themselves
    if (user.role === UserRole.CLIENT && dto.clientId !== user.userId) {
      throw new ForbiddenException('Clients can only create appointments for themselves')
    }
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
   *
   * Authorization:
   * - CLIENT: Can only view their own appointments
   * - BARBER: Can only view their own appointments
   * - ADMIN/MANAGER: Can view all appointments
   */
  @Get(':id')
  @Roles(UserRole.CLIENT, UserRole.BARBER, UserRole.ADMIN, UserRole.MANAGER)
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
  @ApiResponse({
    status: 403,
    description: 'Forbidden - not authorized to view this appointment'
  })
  async findOne(@Param('id') id: string, @CurrentUser() user: any): Promise<AppointmentResponseDto> {
    // TODO: Implement GetAppointmentByIdUseCase
    // TODO: Verify authorization based on user role
    throw new NotFoundException('Get by ID use case not yet implemented')
  }

  /**
   * List appointments with filters
   *
   * Authorization:
   * - CLIENT: Can only query their own appointments (clientId filter enforced)
   * - BARBER: Can only query their own appointments (barberId filter enforced)
   * - ADMIN/MANAGER: Can query all appointments
   */
  @Get()
  @Roles(UserRole.CLIENT, UserRole.BARBER, UserRole.ADMIN, UserRole.MANAGER)
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
    @Query() query: AppointmentQueryDto,
    @CurrentUser() user: any
  ): Promise<AppointmentResponseDto[]> {
    // Enforce authorization filters based on role
    if (user.role === UserRole.CLIENT) {
      query.clientId = user.userId // Override to ensure CLIENT only sees own appointments
    }
    if (user.role === UserRole.BARBER) {
      query.barberId = user.userId // Override to ensure BARBER only sees own appointments
    }
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
   *
   * Authorization:
   * - CLIENT: Can only view their own appointments
   * - ADMIN/MANAGER: Can view any client's appointments
   */
  @Get('client/:clientId')
  @Roles(UserRole.CLIENT, UserRole.ADMIN, UserRole.MANAGER)
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
  @ApiResponse({
    status: 403,
    description: 'Forbidden - not authorized to view these appointments'
  })
  async findByClientId(
    @Param('clientId') clientId: string,
    @CurrentUser() user: any
  ): Promise<AppointmentResponseDto[]> {
    // Verify CLIENT can only view their own appointments
    if (user.role === UserRole.CLIENT && clientId !== user.userId) {
      throw new ForbiddenException('Clients can only view their own appointments')
    }
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
   *
   * Authorization:
   * - BARBER: Can only view their own appointments
   * - ADMIN/MANAGER: Can view any barber's appointments
   */
  @Get('barber/:barberId')
  @Roles(UserRole.BARBER, UserRole.ADMIN, UserRole.MANAGER)
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
  @ApiResponse({
    status: 403,
    description: 'Forbidden - not authorized to view these appointments'
  })
  async findByBarberId(
    @Param('barberId') barberId: string,
    @CurrentUser() user: any
  ): Promise<AppointmentResponseDto[]> {
    // Verify BARBER can only view their own appointments
    if (user.role === UserRole.BARBER && barberId !== user.userId) {
      throw new ForbiddenException('Barbers can only view their own appointments')
    }
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
   *
   * Authorization:
   * - CLIENT: Can cancel their own appointments
   * - BARBER: Can cancel their own appointments
   * - ADMIN/MANAGER: Can cancel any appointment
   */
  @Patch(':id/cancel')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.CLIENT, UserRole.BARBER, UserRole.ADMIN, UserRole.MANAGER)
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
  @ApiResponse({
    status: 403,
    description: 'Forbidden - not authorized to cancel this appointment'
  })
  async cancel(
    @Param('id') id: string,
    @Body() dto: CancelAppointmentDto,
    @CurrentUser() user: any
  ): Promise<void> {
    // TODO: Verify ownership before canceling (unless ADMIN/MANAGER)
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
   *
   * Authorization:
   * - CLIENT: Can confirm their own appointments
   * - BARBER: Can confirm their own appointments
   * - ADMIN/MANAGER: Can confirm any appointment
   */
  @Patch(':id/confirm')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.CLIENT, UserRole.BARBER, UserRole.ADMIN, UserRole.MANAGER)
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
  @ApiResponse({
    status: 403,
    description: 'Forbidden - not authorized to confirm this appointment'
  })
  async confirm(@Param('id') id: string, @CurrentUser() user: any): Promise<void> {
    // TODO: Verify ownership before confirming (unless ADMIN/MANAGER)
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
   *
   * Authorization:
   * - BARBER: Can start their own appointments
   * - ADMIN/MANAGER: Can start any appointment
   */
  @Patch(':id/start')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.BARBER, UserRole.ADMIN, UserRole.MANAGER)
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
  @ApiResponse({
    status: 403,
    description: 'Forbidden - not authorized to start this appointment'
  })
  async start(@Param('id') id: string, @CurrentUser() user: any): Promise<void> {
    // Verify barber ownership (unless ADMIN/MANAGER)
    if (user.role === UserRole.BARBER) {
      // TODO: Fetch appointment and verify barberId matches user.userId
      // For now, the use case will handle validation
    }
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
   *
   * Authorization:
   * - BARBER: Can complete their own appointments
   * - ADMIN/MANAGER: Can complete any appointment
   */
  @Patch(':id/complete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.BARBER, UserRole.ADMIN, UserRole.MANAGER)
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
  @ApiResponse({
    status: 403,
    description: 'Forbidden - not authorized to complete this appointment'
  })
  async complete(@Param('id') id: string, @CurrentUser() user: any): Promise<void> {
    // Verify barber ownership (unless ADMIN/MANAGER)
    if (user.role === UserRole.BARBER) {
      // TODO: Fetch appointment and verify barberId matches user.userId
    }
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
   *
   * Authorization:
   * - BARBER: Can mark their own appointments as no-show
   * - ADMIN/MANAGER: Can mark any appointment as no-show
   */
  @Patch(':id/no-show')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.BARBER, UserRole.ADMIN, UserRole.MANAGER)
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
  @ApiResponse({
    status: 403,
    description: 'Forbidden - not authorized to mark this appointment as no-show'
  })
  async markAsNoShow(@Param('id') id: string, @CurrentUser() user: any): Promise<void> {
    // Verify barber ownership (unless ADMIN/MANAGER)
    if (user.role === UserRole.BARBER) {
      // TODO: Fetch appointment and verify barberId matches user.userId
    }
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
   *
   * Authorization:
   * - CLIENT: Can reschedule their own appointments
   * - BARBER: Can reschedule their own appointments
   * - ADMIN/MANAGER: Can reschedule any appointment
   */
  @Patch(':id/reschedule')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.CLIENT, UserRole.BARBER, UserRole.ADMIN, UserRole.MANAGER)
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
  @ApiResponse({
    status: 403,
    description: 'Forbidden - not authorized to reschedule this appointment'
  })
  async reschedule(
    @Param('id') id: string,
    @Body() dto: RescheduleAppointmentDto,
    @CurrentUser() user: any
  ): Promise<AppointmentResponseDto> {
    // TODO: Verify ownership before rescheduling (unless ADMIN/MANAGER)
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
