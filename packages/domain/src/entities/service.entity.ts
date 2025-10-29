import { AggregateRoot } from '../common/aggregate-root'
import { UniqueEntityID } from '../common/unique-entity-id'
import { Result } from '../common/result'
import { ServiceId } from './service-id.vo'
import { Money } from '../value-objects/money.vo'
import { Duration } from '../value-objects/duration.vo'
import { ServiceCategory } from './service-category.enum'
import {
  ServiceCreatedEvent,
  ServiceUpdatedEvent,
  ServicePriceUpdatedEvent,
  ServiceDurationUpdatedEvent,
  ServiceActivatedEvent,
  ServiceDeactivatedEvent
} from '../events/service.events'

interface ServiceProps {
  name: string
  description: string
  duration: Duration
  price: Money
  category: ServiceCategory
  requiredSkills: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateServiceProps {
  name: string
  description: string
  duration: Duration
  price: Money
  category: ServiceCategory
  requiredSkills?: string[]
}

export class Service extends AggregateRoot<ServiceProps> {
  private constructor(props: ServiceProps, id?: UniqueEntityID) {
    super(props, id)
  }

  public static create(props: CreateServiceProps): Result<Service> {
    // Validate name
    const trimmedName = props.name.trim()
    if (!trimmedName) {
      return Result.fail<Service>('Service name is required')
    }

    if (trimmedName.length < 3) {
      return Result.fail<Service>('Service name must be at least 3 characters')
    }

    if (trimmedName.length > 100) {
      return Result.fail<Service>('Service name must not exceed 100 characters')
    }

    // Validate description
    const trimmedDescription = props.description.trim()
    if (!trimmedDescription) {
      return Result.fail<Service>('Service description is required')
    }

    if (trimmedDescription.length < 10) {
      return Result.fail<Service>('Service description must be at least 10 characters')
    }

    if (trimmedDescription.length > 500) {
      return Result.fail<Service>('Service description must not exceed 500 characters')
    }

    // Validate requiredSkills
    const skills = props.requiredSkills || []
    if (skills.length > 10) {
      return Result.fail<Service>('Cannot have more than 10 required skills')
    }

    for (const skill of skills) {
      const trimmedSkill = skill.trim()
      if (!trimmedSkill) {
        return Result.fail<Service>('Skill cannot be empty')
      }
      if (trimmedSkill.length > 50) {
        return Result.fail<Service>('Skill name must not exceed 50 characters')
      }
    }

    const service = new Service({
      name: trimmedName,
      description: trimmedDescription,
      duration: props.duration,
      price: props.price,
      category: props.category,
      requiredSkills: skills.map(s => s.trim()),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    service.addDomainEvent(new ServiceCreatedEvent(service))

    return Result.ok<Service>(service)
  }

  get serviceId(): UniqueEntityID {
    return this._id
  }

  get name(): string {
    return this.props.name
  }

  get description(): string {
    return this.props.description
  }

  get duration(): Duration {
    return this.props.duration
  }

  get price(): Money {
    return this.props.price
  }

  get category(): ServiceCategory {
    return this.props.category
  }

  get requiredSkills(): readonly string[] {
    return Object.freeze([...this.props.requiredSkills])
  }

  get isActive(): boolean {
    return this.props.isActive
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  updateInfo(updates: {
    name?: string
    description?: string
    category?: ServiceCategory
  }): Result<void> {
    const updatedFields: string[] = []

    if (updates.name !== undefined) {
      const trimmedName = updates.name.trim()
      if (!trimmedName) {
        return Result.fail<void>('Service name is required')
      }

      if (trimmedName.length < 3) {
        return Result.fail<void>('Service name must be at least 3 characters')
      }

      if (trimmedName.length > 100) {
        return Result.fail<void>('Service name must not exceed 100 characters')
      }

      this.props.name = trimmedName
      updatedFields.push('name')
    }

    if (updates.description !== undefined) {
      const trimmedDescription = updates.description.trim()
      if (!trimmedDescription) {
        return Result.fail<void>('Service description is required')
      }

      if (trimmedDescription.length < 10) {
        return Result.fail<void>('Service description must be at least 10 characters')
      }

      if (trimmedDescription.length > 500) {
        return Result.fail<void>('Service description must not exceed 500 characters')
      }

      this.props.description = trimmedDescription
      updatedFields.push('description')
    }

    if (updates.category !== undefined) {
      this.props.category = updates.category
      updatedFields.push('category')
    }

    if (updatedFields.length > 0) {
      this.props.updatedAt = new Date()
      this.addDomainEvent(new ServiceUpdatedEvent(this, updatedFields))
    }

    return Result.ok<void>()
  }

  updatePrice(newPrice: Money): Result<void> {
    if (newPrice.currency !== this.props.price.currency) {
      return Result.fail<void>('Cannot change currency')
    }

    const oldPrice = this.props.price
    this.props.price = newPrice
    this.props.updatedAt = new Date()

    this.addDomainEvent(new ServicePriceUpdatedEvent(this, oldPrice, newPrice))

    return Result.ok<void>()
  }

  updateDuration(newDuration: Duration): Result<void> {
    const oldDuration = this.props.duration
    this.props.duration = newDuration
    this.props.updatedAt = new Date()

    this.addDomainEvent(new ServiceDurationUpdatedEvent(this, oldDuration, newDuration))

    return Result.ok<void>()
  }

  addRequiredSkill(skill: string): Result<void> {
    const trimmedSkill = skill.trim()
    if (!trimmedSkill) {
      return Result.fail<void>('Skill cannot be empty')
    }

    if (trimmedSkill.length > 50) {
      return Result.fail<void>('Skill name must not exceed 50 characters')
    }

    if (this.props.requiredSkills.includes(trimmedSkill)) {
      return Result.fail<void>('Skill already exists')
    }

    if (this.props.requiredSkills.length >= 10) {
      return Result.fail<void>('Cannot have more than 10 required skills')
    }

    this.props.requiredSkills.push(trimmedSkill)
    this.props.updatedAt = new Date()
    this.addDomainEvent(new ServiceUpdatedEvent(this, ['requiredSkills']))

    return Result.ok<void>()
  }

  removeRequiredSkill(skill: string): Result<void> {
    const trimmedSkill = skill.trim()
    const index = this.props.requiredSkills.indexOf(trimmedSkill)

    if (index === -1) {
      return Result.fail<void>('Skill not found')
    }

    this.props.requiredSkills.splice(index, 1)
    this.props.updatedAt = new Date()
    this.addDomainEvent(new ServiceUpdatedEvent(this, ['requiredSkills']))

    return Result.ok<void>()
  }

  requiresSkill(skill: string): boolean {
    return this.props.requiredSkills.includes(skill.trim())
  }

  activate(): Result<void> {
    if (this.props.isActive) {
      return Result.ok<void>()
    }

    this.props.isActive = true
    this.props.updatedAt = new Date()
    this.addDomainEvent(new ServiceActivatedEvent(this))

    return Result.ok<void>()
  }

  deactivate(): Result<void> {
    if (!this.props.isActive) {
      return Result.ok<void>()
    }

    this.props.isActive = false
    this.props.updatedAt = new Date()
    this.addDomainEvent(new ServiceDeactivatedEvent(this))

    return Result.ok<void>()
  }
}
