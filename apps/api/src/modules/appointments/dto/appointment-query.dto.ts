import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsUUID, IsEnum, IsISO8601 } from 'class-validator'
import { AppointmentStatus } from '@barbershop/domain/value-objects/appointment-status.vo'

/**
 * DTO for querying/filtering appointments
 *
 * Allows filtering by status, date range, barber, client
 * Used in GET /appointments list endpoint
 */
export class AppointmentQueryDto {
  @ApiProperty({
    description: 'Filter by appointment status',
    enum: AppointmentStatus,
    required: false,
    example: AppointmentStatus.CONFIRMED
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus

  @ApiProperty({
    description: 'Filter by barber ID',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174001'
  })
  @IsOptional()
  @IsUUID()
  barberId?: string

  @ApiProperty({
    description: 'Filter by client ID',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174002'
  })
  @IsOptional()
  @IsUUID()
  clientId?: string

  @ApiProperty({
    description: 'Filter appointments from this date (ISO 8601)',
    required: false,
    example: '2025-10-30T00:00:00.000Z'
  })
  @IsOptional()
  @IsISO8601()
  startDate?: string

  @ApiProperty({
    description: 'Filter appointments until this date (ISO 8601)',
    required: false,
    example: '2025-11-30T23:59:59.999Z'
  })
  @IsOptional()
  @IsISO8601()
  endDate?: string
}
