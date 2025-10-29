import { AggregateRoot } from '../common/aggregate-root'
import { UniqueEntityID } from '../common/unique-entity-id'

/**
 * Generic repository interface for aggregate roots
 * Repositories are responsible for persisting and retrieving aggregates
 *
 * @template T - The aggregate root type
 */
export interface IRepository<T extends AggregateRoot<any>> {
  /**
   * Finds an aggregate by its unique identifier
   * @param id - The unique identifier of the aggregate
   * @returns The aggregate if found, null otherwise
   */
  findById(id: UniqueEntityID): Promise<T | null>

  /**
   * Saves an aggregate (create or update)
   * @param aggregate - The aggregate to save
   * @returns The saved aggregate
   */
  save(aggregate: T): Promise<T>

  /**
   * Deletes an aggregate by its identifier
   * @param id - The unique identifier of the aggregate to delete
   */
  delete(id: UniqueEntityID): Promise<void>

  /**
   * Checks if an aggregate exists by its identifier
   * @param id - The unique identifier to check
   * @returns True if the aggregate exists, false otherwise
   */
  exists(id: UniqueEntityID): Promise<boolean>
}
