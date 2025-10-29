import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  NotFoundException,
  BadRequestException
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery
} from '@nestjs/swagger'

// DTOs
import {
  CreateBarberDto,
  UpdateBarberDto,
  UpdateScheduleDto,
  BarberResponseDto,
  BarberQueryDto
} from './dto'

// Guards and decorators
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { UserRole } from '../auth/auth.service'

// Use Cases
import { CreateBarberUseCase } from '@barbershop/application/use-cases/barber/create-barber.use-case'
import { UpdateBarberProfileUseCase } from '@barbershop/application/use-cases/barber/update-barber-profile.use-case'
import { SetWorkingHoursUseCase } from '@barbershop/application/use-cases/barber/set-working-hours.use-case'
import { ActivateBarberUseCase } from '@barbershop/application/use-cases/barber/activate-barber.use-case'
import { DeactivateBarberUseCase } from '@barbershop/application/use-cases/barber/deactivate-barber.use-case'

// Domain
import { BarberId } from '@barbershop/domain/entities/barber-id.vo'
import { IBarberRepository } from '@barbershop/domain/repositories/barber.repository.interface'
import { Barber } from '@barbershop/domain/entities/barber.entity'

/**
 * Barbers Controller
 *
 * Manages barber-related HTTP endpoints
 * Authorization: ADMIN and MANAGER only
 *
 * @tag barbers
 */
