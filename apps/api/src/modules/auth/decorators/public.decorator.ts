import { SetMetadata } from '@nestjs/common'

/**
 * Metadata key for public routes
 */
export const IS_PUBLIC_KEY = 'isPublic'

/**
 * Public Decorator
 *
 * Marks a route as public (no authentication required)
 * Use on routes that should be accessible without JWT token
 *
 * @example
 * ```typescript
 * @Public()
 * @Get('health')
 * getHealth() {
 *   return { status: 'ok' }
 * }
 * ```
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)
