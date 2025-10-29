import { ContactInfo } from './contact-info.vo'
import { Email } from './email.vo'
import { Phone } from './phone.vo'

describe('ContactInfo', () => {
  const validEmail = Email.create('test@example.com').value
  const validPhone = Phone.create('1112345678', '+54').value

  describe('create', () => {
    it('should create valid contact info without address', () => {
      const result = ContactInfo.create(validEmail, validPhone)

      expect(result.isSuccess).toBe(true)
      expect(result.value.email).toEqual(validEmail)
      expect(result.value.phone).toEqual(validPhone)
      expect(result.value.address).toBeUndefined()
    })

    it('should create valid contact info with address', () => {
      const result = ContactInfo.create(
        validEmail,
        validPhone,
        'Av. Corrientes 1234'
      )

      expect(result.isSuccess).toBe(true)
      expect(result.value.address).toBe('Av. Corrientes 1234')
    })

    it('should trim address whitespace', () => {
      const result = ContactInfo.create(
        validEmail,
        validPhone,
        '  Av. Corrientes 1234  '
      )

      expect(result.isSuccess).toBe(true)
      expect(result.value.address).toBe('Av. Corrientes 1234')
    })

    it('should fail when email is missing', () => {
      const result = ContactInfo.create(null as any, validPhone)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Email is required')
    })

    it('should fail when phone is missing', () => {
      const result = ContactInfo.create(validEmail, null as any)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Phone is required')
    })

    it('should fail when address is too short', () => {
      const result = ContactInfo.create(validEmail, validPhone, 'Av 1')

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('too short')
    })

    it('should fail when address is too long', () => {
      const longAddress = 'a'.repeat(201)
      const result = ContactInfo.create(validEmail, validPhone, longAddress)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('too long')
    })

    it('should accept minimum valid address length', () => {
      const result = ContactInfo.create(validEmail, validPhone, 'Av 12')

      expect(result.isSuccess).toBe(true)
    })

    it('should accept maximum valid address length', () => {
      const maxAddress = 'a'.repeat(200)
      const result = ContactInfo.create(validEmail, validPhone, maxAddress)

      expect(result.isSuccess).toBe(true)
    })
  })

  describe('hasAddress', () => {
    it('should return true when address is provided', () => {
      const contact = ContactInfo.create(
        validEmail,
        validPhone,
        'Av. Corrientes 1234'
      ).value

      expect(contact.hasAddress()).toBe(true)
    })

    it('should return false when address is not provided', () => {
      const contact = ContactInfo.create(validEmail, validPhone).value

      expect(contact.hasAddress()).toBe(false)
    })

    it('should return false when address is empty string', () => {
      const contact = ContactInfo.create(validEmail, validPhone, '').value

      expect(contact.hasAddress()).toBe(false)
    })
  })

  describe('updateEmail', () => {
    it('should create new contact info with updated email', () => {
      const contact = ContactInfo.create(
        validEmail,
        validPhone,
        'Av. Corrientes 1234'
      ).value

      const newEmail = Email.create('newemail@example.com').value
      const updated = contact.updateEmail(newEmail)

      expect(updated.email).toEqual(newEmail)
      expect(updated.phone).toEqual(validPhone)
      expect(updated.address).toBe('Av. Corrientes 1234')
    })

    it('should not mutate original contact info', () => {
      const contact = ContactInfo.create(validEmail, validPhone).value
      const newEmail = Email.create('newemail@example.com').value

      const updated = contact.updateEmail(newEmail)

      expect(contact.email).toEqual(validEmail)
      expect(updated.email).toEqual(newEmail)
      expect(contact).not.toEqual(updated)
    })
  })

  describe('updatePhone', () => {
    it('should create new contact info with updated phone', () => {
      const contact = ContactInfo.create(
        validEmail,
        validPhone,
        'Av. Corrientes 1234'
      ).value

      const newPhone = Phone.create('1187654321', '+54').value
      const updated = contact.updatePhone(newPhone)

      expect(updated.email).toEqual(validEmail)
      expect(updated.phone).toEqual(newPhone)
      expect(updated.address).toBe('Av. Corrientes 1234')
    })

    it('should not mutate original contact info', () => {
      const contact = ContactInfo.create(validEmail, validPhone).value
      const newPhone = Phone.create('1187654321', '+54').value

      const updated = contact.updatePhone(newPhone)

      expect(contact.phone).toEqual(validPhone)
      expect(updated.phone).toEqual(newPhone)
      expect(contact).not.toEqual(updated)
    })
  })

  describe('updateAddress', () => {
    it('should create new contact info with updated address', () => {
      const contact = ContactInfo.create(
        validEmail,
        validPhone,
        'Av. Corrientes 1234'
      ).value

      const result = contact.updateAddress('Av. Santa Fe 5678')

      expect(result.isSuccess).toBe(true)
      expect(result.value.email).toEqual(validEmail)
      expect(result.value.phone).toEqual(validPhone)
      expect(result.value.address).toBe('Av. Santa Fe 5678')
    })

    it('should fail when new address is invalid', () => {
      const contact = ContactInfo.create(validEmail, validPhone).value

      const result = contact.updateAddress('Av')

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('too short')
    })

    it('should not mutate original contact info', () => {
      const contact = ContactInfo.create(
        validEmail,
        validPhone,
        'Av. Corrientes 1234'
      ).value

      const result = contact.updateAddress('Av. Santa Fe 5678')

      expect(contact.address).toBe('Av. Corrientes 1234')
      expect(result.value.address).toBe('Av. Santa Fe 5678')
    })
  })

  describe('equals', () => {
    it('should be equal when all properties match', () => {
      const contact1 = ContactInfo.create(
        validEmail,
        validPhone,
        'Av. Corrientes 1234'
      ).value
      const contact2 = ContactInfo.create(
        validEmail,
        validPhone,
        'Av. Corrientes 1234'
      ).value

      expect(contact1.equals(contact2)).toBe(true)
    })

    it('should not be equal when email differs', () => {
      const contact1 = ContactInfo.create(validEmail, validPhone).value
      const otherEmail = Email.create('other@example.com').value
      const contact2 = ContactInfo.create(otherEmail, validPhone).value

      expect(contact1.equals(contact2)).toBe(false)
    })

    it('should not be equal when phone differs', () => {
      const contact1 = ContactInfo.create(validEmail, validPhone).value
      const otherPhone = Phone.create('1187654321', '+54').value
      const contact2 = ContactInfo.create(validEmail, otherPhone).value

      expect(contact1.equals(contact2)).toBe(false)
    })

    it('should not be equal when address differs', () => {
      const contact1 = ContactInfo.create(
        validEmail,
        validPhone,
        'Av. Corrientes 1234'
      ).value
      const contact2 = ContactInfo.create(
        validEmail,
        validPhone,
        'Av. Santa Fe 5678'
      ).value

      expect(contact1.equals(contact2)).toBe(false)
    })
  })
})
