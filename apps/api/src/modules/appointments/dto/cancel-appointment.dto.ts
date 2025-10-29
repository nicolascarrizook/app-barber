import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength, IsOptional } from 'class-validator'

/**
 * DTO for cancelling an appointment
 *
 * Allows optional cancellation reason
 * Maps to CancelAppointmentUseCase input
 */
export class CancelAppointmentDto {
  @ApiProperty({
    description: 'Reason for cancellation',
    required: false,
    maxLength: 500,
    example: 'Client requested reschedule due to personal emergency'
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string
}
