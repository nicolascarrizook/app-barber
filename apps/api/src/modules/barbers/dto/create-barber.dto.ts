import { IsString, IsEmail, IsNotEmpty, IsArray, IsOptional, IsNumber, Min, Max, MaxLength, IsObject, ValidateNested } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

/**
 * Day Schedule DTO
 */
export class DayScheduleDto {
  @ApiProperty({ description: 'Start time (HH:MM format)', example: '09:00' })
  @IsString()
  @IsNotEmpty()
  startTime: string

  @ApiProperty({ description: 'End time (HH:MM format)', example: '18:00' })
  @IsString()
  @IsNotEmpty()
  endTime: string
}

/**
 * Weekly Schedule DTO
 */
export class WeeklyScheduleDto {
  @ApiPropertyOptional({ type: DayScheduleDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DayScheduleDto)
  monday?: DayScheduleDto

  @ApiPropertyOptional({ type: DayScheduleDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DayScheduleDto)
  tuesday?: DayScheduleDto

  @ApiPropertyOptional({ type: DayScheduleDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DayScheduleDto)
  wednesday?: DayScheduleDto

  @ApiPropertyOptional({ type: DayScheduleDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DayScheduleDto)
  thursday?: DayScheduleDto

  @ApiPropertyOptional({ type: DayScheduleDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DayScheduleDto)
  friday?: DayScheduleDto

  @ApiPropertyOptional({ type: DayScheduleDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DayScheduleDto)
  saturday?: DayScheduleDto

  @ApiPropertyOptional({ type: DayScheduleDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DayScheduleDto)
  sunday?: DayScheduleDto
}

/**
 * Create Barber DTO
 */
export class CreateBarberDto {
  @ApiProperty({ description: 'First name', example: 'Carlos' })
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @MaxLength(50)
  firstName: string

  @ApiProperty({ description: 'Last name', example: 'Pérez' })
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  @MaxLength(50)
  lastName: string

  @ApiProperty({ description: 'Email address', example: 'carlos@barbershop.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string

  @ApiProperty({ description: 'Phone number', example: '+5491123456789' })
  @IsString()
  @IsNotEmpty({ message: 'Phone is required' })
  phone: string

  @ApiProperty({
    description: 'Array of specialties',
    example: ['HAIRCUT', 'BEARD', 'SHAVE'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ message: 'At least one specialty is required' })
  specialties: string[]

  @ApiPropertyOptional({ description: 'Weekly working schedule', type: WeeklyScheduleDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => WeeklyScheduleDto)
  schedule?: WeeklyScheduleDto

  @ApiPropertyOptional({
    description: 'Commission rate (0-100)',
    example: 60,
    minimum: 0,
    maximum: 100
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Commission rate must be at least 0' })
  @Max(100, { message: 'Commission rate must be at most 100' })
  commissionRate?: number

  @ApiPropertyOptional({ description: 'Profile image URL', example: 'https://example.com/photo.jpg' })
  @IsOptional()
  @IsString()
  profileImageUrl?: string

  @ApiPropertyOptional({
    description: 'Biography (max 1000 characters)',
    example: 'Professional barber with 10 years of experience',
    maxLength: 1000
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Bio must not exceed 1000 characters' })
  bio?: string
}
