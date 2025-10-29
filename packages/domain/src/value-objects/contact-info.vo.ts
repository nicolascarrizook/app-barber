import { ValueObject } from '../common/value-object'
import { Result } from '../common/result'
import { Email } from './email.vo'
import { Phone } from './phone.vo'

interface ContactInfoProps {
  email: Email
  phone: Phone
  address?: string
}

/**
 * ContactInfo Value Object
 * Represents complete contact information
 */
export class ContactInfo extends ValueObject<ContactInfoProps> {
  private constructor(props: ContactInfoProps) {
    super(props)
  }

  /**
   * Creates ContactInfo with validation
   */
  static create(
    email: Email,
    phone: Phone,
    address?: string
  ): Result<ContactInfo> {
    if (!email) {
      return Result.fail('Email is required')
    }

    if (!phone) {
      return Result.fail('Phone is required')
    }

    // Validate address if provided
    if (address) {
      const trimmed = address.trim()
      if (trimmed.length < 5) {
        return Result.fail('Address is too short (min 5 characters)')
      }
      if (trimmed.length > 200) {
        return Result.fail('Address is too long (max 200 characters)')
      }
    }

    return Result.ok(
      new ContactInfo({
        email,
        phone,
        address: address?.trim()
      })
    )
  }

  get email(): Email {
    return this.props.email
  }

  get phone(): Phone {
    return this.props.phone
  }

  get address(): string | undefined {
    return this.props.address
  }

  /**
   * Checks if address is provided
   */
  hasAddress(): boolean {
    return this.props.address !== undefined && this.props.address.length > 0
  }

  /**
   * Creates a new ContactInfo with updated email
   */
  updateEmail(newEmail: Email): ContactInfo {
    return new ContactInfo({
      ...this.props,
      email: newEmail
    })
  }

  /**
   * Creates a new ContactInfo with updated phone
   */
  updatePhone(newPhone: Phone): ContactInfo {
    return new ContactInfo({
      ...this.props,
      phone: newPhone
    })
  }

  /**
   * Creates a new ContactInfo with updated address
   */
  updateAddress(newAddress: string): Result<ContactInfo> {
    return ContactInfo.create(this.props.email, this.props.phone, newAddress)
  }
}
