import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from '../decorators/roles.decorator'

/**
 * User Role Types
 */
export type Role = 'CLIENT' | 'BARBER' | 'ADMIN'

/**
 * Roles Guard
 *
 * Enforces role-based access control (RBAC)
 * Works in conjunction with @Roles() decorator
 *
 * @implements CanActivate
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Check if user has required role
   *
   * @param context - Execution context
   * @returns boolean - Can activate route
   */
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ])

    if (!requiredRoles) {
      return true // No roles required
    }

    const { user } = context.switchToHttp().getRequest()

    if (!user) {
      return false // No user authenticated
    }

    return requiredRoles.some(role => user.role === role)
  }
}
