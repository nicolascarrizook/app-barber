/**
 * Generic identifier class for type-safe value object IDs
 * Used as base for UniqueEntityID and other identifier types
 */
export class Identifier<T> {
  constructor(private value: T) {
    this.value = value
  }

  /**
   * Returns the underlying value of the identifier
   */
  toValue(): T {
    return this.value
  }

  /**
   * Compares two identifiers for equality
   */
  equals(id?: Identifier<T>): boolean {
    if (id === null || id === undefined) {
      return false
    }

    if (!(id instanceof this.constructor)) {
      return false
    }

    return id.toValue() === this.value
  }

  /**
   * Returns string representation of the identifier
   */
  toString(): string {
    return String(this.value)
  }
}
