import { DateTime } from 'luxon'
import { PersonalInfo } from './personal-info.vo'

describe('PersonalInfo', () => {
  describe('create', () => {
    it('should create valid personal info', () => {
      const result = PersonalInfo.create('John', 'Doe')

      expect(result.isSuccess).toBe(true)
      expect(result.value.firstName).toBe('John')
      expect(result.value.lastName).toBe('Doe')
    })

    it('should create with date of birth', () => {
      const dob = DateTime.fromISO('1990-01-15')
      const result = PersonalInfo.create('John', 'Doe', dob)

      expect(result.isSuccess).toBe(true)
      expect(result.value.dateOfBirth).toEqual(dob)
    })

    it('should trim whitespace from names', () => {
      const result = PersonalInfo.create('  John  ', '  Doe  ')

      expect(result.isSuccess).toBe(true)
      expect(result.value.firstName).toBe('John')
      expect(result.value.lastName).toBe('Doe')
    })

    it('should fail when first name is empty', () => {
      const result = PersonalInfo.create('', 'Doe')

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('required')
    })

    it('should fail when last name is empty', () => {
      const result = PersonalInfo.create('John', '')

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('required')
    })

    it('should fail when first name is too short', () => {
      const result = PersonalInfo.create('J', 'Doe')

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('at least 2 characters')
    })

    it('should fail when first name is too long', () => {
      const longName = 'a'.repeat(51)
      const result = PersonalInfo.create(longName, 'Doe')

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('too long')
    })

    it('should fail when last name is too short', () => {
      const result = PersonalInfo.create('John', 'D')

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('at least 2 characters')
    })

    it('should fail when last name is too long', () => {
      const longName = 'a'.repeat(51)
      const result = PersonalInfo.create('John', longName)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('too long')
    })

    it('should fail when date of birth is in the future', () => {
      const futureDob = DateTime.now().plus({ years: 1 })
      const result = PersonalInfo.create('John', 'Doe', futureDob)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('cannot be in the future')
    })

    it('should fail when age is greater than 150 years', () => {
      const ancientDob = DateTime.now().minus({ years: 151 })
      const result = PersonalInfo.create('John', 'Doe', ancientDob)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('age > 150')
    })
  })

  describe('fullName', () => {
    it('should return full name', () => {
      const info = PersonalInfo.create('John', 'Doe').value

      expect(info.fullName).toBe('John Doe')
    })
  })

  describe('initials', () => {
    it('should return uppercase initials', () => {
      const info = PersonalInfo.create('John', 'Doe').value

      expect(info.initials).toBe('JD')
    })

    it('should return uppercase initials from lowercase names', () => {
      const info = PersonalInfo.create('john', 'doe').value

      expect(info.initials).toBe('JD')
    })
  })

  describe('age', () => {
    it('should calculate age correctly', () => {
      const dob = DateTime.now().minus({ years: 30, days: 1 })
      const info = PersonalInfo.create('John', 'Doe', dob).value

      expect(info.age).toBe(30)
    })

    it('should return undefined when no date of birth', () => {
      const info = PersonalInfo.create('John', 'Doe').value

      expect(info.age).toBeUndefined()
    })

    it('should calculate age for young person', () => {
      const dob = DateTime.now().minus({ years: 5 })
      const info = PersonalInfo.create('Jane', 'Doe', dob).value

      expect(info.age).toBe(5)
    })
  })

  describe('isAdult', () => {
    it('should return true for person over 18', () => {
      const dob = DateTime.now().minus({ years: 25 })
      const info = PersonalInfo.create('John', 'Doe', dob).value

      expect(info.isAdult()).toBe(true)
    })

    it('should return false for person under 18', () => {
      const dob = DateTime.now().minus({ years: 15 })
      const info = PersonalInfo.create('Jane', 'Doe', dob).value

      expect(info.isAdult()).toBe(false)
    })

    it('should return true for person exactly 18', () => {
      const dob = DateTime.now().minus({ years: 18, days: 1 })
      const info = PersonalInfo.create('John', 'Doe', dob).value

      expect(info.isAdult()).toBe(true)
    })

    it('should return false when no date of birth', () => {
      const info = PersonalInfo.create('John', 'Doe').value

      expect(info.isAdult()).toBe(false)
    })
  })

  describe('equals', () => {
    it('should be equal when all properties match', () => {
      const dob = DateTime.fromISO('1990-01-15')
      const info1 = PersonalInfo.create('John', 'Doe', dob).value
      const info2 = PersonalInfo.create('John', 'Doe', dob).value

      expect(info1.equals(info2)).toBe(true)
    })

    it('should not be equal when first name differs', () => {
      const info1 = PersonalInfo.create('John', 'Doe').value
      const info2 = PersonalInfo.create('Jane', 'Doe').value

      expect(info1.equals(info2)).toBe(false)
    })

    it('should not be equal when last name differs', () => {
      const info1 = PersonalInfo.create('John', 'Doe').value
      const info2 = PersonalInfo.create('John', 'Smith').value

      expect(info1.equals(info2)).toBe(false)
    })

    it('should not be equal when date of birth differs', () => {
      const dob1 = DateTime.fromISO('1990-01-15')
      const dob2 = DateTime.fromISO('1991-01-15')
      const info1 = PersonalInfo.create('John', 'Doe', dob1).value
      const info2 = PersonalInfo.create('John', 'Doe', dob2).value

      expect(info1.equals(info2)).toBe(false)
    })
  })
})
