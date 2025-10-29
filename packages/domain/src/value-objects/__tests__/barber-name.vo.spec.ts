import { BarberName } from '../barber-name.vo'

describe('BarberName Value Object', () => {
  describe('create', () => {
    it('should create valid barber name', () => {
      const result = BarberName.create('John', 'Doe')

      expect(result.isSuccess).toBe(true)
      expect(result.value.firstName).toBe('John')
      expect(result.value.lastName).toBe('Doe')
      expect(result.value.fullName).toBe('John Doe')
    })

    it('should trim whitespace from names', () => {
      const result = BarberName.create('  John  ', '  Doe  ')

      expect(result.isSuccess).toBe(true)
      expect(result.value.firstName).toBe('John')
      expect(result.value.lastName).toBe('Doe')
    })

    it('should accept names with accents', () => {
      const result = BarberName.create('José', 'García')

      expect(result.isSuccess).toBe(true)
      expect(result.value.firstName).toBe('José')
      expect(result.value.lastName).toBe('García')
    })

    it('should accept names with hyphens', () => {
      const result = BarberName.create('Jean-Pierre', 'Saint-Laurent')

      expect(result.isSuccess).toBe(true)
      expect(result.value.firstName).toBe('Jean-Pierre')
      expect(result.value.lastName).toBe('Saint-Laurent')
    })

    it('should accept names with apostrophes', () => {
      const result = BarberName.create("O'Connor", "D'Angelo")

      expect(result.isSuccess).toBe(true)
      expect(result.value.firstName).toBe("O'Connor")
      expect(result.value.lastName).toBe("D'Angelo")
    })

    it('should fail if first name is empty', () => {
      const result = BarberName.create('', 'Doe')

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('First name is required')
    })

    it('should fail if last name is empty', () => {
      const result = BarberName.create('John', '')

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Last name is required')
    })

    it('should fail if first name is too short', () => {
      const result = BarberName.create('J', 'Doe')

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('at least 2 characters')
    })

    it('should fail if last name is too short', () => {
      const result = BarberName.create('John', 'D')

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('at least 2 characters')
    })

    it('should fail if first name is too long', () => {
      const longName = 'A'.repeat(51)
      const result = BarberName.create(longName, 'Doe')

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('must not exceed 50 characters')
    })

    it('should fail if last name is too long', () => {
      const longName = 'D'.repeat(51)
      const result = BarberName.create('John', longName)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('must not exceed 50 characters')
    })

    it('should fail if first name contains numbers', () => {
      const result = BarberName.create('John123', 'Doe')

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('invalid characters')
    })

    it('should fail if last name contains special characters', () => {
      const result = BarberName.create('John', 'Doe@#$')

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('invalid characters')
    })
  })

  describe('fullName', () => {
    it('should return full name', () => {
      const name = BarberName.create('John', 'Doe').value

      expect(name.fullName).toBe('John Doe')
    })
  })

  describe('initials', () => {
    it('should return initials in uppercase', () => {
      const name = BarberName.create('john', 'doe').value

      expect(name.initials).toBe('JD')
    })

    it('should return initials for names with accents', () => {
      const name = BarberName.create('José', 'García').value

      expect(name.initials).toBe('JG')
    })
  })

  describe('equals', () => {
    it('should return true for same names', () => {
      const name1 = BarberName.create('John', 'Doe').value
      const name2 = BarberName.create('John', 'Doe').value

      expect(name1.equals(name2)).toBe(true)
    })

    it('should return false for different names', () => {
      const name1 = BarberName.create('John', 'Doe').value
      const name2 = BarberName.create('Jane', 'Doe').value

      expect(name1.equals(name2)).toBe(false)
    })
  })
})
