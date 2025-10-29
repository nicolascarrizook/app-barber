/**
 * Service Types
 * Type definitions for barbershop services
 */

export type ServiceCategory = 'HAIRCUT' | 'BEARD' | 'COMBO' | 'TREATMENT' | 'OTHER'

export interface Service {
  id: string
  name: string
  description: string
  duration: number // in minutes
  price: number // in cents
  category: ServiceCategory
  isActive: boolean
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

export interface ServiceFilters {
  category?: ServiceCategory
  search?: string
  minPrice?: number
  maxPrice?: number
}

export interface CreateServiceRequest {
  name: string
  description: string
  duration: number
  price: number
  category: ServiceCategory
  imageUrl?: string
}

export interface UpdateServiceRequest extends Partial<CreateServiceRequest> {
  isActive?: boolean
}
