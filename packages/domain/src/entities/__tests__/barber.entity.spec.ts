import { Barber, CreateBarberProps } from '../barber.entity'
import { BarberName } from '../../value-objects/barber-name.vo'
import { BarberSpecialties, Specialty } from '../../value-objects/barber-specialties.vo'
import { BarberSchedule, DayOfWeek } from '../../value-objects/barber-schedule.vo'
import { BarberStatus, BarberStatusType } from '../../value-objects/barber-status.vo'
import { Email } from '../../value-objects/email.vo'
import { Phone } from '../../value-objects/phone.vo'
import { Money } from '../../value-objects/money.vo'
import { Currency } from '../../value-objects/currency.vo'
import {
  BarberCreatedEvent,
  BarberUpdatedEvent,
  BarberActivatedEvent,
  BarberDeactivatedEvent
} from '../../events/barber.events'

describe('Barber Entity', () => {
  const createValidBarberProps = (): CreateBarberProps => ({
    name: BarberName.create('John', 'Doe').value,
    email: Email.create('john.doe@barbershop.com').value,
    phone: Phone.create('1234567890').value,
    specialties: BarberSpecialties.create([Specialty.HAIRCUT, Specialty.BEARD]).value
  })

  describe('create', () => {
    it('should create valid barber', () => {
      const props = createValidBarberProps()
      const result = Barber.create(props)

      expect(result.isSuccess).toBe(true)
      expect(result.value.name.fullName).toBe('John Doe')
      expect(result.value.email.value).toBe('john.doe@barbershop.com')
      expect(result.value.status.isActive()).toBe(true)
      expect(result.value.rating).toBe(0)
      expect(result.value.totalAppointments).toBe(0)
    })

    it('should use default commission rate of 50%', () => {
      const props = createValidBarberProps()
      const result = Barber.create(props)

      expect(result.isSuccess).toBe(true)
      expect(result.value.commissionRate).toBe(50)
    })

    it('should use provided commission rate', () => {
      const props = { ...createValidBarberProps(), commissionRate: 60 }
      const result = Barber.create(props)

      expect(result.isSuccess).toBe(true)
      expect(result.value.commissionRate).toBe(60)
    })

    it('should fail if commission rate is negative', () => {
      const props = { ...createValidBarberProps(), commissionRate: -10 }
      const result = Barber.create(props)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('between 0 and 100')
    })

    it('should fail if commission rate exceeds 100', () => {
      const props = { ...createValidBarberProps(), commissionRate: 101 }
      const result = Barber.create(props)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('between 0 and 100')
    })

    it('should use default schedule if not provided', () => {
      const props = createValidBarberProps()
      const result = Barber.create(props)

      expect(result.isSuccess).toBe(true)
      expect(result.value.schedule.totalWorkingDays).toBe(6) // Mon-Sat
    })

    it('should use provided schedule', () => {
      const customSchedule = BarberSchedule.createDefault().value
      const props = { ...createValidBarberProps(), schedule: customSchedule }
      const result = Barber.create(props)

      expect(result.isSuccess).toBe(true)
      expect(result.value.schedule).toBe(customSchedule)
    })

    it('should accept optional profile image URL', () => {
      const props = { ...createValidBarberProps(), profileImageUrl: 'https://example.com/photo.jpg' }
      const result = Barber.create(props)

      expect(result.isSuccess).toBe(true)
      expect(result.value.profileImageUrl).toBe('https://example.com/photo.jpg')
    })

    it('should accept optional bio', () => {
      const props = { ...createValidBarberProps(), bio: 'Experienced barber with 10 years' }
      const result = Barber.create(props)

      expect(result.isSuccess).toBe(true)
      expect(result.value.bio).toBe('Experienced barber with 10 years')
    })

    it('should fail if bio exceeds 1000 characters', () => {
      const longBio = 'A'.repeat(1001)
      const props = { ...createValidBarberProps(), bio: longBio }
      const result = Barber.create(props)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('must not exceed 1000 characters')
    })

    it('should trim bio whitespace', () => {
      const props = { ...createValidBarberProps(), bio: '  Some bio  ' }
      const result = Barber.create(props)

      expect(result.isSuccess).toBe(true)
      expect(result.value.bio).toBe('Some bio')
    })

    it('should emit BarberCreatedEvent for new barber', () => {
      const props = createValidBarberProps()
      const result = Barber.create(props)

      expect(result.isSuccess).toBe(true)
      expect(result.value.domainEvents).toHaveLength(1)
      expect(result.value.domainEvents[0]).toBeInstanceOf(BarberCreatedEvent)
    })

    it('should not emit BarberCreatedEvent when providing existing ID', () => {
      const props = createValidBarberProps()
      const existingBarber = Barber.create(props).value
      const result = Barber.create(props, existingBarber.barberId)

      expect(result.isSuccess).toBe(true)
      expect(result.value.domainEvents).toHaveLength(0)
    })
  })

  describe('updateInfo', () => {
    it('should update name', () => {
      const barber = Barber.create(createValidBarberProps()).value
      const newName = BarberName.create('Jane', 'Smith').value
      const result = barber.updateInfo({ name: newName })

      expect(result.isSuccess).toBe(true)
      expect(barber.name.fullName).toBe('Jane Smith')
    })

    it('should update phone', () => {
      const barber = Barber.create(createValidBarberProps()).value
      const newPhone = Phone.create('9876543210').value
      const result = barber.updateInfo({ phone: newPhone })

      expect(result.isSuccess).toBe(true)
      expect(barber.phone.value).toBe('9876543210')
    })

    it('should update profile image URL', () => {
      const barber = Barber.create(createValidBarberProps()).value
      const result = barber.updateInfo({ profileImageUrl: 'https://new-image.com/photo.jpg' })

      expect(result.isSuccess).toBe(true)
      expect(barber.profileImageUrl).toBe('https://new-image.com/photo.jpg')
    })

    it('should update bio', () => {
      const barber = Barber.create(createValidBarberProps()).value
      const result = barber.updateInfo({ bio: 'New bio description' })

      expect(result.isSuccess).toBe(true)
      expect(barber.bio).toBe('New bio description')
    })

    it('should fail if bio exceeds 1000 characters', () => {
      const barber = Barber.create(createValidBarberProps()).value
      const longBio = 'A'.repeat(1001)
      const result = barber.updateInfo({ bio: longBio })

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('must not exceed 1000 characters')
    })

    it('should emit BarberUpdatedEvent', () => {
      const barber = Barber.create(createValidBarberProps()).value
      barber.clearEvents()

      const result = barber.updateInfo({ bio: 'Updated bio' })

      expect(result.isSuccess).toBe(true)
      expect(barber.domainEvents).toHaveLength(1)
      expect(barber.domainEvents[0]).toBeInstanceOf(BarberUpdatedEvent)
    })
  })

  describe('updateSpecialties', () => {
    it('should update specialties', () => {
      const barber = Barber.create(createValidBarberProps()).value
      const newSpecialties = BarberSpecialties.create([Specialty.COLORING]).value
      const result = barber.updateSpecialties(newSpecialties)

      expect(result.isSuccess).toBe(true)
      expect(barber.specialties.hasSpecialty(Specialty.COLORING)).toBe(true)
    })

    it('should fail if barber is inactive', () => {
      const barber = Barber.create(createValidBarberProps()).value
      barber.deactivate('Test reason')

      const newSpecialties = BarberSpecialties.create([Specialty.COLORING]).value
      const result = barber.updateSpecialties(newSpecialties)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('inactive barber')
    })

    it('should emit BarberUpdatedEvent', () => {
      const barber = Barber.create(createValidBarberProps()).value
      barber.clearEvents()

      const newSpecialties = BarberSpecialties.create([Specialty.STYLING]).value
      const result = barber.updateSpecialties(newSpecialties)

      expect(result.isSuccess).toBe(true)
      expect(barber.domainEvents).toHaveLength(1)
      expect(barber.domainEvents[0]).toBeInstanceOf(BarberUpdatedEvent)
    })
  })

  describe('updateSchedule', () => {
    it('should update schedule', () => {
      const barber = Barber.create(createValidBarberProps()).value
      const newSchedule = BarberSchedule.createDefault().value
      const result = barber.updateSchedule(newSchedule)

      expect(result.isSuccess).toBe(true)
      expect(barber.schedule).toBe(newSchedule)
    })

    it('should emit BarberUpdatedEvent', () => {
      const barber = Barber.create(createValidBarberProps()).value
      barber.clearEvents()

      const newSchedule = BarberSchedule.createDefault().value
      const result = barber.updateSchedule(newSchedule)

      expect(result.isSuccess).toBe(true)
      expect(barber.domainEvents).toHaveLength(1)
      expect(barber.domainEvents[0]).toBeInstanceOf(BarberUpdatedEvent)
    })
  })

  describe('updateCommissionRate', () => {
    it('should update commission rate', () => {
      const barber = Barber.create(createValidBarberProps()).value
      const result = barber.updateCommissionRate(70)

      expect(result.isSuccess).toBe(true)
      expect(barber.commissionRate).toBe(70)
    })

    it('should fail if rate is negative', () => {
      const barber = Barber.create(createValidBarberProps()).value
      const result = barber.updateCommissionRate(-10)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('between 0 and 100')
    })

    it('should fail if rate exceeds 100', () => {
      const barber = Barber.create(createValidBarberProps()).value
      const result = barber.updateCommissionRate(101)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('between 0 and 100')
    })

    it('should emit BarberUpdatedEvent', () => {
      const barber = Barber.create(createValidBarberProps()).value
      barber.clearEvents()

      const result = barber.updateCommissionRate(65)

      expect(result.isSuccess).toBe(true)
      expect(barber.domainEvents).toHaveLength(1)
      expect(barber.domainEvents[0]).toBeInstanceOf(BarberUpdatedEvent)
    })
  })

  describe('activate', () => {
    it('should activate inactive barber', () => {
      const barber = Barber.create(createValidBarberProps()).value
      barber.deactivate('Test')
      barber.clearEvents()

      const result = barber.activate()

      expect(result.isSuccess).toBe(true)
      expect(barber.status.isActive()).toBe(true)
      expect(barber.domainEvents).toHaveLength(1)
      expect(barber.domainEvents[0]).toBeInstanceOf(BarberActivatedEvent)
    })

    it('should do nothing if already active', () => {
      const barber = Barber.create(createValidBarberProps()).value
      barber.clearEvents()

      const result = barber.activate()

      expect(result.isSuccess).toBe(true)
      expect(barber.domainEvents).toHaveLength(0)
    })
  })

  describe('deactivate', () => {
    it('should deactivate active barber', () => {
      const barber = Barber.create(createValidBarberProps()).value
      barber.clearEvents()

      const result = barber.deactivate('Going on vacation')

      expect(result.isSuccess).toBe(true)
      expect(barber.status.isInactive()).toBe(true)
      expect(barber.domainEvents).toHaveLength(1)
      expect(barber.domainEvents[0]).toBeInstanceOf(BarberDeactivatedEvent)
    })

    it('should do nothing if already inactive', () => {
      const barber = Barber.create(createValidBarberProps()).value
      barber.deactivate('Test')
      barber.clearEvents()

      const result = barber.deactivate('Another reason')

      expect(result.isSuccess).toBe(true)
      expect(barber.domainEvents).toHaveLength(0)
    })
  })

  describe('setOnLeave', () => {
    it('should set barber on leave', () => {
      const barber = Barber.create(createValidBarberProps()).value
      barber.clearEvents()

      const result = barber.setOnLeave('Medical leave')

      expect(result.isSuccess).toBe(true)
      expect(barber.status.isOnLeave()).toBe(true)
    })
  })

  describe('suspend', () => {
    it('should suspend barber', () => {
      const barber = Barber.create(createValidBarberProps()).value
      barber.clearEvents()

      const result = barber.suspend('Policy violation')

      expect(result.isSuccess).toBe(true)
      expect(barber.status.isSuspended()).toBe(true)
    })
  })

  describe('canAcceptAppointments', () => {
    it('should return true for active barber with working days', () => {
      const barber = Barber.create(createValidBarberProps()).value

      expect(barber.canAcceptAppointments()).toBe(true)
    })

    it('should return false for inactive barber', () => {
      const barber = Barber.create(createValidBarberProps()).value
      barber.deactivate('Test')

      expect(barber.canAcceptAppointments()).toBe(false)
    })

    it('should return false for barber on leave', () => {
      const barber = Barber.create(createValidBarberProps()).value
      barber.setOnLeave('Medical')

      expect(barber.canAcceptAppointments()).toBe(false)
    })
  })

  describe('hasSpecialty', () => {
    it('should return true if barber has specialty', () => {
      const barber = Barber.create(createValidBarberProps()).value

      expect(barber.hasSpecialty(Specialty.HAIRCUT)).toBe(true)
      expect(barber.hasSpecialty(Specialty.BEARD)).toBe(true)
    })

    it('should return false if barber does not have specialty', () => {
      const barber = Barber.create(createValidBarberProps()).value

      expect(barber.hasSpecialty(Specialty.COLORING)).toBe(false)
    })
  })

  describe('updateRating', () => {
    it('should update rating correctly', () => {
      const barber = Barber.create(createValidBarberProps()).value
      const result = barber.updateRating(4.5)

      expect(result.isSuccess).toBe(true)
      expect(barber.rating).toBe(4.5)
      expect(barber.totalAppointments).toBe(1)
    })

    it('should calculate average rating correctly', () => {
      const barber = Barber.create(createValidBarberProps()).value
      barber.updateRating(4)
      barber.updateRating(5)

      expect(barber.rating).toBe(4.5)
      expect(barber.totalAppointments).toBe(2)
    })

    it('should fail if rating is negative', () => {
      const barber = Barber.create(createValidBarberProps()).value
      const result = barber.updateRating(-1)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('between 0 and 5')
    })

    it('should fail if rating exceeds 5', () => {
      const barber = Barber.create(createValidBarberProps()).value
      const result = barber.updateRating(6)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('between 0 and 5')
    })
  })

  describe('calculateCommission', () => {
    it('should calculate commission correctly', () => {
      const barber = Barber.create({ ...createValidBarberProps(), commissionRate: 50 }).value
      const amount = Money.create(100, Currency.ARS).value
      const result = barber.calculateCommission(amount)

      expect(result.isSuccess).toBe(true)
      expect(result.value.amount).toBe(50)
    })

    it('should calculate commission with different rate', () => {
      const barber = Barber.create({ ...createValidBarberProps(), commissionRate: 60 }).value
      const amount = Money.create(100, Currency.ARS).value
      const result = barber.calculateCommission(amount)

      expect(result.isSuccess).toBe(true)
      expect(result.value.amount).toBe(60)
    })
  })

  describe('isAvailable', () => {
    it('should return true if can accept appointments', () => {
      const barber = Barber.create(createValidBarberProps()).value

      expect(barber.isAvailable()).toBe(true)
    })

    it('should return false if cannot accept appointments', () => {
      const barber = Barber.create(createValidBarberProps()).value
      barber.deactivate('Test')

      expect(barber.isAvailable()).toBe(false)
    })
  })

  describe('getDisplayName', () => {
    it('should return full name', () => {
      const barber = Barber.create(createValidBarberProps()).value

      expect(barber.getDisplayName()).toBe('John Doe')
    })
  })
})
