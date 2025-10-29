import { DateTime, Duration } from 'luxon'
import { ValueObject } from '../common/value-object'
import { Result } from '../common/result'

interface TimeSlotProps {
  startTime: DateTime
  endTime: DateTime
}

/**
 * TimeSlot Value Object
 * Represents a period of time with start and end
 * Immutable and self-validating
 */
export class TimeSlot extends ValueObject<TimeSlotProps> {
  private constructor(props: TimeSlotProps) {
    super(props)
  }

  /**
   * Creates a TimeSlot with validation
   */
  static create(startTime: DateTime, endTime: DateTime): Result<TimeSlot> {
    // Validate end time is after start time
    if (endTime <= startTime) {
      return Result.fail('End time must be after start time')
    }

    // Validate start time is not in the past
    if (startTime < DateTime.now()) {
      return Result.fail('Start time cannot be in the past')
    }

    return Result.ok(new TimeSlot({ startTime, endTime }))
  }

  /**
   * Creates a TimeSlot without past validation (for existing data)
   */
  static createWithoutPastValidation(
    startTime: DateTime,
    endTime: DateTime
  ): Result<TimeSlot> {
    if (endTime <= startTime) {
      return Result.fail('End time must be after start time')
    }

    return Result.ok(new TimeSlot({ startTime, endTime }))
  }

  get startTime(): DateTime {
    return this.props.startTime
  }

  get endTime(): DateTime {
    return this.props.endTime
  }

  /**
   * Gets the duration of this time slot
   */
  get duration(): Duration {
    return this.props.endTime.diff(this.props.startTime)
  }

  /**
   * Gets duration in minutes
   */
  get durationInMinutes(): number {
    return this.duration.as('minutes')
  }

  /**
   * Checks if this slot overlaps with another
   */
  overlaps(other: TimeSlot): boolean {
    return (
      this.props.startTime < other.props.endTime &&
      this.props.endTime > other.props.startTime
    )
  }

  /**
   * Validates if this slot is still valid (not in past)
   */
  isValid(): boolean {
    return (
      this.props.endTime > this.props.startTime &&
      this.props.startTime >= DateTime.now()
    )
  }

  /**
   * Checks if the end time is in the past
   */
  isPast(): boolean {
    return this.props.endTime < DateTime.now()
  }

  /**
   * Checks if the start time is in the future
   */
  isFuture(): boolean {
    return this.props.startTime > DateTime.now()
  }

  /**
   * Checks if a given time is within this slot
   */
  includes(time: DateTime): boolean {
    return time > this.props.startTime && time < this.props.endTime
  }

  /**
   * Checks if this slot is currently active
   */
  isActive(): boolean {
    const now = DateTime.now()
    return now >= this.props.startTime && now <= this.props.endTime
  }

  /**
   * Creates a new slot shifted by a duration
   */
  shift(duration: Duration): TimeSlot {
    return new TimeSlot({
      startTime: this.props.startTime.plus(duration),
      endTime: this.props.endTime.plus(duration)
    })
  }

  /**
   * Extends the end time by a duration
   */
  extend(duration: Duration): TimeSlot {
    return new TimeSlot({
      startTime: this.props.startTime,
      endTime: this.props.endTime.plus(duration)
    })
  }
}
