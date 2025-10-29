import { IsString, IsEmail, IsNotEmpty, IsOptional, IsEnum, IsBoolean, MaxLength, MinLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/**
 * Language enum
 */
export enum Language {
  ES = 'es',
  EN = 'en'
}

/**
 * Contact method enum
 */
export enum ContactMethod {
  EMAIL = 'email',
  SMS = 'sms',
  WHATSAPP = 'whatsapp'
}

/**
 * Client Preferences DTO
 */
export class ClientPreferencesDto {
  @ApiPropertyOptional({ description: 'Preferred language', enum: Language, default: Language.ES })
  @IsOptional()
  @IsEnum(Language)
  language?: Language

  @ApiPropertyOptional({ description: 'Receive promotional emails', default: true })
  @IsOptional()
  @IsBoolean()
  receivePromotions?: boolean

  @ApiPropertyOptional({ description: 'Receive appointment reminders', default: true })
  @IsOptional()
  @IsBoolean()
  receiveReminders?: boolean

  @ApiPropertyOptional({ description: 'Preferred contact method', enum: ContactMethod, default: ContactMethod.EMAIL })
  @IsOptional()
  @IsEnum(ContactMethod)
  preferredContactMethod?: ContactMethod
}

/**
 * Create Client DTO (Register)
 */
export class CreateClientDto {
  @ApiProperty({ description: 'First name', example: 'Juan' })
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @MinLength(2, { message: 'First name must be at least 2 characters' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  firstName: string

  @ApiProperty({ description: 'Last name', example: 'Pérez' })
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  @MinLength(2, { message: 'Last name must be at least 2 characters' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  lastName: string

  @ApiProperty({ description: 'Email address', example: 'juan@example.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string

  @ApiProperty({ description: 'Phone number', example: '+5491123456789' })
  @IsString()
  @IsNotEmpty({ message: 'Phone is required' })
  phone: string

  @ApiPropertyOptional({ description: 'Client preferences', type: ClientPreferencesDto })
  @IsOptional()
  preferences?: ClientPreferencesDto

  @ApiPropertyOptional({ description: 'Internal notes (max 500 characters)', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Notes must not exceed 500 characters' })
  notes?: string
}
