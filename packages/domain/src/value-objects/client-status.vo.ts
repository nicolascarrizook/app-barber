import { ValueObject } from '../common/value-object'
import { Result } from '../common/result'

export enum ClientStatusType {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  BLOCKED = 'BLOCKED'
}

interface ClientStatusProps {
  status: ClientStatusType
  reason?: string
  since: Date
}

export class ClientStatus extends ValueObject<ClientStatusProps> {
  private constructor(props: ClientStatusProps) {
    super(props)
  }

  public static create(
    status: ClientStatusType,
    reason?: string,
    since?: Date
  ): Result<ClientStatus> {
    // Require reason for non-active statuses
    if (
      (status === ClientStatusType.INACTIVE ||
        status === ClientStatusType.SUSPENDED ||
        status === ClientStatusType.BLOCKED) &&
      (!reason || reason.trim().length === 0)
    ) {
      return Result.fail<ClientStatus>(`Reason is required for status: ${status}`)
    }

    // Validate reason length if provided
    if (reason && reason.trim().length > 500) {
      return Result.fail<ClientStatus>('Reason must not exceed 500 characters')
    }

    return Result.ok<ClientStatus>(
      new ClientStatus({
        status,
        reason: reason?.trim(),
        since: since || new Date()
      })
    )
  }

  public static createActive(): ClientStatus {
    return new ClientStatus({
      status: ClientStatusType.ACTIVE,
      since: new Date()
    })
  }

  get status(): ClientStatusType {
    return this.props.status
  }

  get reason(): string | undefined {
    return this.props.reason
  }

  get since(): Date {
    return this.props.since
  }

  isActive(): boolean {
    return this.props.status === ClientStatusType.ACTIVE
  }

  isInactive(): boolean {
    return this.props.status === ClientStatusType.INACTIVE
  }

  isSuspended(): boolean {
    return this.props.status === ClientStatusType.SUSPENDED
  }

  isBlocked(): boolean {
    return this.props.status === ClientStatusType.BLOCKED
  }

  canBookAppointments(): boolean {
    return this.isActive()
  }

  activate(): Result<ClientStatus> {
    if (this.isActive()) {
      return Result.ok<ClientStatus>(this)
    }

    if (this.isBlocked()) {
      return Result.fail<ClientStatus>('Blocked clients cannot be activated directly')
    }

    return ClientStatus.create(ClientStatusType.ACTIVE)
  }

  deactivate(reason: string): Result<ClientStatus> {
    if (this.isInactive()) {
      return Result.ok<ClientStatus>(this)
    }

    return ClientStatus.create(ClientStatusType.INACTIVE, reason)
  }

  suspend(reason: string): Result<ClientStatus> {
    if (this.isSuspended()) {
      return Result.ok<ClientStatus>(this)
    }

    if (this.isBlocked()) {
      return Result.fail<ClientStatus>('Cannot suspend a blocked client')
    }

    return ClientStatus.create(ClientStatusType.SUSPENDED, reason)
  }

  block(reason: string): Result<ClientStatus> {
    if (this.isBlocked()) {
      return Result.ok<ClientStatus>(this)
    }

    return ClientStatus.create(ClientStatusType.BLOCKED, reason)
  }

  unblock(): Result<ClientStatus> {
    if (!this.isBlocked()) {
      return Result.fail<ClientStatus>('Client is not blocked')
    }

    return ClientStatus.create(ClientStatusType.ACTIVE)
  }
}
