import { ValueObject } from '../common/value-object'
import { Result } from '../common/result'
import { UniqueEntityID } from '../common/unique-entity-id'

export type PreferredTimeSlot = 'MORNING' | 'AFTERNOON' | 'EVENING'
export type NotificationChannel = 'EMAIL' | 'SMS' | 'PUSH' | 'WHATSAPP'
export type Language = 'es' | 'en'

export type PreferredContactMethod = 'email' | 'sms' | 'whatsapp'

interface ClientPreferencesProps {
  preferredBarbers: UniqueEntityID[]
  preferredServices: UniqueEntityID[]
  preferredTimeSlots: PreferredTimeSlot[]
  notificationChannels: NotificationChannel[]
  language: Language
  receivePromotions: boolean
  receiveReminders: boolean
  preferredContactMethod: PreferredContactMethod
  reminderMinutesBefore: number
}

export class ClientPreferences extends ValueObject<ClientPreferencesProps> {
  private constructor(props: ClientPreferencesProps) {
    super(props)
  }

  public static create(props: Partial<ClientPreferencesProps>): Result<ClientPreferences> {
    // Default values
    const preferredBarbers = props.preferredBarbers || []
    const preferredServices = props.preferredServices || []
    const preferredTimeSlots = props.preferredTimeSlots || []
    const notificationChannels = props.notificationChannels || ['EMAIL']
    const language = props.language || 'es'
    const receivePromotions = props.receivePromotions !== undefined ? props.receivePromotions : true
    const receiveReminders = props.receiveReminders !== undefined ? props.receiveReminders : true
    const preferredContactMethod = props.preferredContactMethod || 'email'
    const reminderMinutesBefore = props.reminderMinutesBefore !== undefined ? props.reminderMinutesBefore : 60

    // Validate limits
    if (preferredBarbers.length > 10) {
      return Result.fail<ClientPreferences>('Cannot have more than 10 preferred barbers')
    }

    if (preferredServices.length > 20) {
      return Result.fail<ClientPreferences>('Cannot have more than 20 preferred services')
    }

    if (preferredTimeSlots.length > 3) {
      return Result.fail<ClientPreferences>('Cannot have more than 3 preferred time slots')
    }

    if (notificationChannels.length === 0) {
      return Result.fail<ClientPreferences>('At least one notification channel is required')
    }

    if (notificationChannels.length > 4) {
      return Result.fail<ClientPreferences>('Cannot have more than 4 notification channels')
    }

    // Validate reminder time
    if (reminderMinutesBefore < 0) {
      return Result.fail<ClientPreferences>('Reminder minutes cannot be negative')
    }

    if (reminderMinutesBefore > 1440) {
      return Result.fail<ClientPreferences>('Reminder cannot be more than 24 hours before')
    }

    // Validate language
    if (language !== 'es' && language !== 'en') {
      return Result.fail<ClientPreferences>('Language must be "es" or "en"')
    }

    // Remove duplicates
    const uniqueBarbers = Array.from(new Set(preferredBarbers.map(b => b.toString())))
      .map(id => new UniqueEntityID(id))
    const uniqueServices = Array.from(new Set(preferredServices.map(s => s.toString())))
      .map(id => new UniqueEntityID(id))
    const uniqueTimeSlots = Array.from(new Set(preferredTimeSlots))
    const uniqueChannels = Array.from(new Set(notificationChannels))

    return Result.ok<ClientPreferences>(
      new ClientPreferences({
        preferredBarbers: uniqueBarbers,
        preferredServices: uniqueServices,
        preferredTimeSlots: uniqueTimeSlots,
        notificationChannels: uniqueChannels,
        language,
        receivePromotions,
        receiveReminders,
        preferredContactMethod,
        reminderMinutesBefore
      })
    )
  }

