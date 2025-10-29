import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/**
 * Client Response DTO
 */
export class ClientResponseDto {
  @ApiProperty({ description: 'Client ID (UUID)' })
  id: string

  @ApiProperty({ description: 'First name' })
  firstName: string

  @ApiProperty({ description: 'Last name' })
  lastName: string

  @ApiProperty({ description: 'Full name' })
  fullName: string

  @ApiProperty({ description: 'Email address' })
  email: string

  @ApiProperty({ description: 'Phone number' })
  phone: string

  @ApiProperty({ description: 'Client status (ACTIVE, INACTIVE, BLOCKED)' })
  status: string

  @ApiPropertyOptional({ description: 'Loyalty points balance' })
  loyaltyPoints?: number

  @ApiPropertyOptional({ description: 'Preferred language' })
  language?: string

  @ApiPropertyOptional({ description: 'Receive promotions flag' })
  receivePromotions?: boolean

  @ApiPropertyOptional({ description: 'Receive reminders flag' })
  receiveReminders?: boolean

  @ApiPropertyOptional({ description: 'Preferred contact method' })
  preferredContactMethod?: string

  @ApiPropertyOptional({ description: 'Internal notes' })
  notes?: string

  @ApiProperty({ description: 'Created at (ISO 8601)' })
  createdAt: string

  @ApiProperty({ description: 'Updated at (ISO 8601)' })
  updatedAt: string
}
