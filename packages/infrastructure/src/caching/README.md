# Redis Cache Service

Implementación de servicio de caché usando Redis para mejorar el rendimiento del sistema de barbería.

## Estructura

```
caching/
├── redis-cache.service.ts    # Implementación Redis de ICacheService
├── cache-strategies.ts        # Estrategias de caché especializadas
├── index.ts                   # Exports
└── README.md                  # Esta documentación
```

## Uso Básico

### 1. Crear instancia de RedisCacheService

```typescript
import { createRedisCacheService } from '@barbershop/infrastructure'

const cacheService = createRedisCacheService({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: 0,
  keyPrefix: 'barbershop:'
})
```

### 2. Operaciones básicas

```typescript
// Set
await cacheService.set('user:123', { name: 'John' }, 3600) // TTL: 1 hora

// Get
const user = await cacheService.get<User>('user:123')

// Delete
await cacheService.delete('user:123')

// Delete by pattern
await cacheService.deletePattern('user:*')

// Check existence
const exists = await cacheService.exists('user:123')

// Health check
const isHealthy = await cacheService.healthCheck()
```

## Estrategias de Caché

### Barber Availability Cache

Cachea slots de tiempo disponibles para barberos.

```typescript
import { BarberAvailabilityCacheStrategy } from '@barbershop/infrastructure'

const strategy = new BarberAvailabilityCacheStrategy(cacheService)

// Get cached availability
const slots = await strategy.get('barber-123', '2025-10-30')

// Cache availability
await strategy.set('barber-123', '2025-10-30', [
  { startTime: '09:00', endTime: '09:30', available: true },
  { startTime: '09:30', endTime: '10:00', available: false }
])

// Invalidate when appointment is created/cancelled
await strategy.invalidate('barber-123')
```

**TTL**: 1 hora

**Invalidación**:
- Al crear appointment
- Al cancelar appointment
- Al actualizar horario del barbero

### Service Availability Cache

Cachea barberos disponibles para un servicio.

```typescript
import { ServiceAvailabilityCacheStrategy } from '@barbershop/infrastructure'

const strategy = new ServiceAvailabilityCacheStrategy(cacheService)

// Get cached barbers for service
const barberIds = await strategy.get('service-456', '2025-10-30')

// Cache available barbers
await strategy.set('service-456', '2025-10-30', ['barber-123', 'barber-456'])

// Invalidate all service availability
await strategy.invalidateAll()
```

**TTL**: 1 hora

**Invalidación**:
- Al actualizar horarios de barberos globalmente

### Barber Schedule Cache

Cachea horarios de trabajo de barberos.

```typescript
import { BarberScheduleCacheStrategy } from '@barbershop/infrastructure'

const strategy = new BarberScheduleCacheStrategy(cacheService)

// Get cached schedule
const schedule = await strategy.get('barber-123')

// Cache schedule
await strategy.set('barber-123', {
  monday: { start: '09:00', end: '18:00', available: true },
  tuesday: { start: '09:00', end: '18:00', available: true }
})

// Invalidate when schedule changes
await strategy.invalidate('barber-123')
```

**TTL**: 24 horas

**Invalidación**:
- Al actualizar horario del barbero

### Service Cache

Cachea servicios activos y detalles de servicios.

```typescript
import { ServiceCacheStrategy } from '@barbershop/infrastructure'

const strategy = new ServiceCacheStrategy(cacheService)

// Get cached active services
const services = await strategy.getActiveServices()

// Cache active services
await strategy.setActiveServices([...services])

// Get cached service details
const service = await strategy.getService('service-123')

// Cache service details
await strategy.setService('service-123', service)

// Invalidate specific service
await strategy.invalidate('service-123')

// Invalidate all services
await strategy.invalidateAll()
```

**TTL**:
- Active services: 6 horas
- Service details: 12 horas

**Invalidación**:
- Al crear/actualizar/eliminar servicio

### Barber Cache

Cachea detalles de barberos y rankings.

```typescript
import { BarberCacheStrategy } from '@barbershop/infrastructure'

const strategy = new BarberCacheStrategy(cacheService)

// Get cached barber
const barber = await strategy.getBarber('barber-123')

// Cache barber
await strategy.setBarber('barber-123', barber)

// Get top rated barbers
const topBarbers = await strategy.getTopRated(10)

// Cache top rated barbers
await strategy.setTopRated(10, topBarbers)

// Invalidate barber
await strategy.invalidate('barber-123')

// Invalidate all barbers
await strategy.invalidateAll()
```

**TTL**:
- Barber details: 6 horas
- Top rated barbers: 1 hora

**Invalidación**:
- Al actualizar información del barbero
- Al actualizar rating del barbero

## Cache Keys

Se usa la clase `CacheKeys` del dominio para construir claves consistentes:

