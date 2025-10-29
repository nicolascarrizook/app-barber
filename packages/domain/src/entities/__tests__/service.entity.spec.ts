import { Service, CreateServiceProps } from '../service.entity'
import { Duration } from '../../value-objects/duration.vo'
import { Money } from '../../value-objects/money.vo'
import { Currency } from '../../value-objects/currency.vo'
import { ServiceCategory } from '../service-category.enum'
import {
  ServiceCreatedEvent,
  ServiceUpdatedEvent,
  ServicePriceUpdatedEvent,
  ServiceDurationUpdatedEvent,
  ServiceActivatedEvent,
  ServiceDeactivatedEvent
} from '../../events/service.events'

describe('Service Entity', () => {
  const createValidServiceProps = (): CreateServiceProps => ({
    name: 'Classic Haircut',
    description: 'Traditional haircut with scissors and clippers, includes wash and style',
    duration: Duration.create(30).value,
    price: Money.create(25, Currency.USD).value,
    category: ServiceCategory.HAIRCUT
  })

  describe('create', () => {
    it('should create valid service', () => {
      const props = createValidServiceProps()
      const result = Service.create(props)

      expect(result.isSuccess).toBe(true)
      expect(result.value.name).toBe('Classic Haircut')
      expect(result.value.duration.minutes).toBe(30)
      expect(result.value.price.amount).toBe(25)
      expect(result.value.isActive).toBe(true)
    })

    it('should trim name whitespace', () => {
      const props = { ...createValidServiceProps(), name: '  Haircut  ' }
      const result = Service.create(props)

      expect(result.isSuccess).toBe(true)
      expect(result.value.name).toBe('Haircut')
    })

    it('should fail if name is empty', () => {
      const props = { ...createValidServiceProps(), name: '' }
      const result = Service.create(props)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('name is required')
    })

    it('should fail if name is only whitespace', () => {
      const props = { ...createValidServiceProps(), name: '   ' }
      const result = Service.create(props)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('name is required')
    })

    it('should fail if name is less than 3 characters', () => {
      const props = { ...createValidServiceProps(), name: 'AB' }
      const result = Service.create(props)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('must be at least 3 characters')
    })

    it('should fail if name exceeds 100 characters', () => {
      const props = { ...createValidServiceProps(), name: 'A'.repeat(101) }
      const result = Service.create(props)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('must not exceed 100 characters')
    })

    it('should trim description whitespace', () => {
      const props = { ...createValidServiceProps(), description: '  Good service  ' }
      const result = Service.create(props)

      expect(result.isSuccess).toBe(true)
      expect(result.value.description).toBe('Good service')
    })

    it('should fail if description is empty', () => {
      const props = { ...createValidServiceProps(), description: '' }
      const result = Service.create(props)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('description is required')
    })

    it('should fail if description is only whitespace', () => {
      const props = { ...createValidServiceProps(), description: '   ' }
      const result = Service.create(props)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('description is required')
    })

    it('should fail if description is less than 10 characters', () => {
      const props = { ...createValidServiceProps(), description: 'Short' }
      const result = Service.create(props)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('must be at least 10 characters')
    })

    it('should fail if description exceeds 500 characters', () => {
      const props = { ...createValidServiceProps(), description: 'A'.repeat(501) }
      const result = Service.create(props)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('must not exceed 500 characters')
    })

    it('should create service with no required skills', () => {
      const props = createValidServiceProps()
      const result = Service.create(props)

      expect(result.isSuccess).toBe(true)
      expect(result.value.requiredSkills.length).toBe(0)
    })

    it('should create service with required skills', () => {
      const props = { ...createValidServiceProps(), requiredSkills: ['Fading', 'Clipper work'] }
      const result = Service.create(props)

      expect(result.isSuccess).toBe(true)
      expect(result.value.requiredSkills).toEqual(['Fading', 'Clipper work'])
    })

    it('should trim required skills whitespace', () => {
      const props = { ...createValidServiceProps(), requiredSkills: ['  Fading  ', '  Clipper  '] }
      const result = Service.create(props)

      expect(result.isSuccess).toBe(true)
      expect(result.value.requiredSkills).toEqual(['Fading', 'Clipper'])
    })

    it('should fail if skill is empty', () => {
      const props = { ...createValidServiceProps(), requiredSkills: [''] }
      const result = Service.create(props)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Skill cannot be empty')
    })

    it('should fail if skill is only whitespace', () => {
      const props = { ...createValidServiceProps(), requiredSkills: ['   '] }
      const result = Service.create(props)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Skill cannot be empty')
    })

    it('should fail if skill exceeds 50 characters', () => {
      const props = { ...createValidServiceProps(), requiredSkills: ['A'.repeat(51)] }
      const result = Service.create(props)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('must not exceed 50 characters')
    })

    it('should fail if more than 10 required skills', () => {
      const skills = Array.from({ length: 11 }, (_, i) => `Skill ${i + 1}`)
      const props = { ...createValidServiceProps(), requiredSkills: skills }
      const result = Service.create(props)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Cannot have more than 10 required skills')
    })

    it('should emit ServiceCreatedEvent', () => {
      const props = createValidServiceProps()
      const result = Service.create(props)

      expect(result.isSuccess).toBe(true)
      expect(result.value.domainEvents).toHaveLength(1)
      expect(result.value.domainEvents[0]).toBeInstanceOf(ServiceCreatedEvent)
    })
  })

  describe('updateInfo', () => {
    let service: Service

    beforeEach(() => {
      service = Service.create(createValidServiceProps()).value
      service.clearEvents()
    })

    it('should update name', () => {
      const result = service.updateInfo({ name: 'New Haircut Style' })

      expect(result.isSuccess).toBe(true)
      expect(service.name).toBe('New Haircut Style')
    })

    it('should update description', () => {
      const result = service.updateInfo({ description: 'New description for the service' })

      expect(result.isSuccess).toBe(true)
      expect(service.description).toBe('New description for the service')
    })

    it('should update category', () => {
      const result = service.updateInfo({ category: ServiceCategory.STYLING })

      expect(result.isSuccess).toBe(true)
      expect(service.category).toBe(ServiceCategory.STYLING)
    })

    it('should update multiple fields at once', () => {
      const result = service.updateInfo({
        name: 'Premium Cut',
        description: 'Premium haircut service',
        category: ServiceCategory.STYLING
      })

      expect(result.isSuccess).toBe(true)
      expect(service.name).toBe('Premium Cut')
      expect(service.description).toBe('Premium haircut service')
      expect(service.category).toBe(ServiceCategory.STYLING)
    })

    it('should trim name whitespace', () => {
      const result = service.updateInfo({ name: '  Trimmed Name  ' })

      expect(result.isSuccess).toBe(true)
      expect(service.name).toBe('Trimmed Name')
    })

    it('should fail if name is empty', () => {
      const result = service.updateInfo({ name: '' })

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('name is required')
    })

    it('should fail if name is less than 3 characters', () => {
      const result = service.updateInfo({ name: 'AB' })

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('must be at least 3 characters')
    })

    it('should fail if name exceeds 100 characters', () => {
      const result = service.updateInfo({ name: 'A'.repeat(101) })

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('must not exceed 100 characters')
    })

    it('should fail if description is empty', () => {
      const result = service.updateInfo({ description: '' })

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('description is required')
    })

    it('should fail if description is less than 10 characters', () => {
      const result = service.updateInfo({ description: 'Short' })

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('must be at least 10 characters')
    })

    it('should fail if description exceeds 500 characters', () => {
      const result = service.updateInfo({ description: 'A'.repeat(501) })

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('must not exceed 500 characters')
    })

    it('should emit ServiceUpdatedEvent', () => {
      const result = service.updateInfo({ name: 'Updated Name' })

      expect(result.isSuccess).toBe(true)
      expect(service.domainEvents).toHaveLength(1)
      expect(service.domainEvents[0]).toBeInstanceOf(ServiceUpdatedEvent)
    })

    it('should not emit event if no changes', () => {
      const result = service.updateInfo({})

      expect(result.isSuccess).toBe(true)
      expect(service.domainEvents).toHaveLength(0)
    })

    it('should update updatedAt timestamp', async () => {
      const oldUpdatedAt = service.updatedAt
      await new Promise(resolve => setTimeout(resolve, 10))
      const result = service.updateInfo({ name: 'New Name' })

      expect(result.isSuccess).toBe(true)
      expect(service.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime())
    })
  })

  describe('updatePrice', () => {
    let service: Service

    beforeEach(() => {
      service = Service.create(createValidServiceProps()).value
      service.clearEvents()
    })

    it('should update price', () => {
      const newPrice = Money.create(30, Currency.USD).value
      const result = service.updatePrice(newPrice)

      expect(result.isSuccess).toBe(true)
      expect(service.price.amount).toBe(30)
    })

    it('should fail if currency changes', () => {
      const newPrice = Money.create(30, Currency.EUR).value
      const result = service.updatePrice(newPrice)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Cannot change currency')
    })

    it('should emit ServicePriceUpdatedEvent', () => {
      const newPrice = Money.create(30, Currency.USD).value
      const result = service.updatePrice(newPrice)

      expect(result.isSuccess).toBe(true)
      expect(service.domainEvents).toHaveLength(1)
      expect(service.domainEvents[0]).toBeInstanceOf(ServicePriceUpdatedEvent)
    })

    it('should update updatedAt timestamp', async () => {
      const oldUpdatedAt = service.updatedAt
      await new Promise(resolve => setTimeout(resolve, 10))
      const newPrice = Money.create(30, Currency.USD).value
      const result = service.updatePrice(newPrice)

      expect(result.isSuccess).toBe(true)
      expect(service.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime())
    })
  })

  describe('updateDuration', () => {
    let service: Service

    beforeEach(() => {
      service = Service.create(createValidServiceProps()).value
      service.clearEvents()
    })

    it('should update duration', () => {
      const newDuration = Duration.create(45).value
      const result = service.updateDuration(newDuration)

      expect(result.isSuccess).toBe(true)
      expect(service.duration.minutes).toBe(45)
    })

    it('should emit ServiceDurationUpdatedEvent', () => {
      const newDuration = Duration.create(45).value
      const result = service.updateDuration(newDuration)

      expect(result.isSuccess).toBe(true)
      expect(service.domainEvents).toHaveLength(1)
      expect(service.domainEvents[0]).toBeInstanceOf(ServiceDurationUpdatedEvent)
    })

    it('should update updatedAt timestamp', async () => {
      const oldUpdatedAt = service.updatedAt
      await new Promise(resolve => setTimeout(resolve, 10))
      const newDuration = Duration.create(45).value
      const result = service.updateDuration(newDuration)

      expect(result.isSuccess).toBe(true)
      expect(service.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime())
    })
  })

  describe('addRequiredSkill', () => {
    let service: Service

    beforeEach(() => {
      service = Service.create(createValidServiceProps()).value
      service.clearEvents()
    })

    it('should add required skill', () => {
      const result = service.addRequiredSkill('Fading')

      expect(result.isSuccess).toBe(true)
      expect(service.requiredSkills).toContain('Fading')
    })

    it('should trim skill whitespace', () => {
      const result = service.addRequiredSkill('  Fading  ')

      expect(result.isSuccess).toBe(true)
      expect(service.requiredSkills).toContain('Fading')
    })

    it('should fail if skill is empty', () => {
      const result = service.addRequiredSkill('')

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Skill cannot be empty')
    })

    it('should fail if skill is only whitespace', () => {
      const result = service.addRequiredSkill('   ')

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Skill cannot be empty')
    })

    it('should fail if skill exceeds 50 characters', () => {
      const result = service.addRequiredSkill('A'.repeat(51))

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('must not exceed 50 characters')
    })

    it('should fail if skill already exists', () => {
      service.addRequiredSkill('Fading')
      const result = service.addRequiredSkill('Fading')

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Skill already exists')
    })

    it('should fail if max 10 skills reached', () => {
      for (let i = 0; i < 10; i++) {
        service.addRequiredSkill(`Skill ${i + 1}`)
      }
      const result = service.addRequiredSkill('Extra Skill')

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Cannot have more than 10 required skills')
    })

    it('should emit ServiceUpdatedEvent', () => {
      const result = service.addRequiredSkill('Fading')

      expect(result.isSuccess).toBe(true)
      expect(service.domainEvents).toHaveLength(1)
      expect(service.domainEvents[0]).toBeInstanceOf(ServiceUpdatedEvent)
    })

    it('should update updatedAt timestamp', async () => {
      const oldUpdatedAt = service.updatedAt
      await new Promise(resolve => setTimeout(resolve, 10))
      const result = service.addRequiredSkill('Fading')

      expect(result.isSuccess).toBe(true)
      expect(service.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime())
    })
  })

  describe('removeRequiredSkill', () => {
    let service: Service

    beforeEach(() => {
      const props = { ...createValidServiceProps(), requiredSkills: ['Fading', 'Clipper work'] }
      service = Service.create(props).value
      service.clearEvents()
    })

    it('should remove required skill', () => {
      const result = service.removeRequiredSkill('Fading')

      expect(result.isSuccess).toBe(true)
      expect(service.requiredSkills).not.toContain('Fading')
      expect(service.requiredSkills).toContain('Clipper work')
    })

    it('should fail if skill not found', () => {
      const result = service.removeRequiredSkill('Non-existent')

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Skill not found')
    })

    it('should emit ServiceUpdatedEvent', () => {
      const result = service.removeRequiredSkill('Fading')

      expect(result.isSuccess).toBe(true)
      expect(service.domainEvents).toHaveLength(1)
      expect(service.domainEvents[0]).toBeInstanceOf(ServiceUpdatedEvent)
    })

    it('should update updatedAt timestamp', async () => {
      const oldUpdatedAt = service.updatedAt
      await new Promise(resolve => setTimeout(resolve, 10))
      const result = service.removeRequiredSkill('Fading')

      expect(result.isSuccess).toBe(true)
      expect(service.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime())
    })
  })

  describe('requiresSkill', () => {
    let service: Service

    beforeEach(() => {
      const props = { ...createValidServiceProps(), requiredSkills: ['Fading', 'Clipper work'] }
      service = Service.create(props).value
    })

    it('should return true if skill required', () => {
      expect(service.requiresSkill('Fading')).toBe(true)
    })

    it('should return false if skill not required', () => {
      expect(service.requiresSkill('Coloring')).toBe(false)
    })

    it('should trim skill whitespace', () => {
      expect(service.requiresSkill('  Fading  ')).toBe(true)
    })
  })

  describe('activate', () => {
    let service: Service

    beforeEach(() => {
      service = Service.create(createValidServiceProps()).value
      service.deactivate()
      service.clearEvents()
    })

    it('should activate service', () => {
      const result = service.activate()

      expect(result.isSuccess).toBe(true)
      expect(service.isActive).toBe(true)
    })

    it('should do nothing if already active', () => {
      service.activate()
      service.clearEvents()

      const result = service.activate()

      expect(result.isSuccess).toBe(true)
      expect(service.domainEvents).toHaveLength(0)
    })

    it('should emit ServiceActivatedEvent', () => {
      const result = service.activate()

      expect(result.isSuccess).toBe(true)
      expect(service.domainEvents).toHaveLength(1)
      expect(service.domainEvents[0]).toBeInstanceOf(ServiceActivatedEvent)
    })

    it('should update updatedAt timestamp', async () => {
      const oldUpdatedAt = service.updatedAt
      await new Promise(resolve => setTimeout(resolve, 10))
      const result = service.activate()

      expect(result.isSuccess).toBe(true)
      expect(service.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime())
    })
  })

  describe('deactivate', () => {
    let service: Service

    beforeEach(() => {
      service = Service.create(createValidServiceProps()).value
      service.clearEvents()
    })

    it('should deactivate service', () => {
      const result = service.deactivate()

      expect(result.isSuccess).toBe(true)
      expect(service.isActive).toBe(false)
    })

    it('should do nothing if already inactive', () => {
      service.deactivate()
      service.clearEvents()

      const result = service.deactivate()

      expect(result.isSuccess).toBe(true)
      expect(service.domainEvents).toHaveLength(0)
    })

    it('should emit ServiceDeactivatedEvent', () => {
      const result = service.deactivate()

      expect(result.isSuccess).toBe(true)
      expect(service.domainEvents).toHaveLength(1)
      expect(service.domainEvents[0]).toBeInstanceOf(ServiceDeactivatedEvent)
    })

    it('should update updatedAt timestamp', async () => {
      const oldUpdatedAt = service.updatedAt
      await new Promise(resolve => setTimeout(resolve, 10))
      const result = service.deactivate()

      expect(result.isSuccess).toBe(true)
      expect(service.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime())
    })
  })

  describe('immutability', () => {
    it('should return read-only array of required skills', () => {
      const props = { ...createValidServiceProps(), requiredSkills: ['Fading'] }
      const service = Service.create(props).value

      const skills = service.requiredSkills
      expect(() => {
        (skills as any).push('New Skill')
      }).toThrow()
    })
  })
})
