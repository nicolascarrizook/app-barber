import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { AuthService } from '../auth.service'

/**
 * JWT Payload Structure
 *
 * This is the data structure stored in JWT tokens
 * Keep minimal to reduce token size
 */
export interface JwtPayload {
  sub: string // User ID (subject)
  email: string
  role: 'CLIENT' | 'BARBER' | 'ADMIN' | 'MANAGER'
  type: 'access' | 'refresh'
  iat?: number // Issued at (seconds)
  exp?: number // Expiration (seconds)
}

/**
 * JWT Strategy
 *
 * Validates JWT tokens and extracts user information
 * Integrates with Passport.js for authentication
 *
 * @extends PassportStrategy
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')
    })
  }

  /**
   * Validate JWT payload
   *
   * Called automatically by Passport after JWT verification
   * Return value is attached to request.user
   *
   * @param payload - Decoded JWT payload
   * @returns User object to attach to request
   */
  async validate(payload: JwtPayload) {
    // Only allow access tokens for authentication
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type')
    }

    // Validate user still exists and is active
    const user = await this.authService.validateUser(payload.sub)

    if (!user) {
      throw new UnauthorizedException('User not found or inactive')
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role
    }
  }
}
