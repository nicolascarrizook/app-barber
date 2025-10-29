import { BarberSchedule, DayOfWeek, DaySchedule } from '../barber-schedule.vo'

describe('BarberSchedule Value Object', () => {
  describe('create', () => {
    it('should create valid schedule', () => {
      const schedules: DaySchedule[] = [
        { day: DayOfWeek.MONDAY, isWorking: true, hours: { startTime: '09:00', endTime: '18:00' } },
        { day: DayOfWeek.TUESDAY, isWorking: true, hours: { startTime: '09:00', endTime: '18:00' } },
        { day: DayOfWeek.WEDNESDAY, isWorking: false }
      ]

      const result = BarberSchedule.create(schedules)

      expect(result.isSuccess).toBe(true)
      expect(result.value.totalWorkingDays).toBe(2)
    })

    it('should fail if no schedules provided', () => {
      const result = BarberSchedule.create([])

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('at least one day defined')
    })

    it('should fail if no working days', () => {
      const schedules: DaySchedule[] = [
        { day: DayOfWeek.MONDAY, isWorking: false },
        { day: DayOfWeek.TUESDAY, isWorking: false }
      ]

      const result = BarberSchedule.create(schedules)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('at least one working day')
    })

    it('should fail if working day has no hours', () => {
      const schedules: DaySchedule[] = [
        { day: DayOfWeek.MONDAY, isWorking: true }
      ]

      const result = BarberSchedule.create(schedules)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('must have hours defined')
    })

    it('should fail if start time format is invalid', () => {
      const schedules: DaySchedule[] = [
        { day: DayOfWeek.MONDAY, isWorking: true, hours: { startTime: '9:00', endTime: '18:00' } }
      ]

      const result = BarberSchedule.create(schedules)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Invalid start time format')
    })

    it('should fail if end time format is invalid', () => {
      const schedules: DaySchedule[] = [
        { day: DayOfWeek.MONDAY, isWorking: true, hours: { startTime: '09:00', endTime: '6:00 PM' } }
      ]

      const result = BarberSchedule.create(schedules)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Invalid end time format')
    })

    it('should fail if end time is before start time', () => {
      const schedules: DaySchedule[] = [
        { day: DayOfWeek.MONDAY, isWorking: true, hours: { startTime: '18:00', endTime: '09:00' } }
      ]

      const result = BarberSchedule.create(schedules)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('End time must be after start time')
    })

    it('should fail if working hours are less than 1 hour', () => {
      const schedules: DaySchedule[] = [
        { day: DayOfWeek.MONDAY, isWorking: true, hours: { startTime: '09:00', endTime: '09:30' } }
      ]

      const result = BarberSchedule.create(schedules)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('at least 1 hour')
    })

    it('should fail if working hours exceed 16 hours', () => {
      const schedules: DaySchedule[] = [
        { day: DayOfWeek.MONDAY, isWorking: true, hours: { startTime: '06:00', endTime: '23:00' } }
      ]

      const result = BarberSchedule.create(schedules)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('cannot exceed 16 hours')
    })

    it('should accept exactly 16 hours', () => {
      const schedules: DaySchedule[] = [
        { day: DayOfWeek.MONDAY, isWorking: true, hours: { startTime: '06:00', endTime: '22:00' } }
      ]

      const result = BarberSchedule.create(schedules)

      expect(result.isSuccess).toBe(true)
    })
  })

  describe('createDefault', () => {
    it('should create default schedule', () => {
      const result = BarberSchedule.createDefault()

      expect(result.isSuccess).toBe(true)
      expect(result.value.totalWorkingDays).toBe(6) // Mon-Sat
      expect(result.value.isWorkingDay(DayOfWeek.SUNDAY)).toBe(false)
    })

    it('should have correct hours for weekdays', () => {
      const schedule = BarberSchedule.createDefault().value
      const mondayHours = schedule.getWorkingHours(DayOfWeek.MONDAY)

      expect(mondayHours).toEqual({ startTime: '09:00', endTime: '18:00' })
    })

    it('should have correct hours for Saturday', () => {
      const schedule = BarberSchedule.createDefault().value
      const saturdayHours = schedule.getWorkingHours(DayOfWeek.SATURDAY)

      expect(saturdayHours).toEqual({ startTime: '09:00', endTime: '14:00' })
    })
  })

  describe('isWorkingDay', () => {
    it('should return true for working days', () => {
      const schedules: DaySchedule[] = [
        { day: DayOfWeek.MONDAY, isWorking: true, hours: { startTime: '09:00', endTime: '18:00' } },
        { day: DayOfWeek.TUESDAY, isWorking: false }
      ]
      const schedule = BarberSchedule.create(schedules).value

      expect(schedule.isWorkingDay(DayOfWeek.MONDAY)).toBe(true)
      expect(schedule.isWorkingDay(DayOfWeek.TUESDAY)).toBe(false)
    })

    it('should return false for undefined days', () => {
      const schedules: DaySchedule[] = [
        { day: DayOfWeek.MONDAY, isWorking: true, hours: { startTime: '09:00', endTime: '18:00' } }
      ]
      const schedule = BarberSchedule.create(schedules).value

      expect(schedule.isWorkingDay(DayOfWeek.WEDNESDAY)).toBe(false)
    })
  })

  describe('getWorkingHours', () => {
    it('should return hours for working days', () => {
      const schedules: DaySchedule[] = [
        { day: DayOfWeek.MONDAY, isWorking: true, hours: { startTime: '09:00', endTime: '18:00' } }
      ]
      const schedule = BarberSchedule.create(schedules).value

      const hours = schedule.getWorkingHours(DayOfWeek.MONDAY)

      expect(hours).toEqual({ startTime: '09:00', endTime: '18:00' })
    })

    it('should return null for non-working days', () => {
      const schedules: DaySchedule[] = [
        { day: DayOfWeek.MONDAY, isWorking: true, hours: { startTime: '09:00', endTime: '18:00' } },
        { day: DayOfWeek.TUESDAY, isWorking: false }
      ]
      const schedule = BarberSchedule.create(schedules).value

      const hours = schedule.getWorkingHours(DayOfWeek.TUESDAY)

      expect(hours).toBeNull()
    })
  })

  describe('getTotalWeeklyHours', () => {
    it('should calculate total weekly hours', () => {
      const schedules: DaySchedule[] = [
        { day: DayOfWeek.MONDAY, isWorking: true, hours: { startTime: '09:00', endTime: '17:00' } }, // 8h
        { day: DayOfWeek.TUESDAY, isWorking: true, hours: { startTime: '09:00', endTime: '17:00' } }, // 8h
        { day: DayOfWeek.WEDNESDAY, isWorking: false }
      ]
      const schedule = BarberSchedule.create(schedules).value

      expect(schedule.getTotalWeeklyHours()).toBe(16)
    })

    it('should handle partial hours', () => {
      const schedules: DaySchedule[] = [
        { day: DayOfWeek.MONDAY, isWorking: true, hours: { startTime: '09:00', endTime: '13:30' } } // 4.5h
      ]
      const schedule = BarberSchedule.create(schedules).value

      expect(schedule.getTotalWeeklyHours()).toBe(4.5)
    })
  })

  describe('updateDaySchedule', () => {
    it('should update existing day schedule', () => {
      const original = BarberSchedule.createDefault().value
      const newDaySchedule: DaySchedule = {
        day: DayOfWeek.MONDAY,
        isWorking: true,
        hours: { startTime: '10:00', endTime: '19:00' }
      }

      const result = original.updateDaySchedule(DayOfWeek.MONDAY, newDaySchedule)

      expect(result.isSuccess).toBe(true)
      const updatedHours = result.value.getWorkingHours(DayOfWeek.MONDAY)
      expect(updatedHours).toEqual({ startTime: '10:00', endTime: '19:00' })
    })

    it('should return new instance (immutability)', () => {
      const original = BarberSchedule.createDefault().value
      const newDaySchedule: DaySchedule = {
        day: DayOfWeek.MONDAY,
        isWorking: true,
        hours: { startTime: '10:00', endTime: '19:00' }
      }

      const result = original.updateDaySchedule(DayOfWeek.MONDAY, newDaySchedule)

      expect(result.value).not.toBe(original)
      const originalHours = original.getWorkingHours(DayOfWeek.MONDAY)
      expect(originalHours?.startTime).toBe('09:00')
    })
  })

  describe('workingDays', () => {
    it('should return all working days', () => {
      const schedules: DaySchedule[] = [
        { day: DayOfWeek.MONDAY, isWorking: true, hours: { startTime: '09:00', endTime: '18:00' } },
        { day: DayOfWeek.TUESDAY, isWorking: false },
        { day: DayOfWeek.WEDNESDAY, isWorking: true, hours: { startTime: '09:00', endTime: '18:00' } }
      ]
      const schedule = BarberSchedule.create(schedules).value

      const workingDays = schedule.workingDays

      expect(workingDays).toContain(DayOfWeek.MONDAY)
      expect(workingDays).toContain(DayOfWeek.WEDNESDAY)
      expect(workingDays).not.toContain(DayOfWeek.TUESDAY)
    })
  })
})
