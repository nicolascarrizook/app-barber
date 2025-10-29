import { Duration } from './duration.vo'

describe('Duration Value Object', () => {
  describe('create', () => {
    it('should create duration with valid minutes', () => {
      const result = Duration.create(30)

      expect(result.isSuccess).toBe(true)
      expect(result.value.minutes).toBe(30)
    })

    it('should create duration with maximum 8 hours', () => {
      const result = Duration.create(480)

      expect(result.isSuccess).toBe(true)
      expect(result.value.minutes).toBe(480)
    })

    it('should fail if minutes is zero', () => {
      const result = Duration.create(0)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('must be positive')
    })

    it('should fail if minutes is negative', () => {
      const result = Duration.create(-10)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('must be positive')
    })

    it('should fail if minutes exceeds 8 hours', () => {
      const result = Duration.create(481)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('cannot exceed 8 hours')
    })

    it('should fail if minutes is not integer', () => {
      const result = Duration.create(30.5)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('must be in whole minutes')
    })
  })

  describe('fromHours', () => {
    it('should create duration from hours', () => {
      const result = Duration.fromHours(1.5)

      expect(result.isSuccess).toBe(true)
      expect(result.value.minutes).toBe(90)
    })

    it('should create duration from integer hours', () => {
      const result = Duration.fromHours(2)

      expect(result.isSuccess).toBe(true)
      expect(result.value.minutes).toBe(120)
    })

    it('should fail if hours is zero', () => {
      const result = Duration.fromHours(0)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('must be positive')
    })

    it('should fail if hours is negative', () => {
      const result = Duration.fromHours(-1)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('must be positive')
    })

    it('should fail if result exceeds 8 hours', () => {
      const result = Duration.fromHours(9)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('cannot exceed 8 hours')
    })
  })

  describe('getters', () => {
    it('should get minutes', () => {
      const duration = Duration.create(45).value

      expect(duration.minutes).toBe(45)
    })

    it('should get hours', () => {
      const duration = Duration.create(90).value

      expect(duration.hours).toBe(1.5)
    })

    it('should get hours as integer', () => {
      const duration = Duration.create(120).value

      expect(duration.hours).toBe(2)
    })
  })

  describe('add', () => {
    it('should add two durations', () => {
      const d1 = Duration.create(30).value
      const d2 = Duration.create(45).value

      const result = d1.add(d2)

      expect(result.isSuccess).toBe(true)
      expect(result.value.minutes).toBe(75)
    })

    it('should fail if result exceeds maximum', () => {
      const d1 = Duration.create(300).value
      const d2 = Duration.create(200).value

      const result = d1.add(d2)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('cannot exceed 8 hours')
    })
  })

  describe('subtract', () => {
    it('should subtract two durations', () => {
      const d1 = Duration.create(90).value
      const d2 = Duration.create(30).value

      const result = d1.subtract(d2)

      expect(result.isSuccess).toBe(true)
      expect(result.value.minutes).toBe(60)
    })

    it('should fail if result is zero', () => {
      const d1 = Duration.create(30).value
      const d2 = Duration.create(30).value

      const result = d1.subtract(d2)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('must be positive')
    })

    it('should fail if result is negative', () => {
      const d1 = Duration.create(30).value
      const d2 = Duration.create(45).value

      const result = d1.subtract(d2)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('must be positive')
    })
  })

  describe('multiply', () => {
    it('should multiply duration by factor', () => {
      const duration = Duration.create(30).value

      const result = duration.multiply(2)

      expect(result.isSuccess).toBe(true)
      expect(result.value.minutes).toBe(60)
    })

    it('should multiply by decimal factor', () => {
      const duration = Duration.create(60).value

      const result = duration.multiply(1.5)

      expect(result.isSuccess).toBe(true)
      expect(result.value.minutes).toBe(90)
    })

    it('should fail if factor is zero', () => {
      const duration = Duration.create(30).value

      const result = duration.multiply(0)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('must be positive')
    })

    it('should fail if factor is negative', () => {
      const duration = Duration.create(30).value

      const result = duration.multiply(-1)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('must be positive')
    })

    it('should fail if result exceeds maximum', () => {
      const duration = Duration.create(300).value

      const result = duration.multiply(2)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('cannot exceed 8 hours')
    })
  })

  describe('comparisons', () => {
    it('should check if longer than', () => {
      const d1 = Duration.create(60).value
      const d2 = Duration.create(30).value

      expect(d1.isLongerThan(d2)).toBe(true)
      expect(d2.isLongerThan(d1)).toBe(false)
    })

    it('should check if shorter than', () => {
      const d1 = Duration.create(30).value
      const d2 = Duration.create(60).value

      expect(d1.isShorterThan(d2)).toBe(true)
      expect(d2.isShorterThan(d1)).toBe(false)
    })

    it('should check equality', () => {
      const d1 = Duration.create(45).value
      const d2 = Duration.create(45).value

      expect(d1.equals(d2)).toBe(true)
    })

    it('should return false for different durations', () => {
      const d1 = Duration.create(30).value
      const d2 = Duration.create(45).value

      expect(d1.equals(d2)).toBe(false)
    })

    it('should return false for null', () => {
      const d1 = Duration.create(30).value

      expect(d1.equals(null as any)).toBe(false)
    })
  })

  describe('toString', () => {
    it('should format minutes only', () => {
      const duration = Duration.create(45).value

      expect(duration.toString()).toBe('45min')
    })

    it('should format hours only', () => {
      const duration = Duration.create(120).value

      expect(duration.toString()).toBe('2h')
    })

    it('should format hours and minutes', () => {
      const duration = Duration.create(90).value

      expect(duration.toString()).toBe('1h 30min')
    })

    it('should format multiple hours and minutes', () => {
      const duration = Duration.create(150).value

      expect(duration.toString()).toBe('2h 30min')
    })
  })

  describe('immutability', () => {
    it('should be immutable', () => {
      const duration = Duration.create(30).value

      expect(() => {
        (duration as any).props.minutes = 60
      }).toThrow()
    })

    it('should return new instance on operations', () => {
      const d1 = Duration.create(30).value
      const d2 = Duration.create(15).value

      const result = d1.add(d2)

      expect(result.value).not.toBe(d1)
      expect(d1.minutes).toBe(30)
      expect(result.value.minutes).toBe(45)
    })
  })
})
