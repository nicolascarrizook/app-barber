import { ValueObject } from '../common/value-object'
import { Result } from '../common/result'

interface EmailProps {
  value: string
}

/**
 * Email Value Object
 * Represents a validated email address
 */
export class Email extends ValueObject<EmailProps> {
  private static readonly EMAIL_REGEX =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

  private constructor(props: EmailProps) {
    super(props)
  }

  /**
   * Creates an Email with validation
   */
  static create(email: string): Result<Email> {
    if (!email) {
      return Result.fail('Email is required')
    }

    const trimmed = email.trim().toLowerCase()

    if (!this.EMAIL_REGEX.test(trimmed)) {
      return Result.fail('Invalid email format')
    }

    if (trimmed.length > 254) {
      return Result.fail('Email is too long (max 254 characters)')
    }

    return Result.ok(new Email({ value: trimmed }))
  }

  get value(): string {
    return this.props.value
  }

  /**
   * Gets the domain part of the email
   */
  get domain(): string {
    return this.props.value.split('@')[1]
  }

  /**
   * Gets the local part (before @) of the email
   */
  get localPart(): string {
    return this.props.value.split('@')[0]
  }

  /**
   * Checks if email is from a specific domain
   */
  isFromDomain(domain: string): boolean {
    return this.domain === domain.toLowerCase()
  }
}
