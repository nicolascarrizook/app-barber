import { IsString, IsOptional, IsNumber, Min, Max, MaxLength } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

/**
 * Update Barber DTO
 * 
 * All fields are optional for partial updates
 */
export class UpdateBarberDto {
  @ApiPropertyOptional({ description: 'First name', example: 'Carlos' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string

  @ApiPropertyOptional({ description: 'Last name', example: 'Pérez' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string

  @ApiPropertyOptional({ description: 'Phone number', example: '+5491123456789' })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiPropertyOptional({
    description: 'Commission rate (0-100)',
    example: 60,
    minimum: 0,
    maximum: 100
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  commissionRate?: number

  @ApiPropertyOptional({ description: 'Profile image URL' })
  @IsOptional()
  @IsString()
  profileImageUrl?: string

  @ApiPropertyOptional({
    description: 'Biography (max 1000 characters)',
    maxLength: 1000
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string
}
