import { Client } from '../client.entity'
import { Email } from '../../value-objects/email.vo'
import { Phone } from '../../value-objects/phone.vo'
import { Money } from '../../value-objects/money.vo'
import { Currency } from '../../value-objects/currency.vo'
import { ClientPreferences } from '../../value-objects/client-preferences.vo'
import { LoyaltyTier } from '../../value-objects/client-history.vo'
import {
  ClientCreatedEvent,
  ClientUpdatedEvent,
  ClientActivatedEvent,
  ClientDeactivatedEvent,
  ClientSuspendedEvent,
  ClientBlockedEvent,
  ClientPreferencesUpdatedEvent,
  ClientAppointmentCompletedEvent
} from '../../events/client.events'

describe('Client Entity', () => {
  const validEmail = Email.create('test@example.com').value
  const validPhone = Phone.create('1234567890', '+54').value

  describe('create', () => {
    it('should create client with valid data', () => {
      const result = Client.create({
        firstName: 'John',
        lastName: 'Doe',
        email: validEmail,
        phone: validPhone
      })

      expect(result.isSuccess).toBe(true)
      expect(result.value.firstName).toBe('John')
      expect(result.value.lastName).toBe('Doe')
      expect(result.value.fullName).toBe('John Doe')
      expect(result.value.email).toBe(validEmail)
      expect(result.value.phone).toBe(validPhone)
      expect(result.value.status.isActive()).toBe(true)
      expect(result.value.history.isNewClient()).toBe(true)
    })

    it('should emit ClientCreatedEvent on creation', () => {
      const result = Client.create({
        firstName: 'John',
        lastName: 'Doe',
        email: validEmail,
        phone: validPhone
      })

      expect(result.value.domainEvents).toHaveLength(1)
      expect(result.value.domainEvents[0]).toBeInstanceOf(ClientCreatedEvent)
    })

    it('should trim whitespace from names', () => {
      const result = Client.create({
        firstName: '  John  ',
        lastName: '  Doe  ',
        email: validEmail,
        phone: validPhone
      })

      expect(result.isSuccess).toBe(true)
      expect(result.value.firstName).toBe('John')
      expect(result.value.lastName).toBe('Doe')
    })

    it('should create with custom preferences', () => {
      const preferences = ClientPreferences.createDefault('en')
      const result = Client.create({
        firstName: 'John',
        lastName: 'Doe',
        email: validEmail,
        phone: validPhone,
        preferences
      })

      expect(result.isSuccess).toBe(true)
      expect(result.value.preferences.language).toBe('en')
    })

    it('should create with notes', () => {
      const result = Client.create({
        firstName: 'John',
        lastName: 'Doe',
        email: validEmail,
        phone: validPhone,
        notes: 'Regular customer'
      })

      expect(result.isSuccess).toBe(true)
      expect(result.value.notes).toBe('Regular customer')
    })

    it('should fail if firstName is empty', () => {
      const result = Client.create({
        firstName: '',
        lastName: 'Doe',
        email: validEmail,
        phone: validPhone
      })

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('First name is required')
    })

    it('should fail if firstName is too short', () => {
      const result = Client.create({
        firstName: 'J',
        lastName: 'Doe',
        email: validEmail,
        phone: validPhone
      })

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('at least 2 characters')
    })

    it('should fail if firstName is too long', () => {
      const result = Client.create({
        firstName: 'a'.repeat(51),
        lastName: 'Doe',
        email: validEmail,
        phone: validPhone
      })

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('must not exceed 50 characters')
    })

    it('should fail if firstName has invalid characters', () => {
      const result = Client.create({
        firstName: 'John123',
        lastName: 'Doe',
        email: validEmail,
        phone: validPhone
      })

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('invalid characters')
    })

    it('should accept firstName with accents', () => {
      const result = Client.create({
        firstName: 'José',
        lastName: 'García',
        email: validEmail,
        phone: validPhone
      })

      expect(result.isSuccess).toBe(true)
    })

    it('should accept firstName with hyphens', () => {
      const result = Client.create({
        firstName: 'Mary-Jane',
        lastName: 'Watson',
        email: validEmail,
        phone: validPhone
      })

      expect(result.isSuccess).toBe(true)
    })

    it('should accept firstName with apostrophes', () => {
      const result = Client.create({
        firstName: "O'Connor",
        lastName: 'Smith',
        email: validEmail,
        phone: validPhone
      })

      expect(result.isSuccess).toBe(true)
    })

    it('should fail if lastName is empty', () => {
      const result = Client.create({
        firstName: 'John',
        lastName: '',
        email: validEmail,
        phone: validPhone
      })

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Last name is required')
    })

    it('should fail if lastName is too short', () => {
      const result = Client.create({
        firstName: 'John',
        lastName: 'D',
        email: validEmail,
        phone: validPhone
      })

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('at least 2 characters')
    })

    it('should fail if lastName is too long', () => {
      const result = Client.create({
        firstName: 'John',
        lastName: 'a'.repeat(51),
        email: validEmail,
        phone: validPhone
      })

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('must not exceed 50 characters')
    })

    it('should fail if lastName has invalid characters', () => {
      const result = Client.create({
        firstName: 'John',
        lastName: 'Doe123',
        email: validEmail,
        phone: validPhone
      })

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('invalid characters')
    })

    it('should fail if notes exceed 2000 characters', () => {
      const result = Client.create({
        firstName: 'John',
        lastName: 'Doe',
        email: validEmail,
        phone: validPhone,
        notes: 'a'.repeat(2001)
      })

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('must not exceed 2000 characters')
    })

    it('should accept exactly 2000 characters in notes', () => {
      const result = Client.create({
        firstName: 'John',
        lastName: 'Doe',
        email: validEmail,
        phone: validPhone,
        notes: 'a'.repeat(2000)
      })

      expect(result.isSuccess).toBe(true)
    })
  })

  describe('updateInfo', () => {
    let client: Client

    beforeEach(() => {
      client = Client.create({
        firstName: 'John',
        lastName: 'Doe',
        email: validEmail,
        phone: validPhone
      }).value
      client.clearEvents()
    })

    it('should update first name', () => {
      const result = client.updateInfo({ firstName: 'Jane' })

      expect(result.isSuccess).toBe(true)
      expect(client.firstName).toBe('Jane')
    })

    it('should update last name', () => {
      const result = client.updateInfo({ lastName: 'Smith' })

      expect(result.isSuccess).toBe(true)
      expect(client.lastName).toBe('Smith')
    })

    it('should update phone', () => {
      const newPhone = Phone.create('9876543210', '+54').value
      const result = client.updateInfo({ phone: newPhone })

      expect(result.isSuccess).toBe(true)
      expect(client.phone).toBe(newPhone)
    })

    it('should update notes', () => {
      const result = client.updateInfo({ notes: 'VIP customer' })

      expect(result.isSuccess).toBe(true)
      expect(client.notes).toBe('VIP customer')
    })

    it('should update multiple fields', () => {
      const newPhone = Phone.create('9876543210', '+54').value
      const result = client.updateInfo({
        firstName: 'Jane',
        lastName: 'Smith',
        phone: newPhone,
        notes: 'Updated info'
      })

      expect(result.isSuccess).toBe(true)
      expect(client.firstName).toBe('Jane')
      expect(client.lastName).toBe('Smith')
      expect(client.phone).toBe(newPhone)
      expect(client.notes).toBe('Updated info')
    })

    it('should emit ClientUpdatedEvent', () => {
      client.updateInfo({ firstName: 'Jane' })

      expect(client.domainEvents).toHaveLength(1)
      expect(client.domainEvents[0]).toBeInstanceOf(ClientUpdatedEvent)
    })

    it('should fail if firstName is invalid', () => {
      const result = client.updateInfo({ firstName: 'J' })

      expect(result.isFailure).toBe(true)
    })

    it('should fail if lastName is invalid', () => {
      const result = client.updateInfo({ lastName: 'D' })

      expect(result.isFailure).toBe(true)
    })

    it('should fail if notes exceed limit', () => {
      const result = client.updateInfo({ notes: 'a'.repeat(2001) })

      expect(result.isFailure).toBe(true)
    })
  })

  describe('updatePreferences', () => {
    let client: Client

    beforeEach(() => {
      client = Client.create({
        firstName: 'John',
        lastName: 'Doe',
        email: validEmail,
        phone: validPhone
      }).value
      client.clearEvents()
    })

    it('should update preferences', () => {
      const newPrefs = ClientPreferences.createDefault('en')
      const result = client.updatePreferences(newPrefs)

      expect(result.isSuccess).toBe(true)
      expect(client.preferences.language).toBe('en')
    })

    it('should emit ClientPreferencesUpdatedEvent', () => {
      const newPrefs = ClientPreferences.createDefault('en')
      client.updatePreferences(newPrefs)

      expect(client.domainEvents).toHaveLength(1)
      expect(client.domainEvents[0]).toBeInstanceOf(ClientPreferencesUpdatedEvent)
    })

    it('should fail if client is inactive', () => {
      client.deactivate('Test')
      const newPrefs = ClientPreferences.createDefault('en')

      const result = client.updatePreferences(newPrefs)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Cannot update preferences of inactive client')
    })
  })

  describe('updateLanguage', () => {
    let client: Client

    beforeEach(() => {
      client = Client.create({
        firstName: 'John',
        lastName: 'Doe',
        email: validEmail,
        phone: validPhone
      }).value
      client.clearEvents()
    })

    it('should update language', () => {
      const result = client.updateLanguage('en')

      expect(result.isSuccess).toBe(true)
      expect(client.preferences.language).toBe('en')
    })

    it('should emit ClientPreferencesUpdatedEvent', () => {
      client.updateLanguage('en')

      expect(client.domainEvents).toHaveLength(1)
      expect(client.domainEvents[0]).toBeInstanceOf(ClientPreferencesUpdatedEvent)
    })
  })

  describe('recordAppointmentCompleted', () => {
    let client: Client

    beforeEach(() => {
      client = Client.create({
        firstName: 'John',
        lastName: 'Doe',
        email: validEmail,
        phone: validPhone
      }).value
      // Need to record appointment created first
      client['props'].history = client.history.recordAppointmentCreated().value
      client.clearEvents()
    })

    it('should record completed appointment', () => {
      const amount = Money.create(500, Currency.ARS).value
      const date = new Date()

      const result = client.recordAppointmentCompleted(amount, date)

      expect(result.isSuccess).toBe(true)
      expect(client.history.completedAppointments).toBe(1)
      expect(client.history.lifetimeValue.amount).toBe(500)
    })

    it('should emit ClientAppointmentCompletedEvent', () => {
      const amount = Money.create(500, Currency.ARS).value
      const date = new Date()

      client.recordAppointmentCompleted(amount, date)

      expect(client.domainEvents).toHaveLength(1)
      expect(client.domainEvents[0]).toBeInstanceOf(ClientAppointmentCompletedEvent)
    })

    it('should update loyalty tier after multiple completions', () => {
      const amount = Money.create(500, Currency.ARS).value
      const date = new Date()

      // Complete 10 appointments to reach SILVER
      for (let i = 0; i < 10; i++) {
        client['props'].history = client.history.recordAppointmentCreated().value
        client.recordAppointmentCompleted(amount, date)
      }

      expect(client.loyaltyTier).toBe(LoyaltyTier.SILVER)
    })
  })

  describe('recordAppointmentCancelled', () => {
    let client: Client

    beforeEach(() => {
      client = Client.create({
        firstName: 'John',
        lastName: 'Doe',
        email: validEmail,
        phone: validPhone
      }).value
      // Need to record appointment created first
      client['props'].history = client.history.recordAppointmentCreated().value
    })

    it('should record cancelled appointment', () => {
      const result = client.recordAppointmentCancelled()

      expect(result.isSuccess).toBe(true)
      expect(client.history.cancelledAppointments).toBe(1)
    })
  })

  describe('recordNoShow', () => {
    let client: Client

    beforeEach(() => {
      client = Client.create({
        firstName: 'John',
        lastName: 'Doe',
        email: validEmail,
        phone: validPhone
      }).value
      // Need to record appointment created first
      client['props'].history = client.history.recordAppointmentCreated().value
    })

    it('should record no-show', () => {
      const result = client.recordNoShow()

      expect(result.isSuccess).toBe(true)
      expect(client.history.noShowCount).toBe(1)
    })

    it('should auto-suspend if high no-show rate', () => {
      // Create history with 10 total appointments
      for (let i = 0; i < 10; i++) {
        client['props'].history = client.history.recordAppointmentCreated().value
      }

      // Record 3 no-shows (30% rate > 20% threshold)
      client.recordNoShow()
      client.recordNoShow()
      client.clearEvents()

      const result = client.recordNoShow()

      expect(result.isSuccess).toBe(true)
      expect(client.status.isSuspended()).toBe(true)
      expect(client.domainEvents.some(e => e instanceof ClientSuspendedEvent)).toBe(true)
    })
  })

  describe('activate', () => {
    it('should activate inactive client', () => {
      const client = Client.create({
        firstName: 'John',
        lastName: 'Doe',
        email: validEmail,
        phone: validPhone
      }).value
      client.deactivate('Test')
      client.clearEvents()

      const result = client.activate()

      expect(result.isSuccess).toBe(true)
      expect(client.status.isActive()).toBe(true)
      expect(client.domainEvents[0]).toBeInstanceOf(ClientActivatedEvent)
    })

    it('should not emit event if already active', () => {
      const client = Client.create({
        firstName: 'John',
        lastName: 'Doe',
        email: validEmail,
        phone: validPhone
      }).value
      client.clearEvents()

      client.activate()

      expect(client.domainEvents).toHaveLength(0)
    })
  })

  describe('deactivate', () => {
    let client: Client

    beforeEach(() => {
      client = Client.create({
        firstName: 'John',
        lastName: 'Doe',
        email: validEmail,
        phone: validPhone
      }).value
      client.clearEvents()
    })

    it('should deactivate client', () => {
      const result = client.deactivate('Moving to another city')

      expect(result.isSuccess).toBe(true)
      expect(client.status.isInactive()).toBe(true)
    })

    it('should emit ClientDeactivatedEvent', () => {
      client.deactivate('Moving to another city')

      expect(client.domainEvents).toHaveLength(1)
      expect(client.domainEvents[0]).toBeInstanceOf(ClientDeactivatedEvent)
      expect((client.domainEvents[0] as ClientDeactivatedEvent).reason).toBe('Moving to another city')
    })
  })

  describe('suspend', () => {
    let client: Client

    beforeEach(() => {
      client = Client.create({
        firstName: 'John',
        lastName: 'Doe',
        email: validEmail,
        phone: validPhone
      }).value
      client.clearEvents()
    })

    it('should suspend client', () => {
      const result = client.suspend('Multiple no-shows')

      expect(result.isSuccess).toBe(true)
      expect(client.status.isSuspended()).toBe(true)
    })

    it('should emit ClientSuspendedEvent', () => {
      client.suspend('Multiple no-shows')

      expect(client.domainEvents).toHaveLength(1)
      expect(client.domainEvents[0]).toBeInstanceOf(ClientSuspendedEvent)
    })
  })

  describe('block', () => {
    let client: Client

    beforeEach(() => {
      client = Client.create({
        firstName: 'John',
        lastName: 'Doe',
        email: validEmail,
        phone: validPhone
      }).value
      client.clearEvents()
    })

    it('should block client', () => {
      const result = client.block('Fraudulent activity')

      expect(result.isSuccess).toBe(true)
      expect(client.status.isBlocked()).toBe(true)
    })

    it('should emit ClientBlockedEvent', () => {
      client.block('Fraudulent activity')

      expect(client.domainEvents).toHaveLength(1)
      expect(client.domainEvents[0]).toBeInstanceOf(ClientBlockedEvent)
    })
  })

  describe('unblock', () => {
    let client: Client

    beforeEach(() => {
      client = Client.create({
        firstName: 'John',
        lastName: 'Doe',
        email: validEmail,
        phone: validPhone
      }).value
      client.block('Test')
      client.clearEvents()
    })

    it('should unblock client', () => {
      const result = client.unblock()

      expect(result.isSuccess).toBe(true)
      expect(client.status.isActive()).toBe(true)
    })

    it('should emit ClientActivatedEvent', () => {
      client.unblock()

      expect(client.domainEvents).toHaveLength(1)
      expect(client.domainEvents[0]).toBeInstanceOf(ClientActivatedEvent)
    })

    it('should fail if not blocked', () => {
      // First unblock to make client active
      client.unblock()
      client.clearEvents()

      // Now try to unblock again when already active
      const result = client.unblock()

      expect(result.isFailure).toBe(true)
    })
  })

  describe('addNote', () => {
    let client: Client

    beforeEach(() => {
      client = Client.create({
        firstName: 'John',
        lastName: 'Doe',
        email: validEmail,
        phone: validPhone
      }).value
    })

    it('should add note', () => {
      const result = client.addNote('Prefers morning appointments')

      expect(result.isSuccess).toBe(true)
      expect(client.notes).toBe('Prefers morning appointments')
    })

    it('should append to existing notes', () => {
      client.addNote('First note')
      const result = client.addNote('Second note')

      expect(result.isSuccess).toBe(true)
      expect(client.notes).toContain('First note')
      expect(client.notes).toContain('---')
      expect(client.notes).toContain('Second note')
    })

    it('should fail if note is empty', () => {
      const result = client.addNote('')

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Note cannot be empty')
    })

    it('should fail if total exceeds limit', () => {
      client['props'].notes = 'a'.repeat(1990)
      const result = client.addNote('a'.repeat(20))

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('exceed 2000 characters')
    })
  })

  describe('canBookAppointments', () => {
    it('should allow active clients to book', () => {
      const client = Client.create({
        firstName: 'John',
        lastName: 'Doe',
        email: validEmail,
        phone: validPhone
      }).value

      expect(client.canBookAppointments()).toBe(true)
    })

    it('should not allow inactive clients to book', () => {
      const client = Client.create({
        firstName: 'John',
        lastName: 'Doe',
        email: validEmail,
        phone: validPhone
      }).value
      client.deactivate('Test')

      expect(client.canBookAppointments()).toBe(false)
    })

    it('should not allow clients with high no-show rate to book', () => {
      const client = Client.create({
        firstName: 'John',
        lastName: 'Doe',
        email: validEmail,
        phone: validPhone
      }).value

      // Create high no-show rate (>20%)
      for (let i = 0; i < 10; i++) {
        client['props'].history = client.history.recordAppointmentCreated().value
      }
      for (let i = 0; i < 3; i++) {
        client['props'].history = client.history.recordNoShow().value
      }

      expect(client.canBookAppointments()).toBe(false)
    })
  })

  describe('client type checks', () => {
    it('should identify new client', () => {
      const client = Client.create({
        firstName: 'John',
        lastName: 'Doe',
        email: validEmail,
        phone: validPhone
      }).value

      expect(client.isNewClient()).toBe(true)
      expect(client.isReturningClient()).toBe(false)
    })

    it('should identify returning client', () => {
      const client = Client.create({
        firstName: 'John',
        lastName: 'Doe',
        email: validEmail,
        phone: validPhone
      }).value
      const amount = Money.create(500, Currency.ARS).value
      client['props'].history = client.history.recordAppointmentCreated().value
      client.recordAppointmentCompleted(amount, new Date())

      expect(client.isNewClient()).toBe(false)
      expect(client.isReturningClient()).toBe(true)
    })

    it('should identify VIP client (GOLD tier)', () => {
      const client = Client.create({
        firstName: 'John',
        lastName: 'Doe',
        email: validEmail,
        phone: validPhone
      }).value
      const amount = Money.create(500, Currency.ARS).value

      // Complete 25 appointments to reach GOLD
      for (let i = 0; i < 25; i++) {
        client['props'].history = client.history.recordAppointmentCreated().value
        client['props'].history = client.history.recordAppointmentCompleted(amount, new Date()).value
      }

      expect(client.isVIPClient()).toBe(true)
      expect(client.loyaltyTier).toBe(LoyaltyTier.GOLD)
    })

    it('should identify VIP client (PLATINUM tier)', () => {
      const client = Client.create({
        firstName: 'John',
        lastName: 'Doe',
        email: validEmail,
        phone: validPhone
      }).value
      const amount = Money.create(500, Currency.ARS).value

      // Complete 50 appointments to reach PLATINUM
      for (let i = 0; i < 50; i++) {
        client['props'].history = client.history.recordAppointmentCreated().value
        client['props'].history = client.history.recordAppointmentCompleted(amount, new Date()).value
      }

      expect(client.isVIPClient()).toBe(true)
      expect(client.loyaltyTier).toBe(LoyaltyTier.PLATINUM)
    })

    it('should not identify SILVER client as VIP', () => {
      const client = Client.create({
        firstName: 'John',
        lastName: 'Doe',
        email: validEmail,
        phone: validPhone
      }).value
      const amount = Money.create(500, Currency.ARS).value

      // Complete 10 appointments to reach SILVER
      for (let i = 0; i < 10; i++) {
        client['props'].history = client.history.recordAppointmentCreated().value
        client['props'].history = client.history.recordAppointmentCompleted(amount, new Date()).value
      }

      expect(client.isVIPClient()).toBe(false)
      expect(client.loyaltyTier).toBe(LoyaltyTier.SILVER)
    })
  })

  describe('getters', () => {
    let client: Client

    beforeEach(() => {
      client = Client.create({
        firstName: 'John',
        lastName: 'Doe',
        email: validEmail,
        phone: validPhone
      }).value
    })

    it('should have clientId', () => {
      expect(client.clientId).toBeDefined()
    })

    it('should have fullName', () => {
      expect(client.fullName).toBe('John Doe')
    })

    it('should have loyaltyTier', () => {
      expect(client.loyaltyTier).toBe(LoyaltyTier.BRONZE)
    })

    it('should have createdAt', () => {
      expect(client.createdAt).toBeInstanceOf(Date)
    })

    it('should have updatedAt', () => {
      expect(client.updatedAt).toBeInstanceOf(Date)
    })
  })
})
