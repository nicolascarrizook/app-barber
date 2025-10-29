/**
 * External Services Integration Layer
 *
 * Adapters for third-party services:
 * - MercadoPago: Payment processing
 * - SendGrid: Email delivery
 *
 * Each adapter implements domain service interfaces
 * defined in @barbershop/domain/services
 */

export * from './mercadopago.adapter'
export * from './sendgrid.adapter'
