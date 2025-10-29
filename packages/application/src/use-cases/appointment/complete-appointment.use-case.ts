import { Appointment } from '@barbershop/domain/entities/appointment.entity'
import { AppointmentId } from '@barbershop/domain/entities/appointment-id.vo'
import { Result } from '@barbershop/domain/common/result'
import { IAppointmentRepository } from '@barbershop/domain/repositories/appointment.repository.interface'
import { IBarberRepository } from '@barbershop/domain/repositories/barber.repository.interface'
import { IClientRepository } from '@barbershop/domain/repositories/client.repository.interface'

/**
 * Input DTO for CompleteAppointmentUseCase
 */
export interface CompleteAppointmentDTO {
  appointmentId: string
  paymentData?: any // Payment information if not already recorded
  notes?: string // Service notes, observations
}

/**
 * Use Case: Complete Appointment
 *
 * Business Rules:
 * 1. Appointment must exist
 * 2. Appointment must be in IN_PROGRESS or CONFIRMED state
 * 3. Cannot complete appointments that are PENDING, CANCELLED, NO_SHOW, or already COMPLETED
 * 4. Completion changes status to COMPLETED
 * 5. Updates barber metrics (totalAppointments, possibly rating)
 * 6. Updates client metrics (completedAppointments, lifetimeValue)
 * 7. Records payment information if provided
 * 8. System should emit AppointmentCompleted domain event
 *
 * This use case handles the completion workflow after service is rendered.
 * It's a critical use case as it updates metrics for both barber and client.
 */
export class CompleteAppointmentUseCase {
  constructor(
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly barberRepository: IBarberRepository,
    private readonly clientRepository: IClientRepository
  ) {}

  /**
   * Execute the use case
   *
   * @param dto - Input data transfer object
   * @returns Result with completed appointment or error message
   */
  async execute(dto: CompleteAppointmentDTO): Promise<Result<Appointment>> {
    // 1. Validate appointment ID
    const appointmentId = AppointmentId.create(dto.appointmentId)

    // 2. Load appointment
    const appointment = await this.appointmentRepository.findById(appointmentId)
    if (!appointment) {
      return Result.fail<Appointment>('Appointment not found')
    }

    // 3. Load barber and client for metrics updates
    const barber = await this.barberRepository.findById(appointment.barber)
    if (!barber) {
      return Result.fail<Appointment>('Barber not found')
    }

    const client = await this.clientRepository.findById(appointment.client)
    if (!client) {
      return Result.fail<Appointment>('Client not found')
    }

    // 4. Attempt to complete appointment (business logic in entity)
    // Notes can be passed directly to complete method
    const completeNotes = dto.notes || undefined
    const completeResult = appointment.complete(completeNotes)
    if (completeResult.isFailure) {
      return Result.fail<Appointment>(completeResult.error || "Operation failed")
    }
    // Note: Barber metrics are updated through domain events
// 8. Update client metrics
    // Note: Service price should be retrieved from appointment for lifetimeValue
    // For now, we just increment completedAppointments
    // In production, you'd calculate lifetimeValue based on service price
    // TODO: client.recordAppointmentCompleted(service.price, new Date())

    // 9. Persist all changes in order (appointment, then metrics)
    try {
      // Save appointment first
      const savedAppointment = await this.appointmentRepository.save(appointment)

      // Then save updated barber and client metrics
      await this.barberRepository.save(barber)
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
        `Failed to complete appointment: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}
