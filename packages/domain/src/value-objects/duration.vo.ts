import { ValueObject } from '../common/value-object'
import { Result } from '../common/result'

interface DurationProps {
  minutes: number
}

export class Duration extends ValueObject<DurationProps> {
  private constructor(props: DurationProps) {
    super(props)
  }

  public static create(minutes: number): Result<Duration> {
    if (minutes <= 0) {
      return Result.fail<Duration>('Duration must be positive')
    }

    if (minutes > 480) {
      return Result.fail<Duration>('Duration cannot exceed 8 hours (480 minutes)')
    }

    if (!Number.isInteger(minutes)) {
      return Result.fail<Duration>('Duration must be in whole minutes')
    }

    return Result.ok<Duration>(new Duration({ minutes }))
  }

  public static fromHours(hours: number): Result<Duration> {
    if (hours <= 0) {
      return Result.fail<Duration>('Hours must be positive')
    }

    return Duration.create(hours * 60)
  }

  get minutes(): number {
    return this.props.minutes
  }

  get hours(): number {
    return this.props.minutes / 60
  }

  add(other: Duration): Result<Duration> {
    return Duration.create(this.props.minutes + other.props.minutes)
  }

  subtract(other: Duration): Result<Duration> {
    const newMinutes = this.props.minutes - other.props.minutes
    if (newMinutes <= 0) {
      return Result.fail<Duration>('Result duration must be positive')
    }

    return Duration.create(newMinutes)
  }

  multiply(factor: number): Result<Duration> {
    if (factor <= 0) {
      return Result.fail<Duration>('Factor must be positive')
    }

    return Duration.create(this.props.minutes * factor)
  }

  isLongerThan(other: Duration): boolean {
    return this.props.minutes > other.props.minutes
  }

  isShorterThan(other: Duration): boolean {
    return this.props.minutes < other.props.minutes
  }

  equals(other: Duration): boolean {
    if (!other || !(other instanceof Duration)) {
      return false
    }
    return this.props.minutes === other.props.minutes
  }

  toString(): string {
    if (this.props.minutes < 60) {
      return `${this.props.minutes}min`
    }

    const hours = Math.floor(this.props.minutes / 60)
    const mins = this.props.minutes % 60

    if (mins === 0) {
      return `${hours}h`
    }

    return `${hours}h ${mins}min`
  }
}
