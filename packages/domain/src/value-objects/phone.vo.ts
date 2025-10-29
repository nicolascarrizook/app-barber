import { ValueObject } from '../common/value-object'
import { Result } from '../common/result'

interface PhoneProps {
  value: string
  countryCode: string
}

/**
 * Phone Value Object
 * Represents a validated phone number with country code
 */
export class Phone extends ValueObject<PhoneProps> {
  private static readonly PHONE_REGEX = /^[0-9]{6,15}$/

  private constructor(props: PhoneProps) {
    super(props)
  }

  /**
   * Creates a Phone with validation
   * @param value - Phone number without country code
   * @param countryCode - Country code (e.g., '+54' for Argentina)
   */
  static create(value: string, countryCode: string = '+54'): Result<Phone> {
    if (!value) {
      return Result.fail('Phone number is required')
    }

    if (!countryCode) {
      return Result.fail('Country code is required')
    }

    // Remove spaces, dashes, and parentheses
    const cleaned = value.replace(/[\s\-()]/g, '')

    // Validate format
    if (!this.PHONE_REGEX.test(cleaned)) {
      return Result.fail(
        'Invalid phone format (must be 6-15 digits)'
      )
    }

    // Validate country code format
    if (!countryCode.startsWith('+') || countryCode.length < 2) {
      return Result.fail('Invalid country code format')
    }

    return Result.ok(
      new Phone({
        value: cleaned,
        countryCode
      })
    )
  }

  get value(): string {
    return this.props.value
  }

  get countryCode(): string {
    return this.props.countryCode
  }

  /**
   * Gets the full international format
   */
  get fullNumber(): string {
    return `${this.props.countryCode}${this.props.value}`
  }

  /**
   * Formats phone for display (e.g., "+54 11 1234-5678")
   */
  format(): string {
    const { countryCode, value } = this.props

    // For Argentine numbers (11 digits after country code)
    if (countryCode === '+54' && value.length === 10) {
      return `${countryCode} ${value.substring(0, 2)} ${value.substring(2, 6)}-${value.substring(6)}`
    }

    // Default format
    return `${countryCode} ${value}`
  }

  /**
   * Checks if phone is from Argentina
   */
  isArgentine(): boolean {
    return this.props.countryCode === '+54'
  }
}
