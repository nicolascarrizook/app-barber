/**
 * Result Pattern for error handling without exceptions
 * Used throughout the domain layer for business rule violations
 */
export class Result<T> {
  private constructor(
    public readonly isSuccess: boolean,
    public readonly error?: string,
    private readonly _value?: T
  ) {}

  /**
   * Creates a successful result
   */
  static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, undefined, value)
  }

  /**
   * Creates a failed result with error message
   */
  static fail<U>(error: string): Result<U> {
    return new Result<U>(false, error)
  }

  /**
   * Gets the value if result is successful
   * @throws Error if result is failure
   */
  get value(): T {
    if (!this.isSuccess) {
      throw new Error(`Cannot get value of failed result: ${this.error}`)
    }
    return this._value!
  }

  /**
   * Checks if result is a failure
   */
  get isFailure(): boolean {
    return !this.isSuccess
  }

  /**
   * Combines multiple results into one
   * Returns first failure or success if all succeed
   */
  static combine(results: Result<any>[]): Result<void> {
    for (const result of results) {
      if (result.isFailure) {
        return Result.fail(result.error!)
      }
    }
    return Result.ok()
  }
}
