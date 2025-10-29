import {
  IEmailService,
  EmailRequest,
  EmailResponse,
  BulkEmailRequest,
  EmailTemplate,
  AppointmentEmailData
} from '@barbershop/domain/services/email.service.interface'
import * as sgMail from '@sendgrid/mail'

/**
 * SendGrid Configuration
 */
export interface SendGridAdapterConfig {
  apiKey: string
  fromEmail: string
  fromName?: string
  replyToEmail?: string
  sandboxMode?: boolean
}

/**
 * Email Template Configuration
 * Maps EmailTemplate enum to SendGrid template IDs
 */
interface TemplateConfig {
  templateId: string
  subject: string
}

/**
 * SendGrid Adapter
 *
 * Responsibilities:
 * - Integrate with SendGrid API for email delivery
 * - Handle single and bulk email sending
 * - Map domain templates to SendGrid templates
 * - Provide convenience methods for common email types
 * - Support sandbox mode for testing
 *
 * Clean Architecture: Infrastructure layer implementing domain service interface
 */
export class SendGridAdapter implements IEmailService {
  private readonly config: SendGridAdapterConfig
  private readonly templateMap: Map<EmailTemplate, TemplateConfig>

  constructor(config: SendGridAdapterConfig) {
    this.config = config

    // Initialize SendGrid
    sgMail.setApiKey(config.apiKey)

    // Initialize template mapping
    // In production, these would be actual SendGrid template IDs
    this.templateMap = new Map([
      [
        EmailTemplate.APPOINTMENT_CONFIRMATION,
        {
          templateId: process.env.SENDGRID_TEMPLATE_APPOINTMENT_CONFIRMATION || 'd-appointment-confirmation',
          subject: 'Confirmación de turno - Barbería'
        }
      ],
      [
        EmailTemplate.APPOINTMENT_REMINDER,
        {
          templateId: process.env.SENDGRID_TEMPLATE_APPOINTMENT_REMINDER || 'd-appointment-reminder',
          subject: 'Recordatorio de turno - Barbería'
        }
      ],
      [
        EmailTemplate.APPOINTMENT_CANCELLED,
        {
          templateId: process.env.SENDGRID_TEMPLATE_APPOINTMENT_CANCELLED || 'd-appointment-cancelled',
          subject: 'Turno cancelado - Barbería'
        }
      ],
      [
        EmailTemplate.APPOINTMENT_RESCHEDULED,
        {
          templateId: process.env.SENDGRID_TEMPLATE_APPOINTMENT_RESCHEDULED || 'd-appointment-rescheduled',
          subject: 'Turno reprogramado - Barbería'
        }
      ],
      [
        EmailTemplate.APPOINTMENT_COMPLETED,
        {
          templateId: process.env.SENDGRID_TEMPLATE_APPOINTMENT_COMPLETED || 'd-appointment-completed',
          subject: 'Gracias por tu visita - Barbería'
        }
      ],
      [
        EmailTemplate.WELCOME_CLIENT,
        {
          templateId: process.env.SENDGRID_TEMPLATE_WELCOME_CLIENT || 'd-welcome-client',
          subject: 'Bienvenido a nuestra barbería'
        }
      ],
      [
        EmailTemplate.WELCOME_BARBER,
        {
          templateId: process.env.SENDGRID_TEMPLATE_WELCOME_BARBER || 'd-welcome-barber',
          subject: 'Bienvenido al equipo - Barbería'
        }
      ],
      [
        EmailTemplate.PASSWORD_RESET,
        {
          templateId: process.env.SENDGRID_TEMPLATE_PASSWORD_RESET || 'd-password-reset',
          subject: 'Restablecer contraseña - Barbería'
        }
      ],
      [
        EmailTemplate.PAYMENT_CONFIRMATION,
        {
          templateId: process.env.SENDGRID_TEMPLATE_PAYMENT_CONFIRMATION || 'd-payment-confirmation',
          subject: 'Confirmación de pago - Barbería'
        }
      ],
      [
        EmailTemplate.PAYMENT_REFUND,
        {
          templateId: process.env.SENDGRID_TEMPLATE_PAYMENT_REFUND || 'd-payment-refund',
          subject: 'Reembolso procesado - Barbería'
        }
      ],
      [
        EmailTemplate.LOYALTY_POINTS_EARNED,
        {
          templateId: process.env.SENDGRID_TEMPLATE_LOYALTY_POINTS || 'd-loyalty-points',
          subject: '¡Has ganado puntos de lealtad!'
        }
      ],
      [
        EmailTemplate.PROMOTION,
        {
          templateId: process.env.SENDGRID_TEMPLATE_PROMOTION || 'd-promotion',
          subject: 'Promoción especial - Barbería'
        }
      ]
    ])

    console.log(
      `✅ SendGrid adapter initialized (${config.sandboxMode ? 'sandbox' : 'production'} mode)`
    )
  }

