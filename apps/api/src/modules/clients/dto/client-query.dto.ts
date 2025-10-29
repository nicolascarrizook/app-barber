import { IsOptional, IsString, IsEnum } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

/**
 * Client Status Enum
 */
export enum ClientStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED'
}

/**
 * Client Query DTO
 * 
 * Optional filters for listing clients
 */
export class ClientQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: ClientStatus,
    example: ClientStatus.ACTIVE
  })
  @IsOptional()
  @IsEnum(ClientStatus)
  status?: ClientStatus

  @ApiPropertyOptional({
    description: 'Search by name or email',
    example: 'Juan'
  })
  @IsOptional()
  @IsString()
  search?: string
}
