import { ICacheService, CacheKeys } from '@barbershop/domain/services/cache.service.interface'

/**
 * Cache TTL Constants (in seconds)
 */
export const CacheTTL = {
  /** Barber availability: 1 hour */
  BARBER_AVAILABILITY: 60 * 60,

  /** Service availability: 1 hour */
  SERVICE_AVAILABILITY: 60 * 60,

  /** Barber schedule: 24 hours */
  BARBER_SCHEDULE: 60 * 60 * 24,

  /** Active services: 6 hours */
  ACTIVE_SERVICES: 60 * 60 * 6,

  /** Service details: 12 hours */
  SERVICE_DETAILS: 60 * 60 * 12,

  /** Top rated barbers: 1 hour */
  TOP_RATED_BARBERS: 60 * 60,

  /** Barber details: 6 hours */
  BARBER_DETAILS: 60 * 60 * 6,

  /** Client details: 1 hour */
  CLIENT_DETAILS: 60 * 60
} as const

/**
 * Available Slot Interface
 */
export interface AvailableSlot {
  startTime: string // ISO string
  endTime: string // ISO string
  available: boolean
}

/**
 * Cache Strategy for Barber Availability
 *
 * Responsibilities:
 * - Cache available time slots for barbers
 * - Invalidate cache when appointments are created/modified
 * - Handle cache misses gracefully
 */
export class BarberAvailabilityCacheStrategy {
  constructor(private readonly cache: ICacheService) {}

  /**
   * Get cached availability for a barber on a specific date
   *
   * @param barberId - Barber identifier
   * @param date - Date in YYYY-MM-DD format
   * @returns Cached slots or null if not cached
   */
  async get(barberId: string, date: string): Promise<AvailableSlot[] | null> {
    const key = CacheKeys.barberAvailability(barberId, date)
    return this.cache.get<AvailableSlot[]>(key)
  }

  /**
   * Cache availability for a barber on a specific date
   *
   * @param barberId - Barber identifier
   * @param date - Date in YYYY-MM-DD format
   * @param slots - Available slots
   */
  async set(barberId: string, date: string, slots: AvailableSlot[]): Promise<void> {
    const key = CacheKeys.barberAvailability(barberId, date)
    await this.cache.set(key, slots, CacheTTL.BARBER_AVAILABILITY)
  }

  /**
   * Invalidate cached availability for a barber
   * Should be called when:
   * - Appointment is created
   * - Appointment is cancelled
   * - Barber schedule is updated
   *
   * @param barberId - Barber identifier
   */
  async invalidate(barberId: string): Promise<void> {
    const pattern = CacheKeys.barberAvailabilityPattern(barberId)
    await this.cache.deletePattern(pattern)
  }

  /**
   * Invalidate cached availability for a specific date
   *
   * @param barberId - Barber identifier
   * @param date - Date in YYYY-MM-DD format
   */
  async invalidateDate(barberId: string, date: string): Promise<void> {
    const key = CacheKeys.barberAvailability(barberId, date)
    await this.cache.delete(key)
  }
}

/**
 * Cache Strategy for Service Availability
 *
 * Responsibilities:
 * - Cache available barbers for a service
 * - Invalidate when barber availability changes
 */
export class ServiceAvailabilityCacheStrategy {
  constructor(private readonly cache: ICacheService) {}

  /**
   * Get cached availability for a service on a specific date
   *
   * @param serviceId - Service identifier
   * @param date - Date in YYYY-MM-DD format
   * @returns Cached barber IDs or null if not cached
   */
  async get(serviceId: string, date: string): Promise<string[] | null> {
    const key = CacheKeys.serviceAvailability(serviceId, date)
    return this.cache.get<string[]>(key)
  }

  /**
   * Cache available barbers for a service on a specific date
   *
   * @param serviceId - Service identifier
   * @param date - Date in YYYY-MM-DD format
   * @param barberIds - Available barber IDs
   */
  async set(serviceId: string, date: string, barberIds: string[]): Promise<void> {
    const key = CacheKeys.serviceAvailability(serviceId, date)
    await this.cache.set(key, barberIds, CacheTTL.SERVICE_AVAILABILITY)
  }

  /**
   * Invalidate all cached service availability
   * Should be called when barber schedules change globally
   */
  async invalidateAll(): Promise<void> {
    await this.cache.deletePattern('availability:service:*')
  }
}

/**
 * Cache Strategy for Barber Schedule
 *
 * Responsibilities:
 * - Cache barber working hours
 * - Invalidate when schedule is updated
 */
export class BarberScheduleCacheStrategy {
  constructor(private readonly cache: ICacheService) {}

