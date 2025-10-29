import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'

import { LoginDto, RegisterDto, AuthResponseDto, RefreshTokenDto } from './dto'

/**
 * User Role enum
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  BARBER = 'BARBER',
  CLIENT = 'CLIENT'
}

/**
 * User interface for authentication
 */
export interface User {
  userId: string
  email: string
  name: string
  role: UserRole
  passwordHash: string
  isActive: boolean
  createdAt: Date
}

/**
 * JWT Payload interface
 */
export interface JwtPayload {
  sub: string // userId
  email: string
  role: UserRole
  type: 'access' | 'refresh'
}

/**
 * Authentication Service
 *
 * Handles user authentication, registration, and JWT token management
 *
 * Responsibilities:
 * - User login with email/password
 * - User registration
 * - JWT token generation (access + refresh)
 * - Token refresh
 * - Password hashing and verification
 * - User logout
 */
@Injectable()
export class AuthService {
  // In-memory user store (replace with database in production)
  private users: Map<string, User> = new Map()
  // In-memory refresh token store (replace with Redis in production)
  private refreshTokens: Map<string, string> = new Map()

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {
    // Create default admin user for testing
    this.createDefaultUsers()
  }

  /**
   * User login
   *
   * @param loginDto - Email and password
   * @returns JWT tokens and user info
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto

    // Find user by email
    const user = Array.from(this.users.values()).find((u) => u.email === email)

    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive')
    }

    // Generate tokens
    const tokens = await this.generateTokens(user)

    // Store refresh token
    this.refreshTokens.set(user.userId, tokens.refreshToken)

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        role: user.role
      }
    }
  }

  /**
   * User registration
   *
   * @param registerDto - Registration data
   * @returns JWT tokens and user info
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, name, role } = registerDto

    // Check if user already exists
    const existingUser = Array.from(this.users.values()).find((u) => u.email === email)

    if (existingUser) {
      throw new ConflictException('User with this email already exists')
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create new user
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const user: User = {
      userId,
      email,
      name,
      role: role || UserRole.CLIENT,
      passwordHash,
      isActive: true,
      createdAt: new Date()
    }

    // Store user
    this.users.set(userId, user)

    // Generate tokens
    const tokens = await this.generateTokens(user)

    // Store refresh token
    this.refreshTokens.set(userId, tokens.refreshToken)

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        role: user.role
      }
    }
  }

  /**
   * Refresh access token
   *
   * @param refreshTokenDto - Refresh token
   * @returns New access token
   */
  async refresh(refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    const { refreshToken } = refreshTokenDto

    try {
      // Verify refresh token
      const payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET')
      })

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type')
      }

      // Check if refresh token is stored
      const storedToken = this.refreshTokens.get(payload.sub)

      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token')
      }

      // Get user
      const user = this.users.get(payload.sub)

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive')
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user)

      // Update refresh token
      this.refreshTokens.set(user.userId, tokens.refreshToken)

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          userId: user.userId,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token')
    }
  }

  /**
   * User logout
   *
   * @param userId - User ID
   */
  async logout(userId: string): Promise<void> {
    // Remove refresh token
    this.refreshTokens.delete(userId)
  }

  /**
   * Validate user by ID (used by JWT strategy)
   *
   * @param userId - User ID
   * @returns User or null
   */
  async validateUser(userId: string): Promise<User | null> {
    const user = this.users.get(userId)

    if (!user || !user.isActive) {
      return null
    }

    return user
  }

  /**
   * Generate access and refresh tokens
   *
   * @param user - User
   * @returns Access and refresh tokens
   */
  private async generateTokens(
    user: User
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessPayload: JwtPayload = {
      sub: user.userId,
      email: user.email,
      role: user.role,
      type: 'access'
    }

    const refreshPayload: JwtPayload = {
      sub: user.userId,
      email: user.email,
      role: user.role,
      type: 'refresh'
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        expiresIn: this.configService.get<string>('JWT_EXPIRATION', '7d')
      }),
      this.jwtService.signAsync(refreshPayload, {
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '30d')
      })
    ])

    return { accessToken, refreshToken }
  }

  /**
   * Create default users for testing
   */
  private createDefaultUsers(): void {
    const defaultUsers = [
      {
        userId: 'admin_1',
        email: 'admin@barbershop.com',
        name: 'Admin User',
        role: UserRole.ADMIN,
        password: 'admin123'
      },
      {
        userId: 'barber_1',
        email: 'barber@barbershop.com',
        name: 'John Barber',
        role: UserRole.BARBER,
        password: 'barber123'
      },
      {
        userId: 'client_1',
        email: 'client@barbershop.com',
        name: 'Client User',
        role: UserRole.CLIENT,
        password: 'client123'
      }
    ]

    defaultUsers.forEach(async (defaultUser) => {
      const passwordHash = await bcrypt.hash(defaultUser.password, 10)

      const user: User = {
        userId: defaultUser.userId,
        email: defaultUser.email,
        name: defaultUser.name,
        role: defaultUser.role,
        passwordHash,
        isActive: true,
        createdAt: new Date()
      }

      this.users.set(user.userId, user)
    })
  }
}
