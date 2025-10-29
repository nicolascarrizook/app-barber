import { ClientPreferences, PreferredTimeSlot, NotificationChannel } from '../client-preferences.vo'
import { UniqueEntityID } from '../../common/unique-entity-id'

describe('ClientPreferences Value Object', () => {
  describe('create', () => {
    it('should create with default values', () => {
      const result = ClientPreferences.create({})

      expect(result.isSuccess).toBe(true)
      expect(result.value.preferredBarbers).toEqual([])
      expect(result.value.preferredServices).toEqual([])
      expect(result.value.preferredTimeSlots).toEqual([])
      expect(result.value.notificationChannels).toEqual(['EMAIL'])
      expect(result.value.language).toBe('es')
      expect(result.value.receivePromotions).toBe(true)
      expect(result.value.reminderMinutesBefore).toBe(60)
    })

    it('should create with custom values', () => {
      const barber1 = new UniqueEntityID()
      const barber2 = new UniqueEntityID()
      const service1 = new UniqueEntityID()

      const result = ClientPreferences.create({
        preferredBarbers: [barber1, barber2],
        preferredServices: [service1],
        preferredTimeSlots: ['MORNING', 'AFTERNOON'],
        notificationChannels: ['EMAIL', 'SMS'],
        language: 'en',
        receivePromotions: false,
        reminderMinutesBefore: 30
      })

      expect(result.isSuccess).toBe(true)
      expect(result.value.preferredBarbers.length).toBe(2)
      expect(result.value.preferredServices.length).toBe(1)
      expect(result.value.preferredTimeSlots).toEqual(['MORNING', 'AFTERNOON'])
      expect(result.value.notificationChannels).toEqual(['EMAIL', 'SMS'])
      expect(result.value.language).toBe('en')
      expect(result.value.receivePromotions).toBe(false)
      expect(result.value.reminderMinutesBefore).toBe(30)
    })

    it('should remove duplicate barbers', () => {
      const barber = new UniqueEntityID()

      const result = ClientPreferences.create({
        preferredBarbers: [barber, barber]
      })

      expect(result.isSuccess).toBe(true)
      expect(result.value.preferredBarbers.length).toBe(1)
    })

    it('should remove duplicate services', () => {
      const service = new UniqueEntityID()

      const result = ClientPreferences.create({
        preferredServices: [service, service]
      })

      expect(result.isSuccess).toBe(true)
      expect(result.value.preferredServices.length).toBe(1)
    })

    it('should remove duplicate time slots', () => {
      const result = ClientPreferences.create({
        preferredTimeSlots: ['MORNING', 'MORNING', 'AFTERNOON']
      })

      expect(result.isSuccess).toBe(true)
      expect(result.value.preferredTimeSlots).toEqual(['MORNING', 'AFTERNOON'])
    })

    it('should remove duplicate notification channels', () => {
      const result = ClientPreferences.create({
        notificationChannels: ['EMAIL', 'EMAIL', 'SMS']
      })

      expect(result.isSuccess).toBe(true)
      expect(result.value.notificationChannels).toEqual(['EMAIL', 'SMS'])
    })

    it('should fail if more than 10 preferred barbers', () => {
      const barbers = Array.from({ length: 11 }, () => new UniqueEntityID())

      const result = ClientPreferences.create({
        preferredBarbers: barbers
      })

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Cannot have more than 10 preferred barbers')
    })

    it('should fail if more than 20 preferred services', () => {
      const services = Array.from({ length: 21 }, () => new UniqueEntityID())

      const result = ClientPreferences.create({
        preferredServices: services
      })

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Cannot have more than 20 preferred services')
    })

    it('should fail if more than 3 preferred time slots', () => {
      const result = ClientPreferences.create({
        preferredTimeSlots: ['MORNING', 'AFTERNOON', 'EVENING', 'MORNING'] as PreferredTimeSlot[]
      })

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Cannot have more than 3 preferred time slots')
    })

    it('should fail if no notification channels', () => {
      const result = ClientPreferences.create({
        notificationChannels: []
      })

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('At least one notification channel is required')
    })

    it('should fail if more than 4 notification channels', () => {
      const result = ClientPreferences.create({
        notificationChannels: ['EMAIL', 'SMS', 'PUSH', 'WHATSAPP', 'EMAIL'] as NotificationChannel[]
      })

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Cannot have more than 4 notification channels')
    })

    it('should fail if reminder minutes is negative', () => {
      const result = ClientPreferences.create({
        reminderMinutesBefore: -1
      })

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Reminder minutes cannot be negative')
    })

    it('should fail if reminder is more than 24 hours', () => {
      const result = ClientPreferences.create({
        reminderMinutesBefore: 1441
      })

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Reminder cannot be more than 24 hours')
    })

    it('should accept exactly 24 hours (1440 minutes)', () => {
      const result = ClientPreferences.create({
        reminderMinutesBefore: 1440
      })

      expect(result.isSuccess).toBe(true)
    })

    it('should fail if invalid language', () => {
      const result = ClientPreferences.create({
        language: 'fr' as any
      })

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Language must be "es" or "en"')
    })
  })

  describe('createDefault', () => {
    it('should create default preferences with Spanish', () => {
      const prefs = ClientPreferences.createDefault()

      expect(prefs.language).toBe('es')
      expect(prefs.notificationChannels).toEqual(['EMAIL'])
      expect(prefs.receivePromotions).toBe(true)
      expect(prefs.reminderMinutesBefore).toBe(60)
    })

    it('should create default preferences with English', () => {
      const prefs = ClientPreferences.createDefault('en')

      expect(prefs.language).toBe('en')
    })
  })

  describe('has* methods', () => {
    it('should check if has preferred barber', () => {
      const barber1 = new UniqueEntityID()
      const barber2 = new UniqueEntityID()
      const prefs = ClientPreferences.create({
        preferredBarbers: [barber1]
      }).value

      expect(prefs.hasPreferredBarber(barber1)).toBe(true)
      expect(prefs.hasPreferredBarber(barber2)).toBe(false)
    })

    it('should check if has preferred service', () => {
      const service1 = new UniqueEntityID()
      const service2 = new UniqueEntityID()
      const prefs = ClientPreferences.create({
        preferredServices: [service1]
      }).value

      expect(prefs.hasPreferredService(service1)).toBe(true)
      expect(prefs.hasPreferredService(service2)).toBe(false)
    })

    it('should check if has preferred time slot', () => {
      const prefs = ClientPreferences.create({
        preferredTimeSlots: ['MORNING', 'AFTERNOON']
      }).value

      expect(prefs.hasPreferredTimeSlot('MORNING')).toBe(true)
      expect(prefs.hasPreferredTimeSlot('EVENING')).toBe(false)
    })

    it('should check if has notification channel', () => {
      const prefs = ClientPreferences.create({
        notificationChannels: ['EMAIL', 'SMS']
      }).value

      expect(prefs.hasNotificationChannel('EMAIL')).toBe(true)
      expect(prefs.hasNotificationChannel('PUSH')).toBe(false)
    })
  })

  describe('addPreferredBarber', () => {
    it('should add barber', () => {
      const prefs = ClientPreferences.createDefault()
      const barber = new UniqueEntityID()

      const result = prefs.addPreferredBarber(barber)

      expect(result.isSuccess).toBe(true)
      expect(result.value.hasPreferredBarber(barber)).toBe(true)
    })

    it('should return same if barber already exists', () => {
      const barber = new UniqueEntityID()
      const prefs = ClientPreferences.create({
        preferredBarbers: [barber]
      }).value

      const result = prefs.addPreferredBarber(barber)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(prefs)
    })

    it('should fail if would exceed limit', () => {
      const barbers = Array.from({ length: 10 }, () => new UniqueEntityID())
      const prefs = ClientPreferences.create({
        preferredBarbers: barbers
      }).value
      const newBarber = new UniqueEntityID()

      const result = prefs.addPreferredBarber(newBarber)

      expect(result.isFailure).toBe(true)
    })
  })

  describe('removePreferredBarber', () => {
    it('should remove barber', () => {
      const barber = new UniqueEntityID()
      const prefs = ClientPreferences.create({
        preferredBarbers: [barber]
      }).value

      const result = prefs.removePreferredBarber(barber)

      expect(result.isSuccess).toBe(true)
      expect(result.value.hasPreferredBarber(barber)).toBe(false)
    })

    it('should return same if barber does not exist', () => {
      const barber = new UniqueEntityID()
      const prefs = ClientPreferences.createDefault()

      const result = prefs.removePreferredBarber(barber)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(prefs)
    })
  })

  describe('addPreferredService', () => {
    it('should add service', () => {
      const prefs = ClientPreferences.createDefault()
      const service = new UniqueEntityID()

      const result = prefs.addPreferredService(service)

      expect(result.isSuccess).toBe(true)
      expect(result.value.hasPreferredService(service)).toBe(true)
    })

    it('should return same if service already exists', () => {
      const service = new UniqueEntityID()
      const prefs = ClientPreferences.create({
        preferredServices: [service]
      }).value

      const result = prefs.addPreferredService(service)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(prefs)
    })
  })

  describe('removePreferredService', () => {
    it('should remove service', () => {
      const service = new UniqueEntityID()
      const prefs = ClientPreferences.create({
        preferredServices: [service]
      }).value

      const result = prefs.removePreferredService(service)

      expect(result.isSuccess).toBe(true)
      expect(result.value.hasPreferredService(service)).toBe(false)
    })

    it('should return same if service does not exist', () => {
      const service = new UniqueEntityID()
      const prefs = ClientPreferences.createDefault()

      const result = prefs.removePreferredService(service)

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBe(prefs)
    })
  })

  describe('updateLanguage', () => {
    it('should update language', () => {
      const prefs = ClientPreferences.createDefault('es')

      const result = prefs.updateLanguage('en')

      expect(result.isSuccess).toBe(true)
      expect(result.value.language).toBe('en')
    })
  })

  describe('updateReminderTime', () => {
    it('should update reminder time', () => {
      const prefs = ClientPreferences.createDefault()

      const result = prefs.updateReminderTime(120)

      expect(result.isSuccess).toBe(true)
      expect(result.value.reminderMinutesBefore).toBe(120)
    })

    it('should fail if invalid time', () => {
      const prefs = ClientPreferences.createDefault()

      const result = prefs.updateReminderTime(-10)

      expect(result.isFailure).toBe(true)
    })
  })

  describe('enablePromotions', () => {
    it('should enable promotions', () => {
      const prefs = ClientPreferences.create({
        receivePromotions: false
      }).value

      const result = prefs.enablePromotions()

      expect(result.isSuccess).toBe(true)
      expect(result.value.receivePromotions).toBe(true)
    })
  })

  describe('disablePromotions', () => {
    it('should disable promotions', () => {
      const prefs = ClientPreferences.createDefault()

      const result = prefs.disablePromotions()

      expect(result.isSuccess).toBe(true)
      expect(result.value.receivePromotions).toBe(false)
    })
  })

  describe('updateNotificationChannels', () => {
    it('should update notification channels', () => {
      const prefs = ClientPreferences.createDefault()

      const result = prefs.updateNotificationChannels(['SMS', 'WHATSAPP'])

      expect(result.isSuccess).toBe(true)
      expect(result.value.notificationChannels).toEqual(['SMS', 'WHATSAPP'])
    })

    it('should fail if invalid channels', () => {
      const prefs = ClientPreferences.createDefault()

      const result = prefs.updateNotificationChannels([])

      expect(result.isFailure).toBe(true)
    })
  })

  describe('immutability', () => {
    it('should be immutable', () => {
      const prefs = ClientPreferences.createDefault()

      expect(() => {
        (prefs as any).props.language = 'fr'
      }).toThrow()
    })

    it('should return copies of arrays', () => {
      const barber = new UniqueEntityID()
      const prefs = ClientPreferences.create({
        preferredBarbers: [barber]
      }).value

      const barbers1 = prefs.preferredBarbers
      const barbers2 = prefs.preferredBarbers

      expect(barbers1).not.toBe(barbers2)
      expect(barbers1).toEqual(barbers2)
    })
  })
})
