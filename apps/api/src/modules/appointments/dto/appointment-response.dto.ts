import { ApiProperty } from '@nestjs/swagger'
import { Appointment } from '@barbershop/domain/entities/appointment.entity'
import { AppointmentStatus } from '@barbershop/domain/value-objects/appointment-status.vo'

/**
 * DTO for appointment responses
 *
 * Maps domain Appointment entity to API response format
 * Used for GET endpoints and successful POST/PATCH responses
 */
export class AppointmentResponseDto {
  @ApiProperty({
    description: 'Appointment unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string

  @ApiProperty({
    description: 'Client ID',
    example: '123e4567-e89b-12d3-a456-426614174001'
  })
  clientId: string

  @ApiProperty({
    description: 'Barber ID',
    example: '123e4567-e89b-12d3-a456-426614174002'
  })
  barberId: string

  @ApiProperty({
    description: 'Service ID',
    example: '123e4567-e89b-12d3-a456-426614174003'
  })
  serviceId: string

  @ApiProperty({
    description: 'Appointment start time',
    example: '2025-10-30T10:00:00.000Z'
  })
  startTime: string

  @ApiProperty({
    description: 'Appointment end time',
    example: '2025-10-30T10:30:00.000Z'
  })
  endTime: string

  @ApiProperty({
    description: 'Appointment status',
    enum: AppointmentStatus,
    example: AppointmentStatus.PENDING
  })
  status: AppointmentStatus

  @ApiProperty({
    description: 'Payment amount',
    example: 2500
  })
  price: number

  @ApiProperty({
    description: 'Payment currency',
    example: 'ARS'
  })
  currency: string

  @ApiProperty({
    description: 'Payment status',
    example: 'PENDING'
  })
  paymentStatus: string

  @ApiProperty({
    description: 'Payment method',
    example: 'CASH'
  })
  paymentMethod: string

  @ApiProperty({
    description: 'Optional appointment notes',
    required: false,
    example: 'Client prefers shorter style on sides'
  })
  notes?: string

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-10-29T10:00:00.000Z'
  })
  createdAt: string

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-10-29T10:00:00.000Z'
  })
  updatedAt: string

  /**
   * Maps domain Appointment entity to DTO
   *
   * @param appointment - Domain appointment entity
   * @returns Mapped response DTO
   */
  static fromDomain(appointment: Appointment): AppointmentResponseDto {
    return {
      id: appointment.appointmentId.toString(),
      clientId: appointment.client.toString(),
      barberId: appointment.barber.toString(),
      serviceId: appointment.service.toString(),
      startTime: appointment.slot.startTime.toISO(),
      endTime: appointment.slot.endTime.toISO(),
      status: appointment.status,
      price: appointment.payment.amount.amount,
      currency: appointment.payment.amount.currency.toString(),
      paymentStatus: appointment.payment.status,
      paymentMethod: appointment.payment.method,
      notes: appointment.notes,
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString()
    }
  }
}