  public static createDefault(language: Language = 'es'): ClientPreferences {
    return new ClientPreferences({
      preferredBarbers: [],
      preferredServices: [],
      preferredTimeSlots: [],
      notificationChannels: ['EMAIL'],
      language,
      receivePromotions: true,
      receiveReminders: true,
      preferredContactMethod: 'email',
      reminderMinutesBefore: 60
    })
  }

  get preferredBarbers(): UniqueEntityID[] {
    return [...this.props.preferredBarbers]
  }

  get preferredServices(): UniqueEntityID[] {
    return [...this.props.preferredServices]
  }

  get preferredTimeSlots(): PreferredTimeSlot[] {
    return [...this.props.preferredTimeSlots]
  }

  get notificationChannels(): NotificationChannel[] {
    return [...this.props.notificationChannels]
  }

  get language(): Language {
    return this.props.language
  }

  get receivePromotions(): boolean {
    return this.props.receivePromotions
  }

  get receiveReminders(): boolean {
    return this.props.receiveReminders
  }

  get preferredContactMethod(): PreferredContactMethod {
    return this.props.preferredContactMethod
  }

  get reminderMinutesBefore(): number {
    return this.props.reminderMinutesBefore
  }

  hasPreferredBarber(barberId: UniqueEntityID): boolean {
    return this.props.preferredBarbers.some(b => b.equals(barberId))
  }

  hasPreferredService(serviceId: UniqueEntityID): boolean {
    return this.props.preferredServices.some(s => s.equals(serviceId))
  }

  hasPreferredTimeSlot(timeSlot: PreferredTimeSlot): boolean {
    return this.props.preferredTimeSlots.includes(timeSlot)
  }

  hasNotificationChannel(channel: NotificationChannel): boolean {
    return this.props.notificationChannels.includes(channel)
  }

  addPreferredBarber(barberId: UniqueEntityID): Result<ClientPreferences> {
    if (this.hasPreferredBarber(barberId)) {
      return Result.ok<ClientPreferences>(this)
    }

    const newBarbers = [...this.props.preferredBarbers, barberId]
    return ClientPreferences.create({
      ...this.props,
      preferredBarbers: newBarbers
    })
  }

  removePreferredBarber(barberId: UniqueEntityID): Result<ClientPreferences> {
    if (!this.hasPreferredBarber(barberId)) {
      return Result.ok<ClientPreferences>(this)
    }

    const newBarbers = this.props.preferredBarbers.filter(b => !b.equals(barberId))
    return ClientPreferences.create({
      ...this.props,
      preferredBarbers: newBarbers
    })
  }

  addPreferredService(serviceId: UniqueEntityID): Result<ClientPreferences> {
    if (this.hasPreferredService(serviceId)) {
      return Result.ok<ClientPreferences>(this)
    }

    const newServices = [...this.props.preferredServices, serviceId]
    return ClientPreferences.create({
      ...this.props,
      preferredServices: newServices
    })
  }

  removePreferredService(serviceId: UniqueEntityID): Result<ClientPreferences> {
    if (!this.hasPreferredService(serviceId)) {
      return Result.ok<ClientPreferences>(this)
    }

    const newServices = this.props.preferredServices.filter(s => !s.equals(serviceId))
    return ClientPreferences.create({
      ...this.props,
      preferredServices: newServices
    })
  }

  updateLanguage(language: Language): Result<ClientPreferences> {
    return ClientPreferences.create({
      ...this.props,
      language
    })
  }

  updateReminderTime(minutes: number): Result<ClientPreferences> {
    return ClientPreferences.create({
      ...this.props,
      reminderMinutesBefore: minutes
    })
  }

  enablePromotions(): Result<ClientPreferences> {
    return ClientPreferences.create({
      ...this.props,
      receivePromotions: true
    })
  }

  disablePromotions(): Result<ClientPreferences> {
    return ClientPreferences.create({
      ...this.props,
      receivePromotions: false
    })
  }

  updateNotificationChannels(channels: NotificationChannel[]): Result<ClientPreferences> {
    return ClientPreferences.create({
      ...this.props,
      notificationChannels: channels
    })
  }
}
