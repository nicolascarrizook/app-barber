import { ApiProperty } from '@nestjs/swagger'
import { IsISO8601, IsUUID, IsOptional } from 'class-validator'

/**
 * DTO for getting available time slots
 *
 * Used for GET /availability/slots endpoint
 * Allows filtering by date, service, and optionally barber
 */
export class GetAvailableSlotsDto {
  @ApiProperty({
    description: 'Date to check availability (ISO 8601 format)',
    example: '2025-10-30'
  })
  @IsISO8601()
  date: string

  @ApiProperty({
    description: 'Service UUID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  serviceId: string

  @ApiProperty({
    description: 'Optional: Filter by specific barber UUID',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174001'
  })
  @IsOptional()
  @IsUUID()
  barberId?: string
}
