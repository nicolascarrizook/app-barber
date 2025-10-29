import { Result } from '@barbershop/domain/common/result'
import { Service } from '@barbershop/domain/entities/service.entity'
import { ServiceCategory } from '@barbershop/domain/entities/service-category.enum'
import { IServiceRepository } from '@barbershop/domain/repositories/service.repository.interface'
import { Money } from '@barbershop/domain/value-objects/money.vo'
import { Duration } from '@barbershop/domain/value-objects/duration.vo'
import { Currency } from '@barbershop/domain/value-objects/currency.vo'

/**
 * Input DTO for CreateServiceUseCase
 */
export interface CreateServiceDTO {
  name: string
  description: string
  durationMinutes: number
  priceAmount: number
  priceCurrency: string
  category: ServiceCategory
  requiredSkills?: string[]
}

/**
 * Use Case: Create Service
 *
 * Business Rules:
 * 1. Service name must be unique
 * 2. Name must be 3-100 characters
 * 3. Description must be 10-500 characters
 * 4. Duration must be positive
 * 5. Price must be positive
 * 6. Category must be valid
 * 7. Maximum 10 required skills
 * 8. Each skill must be 1-50 characters
 *
 * This creates a new service offering in the barbershop.
 */
export class CreateServiceUseCase {
  constructor(private readonly serviceRepository: IServiceRepository) {}

  /**
   * Execute the use case
   *
   * @param dto - Input data transfer object
   * @returns Result with created Service entity
   */
  async execute(dto: CreateServiceDTO): Promise<Result<Service>> {
    // 1. Validate service name uniqueness
    const nameExists = await this.serviceRepository.existsByName(dto.name)
    if (nameExists) {
      return Result.fail<Service>('A service with this name already exists')
    }

    // 2. Create duration value object
    const durationResult = Duration.create(dto.durationMinutes)
    if (durationResult.isFailure) {
      return Result.fail<Service>(durationResult.error!)
    }

    // 3. Create price value object
    // Map string currency to Currency instance
    let currency: Currency
    switch (dto.priceCurrency.toUpperCase()) {
      case 'ARS':
        currency = Currency.ARS
        break
      case 'USD':
        currency = Currency.USD
        break
      case 'EUR':
        currency = Currency.EUR
        break
      case 'BRL':
        currency = Currency.BRL
        break
      default:
        return Result.fail<Service>(`Unsupported currency: ${dto.priceCurrency}`)
    }

    const priceResult = Money.create(dto.priceAmount, currency)
    if (priceResult.isFailure) {
      return Result.fail<Service>(priceResult.error!)
    }

    // 4. Create service entity
    const serviceResult = Service.create({
      name: dto.name,
      description: dto.description,
      duration: durationResult.value,
      price: priceResult.value,
      category: dto.category,
      requiredSkills: dto.requiredSkills
    })

    if (serviceResult.isFailure) {
      return Result.fail<Service>(serviceResult.error!)
    }

    const service = serviceResult.value

    // 5. Persist service
    try {
      await this.serviceRepository.save(service)
    } catch (error) {
      return Result.fail<Service>('Failed to save service to database')
    }

    // 6. Return success
    return Result.ok<Service>(service)
  }
}
