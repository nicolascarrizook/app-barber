import { Result } from '@barbershop/domain/common/result'
import { Service } from '@barbershop/domain/entities/service.entity'
import { ServiceId } from '@barbershop/domain/entities/service-id.vo'
import { IServiceRepository } from '@barbershop/domain/repositories/service.repository.interface'
import { Money } from '@barbershop/domain/value-objects/money.vo'
import { Duration } from '@barbershop/domain/value-objects/duration.vo'
import { Currency } from '@barbershop/domain/value-objects/currency.vo'

/**
 * Input DTO for UpdateServicePricingUseCase
 */
export interface UpdateServicePricingDTO {
  serviceId: string
  priceAmount?: number
  priceCurrency?: string
  durationMinutes?: number
}

/**
 * Use Case: Update Service Pricing
 *
 * Business Rules:
 * 1. Service must exist
 * 2. Price must be positive if provided
 * 3. Cannot change currency (must match existing currency)
 * 4. Duration must be positive if provided
 * 5. Emits ServicePriceUpdatedEvent and/or ServiceDurationUpdatedEvent
 *
 * This updates service pricing and duration separately from other attributes.
 * Price and duration changes are tracked separately for business analytics.
 */
export class UpdateServicePricingUseCase {
  constructor(private readonly serviceRepository: IServiceRepository) {}

  /**
   * Execute the use case
   *
   * @param dto - Input data transfer object
   * @returns Result with updated Service entity
   */
  async execute(dto: UpdateServicePricingDTO): Promise<Result<Service>> {
    // 1. Load service
    const serviceId = ServiceId.create(dto.serviceId)
    const service = await this.serviceRepository.findById(serviceId)

    if (!service) {
      return Result.fail<Service>('Service not found')
    }

    // 2. Update price if provided
    if (dto.priceAmount !== undefined) {
      // Use existing currency if not provided, or validate it matches
      let currency: Currency = service.price.currency

      if (dto.priceCurrency) {
        // Map string currency to Currency instance
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

        // Validate currency matches
        if (currency.code !== service.price.currency.code) {
          return Result.fail<Service>(
            `Currency mismatch: service uses ${service.price.currency.code}, cannot change to ${currency.code}`
          )
        }
      }

      const newPriceResult = Money.create(dto.priceAmount, currency)
      if (newPriceResult.isFailure) {
        return Result.fail<Service>(newPriceResult.error!)
      }

      const updatePriceResult = service.updatePrice(newPriceResult.value)
      if (updatePriceResult.isFailure) {
        return Result.fail<Service>(updatePriceResult.error!)
      }
    }

    // 3. Update duration if provided
    if (dto.durationMinutes !== undefined) {
      const newDurationResult = Duration.create(dto.durationMinutes)
      if (newDurationResult.isFailure) {
        return Result.fail<Service>(newDurationResult.error!)
      }

      const updateDurationResult = service.updateDuration(newDurationResult.value)
      if (updateDurationResult.isFailure) {
        return Result.fail<Service>(updateDurationResult.error!)
      }
    }

    // 4. Persist changes
    try {
      await this.serviceRepository.save(service)
    } catch (error) {
      return Result.fail<Service>('Failed to save service pricing updates')
    }

    // 5. Return success
    return Result.ok<Service>(service)
  }
}
