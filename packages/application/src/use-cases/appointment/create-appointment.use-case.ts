import { Appointment } from '@barbershop/domain/entities/appointment.entity'
import { BarberId } from '@barbershop/domain/entities/barber-id.vo'
import { ClientId } from '@barbershop/domain/entities/client-id.vo'
import { ServiceId } from '@barbershop/domain/entities/service-id.vo'
import { DateTime } from 'luxon'
import { TimeSlot } from '@barbershop/domain/value-objects/time-slot.vo'
import { PaymentInfo, PaymentMethod } from '@barbershop/domain/value-objects/payment-info.vo'
import { Result } from '@barbershop/domain/common/result'
import { IAppointmentRepository } from '@barbershop/domain/repositories/appointment.repository.interface'
import { IBarberRepository } from '@barbershop/domain/repositories/barber.repository.interface'
import { IClientRepository } from '@barbershop/domain/repositories/client.repository.interface'
import { IServiceRepository } from '@barbershop/domain/repositories/service.repository.interface'

/**
 * Input DTO for CreateAppointmentUseCase
 */
export interface CreateAppointmentDTO {
  barberId: string
  clientId: string
  serviceId: string
  startTime: Date
  notes?: string
}

/**
 * Use Case: Create Appointment
 *
 * Business Rules:
 * 1. Barber must exist and be active
 * 2. Client must exist and be active
 * 3. Service must exist and be active
 * 4. Time slot must be valid (start < end, future, business hours)
 * 5. No conflicts with existing appointments for that barber
 * 6. Barber must have required skills for the service
 * 7. Barber must be available according to their schedule
 *
 * This is the CORE use case of the booking engine.
 * All business logic is enforced here, not in the UI or API layer.
 */
export class CreateAppointmentUseCase {
  constructor(
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly barberRepository: IBarberRepository,
    private readonly clientRepository: IClientRepository,
    private readonly serviceRepository: IServiceRepository
  ) {}

  /**
   * Execute the use case
   *
   * @param dto - Input data transfer object
   * @returns Result with created appointment or error message
   */
  async execute(dto: CreateAppointmentDTO): Promise<Result<Appointment>> {
    // 1. Validate and fetch barber
    const barberId = BarberId.create(dto.barberId)

    const barber = await this.barberRepository.findById(barberId)
    if (!barber) {
      return Result.fail<Appointment>('Barber not found')
    }

    if (!barber.status.isActive()) {
      return Result.fail<Appointment>('Barber is not active')
    }

    // 2. Validate and fetch client
    const clientId = ClientId.create(dto.clientId)

    const client = await this.clientRepository.findById(clientId)
    if (!client) {
      return Result.fail<Appointment>('Client not found')
    }

    if (!client.status.isActive()) {
      return Result.fail<Appointment>('Client is not active')
    }

    // 3. Validate and fetch service
    const serviceId = ServiceId.create(dto.serviceId)

    const service = await this.serviceRepository.findById(serviceId)
    if (!service) {
      return Result.fail<Appointment>('Service not found')
    }

    if (!service.isActive) {
      return Result.fail<Appointment>('Service is not available')
    }

    // 4. Verify barber has required skills for the service
    const barberSkills = barber.specialties.toStringArray()
    const hasRequiredSkills = service.requiredSkills.every(skill =>
      barberSkills.includes(skill)
    )

    if (!hasRequiredSkills) {
      return Result.fail<Appointment>(
        `Barber does not have the required skills for this service. ` +
        `Required: ${service.requiredSkills.join(', ')}`
      )
    }

    // 5. Create time slot
    const startTime = DateTime.fromJSDate(dto.startTime)

    // Calculate end time based on service duration
    const endTimeDate = new Date(dto.startTime.getTime() + service.duration.minutes * 60000)
    const endTime = DateTime.fromJSDate(endTimeDate)

    const timeSlotOrError = TimeSlot.create(startTime, endTime)
    if (timeSlotOrError.isFailure) {
      return Result.fail<Appointment>(`Invalid time slot: ${timeSlotOrError.error}`)
    }
    const timeSlot = timeSlotOrError.value

    // 6. Verify barber is available at that time (check schedule)
    const isAvailable = barber.isAvailable()
    if (!isAvailable) {
      return Result.fail<Appointment>(
        `Barber is not available at the requested time. ` +
        `Please check the barber's schedule.`
      )
    }

    // 7. Check for conflicts with existing appointments
    const conflicts = await this.appointmentRepository.findConflicting(barberId, timeSlot)
    if (conflicts.length > 0) {
      return Result.fail<Appointment>(
        `Time slot conflicts with existing appointment. ` +
        `Barber is already booked from ${conflicts[0].slot.startTime.toString()} ` +
        `to ${conflicts[0].slot.endTime.toString()}`
      )
    }

    // 8. Create payment info
    const payment = PaymentInfo.pending(service.price)

    // 9. Create the appointment
    const appointmentOrError = Appointment.create({
      barber: barberId,
      client: clientId,
      service: serviceId,
      slot: timeSlot,
      payment,
      notes: dto.notes
    })

    if (appointmentOrError.isFailure) {
      return Result.fail<Appointment>(`Failed to create appointment: ${appointmentOrError.error}`)
    }
    const appointment = appointmentOrError.value

    // 10. Persist the appointment
    try {
      const savedAppointment = await this.appointmentRepository.save(appointment)
      return Result.ok<Appointment>(savedAppointment)
    } catch (error) {
      return Result.fail<Appointment>(
        `Failed to save appointment: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}
