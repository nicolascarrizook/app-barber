import { ValueObject } from '../common/value-object'
import { Result } from '../common/result'

interface BarberNameProps {
  firstName: string
  lastName: string
}

export class BarberName extends ValueObject<BarberNameProps> {
  private constructor(props: BarberNameProps) {
    super(props)
  }

  public static create(firstName: string, lastName: string): Result<BarberName> {
    // Validate firstName
    if (!firstName || firstName.trim().length === 0) {
      return Result.fail<BarberName>('First name is required')
    }

    if (firstName.trim().length < 2) {
      return Result.fail<BarberName>('First name must be at least 2 characters')
    }

    if (firstName.trim().length > 50) {
      return Result.fail<BarberName>('First name must not exceed 50 characters')
    }

    if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(firstName.trim())) {
      return Result.fail<BarberName>('First name contains invalid characters')
    }

    // Validate lastName
    if (!lastName || lastName.trim().length === 0) {
      return Result.fail<BarberName>('Last name is required')
    }

    if (lastName.trim().length < 2) {
      return Result.fail<BarberName>('Last name must be at least 2 characters')
    }

    if (lastName.trim().length > 50) {
      return Result.fail<BarberName>('Last name must not exceed 50 characters')
    }

    if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(lastName.trim())) {
      return Result.fail<BarberName>('Last name contains invalid characters')
    }

    return Result.ok<BarberName>(
      new BarberName({
        firstName: firstName.trim(),
        lastName: lastName.trim()
      })
    )
  }

  get firstName(): string {
    return this.props.firstName
  }

  get lastName(): string {
    return this.props.lastName
  }

  get fullName(): string {
    return `${this.props.firstName} ${this.props.lastName}`
  }

  get initials(): string {
    return `${this.props.firstName.charAt(0)}${this.props.lastName.charAt(0)}`.toUpperCase()
  }
}
