import { Appointment } from '@barbershop/domain/entities/appointment.entity'
import { AppointmentId } from '@barbershop/domain/entities/appointment-id.vo'
import { Result } from '@barbershop/domain/common/result'
import { IAppointmentRepository } from '@barbershop/domain/repositories/appointment.repository.interface'

/**
 * Input DTO for ConfirmAppointmentUseCase
 */
export interface ConfirmAppointmentDTO {
  appointmentId: string
  confirmedBy: 'CLIENT' | 'BARBER' | 'SYSTEM'
}

/**
 * Use Case: Confirm Appointment
 *
 * Business Rules:
 * 1. Appointment must exist
 * 2. Appointment must be in PENDING state
 * 3. Cannot confirm appointments that are already CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, or NO_SHOW
 * 4. Confirmation changes status from PENDING to CONFIRMED
 * 5. System should emit AppointmentConfirmed domain event for notifications
 *
 * This use case handles the confirmation workflow when a client or barber
 * confirms a pending appointment.
 */
export class ConfirmAppointmentUseCase {
  constructor(
    private readonly appointmentRepository: IAppointmentRepository
  ) {}

  /**
   * Execute the use case
   *
   * @param dto - Input data transfer object
   * @returns Result with confirmed appointment or error message
   */
  async execute(dto: ConfirmAppointmentDTO): Promise<Result<Appointment>> {
    // 1. Validate appointment ID
    const appointmentId = AppointmentId.create(dto.appointmentId)

    // 2. Load appointment
    const appointment = await this.appointmentRepository.findById(appointmentId)
    if (!appointment) {
      return Result.fail<Appointment>('Appointment not found')
    }

    // 3. Attempt to confirm appointment (business logic in entity)
    const confirmResult = appointment.confirm()
    if (confirmResult.isFailure) {
      return Result.fail<Appointment>(confirmResult.error || "Operation failed")
    }

    // 4. Persist the confirmed appointment
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
        `Failed to save confirmed appointment: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}
