import { ClientHistory, LoyaltyTier } from '../client-history.vo'
import { Money } from '../money.vo'
import { Currency } from '../currency.vo'

describe('ClientHistory Value Object', () => {
  describe('create', () => {
    it('should create with default values', () => {
      const result = ClientHistory.create({})

      expect(result.isSuccess).toBe(true)
      expect(result.value.totalAppointments).toBe(0)
      expect(result.value.completedAppointments).toBe(0)
      expect(result.value.cancelledAppointments).toBe(0)
      expect(result.value.noShowCount).toBe(0)
      expect(result.value.lifetimeValue.amount).toBe(0)
      expect(result.value.firstVisit).toBeNull()
      expect(result.value.lastVisit).toBeNull()
    })

    it('should create with custom values', () => {
      const firstVisit = new Date('2024-01-01')
      const lastVisit = new Date('2024-06-01')
      const lifetimeValue = Money.create(1000, Currency.ARS).value

      const result = ClientHistory.create({
        totalAppointments: 10,
        completedAppointments: 8,
        cancelledAppointments: 1,
        noShowCount: 1,
        lifetimeValue,
        firstVisit,
        lastVisit
      })

      expect(result.isSuccess).toBe(true)
      expect(result.value.totalAppointments).toBe(10)
      expect(result.value.completedAppointments).toBe(8)
      expect(result.value.cancelledAppointments).toBe(1)
      expect(result.value.noShowCount).toBe(1)
      expect(result.value.lifetimeValue.amount).toBe(1000)
      expect(result.value.firstVisit).toEqual(firstVisit)
      expect(result.value.lastVisit).toEqual(lastVisit)
    })

    it('should fail if total appointments is negative', () => {
      const result = ClientHistory.create({
        totalAppointments: -1
      })

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Total appointments cannot be negative')
    })

    it('should fail if completed appointments is negative', () => {
      const result = ClientHistory.create({
        completedAppointments: -1
      })

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Completed appointments cannot be negative')
    })

    it('should fail if cancelled appointments is negative', () => {
      const result = ClientHistory.create({
        cancelledAppointments: -1
      })

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Cancelled appointments cannot be negative')
    })

    it('should fail if no-show count is negative', () => {
      const result = ClientHistory.create({
        noShowCount: -1
      })

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('No-show count cannot be negative')
    })

    it('should fail if completed exceeds total', () => {
      const result = ClientHistory.create({
        totalAppointments: 5,
        completedAppointments: 6
      })

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Completed appointments cannot exceed total')
    })

    it('should fail if cancelled exceeds total', () => {
      const result = ClientHistory.create({
        totalAppointments: 5,
        cancelledAppointments: 6
      })

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Cancelled appointments cannot exceed total')
    })

    it('should fail if no-show exceeds total', () => {
      const result = ClientHistory.create({
        totalAppointments: 5,
        noShowCount: 6
      })

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('No-show count cannot exceed total')
    })

    it('should fail if last visit is before first visit', () => {
      const result = ClientHistory.create({
        firstVisit: new Date('2024-06-01'),
        lastVisit: new Date('2024-01-01')
      })

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Last visit cannot be before first visit')
    })

    it('should accept same date for first and last visit', () => {
      const date = new Date('2024-01-01')
      const result = ClientHistory.create({
        firstVisit: date,
        lastVisit: date
      })

      expect(result.isSuccess).toBe(true)
    })
  })

  describe('createNew', () => {
    it('should create new client history with zeros', () => {
      const history = ClientHistory.createNew()

      expect(history.totalAppointments).toBe(0)
      expect(history.completedAppointments).toBe(0)
      expect(history.cancelledAppointments).toBe(0)
      expect(history.noShowCount).toBe(0)
      expect(history.firstVisit).toBeNull()
      expect(history.lastVisit).toBeNull()
    })
  })

  describe('rates', () => {
    it('should calculate completion rate', () => {
      const history = ClientHistory.create({
        totalAppointments: 10,
        completedAppointments: 8
      }).value

      expect(history.completionRate).toBe(80)
    })

    it('should return 0 completion rate if no appointments', () => {
      const history = ClientHistory.createNew()

      expect(history.completionRate).toBe(0)
    })

    it('should calculate cancellation rate', () => {
      const history = ClientHistory.create({
        totalAppointments: 10,
        cancelledAppointments: 3
      }).value

      expect(history.cancellationRate).toBe(30)
    })

    it('should return 0 cancellation rate if no appointments', () => {
      const history = ClientHistory.createNew()

      expect(history.cancellationRate).toBe(0)
    })

    it('should calculate no-show rate', () => {
      const history = ClientHistory.create({
        totalAppointments: 10,
        noShowCount: 2
      }).value

      expect(history.noShowRate).toBe(20)
    })

    it('should return 0 no-show rate if no appointments', () => {
      const history = ClientHistory.createNew()

      expect(history.noShowRate).toBe(0)
    })
  })

  describe('loyalty tier', () => {
    it('should be BRONZE for 0-9 completed appointments', () => {
      const history = ClientHistory.create({
        totalAppointments: 5,
        completedAppointments: 5
      }).value

      expect(history.loyaltyTier).toBe(LoyaltyTier.BRONZE)
    })

    it('should be SILVER for 10-24 completed appointments', () => {
      const history = ClientHistory.create({
        totalAppointments: 15,
        completedAppointments: 15
      }).value

      expect(history.loyaltyTier).toBe(LoyaltyTier.SILVER)
    })

    it('should be GOLD for 25-49 completed appointments', () => {
      const history = ClientHistory.create({
        totalAppointments: 30,
        completedAppointments: 30
      }).value

      expect(history.loyaltyTier).toBe(LoyaltyTier.GOLD)
    })

    it('should be PLATINUM for 50+ completed appointments', () => {
      const history = ClientHistory.create({
        totalAppointments: 75,
        completedAppointments: 75
      }).value

      expect(history.loyaltyTier).toBe(LoyaltyTier.PLATINUM)
    })

    it('should be SILVER exactly at 10', () => {
      const history = ClientHistory.create({
        totalAppointments: 10,
        completedAppointments: 10
      }).value

      expect(history.loyaltyTier).toBe(LoyaltyTier.SILVER)
    })

    it('should be GOLD exactly at 25', () => {
      const history = ClientHistory.create({
        totalAppointments: 25,
        completedAppointments: 25
      }).value

      expect(history.loyaltyTier).toBe(LoyaltyTier.GOLD)
    })

    it('should be PLATINUM exactly at 50', () => {
      const history = ClientHistory.create({
        totalAppointments: 50,
        completedAppointments: 50
      }).value

      expect(history.loyaltyTier).toBe(LoyaltyTier.PLATINUM)
    })
  })

  describe('client type checks', () => {
    it('should identify new client', () => {
      const history = ClientHistory.createNew()

      expect(history.isNewClient()).toBe(true)
      expect(history.isReturningClient()).toBe(false)
    })

    it('should identify returning client', () => {
      const history = ClientHistory.create({
        totalAppointments: 1,
        completedAppointments: 1
      }).value

      expect(history.isNewClient()).toBe(false)
      expect(history.isReturningClient()).toBe(true)
    })

    it('should identify high no-show rate', () => {
      const history = ClientHistory.create({
        totalAppointments: 10,
        noShowCount: 3
      }).value

      expect(history.hasHighNoShowRate()).toBe(true)
    })

    it('should not identify high no-show rate for low rate', () => {
      const history = ClientHistory.create({
        totalAppointments: 10,
        noShowCount: 1
      }).value

      expect(history.hasHighNoShowRate()).toBe(false)
    })

    it('should identify high cancellation rate', () => {
      const history = ClientHistory.create({
        totalAppointments: 10,
        cancelledAppointments: 4
      }).value

      expect(history.hasHighCancellationRate()).toBe(true)
    })

    it('should not identify high cancellation rate for low rate', () => {
      const history = ClientHistory.create({
        totalAppointments: 10,
        cancelledAppointments: 2
      }).value

      expect(history.hasHighCancellationRate()).toBe(false)
    })
  })

  describe('recordAppointmentCreated', () => {
    it('should increment total appointments', () => {
      const history = ClientHistory.createNew()

      const result = history.recordAppointmentCreated()

      expect(result.isSuccess).toBe(true)
      expect(result.value.totalAppointments).toBe(1)
    })
  })

  describe('recordAppointmentCompleted', () => {
    it('should increment completed appointments', () => {
      const history = ClientHistory.create({
        totalAppointments: 1
      }).value
      const amount = Money.create(500, Currency.ARS).value
      const date = new Date()

      const result = history.recordAppointmentCompleted(amount, date)

      expect(result.isSuccess).toBe(true)
      expect(result.value.completedAppointments).toBe(1)
    })

    it('should update lifetime value', () => {
      const history = ClientHistory.createNew().recordAppointmentCreated().value
      const amount = Money.create(500, Currency.ARS).value
      const date = new Date()

      const result = history.recordAppointmentCompleted(amount, date)

      expect(result.isSuccess).toBe(true)
      expect(result.value.lifetimeValue.amount).toBe(500)
    })

    it('should set first visit if null', () => {
      const history = ClientHistory.createNew().recordAppointmentCreated().value
      const amount = Money.create(500, Currency.ARS).value
      const date = new Date('2024-01-01')

      const result = history.recordAppointmentCompleted(amount, date)

      expect(result.isSuccess).toBe(true)
      expect(result.value.firstVisit).toEqual(date)
    })

    it('should not change first visit if already set', () => {
      const firstVisit = new Date('2024-01-01')
      const history = ClientHistory.create({
        totalAppointments: 1,
        firstVisit
      }).value
      const amount = Money.create(500, Currency.ARS).value
      const date = new Date('2024-06-01')

      const result = history.recordAppointmentCompleted(amount, date)

      expect(result.isSuccess).toBe(true)
      expect(result.value.firstVisit).toEqual(firstVisit)
    })

    it('should update last visit', () => {
      const history = ClientHistory.createNew().recordAppointmentCreated().value
      const amount = Money.create(500, Currency.ARS).value
      const date = new Date('2024-06-01')

      const result = history.recordAppointmentCompleted(amount, date)

      expect(result.isSuccess).toBe(true)
      expect(result.value.lastVisit).toEqual(date)
    })

    it('should fail if currency mismatch', () => {
      const history = ClientHistory.create({
        lifetimeValue: Money.create(1000, Currency.ARS).value
      }).value
      const amount = Money.create(500, Currency.USD).value
      const date = new Date()

      const result = history.recordAppointmentCompleted(amount, date)

      expect(result.isFailure).toBe(true)
    })
  })

  describe('recordAppointmentCancelled', () => {
    it('should increment cancelled appointments', () => {
      const history = ClientHistory.createNew().recordAppointmentCreated().value

      const result = history.recordAppointmentCancelled()

      expect(result.isSuccess).toBe(true)
      expect(result.value.cancelledAppointments).toBe(1)
    })
  })

  describe('recordNoShow', () => {
    it('should increment no-show count', () => {
      const history = ClientHistory.createNew().recordAppointmentCreated().value

      const result = history.recordNoShow()

      expect(result.isSuccess).toBe(true)
      expect(result.value.noShowCount).toBe(1)
    })
  })

  describe('updateFirstVisit', () => {
    it('should update first visit', () => {
      const history = ClientHistory.createNew()
      const date = new Date('2024-01-01')

      const result = history.updateFirstVisit(date)

      expect(result.isSuccess).toBe(true)
      expect(result.value.firstVisit).toEqual(date)
    })
  })

  describe('updateLastVisit', () => {
    it('should update last visit', () => {
      const history = ClientHistory.createNew()
      const date = new Date('2024-06-01')

      const result = history.updateLastVisit(date)

      expect(result.isSuccess).toBe(true)
      expect(result.value.lastVisit).toEqual(date)
    })
  })

  describe('immutability', () => {
    it('should be immutable', () => {
      const history = ClientHistory.createNew()

      expect(() => {
        (history as any).props.totalAppointments = 10
      }).toThrow()
    })

    it('should return new instance when recording', () => {
      const history = ClientHistory.createNew().recordAppointmentCreated().value
      const amount = Money.create(500, Currency.ARS).value
      const date = new Date()

      const result = history.recordAppointmentCompleted(amount, date)

      expect(result.value).not.toBe(history)
      expect(history.completedAppointments).toBe(0)
      expect(result.value.completedAppointments).toBe(1)
    })
  })
})
