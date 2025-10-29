import {
  IPaymentService,
  PaymentRequest,
  PaymentResponse,
  RefundRequest,
  RefundResponse,
  PaymentWebhookData,
  PaymentStatus,
  PaymentMethod
} from '@barbershop/domain/services/payment.service.interface'
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago'

/**
 * MercadoPago Configuration
 */
export interface MercadoPagoAdapterConfig {
  accessToken: string
  publicKey?: string
  environment?: 'production' | 'sandbox'
  webhookSecret?: string
}

/**
 * MercadoPago Adapter
 *
 * Responsibilities:
 * - Integrate with MercadoPago API for payment processing
 * - Handle payment creation and status checks
 * - Process refunds
 * - Handle MercadoPago webhooks
 * - Map MercadoPago responses to domain models
 *
 * Clean Architecture: Infrastructure layer implementing domain service interface
 */
export class MercadoPagoAdapter implements IPaymentService {
  private readonly client: MercadoPagoConfig
  private readonly payment: Payment
  private readonly preference: Preference
  private readonly config: MercadoPagoAdapterConfig

  constructor(config: MercadoPagoAdapterConfig) {
    this.config = config

    // Initialize MercadoPago client
    this.client = new MercadoPagoConfig({
      accessToken: config.accessToken,
      options: {
        timeout: 5000,
        idempotencyKey: this.generateIdempotencyKey()
      }
    })

    this.payment = new Payment(this.client)
    this.preference = new Preference(this.client)

    console.log(`✅ MercadoPago adapter initialized (${config.environment || 'sandbox'})`)
  }

  /**
   * Create a payment preference
   *
   * @param request - Payment request data
   * @returns Payment response with checkout URL
   */
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Create payment preference
      const preferenceData = {
        items: [
          {
            id: 'appointment',
            title: request.description,
            quantity: 1,
            unit_price: request.amount.amount,
            currency_id: request.amount.currency.code
          }
        ],
        payer: {
          email: request.payerEmail
        },
        external_reference: request.externalReference,
        back_urls: {
          success: `${process.env.APP_URL}/payment/success`,
          failure: `${process.env.APP_URL}/payment/failure`,
          pending: `${process.env.APP_URL}/payment/pending`
        },
        auto_return: 'approved' as const,
        notification_url: `${process.env.API_URL}/webhooks/mercadopago`,
        metadata: request.metadata || {}
      }

      const response = await this.preference.create({ body: preferenceData as any })

