import { Phone } from './phone.vo'

describe('Phone', () => {
  describe('create', () => {
    it('should create valid phone', () => {
      const result = Phone.create('1112345678', '+54')

      expect(result.isSuccess).toBe(true)
      expect(result.value.value).toBe('1112345678')
      expect(result.value.countryCode).toBe('+54')
    })

    it('should use default country code', () => {
      const result = Phone.create('1112345678')

      expect(result.isSuccess).toBe(true)
      expect(result.value.countryCode).toBe('+54')
    })

    it('should clean spaces and dashes', () => {
      const result = Phone.create('11-1234-5678', '+54')

      expect(result.isSuccess).toBe(true)
      expect(result.value.value).toBe('1112345678')
    })

    it('should clean parentheses', () => {
      const result = Phone.create('(11) 1234-5678', '+54')

      expect(result.isSuccess).toBe(true)
      expect(result.value.value).toBe('1112345678')
    })

    it('should fail when empty', () => {
      const result = Phone.create('')

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('required')
    })

    it('should fail with invalid format', () => {
      const result = Phone.create('12345')

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Invalid phone format')
    })

    it('should fail when too long', () => {
      const result = Phone.create('1234567890123456')

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Invalid phone format')
    })

    it('should fail with invalid country code', () => {
      const result = Phone.create('1112345678', '54')

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Invalid country code')
    })
  })

  describe('fullNumber', () => {
    it('should return full international format', () => {
      const phone = Phone.create('1112345678', '+54').value

      expect(phone.fullNumber).toBe('+541112345678')
    })
  })

  describe('format', () => {
    it('should format Argentine number correctly', () => {
      const phone = Phone.create('1112345678', '+54').value

      expect(phone.format()).toBe('+54 11 1234-5678')
    })

    it('should use default format for other countries', () => {
      const phone = Phone.create('123456789', '+1').value

      expect(phone.format()).toBe('+1 123456789')
    })
  })

  describe('isArgentine', () => {
    it('should return true for Argentine phone', () => {
      const phone = Phone.create('1112345678', '+54').value

      expect(phone.isArgentine()).toBe(true)
    })

    it('should return false for non-Argentine phone', () => {
      const phone = Phone.create('123456789', '+1').value

      expect(phone.isArgentine()).toBe(false)
    })
  })
})
