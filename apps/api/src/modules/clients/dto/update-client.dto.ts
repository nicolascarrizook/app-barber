import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

/**
 * Update Client DTO
 * 
 * Partial update for client profile
 */
export class UpdateClientDto {
  @ApiPropertyOptional({ description: 'First name', example: 'Juan' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName?: string

  @ApiPropertyOptional({ description: 'Last name', example: 'Pérez' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName?: string

  @ApiPropertyOptional({ description: 'Phone number', example: '+5491123456789' })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiPropertyOptional({ description: 'Internal notes (max 500 characters)' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string
}
