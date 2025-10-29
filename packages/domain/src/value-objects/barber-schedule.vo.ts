import { ValueObject } from '../common/value-object'
import { Result } from '../common/result'

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY'
}

export interface WorkingHours {
  startTime: string // Format: "HH:MM" (24h)
  endTime: string   // Format: "HH:MM" (24h)
}

export interface DaySchedule {
  day: DayOfWeek
  isWorking: boolean
  hours?: WorkingHours
}

interface BarberScheduleProps {
  schedule: Map<DayOfWeek, DaySchedule>
}

export class BarberSchedule extends ValueObject<BarberScheduleProps> {
  private constructor(props: BarberScheduleProps) {
    super(props)
  }

  public static create(daySchedules: DaySchedule[]): Result<BarberSchedule> {
    if (!daySchedules || daySchedules.length === 0) {
      return Result.fail<BarberSchedule>('Schedule must have at least one day defined')
    }

    const scheduleMap = new Map<DayOfWeek, DaySchedule>()

    // Validate each day schedule
    for (const daySchedule of daySchedules) {
      const validationResult = this.validateDaySchedule(daySchedule)
      if (validationResult.isFailure) {
        return Result.fail<BarberSchedule>(validationResult.error!)
      }

      scheduleMap.set(daySchedule.day, daySchedule)
    }

    // Validate at least one working day
    const hasWorkingDay = Array.from(scheduleMap.values()).some(ds => ds.isWorking)
    if (!hasWorkingDay) {
      return Result.fail<BarberSchedule>('Schedule must have at least one working day')
    }

    return Result.ok<BarberSchedule>(
      new BarberSchedule({ schedule: scheduleMap })
    )
  }

  public static createDefault(): Result<BarberSchedule> {
    const defaultSchedule: DaySchedule[] = [
      { day: DayOfWeek.MONDAY, isWorking: true, hours: { startTime: '09:00', endTime: '18:00' } },
      { day: DayOfWeek.TUESDAY, isWorking: true, hours: { startTime: '09:00', endTime: '18:00' } },
      { day: DayOfWeek.WEDNESDAY, isWorking: true, hours: { startTime: '09:00', endTime: '18:00' } },
      { day: DayOfWeek.THURSDAY, isWorking: true, hours: { startTime: '09:00', endTime: '18:00' } },
      { day: DayOfWeek.FRIDAY, isWorking: true, hours: { startTime: '09:00', endTime: '18:00' } },
      { day: DayOfWeek.SATURDAY, isWorking: true, hours: { startTime: '09:00', endTime: '14:00' } },
      { day: DayOfWeek.SUNDAY, isWorking: false }
    ]

    return BarberSchedule.create(defaultSchedule)
  }

  private static validateDaySchedule(daySchedule: DaySchedule): Result<void> {
    // Validate day
    if (!Object.values(DayOfWeek).includes(daySchedule.day)) {
      return Result.fail<void>(`Invalid day: ${daySchedule.day}`)
    }

    // If working, must have hours
    if (daySchedule.isWorking && !daySchedule.hours) {
      return Result.fail<void>(`Working day ${daySchedule.day} must have hours defined`)
    }

    // If has hours, validate them
    if (daySchedule.hours) {
      const hoursValidation = this.validateWorkingHours(daySchedule.hours)
      if (hoursValidation.isFailure) {
        return hoursValidation
      }
    }

    return Result.ok<void>()
  }

  private static validateWorkingHours(hours: WorkingHours): Result<void> {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

    // Validate format
    if (!timeRegex.test(hours.startTime)) {
      return Result.fail<void>(`Invalid start time format: ${hours.startTime}. Expected HH:MM`)
    }

    if (!timeRegex.test(hours.endTime)) {
      return Result.fail<void>(`Invalid end time format: ${hours.endTime}. Expected HH:MM`)
    }

    // Validate end time is after start time
    const [startHour, startMin] = hours.startTime.split(':').map(Number)
    const [endHour, endMin] = hours.endTime.split(':').map(Number)

    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin

    if (endMinutes <= startMinutes) {
      return Result.fail<void>('End time must be after start time')
    }

    // Validate reasonable working hours (at least 1 hour, max 16 hours)
    const duration = endMinutes - startMinutes
    if (duration < 60) {
      return Result.fail<void>('Working hours must be at least 1 hour')
    }

    if (duration > 960) { // 16 hours
      return Result.fail<void>('Working hours cannot exceed 16 hours per day')
    }

    return Result.ok<void>()
  }

  get workingDays(): DayOfWeek[] {
    return Array.from(this.props.schedule.values())
      .filter(ds => ds.isWorking)
      .map(ds => ds.day)
  }

  get totalWorkingDays(): number {
    return this.workingDays.length
  }

  isWorkingDay(day: DayOfWeek): boolean {
    const daySchedule = this.props.schedule.get(day)
    return daySchedule?.isWorking || false
  }

  getWorkingHours(day: DayOfWeek): WorkingHours | null {
    const daySchedule = this.props.schedule.get(day)
    return daySchedule?.isWorking && daySchedule.hours ? daySchedule.hours : null
  }

  getDaySchedule(day: DayOfWeek): DaySchedule | null {
    return this.props.schedule.get(day) || null
  }

  getAllDaySchedules(): DaySchedule[] {
    return Array.from(this.props.schedule.values())
  }

  updateDaySchedule(day: DayOfWeek, daySchedule: DaySchedule): Result<BarberSchedule> {
    const newSchedules = this.getAllDaySchedules().filter(ds => ds.day !== day)
    newSchedules.push(daySchedule)
    return BarberSchedule.create(newSchedules)
  }

  getTotalWeeklyHours(): number {
    let totalMinutes = 0

    for (const daySchedule of this.props.schedule.values()) {
      if (daySchedule.isWorking && daySchedule.hours) {
        const [startHour, startMin] = daySchedule.hours.startTime.split(':').map(Number)
        const [endHour, endMin] = daySchedule.hours.endTime.split(':').map(Number)

        const startMinutes = startHour * 60 + startMin
        const endMinutes = endHour * 60 + endMin

        totalMinutes += endMinutes - startMinutes
      }
    }

    return totalMinutes / 60 // Return hours
  }
}
