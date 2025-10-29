import {
  Controller,
  Get,
  Query,
  BadRequestException
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth
} from '@nestjs/swagger'

// Use Case
import { GetAvailableSlotsUseCase } from '@barbershop/application/use-cases/availability/get-available-slots.use-case'

// DTOs
import {
  GetAvailableSlotsDto,
  AvailableSlotResponseDto
} from './dto'

/**
 * Availability Controller
 *
 * Handles availability checking and slot discovery
 * Critical for booking UX - must be fast and accurate
 *
 * @tag availability
 */
@Controller('availability')
@ApiTags('availability')
@ApiBearerAuth()
export class AvailabilityController {
  constructor(
    private readonly getAvailableSlots: GetAvailableSlotsUseCase
  ) {}

  /**
   * Get available time slots
   *
   * Returns all available time slots for a given date and service
   * Optionally filter by specific barber
   *
   * Business Rules:
   * - Date must be today or future
   * - Service must exist and be active
   * - Only shows slots during barber working hours
   * - Excludes slots conflicting with existing appointments
   * - Considers service duration
   * - If barberId provided, only shows that barber's availability
   * - If no barberId, shows all qualified barbers
   * - Barbers must have required skills for the service
   */
  @Get('slots')
  @ApiOperation({
    summary: 'Get available time slots',
    description:
      'Returns available time slots for booking. Considers barber schedules, existing appointments, and service requirements.'
  })
  @ApiResponse({
    status: 200,
    description: 'Available slots retrieved successfully',
    type: [AvailableSlotResponseDto]
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or business rule violation'
  })
  async getAvailableSlots(
    @Query() dto: GetAvailableSlotsDto
  ): Promise<AvailableSlotResponseDto[]> {
    // Convert ISO date string to Date object
    const date = new Date(dto.date)

    if (isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date format')
    }

    const result = await this.getAvailableSlots.execute({
      date,
      serviceId: dto.serviceId,
      barberId: dto.barberId
    })

    if (result.isFailure) {
      throw new BadRequestException(result.error)
    }

    return result.value.map(AvailableSlotResponseDto.fromDomain)
  }
}
