/**
 * Services API Client
 * API utilities for service operations
 */

import type { Service, ServiceFilters } from '@/types/service'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

/**
 * Fetch all services with optional filters
 */
export async function getServices(filters?: ServiceFilters): Promise<Service[]> {
  const params = new URLSearchParams()

  if (filters?.category) {
    params.append('category', filters.category)
  }

  if (filters?.search) {
    params.append('search', filters.search)
  }

  if (filters?.minPrice !== undefined) {
    params.append('minPrice', filters.minPrice.toString())
  }

  if (filters?.maxPrice !== undefined) {
    params.append('maxPrice', filters.maxPrice.toString())
  }

  const url = `${API_BASE_URL}/services${params.toString() ? `?${params.toString()}` : ''}`

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json'
    },
    cache: 'no-store'
  })

  if (!response.ok) {
    throw new Error('Failed to fetch services')
  }

  return response.json() as Promise<Service[]>
}

/**
 * Fetch a single service by ID
 */
export async function getServiceById(id: string): Promise<Service> {
  const response = await fetch(`${API_BASE_URL}/services/${id}`, {
    headers: {
      'Content-Type': 'application/json'
    },
    cache: 'no-store'
  })

  if (!response.ok) {
    throw new Error('Failed to fetch service')
  }

  return response.json() as Promise<Service>
}

/**
 * Format price from cents to currency string
 */
export function formatPrice(priceInCents: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0
  }).format(priceInCents / 100)
}

/**
 * Format duration to human-readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours}h`
  }

  return `${hours}h ${remainingMinutes}min`
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: string): string {
  const categoryNames: Record<string, string> = {
    HAIRCUT: 'Corte de Cabello',
    BEARD: 'Barba',
    COMBO: 'Combo',
    TREATMENT: 'Tratamiento',
    OTHER: 'Otros'
  }

  return categoryNames[category] || category
}
