import { ValueObject } from '../common/value-object'
import { Result } from '../common/result'
import { Currency } from './currency.vo'

interface MoneyProps {
  amount: number
  currency: Currency
}

/**
 * Money Value Object
 * Represents a monetary amount with currency
 * Immutable and provides arithmetic operations
 */
export class Money extends ValueObject<MoneyProps> {
  private constructor(props: MoneyProps) {
    super(props)
  }

  /**
   * Creates a Money instance with validation
   */
  static create(amount: number, currency: Currency): Result<Money> {
    if (amount < 0) {
      return Result.fail('Amount cannot be negative')
    }

    if (!Number.isFinite(amount)) {
      return Result.fail('Amount must be a finite number')
    }

    // Round to 2 decimal places
    const roundedAmount = Math.round(amount * 100) / 100

    return Result.ok(new Money({ amount: roundedAmount, currency }))
  }

  /**
   * Creates zero money in given currency
   */
  static zero(currency: Currency): Money {
    return new Money({ amount: 0, currency })
  }

  get amount(): number {
    return this.props.amount
  }

  get currency(): Currency {
    return this.props.currency
  }

  /**
   * Adds another Money instance
   */
  add(other: Money): Result<Money> {
    if (!this.props.currency.equals(other.props.currency)) {
      return Result.fail('Cannot add money with different currencies')
    }

    return Money.create(
      this.props.amount + other.props.amount,
      this.props.currency
    )
  }

  /**
   * Subtracts another Money instance
   */
  subtract(other: Money): Result<Money> {
    if (!this.props.currency.equals(other.props.currency)) {
      return Result.fail('Cannot subtract money with different currencies')
    }

    const newAmount = this.props.amount - other.props.amount
    if (newAmount < 0) {
      return Result.fail('Result cannot be negative')
    }

    return Money.create(newAmount, this.props.currency)
  }

  /**
   * Multiplies by a factor
   */
  multiply(factor: number): Result<Money> {
    if (!Number.isFinite(factor)) {
      return Result.fail('Factor must be a finite number')
    }

    return Money.create(this.props.amount * factor, this.props.currency)
  }

  /**
   * Divides by a divisor
   */
  divide(divisor: number): Result<Money> {
    if (divisor === 0) {
      return Result.fail('Cannot divide by zero')
    }

    if (!Number.isFinite(divisor)) {
      return Result.fail('Divisor must be a finite number')
    }

    return Money.create(this.props.amount / divisor, this.props.currency)
  }

  /**
   * Calculates percentage of this amount
   */
  percentage(percent: number): Result<Money> {
    if (percent < 0 || percent > 100) {
      return Result.fail('Percentage must be between 0 and 100')
    }

    return Money.create(
      (this.props.amount * percent) / 100,
      this.props.currency
    )
  }

  /**
   * Checks if amount is zero
   */
  isZero(): boolean {
    return this.props.amount === 0
  }

  /**
   * Checks if this money is greater than another
   */
  isGreaterThan(other: Money): boolean {
    if (!this.props.currency.equals(other.props.currency)) {
      throw new Error('Cannot compare money with different currencies')
    }
    return this.props.amount > other.props.amount
  }

  /**
   * Checks if this money is less than another
   */
  isLessThan(other: Money): boolean {
    if (!this.props.currency.equals(other.props.currency)) {
      throw new Error('Cannot compare money with different currencies')
    }
    return this.props.amount < other.props.amount
  }

  /**
   * Formats money as string
   */
  format(): string {
    return `${this.props.currency.symbol}${this.props.amount.toFixed(2)}`
  }
}
