/**
 * Email Template Types
 */
export enum EmailTemplate {
  APPOINTMENT_CONFIRMATION = 'APPOINTMENT_CONFIRMATION',
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  APPOINTMENT_CANCELLED = 'APPOINTMENT_CANCELLED',
  APPOINTMENT_RESCHEDULED = 'APPOINTMENT_RESCHEDULED',
  APPOINTMENT_COMPLETED = 'APPOINTMENT_COMPLETED',
  WELCOME_CLIENT = 'WELCOME_CLIENT',
  WELCOME_BARBER = 'WELCOME_BARBER',
  PASSWORD_RESET = 'PASSWORD_RESET',
  PAYMENT_CONFIRMATION = 'PAYMENT_CONFIRMATION',
  PAYMENT_REFUND = 'PAYMENT_REFUND',
  LOYALTY_POINTS_EARNED = 'LOYALTY_POINTS_EARNED',
  PROMOTION = 'PROMOTION'
}

/**
 * Email Request DTO
 */
export interface EmailRequest {
  /** Recipient email address */
  to: string

  /** Recipient name (optional) */
  toName?: string

  /** Email template to use */
  template: EmailTemplate

  /** Template data/variables */
  templateData: Record<string, any>

  /** CC recipients (optional) */
  cc?: string[]

  /** BCC recipients (optional) */
  bcc?: string[]

  /** Reply-to email (optional) */
  replyTo?: string
}

/**
 * Email Response DTO
 */
export interface EmailResponse {
  /** Message ID from email provider */
  messageId: string

  /** Indicates if email was sent successfully */
  success: boolean

  /** Error message if sending failed */
  errorMessage?: string

  /** Provider response */
  providerResponse?: any
}

/**
 * Bulk Email Request DTO
 */
export interface BulkEmailRequest {
  /** List of recipients */
  recipients: Array<{
    email: string
    name?: string
    templateData?: Record<string, any>
  }>

  /** Email template to use */
  template: EmailTemplate

  /** Common template data for all recipients */
  commonTemplateData?: Record<string, any>
}

/**
 * Email Service Interface
 *
 * Defines the contract for email sending operations.
 * Implementation will be in infrastructure layer using SendGrid or other email provider.
 *
 * Purpose: Send transactional emails, notifications, and promotional emails
 */
export interface IEmailService {
  /**
   * Send a single email
   *
   * @param request - Email request data
   * @returns Email response with message ID
   */
  sendEmail(request: EmailRequest): Promise<EmailResponse>

  /**
   * Send multiple emails (bulk send)
   * More efficient than sending individual emails
   *
   * @param request - Bulk email request data
   * @returns Array of email responses
   */
  sendBulkEmails(request: BulkEmailRequest): Promise<EmailResponse[]>

  /**
   * Send appointment confirmation email
   * Convenience method with pre-defined template
   *
   * @param to - Recipient email
   * @param data - Appointment data
   * @returns Email response
   */
  sendAppointmentConfirmation(to: string, data: AppointmentEmailData): Promise<EmailResponse>

  /**
   * Send appointment reminder email
   * Convenience method with pre-defined template
   *
   * @param to - Recipient email
   * @param data - Appointment data
   * @returns Email response
   */
  sendAppointmentReminder(to: string, data: AppointmentEmailData): Promise<EmailResponse>

  /**
   * Send appointment cancellation email
   * Convenience method with pre-defined template
   *
   * @param to - Recipient email
   * @param data - Appointment data
   * @returns Email response
   */
  sendAppointmentCancellation(to: string, data: AppointmentEmailData): Promise<EmailResponse>
}

/**
 * Appointment Email Data
 * Data needed for appointment-related emails
 */
export interface AppointmentEmailData {
  /** Client name */
  clientName: string

  /** Barber name */
  barberName: string

  /** Service name */
  serviceName: string

  /** Appointment date and time */
  appointmentDateTime: string

  /** Appointment duration */
  duration: string

  /** Total price */
  price: string

  /** Barbershop address */
  address?: string

  /** Cancellation reason (for cancellation emails) */
  cancellationReason?: string

  /** Additional notes */
  notes?: string
}
