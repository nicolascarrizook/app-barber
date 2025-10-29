import { Identifier } from './identifier'

/**
 * Unique identifier for domain entities
 * Wraps a string or number ID ensuring type safety and consistency
 */
export class UniqueEntityID extends Identifier<string | number> {
  constructor(id?: string | number) {
    super(id ?? UniqueEntityID.generateId())
  }

  /**
   * Generates a unique ID using timestamp and random components
   * Format: {timestamp}-{random}
   */
  private static generateId(): string {
    const timestamp = Date.now().toString(36)
    const randomPart = Math.random().toString(36).substring(2, 9)
    return `${timestamp}-${randomPart}`
  }

  /**
   * Creates a UniqueEntityID from a string or number
   */
  static create(id?: string | number): UniqueEntityID {
    return new UniqueEntityID(id)
  }
}
