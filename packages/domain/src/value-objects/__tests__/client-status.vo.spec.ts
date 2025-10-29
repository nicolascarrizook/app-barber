import { ClientStatus, ClientStatusType } from '../client-status.vo'

describe('ClientStatus Value Object', () => {
  describe('create', () => {
    it('should create active status', () => {
      const result = ClientStatus.create(ClientStatusType.ACTIVE)

      expect(result.isSuccess).toBe(true)
      expect(result.value.status).toBe(ClientStatusType.ACTIVE)
      expect(result.value.isActive()).toBe(true)
    })

    it('should create inactive status with reason', () => {
      const result = ClientStatus.create(ClientStatusType.INACTIVE, 'Client requested')

      expect(result.isSuccess).toBe(true)
      expect(result.value.status).toBe(ClientStatusType.INACTIVE)
      expect(result.value.reason).toBe('Client requested')
      expect(result.value.isInactive()).toBe(true)
    })

    it('should fail if inactive without reason', () => {
      const result = ClientStatus.create(ClientStatusType.INACTIVE)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Reason is required')
    })

    it('should fail if suspended without reason', () => {
      const result = ClientStatus.create(ClientStatusType.SUSPENDED)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Reason is required')
    })

    it('should fail if blocked without reason', () => {
      const result = ClientStatus.create(ClientStatusType.BLOCKED)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Reason is required')
    })

    it('should fail if reason exceeds 500 characters', () => {
      const longReason = 'a'.repeat(501)
      const result = ClientStatus.create(ClientStatusType.INACTIVE, longReason)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('must not exceed 500 characters')
    })

    it('should accept exactly 500 characters', () => {
      const exactReason = 'a'.repeat(500)
      const result = ClientStatus.create(ClientStatusType.INACTIVE, exactReason)

      expect(result.isSuccess).toBe(true)
    })
  })

  describe('createActive', () => {
    it('should create active status without reason', () => {
      const status = ClientStatus.createActive()

      expect(status.isActive()).toBe(true)
      expect(status.reason).toBeUndefined()
    })
  })

  describe('status checks', () => {
    it('should correctly identify active status', () => {
      const status = ClientStatus.createActive()

      expect(status.isActive()).toBe(true)
      expect(status.isInactive()).toBe(false)
      expect(status.isSuspended()).toBe(false)
      expect(status.isBlocked()).toBe(false)
    })

    it('should correctly identify inactive status', () => {
      const status = ClientStatus.create(ClientStatusType.INACTIVE, 'Test').value

      expect(status.isActive()).toBe(false)
      expect(status.isInactive()).toBe(true)
      expect(status.isSuspended()).toBe(false)
      expect(status.isBlocked()).toBe(false)
    })

    it('should correctly identify suspended status', () => {
      const status = ClientStatus.create(ClientStatusType.SUSPENDED, 'Test').value

      expect(status.isActive()).toBe(false)
      expect(status.isInactive()).toBe(false)
      expect(status.isSuspended()).toBe(true)
      expect(status.isBlocked()).toBe(false)
    })

    it('should correctly identify blocked status', () => {
      const status = ClientStatus.create(ClientStatusType.BLOCKED, 'Test').value

      expect(status.isActive()).toBe(false)
      expect(status.isInactive()).toBe(false)
      expect(status.isSuspended()).toBe(false)
      expect(status.isBlocked()).toBe(true)
    })
  })

  describe('canBookAppointments', () => {
    it('should allow active clients to book', () => {
      const status = ClientStatus.createActive()

      expect(status.canBookAppointments()).toBe(true)
    })

    it('should not allow inactive clients to book', () => {
      const status = ClientStatus.create(ClientStatusType.INACTIVE, 'Test').value

      expect(status.canBookAppointments()).toBe(false)
    })

    it('should not allow suspended clients to book', () => {
      const status = ClientStatus.create(ClientStatusType.SUSPENDED, 'Test').value

      expect(status.canBookAppointments()).toBe(false)
    })

    it('should not allow blocked clients to book', () => {
      const status = ClientStatus.create(ClientStatusType.BLOCKED, 'Test').value

      expect(status.canBookAppointments()).toBe(false)
    })
  })

  describe('activate', () => {
    it('should activate inactive client', () => {
      const inactive = ClientStatus.create(ClientStatusType.INACTIVE, 'Test').value
      const result = inactive.activate()

      expect(result.isSuccess).toBe(true)
      expect(result.value.isActive()).toBe(true)
    })

    it('should activate suspended client', () => {
      const suspended = ClientStatus.create(ClientStatusType.SUSPENDED, 'Test').value
      const result = suspended.activate()

      expect(result.isSuccess).toBe(true)
      expect(result.value.isActive()).toBe(true)
    })

    it('should not activate blocked client', () => {
      const blocked = ClientStatus.create(ClientStatusType.BLOCKED, 'Test').value
      const result = blocked.activate()

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Blocked clients cannot be activated')
    })

    it('should return same status if already active', () => {
      const active = ClientStatus.createActive()
      const result = active.activate()

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(active)
    })
  })

  describe('deactivate', () => {
    it('should deactivate active client', () => {
      const active = ClientStatus.createActive()
      const result = active.deactivate('Moving to another city')

      expect(result.isSuccess).toBe(true)
      expect(result.value.isInactive()).toBe(true)
      expect(result.value.reason).toBe('Moving to another city')
    })

    it('should return same status if already inactive', () => {
      const inactive = ClientStatus.create(ClientStatusType.INACTIVE, 'Test').value
      const result = inactive.deactivate('Another reason')

      expect(result.isSuccess).toBe(true)
    })
  })

  describe('suspend', () => {
    it('should suspend active client', () => {
      const active = ClientStatus.createActive()
      const result = active.suspend('Multiple no-shows')

      expect(result.isSuccess).toBe(true)
      expect(result.value.isSuspended()).toBe(true)
      expect(result.value.reason).toBe('Multiple no-shows')
    })

    it('should not suspend blocked client', () => {
      const blocked = ClientStatus.create(ClientStatusType.BLOCKED, 'Test').value
      const result = blocked.suspend('Test')

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Cannot suspend a blocked client')
    })

    it('should return same status if already suspended', () => {
      const suspended = ClientStatus.create(ClientStatusType.SUSPENDED, 'Test').value
      const result = suspended.suspend('Another reason')

      expect(result.isSuccess).toBe(true)
    })
  })

  describe('block', () => {
    it('should block active client', () => {
      const active = ClientStatus.createActive()
      const result = active.block('Fraudulent activity')

      expect(result.isSuccess).toBe(true)
      expect(result.value.isBlocked()).toBe(true)
      expect(result.value.reason).toBe('Fraudulent activity')
    })

    it('should block suspended client', () => {
      const suspended = ClientStatus.create(ClientStatusType.SUSPENDED, 'Test').value
      const result = suspended.block('Fraud')

      expect(result.isSuccess).toBe(true)
      expect(result.value.isBlocked()).toBe(true)
    })

    it('should return same status if already blocked', () => {
      const blocked = ClientStatus.create(ClientStatusType.BLOCKED, 'Test').value
      const result = blocked.block('Another reason')

      expect(result.isSuccess).toBe(true)
    })
  })

  describe('unblock', () => {
    it('should unblock blocked client', () => {
      const blocked = ClientStatus.create(ClientStatusType.BLOCKED, 'Test').value
      const result = blocked.unblock()

      expect(result.isSuccess).toBe(true)
      expect(result.value.isActive()).toBe(true)
    })

    it('should fail if client is not blocked', () => {
      const active = ClientStatus.createActive()
      const result = active.unblock()

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Client is not blocked')
    })
  })

  describe('immutability', () => {
    it('should be immutable', () => {
      const status = ClientStatus.createActive()

      expect(() => {
        (status as any).props.status = ClientStatusType.INACTIVE
      }).toThrow()
    })
  })

  describe('since property', () => {
    it('should have since date', () => {
      const before = new Date()
      const status = ClientStatus.createActive()
      const after = new Date()

      expect(status.since).toBeInstanceOf(Date)
      expect(status.since.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(status.since.getTime()).toBeLessThanOrEqual(after.getTime())
    })

    it('should use provided since date', () => {
      const specificDate = new Date('2024-01-01')
      const status = ClientStatus.create(ClientStatusType.ACTIVE, undefined, specificDate).value

      expect(status.since).toEqual(specificDate)
    })
  })
})
