import { ValueObject } from '../common/value-object'
import { Result } from '../common/result'
import { Money } from './money.vo'
import { Currency } from './currency.vo'

export enum LoyaltyTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM'
}

interface ClientHistoryProps {
  totalAppointments: number
  completedAppointments: number
  cancelledAppointments: number
  noShowCount: number
  lifetimeValue: Money
  totalPoints: number
  firstVisit: Date | null
  lastVisit: Date | null
}

export class ClientHistory extends ValueObject<ClientHistoryProps> {
  private constructor(props: ClientHistoryProps) {
    super(props)
  }

  public static create(props: Partial<ClientHistoryProps>): Result<ClientHistory> {
    const totalAppointments = props.totalAppointments || 0
    const completedAppointments = props.completedAppointments || 0
    const cancelledAppointments = props.cancelledAppointments || 0
    const noShowCount = props.noShowCount || 0
    const lifetimeValue = props.lifetimeValue || Money.zero(Currency.ARS)
    const totalPoints = props.totalPoints || 0
    const firstVisit = props.firstVisit || null
    const lastVisit = props.lastVisit || null

    // Validate counts
    if (totalAppointments < 0) {
      return Result.fail<ClientHistory>('Total appointments cannot be negative')
    }

    if (completedAppointments < 0) {
      return Result.fail<ClientHistory>('Completed appointments cannot be negative')
    }

    if (cancelledAppointments < 0) {
      return Result.fail<ClientHistory>('Cancelled appointments cannot be negative')
    }

    if (noShowCount < 0) {
      return Result.fail<ClientHistory>('No-show count cannot be negative')
    }

    if (totalPoints < 0) {
      return Result.fail<ClientHistory>('Total points cannot be negative')
    }

    // Validate logical consistency
    if (completedAppointments > totalAppointments) {
      return Result.fail<ClientHistory>('Completed appointments cannot exceed total appointments')
    }

    if (cancelledAppointments > totalAppointments) {
      return Result.fail<ClientHistory>('Cancelled appointments cannot exceed total appointments')
    }

    if (noShowCount > totalAppointments) {
      return Result.fail<ClientHistory>('No-show count cannot exceed total appointments')
    }

    // Validate dates
    if (firstVisit && lastVisit && lastVisit < firstVisit) {
      return Result.fail<ClientHistory>('Last visit cannot be before first visit')
    }

    return Result.ok<ClientHistory>(
      new ClientHistory({
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        noShowCount,
        lifetimeValue,
        totalPoints,
        firstVisit,
        lastVisit
      })
    )
  }

  public static createNew(): ClientHistory {
    return new ClientHistory({
      totalAppointments: 0,
      completedAppointments: 0,
      cancelledAppointments: 0,
      noShowCount: 0,
      lifetimeValue: Money.zero(Currency.ARS),
      totalPoints: 0,
      firstVisit: null,
      lastVisit: null
    })
  }

  get totalAppointments(): number {
    return this.props.totalAppointments
  }

  get completedAppointments(): number {
    return this.props.completedAppointments
  }

  get cancelledAppointments(): number {
    return this.props.cancelledAppointments
  }

  get noShowCount(): number {
    return this.props.noShowCount
  }

  get lifetimeValue(): Money {
    return this.props.lifetimeValue
  }

  get totalPoints(): number {
    return this.props.totalPoints
  }

  get firstVisit(): Date | null {
    return this.props.firstVisit
  }

  get lastVisit(): Date | null {
    return this.props.lastVisit
  }

  get completionRate(): number {
    if (this.props.totalAppointments === 0) {
      return 0
    }
    return (this.props.completedAppointments / this.props.totalAppointments) * 100
  }

  get cancellationRate(): number {
    if (this.props.totalAppointments === 0) {
      return 0
    }
    return (this.props.cancelledAppointments / this.props.totalAppointments) * 100
  }

  get noShowRate(): number {
    if (this.props.totalAppointments === 0) {
      return 0
    }
    return (this.props.noShowCount / this.props.totalAppointments) * 100
  }

  get loyaltyTier(): LoyaltyTier {
    const completed = this.props.completedAppointments

    if (completed >= 50) {
      return LoyaltyTier.PLATINUM
    } else if (completed >= 25) {
      return LoyaltyTier.GOLD
    } else if (completed >= 10) {
      return LoyaltyTier.SILVER
    } else {
      return LoyaltyTier.BRONZE
    }
  }

  isNewClient(): boolean {
    return this.props.totalAppointments === 0
  }

  isReturningClient(): boolean {
    return this.props.completedAppointments > 0
  }

  hasHighNoShowRate(): boolean {
    return this.noShowRate > 20
  }

  hasHighCancellationRate(): boolean {
    return this.cancellationRate > 30
  }

  recordAppointmentCreated(): Result<ClientHistory> {
    return ClientHistory.create({
      ...this.props,
      totalAppointments: this.props.totalAppointments + 1
    })
  }

  recordAppointmentCompleted(amount: Money, appointmentDate: Date): Result<ClientHistory> {
    const newLifetimeValueResult = this.props.lifetimeValue.add(amount)
    if (newLifetimeValueResult.isFailure) {
      return Result.fail<ClientHistory>(newLifetimeValueResult.error!)
    }

    return ClientHistory.create({
      ...this.props,
      completedAppointments: this.props.completedAppointments + 1,
      lifetimeValue: newLifetimeValueResult.value,
      firstVisit: this.props.firstVisit || appointmentDate,
      lastVisit: appointmentDate
    })
  }

  recordAppointmentCancelled(): Result<ClientHistory> {
    return ClientHistory.create({
      ...this.props,
      cancelledAppointments: this.props.cancelledAppointments + 1
    })
  }

  recordNoShow(): Result<ClientHistory> {
    return ClientHistory.create({
      ...this.props,
      noShowCount: this.props.noShowCount + 1
    })
  }

  updateFirstVisit(date: Date): Result<ClientHistory> {
    return ClientHistory.create({
      ...this.props,
      firstVisit: date
    })
  }

  updateLastVisit(date: Date): Result<ClientHistory> {
    return ClientHistory.create({
      ...this.props,
      lastVisit: date
    })
  }

  addPoints(points: number): Result<ClientHistory> {
    if (points <= 0) {
      return Result.fail<ClientHistory>('Points to add must be positive')
    }

    return ClientHistory.create({
      ...this.props,
      totalPoints: this.props.totalPoints + points
    })
  }

  redeemPoints(points: number): Result<ClientHistory> {
    if (points <= 0) {
      return Result.fail<ClientHistory>('Points to redeem must be positive')
    }

    if (points > this.props.totalPoints) {
      return Result.fail<ClientHistory>(
        `Insufficient points. Available: ${this.props.totalPoints}, Required: ${points}`
      )
    }

    return ClientHistory.create({
      ...this.props,
      totalPoints: this.props.totalPoints - points
    })
  }
}
