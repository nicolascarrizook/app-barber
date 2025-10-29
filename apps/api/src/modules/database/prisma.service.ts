import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' }
      ]
    })

    // Log queries in development
    if (process.env.NODE_ENV === 'development') {
      this.$on('query' as never, (e: any) => {
        this.logger.debug(`Query: ${e.query}`)
        this.logger.debug(`Duration: ${e.duration}ms`)
      })
    }

    // Log errors
    this.$on('error' as never, (e: any) => {
      this.logger.error(e)
    })
  }

  async onModuleInit() {
    await this.$connect()
    this.logger.log('📦 Prisma Client connected to database')
  }

  async onModuleDestroy() {
    await this.$disconnect()
    this.logger.log('📦 Prisma Client disconnected from database')
  }

  /**
   * Clean database for testing
   */
  async cleanDatabase() {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('cleanDatabase() can only be called in test environment')
    }

    // Get all model names
    const models = Reflect.ownKeys(this).filter(
      (key) => typeof key === 'string' && key[0] !== '_' && key[0] !== '$'
    )

    // Delete all records from all models
    return Promise.all(
      models.map((modelKey) => {
        const model = this[modelKey as keyof this]
        if (model && typeof model === 'object' && 'deleteMany' in model) {
          return (model as any).deleteMany()
        }
      })
    )
  }
}
