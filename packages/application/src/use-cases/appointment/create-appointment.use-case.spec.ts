import { CreateAppointmentUseCase, CreateAppointmentDTO } from './create-appointment.use-case'
import { Appointment } from '@barbershop/domain/entities/appointment.entity'
import { Barber } from '@barbershop/domain/entities/barber.entity'
import { Client } from '@barbershop/domain/entities/client.entity'
import { Service } from '@barbershop/domain/entities/service.entity'
import { BarberId } from '@barbershop/domain/entities/barber-id.vo'
import { ClientId } from '@barbershop/domain/entities/client-id.vo'
import { ServiceId } from '@barbershop/domain/entities/service-id.vo'
import { Email } from '@barbershop/domain/value-objects/email.vo'
import { Phone } from '@barbershop/domain/value-objects/phone.vo'
import { Money } from '@barbershop/domain/value-objects/money.vo'
import { Duration } from '@barbershop/domain/value-objects/duration.vo'
import { Specialty, BarberSpecialties } from '@barbershop/domain/value-objects/barber-specialties.vo'
import { BarberSchedule, DayOfWeek } from '@barbershop/domain/value-objects/barber-schedule.vo'
import { BarberName } from '@barbershop/domain/value-objects/barber-name.vo'
import { Currency } from '@barbershop/domain/value-objects/currency.vo'
import { ServiceCategory } from '@barbershop/domain/entities/service-category.enum'
import { IAppointmentRepository } from '@barbershop/domain/repositories/appointment.repository.interface'
import { IBarberRepository } from '@barbershop/domain/repositories/barber.repository.interface'
import { IClientRepository } from '@barbershop/domain/repositories/client.repository.interface'
import { IServiceRepository } from '@barbershop/domain/repositories/service.repository.interface'