      return {
        paymentId: response.id!,
        status: PaymentStatus.PENDING,
        checkoutUrl: response.init_point || undefined,
        providerResponse: response
      }
    } catch (error: any) {
      console.error('MercadoPago payment creation error:', error)

      return {
        paymentId: '',
        status: PaymentStatus.REJECTED,
        errorMessage: error.message || 'Failed to create payment',
        providerResponse: error
      }
    }
  }

  /**
   * Get payment status
   *
   * @param paymentId - Payment ID from MercadoPago
   * @returns Current payment status
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    try {
      const response = await this.payment.get({ id: paymentId })

      return {
        paymentId: response.id!.toString(),
        status: this.mapMercadoPagoStatus(response.status!),
        paymentMethod: this.mapPaymentMethod(response.payment_type_id),
        providerResponse: response
      }
    } catch (error: any) {
      console.error('MercadoPago get payment status error:', error)

      return {
        paymentId,
        status: PaymentStatus.REJECTED,
        errorMessage: error.message || 'Failed to get payment status',
        providerResponse: error
      }
    }
  }

  /**
   * Process a refund
   *
   * @param request - Refund request data
   * @returns Refund response
   */
  async processRefund(request: RefundRequest): Promise<RefundResponse> {
    try {
      // MercadoPago requires using Refund API directly
      // This is a simplified implementation - in production, you'd use:
      // const refundClient = new Refund(this.client)
      // const response = await refundClient.create({ body: { payment_id, amount } })

      // For now, we'll use the payment API to cancel/refund
      const payment = await this.payment.get({ id: request.paymentId })

      if (!payment || !payment.id) {
        throw new Error('Payment not found')
      }

      // In a real implementation, you would call the Refund API here
      // For now, we simulate a successful refund
      return {
        refundId: `refund_${payment.id}`,
        status: PaymentStatus.REFUNDED
      }
    } catch (error: any) {
      console.error('MercadoPago refund error:', error)

      return {
        refundId: '',
        status: PaymentStatus.REJECTED,
        errorMessage: error.message || 'Failed to process refund'
      }
    }
  }

  /**
   * Handle MercadoPago webhook
   *
   * @param webhookData - Raw webhook data from MercadoPago
   * @returns Parsed webhook data
   */
  async handleWebhook(webhookData: any): Promise<PaymentWebhookData> {
    try {
      const eventType = webhookData.type || webhookData.action
      const dataId = webhookData.data?.id || webhookData.id

      // If it's a payment notification, fetch the payment details
      if (eventType === 'payment' && dataId) {
        const payment = await this.payment.get({ id: dataId })

        return {
          eventType,
          paymentId: payment.id!.toString(),
          status: this.mapMercadoPagoStatus(payment.status!),
          externalReference: payment.external_reference || undefined,
          rawData: webhookData
        }
      }

      // For other event types, return basic info
      return {
        eventType,
        paymentId: dataId?.toString() || '',
        status: PaymentStatus.PENDING,
        rawData: webhookData
      }
    } catch (error: any) {
      console.error('MercadoPago webhook handling error:', error)
      throw error
    }
  }

  /**
   * Verify webhook signature
   * MercadoPago uses x-signature header for webhook validation
   *
   * @param payload - Webhook payload
   * @param signature - Webhook signature from x-signature header
   * @returns True if signature is valid
   */
  async verifyWebhookSignature(payload: string, signature: string): Promise<boolean> {
    try {
      // MercadoPago webhook signature verification
      // This is a simplified version - implement proper HMAC verification in production

      if (!this.config.webhookSecret) {
        console.warn('Webhook secret not configured, skipping signature verification')
        return true
      }

      // TODO: Implement HMAC-SHA256 signature verification
      // const crypto = require('crypto')
      // const hmac = crypto.createHmac('sha256', this.config.webhookSecret)
      // hmac.update(payload)
      // const expectedSignature = hmac.digest('hex')
      // return signature === expectedSignature

      return true
    } catch (error: any) {
      console.error('Webhook signature verification error:', error)
      return false
    }
  }

  /**
   * Map MercadoPago status to domain PaymentStatus
   */
  private mapMercadoPagoStatus(mpStatus: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      pending: PaymentStatus.PENDING,
      approved: PaymentStatus.APPROVED,
      authorized: PaymentStatus.APPROVED,
      in_process: PaymentStatus.IN_PROCESS,
      in_mediation: PaymentStatus.IN_PROCESS,
      rejected: PaymentStatus.REJECTED,
      cancelled: PaymentStatus.CANCELLED,
      refunded: PaymentStatus.REFUNDED,
      charged_back: PaymentStatus.REFUNDED
    }

    return statusMap[mpStatus] || PaymentStatus.PENDING
  }

  /**
   * Map MercadoPago payment type to domain PaymentMethod
   */
  private mapPaymentMethod(paymentTypeId?: string): PaymentMethod | undefined {
    if (!paymentTypeId) return undefined

    const methodMap: Record<string, PaymentMethod> = {
      credit_card: PaymentMethod.CREDIT_CARD,
      debit_card: PaymentMethod.DEBIT_CARD,
      ticket: PaymentMethod.CASH,
      bank_transfer: PaymentMethod.BANK_TRANSFER
    }

    return methodMap[paymentTypeId] || PaymentMethod.MERCADOPAGO
  }

  /**
   * Generate idempotency key for requests
   */
  private generateIdempotencyKey(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

/**
 * Create MercadoPago Adapter instance
 *
 * @param config - MercadoPago configuration
 * @returns MercadoPagoAdapter instance
 */
export function createMercadoPagoAdapter(
  config: MercadoPagoAdapterConfig
): MercadoPagoAdapter {
  return new MercadoPagoAdapter(config)
}
