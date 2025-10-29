import { UniqueEntityID } from '../common/unique-entity-id'

/**
 * Value Object representing a Barber identifier
 */
export class BarberId {
  private constructor(private readonly value: UniqueEntityID) {}

  static create(id?: string | number): BarberId {
    return new BarberId(new UniqueEntityID(id))
  }

  static fromString(id: string): BarberId {
    return new BarberId(new UniqueEntityID(id))
  }

  getId(): UniqueEntityID {
    return this.value
  }

  toString(): string {
    return this.value.toString()
  }

  equals(other: BarberId): boolean {
    if (!(other instanceof BarberId)) {
      return false
    }
    return this.value.equals(other.value)
  }
}
