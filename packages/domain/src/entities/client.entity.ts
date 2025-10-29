import { AggregateRoot } from '../common/aggregate-root'
import { UniqueEntityID } from '../common/unique-entity-id'
import { Result } from '../common/result'
import { Email } from '../value-objects/email.vo'
import { Phone } from '../value-objects/phone.vo'
import { Money } from '../value-objects/money.vo'
import { ClientStatus } from '../value-objects/client-status.vo'
import { ClientPreferences, Language } from '../value-objects/client-preferences.vo'
import { ClientHistory, LoyaltyTier } from '../value-objects/client-history.vo'
import {
  ClientCreatedEvent,
  ClientUpdatedEvent,
  ClientActivatedEvent,
  ClientDeactivatedEvent,
  ClientSuspendedEvent,
  ClientBlockedEvent,
  ClientPreferencesUpdatedEvent,
  ClientAppointmentCompletedEvent
} from '../events/client.events'

export interface CreateClientProps {
  firstName: string
  lastName: string
  email: Email
  phone: Phone
  preferences?: ClientPreferences
  notes?: string
}

interface ClientProps {
  clientId: UniqueEntityID
  firstName: string
  lastName: string
  email: Email
  phone: Phone
  preferences: ClientPreferences
  history: ClientHistory
  status: ClientStatus
  notes: string
  createdAt: Date
  updatedAt: Date
}

export class Client extends AggregateRoot<ClientProps> {
  private constructor(props: ClientProps) {
    super(props)
  }

  public static create(props: CreateClientProps, id?: UniqueEntityID): Result<Client> {
    // Validate required fields
    if (!props.firstName || props.firstName.trim().length === 0) {
      return Result.fail<Client>('First name is required')
    }

    if (props.firstName.trim().length < 2) {
      return Result.fail<Client>('First name must be at least 2 characters')
    }

    if (props.firstName.trim().length > 50) {
      return Result.fail<Client>('First name must not exceed 50 characters')
    }

    if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(props.firstName.trim())) {
      return Result.fail<Client>('First name contains invalid characters')
    }

    if (!props.lastName || props.lastName.trim().length === 0) {
      return Result.fail<Client>('Last name is required')
    }

    if (props.lastName.trim().length < 2) {
      return Result.fail<Client>('Last name must be at least 2 characters')
    }

    if (props.lastName.trim().length > 50) {
      return Result.fail<Client>('Last name must not exceed 50 characters')
    }