@Controller('barbers')
@ApiTags('barbers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class BarbersController {
  constructor(
    private readonly createBarber: CreateBarberUseCase,
    private readonly updateBarberProfile: UpdateBarberProfileUseCase,
    private readonly setWorkingHours: SetWorkingHoursUseCase,
    private readonly activateBarber: ActivateBarberUseCase,
    private readonly deactivateBarber: DeactivateBarberUseCase,
    private readonly barberRepository: IBarberRepository
  ) {}

  /**
   * Create a new barber
   *
   * Authorization: ADMIN, MANAGER
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Create new barber',
    description: 'Creates a new barber profile with skills and schedule'
  })
  @ApiResponse({
    status: 201,
    description: 'Barber created successfully',
    type: BarberResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or business rule violation'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions'
  })
  async create(@Body() dto: CreateBarberDto): Promise<BarberResponseDto> {
    const result = await this.createBarber.execute({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      specialties: dto.specialties,
      schedule: dto.schedule as any,
      commissionRate: dto.commissionRate,
      profileImageUrl: dto.profileImageUrl,
      bio: dto.bio
    })

    if (result.isFailure) {
      throw new BadRequestException(result.error)
    }

    return this.toResponseDto(result.value)
  }

  /**
   * Get barber by ID
   *
   * Authorization: All authenticated users
   */
  @Get(':id')
  @Roles(UserRole.CLIENT, UserRole.BARBER, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Get barber by ID',
    description: 'Retrieves detailed information about a specific barber'
  })
  @ApiParam({ name: 'id', description: 'Barber UUID' })
  @ApiResponse({
    status: 200,
    description: 'Barber found',
    type: BarberResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'Barber not found'
  })
  async findById(@Param('id') id: string): Promise<BarberResponseDto> {
    const barberId = BarberId.create(id)
    const barber = await this.barberRepository.findById(barberId)

    if (!barber) {
      throw new NotFoundException(`Barber with ID ${id} not found`)
    }

    return this.toResponseDto(barber)
  }

  /**
   * List barbers with filters
   *
   * Authorization: All authenticated users
   */
  @Get()
  @Roles(UserRole.CLIENT, UserRole.BARBER, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'List barbers',
    description: 'Retrieves list of barbers with optional filters'
  })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'specialty', required: false, description: 'Filter by specialty' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name' })
  @ApiResponse({
    status: 200,
    description: 'List of barbers',
    type: [BarberResponseDto]
  })
  async findAll(@Query() query: BarberQueryDto): Promise<BarberResponseDto[]> {
    // TODO: Implement findAll with filters in repository
    const barbers = await this.barberRepository.findAll()
    return barbers.map((barber) => this.toResponseDto(barber))
  }

  /**
   * Get available barbers
   *
   * Authorization: All authenticated users
   */
  @Get('available')
  @Roles(UserRole.CLIENT, UserRole.BARBER, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Get available barbers',
    description: 'Retrieves list of barbers currently available for appointments'
  })
  @ApiResponse({
    status: 200,
    description: 'List of available barbers',
    type: [BarberResponseDto]
  })
  async findAvailable(): Promise<BarberResponseDto[]> {
    // TODO: Implement findAvailable in repository
    const barbers = await this.barberRepository.findAll()
    const available = barbers.filter((b) => b.status.isActive())
    return available.map((barber) => this.toResponseDto(barber))
  }

  /**
   * Update barber profile
   *
   * Authorization: ADMIN, MANAGER
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Update barber profile',
    description: 'Updates barber information (partial update)'
  })
  @ApiParam({ name: 'id', description: 'Barber UUID' })
  @ApiResponse({
    status: 200,
    description: 'Barber updated successfully',
    type: BarberResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'Barber not found'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions'
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBarberDto
  ): Promise<BarberResponseDto> {
    const result = await this.updateBarberProfile.execute({
      barberId: id,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      commissionRate: dto.commissionRate,
      profileImageUrl: dto.profileImageUrl,
      bio: dto.bio
    })

    if (result.isFailure) {
      if (result.error.includes('not found')) {
        throw new NotFoundException(result.error)
      }
      throw new BadRequestException(result.error)
    }

    return this.toResponseDto(result.value)
  }

  /**
   * Update barber working schedule
   *
   * Authorization: ADMIN, MANAGER
   */
  @Patch(':id/schedule')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Update barber schedule',
    description: 'Updates barber working hours for the week'
  })
  @ApiParam({ name: 'id', description: 'Barber UUID' })
  @ApiResponse({
    status: 200,
    description: 'Schedule updated successfully',
    type: BarberResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'Barber not found'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions'
  })
  async updateSchedule(
    @Param('id') id: string,
    @Body() dto: UpdateScheduleDto
  ): Promise<BarberResponseDto> {
    const result = await this.setWorkingHours.execute({
      barberId: id,
      schedule: dto.schedule as any
    })

    if (result.isFailure) {
      if (result.error.includes('not found')) {
        throw new NotFoundException(result.error)
      }
      throw new BadRequestException(result.error)
    }

    return this.toResponseDto(result.value)
  }

  /**
   * Soft delete barber (deactivate)
   *
   * Authorization: ADMIN, MANAGER
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Deactivate barber',
    description: 'Soft deletes a barber (sets status to INACTIVE)'
  })
  @ApiParam({ name: 'id', description: 'Barber UUID' })
  @ApiResponse({
    status: 204,
    description: 'Barber deactivated successfully'
  })
  @ApiResponse({
    status: 404,
    description: 'Barber not found'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions'
  })
  async deactivate(@Param('id') id: string): Promise<void> {
    const result = await this.deactivateBarber.execute({ barberId: id })

    if (result.isFailure) {
      if (result.error.includes('not found')) {
        throw new NotFoundException(result.error)
      }
      throw new BadRequestException(result.error)
    }
  }

  /**
   * Transform domain entity to response DTO
   */
  private toResponseDto(barber: Barber): BarberResponseDto {
    return {
      id: barber.id.toString(),
      firstName: barber.name.firstName,
      lastName: barber.name.lastName,
      fullName: barber.name.fullName,
      email: barber.contact.email.value,
      phone: barber.contact.phone.value,
      specialties: barber.specialties.toStringArray(),
      status: barber.status.value,
      commissionRate: barber.commissionRate?.percentage,
      profileImageUrl: barber.profileImageUrl,
      bio: barber.bio,
      createdAt: barber.createdAt.toISOString(),
      updatedAt: barber.updatedAt.toISOString()
    }
  }
}
