import { ValueObject } from '../common/value-object'
import { Result } from '../common/result'

export enum BarberStatusType {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  SUSPENDED = 'SUSPENDED'
}

interface BarberStatusProps {
  status: BarberStatusType
  reason?: string
  since: Date
}

export class BarberStatus extends ValueObject<BarberStatusProps> {
  private constructor(props: BarberStatusProps) {
    super(props)
  }

  public static create(
    status: BarberStatusType,
    reason?: string,
    since?: Date
  ): Result<BarberStatus> {
    if (!Object.values(BarberStatusType).includes(status)) {
      return Result.fail<BarberStatus>(`Invalid status: ${status}`)
    }

    // Require reason for INACTIVE, ON_LEAVE, or SUSPENDED
    if (
      (status === BarberStatusType.INACTIVE ||
        status === BarberStatusType.ON_LEAVE ||
        status === BarberStatusType.SUSPENDED) &&
      (!reason || reason.trim().length === 0)
    ) {
      return Result.fail<BarberStatus>(`Reason is required for status: ${status}`)
    }

    if (reason && reason.trim().length > 500) {
      return Result.fail<BarberStatus>('Reason must not exceed 500 characters')
    }

    return Result.ok<BarberStatus>(
      new BarberStatus({
        status,
        reason: reason?.trim(),
        since: since || new Date()
      })
    )
  }

  public static createActive(): BarberStatus {
    return new BarberStatus({
      status: BarberStatusType.ACTIVE,
      since: new Date()
    })
  }

  get status(): BarberStatusType {
    return this.props.status
  }

  get reason(): string | undefined {
    return this.props.reason
  }

  get since(): Date {
    return this.props.since
  }

  isActive(): boolean {
    return this.props.status === BarberStatusType.ACTIVE
  }

  isInactive(): boolean {
    return this.props.status === BarberStatusType.INACTIVE
  }

  isOnLeave(): boolean {
    return this.props.status === BarberStatusType.ON_LEAVE
  }

  isSuspended(): boolean {
    return this.props.status === BarberStatusType.SUSPENDED
  }

  canAcceptAppointments(): boolean {
    return this.isActive()
  }

  changeTo(newStatus: BarberStatusType, reason?: string): Result<BarberStatus> {
    if (this.props.status === newStatus) {
      return Result.ok<BarberStatus>(this)
    }

    return BarberStatus.create(newStatus, reason)
  }

  activate(): Result<BarberStatus> {
    if (this.isActive()) {
      return Result.ok<BarberStatus>(this)
    }

    return BarberStatus.create(BarberStatusType.ACTIVE)
  }

  deactivate(reason: string): Result<BarberStatus> {
    if (this.isInactive()) {
      return Result.ok<BarberStatus>(this)
    }

    return BarberStatus.create(BarberStatusType.INACTIVE, reason)
  }

  setOnLeave(reason: string): Result<BarberStatus> {
    if (this.isOnLeave()) {
      return Result.ok<BarberStatus>(this)
    }

    return BarberStatus.create(BarberStatusType.ON_LEAVE, reason)
  }

  suspend(reason: string): Result<BarberStatus> {
    if (this.isSuspended()) {
      return Result.ok<BarberStatus>(this)
    }

    return BarberStatus.create(BarberStatusType.SUSPENDED, reason)
  }

  getDaysSince(): number {
    const now = new Date()
    const diff = now.getTime() - this.props.since.getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }
}
