import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/**
 * Barber Response DTO
 */
export class BarberResponseDto {
  @ApiProperty({ description: 'Barber ID (UUID)' })
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

  @ApiProperty({ description: 'Specialties', type: [String] })
  specialties: string[]

  @ApiProperty({ description: 'Barber status (ACTIVE, INACTIVE, ON_LEAVE)' })
  status: string

  @ApiPropertyOptional({ description: 'Commission rate (0-100)' })
  commissionRate?: number

  @ApiPropertyOptional({ description: 'Profile image URL' })
  profileImageUrl?: string

  @ApiPropertyOptional({ description: 'Biography' })
  bio?: string

  @ApiProperty({ description: 'Created at (ISO 8601)' })
  createdAt: string

  @ApiProperty({ description: 'Updated at (ISO 8601)' })
  updatedAt: string
}
