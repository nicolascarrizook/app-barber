import { createParamDecorator, ExecutionContext } from '@nestjs/common'

/**
 * User Interface
 *
 * Represents authenticated user attached to request
 */
export interface User {
  userId: string
  email: string
  role: 'CLIENT' | 'BARBER' | 'ADMIN'
}

/**
 * GetUser Decorator
 *
 * Extracts authenticated user from request object
 * Returns user object populated by JWT strategy
 *
 * @example
 * ```typescript
 * @Get('profile')
 * getProfile(@GetUser() user: User) {
 *   return { userId: user.userId, email: user.email }
 * }
 * ```
 *
 * @example Get specific property
 * ```typescript
 * @Get('my-id')
 * getMyId(@GetUser('userId') userId: string) {
 *   return { id: userId }
 * }
 * ```
 */
export const GetUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext): User | string => {
    const request = ctx.switchToHttp().getRequest()
    const user = request.user

    return data ? user?.[data] : user
  }
)
