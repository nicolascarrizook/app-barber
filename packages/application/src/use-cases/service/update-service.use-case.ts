import { Result } from '@barbershop/domain/common/result'
import { Service } from '@barbershop/domain/entities/service.entity'
import { ServiceId } from '@barbershop/domain/entities/service-id.vo'
import { ServiceCategory } from '@barbershop/domain/entities/service-category.enum'
import { IServiceRepository } from '@barbershop/domain/repositories/service.repository.interface'

/**
 * Input DTO for UpdateServiceUseCase
 */
export interface UpdateServiceDTO {
  serviceId: string
  name?: string
  description?: string
  category?: ServiceCategory
}

/**
 * Use Case: Update Service
 *
 * Business Rules:
 * 1. Service must exist
 * 2. If name is updated, must be unique
 * 3. Name must be 3-100 characters if provided
 * 4. Description must be 10-500 characters if provided
 * 5. Category must be valid if provided
 * 6. Cannot update pricing or duration (use dedicated use cases)
 *
 * This updates basic service information.
 */
export class UpdateServiceUseCase {
  constructor(private readonly serviceRepository: IServiceRepository) {}

  /**
   * Execute the use case
   *
   * @param dto - Input data transfer object
   * @returns Result with updated Service entity
   */
  async execute(dto: UpdateServiceDTO): Promise<Result<Service>> {
    // 1. Load service
    const serviceId = ServiceId.create(dto.serviceId)
    const service = await this.serviceRepository.findById(serviceId)

    if (!service) {
      return Result.fail<Service>('Service not found')
    }

    // 2. Validate name uniqueness if being updated
    if (dto.name && dto.name !== service.name) {
      const nameExists = await this.serviceRepository.existsByName(dto.name)
      if (nameExists) {
        return Result.fail<Service>('A service with this name already exists')
      }
    }

    // 3. Update service entity
    const updateResult = service.updateInfo({
      name: dto.name,
      description: dto.description,
      category: dto.category
    })

    if (updateResult.isFailure) {
      return Result.fail<Service>(updateResult.error!)
    }

    // 4. Persist changes
    try {
      await this.serviceRepository.save(service)
    } catch (error) {
      return Result.fail<Service>('Failed to save service updates')
    }

    // 5. Return success
    return Result.ok<Service>(service)
  }
}
