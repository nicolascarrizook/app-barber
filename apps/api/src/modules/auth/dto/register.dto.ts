import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { UserRole } from '../auth.service'

/**
 * Register DTO
 *
 * Data Transfer Object for user registration
 */
export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'newuser@example.com'
  })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string

  @ApiProperty({
    description: 'User password',
    example: 'securepassword123',
    minLength: 6
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe'
  })
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  name: string

  @ApiPropertyOptional({
    description: 'User role',
    enum: UserRole,
    default: UserRole.CLIENT,
    example: UserRole.CLIENT
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Invalid role' })
  role?: UserRole
}
