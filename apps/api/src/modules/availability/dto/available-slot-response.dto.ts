import { ApiProperty } from '@nestjs/swagger'

/**
 * DTO for available slot responses
 *
 * Represents a single available time slot
 * Maps from domain AvailableSlot interface to API response
 */
export class AvailableSlotResponseDto {
  @ApiProperty({
    description: 'Slot start time',
    example: '2025-10-30T10:00:00.000Z'
  })
  startTime: string

  @ApiProperty({
    description: 'Slot end time',
    example: '2025-10-30T10:30:00.000Z'
  })
  endTime: string

  @ApiProperty({
    description: 'Barber UUID',
    example: '123e4567-e89b-12d3-a456-426614174001'
  })
  barberId: string

  @ApiProperty({
    description: 'Barber display name',
    example: 'Juan Pérez'
  })
  barberName: string

  /**
   * Maps domain AvailableSlot to DTO
   *
   * @param slot - Domain available slot object
   * @returns Mapped response DTO
   */
  static fromDomain(slot: {
    startTime: Date
    endTime: Date
    barberId: string
    barberName: string
  }): AvailableSlotResponseDto {
    return {
      startTime: slot.startTime.toISOString(),
      endTime: slot.endTime.toISOString(),
      barberId: slot.barberId,
      barberName: slot.barberName
    }
  }
}
