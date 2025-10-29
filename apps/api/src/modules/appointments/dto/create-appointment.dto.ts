import { ApiProperty } from '@nestjs/swagger'
import { IsUUID, IsISO8601, IsOptional, IsString, MaxLength } from 'class-validator'

/**
 * DTO for creating a new appointment
 *
 * Validates all required fields for appointment creation
 * Maps to CreateAppointmentUseCase input
 */
export class CreateAppointmentDto {
  @ApiProperty({
    description: 'Client UUID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  clientId: string

  @ApiProperty({
    description: 'Barber UUID',
    example: '123e4567-e89b-12d3-a456-426614174001'
  })
  @IsUUID()
  barberId: string

  @ApiProperty({
    description: 'Service UUID',
    example: '123e4567-e89b-12d3-a456-426614174002'
  })
  @IsUUID()
  serviceId: string

  @ApiProperty({
    description: 'Appointment start time in ISO 8601 format',
    example: '2025-10-30T10:00:00.000Z'
  })
  @IsISO8601()
  startTime: string

  @ApiProperty({
    description: 'Optional notes for the appointment',
    required: false,
    maxLength: 500,
    example: 'Client prefers shorter style on sides'
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string
}
