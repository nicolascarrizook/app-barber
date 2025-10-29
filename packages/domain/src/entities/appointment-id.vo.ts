import { UniqueEntityID } from '../common/unique-entity-id'

/**
 * Value Object representing an Appointment identifier
 * Wraps UniqueEntityID for type safety
 */
export class AppointmentId {
  private constructor(private readonly value: UniqueEntityID) {}

  /**
   * Creates a new AppointmentId with a generated UUID
   */
  static create(id?: string | number): AppointmentId {
    return new AppointmentId(new UniqueEntityID(id))
  }

  /**
   * Creates AppointmentId from existing UUID string
   */
  static fromString(id: string): AppointmentId {
    return new AppointmentId(new UniqueEntityID(id))
  }

  /**
   * Returns the underlying UniqueEntityID
   */
  getId(): UniqueEntityID {
    return this.value
  }

  /**
   * Returns string representation
   */
  toString(): string {
    return this.value.toString()
  }

  /**
   * Compares two AppointmentIds for equality
   */
  equals(other: AppointmentId): boolean {
    if (!(other instanceof AppointmentId)) {
      return false
    }
    return this.value.equals(other.value)
  }
}
