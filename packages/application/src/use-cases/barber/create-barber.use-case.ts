import { Result } from '@barbershop/domain/common/result'
import { Barber } from '@barbershop/domain/entities/barber.entity'
import { IBarberRepository } from '@barbershop/domain/repositories/barber.repository.interface'
import { BarberName } from '@barbershop/domain/value-objects/barber-name.vo'
import { Email } from '@barbershop/domain/value-objects/email.vo'
import { Phone } from '@barbershop/domain/value-objects/phone.vo'
import { BarberSpecialties } from '@barbershop/domain/value-objects/barber-specialties.vo'
import { BarberSchedule } from '@barbershop/domain/value-objects/barber-schedule.vo'

/**
 * Input DTO for CreateBarberUseCase
 */
export interface CreateBarberDTO {
  firstName: string
  lastName: string
  email: string
  phone: string
  specialties: string[] // Array of specialty names
  schedule?: {
    monday?: { startTime: string; endTime: string }
    tuesday?: { startTime: string; endTime: string }
    wednesday?: { startTime: string; endTime: string }
    thursday?: { startTime: string; endTime: string }
    friday?: { startTime: string; endTime: string }
    saturday?: { startTime: string; endTime: string }
    sunday?: { startTime: string; endTime: string }
  }
  commissionRate?: number
  profileImageUrl?: string
  bio?: string
}

/**
 * Use Case: Create Barber
 *
 * Business Rules:
 * 1. Email must be unique
 * 2. Phone must be unique
 * 3. At least one specialty required
 * 4. Commission rate must be 0-100
 * 5. Bio maximum 1000 characters
 * 6. If no schedule provided, use default working hours
 *
 * This creates a new barber in the system.
 */
export class CreateBarberUseCase {
  constructor(private readonly barberRepository: IBarberRepository) {}

  /**
   * Execute the use case
   *
   * @param dto - Input data transfer object
   * @returns Result with created Barber entity
   */
  async execute(dto: CreateBarberDTO): Promise<Result<Barber>> {
    // 1. Validate email uniqueness
    const existingByEmail = await this.barberRepository.findByEmail(dto.email)
    if (existingByEmail) {
      return Result.fail<Barber>('A barber with this email already exists')
    }

    // 2. Validate phone uniqueness
    const existingByPhone = await this.barberRepository.findByPhone(dto.phone)
    if (existingByPhone) {
      return Result.fail<Barber>('A barber with this phone already exists')
    }

    // 3. Create value objects
    const nameResult = BarberName.create({
      firstName: dto.firstName,
      lastName: dto.lastName
    })
    if (nameResult.isFailure) {
      return Result.fail<Barber>(nameResult.error!)
    }

    const emailResult = Email.create(dto.email)
    if (emailResult.isFailure) {
      return Result.fail<Barber>(emailResult.error!)
    }

    const phoneResult = Phone.create(dto.phone)
    if (phoneResult.isFailure) {
      return Result.fail<Barber>(phoneResult.error!)
    }

    const specialtiesResult = BarberSpecialties.create(dto.specialties)
    if (specialtiesResult.isFailure) {
      return Result.fail<Barber>(specialtiesResult.error!)
    }

    // 4. Create schedule if provided
    let schedule: BarberSchedule | undefined
    if (dto.schedule) {
      const scheduleResult = BarberSchedule.create(dto.schedule)
      if (scheduleResult.isFailure) {
        return Result.fail<Barber>(scheduleResult.error!)
      }
      schedule = scheduleResult.value
    }

    // 5. Create barber entity
    const barberResult = Barber.create({
      name: nameResult.value,
      email: emailResult.value,
      phone: phoneResult.value,
      specialties: specialtiesResult.value,
      schedule: schedule,
      commissionRate: dto.commissionRate,
      profileImageUrl: dto.profileImageUrl,
      bio: dto.bio
    })

    if (barberResult.isFailure) {
      return Result.fail<Barber>(barberResult.error!)
    }

    const barber = barberResult.value

    // 6. Persist barber
    try {
      await this.barberRepository.save(barber)
    } catch (error) {
      return Result.fail<Barber>('Failed to save barber to database')
    }

    // 7. Return success
    return Result.ok<Barber>(barber)
  }
}
