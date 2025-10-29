import { ValueObject } from '../common/value-object'
import { Result } from '../common/result'
import { Money } from './money.vo'

/**
 * Payment method types
 */
export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  MERCADOPAGO = 'MERCADOPAGO'
}

/**
 * Payment status
 */
export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED'
}

interface PaymentInfoProps {
  amount: Money
  method: PaymentMethod
  status: PaymentStatus
  transactionId?: string
  paidAt?: Date
}

/**
 * Value Object representing payment information
 * Immutable record of payment details
 */
export class PaymentInfo extends ValueObject<PaymentInfoProps> {
  private constructor(props: PaymentInfoProps) {
    super(props)
  }

  /**
   * Creates payment info for a pending payment
   */
  static pending(amount: Money, method: PaymentMethod = PaymentMethod.CASH): PaymentInfo {
    return new PaymentInfo({
      amount,
      method,
      status: PaymentStatus.PENDING
    })
  }

  /**
   * Creates payment info for a completed payment
   */
  static paid(
    amount: Money,
    method: PaymentMethod,
    transactionId?: string
  ): Result<PaymentInfo> {
    if (method !== PaymentMethod.CASH && !transactionId) {
      return Result.fail('Transaction ID required for non-cash payments')
    }

    return Result.ok(
      new PaymentInfo({
        amount,
        method,
        status: PaymentStatus.PAID,
        transactionId,
        paidAt: new Date()
      })
    )
  }

  get amount(): Money {
    return this.props.amount
  }

  get method(): PaymentMethod {
    return this.props.method
  }

  get status(): PaymentStatus {
    return this.props.status
  }

  get transactionId(): string | undefined {
    return this.props.transactionId
  }

  get paidAt(): Date | undefined {
    return this.props.paidAt
  }

  /**
   * Marks payment as paid
   */
  markAsPaid(transactionId?: string): Result<PaymentInfo> {
    if (this.props.status === PaymentStatus.PAID) {
      return Result.fail('Payment already marked as paid')
    }

    if (this.props.method !== PaymentMethod.CASH && !transactionId) {
      return Result.fail('Transaction ID required for non-cash payments')
    }

    return Result.ok(
      new PaymentInfo({
        ...this.props,
        status: PaymentStatus.PAID,
        transactionId,
        paidAt: new Date()
      })
    )
  }

  /**
   * Marks payment as refunded
   */
  markAsRefunded(): Result<PaymentInfo> {
    if (this.props.status !== PaymentStatus.PAID) {
      return Result.fail('Can only refund paid payments')
    }

    return Result.ok(
      new PaymentInfo({
        ...this.props,
        status: PaymentStatus.REFUNDED
      })
    )
  }

  /**
   * Checks if payment is pending
   */
  isPending(): boolean {
    return this.props.status === PaymentStatus.PENDING
  }

  /**
   * Checks if payment is completed
   */
  isPaid(): boolean {
    return this.props.status === PaymentStatus.PAID
  }

  /**
   * Checks if payment was refunded
   */
  isRefunded(): boolean {
    return this.props.status === PaymentStatus.REFUNDED
  }
}