  /**
   * Get cached schedule for a barber
   *
   * @param barberId - Barber identifier
   * @returns Cached schedule or null if not cached
   */
  async get(barberId: string): Promise<any | null> {
    const key = CacheKeys.barberSchedule(barberId)
    return this.cache.get(key)
  }

  /**
   * Cache schedule for a barber
   *
   * @param barberId - Barber identifier
   * @param schedule - Barber schedule
   */
  async set(barberId: string, schedule: any): Promise<void> {
    const key = CacheKeys.barberSchedule(barberId)
    await this.cache.set(key, schedule, CacheTTL.BARBER_SCHEDULE)
  }

  /**
   * Invalidate cached schedule for a barber
   *
   * @param barberId - Barber identifier
   */
  async invalidate(barberId: string): Promise<void> {
    const key = CacheKeys.barberSchedule(barberId)
    await this.cache.delete(key)
  }
}

/**
 * Cache Strategy for Services
 *
 * Responsibilities:
 * - Cache active services list
 * - Cache individual service details
 * - Invalidate when services are updated
 */
export class ServiceCacheStrategy {
  constructor(private readonly cache: ICacheService) {}

  /**
   * Get cached active services
   *
   * @returns Cached services or null if not cached
   */
  async getActiveServices(): Promise<any[] | null> {
    const key = CacheKeys.activeServices()
    return this.cache.get<any[]>(key)
  }

  /**
   * Cache active services
   *
   * @param services - Active services
   */
  async setActiveServices(services: any[]): Promise<void> {
    const key = CacheKeys.activeServices()
    await this.cache.set(key, services, CacheTTL.ACTIVE_SERVICES)
  }

  /**
   * Get cached service details
   *
   * @param serviceId - Service identifier
   * @returns Cached service or null if not cached
   */
  async getService(serviceId: string): Promise<any | null> {
    const key = CacheKeys.service(serviceId)
    return this.cache.get(key)
  }

  /**
   * Cache service details
   *
   * @param serviceId - Service identifier
   * @param service - Service data
   */
  async setService(serviceId: string, service: any): Promise<void> {
    const key = CacheKeys.service(serviceId)
    await this.cache.set(key, service, CacheTTL.SERVICE_DETAILS)
  }

  /**
   * Invalidate all service caches
   * Should be called when services are created/updated/deleted
   */
  async invalidateAll(): Promise<void> {
    await this.cache.deletePattern('service:*')
    await this.cache.deletePattern('services:*')
  }

  /**
   * Invalidate specific service cache
   *
   * @param serviceId - Service identifier
   */
  async invalidate(serviceId: string): Promise<void> {
    const key = CacheKeys.service(serviceId)
    await this.cache.delete(key)
    // Also invalidate active services list
    await this.cache.delete(CacheKeys.activeServices())
  }
}

/**
 * Cache Strategy for Barbers
 *
 * Responsibilities:
 * - Cache barber details
 * - Cache top rated barbers
 * - Invalidate when barber info changes
 */
export class BarberCacheStrategy {
  constructor(private readonly cache: ICacheService) {}

  /**
   * Get cached barber details
   *
   * @param barberId - Barber identifier
   * @returns Cached barber or null if not cached
   */
  async getBarber(barberId: string): Promise<any | null> {
    const key = CacheKeys.barber(barberId)
    return this.cache.get(key)
  }

  /**
   * Cache barber details
   *
   * @param barberId - Barber identifier
   * @param barber - Barber data
   */
  async setBarber(barberId: string, barber: any): Promise<void> {
    const key = CacheKeys.barber(barberId)
    await this.cache.set(key, barber, CacheTTL.BARBER_DETAILS)
  }

  /**
   * Get cached top rated barbers
   *
   * @param limit - Number of barbers to retrieve
   * @returns Cached barbers or null if not cached
   */
  async getTopRated(limit: number): Promise<any[] | null> {
    const key = CacheKeys.topRatedBarbers(limit)
    return this.cache.get<any[]>(key)
  }

  /**
   * Cache top rated barbers
   *
   * @param limit - Number of barbers
   * @param barbers - Top rated barbers
   */
  async setTopRated(limit: number, barbers: any[]): Promise<void> {
    const key = CacheKeys.topRatedBarbers(limit)
    await this.cache.set(key, barbers, CacheTTL.TOP_RATED_BARBERS)
  }

  /**
   * Invalidate barber cache
   *
   * @param barberId - Barber identifier
   */
  async invalidate(barberId: string): Promise<void> {
    const key = CacheKeys.barber(barberId)
    await this.cache.delete(key)
    // Also invalidate top rated lists
    await this.cache.deletePattern('barbers:top-rated:*')
  }

  /**
   * Invalidate all barber caches
   */
  async invalidateAll(): Promise<void> {
    await this.cache.deletePattern('barber:*')
    await this.cache.deletePattern('barbers:*')
  }
}
