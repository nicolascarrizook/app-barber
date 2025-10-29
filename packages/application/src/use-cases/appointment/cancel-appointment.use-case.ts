import { Appointment } from '@barbershop/domain/entities/appointment.entity'
import { AppointmentId } from '@barbershop/domain/entities/appointment-id.vo'
import { Result } from '@barbershop/domain/common/result'
import { IAppointmentRepository } from '@barbershop/domain/repositories/appointment.repository.interface'

/**
 * Input DTO for CancelAppointmentUseCase
 */
export interface CancelAppointmentDTO {
  appointmentId: string
  reason: string
  cancelledBy: 'CLIENT' | 'BARBER' | 'SYSTEM'
}

/**
 * Use Case: Cancel Appointment
 *
 * Business Rules:
 * 1. Appointment must exist
 * 2. Appointment must be in a cancellable state (PENDING or CONFIRMED)
 * 3. Cannot cancel appointments that are IN_PROGRESS, COMPLETED, or already CANCELLED
 * 4. Cancellation reason is required
 * 5. Cancellation updates appointment status and records reason + timestamp
 * 6. System should emit AppointmentCancelled domain event for notifications
 *
 * This use case handles the cancellation workflow for appointments.
 */
export class CancelAppointmentUseCase {
  constructor(
    private readonly appointmentRepository: IAppointmentRepository
  ) {}

  /**
   * Execute the use case
   *
   * @param dto - Input data transfer object
   * @returns Result with cancelled appointment or error message
   */
  async execute(dto: CancelAppointmentDTO): Promise<Result<Appointment>> {
    // 1. Validate appointment ID
    const appointmentId = AppointmentId.create(dto.appointmentId)

    // 2. Load appointment
    const appointment = await this.appointmentRepository.findById(appointmentId)
    if (!appointment) {
      return Result.fail<Appointment>('Appointment not found')
    }

    // 3. Validate cancellation reason
    if (!dto.reason || dto.reason.trim().length < 3) {
      return Result.fail<Appointment>('Cancellation reason is required (minimum 3 characters)')
    }

    // 4. Attempt to cancel appointment (business logic in entity)
    const cancelResult = appointment.cancel(dto.reason || 'No reason provided')
    if (cancelResult.isFailure) {
      return Result.fail<Appointment>(cancelResult.error || "Failed to cancel appointment")
    }

    // 5. Persist the cancelled appointment
    try {
      const savedAppointment = await this.appointmentRepository.save(appointment)
      return Result.ok<Appointment>(savedAppointment)
    } catch (error) {
      // Handle optimistic locking errors
      if (error instanceof Error && error.message.includes('Optimistic locking failed')) {
        return Result.fail<Appointment>(
          'Appointment was modified by another user. Please refresh and try again.'
        )
      }

      return Result.fail<Appointment>(
        `Failed to save cancelled appointment: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}
