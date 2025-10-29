/**
 * Cache Service Interface
 *
 * Defines the contract for caching operations.
 * Implementation will be in infrastructure layer using Redis.
 *
 * Purpose: Improve performance by caching frequently accessed data
 */
export interface ICacheService {
  /**
   * Get a value from cache
   *
   * @param key - Cache key
   * @returns Cached value or null if not found
   */
  get<T>(key: string): Promise<T | null>

  /**
   * Set a value in cache
   *
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in seconds (optional)
   */
  set<T>(key: string, value: T, ttl?: number): Promise<void>

  /**
   * Delete a value from cache
   *
   * @param key - Cache key
   */
  delete(key: string): Promise<void>

  /**
   * Delete multiple values matching a pattern
   *
   * @param pattern - Key pattern (e.g., "barber:*")
   */
  deletePattern(pattern: string): Promise<void>

  /**
   * Check if a key exists in cache
   *
   * @param key - Cache key
   * @returns True if exists, false otherwise
   */
  exists(key: string): Promise<boolean>

  /**
   * Set expiration time for a key
   *
   * @param key - Cache key
   * @param ttl - Time to live in seconds
   */
  expire(key: string, ttl: number): Promise<void>

  /**
   * Get remaining TTL for a key
   *
   * @param key - Cache key
   * @returns Remaining TTL in seconds, -1 if no expiration, -2 if key doesn't exist
   */
  ttl(key: string): Promise<number>

  /**
   * Clear all cache
   * Use with caution!
   */
  flush(): Promise<void>
}

/**
 * Cache Key Builder
 * Utility to build consistent cache keys
 */
export class CacheKeys {
  /**
   * Barber availability cache key
   * Format: availability:barber:{barberId}:{date}
   */
  static barberAvailability(barberId: string, date: string): string {
    return `availability:barber:${barberId}:${date}`
  }

  /**
   * All barber availability keys pattern
   */
  static barberAvailabilityPattern(barberId: string): string {
    return `availability:barber:${barberId}:*`
  }

  /**
   * Service availability cache key
   * Format: availability:service:{serviceId}:{date}
   */
  static serviceAvailability(serviceId: string, date: string): string {
    return `availability:service:${serviceId}:${date}`
  }

  /**
   * Barber schedule cache key
   * Format: schedule:barber:{barberId}
   */
  static barberSchedule(barberId: string): string {
    return `schedule:barber:${barberId}`
  }

  /**
   * Active services cache key
   * Format: services:active
   */
  static activeServices(): string {
    return 'services:active'
  }

  /**
   * Service by ID cache key
   * Format: service:{serviceId}
   */
  static service(serviceId: string): string {
    return `service:${serviceId}`
  }

  /**
   * Top rated barbers cache key
   * Format: barbers:top-rated:{limit}
   */
  static topRatedBarbers(limit: number): string {
    return `barbers:top-rated:${limit}`
  }

  /**
   * Barber by ID cache key
   * Format: barber:{barberId}
   */
  static barber(barberId: string): string {
    return `barber:${barberId}`
  }

  /**
   * Client by ID cache key
   * Format: client:{clientId}
   */
  static client(clientId: string): string {
    return `client:${clientId}`
  }
}
