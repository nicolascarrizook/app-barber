import { ValueObject } from '../common/value-object'
import { Result } from '../common/result'

interface CurrencyProps {
  code: string
  symbol: string
  name: string
}

/**
 * Currency Value Object
 * Represents a monetary currency
 */
export class Currency extends ValueObject<CurrencyProps> {
  private constructor(props: CurrencyProps) {
    super(props)
  }

  static create(code: string, symbol: string, name: string): Result<Currency> {
    if (!code || code.length !== 3) {
      return Result.fail('Currency code must be 3 characters')
    }

    if (!symbol) {
      return Result.fail('Currency symbol is required')
    }

    if (!name) {
      return Result.fail('Currency name is required')
    }

    return Result.ok(
      new Currency({
        code: code.toUpperCase(),
        symbol,
        name
      })
    )
  }

  get code(): string {
    return this.props.code
  }

  get symbol(): string {
    return this.props.symbol
  }

  get name(): string {
    return this.props.name
  }

  // Common currencies
  static readonly ARS = new Currency({ code: 'ARS', symbol: '$', name: 'Argentine Peso' })
  static readonly USD = new Currency({ code: 'USD', symbol: '$', name: 'US Dollar' })
  static readonly EUR = new Currency({ code: 'EUR', symbol: '€', name: 'Euro' })
  static readonly BRL = new Currency({ code: 'BRL', symbol: 'R$', name: 'Brazilian Real' })
}
