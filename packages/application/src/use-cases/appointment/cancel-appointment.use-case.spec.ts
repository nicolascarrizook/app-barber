import { CancelAppointmentUseCase, CancelAppointmentDTO } from './cancel-appointment.use-case'
import { Appointment } from '@barbershop/domain/entities/appointment.entity'
import { Barber } from '@barbershop/domain/entities/barber.entity'
import { Client } from '@barbershop/domain/entities/client.entity'
import { Service } from '@barbershop/domain/entities/service.entity'
import { AppointmentId } from '@barbershop/domain/entities/appointment-id.vo'
import { BarberId } from '@barbershop/domain/entities/barber-id.vo'
import { ClientId } from '@barbershop/domain/entities/client-id.vo'
import { ServiceId } from '@barbershop/domain/entities/service-id.vo'
import { Email } from '@barbershop/domain/value-objects/email.vo'
import { Phone } from '@barbershop/domain/value-objects/phone.vo'
import { Money } from '@barbershop/domain/value-objects/money.vo'
import { Duration } from '@barbershop/domain/value-objects/duration.vo'
import { Specialty, BarberSpecialties } from '@barbershop/domain/value-objects/barber-specialties.vo'
import { BarberSchedule } from '@barbershop/domain/value-objects/barber-schedule.vo'
import { BarberName } from '@barbershop/domain/value-objects/barber-name.vo'
import { Currency } from '@barbershop/domain/value-objects/currency.vo'
import { ServiceCategory } from '@barbershop/domain/entities/service-category.enum'
import { AppointmentStatus } from '@barbershop/domain/entities/appointment-status.enum'
import { TimeSlot } from '@barbershop/domain/value-objects/time-slot.vo'
import { PaymentInfo } from '@barbershop/domain/value-objects/payment-info.vo'
import { IAppointmentRepository } from '@barbershop/domain/repositories/appointment.repository.interface'
import { DateTime } from 'luxon'

