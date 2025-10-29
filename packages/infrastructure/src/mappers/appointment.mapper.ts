import { Appointment } from '@barbershop/domain/entities/appointment.entity'
import { AppointmentId } from '@barbershop/domain/entities/appointment-id.vo'
import { BarberId } from '@barbershop/domain/entities/barber-id.vo'
import { ClientId } from '@barbershop/domain/entities/client-id.vo'
import { ServiceId } from '@barbershop/domain/entities/service-id.vo'
import { AppointmentStatus } from '@barbershop/domain/entities/appointment-status.enum'
import { DateTime } from 'luxon'
import { TimeSlot } from '@barbershop/domain/value-objects/time-slot.vo'
import { PaymentInfo, PaymentStatus, PaymentMethod } from '@barbershop/domain/value-objects/payment-info.vo'
import { Money } from '@barbershop/domain/value-objects/money.vo'
import { Currency } from '@barbershop/domain/value-objects/currency.vo'
import { Result } from '@barbershop/domain/common/result'

/**
 * Prisma Appointment type (from generated client)
 */
export type PrismaAppointment = {
  id: string
  barberId: string
  clientId: string
  serviceId: string
  startTime: Date
  endTime: Date
  status: string
  paymentData: any | null
  notes: string | null
  cancellationReason: string | null
  cancelledAt: Date | null
  version: number
  createdAt: Date
  updatedAt: Date
}

/**
 * Mapper between Appointment domain entity and Prisma persistence model
 */
export class AppointmentMapper {
  /**
   * Maps a domain Appointment entity to Prisma persistence model
   */
  public static toPersistence(appointment: Appointment): Omit<PrismaAppointment, 'createdAt' | 'updatedAt'> {
    return {
      id: appointment.appointmentId.toString(),
      barberId: appointment.barber.toString(),
      clientId: appointment.client.toString(),
      serviceId: appointment.service.toString(),
      startTime: appointment.slot.startTime.toJSDate(),
      endTime: appointment.slot.endTime.toJSDate(),
      status: appointment.status,
      paymentData: appointment.payment ? {
        amount: appointment.payment.amount.amount,
        currency: appointment.payment.amount.currency,
        method: appointment.payment.method,
        status: appointment.payment.status,
        transactionId: appointment.payment.transactionId,
        paidAt: appointment.payment.paidAt
      } : null,
      notes: appointment.notes || null,
      cancellationReason: null, // This would come from domain events or additional entity properties
      cancelledAt: appointment.status === AppointmentStatus.CANCELLED ? new Date() : null,
      version: appointment.version
    }
  }

  /**
   * Maps a Prisma persistence model to domain Appointment entity
   */
  public static toDomain(raw: PrismaAppointment): Result<Appointment> {
    // Create IDs
    const appointmentId = AppointmentId.create(raw.id)
    const barberId = BarberId.create(raw.barberId)
    const clientId = ClientId.create(raw.clientId)
    const serviceId = ServiceId.create(raw.serviceId)

    // Create TimeSlot
    const startTime = DateTime.fromJSDate(raw.startTime)
    const endTime = DateTime.fromJSDate(raw.endTime)

    const timeSlotOrError = TimeSlot.create(startTime, endTime)
    if (timeSlotOrError.isFailure) {
      return Result.fail<Appointment>(`Invalid TimeSlot: ${timeSlotOrError.error}`)
    }

    // Create PaymentInfo if exists, otherwise create default pending payment
    let payment: PaymentInfo
    if (raw.paymentData) {
      const paymentData = raw.paymentData as any
      const moneyResult = Money.create(paymentData.amount, paymentData.currency as Currency)
      if (moneyResult.isFailure) {
        return Result.fail<Appointment>(`Invalid payment amount: ${moneyResult.error}`)
      }

      // Reconstruct payment based on status
      if (paymentData.status === PaymentStatus.PENDING) {
        payment = PaymentInfo.pending(moneyResult.value, paymentData.method as PaymentMethod)
      } else {
        const paidResult = PaymentInfo.paid(
          moneyResult.value,
          paymentData.method as PaymentMethod,
          paymentData.transactionId
        )
        if (paidResult.isFailure) {
          return Result.fail<Appointment>(`Invalid payment: ${paidResult.error}`)
        }
        payment = paidResult.value
      }
    } else {
      // Create default pending payment with zero amount
      payment = PaymentInfo.pending(Money.zero(Currency.ARS))
    }

    // Create Appointment (without ID - will be reconstructed differently)
    const appointmentOrError = Appointment.create({
      barber: barberId,
      client: clientId,
      service: serviceId,
      slot: timeSlotOrError.value,
      payment,
      notes: raw.notes || undefined
    })

    if (appointmentOrError.isFailure) {
      return Result.fail<Appointment>(`Failed to reconstruct appointment: ${appointmentOrError.error}`)
    }

    const appointment = appointmentOrError.value

    // Set the correct ID from database
    ;(appointment as any)._appointmentId = appointmentId

    // Restore status if different from PENDING
    if (raw.status !== AppointmentStatus.PENDING) {
      ;(appointment as any)._status = raw.status
    }

    // Restore timestamps
    ;(appointment as any)._createdAt = raw.createdAt
    ;(appointment as any)._updatedAt = raw.updatedAt

    return Result.ok<Appointment>(appointment)
  }
}