describe('CreateAppointmentUseCase', () => {
  let useCase: CreateAppointmentUseCase
  let appointmentRepository: jest.Mocked<IAppointmentRepository>
  let barberRepository: jest.Mocked<IBarberRepository>
  let clientRepository: jest.Mocked<IClientRepository>
  let serviceRepository: jest.Mocked<IServiceRepository>

  let testBarber: Barber
  let testClient: Client
  let testService: Service

  beforeEach(() => {
    // Create mock repositories
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

    barberRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      findBySkill: jest.fn(),
      findAvailable: jest.fn(),
      findAvailableForService: jest.fn(),
      findTopRated: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      existsByEmail: jest.fn()
    } as jest.Mocked<IBarberRepository>

    clientRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByPhone: jest.fn(),
      findAll: jest.fn(),
      findByStatus: jest.fn(),
      search: jest.fn(),
      findTopByLifetimeValue: jest.fn(),
      findEligibleForLoyalty: jest.fn(),
      findInactiveClients: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      existsByEmail: jest.fn(),
      existsByPhone: jest.fn()
    } as jest.Mocked<IClientRepository>

    serviceRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findActive: jest.fn(),
      findAll: jest.fn(),
      findByCategory: jest.fn(),
      findByRequiredSkill: jest.fn(),
      findByPriceRange: jest.fn(),
      findByDurationRange: jest.fn(),
      search: jest.fn(),
      findPopular: jest.fn(),
      findByBarberSkills: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      existsByName: jest.fn()
    } as jest.Mocked<IServiceRepository>

    // Create test entities with correct APIs
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

    // Initialize use case
    useCase = new CreateAppointmentUseCase(
      appointmentRepository,
      barberRepository,
      clientRepository,
      serviceRepository
    )
  })

  describe('Successful appointment creation', () => {
    it('should create an appointment with valid data', async () => {
      // Arrange
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(10, 0, 0, 0)

      const dto: CreateAppointmentDTO = {
        barberId: testBarber.id.toString(),
        clientId: testClient.id.toString(),
        serviceId: testService.id.toString(),
        startTime: tomorrow,
        notes: 'First time customer'
      }

      barberRepository.findById.mockResolvedValue(testBarber)
      clientRepository.findById.mockResolvedValue(testClient)
      serviceRepository.findById.mockResolvedValue(testService)
      appointmentRepository.findConflicting.mockResolvedValue([])
      appointmentRepository.save.mockImplementation(async (apt) => apt)

      // Act
      const result = await useCase.execute(dto)

      // Assert
      expect(result.isSuccess).toBe(true)
      expect(appointmentRepository.save).toHaveBeenCalledTimes(1)
    })

    it('should include notes when provided', async () => {
      // Arrange
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(14, 0, 0, 0)

      const dto: CreateAppointmentDTO = {
        barberId: testBarber.id.toString(),
        clientId: testClient.id.toString(),
        serviceId: testService.id.toString(),
        startTime: tomorrow,
        notes: 'Customer prefers short on sides'
      }

      barberRepository.findById.mockResolvedValue(testBarber)
      clientRepository.findById.mockResolvedValue(testClient)
      serviceRepository.findById.mockResolvedValue(testService)
      appointmentRepository.findConflicting.mockResolvedValue([])
      appointmentRepository.save.mockImplementation(async (apt) => apt)

      // Act
      const result = await useCase.execute(dto)

      // Assert
      expect(result.isSuccess).toBe(true)
      const appointment = result.value
      expect(appointment.notes).toBe('Customer prefers short on sides')
    })
  })

  describe('Barber validation', () => {
    it('should fail if barber does not exist', async () => {
      // Arrange
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(10, 0, 0, 0)

      const dto: CreateAppointmentDTO = {
        barberId: 'non-existent-id',
        clientId: testClient.id.toString(),
        serviceId: testService.id.toString(),
        startTime: tomorrow
      }

      barberRepository.findById.mockResolvedValue(null)

      // Act
      const result = await useCase.execute(dto)

      // Assert
      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Barber not found')
    })

    it('should fail if barber is not active', async () => {
      // Arrange
      const inactiveBarber = { ...testBarber }
      // Deactivate barber
      testBarber.deactivate('Test deactivation')

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(10, 0, 0, 0)

      const dto: CreateAppointmentDTO = {
        barberId: testBarber.id.toString(),
        clientId: testClient.id.toString(),
        serviceId: testService.id.toString(),
        startTime: tomorrow
      }

      barberRepository.findById.mockResolvedValue(testBarber)

      // Act
      const result = await useCase.execute(dto)

      // Assert
      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('not active')
    })

    it('should fail if barber lacks required skills', async () => {
      // Arrange - Create barber with only BEARD specialty (not HAIRCUT)
      const barberNameResult = BarberName.create('Bob', 'Smith')
      const barberEmailResult = Email.create('bob@barbershop.com')
      const barberPhoneResult = Phone.create('1111111111')
      const beardSpecialtiesResult = BarberSpecialties.create([Specialty.BEARD]) // Only BEARD
      const barberScheduleResult = BarberSchedule.createDefault()

      const barberWithoutSkills = Barber.create({
        name: barberNameResult.value,
        email: barberEmailResult.value,
        phone: barberPhoneResult.value,
        specialties: beardSpecialtiesResult.value,
        schedule: barberScheduleResult.value
      }).value

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(10, 0, 0, 0)

      const dto: CreateAppointmentDTO = {
        barberId: barberWithoutSkills.id.toString(),
        clientId: testClient.id.toString(),
        serviceId: testService.id.toString(), // Requires HAIRCUT skill
        startTime: tomorrow
      }

      barberRepository.findById.mockResolvedValue(barberWithoutSkills)
      clientRepository.findById.mockResolvedValue(testClient)
      serviceRepository.findById.mockResolvedValue(testService)

      // Act
      const result = await useCase.execute(dto)

      // Assert
      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('required skills')
    })
  })

  describe('Client validation', () => {
    it('should fail if client does not exist', async () => {
      // Arrange
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(10, 0, 0, 0)

      const dto: CreateAppointmentDTO = {
        barberId: testBarber.id.toString(),
        clientId: 'non-existent-id',
        serviceId: testService.id.toString(),
        startTime: tomorrow
      }

      barberRepository.findById.mockResolvedValue(testBarber)
      clientRepository.findById.mockResolvedValue(null)

      // Act
      const result = await useCase.execute(dto)

      // Assert
      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Client not found')
    })

    it('should fail if client is not active', async () => {
      // Arrange
      testClient.deactivate('Test deactivation')

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(10, 0, 0, 0)

      const dto: CreateAppointmentDTO = {
        barberId: testBarber.id.toString(),
        clientId: testClient.id.toString(),
        serviceId: testService.id.toString(),
        startTime: tomorrow
      }

      barberRepository.findById.mockResolvedValue(testBarber)
      clientRepository.findById.mockResolvedValue(testClient)

      // Act
      const result = await useCase.execute(dto)

      // Assert
      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('not active')
    })
  })

  describe('Service validation', () => {
    it('should fail if service does not exist', async () => {
      // Arrange
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(10, 0, 0, 0)

      const dto: CreateAppointmentDTO = {
        barberId: testBarber.id.toString(),
        clientId: testClient.id.toString(),
        serviceId: 'non-existent-id',
        startTime: tomorrow
      }

      barberRepository.findById.mockResolvedValue(testBarber)
      clientRepository.findById.mockResolvedValue(testClient)
      serviceRepository.findById.mockResolvedValue(null)

      // Act
      const result = await useCase.execute(dto)

      // Assert
      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Service not found')
    })

    it('should fail if service is not active', async () => {
      // Arrange
      testService.deactivate()

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(10, 0, 0, 0)

      const dto: CreateAppointmentDTO = {
        barberId: testBarber.id.toString(),
        clientId: testClient.id.toString(),
        serviceId: testService.id.toString(),
        startTime: tomorrow
      }

      barberRepository.findById.mockResolvedValue(testBarber)
      clientRepository.findById.mockResolvedValue(testClient)
      serviceRepository.findById.mockResolvedValue(testService)

      // Act
      const result = await useCase.execute(dto)

      // Assert
      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('not available')
    })
  })

  describe('Scheduling validation', () => {
    it('should fail if time slot conflicts with existing appointment', async () => {
      // Arrange
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(10, 0, 0, 0)

      const dto: CreateAppointmentDTO = {
        barberId: testBarber.id.toString(),
        clientId: testClient.id.toString(),
        serviceId: testService.id.toString(),
        startTime: tomorrow
      }

      // Create a mock conflicting appointment
      const mockConflictingAppointment = {
        slot: {
          startTime: { toString: () => tomorrow.toISOString() },
          endTime: { toString: () => new Date(tomorrow.getTime() + 30 * 60000).toISOString() }
        }
      } as any

      barberRepository.findById.mockResolvedValue(testBarber)
      clientRepository.findById.mockResolvedValue(testClient)
      serviceRepository.findById.mockResolvedValue(testService)
      appointmentRepository.findConflicting.mockResolvedValue([mockConflictingAppointment])

      // Act
      const result = await useCase.execute(dto)

      // Assert
      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('conflicts')
    })
  })
})
