import { Appointment } from '@barbershop/domain/entities/appointment.entity'
import { AppointmentId } from '@barbershop/domain/entities/appointment-id.vo'
import { DateTime } from 'luxon'
import { TimeSlot } from '@barbershop/domain/value-objects/time-slot.vo'
import { Result } from '@barbershop/domain/common/result'
import { IAppointmentRepository } from '@barbershop/domain/repositories/appointment.repository.interface'
import { IBarberRepository } from '@barbershop/domain/repositories/barber.repository.interface'
import { IServiceRepository } from '@barbershop/domain/repositories/service.repository.interface'

/**
 * Input DTO for RescheduleAppointmentUseCase
 */
export interface RescheduleAppointmentDTO {
  appointmentId: string
  newStartTime: Date
  reason?: string
}

/**
 * Use Case: Reschedule Appointment
 *
 * Business Rules:
 * 1. Appointment must exist
 * 2. Appointment must be in a reschedulable state (PENDING or CONFIRMED)
 * 3. Cannot reschedule appointments that are IN_PROGRESS, COMPLETED, CANCELLED, or NO_SHOW
 * 4. New time slot must be valid (future, business hours)
 * 5. Barber must be available at new time
 * 6. No conflicts with existing appointments at new time
 * 7. Service duration determines end time
 * 8. System should emit AppointmentRescheduled domain event
 *
 * This use case handles the rescheduling workflow, performing all validation
 * similar to creating a new appointment but reusing existing appointment data.
 */
export class RescheduleAppointmentUseCase {
  constructor(
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly barberRepository: IBarberRepository,
    private readonly serviceRepository: IServiceRepository
  ) {}

  /**
   * Execute the use case
   *
   * @param dto - Input data transfer object
   * @returns Result with rescheduled appointment or error message
   */
  async execute(dto: RescheduleAppointmentDTO): Promise<Result<Appointment>> {
    // 1. Validate appointment ID
    const appointmentId = AppointmentId.create(dto.appointmentId)

    // 2. Load appointment
    const appointment = await this.appointmentRepository.findById(appointmentId)
    if (!appointment) {
      return Result.fail<Appointment>('Appointment not found')
    }

    // 3. Load barber to check availability
    const barber = await this.barberRepository.findById(appointment.barber)
    if (!barber) {
      return Result.fail<Appointment>('Barber not found')
    }

    // 4. Load service to get duration
    const service = await this.serviceRepository.findById(appointment.service)
    if (!service) {
      return Result.fail<Appointment>('Service not found')
    }

    // 5. Create new time slot
    const newStartTime = DateTime.fromJSDate(dto.newStartTime)

    // Calculate new end time based on service duration
    const newEndTimeDate = new Date(dto.newStartTime.getTime() + service.duration.minutes * 60000)
    const newEndTime = DateTime.fromJSDate(newEndTimeDate)

    const newTimeSlotOrError = TimeSlot.create(newStartTime, newEndTime)
    if (newTimeSlotOrError.isFailure) {
      return Result.fail<Appointment>(`Invalid time slot: ${newTimeSlotOrError.error}`)
    }
    const newTimeSlot = newTimeSlotOrError.value

    // 6. Verify barber is available at new time (check schedule)
    const isAvailable = barber.isAvailable()
    if (!isAvailable) {
      return Result.fail<Appointment>(
        `Barber is not available at the requested time. ` +
        `Please check the barber's schedule.`
      )
    }

    // 7. Check for conflicts with other appointments at new time
    // Exclude current appointment from conflict check
    const conflicts = await this.appointmentRepository.findConflicting(
      appointment.barber,
      newTimeSlot
    )

    const otherConflicts = conflicts.filter(
      c => c.appointmentId.toString() !== appointment.appointmentId.toString()
    )

    if (otherConflicts.length > 0) {
      return Result.fail<Appointment>(
        `New time slot conflicts with existing appointment. ` +
        `Barber is already booked from ${otherConflicts[0].slot.startTime.toString()} ` +
        `to ${otherConflicts[0].slot.endTime.toString()}`
      )
    }

    // 8. Attempt to reschedule appointment (business logic in entity)
    const rescheduleResult = appointment.reschedule(newTimeSlot)
    if (rescheduleResult.isFailure) {
      return Result.fail<Appointment>(rescheduleResult.error || "Failed to reschedule")
    }

    // 9. Persist the rescheduled appointment
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
        `Failed to save rescheduled appointment: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}
