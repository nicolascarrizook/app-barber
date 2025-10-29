import { DateTime, Duration } from 'luxon'
import { TimeSlot } from './time-slot.vo'

describe('TimeSlot', () => {
  const now = DateTime.now()
  const futureStart = now.plus({ hours: 1 })
  const futureEnd = now.plus({ hours: 2 })

  describe('create', () => {
    it('should create valid time slot', () => {
      const result = TimeSlot.create(futureStart, futureEnd)

      expect(result.isSuccess).toBe(true)
      expect(result.value.startTime).toEqual(futureStart)
      expect(result.value.endTime).toEqual(futureEnd)
    })

    it('should fail when end time is before start time', () => {
      const result = TimeSlot.create(futureEnd, futureStart)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('End time must be after start time')
    })

    it('should fail when end time equals start time', () => {
      const result = TimeSlot.create(futureStart, futureStart)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('End time must be after start time')
    })

    it('should fail when start time is in the past', () => {
      const pastStart = now.minus({ hours: 2 })
      const pastEnd = now.minus({ hours: 1 })

      const result = TimeSlot.create(pastStart, pastEnd)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('cannot be in the past')
    })
  })

  describe('createWithoutPastValidation', () => {
    it('should create slot with past time', () => {
      const pastStart = now.minus({ hours: 2 })
      const pastEnd = now.minus({ hours: 1 })

      const result = TimeSlot.createWithoutPastValidation(pastStart, pastEnd)

      expect(result.isSuccess).toBe(true)
    })

    it('should still fail when end time is before start time', () => {
      const result = TimeSlot.createWithoutPastValidation(futureEnd, futureStart)

      expect(result.isFailure).toBe(true)
    })
  })

  describe('duration', () => {
    it('should calculate duration correctly', () => {
      const slot = TimeSlot.create(futureStart, futureEnd).value

      expect(slot.durationInMinutes).toBe(60)
    })

    it('should calculate duration for 30 minutes', () => {
      const start = now.plus({ hours: 1 })
      const end = start.plus({ minutes: 30 })
      const slot = TimeSlot.create(start, end).value

      expect(slot.durationInMinutes).toBe(30)
    })
  })

  describe('overlaps', () => {
    it('should detect overlap when slots intersect', () => {
      const slot1 = TimeSlot.create(
        now.plus({ hours: 1 }),
        now.plus({ hours: 3 })
      ).value

      const slot2 = TimeSlot.create(
        now.plus({ hours: 2 }),
        now.plus({ hours: 4 })
      ).value

      expect(slot1.overlaps(slot2)).toBe(true)
      expect(slot2.overlaps(slot1)).toBe(true)
    })

    it('should not detect overlap when slots do not intersect', () => {
      const slot1 = TimeSlot.create(
        now.plus({ hours: 1 }),
        now.plus({ hours: 2 })
      ).value

      const slot2 = TimeSlot.create(
        now.plus({ hours: 3 }),
        now.plus({ hours: 4 })
      ).value

      expect(slot1.overlaps(slot2)).toBe(false)
      expect(slot2.overlaps(slot1)).toBe(false)
    })

    it('should not overlap when one ends exactly when other starts', () => {
      const slot1 = TimeSlot.create(
        now.plus({ hours: 1 }),
        now.plus({ hours: 2 })
      ).value

      const slot2 = TimeSlot.create(
        now.plus({ hours: 2 }),
        now.plus({ hours: 3 })
      ).value

      expect(slot1.overlaps(slot2)).toBe(false)
    })
  })

  describe('isValid', () => {
    it('should be valid for future slot', () => {
      const slot = TimeSlot.create(futureStart, futureEnd).value

      expect(slot.isValid()).toBe(true)
    })

    it('should be invalid for past slot', () => {
      const pastStart = now.minus({ hours: 2 })
      const pastEnd = now.minus({ hours: 1 })
      const slot = TimeSlot.createWithoutPastValidation(pastStart, pastEnd).value

      expect(slot.isValid()).toBe(false)
    })
  })

  describe('isPast', () => {
    it('should return true for past slot', () => {
      const pastStart = now.minus({ hours: 2 })
      const pastEnd = now.minus({ hours: 1 })
      const slot = TimeSlot.createWithoutPastValidation(pastStart, pastEnd).value

      expect(slot.isPast()).toBe(true)
    })

    it('should return false for future slot', () => {
      const slot = TimeSlot.create(futureStart, futureEnd).value

      expect(slot.isPast()).toBe(false)
    })
  })

  describe('isFuture', () => {
    it('should return true for future slot', () => {
      const slot = TimeSlot.create(futureStart, futureEnd).value

      expect(slot.isFuture()).toBe(true)
    })
  })

  describe('includes', () => {
    it('should return true when time is within slot', () => {
      const slot = TimeSlot.create(futureStart, futureEnd).value
      const middleTime = futureStart.plus({ minutes: 30 })

      expect(slot.includes(middleTime)).toBe(true)
    })

    it('should return false when time is outside slot', () => {
      const slot = TimeSlot.create(futureStart, futureEnd).value
      const outsideTime = futureEnd.plus({ minutes: 10 })

      expect(slot.includes(outsideTime)).toBe(false)
    })
  })

  describe('shift', () => {
    it('should shift slot by given duration', () => {
      const slot = TimeSlot.create(futureStart, futureEnd).value
      const shifted = slot.shift(Duration.fromObject({ hours: 1 }))

      expect(shifted.startTime).toEqual(futureStart.plus({ hours: 1 }))
      expect(shifted.endTime).toEqual(futureEnd.plus({ hours: 1 }))
    })
  })

  describe('extend', () => {
    it('should extend slot end time', () => {
      const slot = TimeSlot.create(futureStart, futureEnd).value
      const extended = slot.extend(Duration.fromObject({ minutes: 30 }))

      expect(extended.startTime).toEqual(futureStart)
      expect(extended.endTime).toEqual(futureEnd.plus({ minutes: 30 }))
    })
  })

  describe('equals', () => {
    it('should be equal when times are the same', () => {
      const slot1 = TimeSlot.create(futureStart, futureEnd).value
      const slot2 = TimeSlot.create(futureStart, futureEnd).value

      expect(slot1.equals(slot2)).toBe(true)
    })

    it('should not be equal when times are different', () => {
      const slot1 = TimeSlot.create(futureStart, futureEnd).value
      const slot2 = TimeSlot.create(
        futureStart.plus({ hours: 1 }),
        futureEnd.plus({ hours: 1 })
      ).value

      expect(slot1.equals(slot2)).toBe(false)
    })
  })
})
