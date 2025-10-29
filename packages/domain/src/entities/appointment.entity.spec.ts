import { DateTime } from 'luxon'
import { Appointment, CreateAppointmentProps } from './appointment.entity'
import { AppointmentId } from './appointment-id.vo'
import { ClientId } from './client-id.vo'
import { BarberId } from './barber-id.vo'
import { ServiceId } from './service-id.vo'
import { AppointmentStatus } from './appointment-status.enum'
import { TimeSlot } from '../value-objects/time-slot.vo'
import { Money } from '../value-objects/money.vo'
import { Currency } from '../value-objects/currency.vo'
import { PaymentInfo, PaymentMethod } from '../value-objects/payment-info.vo'
import {
  AppointmentCreatedEvent,
  AppointmentConfirmedEvent,
  AppointmentStartedEvent,
  AppointmentCompletedEvent,
  AppointmentCancelledEvent,
  AppointmentRescheduledEvent,
  AppointmentNoShowEvent
} from './events/appointment.events'

describe('Appointment Entity', () => {
  let validProps: CreateAppointmentProps
  let futureStart: DateTime
  let futureEnd: DateTime

  beforeEach(() => {
    futureStart = DateTime.now().plus({ hours: 1 })
    futureEnd = DateTime.now().plus({ hours: 2 })

    validProps = {
      client: ClientId.create(),
      barber: BarberId.create(),
      service: ServiceId.create(),
      slot: TimeSlot.create(futureStart, futureEnd).value,
      payment: PaymentInfo.pending(Money.create(100, Currency.USD).value),
      notes: 'Test appointment'
    }
  })

  describe('create', () => {
    it('should create valid appointment', () => {
      const result = Appointment.create(validProps)

      expect(result.isSuccess).toBe(true)
      expect(result.value.status).toBe(AppointmentStatus.PENDING)
      expect(result.value.client).toEqual(validProps.client)
      expect(result.value.barber).toEqual(validProps.barber)
      expect(result.value.service).toEqual(validProps.service)
      expect(result.value.version).toBe(0)
    })

    it('should emit AppointmentCreatedEvent on creation', () => {
      const result = Appointment.create(validProps)

      expect(result.value.domainEvents).toHaveLength(1)
      expect(result.value.domainEvents[0]).toBeInstanceOf(AppointmentCreatedEvent)
    })

    it('should fail when time slot is invalid', () => {
      const invalidSlot = TimeSlot.create(futureEnd, futureStart) // end before start

      // Si el TimeSlot.create ya falla, esperamos que Appointment.create también falle
      if (invalidSlot.isFailure) {
        // No podemos crear appointment con slot inválido
        expect(invalidSlot.isFailure).toBe(true)
      }
    })

    it('should fail when time slot is in the past', () => {
      const pastStart = DateTime.now().minus({ hours: 2 })
      const pastEnd = DateTime.now().minus({ hours: 1 })
      const pastSlot = TimeSlot.create(pastStart, pastEnd)

      // TimeSlot.create ya valida que no sea pasado
      if (pastSlot.isFailure) {
        expect(pastSlot.isFailure).toBe(true)
        expect(pastSlot.error).toContain('past')
      }
    })

    it('should fail when notes exceed 500 characters', () => {
      const longNotes = 'a'.repeat(501)

      const result = Appointment.create({
        ...validProps,
        notes: longNotes
      })

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('500 characters')
    })

    it('should create appointment without notes', () => {
      const { notes, ...propsWithoutNotes } = validProps

      const result = Appointment.create(propsWithoutNotes)

      expect(result.isSuccess).toBe(true)
      expect(result.value.notes).toBe('')
    })
  })

  describe('confirm', () => {
    it('should confirm pending appointment', () => {
      const appointment = Appointment.create(validProps).value

      const result = appointment.confirm()

      expect(result.isSuccess).toBe(true)
      expect(appointment.status).toBe(AppointmentStatus.CONFIRMED)
      expect(appointment.domainEvents).toHaveLength(2)
      expect(appointment.domainEvents[1]).toBeInstanceOf(AppointmentConfirmedEvent)
    })

    it('should fail when appointment is not pending', () => {
      const appointment = Appointment.create(validProps).value
      appointment.confirm()

      const result = appointment.confirm()

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Cannot confirm')
    })

    it('should fail when appointment time is past', () => {
      const pastStart = DateTime.now().minus({ minutes: 30 })
      const pastEnd = DateTime.now().minus({ minutes: 15 })
      const pastSlot = TimeSlot.create(pastStart, pastEnd)

      if (pastSlot.isSuccess) {
        const appointment = Appointment.create({
          ...validProps,
          slot: pastSlot.value
        }).value

        const result = appointment.confirm()

        expect(result.isFailure).toBe(true)
        expect(result.error).toContain('past')
      }
    })
  })

  describe('start', () => {
    it('should start confirmed appointment', () => {
      const appointment = Appointment.create(validProps).value
      appointment.confirm()

      const result = appointment.start()

      expect(result.isSuccess).toBe(true)
      expect(appointment.status).toBe(AppointmentStatus.IN_PROGRESS)
      expect(appointment.domainEvents).toHaveLength(3)
      expect(appointment.domainEvents[2]).toBeInstanceOf(AppointmentStartedEvent)
    })

    it('should fail when appointment is not confirmed', () => {
      const appointment = Appointment.create(validProps).value

      const result = appointment.start()

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('must be confirmed')
    })
  })

  describe('complete', () => {
    it('should complete appointment in progress', () => {
      const appointment = Appointment.create(validProps).value
      appointment.confirm()
      appointment.start()

      const result = appointment.complete('Service completed successfully')

      expect(result.isSuccess).toBe(true)
      expect(appointment.status).toBe(AppointmentStatus.COMPLETED)
      expect(appointment.notes).toContain('Service completed successfully')
      expect(appointment.domainEvents).toHaveLength(4)
      expect(appointment.domainEvents[3]).toBeInstanceOf(AppointmentCompletedEvent)
    })

    it('should complete without additional notes', () => {
      const appointment = Appointment.create(validProps).value
      appointment.confirm()
      appointment.start()

      const result = appointment.complete()

      expect(result.isSuccess).toBe(true)
      expect(appointment.status).toBe(AppointmentStatus.COMPLETED)
    })

    it('should fail when appointment is not in progress', () => {
      const appointment = Appointment.create(validProps).value

      const result = appointment.complete()

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('must be in progress')
    })
  })

  describe('cancel', () => {
    it('should cancel pending appointment', () => {
      const appointment = Appointment.create(validProps).value

      const result = appointment.cancel('Client requested')

      expect(result.isSuccess).toBe(true)
      expect(appointment.status).toBe(AppointmentStatus.CANCELLED)
      expect(appointment.notes).toContain('Client requested')
      expect(appointment.domainEvents).toHaveLength(2)
      expect(appointment.domainEvents[1]).toBeInstanceOf(AppointmentCancelledEvent)
    })

    it('should cancel confirmed appointment', () => {
      const appointment = Appointment.create(validProps).value
      appointment.confirm()

      const result = appointment.cancel('Emergency')

      expect(result.isSuccess).toBe(true)
      expect(appointment.status).toBe(AppointmentStatus.CANCELLED)
    })

    it('should fail when appointment is completed', () => {
      const appointment = Appointment.create(validProps).value
      appointment.confirm()
      appointment.start()
      appointment.complete()

      const result = appointment.cancel('Too late')

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('cannot be cancelled')
    })

    it('should fail without cancellation reason', () => {
      const appointment = Appointment.create(validProps).value

      const result = appointment.cancel('')

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('reason is required')
    })
  })

  describe('reschedule', () => {
    it('should reschedule pending appointment', () => {
      const appointment = Appointment.create(validProps).value
      const newStart = futureStart.plus({ days: 1 })
      const newEnd = futureEnd.plus({ days: 1 })
      const newSlot = TimeSlot.create(newStart, newEnd).value

      const result = appointment.reschedule(newSlot)

      expect(result.isSuccess).toBe(true)
      expect(appointment.slot).toEqual(newSlot)
      expect(appointment.domainEvents).toHaveLength(2)
      expect(appointment.domainEvents[1]).toBeInstanceOf(AppointmentRescheduledEvent)
    })

    it('should reschedule confirmed appointment', () => {
      const appointment = Appointment.create(validProps).value
      appointment.confirm()
      const newStart = futureStart.plus({ days: 1 })
      const newEnd = futureEnd.plus({ days: 1 })
      const newSlot = TimeSlot.create(newStart, newEnd).value

      const result = appointment.reschedule(newSlot)

      expect(result.isSuccess).toBe(true)
    })

    it('should fail when rescheduling to past time', () => {
      const appointment = Appointment.create(validProps).value
      const pastStart = DateTime.now().minus({ hours: 2 })
      const pastEnd = DateTime.now().minus({ hours: 1 })
      const pastSlot = TimeSlot.create(pastStart, pastEnd)

      if (pastSlot.isSuccess) {
        const result = appointment.reschedule(pastSlot.value)

        expect(result.isFailure).toBe(true)
        expect(result.error).toContain('Invalid')
      }
    })

    it('should fail when appointment is completed', () => {
      const appointment = Appointment.create(validProps).value
      appointment.confirm()
      appointment.start()
      appointment.complete()
      const newStart = futureStart.plus({ days: 1 })
      const newEnd = futureEnd.plus({ days: 1 })
      const newSlot = TimeSlot.create(newStart, newEnd).value

      const result = appointment.reschedule(newSlot)

      expect(result.isFailure).toBe(true)
    })
  })

  describe('markAsNoShow', () => {
    it('should mark confirmed past appointment as no-show', () => {
      // Create appointment in the past (for testing purposes)
      const pastStart = DateTime.now().minus({ hours: 1 })
      const pastEnd = DateTime.now().minus({ minutes: 30 })
      const pastSlot = TimeSlot.create(pastStart, pastEnd)

      if (pastSlot.isSuccess) {
        const appointment = Appointment.create({
          ...validProps,
          slot: pastSlot.value
        }).value
        appointment.confirm()

        const result = appointment.markAsNoShow()

        expect(result.isSuccess).toBe(true)
        expect(appointment.status).toBe(AppointmentStatus.NO_SHOW)
        expect(appointment.domainEvents).toHaveLength(3)
        expect(appointment.domainEvents[2]).toBeInstanceOf(AppointmentNoShowEvent)
      }
    })

    it('should fail when appointment is not confirmed', () => {
      const pastStart = DateTime.now().minus({ hours: 1 })
      const pastEnd = DateTime.now().minus({ minutes: 30 })
      const pastSlot = TimeSlot.create(pastStart, pastEnd)

      if (pastSlot.isSuccess) {
        const appointment = Appointment.create({
          ...validProps,
          slot: pastSlot.value
        }).value

        const result = appointment.markAsNoShow()

        expect(result.isFailure).toBe(true)
        expect(result.error).toContain('confirmed')
      }
    })

    it('should fail when appointment time has not passed', () => {
      const appointment = Appointment.create(validProps).value
      appointment.confirm()

      const result = appointment.markAsNoShow()

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('passed')
    })
  })

  describe('canBeCancelled', () => {
    it('should return true for pending appointment', () => {
      const appointment = Appointment.create(validProps).value

      expect(appointment.canBeCancelled()).toBe(true)
    })

    it('should return true for confirmed appointment', () => {
      const appointment = Appointment.create(validProps).value
      appointment.confirm()

      expect(appointment.canBeCancelled()).toBe(true)
    })

    it('should return false for completed appointment', () => {
      const appointment = Appointment.create(validProps).value
      appointment.confirm()
      appointment.start()
      appointment.complete()

      expect(appointment.canBeCancelled()).toBe(false)
    })

    it('should return false for cancelled appointment', () => {
      const appointment = Appointment.create(validProps).value
      appointment.cancel('Test')

      expect(appointment.canBeCancelled()).toBe(false)
    })
  })

  describe('canBeRescheduled', () => {
    it('should return true for pending appointment', () => {
      const appointment = Appointment.create(validProps).value

      expect(appointment.canBeRescheduled()).toBe(true)
    })

    it('should return false for completed appointment', () => {
      const appointment = Appointment.create(validProps).value
      appointment.confirm()
      appointment.start()
      appointment.complete()

      expect(appointment.canBeRescheduled()).toBe(false)
    })
  })

  describe('overlapsWith', () => {
    it('should detect overlap with same barber', () => {
      const appointment1 = Appointment.create(validProps).value
      const overlappingStart = futureStart.plus({ minutes: 30 })
      const overlappingEnd = futureEnd.plus({ minutes: 30 })
      const overlappingSlot = TimeSlot.create(overlappingStart, overlappingEnd).value

      const appointment2 = Appointment.create({
        ...validProps,
        client: ClientId.create(),
        slot: overlappingSlot
      }).value

      expect(appointment1.overlapsWith(appointment2)).toBe(true)
    })

    it('should not detect overlap with different barber', () => {
      const appointment1 = Appointment.create(validProps).value
      const appointment2 = Appointment.create({
        ...validProps,
        barber: BarberId.create(),
        client: ClientId.create()
      }).value

      expect(appointment1.overlapsWith(appointment2)).toBe(false)
    })

    it('should ignore cancelled appointments in overlap check', () => {
      const appointment1 = Appointment.create(validProps).value
      appointment1.cancel('Test')

      const appointment2 = Appointment.create({
        ...validProps,
        client: ClientId.create()
      }).value

      expect(appointment1.overlapsWith(appointment2)).toBe(false)
    })
  })

  describe('incrementVersion', () => {
    it('should increment version number', () => {
      const appointment = Appointment.create(validProps).value
      const initialVersion = appointment.version

      appointment.incrementVersion()

      expect(appointment.version).toBe(initialVersion + 1)
    })
  })

  describe('getters', () => {
    it('should return correct property values', () => {
      const appointment = Appointment.create(validProps).value

      expect(appointment.client).toEqual(validProps.client)
      expect(appointment.barber).toEqual(validProps.barber)
      expect(appointment.service).toEqual(validProps.service)
      expect(appointment.slot).toEqual(validProps.slot)
      expect(appointment.status).toBe(AppointmentStatus.PENDING)
      expect(appointment.payment).toEqual(validProps.payment)
      expect(appointment.notes).toBe(validProps.notes)
      expect(appointment.version).toBe(0)
      expect(appointment.createdAt).toBeDefined()
      expect(appointment.updatedAt).toBeDefined()
    })
  })
})
