import { DateTime } from 'luxon'
import { TimeSlot } from '@barbershop/domain/value-objects/time-slot.vo'
import { Result } from '@barbershop/domain/common/result'
import { IAppointmentRepository } from '@barbershop/domain/repositories/appointment.repository.interface'
import { IBarberRepository } from '@barbershop/domain/repositories/barber.repository.interface'
import { IServiceRepository } from '@barbershop/domain/repositories/service.repository.interface'
import { BarberId } from '@barbershop/domain/entities/barber-id.vo'
import { ServiceId } from '@barbershop/domain/entities/service-id.vo'

/**
 * Available slot response
 */
export interface AvailableSlot {
  startTime: Date
  endTime: Date
  barberId: string
  barberName: string
}

/**
 * Input DTO for GetAvailableSlotsUseCase
 */
export interface GetAvailableSlotsDTO {
  date: Date
  serviceId: string
  barberId?: string // Optional - if not provided, search all barbers
}

/**
 * Use Case: Get Available Slots
 *
 * Business Rules:
 * 1. Date must be valid and in the future (or today)
 * 2. Service must exist and be active
 * 3. Only show slots during barber working hours
 * 4. Exclude slots that conflict with existing appointments
 * 5. Consider service duration for slot calculation
 * 6. If barberId provided, only show that barber's availability
 * 7. If no barberId, show all qualified barbers' availability
 * 8. Barbers must have required skills for the service
 *
 * This is the CORE availability engine use case.
 * Critical for booking UX - must be fast and accurate.
 */
export class GetAvailableSlotsUseCase {
  private readonly SLOT_INTERVAL_MINUTES = 30 // Slots every 30 minutes
  private readonly BUFFER_MINUTES = 15 // Buffer between appointments

  constructor(
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly barberRepository: IBarberRepository,
    private readonly serviceRepository: IServiceRepository
  ) {}

  /**
   * Execute the use case
   *
   * @param dto - Input data transfer object
   * @returns Result with array of available slots
   */
  async execute(dto: GetAvailableSlotsDTO): Promise<Result<AvailableSlot[]>> {
    // 1. Validate and create DateTime
    const date = DateTime.fromJSDate(dto.date)

    // 2. Validate date is not in the past
    const now = DateTime.now()
    if (date.toJSDate() < now.toJSDate()) {
      const isToday = date.toJSDate().toDateString() === now.toJSDate().toDateString()
      if (!isToday) {
        return Result.fail<AvailableSlot[]>('Cannot get availability for past dates')
      }
    }

    // 3. Load and validate service
    const serviceId = ServiceId.create(dto.serviceId)

    const service = await this.serviceRepository.findById(serviceId)
    if (!service) {
      return Result.fail<AvailableSlot[]>('Service not found')
    }

    if (!service.isActive) {
      return Result.fail<AvailableSlot[]>('Service is not available')
    }

    // 4. Get barbers who can perform this service
    let barbers
    if (dto.barberId) {
      // Specific barber requested
      const barberId = BarberId.create(dto.barberId)

      const barber = await this.barberRepository.findById(barberId)
      if (!barber) {
        return Result.fail<AvailableSlot[]>('Barber not found')
      }

      if (!barber.status.isActive()) {
        return Result.fail<AvailableSlot[]>('Barber is not active')
      }

      // Verify barber has required skills
      const barberSkills = barber.specialties.toStringArray()
      const hasSkills = service.requiredSkills.every(skill =>
        barberSkills.includes(skill)
      )

      if (!hasSkills) {
        return Result.fail<AvailableSlot[]>(
          'Barber does not have the required skills for this service'
        )
      }

      barbers = [barber]
    } else {
      // Find all barbers who can perform this service
      barbers = await this.barberRepository.findAvailableForService(
        dto.serviceId,
        date
      )
    }

    if (barbers.length === 0) {
      return Result.ok<AvailableSlot[]>([]) // No available barbers
    }

    // 5. Calculate available slots for each barber
    const allAvailableSlots: AvailableSlot[] = []

    for (const barber of barbers) {
      const barberId = BarberId.create(barber.id.toString())
      const slots = await this.calculateBarberAvailableSlots(
        barberId,
        date,
        service.duration.minutes
      )

      // Add barber info to slots
      const slotsWithBarber = slots.map(slot => ({
        startTime: slot.startTime.toJSDate(),
        endTime: slot.endTime.toJSDate(),
        barberId: barber.id.toString(),
        barberName: barber.getDisplayName()
      }))

      allAvailableSlots.push(...slotsWithBarber)
    }

    // 6. Sort by start time
    allAvailableSlots.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())

