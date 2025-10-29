import { BarberStatus, BarberStatusType } from '../barber-status.vo'

describe('BarberStatus Value Object', () => {
  describe('create', () => {
    it('should create active status', () => {
      const result = BarberStatus.create(BarberStatusType.ACTIVE)

      expect(result.isSuccess).toBe(true)
      expect(result.value.status).toBe(BarberStatusType.ACTIVE)
      expect(result.value.isActive()).toBe(true)
    })

    it('should create inactive status with reason', () => {
      const result = BarberStatus.create(BarberStatusType.INACTIVE, 'On vacation')

      expect(result.isSuccess).toBe(true)
      expect(result.value.status).toBe(BarberStatusType.INACTIVE)
      expect(result.value.reason).toBe('On vacation')
    })

    it('should fail if inactive status without reason', () => {
      const result = BarberStatus.create(BarberStatusType.INACTIVE)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Reason is required')
    })

    it('should fail if on_leave status without reason', () => {
      const result = BarberStatus.create(BarberStatusType.ON_LEAVE)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Reason is required')
    })

    it('should fail if suspended status without reason', () => {
      const result = BarberStatus.create(BarberStatusType.SUSPENDED)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Reason is required')
    })

    it('should trim reason whitespace', () => {
      const result = BarberStatus.create(BarberStatusType.INACTIVE, '  On vacation  ')

      expect(result.isSuccess).toBe(true)
      expect(result.value.reason).toBe('On vacation')
    })

    it('should fail if reason exceeds 500 characters', () => {
      const longReason = 'A'.repeat(501)
      const result = BarberStatus.create(BarberStatusType.INACTIVE, longReason)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('must not exceed 500 characters')
    })

    it('should set since date if not provided', () => {
      const before = new Date()
      const result = BarberStatus.create(BarberStatusType.ACTIVE)
      const after = new Date()

      expect(result.isSuccess).toBe(true)
      expect(result.value.since.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(result.value.since.getTime()).toBeLessThanOrEqual(after.getTime())
    })

    it('should use provided since date', () => {
      const since = new Date('2024-01-01')
      const result = BarberStatus.create(BarberStatusType.ACTIVE, undefined, since)

      expect(result.isSuccess).toBe(true)
      expect(result.value.since).toEqual(since)
    })
  })

  describe('createActive', () => {
    it('should create active status without validation', () => {
      const status = BarberStatus.createActive()

      expect(status.isActive()).toBe(true)
      expect(status.reason).toBeUndefined()
    })
  })

  describe('status type checks', () => {
    it('should correctly identify active status', () => {
      const status = BarberStatus.create(BarberStatusType.ACTIVE).value

      expect(status.isActive()).toBe(true)
      expect(status.isInactive()).toBe(false)
      expect(status.isOnLeave()).toBe(false)
      expect(status.isSuspended()).toBe(false)
    })

    it('should correctly identify inactive status', () => {
      const status = BarberStatus.create(BarberStatusType.INACTIVE, 'Reason').value

      expect(status.isActive()).toBe(false)
      expect(status.isInactive()).toBe(true)
      expect(status.isOnLeave()).toBe(false)
      expect(status.isSuspended()).toBe(false)
    })

    it('should correctly identify on_leave status', () => {
      const status = BarberStatus.create(BarberStatusType.ON_LEAVE, 'Reason').value

      expect(status.isActive()).toBe(false)
      expect(status.isInactive()).toBe(false)
      expect(status.isOnLeave()).toBe(true)
      expect(status.isSuspended()).toBe(false)
    })

    it('should correctly identify suspended status', () => {
      const status = BarberStatus.create(BarberStatusType.SUSPENDED, 'Reason').value

      expect(status.isActive()).toBe(false)
      expect(status.isInactive()).toBe(false)
      expect(status.isOnLeave()).toBe(false)
      expect(status.isSuspended()).toBe(true)
    })
  })

  describe('canAcceptAppointments', () => {
    it('should return true only for active status', () => {
      const active = BarberStatus.create(BarberStatusType.ACTIVE).value
      const inactive = BarberStatus.create(BarberStatusType.INACTIVE, 'Reason').value
      const onLeave = BarberStatus.create(BarberStatusType.ON_LEAVE, 'Reason').value
      const suspended = BarberStatus.create(BarberStatusType.SUSPENDED, 'Reason').value

      expect(active.canAcceptAppointments()).toBe(true)
      expect(inactive.canAcceptAppointments()).toBe(false)
      expect(onLeave.canAcceptAppointments()).toBe(false)
      expect(suspended.canAcceptAppointments()).toBe(false)
    })
  })

  describe('changeTo', () => {
    it('should change status', () => {
      const original = BarberStatus.createActive()
      const result = original.changeTo(BarberStatusType.INACTIVE, 'Going on vacation')

      expect(result.isSuccess).toBe(true)
      expect(result.value.status).toBe(BarberStatusType.INACTIVE)
      expect(result.value.reason).toBe('Going on vacation')
    })

    it('should return same status if already in that status', () => {
      const original = BarberStatus.createActive()
      const result = original.changeTo(BarberStatusType.ACTIVE)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(original)
    })

    it('should fail if reason not provided for non-active status', () => {
      const original = BarberStatus.createActive()
      const result = original.changeTo(BarberStatusType.INACTIVE)

      expect(result.isFailure).toBe(true)
    })
  })

  describe('activate', () => {
    it('should activate inactive barber', () => {
      const original = BarberStatus.create(BarberStatusType.INACTIVE, 'Reason').value
      const result = original.activate()

      expect(result.isSuccess).toBe(true)
      expect(result.value.isActive()).toBe(true)
      expect(result.value.reason).toBeUndefined()
    })

    it('should return same if already active', () => {
      const original = BarberStatus.createActive()
      const result = original.activate()

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(original)
    })
  })

  describe('deactivate', () => {
    it('should deactivate active barber', () => {
      const original = BarberStatus.createActive()
      const result = original.deactivate('Going on vacation')

      expect(result.isSuccess).toBe(true)
      expect(result.value.isInactive()).toBe(true)
      expect(result.value.reason).toBe('Going on vacation')
    })

    it('should return same if already inactive', () => {
      const original = BarberStatus.create(BarberStatusType.INACTIVE, 'Reason').value
      const result = original.deactivate('Another reason')

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(original)
    })
  })

  describe('setOnLeave', () => {
    it('should set barber on leave', () => {
      const original = BarberStatus.createActive()
      const result = original.setOnLeave('Medical leave')

      expect(result.isSuccess).toBe(true)
      expect(result.value.isOnLeave()).toBe(true)
      expect(result.value.reason).toBe('Medical leave')
    })

    it('should return same if already on leave', () => {
      const original = BarberStatus.create(BarberStatusType.ON_LEAVE, 'Reason').value
      const result = original.setOnLeave('Another reason')

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(original)
    })
  })

  describe('suspend', () => {
    it('should suspend barber', () => {
      const original = BarberStatus.createActive()
      const result = original.suspend('Policy violation')

      expect(result.isSuccess).toBe(true)
      expect(result.value.isSuspended()).toBe(true)
      expect(result.value.reason).toBe('Policy violation')
    })

    it('should return same if already suspended', () => {
      const original = BarberStatus.create(BarberStatusType.SUSPENDED, 'Reason').value
      const result = original.suspend('Another reason')

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(original)
    })
  })

  describe('getDaysSince', () => {
    it('should calculate days since status change', () => {
      const twoDaysAgo = new Date()
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

      const status = BarberStatus.create(BarberStatusType.ACTIVE, undefined, twoDaysAgo).value

      expect(status.getDaysSince()).toBe(2)
    })

    it('should return 0 for today', () => {
      const status = BarberStatus.createActive()

      expect(status.getDaysSince()).toBe(0)
    })
  })

  describe('equals', () => {
    it('should return true for same status and reason', () => {
      const status1 = BarberStatus.create(BarberStatusType.INACTIVE, 'Vacation').value
      const status2 = BarberStatus.create(BarberStatusType.INACTIVE, 'Vacation').value

      expect(status1.equals(status2)).toBe(true)
    })

    it('should return false for different status', () => {
      const status1 = BarberStatus.createActive()
      const status2 = BarberStatus.create(BarberStatusType.INACTIVE, 'Reason').value

      expect(status1.equals(status2)).toBe(false)
    })
  })
})
