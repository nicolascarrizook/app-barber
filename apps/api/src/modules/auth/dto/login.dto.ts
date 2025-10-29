import { IsEmail, IsString, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

/**
 * Login DTO
 *
 * Data Transfer Object for user login
 */
export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'client@barbershop.com'
  })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string

  @ApiProperty({
    description: 'User password',
    example: 'client123',
    minLength: 6
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string
}
