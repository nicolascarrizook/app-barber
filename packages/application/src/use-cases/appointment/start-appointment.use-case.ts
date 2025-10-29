import { Appointment } from '@barbershop/domain/entities/appointment.entity'
import { AppointmentId } from '@barbershop/domain/entities/appointment-id.vo'
import { Result } from '@barbershop/domain/common/result'
import { IAppointmentRepository } from '@barbershop/domain/repositories/appointment.repository.interface'

/**
 * Input DTO for StartAppointmentUseCase
 */
export interface StartAppointmentDTO {
  appointmentId: string
}

/**
 * Use Case: Start Appointment
 *
 * Business Rules:
 * 1. Appointment must exist
 * 2. Appointment must be in CONFIRMED state
 * 3. Cannot start appointments that are PENDING, IN_PROGRESS, COMPLETED, CANCELLED, or NO_SHOW
 * 4. Starting changes status to IN_PROGRESS
 * 5. Records the actual start time
 * 6. System should emit AppointmentStarted domain event
 *
 * This use case handles when a barber begins providing service to a client.
 * It's important for tracking actual service time vs. scheduled time.
 */
export class StartAppointmentUseCase {
  constructor(private readonly appointmentRepository: IAppointmentRepository) {}

  /**
   * Execute the use case
   *
   * @param dto - Input data transfer object
   * @returns Result with started appointment or error message
   */
  async execute(dto: StartAppointmentDTO): Promise<Result<Appointment>> {
    // 1. Validate appointment ID
    const appointmentId = AppointmentId.create(dto.appointmentId)

    // 2. Load appointment
    const appointment = await this.appointmentRepository.findById(appointmentId)
    if (!appointment) {
      return Result.fail<Appointment>('Appointment not found')
    }

    // 3. Attempt to start appointment (business logic in entity)
    const startResult = appointment.start()
    if (startResult.isFailure) {
      return Result.fail<Appointment>(startResult.error || "Operation failed")
    }

    // 4. Persist the started appointment
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
        `Failed to save started appointment: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}
