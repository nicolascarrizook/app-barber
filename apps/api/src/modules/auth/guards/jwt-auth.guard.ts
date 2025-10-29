import { Injectable, ExecutionContext } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Reflector } from '@nestjs/core'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'

/**
 * JWT Authentication Guard
 *
 * Protects routes by requiring valid JWT token
 * Respects @Public() decorator for public endpoints
 *
 * @extends AuthGuard
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super()
  }

  /**
   * Check if route can be activated
   *
   * Allows access if:
   * 1. Route is marked @Public()
   * 2. Valid JWT token is present
   *
   * @param context - Execution context
   * @returns Promise<boolean> Can activate route
   */
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ])

    if (isPublic) {
      return true
    }

    return super.canActivate(context)
  }
}