```typescript
import { CacheKeys } from '@barbershop/domain'

// Barber availability
const key = CacheKeys.barberAvailability('barber-123', '2025-10-30')
// → "availability:barber:barber-123:2025-10-30"

// Barber availability pattern
const pattern = CacheKeys.barberAvailabilityPattern('barber-123')
// → "availability:barber:barber-123:*"

// Service availability
const key = CacheKeys.serviceAvailability('service-456', '2025-10-30')
// → "availability:service:service-456:2025-10-30"

// Barber schedule
const key = CacheKeys.barberSchedule('barber-123')
// → "schedule:barber:barber-123"

// Active services
const key = CacheKeys.activeServices()
// → "services:active"

// Service by ID
const key = CacheKeys.service('service-123')
// → "service:service-123"

// Top rated barbers
const key = CacheKeys.topRatedBarbers(10)
// → "barbers:top-rated:10"

// Barber by ID
const key = CacheKeys.barber('barber-123')
// → "barber:barber-123"
```

## TTL Constants

```typescript
import { CacheTTL } from '@barbershop/infrastructure'

CacheTTL.BARBER_AVAILABILITY    // 1 hour
CacheTTL.SERVICE_AVAILABILITY   // 1 hour
CacheTTL.BARBER_SCHEDULE        // 24 hours
CacheTTL.ACTIVE_SERVICES        // 6 hours
CacheTTL.SERVICE_DETAILS        // 12 hours
CacheTTL.TOP_RATED_BARBERS      // 1 hour
CacheTTL.BARBER_DETAILS         // 6 hours
CacheTTL.CLIENT_DETAILS         // 1 hour
```

## Configuración de Redis

### Desarrollo (Docker Compose)

```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
```

### Producción (DigitalOcean)

```typescript
const cacheService = createRedisCacheService({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
  db: 0,
  keyPrefix: 'barbershop:prod:'
})
```

## Patrones de Invalidación

### 1. Write-Through Cache

Actualiza cache inmediatamente después de escribir en DB:

```typescript
// Create appointment
const appointment = await appointmentRepository.save(appointment)

// Invalidate barber availability
await barberAvailabilityStrategy.invalidate(appointment.barberId)
```

### 2. Cache-Aside (Lazy Loading)

Lee del cache, si no está, lee de DB y cachea:

```typescript
// Try cache first
let slots = await barberAvailabilityStrategy.get(barberId, date)

if (!slots) {
  // Cache miss - fetch from DB
  slots = await calculateAvailability(barberId, date)

  // Store in cache
  await barberAvailabilityStrategy.set(barberId, date, slots)
}

return slots
```

### 3. Time-based Invalidation

Cache expira automáticamente después del TTL:

```typescript
// Set with TTL
await cacheService.set(key, value, CacheTTL.BARBER_AVAILABILITY)

// Cache will expire after 1 hour automatically
```

## Monitoreo

### Health Check

```typescript
const isHealthy = await cacheService.healthCheck()

if (!isHealthy) {
  console.error('Redis is not responding!')
  // Fallback to direct DB queries
}
```

### Cache Hit Rate

Implementar métricas personalizadas:

```typescript
let cacheHits = 0
let cacheMisses = 0

const value = await cacheService.get(key)

if (value) {
  cacheHits++
} else {
  cacheMisses++
}

const hitRate = cacheHits / (cacheHits + cacheMisses)
console.log(`Cache hit rate: ${(hitRate * 100).toFixed(2)}%`)
```

## Best Practices

### 1. Siempre usar CacheKeys para construir claves

✅ **Correcto**:
```typescript
const key = CacheKeys.barber(barberId)
```

❌ **Incorrecto**:
```typescript
const key = `barber:${barberId}` // No consistente
```

### 2. Invalidar cache al modificar datos

```typescript
// After updating barber
await barberRepository.save(barber)
await barberCacheStrategy.invalidate(barber.id)
await barberAvailabilityStrategy.invalidate(barber.id)
```

### 3. Usar TTL apropiado según tipo de dato

- Datos que cambian frecuentemente: TTL corto (1 hora)
- Datos estables: TTL largo (24 horas)
- Datos críticos: Sin caché o TTL muy corto

### 4. Manejar errores de Redis gracefully

```typescript
try {
  const value = await cacheService.get(key)
  if (value) return value
} catch (error) {
  console.error('Cache error:', error)
  // Continue without cache
}

// Fetch from DB as fallback
return await repository.findById(id)
```

### 5. Usar patrones de invalidación consistentes

```typescript
// When appointment is created/cancelled/updated
await barberAvailabilityStrategy.invalidate(appointment.barberId)
await serviceAvailabilityStrategy.invalidateAll()
```

## Troubleshooting

### Redis no conecta

```bash
# Check Redis is running
docker ps | grep redis

# Check Redis logs
docker logs <redis-container-id>

# Test connection
redis-cli ping
```

### Cache no invalida correctamente

```bash
# Check keys in Redis
redis-cli KEYS "barbershop:*"

# Delete specific pattern
redis-cli DEL "barbershop:availability:*"

# Flush all (use with caution!)
redis-cli FLUSHDB
```

### Alto uso de memoria

```bash
# Check memory usage
redis-cli INFO memory

# Set max memory
redis-cli CONFIG SET maxmemory 256mb
redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

## Referencias

- [Redis Commands](https://redis.io/commands/)
- [ioredis Documentation](https://github.com/redis/ioredis)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)
