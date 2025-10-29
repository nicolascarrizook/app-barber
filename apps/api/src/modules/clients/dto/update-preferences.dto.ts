import { IsOptional, IsEnum, IsBoolean } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Language, ContactMethod } from './create-client.dto'

/**
 * Update Preferences DTO
 */
export class UpdatePreferencesDto {
  @ApiPropertyOptional({ description: 'Preferred language', enum: Language })
  @IsOptional()
  @IsEnum(Language)
  language?: Language

  @ApiPropertyOptional({ description: 'Receive promotional emails' })
  @IsOptional()
  @IsBoolean()
  receivePromotions?: boolean

  @ApiPropertyOptional({ description: 'Receive appointment reminders' })
  @IsOptional()
  @IsBoolean()
  receiveReminders?: boolean

  @ApiPropertyOptional({ description: 'Preferred contact method', enum: ContactMethod })
  @IsOptional()
  @IsEnum(ContactMethod)
  preferredContactMethod?: ContactMethod
}
