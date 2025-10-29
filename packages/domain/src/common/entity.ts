import { UniqueEntityID } from './unique-entity-id'

/**
 * Base class for all domain entities
 * Entities are objects that have a unique identity throughout their lifecycle
 * Equality is determined by ID, not by attributes
 */
export abstract class Entity<T> {
  protected readonly _id: UniqueEntityID
  protected props: T

  constructor(props: T, id?: UniqueEntityID) {
    this._id = id ?? new UniqueEntityID()
    this.props = props
  }

  /**
   * Returns the unique identifier of the entity
   */
  get id(): UniqueEntityID {
    return this._id
  }

  /**
   * Compares two entities for equality based on their ID
   */
  public equals(object?: Entity<T>): boolean {
    if (object === null || object === undefined) {
      return false
    }

    if (this === object) {
      return true
    }

    if (!(object instanceof Entity)) {
      return false
    }

    return this._id.equals(object._id)
  }
}
