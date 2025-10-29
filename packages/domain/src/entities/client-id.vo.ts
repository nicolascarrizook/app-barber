import { UniqueEntityID } from '../common/unique-entity-id'

/**
 * Value Object representing a Client identifier
 */
export class ClientId {
  private constructor(private readonly value: UniqueEntityID) {}

  static create(id?: string | number): ClientId {
    return new ClientId(new UniqueEntityID(id))
  }

  static fromString(id: string): ClientId {
    return new ClientId(new UniqueEntityID(id))
  }

  getId(): UniqueEntityID {
    return this.value
  }

  toString(): string {
    return this.value.toString()
  }

  equals(other: ClientId): boolean {
    if (!(other instanceof ClientId)) {
      return false
    }
    return this.value.equals(other.value)
  }
}
