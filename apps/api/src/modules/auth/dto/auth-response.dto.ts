import { ApiProperty } from '@nestjs/swagger'
import { UserRole } from '../auth.service'

/**
 * User Info DTO
 */
export class UserInfoDto {
  @ApiProperty({
    description: 'User ID',
    example: 'user_1234567890_abc123'
  })
  userId: string

  @ApiProperty({
    description: 'User email',
    example: 'user@example.com'
  })
  email: string

  @ApiProperty({
    description: 'User name',
    example: 'John Doe'
  })
  name: string

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: UserRole.CLIENT
  })
  role: UserRole
}

/**
 * Auth Response DTO
 *
 * Response object for authentication operations
 */
export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  accessToken: string

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  refreshToken: string

  @ApiProperty({
    description: 'User information',
    type: UserInfoDto
  })
  user: UserInfoDto
}