describe('CancelAppointmentUseCase', () => {
  let useCase: CancelAppointmentUseCase
  let appointmentRepository: jest.Mocked<IAppointmentRepository>

  let testBarber: Barber
  let testClient: Client
  let testService: Service
  let testAppointment: Appointment

  beforeEach(() => {
    // Create mock repository
    appointmentRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByBarberAndDate: jest.fn(),
      findByClient: jest.fn(),
      findConflicting: jest.fn(),
      findByBarberAndDateRange: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn()
    } as jest.Mocked<IAppointmentRepository>

    // Create test entities
    const barberNameResult = BarberName.create('John', 'Doe')
    const barberEmailResult = Email.create('john@barbershop.com')
    const barberPhoneResult = Phone.create('1234567890')
    const barberSpecialtiesResult = BarberSpecialties.create([Specialty.HAIRCUT])
    const barberScheduleResult = BarberSchedule.createDefault()

    testBarber = Barber.create({
      name: barberNameResult.value,
      email: barberEmailResult.value,
      phone: barberPhoneResult.value,
      specialties: barberSpecialtiesResult.value,
      schedule: barberScheduleResult.value
    }).value

    const clientEmailResult = Email.create('client@example.com')
    const clientPhoneResult = Phone.create('9876543210')

    testClient = Client.create({
      firstName: 'Jane',
      lastName: 'Smith',
      email: clientEmailResult.value,
      phone: clientPhoneResult.value
    }).value

    const servicePriceResult = Money.create(25, Currency.USD)
    const serviceDurationResult = Duration.create(30)

    testService = Service.create({
      name: 'Classic Haircut',
      description: 'Traditional haircut service for all ages',
      duration: serviceDurationResult.value,
      price: servicePriceResult.value,
      category: ServiceCategory.HAIRCUT,
      requiredSkills: ['HAIRCUT']
    }).value

    // Create test appointment (tomorrow at 10am)
    const tomorrow = DateTime.now().plus({ days: 1 }).set({ hour: 10, minute: 0, second: 0, millisecond: 0 })
    const endTime = tomorrow.plus({ minutes: 30 })
    const timeSlot = TimeSlot.create(tomorrow, endTime).value
    const payment = PaymentInfo.pending(testService.price)

    testAppointment = Appointment.create({
      barber: BarberId.create(testBarber.id.toString()),
      client: ClientId.create(testClient.id.toString()),
      service: ServiceId.create(testService.id.toString()),
      slot: timeSlot,
      payment,
      notes: 'Test appointment'
    }).value

    // Initialize use case
    useCase = new CancelAppointmentUseCase(appointmentRepository)
  })

  describe('Successful cancellation', () => {
    it('should cancel a PENDING appointment with valid reason', async () => {
      // Arrange
      const dto: CancelAppointmentDTO = {
        appointmentId: testAppointment.id.toString(),
        reason: 'Client requested cancellation',
        cancelledBy: 'CLIENT'
      }

      appointmentRepository.findById.mockResolvedValue(testAppointment)
      appointmentRepository.save.mockImplementation(async (apt) => apt)

      // Act
      const result = await useCase.execute(dto)

      // Assert
      expect(result.isSuccess).toBe(true)
      expect(result.value.status).toBe(AppointmentStatus.CANCELLED)
      expect(appointmentRepository.save).toHaveBeenCalledTimes(1)
    })

    it('should cancel a CONFIRMED appointment', async () => {
      // Arrange - First confirm the appointment
      testAppointment.confirm()

      const dto: CancelAppointmentDTO = {
        appointmentId: testAppointment.id.toString(),
        reason: 'Emergency came up',
        cancelledBy: 'CLIENT'
      }

      appointmentRepository.findById.mockResolvedValue(testAppointment)
      appointmentRepository.save.mockImplementation(async (apt) => apt)

      // Act
      const result = await useCase.execute(dto)

      // Assert
      expect(result.isSuccess).toBe(true)
      expect(result.value.status).toBe(AppointmentStatus.CANCELLED)
    })

    it('should handle cancellation by BARBER', async () => {
      // Arrange
      const dto: CancelAppointmentDTO = {
        appointmentId: testAppointment.id.toString(),
        reason: 'Barber unavailable due to illness',
        cancelledBy: 'BARBER'
      }

      appointmentRepository.findById.mockResolvedValue(testAppointment)
      appointmentRepository.save.mockImplementation(async (apt) => apt)

      // Act
      const result = await useCase.execute(dto)

      // Assert
      expect(result.isSuccess).toBe(true)
      expect(result.value.status).toBe(AppointmentStatus.CANCELLED)
    })

    it('should handle cancellation by SYSTEM', async () => {
      // Arrange
      const dto: CancelAppointmentDTO = {
        appointmentId: testAppointment.id.toString(),
        reason: 'Automatic cancellation due to no-show',
        cancelledBy: 'SYSTEM'
      }

      appointmentRepository.findById.mockResolvedValue(testAppointment)
      appointmentRepository.save.mockImplementation(async (apt) => apt)

      // Act
      const result = await useCase.execute(dto)

      // Assert
      expect(result.isSuccess).toBe(true)
      expect(result.value.status).toBe(AppointmentStatus.CANCELLED)
    })
  })

  describe('Appointment existence validation', () => {
    it('should fail when appointment does not exist', async () => {
      // Arrange
      const dto: CancelAppointmentDTO = {
        appointmentId: 'non-existent-id',
        reason: 'Valid reason',
        cancelledBy: 'CLIENT'
      }

      appointmentRepository.findById.mockResolvedValue(null)

      // Act
      const result = await useCase.execute(dto)

      // Assert
      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Appointment not found')
      expect(appointmentRepository.save).not.toHaveBeenCalled()
    })
  })

  describe('Cancellation reason validation', () => {
    it('should fail when reason is empty', async () => {
      // Arrange
      const dto: CancelAppointmentDTO = {
        appointmentId: testAppointment.id.toString(),
        reason: '',
        cancelledBy: 'CLIENT'
      }

      appointmentRepository.findById.mockResolvedValue(testAppointment)

      // Act
      const result = await useCase.execute(dto)

      // Assert
      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Cancellation reason is required')
      expect(appointmentRepository.save).not.toHaveBeenCalled()
    })

    it('should fail when reason is too short (< 3 characters)', async () => {
      // Arrange
      const dto: CancelAppointmentDTO = {
        appointmentId: testAppointment.id.toString(),
        reason: 'ab',
        cancelledBy: 'CLIENT'
      }

      appointmentRepository.findById.mockResolvedValue(testAppointment)

      // Act
      const result = await useCase.execute(dto)

      // Assert
      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('minimum 3 characters')
      expect(appointmentRepository.save).not.toHaveBeenCalled()
    })

    it('should fail when reason is only whitespace', async () => {
      // Arrange
      const dto: CancelAppointmentDTO = {
        appointmentId: testAppointment.id.toString(),
        reason: '   ',
        cancelledBy: 'CLIENT'
      }

      appointmentRepository.findById.mockResolvedValue(testAppointment)

      // Act
      const result = await useCase.execute(dto)

      // Assert
      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Cancellation reason is required')
    })
  })

  describe('Appointment status validation', () => {
    it('should fail when trying to cancel an IN_PROGRESS appointment', async () => {
      // Arrange - Start the appointment (confirm first)
      testAppointment.confirm()
      testAppointment.start()

      const dto: CancelAppointmentDTO = {
        appointmentId: testAppointment.id.toString(),
        reason: 'Changed my mind',
        cancelledBy: 'CLIENT'
      }

      appointmentRepository.findById.mockResolvedValue(testAppointment)

      // Act
      const result = await useCase.execute(dto)

      // Assert
      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('cannot be cancelled')
      expect(appointmentRepository.save).not.toHaveBeenCalled()
    })

    it('should fail when trying to cancel a COMPLETED appointment', async () => {
      // Arrange - Complete the appointment (confirm and start first)
      testAppointment.confirm()
      testAppointment.start()
      testAppointment.complete()

      const dto: CancelAppointmentDTO = {
        appointmentId: testAppointment.id.toString(),
        reason: 'Too late',
        cancelledBy: 'CLIENT'
      }

      appointmentRepository.findById.mockResolvedValue(testAppointment)

      // Act
      const result = await useCase.execute(dto)

      // Assert
      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('cannot be cancelled')
      expect(appointmentRepository.save).not.toHaveBeenCalled()
    })

    it('should fail when trying to cancel an already CANCELLED appointment', async () => {
      // Arrange - Cancel the appointment first
      testAppointment.cancel('First cancellation')

      const dto: CancelAppointmentDTO = {
        appointmentId: testAppointment.id.toString(),
        reason: 'Cancelling again',
        cancelledBy: 'CLIENT'
      }

      appointmentRepository.findById.mockResolvedValue(testAppointment)

      // Act
      const result = await useCase.execute(dto)

      // Assert
      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('cannot be cancelled')
    })
  })

  describe('Optimistic locking handling', () => {
    it('should handle optimistic locking failures gracefully', async () => {
      // Arrange
      const dto: CancelAppointmentDTO = {
        appointmentId: testAppointment.id.toString(),
        reason: 'Valid cancellation',
        cancelledBy: 'CLIENT'
      }

      appointmentRepository.findById.mockResolvedValue(testAppointment)
      appointmentRepository.save.mockRejectedValue(
        new Error('Optimistic locking failed: version mismatch')
      )

      // Act
      const result = await useCase.execute(dto)

      // Assert
      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('modified by another user')
      expect(result.error).toContain('refresh')
    })

    it('should handle generic save errors', async () => {
      // Arrange
      const dto: CancelAppointmentDTO = {
        appointmentId: testAppointment.id.toString(),
        reason: 'Valid cancellation',
        cancelledBy: 'CLIENT'
      }

      appointmentRepository.findById.mockResolvedValue(testAppointment)
      appointmentRepository.save.mockRejectedValue(new Error('Database connection lost'))

      // Act
      const result = await useCase.execute(dto)

      // Assert
      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Failed to save')
      expect(result.error).toContain('Database connection lost')
    })
  })
})
