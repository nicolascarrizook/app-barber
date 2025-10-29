/**
 * Barber Types
 * Type definitions for barber profiles and availability
 */

export type BarberStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE'

export interface Barber {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  photoUrl?: string
  bio?: string
  specialties: string[]
  yearsOfExperience: number
  rating: number
  reviewCount: number
  status: BarberStatus
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface BarberFilters {
  specialty?: string
  search?: string
  available?: boolean
  minRating?: number
}

export interface BarberWithAvailability extends Barber {
  nextAvailableSlot?: string
  availableToday: boolean
}

export interface CreateBarberRequest {
  firstName: string
  lastName: string
  email: string
  phone: string
  photoUrl?: string
  bio?: string
  specialties: string[]
  yearsOfExperience: number
}

export interface UpdateBarberRequest extends Partial<CreateBarberRequest> {
  isActive?: boolean
  status?: BarberStatus
}