  /**
   * Send a single email
   *
   * @param request - Email request data
   * @returns Email response with message ID
   */
  async sendEmail(request: EmailRequest): Promise<EmailResponse> {
    try {
      const templateConfig = this.templateMap.get(request.template)

      if (!templateConfig) {
        return {
          messageId: '',
          success: false,
          errorMessage: `Template ${request.template} not configured`
        }
      }

      const message: sgMail.MailDataRequired = {
        to: {
          email: request.to,
          name: request.toName
        },
        from: {
          email: this.config.fromEmail,
          name: this.config.fromName || 'Barbería'
        },
        replyTo: request.replyTo || this.config.replyToEmail,
        templateId: templateConfig.templateId,
        dynamicTemplateData: request.templateData,
        mailSettings: {
          sandboxMode: {
            enable: this.config.sandboxMode || false
          }
        }
      }

      // Add CC if provided
      if (request.cc && request.cc.length > 0) {
        message.cc = request.cc
      }

      // Add BCC if provided
      if (request.bcc && request.bcc.length > 0) {
        message.bcc = request.bcc
      }

      const response = await sgMail.send(message)

      return {
        messageId: response[0].headers['x-message-id'] || '',
        success: true,
        providerResponse: response[0]
      }
    } catch (error: any) {
      console.error('SendGrid email sending error:', error)

      return {
        messageId: '',
        success: false,
        errorMessage: error.message || 'Failed to send email',
        providerResponse: error.response?.body || error
      }
    }
  }

  /**
   * Send multiple emails (bulk send)
   * More efficient than sending individual emails
   *
   * @param request - Bulk email request data
   * @returns Array of email responses
   */
  async sendBulkEmails(request: BulkEmailRequest): Promise<EmailResponse[]> {
    try {
      const templateConfig = this.templateMap.get(request.template)

      if (!templateConfig) {
        return request.recipients.map(() => ({
          messageId: '',
          success: false,
          errorMessage: `Template ${request.template} not configured`
        }))
      }

      // Build personalized messages for each recipient
      const messages: sgMail.MailDataRequired[] = request.recipients.map((recipient: {
        email: string
        name?: string
        templateData?: Record<string, any>
      }) => ({
        to: {
          email: recipient.email,
          name: recipient.name
        },
        from: {
          email: this.config.fromEmail,
          name: this.config.fromName || 'Barbería'
        },
        replyTo: this.config.replyToEmail,
        templateId: templateConfig.templateId,
        dynamicTemplateData: {
          ...request.commonTemplateData,
          ...recipient.templateData
        },
        mailSettings: {
          sandboxMode: {
            enable: this.config.sandboxMode || false
          }
        }
      }))

      // Send all emails
      const responses = await sgMail.send(messages)

      return responses.map((response: any) => ({
        messageId: response?.headers?.['x-message-id'] || '',
        success: true,
        providerResponse: response
      }))
    } catch (error: any) {
      console.error('SendGrid bulk email sending error:', error)

      // Return error response for all recipients
      return request.recipients.map(() => ({
        messageId: '',
        success: false,
        errorMessage: error.message || 'Failed to send bulk emails',
        providerResponse: error.response?.body || error
      }))
    }
  }

  /**
   * Send appointment confirmation email
   * Convenience method with pre-defined template
   *
   * @param to - Recipient email
   * @param data - Appointment data
   * @returns Email response
   */
  async sendAppointmentConfirmation(
    to: string,
    data: AppointmentEmailData
  ): Promise<EmailResponse> {
    return this.sendEmail({
      to,
      toName: data.clientName,
      template: EmailTemplate.APPOINTMENT_CONFIRMATION,
      templateData: {
        clientName: data.clientName,
        barberName: data.barberName,
        serviceName: data.serviceName,
        appointmentDateTime: data.appointmentDateTime,
        duration: data.duration,
        price: data.price,
        address: data.address,
        notes: data.notes
      }
    })
  }

  /**
   * Send appointment reminder email
   * Convenience method with pre-defined template
   *
   * @param to - Recipient email
   * @param data - Appointment data
   * @returns Email response
   */
  async sendAppointmentReminder(
    to: string,
    data: AppointmentEmailData
  ): Promise<EmailResponse> {
    return this.sendEmail({
      to,
      toName: data.clientName,
      template: EmailTemplate.APPOINTMENT_REMINDER,
      templateData: {
        clientName: data.clientName,
        barberName: data.barberName,
        serviceName: data.serviceName,
        appointmentDateTime: data.appointmentDateTime,
        duration: data.duration,
        price: data.price,
        address: data.address,
        notes: data.notes
      }
    })
  }

  /**
   * Send appointment cancellation email
   * Convenience method with pre-defined template
   *
   * @param to - Recipient email
   * @param data - Appointment data
   * @returns Email response
   */
  async sendAppointmentCancellation(
    to: string,
    data: AppointmentEmailData
  ): Promise<EmailResponse> {
    return this.sendEmail({
      to,
      toName: data.clientName,
      template: EmailTemplate.APPOINTMENT_CANCELLED,
      templateData: {
        clientName: data.clientName,
        barberName: data.barberName,
        serviceName: data.serviceName,
        appointmentDateTime: data.appointmentDateTime,
        duration: data.duration,
        price: data.price,
        cancellationReason: data.cancellationReason,
        notes: data.notes
      }
    })
  }
}

/**
 * Create SendGrid Adapter instance
 *
 * @param config - SendGrid configuration
 * @returns SendGridAdapter instance
 */
export function createSendGridAdapter(config: SendGridAdapterConfig): SendGridAdapter {
  return new SendGridAdapter(config)
}
