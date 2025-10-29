import { Money } from '../value-objects/money.vo'

/**
 * Payment Status
 */
export enum PaymentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  IN_PROCESS = 'IN_PROCESS'
}

/**
 * Payment Method
 */
export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  MERCADOPAGO = 'MERCADOPAGO'
}

/**
 * Payment Request DTO
 */
export interface PaymentRequest {
  /** Amount to charge */
  amount: Money

  /** Payment description */
  description: string

  /** Payer email */
  payerEmail: string

  /** External reference (appointment ID, order ID, etc.) */
  externalReference: string

  /** Payment metadata */
  metadata?: Record<string, any>
}

/**
 * Payment Response DTO
 */
export interface PaymentResponse {
  /** Payment ID from payment provider */
  paymentId: string

  /** Payment status */
  status: PaymentStatus

  /** Checkout URL for user to complete payment (if applicable) */
  checkoutUrl?: string

  /** QR code for payment (if applicable) */
  qrCode?: string

  /** Payment method used */
  paymentMethod?: PaymentMethod

  /** Error message if payment failed */
  errorMessage?: string

  /** Payment provider response */
  providerResponse?: any
}

/**
 * Refund Request DTO
 */
export interface RefundRequest {
  /** Original payment ID */
  paymentId: string

  /** Refund amount (can be partial) */
  amount: Money

  /** Refund reason */
  reason: string
}

/**
 * Refund Response DTO
 */
export interface RefundResponse {
  /** Refund ID */
  refundId: string

  /** Refund status */
  status: PaymentStatus

  /** Error message if refund failed */
  errorMessage?: string
}

/**
 * Payment Webhook Data
 */
export interface PaymentWebhookData {
  /** Webhook event type */
  eventType: string

  /** Payment ID */
  paymentId: string

  /** Payment status */
  status: PaymentStatus

  /** External reference */
  externalReference?: string

  /** Raw webhook data */
  rawData: any
}

/**
 * Payment Service Interface
 *
 * Defines the contract for payment processing operations.
 * Implementation will be in infrastructure layer using MercadoPago or other payment provider.
 *
 * Purpose: Process payments, refunds, and handle payment webhooks
 */
export interface IPaymentService {
  /**
   * Create a payment
   *
   * @param request - Payment request data
   * @returns Payment response with checkout URL or payment status
   */
  createPayment(request: PaymentRequest): Promise<PaymentResponse>

  /**
   * Get payment status
   *
   * @param paymentId - Payment identifier from provider
   * @returns Current payment status and details
   */
  getPaymentStatus(paymentId: string): Promise<PaymentResponse>

  /**
   * Process a refund
   *
   * @param request - Refund request data
   * @returns Refund response with status
   */
  processRefund(request: RefundRequest): Promise<RefundResponse>

  /**
   * Handle payment webhook
   * Called when payment provider sends notification about payment status change
   *
   * @param webhookData - Webhook data from payment provider
   * @returns Parsed webhook data
   */
  handleWebhook(webhookData: any): Promise<PaymentWebhookData>

  /**
   * Verify webhook signature
   * Ensures the webhook is authentic and comes from the payment provider
   *
   * @param payload - Webhook payload
   * @param signature - Webhook signature
   * @returns True if signature is valid, false otherwise
   */
  verifyWebhookSignature(payload: string, signature: string): Promise<boolean>
}
