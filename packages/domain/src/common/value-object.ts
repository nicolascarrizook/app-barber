/**
 * Base class for all Value Objects in the domain
 * Value Objects are immutable and compared by value, not identity
 */
export abstract class ValueObject<T> {
  protected readonly props: T

  protected constructor(props: T) {
    this.props = Object.freeze(props)
  }

  /**
   * Compares this value object with another for equality
   */
  equals(vo?: ValueObject<T>): boolean {
    if (vo === null || vo === undefined) {
      return false
    }
    if (vo.props === undefined) {
      return false
    }
    return JSON.stringify(this.props) === JSON.stringify(vo.props)
  }
}
