/**
 * Barbers API Client
 * API utilities for barber operations
 */

import type { Barber, BarberFilters } from '@/types/barber'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

/**
 * Fetch all barbers with optional filters
 */
export async function getBarbers(filters?: BarberFilters): Promise<Barber[]> {
  const params = new URLSearchParams()

  if (filters?.specialty) {
    params.append('specialty', filters.specialty)
  }

  if (filters?.search) {
    params.append('search', filters.search)
  }

  if (filters?.available !== undefined) {
    params.append('available', filters.available.toString())
  }

  if (filters?.minRating !== undefined) {
    params.append('minRating', filters.minRating.toString())
  }

  const url = `${API_BASE_URL}/barbers${params.toString() ? `?${params.toString()}` : ''}`

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json'
    },
    cache: 'no-store'
  })

  if (!response.ok) {
    throw new Error('Failed to fetch barbers')
  }

  return response.json() as Promise<Barber[]>
}

/**
 * Fetch a single barber by ID
 */
export async function getBarberById(id: string): Promise<Barber> {
  const response = await fetch(`${API_BASE_URL}/barbers/${id}`, {
    headers: {
      'Content-Type': 'application/json'
    },
    cache: 'no-store'
  })

  if (!response.ok) {
    throw new Error('Failed to fetch barber')
  }

  return response.json() as Promise<Barber>
}

/**
 * Get full barber name
 */
export function getBarberFullName(barber: Barber): string {
  return `${barber.firstName} ${barber.lastName}`
}

/**
 * Get barber initials for avatar fallback
 */
export function getBarberInitials(barber: Barber): string {
  return `${barber.firstName[0]}${barber.lastName[0]}`.toUpperCase()
}

/**
 * Format years of experience
 */
export function formatExperience(years: number): string {
  if (years === 0) {
    return 'Nuevo'
  }
  if (years === 1) {
    return '1 año de experiencia'
  }
  return `${years} años de experiencia`
}

/**
 * Get status display info
 */
export function getStatusInfo(status: string): {
  label: string
  color: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
} {
  switch (status) {
    case 'AVAILABLE':
      return {
        label: 'Disponible',
        color: 'text-green-600',
        variant: 'default'
      }
    case 'BUSY':
      return {
        label: 'Ocupado',
        color: 'text-orange-600',
        variant: 'secondary'
      }
    case 'OFFLINE':
      return {
        label: 'No disponible',
        color: 'text-gray-600',
        variant: 'outline'
      }
    default:
      return {
        label: status,
        color: 'text-gray-600',
        variant: 'outline'
      }
  }
}

/**
 * Format rating display
 */
export function formatRating(rating: number): string {
  return rating.toFixed(1)
}
