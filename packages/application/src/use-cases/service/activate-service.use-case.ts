import { Result } from '@barbershop/domain/common/result'
import { Service } from '@barbershop/domain/entities/service.entity'
import { ServiceId } from '@barbershop/domain/entities/service-id.vo'
import { IServiceRepository } from '@barbershop/domain/repositories/service.repository.interface'

/**
 * Input DTO for ActivateServiceUseCase
 */
export interface ActivateServiceDTO {
  serviceId: string
}

/**
 * Use Case: Activate Service
 *
 * Business Rules:
 * 1. Service must exist
 * 2. Idempotent - activating an already active service succeeds
 * 3. Emits ServiceActivatedEvent if state changed
 *
 * This makes a service available for booking.
 * Common triggers:
 * - Re-enabling a seasonal service
 * - After updating service details
 * - Manual activation by admin
 */
export class ActivateServiceUseCase {
  constructor(private readonly serviceRepository: IServiceRepository) {}

  /**
   * Execute the use case
   *
   * @param dto - Input data transfer object
   * @returns Result with updated Service entity
   */
  async execute(dto: ActivateServiceDTO): Promise<Result<Service>> {
    // 1. Load service
    const serviceId = ServiceId.create(dto.serviceId)
    const service = await this.serviceRepository.findById(serviceId)

    if (!service) {
      return Result.fail<Service>('Service not found')
    }

    // 2. Activate service
    const activateResult = service.activate()
    if (activateResult.isFailure) {
      return Result.fail<Service>(activateResult.error!)
    }

    // 3. Persist changes
    try {
      await this.serviceRepository.save(service)
    } catch (error) {
      return Result.fail<Service>('Failed to save service activation')
    }

    // 4. Return success
    return Result.ok<Service>(service)
  }
}
