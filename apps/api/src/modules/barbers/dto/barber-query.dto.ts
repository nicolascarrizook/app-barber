import { IsOptional, IsString, IsEnum } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

/**
 * Barber Status Enum
 */
export enum BarberStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE'
}

/**
 * Barber Query DTO
 * 
 * Optional filters for listing barbers
 */
export class BarberQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: BarberStatus,
    example: BarberStatus.ACTIVE
  })
  @IsOptional()
  @IsEnum(BarberStatus)
  status?: BarberStatus

  @ApiPropertyOptional({
    description: 'Filter by specialty',
    example: 'HAIRCUT'
  })
  @IsOptional()
  @IsString()
  specialty?: string

  @ApiPropertyOptional({
    description: 'Search by name',
    example: 'Carlos'
  })
  @IsOptional()
  @IsString()
  search?: string
}