    if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(props.lastName.trim())) {
      return Result.fail<Client>('Last name contains invalid characters')
    }

    // Validate notes if provided
    if (props.notes && props.notes.trim().length > 2000) {
      return Result.fail<Client>('Notes must not exceed 2000 characters')
    }

    const clientId = id || new UniqueEntityID()
    const preferences = props.preferences || ClientPreferences.createDefault()
    const history = ClientHistory.createNew()
    const status = ClientStatus.createActive()
    const notes = props.notes?.trim() || ''

    const client = new Client({
      clientId,
      firstName: props.firstName.trim(),
      lastName: props.lastName.trim(),
      email: props.email,
      phone: props.phone,
      preferences,
      history,
      status,
      notes,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const isNewClient = !id
    if (isNewClient) {
      client.addDomainEvent(new ClientCreatedEvent(client))
    }

    return Result.ok<Client>(client)
  }

  get clientId(): UniqueEntityID {
    return this.props.clientId
  }

  get firstName(): string {
    return this.props.firstName
  }

  get lastName(): string {
    return this.props.lastName
  }

  get fullName(): string {
    return `${this.props.firstName} ${this.props.lastName}`
  }

  get email(): Email {
    return this.props.email
  }

  get phone(): Phone {
    return this.props.phone
  }

  get preferences(): ClientPreferences {
    return this.props.preferences
  }

  get history(): ClientHistory {
    return this.props.history
  }

  get status(): ClientStatus {
    return this.props.status
  }

  get notes(): string {
    return this.props.notes
  }

  get loyaltyTier(): LoyaltyTier {
    return this.props.history.loyaltyTier
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  updateInfo(props: {
    firstName?: string
    lastName?: string
    phone?: Phone
    notes?: string
  }): Result<void> {
    // Validate firstName if provided
    if (props.firstName !== undefined) {
      if (!props.firstName || props.firstName.trim().length === 0) {
        return Result.fail<void>('First name is required')
      }
      if (props.firstName.trim().length < 2 || props.firstName.trim().length > 50) {
        return Result.fail<void>('First name must be between 2 and 50 characters')
      }
      if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(props.firstName.trim())) {
        return Result.fail<void>('First name contains invalid characters')
      }
      this.props.firstName = props.firstName.trim()
    }

    // Validate lastName if provided
    if (props.lastName !== undefined) {
      if (!props.lastName || props.lastName.trim().length === 0) {
        return Result.fail<void>('Last name is required')
      }
      if (props.lastName.trim().length < 2 || props.lastName.trim().length > 50) {
        return Result.fail<void>('Last name must be between 2 and 50 characters')
      }
      if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(props.lastName.trim())) {
        return Result.fail<void>('Last name contains invalid characters')
      }
      this.props.lastName = props.lastName.trim()
    }

    if (props.phone) {
      this.props.phone = props.phone
    }

    if (props.notes !== undefined) {
      if (props.notes.trim().length > 2000) {
        return Result.fail<void>('Notes must not exceed 2000 characters')
      }
      this.props.notes = props.notes.trim()
    }

    this.props.updatedAt = new Date()
    this.addDomainEvent(new ClientUpdatedEvent(this))

    return Result.ok<void>()
  }

  updatePreferences(preferences: ClientPreferences): Result<void> {
    if (!this.status.isActive()) {
      return Result.fail<void>('Cannot update preferences of inactive client')
    }

    this.props.preferences = preferences
    this.props.updatedAt = new Date()
    this.addDomainEvent(new ClientPreferencesUpdatedEvent(this))

    return Result.ok<void>()
  }

  updateLanguage(language: Language): Result<void> {
    const result = this.props.preferences.updateLanguage(language)
    if (result.isFailure) {
      return Result.fail<void>(result.error!)
    }

    this.props.preferences = result.value
    this.props.updatedAt = new Date()
    this.addDomainEvent(new ClientPreferencesUpdatedEvent(this))

    return Result.ok<void>()
  }

  recordAppointmentCompleted(amount: Money, appointmentDate: Date): Result<void> {
    const historyResult = this.props.history.recordAppointmentCompleted(amount, appointmentDate)
    if (historyResult.isFailure) {
      return Result.fail<void>(historyResult.error!)
    }

    this.props.history = historyResult.value
    this.props.updatedAt = new Date()
    this.addDomainEvent(new ClientAppointmentCompletedEvent(this, amount))

    return Result.ok<void>()
  }

  recordAppointmentCancelled(): Result<void> {
    const historyResult = this.props.history.recordAppointmentCancelled()
    if (historyResult.isFailure) {
      return Result.fail<void>(historyResult.error!)
    }

    this.props.history = historyResult.value
    this.props.updatedAt = new Date()

    return Result.ok<void>()
  }

  recordNoShow(): Result<void> {
    const historyResult = this.props.history.recordNoShow()
    if (historyResult.isFailure) {
      return Result.fail<void>(historyResult.error!)
    }

    this.props.history = historyResult.value
    this.props.updatedAt = new Date()

    // Auto-suspend if high no-show rate
    if (this.props.history.hasHighNoShowRate() && this.status.isActive()) {
      const suspendResult = this.suspend('High no-show rate detected')
      if (suspendResult.isFailure) {
        return Result.fail<void>(suspendResult.error!)
      }
    }

    return Result.ok<void>()
  }

  activate(): Result<void> {
    if (this.status.isActive()) {
      return Result.ok<void>()
    }

    const statusResult = this.status.activate()
    if (statusResult.isFailure) {
      return Result.fail<void>(statusResult.error!)
    }

    this.props.status = statusResult.value
    this.props.updatedAt = new Date()
    this.addDomainEvent(new ClientActivatedEvent(this))

    return Result.ok<void>()
  }

  deactivate(reason: string): Result<void> {
    if (this.status.isInactive()) {
      return Result.ok<void>()
    }

    const statusResult = this.status.deactivate(reason)
    if (statusResult.isFailure) {
      return Result.fail<void>(statusResult.error!)
    }

    this.props.status = statusResult.value
    this.props.updatedAt = new Date()
    this.addDomainEvent(new ClientDeactivatedEvent(this, reason))

    return Result.ok<void>()
  }

  suspend(reason: string): Result<void> {
    if (this.status.isSuspended()) {
      return Result.ok<void>()
    }

    const statusResult = this.status.suspend(reason)
    if (statusResult.isFailure) {
      return Result.fail<void>(statusResult.error!)
    }

    this.props.status = statusResult.value
    this.props.updatedAt = new Date()
    this.addDomainEvent(new ClientSuspendedEvent(this, reason))

    return Result.ok<void>()
  }

  block(reason: string): Result<void> {
    if (this.status.isBlocked()) {
      return Result.ok<void>()
    }

    const statusResult = this.status.block(reason)
    if (statusResult.isFailure) {
      return Result.fail<void>(statusResult.error!)
    }

    this.props.status = statusResult.value
    this.props.updatedAt = new Date()
    this.addDomainEvent(new ClientBlockedEvent(this, reason))

    return Result.ok<void>()
  }

  unblock(): Result<void> {
    const statusResult = this.status.unblock()
    if (statusResult.isFailure) {
      return Result.fail<void>(statusResult.error!)
    }

    this.props.status = statusResult.value
    this.props.updatedAt = new Date()
    this.addDomainEvent(new ClientActivatedEvent(this))

    return Result.ok<void>()
  }

  addNote(note: string): Result<void> {
    if (!note || note.trim().length === 0) {
      return Result.fail<void>('Note cannot be empty')
    }

    const newNotes = this.props.notes
      ? `${this.props.notes}\n---\n${note.trim()}`
      : note.trim()

    if (newNotes.length > 2000) {
      return Result.fail<void>('Total notes exceed 2000 characters')
    }

    this.props.notes = newNotes
    this.props.updatedAt = new Date()

    return Result.ok<void>()
  }

  canBookAppointments(): boolean {
    return this.status.canBookAppointments() && !this.history.hasHighNoShowRate()
  }

  isNewClient(): boolean {
    return this.props.history.isNewClient()
  }

  isReturningClient(): boolean {
    return this.props.history.isReturningClient()
  }

  isVIPClient(): boolean {
    return (
      this.props.history.loyaltyTier === LoyaltyTier.GOLD ||
      this.props.history.loyaltyTier === LoyaltyTier.PLATINUM
    )
  }

  addLoyaltyPoints(points: number): Result<void> {
    const addResult = this.props.history.addPoints(points)
    if (addResult.isFailure) {
      return Result.fail<void>(addResult.error!)
    }

    this.props.history = addResult.value
    this.props.updatedAt = new Date()

    return Result.ok<void>()
  }

  redeemLoyaltyPoints(points: number): Result<void> {
    const redeemResult = this.props.history.redeemPoints(points)
    if (redeemResult.isFailure) {
      return Result.fail<void>(redeemResult.error!)
    }

    this.props.history = redeemResult.value
    this.props.updatedAt = new Date()

    return Result.ok<void>()
  }

  updateProfile(updates: {
    firstName?: string
    lastName?: string
    phone?: Phone
    notes?: string
  }): Result<void> {
    if (updates.firstName !== undefined) {
      const trimmedFirst = updates.firstName.trim()
      if (!trimmedFirst) {
        return Result.fail<void>('First name cannot be empty')
      }
      if (trimmedFirst.length < 2 || trimmedFirst.length > 50) {
        return Result.fail<void>('First name must be between 2 and 50 characters')
      }
      this.props.firstName = trimmedFirst
    }

    if (updates.lastName !== undefined) {
      const trimmedLast = updates.lastName.trim()
      if (!trimmedLast) {
        return Result.fail<void>('Last name cannot be empty')
      }
      if (trimmedLast.length < 2 || trimmedLast.length > 50) {
        return Result.fail<void>('Last name must be between 2 and 50 characters')
      }
      this.props.lastName = trimmedLast
    }

    if (updates.phone !== undefined) {
      this.props.phone = updates.phone
    }

    if (updates.notes !== undefined) {
      if (updates.notes.length > 2000) {
        return Result.fail<void>('Notes cannot exceed 2000 characters')
      }
      this.props.notes = updates.notes
    }

    this.props.updatedAt = new Date()

    return Result.ok<void>()
  }
}
