import { Result } from '@barbershop/domain/common/result'
import { Service } from '@barbershop/domain/entities/service.entity'
import { ServiceId } from '@barbershop/domain/entities/service-id.vo'
import { IServiceRepository } from '@barbershop/domain/repositories/service.repository.interface'

/**
 * Input DTO for DeactivateServiceUseCase
 */
export interface DeactivateServiceDTO {
  serviceId: string
}

/**
 * Use Case: Deactivate Service
 *
 * Business Rules:
 * 1. Service must exist
 * 2. Idempotent - deactivating an already inactive service succeeds
 * 3. Emits ServiceDeactivatedEvent if state changed
 * 4. Does NOT cancel existing appointments (handled separately)
 *
 * This makes a service unavailable for new bookings.
 * Common triggers:
 * - Seasonal service no longer offered
 * - Service temporarily unavailable
 * - Barber shortage for specific skill
 * - Manual deactivation by admin
 *
 * Note: Existing appointments for this service remain valid.
 */
export class DeactivateServiceUseCase {
  constructor(private readonly serviceRepository: IServiceRepository) {}

  /**
   * Execute the use case
   *
   * @param dto - Input data transfer object
   * @returns Result with updated Service entity
   */
  async execute(dto: DeactivateServiceDTO): Promise<Result<Service>> {
    // 1. Load service
    const serviceId = ServiceId.create(dto.serviceId)
    const service = await this.serviceRepository.findById(serviceId)

    if (!service) {
      return Result.fail<Service>('Service not found')
    }

    // 2. Deactivate service
    const deactivateResult = service.deactivate()
    if (deactivateResult.isFailure) {
      return Result.fail<Service>(deactivateResult.error!)
    }

    // 3. Persist changes
    try {
      await this.serviceRepository.save(service)
    } catch (error) {
      return Result.fail<Service>('Failed to save service deactivation')
    }

    // 4. Return success
    return Result.ok<Service>(service)
  }
}
