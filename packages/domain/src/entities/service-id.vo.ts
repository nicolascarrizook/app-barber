import { UniqueEntityID } from '../common/unique-entity-id'

/**
 * Value Object representing a Service identifier
 */
export class ServiceId {
  private constructor(private readonly value: UniqueEntityID) {}

  static create(id?: string | number): ServiceId {
    return new ServiceId(new UniqueEntityID(id))
  }

  static fromString(id: string): ServiceId {
    return new ServiceId(new UniqueEntityID(id))
  }

  getId(): UniqueEntityID {
    return this.value
  }

  toString(): string {
    return this.value.toString()
  }

  equals(other: ServiceId): boolean {
    if (!(other instanceof ServiceId)) {
      return false
    }
    return this.value.equals(other.value)
  }
}
