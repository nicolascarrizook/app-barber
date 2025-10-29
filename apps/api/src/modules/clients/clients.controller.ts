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
  UseGuards,
  NotFoundException,
  BadRequestException,
  ForbiddenException
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
  CreateClientDto,
  UpdateClientDto,
  UpdatePreferencesDto,
  ClientResponseDto,
  ClientQueryDto
} from './dto'

// Guards and decorators
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { UserRole } from '../auth/auth.service'

// Use Cases
import { RegisterClientUseCase } from '@barbershop/application/use-cases/client/register-client.use-case'
import { UpdateClientProfileUseCase } from '@barbershop/application/use-cases/client/update-client-profile.use-case'
import { UpdateClientPreferencesUseCase } from '@barbershop/application/use-cases/client/update-client-preferences.use-case'

// Domain
import { ClientId } from '@barbershop/domain/entities/client-id.vo'
import { IClientRepository } from '@barbershop/domain/repositories/client.repository.interface'
import { Client } from '@barbershop/domain/entities/client.entity'

/**
 * Clients Controller
 *
 * Manages client-related HTTP endpoints
 *
 * Authorization rules:
 * - CLIENT: Can only access their own profile
 * - ADMIN/MANAGER: Full access to all clients
 *
 * @tag clients
 */
@Controller('clients')
@ApiTags('clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientsController {
  constructor(
    private readonly registerClient: RegisterClientUseCase,
    private readonly updateClientProfile: UpdateClientProfileUseCase,
    private readonly updateClientPreferences: UpdateClientPreferencesUseCase,
    private readonly clientRepository: IClientRepository
  ) {}

  /**
   * Register a new client
   *
   * Authorization: ADMIN, MANAGER
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Register new client',
    description: 'Creates a new client profile in the system'
  })
  @ApiResponse({
    status: 201,
    description: 'Client registered successfully',
    type: ClientResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or business rule violation'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions'
  })
  async create(@Body() dto: CreateClientDto): Promise<ClientResponseDto> {
    const result = await this.registerClient.execute({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      preferences: dto.preferences,
      notes: dto.notes
    })

    if (result.isFailure) {
      throw new BadRequestException(result.error)
    }

    return this.toResponseDto(result.value)
  }

  /**
   * Get client by ID
   *
   * Authorization:
   * - CLIENT: Only their own profile
   * - ADMIN/MANAGER: Any client
   */
  @Get(':id')
  @Roles(UserRole.CLIENT, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Get client by ID',
    description: 'Retrieves detailed information about a specific client'
  })
  @ApiParam({ name: 'id', description: 'Client UUID' })
  @ApiResponse({
    status: 200,
    description: 'Client found',
    type: ClientResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'Client not found'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - not authorized to view this client'
  })
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: any
  ): Promise<ClientResponseDto> {
    // Verify CLIENT can only view their own profile
    if (user.role === UserRole.CLIENT && id !== user.userId) {
      throw new ForbiddenException('Clients can only view their own profile')
    }

    const clientId = ClientId.create(id)
    const client = await this.clientRepository.findById(clientId)

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`)
    }

    return this.toResponseDto(client)
  }

  /**
   * List clients
   *
   * Authorization: ADMIN, MANAGER only
   */
  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'List clients',
    description: 'Retrieves list of clients with optional filters'
  })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name or email' })
  @ApiResponse({
    status: 200,
    description: 'List of clients',
    type: [ClientResponseDto]
  })
  async findAll(@Query() query: ClientQueryDto): Promise<ClientResponseDto[]> {
    // TODO: Implement findAll with filters in repository
    const clients = await this.clientRepository.findAll()
    return clients.map((client) => this.toResponseDto(client))
  }

  /**
   * Get current user's profile
   *
   * Authorization: CLIENT only
   */
  @Get('me')
  @Roles(UserRole.CLIENT)
  @ApiOperation({
    summary: 'Get own profile',
    description: 'Retrieves the authenticated client\'s profile'
  })
  @ApiResponse({
    status: 200,
    description: 'Client profile',
    type: ClientResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'Client not found'
  })
  async getMe(@CurrentUser() user: any): Promise<ClientResponseDto> {
    const clientId = ClientId.create(user.userId)
    const client = await this.clientRepository.findById(clientId)

    if (!client) {
      throw new NotFoundException('Client profile not found')
    }

    return this.toResponseDto(client)
  }

  /**
   * Update client profile
   *
   * Authorization:
   * - CLIENT: Only their own profile
   * - ADMIN/MANAGER: Any client
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.CLIENT, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Update client profile',
    description: 'Updates client information (partial update)'
  })
  @ApiParam({ name: 'id', description: 'Client UUID' })
  @ApiResponse({
    status: 200,
    description: 'Client updated successfully',
    type: ClientResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'Client not found'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - not authorized to update this client'
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateClientDto,
    @CurrentUser() user: any
  ): Promise<ClientResponseDto> {
    // Verify CLIENT can only update their own profile
    if (user.role === UserRole.CLIENT && id !== user.userId) {
      throw new ForbiddenException('Clients can only update their own profile')
    }

    const result = await this.updateClientProfile.execute({
      clientId: id,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      notes: dto.notes
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
   * Update client preferences
   *
   * Authorization: CLIENT only (own preferences)
   */
  @Patch('me/preferences')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.CLIENT)
  @ApiOperation({
    summary: 'Update own preferences',
    description: 'Updates the authenticated client\'s communication preferences'
  })
  @ApiResponse({
    status: 200,
    description: 'Preferences updated successfully',
    type: ClientResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'Client not found'
  })
  async updatePreferences(
    @Body() dto: UpdatePreferencesDto,
    @CurrentUser() user: any
  ): Promise<ClientResponseDto> {
    const result = await this.updateClientPreferences.execute({
      clientId: user.userId,
      language: dto.language,
      receivePromotions: dto.receivePromotions,
      receiveReminders: dto.receiveReminders,
      preferredContactMethod: dto.preferredContactMethod
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
   * Transform domain entity to response DTO
   */
  private toResponseDto(client: Client): ClientResponseDto {
    return {
      id: client.id.toString(),
      firstName: client.name.firstName,
      lastName: client.name.lastName,
      fullName: client.name.fullName,
      email: client.contact.email.value,
      phone: client.contact.phone.value,
      status: client.status.value,
      loyaltyPoints: client.loyaltyPoints?.points,
      language: client.preferences?.language,
      receivePromotions: client.preferences?.receivePromotions,
      receiveReminders: client.preferences?.receiveReminders,
      preferredContactMethod: client.preferences?.preferredContactMethod,
      notes: client.notes,
      createdAt: client.createdAt.toISOString(),
      updatedAt: client.updatedAt.toISOString()
    }
  }
}
