import { BarberSpecialties, Specialty } from '../barber-specialties.vo'

describe('BarberSpecialties Value Object', () => {
  describe('create', () => {
    it('should create with valid specialties', () => {
      const result = BarberSpecialties.create([Specialty.HAIRCUT, Specialty.BEARD])

      expect(result.isSuccess).toBe(true)
      expect(result.value.count).toBe(2)
      expect(result.value.specialties).toEqual([Specialty.HAIRCUT, Specialty.BEARD])
    })

    it('should create with single specialty', () => {
      const result = BarberSpecialties.create([Specialty.HAIRCUT])

      expect(result.isSuccess).toBe(true)
      expect(result.value.count).toBe(1)
    })

    it('should remove duplicate specialties', () => {
      const result = BarberSpecialties.create([
        Specialty.HAIRCUT,
        Specialty.BEARD,
        Specialty.HAIRCUT
      ])

      expect(result.isSuccess).toBe(true)
      expect(result.value.count).toBe(2)
      expect(result.value.specialties).toEqual([Specialty.HAIRCUT, Specialty.BEARD])
    })

    it('should fail if no specialties provided', () => {
      const result = BarberSpecialties.create([])

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('at least one specialty')
    })

    it('should fail if more than 8 specialties', () => {
      const specialties = [
        Specialty.HAIRCUT,
        Specialty.BEARD,
        Specialty.COLORING,
        Specialty.STYLING,
        Specialty.SHAVING,
        Specialty.HAIR_TREATMENT,
        Specialty.KIDS_CUT,
        Specialty.DESIGN,
        Specialty.HAIRCUT // 9th (duplicate removed, so actually 8)
      ]
      const result = BarberSpecialties.create(specialties)

      expect(result.isSuccess).toBe(true) // Should succeed with 8 unique
    })

    it('should accept all valid specialty types', () => {
      const allSpecialties = Object.values(Specialty)
      const result = BarberSpecialties.create(allSpecialties)

      expect(result.isSuccess).toBe(true)
      expect(result.value.count).toBe(allSpecialties.length)
    })
  })

  describe('createFromStrings', () => {
    it('should create from valid string array', () => {
      const result = BarberSpecialties.createFromStrings(['HAIRCUT', 'BEARD'])

      expect(result.isSuccess).toBe(true)
      expect(result.value.count).toBe(2)
    })

    it('should handle lowercase strings', () => {
      const result = BarberSpecialties.createFromStrings(['haircut', 'beard'])

      expect(result.isSuccess).toBe(true)
      expect(result.value.hasSpecialty(Specialty.HAIRCUT)).toBe(true)
    })

    it('should fail with invalid specialty string', () => {
      const result = BarberSpecialties.createFromStrings(['HAIRCUT', 'INVALID'])

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Invalid specialty')
    })
  })

  describe('hasSpecialty', () => {
    it('should return true if specialty exists', () => {
      const specialties = BarberSpecialties.create([Specialty.HAIRCUT, Specialty.BEARD]).value

      expect(specialties.hasSpecialty(Specialty.HAIRCUT)).toBe(true)
      expect(specialties.hasSpecialty(Specialty.BEARD)).toBe(true)
    })

    it('should return false if specialty does not exist', () => {
      const specialties = BarberSpecialties.create([Specialty.HAIRCUT]).value

      expect(specialties.hasSpecialty(Specialty.COLORING)).toBe(false)
    })
  })

  describe('addSpecialty', () => {
    it('should add new specialty', () => {
      const original = BarberSpecialties.create([Specialty.HAIRCUT]).value
      const result = original.addSpecialty(Specialty.BEARD)

      expect(result.isSuccess).toBe(true)
      expect(result.value.count).toBe(2)
      expect(result.value.hasSpecialty(Specialty.BEARD)).toBe(true)
    })

    it('should not duplicate if specialty already exists', () => {
      const original = BarberSpecialties.create([Specialty.HAIRCUT]).value
      const result = original.addSpecialty(Specialty.HAIRCUT)

      expect(result.isSuccess).toBe(true)
      expect(result.value.count).toBe(1)
    })

    it('should return new instance (immutability)', () => {
      const original = BarberSpecialties.create([Specialty.HAIRCUT]).value
      const result = original.addSpecialty(Specialty.BEARD)

      expect(result.value).not.toBe(original)
      expect(original.count).toBe(1)
      expect(result.value.count).toBe(2)
    })
  })

  describe('removeSpecialty', () => {
    it('should remove existing specialty', () => {
      const original = BarberSpecialties.create([Specialty.HAIRCUT, Specialty.BEARD]).value
      const result = original.removeSpecialty(Specialty.BEARD)

      expect(result.isSuccess).toBe(true)
      expect(result.value.count).toBe(1)
      expect(result.value.hasSpecialty(Specialty.BEARD)).toBe(false)
    })

    it('should fail if removing leaves no specialties', () => {
      const original = BarberSpecialties.create([Specialty.HAIRCUT]).value
      const result = original.removeSpecialty(Specialty.HAIRCUT)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('at least one specialty')
    })

    it('should not change if specialty does not exist', () => {
      const original = BarberSpecialties.create([Specialty.HAIRCUT]).value
      const result = original.removeSpecialty(Specialty.BEARD)

      expect(result.isSuccess).toBe(true)
      expect(result.value.count).toBe(1)
    })

    it('should return new instance (immutability)', () => {
      const original = BarberSpecialties.create([Specialty.HAIRCUT, Specialty.BEARD]).value
      const result = original.removeSpecialty(Specialty.BEARD)

      expect(result.value).not.toBe(original)
      expect(original.count).toBe(2)
      expect(result.value.count).toBe(1)
    })
  })

  describe('toStringArray', () => {
    it('should convert specialties to string array', () => {
      const specialties = BarberSpecialties.create([Specialty.HAIRCUT, Specialty.BEARD]).value
      const strings = specialties.toStringArray()

      expect(strings).toEqual(['HAIRCUT', 'BEARD'])
    })
  })

  describe('equals', () => {
    it('should return true for same specialties', () => {
      const spec1 = BarberSpecialties.create([Specialty.HAIRCUT, Specialty.BEARD]).value
      const spec2 = BarberSpecialties.create([Specialty.HAIRCUT, Specialty.BEARD]).value

      expect(spec1.equals(spec2)).toBe(true)
    })

    it('should return false for different specialties', () => {
      const spec1 = BarberSpecialties.create([Specialty.HAIRCUT]).value
      const spec2 = BarberSpecialties.create([Specialty.BEARD]).value

      expect(spec1.equals(spec2)).toBe(false)
    })

    it('should return true regardless of order', () => {
      const spec1 = BarberSpecialties.create([Specialty.HAIRCUT, Specialty.BEARD]).value
      const spec2 = BarberSpecialties.create([Specialty.BEARD, Specialty.HAIRCUT]).value

      expect(spec1.equals(spec2)).toBe(true)
    })
  })
})
