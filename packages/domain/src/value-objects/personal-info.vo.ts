import { DateTime } from 'luxon'
import { ValueObject } from '../common/value-object'
import { Result } from '../common/result'

interface PersonalInfoProps {
  firstName: string
  lastName: string
  dateOfBirth?: DateTime
}

/**
 * PersonalInfo Value Object
 * Represents basic personal information
 */
export class PersonalInfo extends ValueObject<PersonalInfoProps> {
  private constructor(props: PersonalInfoProps) {
    super(props)
  }

  /**
   * Creates PersonalInfo with validation
   */
  static create(
    firstName: string,
    lastName: string,
    dateOfBirth?: DateTime
  ): Result<PersonalInfo> {
    if (!firstName || firstName.trim().length === 0) {
      return Result.fail('First name is required')
    }

    if (firstName.trim().length < 2) {
      return Result.fail('First name must be at least 2 characters')
    }

    if (firstName.trim().length > 50) {
      return Result.fail('First name is too long (max 50 characters)')
    }

    if (!lastName || lastName.trim().length === 0) {
      return Result.fail('Last name is required')
    }

    if (lastName.trim().length < 2) {
      return Result.fail('Last name must be at least 2 characters')
    }

    if (lastName.trim().length > 50) {
      return Result.fail('Last name is too long (max 50 characters)')
    }

    // Validate date of birth if provided
    if (dateOfBirth) {
      if (dateOfBirth > DateTime.now()) {
        return Result.fail('Date of birth cannot be in the future')
      }

      const age = DateTime.now().diff(dateOfBirth, 'years').years
      if (age > 150) {
        return Result.fail('Invalid date of birth (age > 150 years)')
      }
    }

    return Result.ok(
      new PersonalInfo({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth
      })
    )
  }

  get firstName(): string {
    return this.props.firstName
  }

  get lastName(): string {
    return this.props.lastName
  }

  get dateOfBirth(): DateTime | undefined {
    return this.props.dateOfBirth
  }

  /**
   * Gets the full name
   */
  get fullName(): string {
    return `${this.props.firstName} ${this.props.lastName}`
  }

  /**
   * Gets initials
   */
  get initials(): string {
    return `${this.props.firstName.charAt(0)}${this.props.lastName.charAt(0)}`.toUpperCase()
  }

  /**
   * Calculates age in years
   */
  get age(): number | undefined {
    if (!this.props.dateOfBirth) {
      return undefined
    }

    return Math.floor(
      DateTime.now().diff(this.props.dateOfBirth, 'years').years
    )
  }

  /**
   * Checks if person is adult (18+)
   */
  isAdult(): boolean {
    const age = this.age
    return age !== undefined && age >= 18
  }
}