    return Result.ok<AvailableSlot[]>(allAvailableSlots)
  }

  /**
   * Calculate available slots for a specific barber on a specific date
   *
   * @param barberId - Barber identifier
   * @param date - Date to calculate availability
   * @param serviceDurationMinutes - Service duration in minutes
   * @returns Array of available TimeSlots
   */
  private async calculateBarberAvailableSlots(
    barberId: BarberId,
    date: DateTime,
    serviceDurationMinutes: number
  ): Promise<TimeSlot[]> {
    // 1. Load barber
    const barber = await this.barberRepository.findById(barberId)
    if (!barber) return []

    // 2. Get barber's working hours for this day
    const dayOfWeekNumber = date.toJSDate().getDay() // 0=Sunday, 1=Monday, etc.
    const dayOfWeekMap = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
    const dayOfWeek = dayOfWeekMap[dayOfWeekNumber]
    const daySchedule = barber.schedule.getDaySchedule(dayOfWeek as any)

    if (!daySchedule || !daySchedule.isWorking || !daySchedule.hours) {
      return [] // Barber doesn't work on this day
    }

    const workingHoursForDay = [daySchedule.hours]

    // 3. Get existing appointments for this barber on this date
    const existingAppointments = await this.appointmentRepository.findByBarberAndDate(
      barberId,
      date
    )

    // Filter only active appointments (not cancelled or no-show)
    const activeAppointments = existingAppointments.filter(
      apt => apt.status !== 'CANCELLED' && apt.status !== 'NO_SHOW'
    )

    // 4. Generate potential slots
    const potentialSlots: TimeSlot[] = []
    const dateString = date.toJSDate().toISOString().split('T')[0]

    for (const workingHours of workingHoursForDay) {
      // Parse working hours
      const [startHour, startMinute] = workingHours.startTime.split(':').map(Number)
      const [endHour, endMinute] = workingHours.endTime.split(':').map(Number)

      // Create start and end times for the day
      const dayStart = new Date(`${dateString}T${workingHours.startTime}:00`)
      const dayEnd = new Date(`${dateString}T${workingHours.endTime}:00`)

      // Generate slots every SLOT_INTERVAL_MINUTES
      let currentTime = dayStart.getTime()
      const endTime = dayEnd.getTime() - serviceDurationMinutes * 60000 // Leave room for service

      while (currentTime <= endTime) {
        const slotStart = DateTime.fromJSDate(new Date(currentTime))
        const slotEnd = DateTime.fromJSDate(
          new Date(currentTime + serviceDurationMinutes * 60000)
        )

        const slotOrError = TimeSlot.create(slotStart, slotEnd)

        if (slotOrError.isSuccess) {
          potentialSlots.push(slotOrError.value)
        }

        currentTime += this.SLOT_INTERVAL_MINUTES * 60000
      }
    }

    // 5. Filter out slots that conflict with existing appointments
    const availableSlots = potentialSlots.filter(slot => {
      // Check if slot conflicts with any existing appointment
      const hasConflict = activeAppointments.some(appointment => {
        return slot.overlaps(appointment.slot)
      })

      return !hasConflict
    })

    // 6. Filter out slots in the past (for today)
    const now = DateTime.now()
    const futureSlotsOnly = availableSlots.filter(slot => {
      return slot.startTime.toJSDate() >= now.toJSDate()
    })

    return futureSlotsOnly
  }
}
