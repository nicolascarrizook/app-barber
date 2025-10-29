import { Email } from './email.vo'

describe('Email', () => {
  describe('create', () => {
    it('should create valid email', () => {
      const result = Email.create('test@example.com')

      expect(result.isSuccess).toBe(true)
      expect(result.value.value).toBe('test@example.com')
    })

    it('should normalize to lowercase', () => {
      const result = Email.create('TEST@EXAMPLE.COM')

      expect(result.isSuccess).toBe(true)
      expect(result.value.value).toBe('test@example.com')
    })

    it('should trim whitespace', () => {
      const result = Email.create('  test@example.com  ')

      expect(result.isSuccess).toBe(true)
      expect(result.value.value).toBe('test@example.com')
    })

    it('should fail when empty', () => {
      const result = Email.create('')

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('required')
    })

    it('should fail with invalid format', () => {
      const result = Email.create('invalid-email')

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Invalid email format')
    })

    it('should fail when too long', () => {
      const longEmail = 'a'.repeat(250) + '@example.com'
      const result = Email.create(longEmail)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('too long')
    })

    it('should accept email with subdomain', () => {
      const result = Email.create('test@mail.example.com')

      expect(result.isSuccess).toBe(true)
    })

    it('should accept email with numbers', () => {
      const result = Email.create('user123@example.com')

      expect(result.isSuccess).toBe(true)
    })
  })

  describe('domain', () => {
    it('should extract domain correctly', () => {
      const email = Email.create('test@example.com').value

      expect(email.domain).toBe('example.com')
    })
  })

  describe('localPart', () => {
    it('should extract local part correctly', () => {
      const email = Email.create('test@example.com').value

      expect(email.localPart).toBe('test')
    })
  })

  describe('isFromDomain', () => {
    it('should return true for same domain', () => {
      const email = Email.create('test@example.com').value

      expect(email.isFromDomain('example.com')).toBe(true)
    })

    it('should return false for different domain', () => {
      const email = Email.create('test@example.com').value

      expect(email.isFromDomain('other.com')).toBe(false)
    })

    it('should be case insensitive', () => {
      const email = Email.create('test@example.com').value

      expect(email.isFromDomain('EXAMPLE.COM')).toBe(true)
    })
  })
})
