import { SetMetadata } from '@nestjs/common'
import { Role } from '../guards/roles.guard'

/**
 * Metadata key for required roles
 */
export const ROLES_KEY = 'roles'

/**
 * Roles Decorator
 *
 * Specifies which roles are allowed to access a route
 * Must be used with RolesGuard
 *
 * @param roles - Array of allowed roles
 * @example
 * ```typescript
 * @Roles('ADMIN', 'BARBER')
 * @Get('sensitive-data')
 * getSensitiveData() {
 *   return { data: '...' }
 * }
 * ```
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles)
