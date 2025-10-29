import { Appointment } from '@barbershop/domain/entities/appointment.entity'
import { AppointmentId } from '@barbershop/domain/entities/appointment-id.vo'
import { Result } from '@barbershop/domain/common/result'
import { IAppointmentRepository } from '@barbershop/domain/repositories/appointment.repository.interface'
import { IClientRepository } from '@barbershop/domain/repositories/client.repository.interface'

/**
 * Input DTO for MarkNoShowUseCase
 */
export interface MarkNoShowDTO {
  appointmentId: string
  reason?: string // Optional reason for no-show
}

/**
 * Use Case: Mark Appointment as No-Show
 *
 * Business Rules:
 * 1. Appointment must exist
 * 2. Appointment must be in CONFIRMED or IN_PROGRESS state
 * 3. Cannot mark as no-show if already COMPLETED, CANCELLED, or NO_SHOW
 * 4. Marking as no-show changes status to NO_SHOW
 * 5. Updates client's no-show count (impacts loyalty/reliability metrics)
 * 6. May trigger client notification or policy enforcement
 * 7. System should emit AppointmentNoShow domain event
 *
 * This use case handles when a client doesn't show up for their appointment.
 * Important for managing client reliability and potentially enforcing policies
 * (e.g., requiring deposits after X no-shows).
 */
export class MarkNoShowUseCase {
  constructor(
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly clientRepository: IClientRepository
  ) {}

  /**
   * Execute the use case
   *
   * @param dto - Input data transfer object
   * @returns Result with no-show appointment or error message
   */
  async execute(dto: MarkNoShowDTO): Promise<Result<Appointment>> {
    // 1. Validate appointment ID
    const appointmentId = AppointmentId.create(dto.appointmentId)

    // 2. Load appointment
    const appointment = await this.appointmentRepository.findById(appointmentId)
    if (!appointment) {
      return Result.fail<Appointment>('Appointment not found')
    }

    // 3. Load client to update no-show metrics
    const client = await this.clientRepository.findById(appointment.client)
    if (!client) {
      return Result.fail<Appointment>('Client not found')
    }

    // 4. Attempt to mark as no-show (business logic in entity)
    const noShowResult = appointment.markAsNoShow()
    if (noShowResult.isFailure) {
      return Result.fail<Appointment>(noShowResult.error || "Operation failed")
    }
    // Note: Reason handling would need to be added to Appointment entity

    // 5. Update client's no-show count
    client.recordNoShow()

    // 6. Persist changes (appointment and client metrics)
    try {
      // Save appointment first
      const savedAppointment = await this.appointmentRepository.save(appointment)

      // Then save updated client metrics
      await this.clientRepository.save(client)

      return Result.ok<Appointment>(savedAppointment)
    } catch (error) {
      // Handle optimistic locking errors
      if (error instanceof Error && error.message.includes('Optimistic locking failed')) {
        return Result.fail<Appointment>(
          'Data was modified by another user. Please refresh and try again.'
        )
      }

      return Result.fail<Appointment>(
        `Failed to mark appointment as no-show: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}
