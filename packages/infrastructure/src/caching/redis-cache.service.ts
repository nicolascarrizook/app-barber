import { ICacheService } from '@barbershop/domain/services/cache.service.interface'
import Redis from 'ioredis'

/**
 * Redis implementation of ICacheService
 *
 * Responsibilities:
 * - Provide fast in-memory caching using Redis
 * - Handle serialization/deserialization of cached data
 * - Implement TTL (Time To Live) for cache entries
 * - Support pattern-based cache invalidation
 * - Handle Redis connection errors gracefully
 *
 * Clean Architecture: Infrastructure layer implementing domain service interface
 */
export class RedisCacheService implements ICacheService {
  private readonly redis: Redis

  constructor(redis: Redis) {
    this.redis = redis

    // Handle Redis connection errors
    this.redis.on('error', (err) => {
      console.error('Redis connection error:', err)
    })

    this.redis.on('connect', () => {
      console.log('✅ Connected to Redis')
    })
  }

  /**
   * Get a value from cache
   *
   * @param key - Cache key
   * @returns Cached value or null if not found/expired
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key)

      if (!value) {
        return null
      }

      return JSON.parse(value) as T
    } catch (error) {
      console.error(`Error getting cache key ${key}:`, error)
      return null
    }
  }

  /**
   * Set a value in cache
   *
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in seconds (default: no expiration)
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value)

      if (ttl) {
        // Set with expiration
        await this.redis.setex(key, ttl, serialized)
      } else {
        // Set without expiration
        await this.redis.set(key, serialized)
      }
    } catch (error) {
      console.error(`Error setting cache key ${key}:`, error)
      throw error
    }
  }

  /**
   * Delete a value from cache
   *
   * @param key - Cache key
   */
  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key)
    } catch (error) {
      console.error(`Error deleting cache key ${key}:`, error)
      throw error
    }
  }

  /**
   * Delete multiple values matching a pattern
   *
   * @param pattern - Key pattern (e.g., "barber:*")
   */
  async deletePattern(pattern: string): Promise<void> {
    try {
      // Find all keys matching the pattern
      const keys = await this.redis.keys(pattern)

      if (keys.length === 0) {
        return
      }

      // Delete all matching keys
      await this.redis.del(...keys)
    } catch (error) {
      console.error(`Error deleting cache pattern ${pattern}:`, error)
      throw error
    }
  }

  /**
   * Check if a key exists in cache
   *
   * @param key - Cache key
   * @returns True if exists, false otherwise
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key)
      return result === 1
    } catch (error) {
      console.error(`Error checking cache key ${key}:`, error)
      return false
    }
  }

  /**
   * Set expiration time for a key
   *
   * @param key - Cache key
   * @param ttl - Time to live in seconds
   */
  async expire(key: string, ttl: number): Promise<void> {
    try {
      await this.redis.expire(key, ttl)
    } catch (error) {
      console.error(`Error setting expiration for cache key ${key}:`, error)
      throw error
    }
  }

  /**
   * Get remaining TTL for a key
   *
   * @param key - Cache key
   * @returns Remaining TTL in seconds, -1 if no expiration, -2 if key doesn't exist
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.redis.ttl(key)
    } catch (error) {
      console.error(`Error getting TTL for cache key ${key}:`, error)
      return -2
    }
  }

  /**
   * Clear all cache
   * Use with caution - this will clear ALL keys in the Redis database!
   */
  async flush(): Promise<void> {
    try {
      await this.redis.flushdb()
    } catch (error) {
      console.error('Error flushing cache:', error)
      throw error
    }
  }

  /**
   * Close Redis connection
   * Should be called when shutting down the application
   */
  async disconnect(): Promise<void> {
    try {
      await this.redis.quit()
      console.log('✅ Disconnected from Redis')
    } catch (error) {
      console.error('Error disconnecting from Redis:', error)
      throw error
    }
  }

  /**
   * Get Redis health status
   *
   * @returns True if Redis is connected and responding, false otherwise
   */
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.redis.ping()
      return result === 'PONG'
    } catch (error) {
      console.error('Redis health check failed:', error)
      return false
    }
  }
}

/**
 * Create Redis Cache Service instance
 *
 * @param config - Redis configuration
 * @returns RedisCacheService instance
 */
export function createRedisCacheService(config: {
  host?: string
  port?: number
  password?: string
  db?: number
  keyPrefix?: string
}): RedisCacheService {
  const redis = new Redis({
    host: config.host || 'localhost',
    port: config.port || 6379,
    password: config.password,
    db: config.db || 0,
    keyPrefix: config.keyPrefix || 'barbershop:',
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000)
      return delay
    },
    maxRetriesPerRequest: 3
  })

  return new RedisCacheService(redis)
}
