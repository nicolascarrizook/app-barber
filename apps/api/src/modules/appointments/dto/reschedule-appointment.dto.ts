import { ApiProperty } from '@nestjs/swagger'
import { IsISO8601, IsOptional, IsUUID } from 'class-validator'

/**
 * DTO for rescheduling an appointment
 *
 * Allows changing time, barber, or both
 * Maps to RescheduleAppointmentUseCase input
 */
export class RescheduleAppointmentDto {
  @ApiProperty({
    description: 'New start time in ISO 8601 format',
    example: '2025-10-31T14:00:00.000Z'
  })
  @IsISO8601()
  newStartTime: string

  @ApiProperty({
    description: 'Optional: Change to different barber',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174003'
  })
  @IsOptional()
  @IsUUID()
  newBarberId?: string
}
