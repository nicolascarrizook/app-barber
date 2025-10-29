import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { AppService } from './app.service'

describe('AppService', () => {
  let service: AppService
  let configService: ConfigService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                NODE_ENV: 'test',
                API_URL: 'http://localhost:3000',
                API_PREFIX: 'api'
              }
              return config[key]
            })
          }
        }
      ]
    }).compile()

    service = module.get<AppService>(AppService)
    configService = module.get<ConfigService>(ConfigService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getApiInfo', () => {
    it('should return API information', () => {
      const result = service.getApiInfo()

      expect(result).toHaveProperty('name', 'Barbershop API')
      expect(result).toHaveProperty('version', '1.0.0')
      expect(result).toHaveProperty('description')
      expect(result).toHaveProperty('environment', 'test')
      expect(result).toHaveProperty('documentation')
    })
  })

  describe('getHealth', () => {
    it('should return health status', () => {
      const result = service.getHealth()

      expect(result).toHaveProperty('status', 'ok')
      expect(result).toHaveProperty('timestamp')
      expect(result).toHaveProperty('uptime')
      expect(result).toHaveProperty('environment', 'test')
    })

    it('should have valid timestamp', () => {
      const result = service.getHealth()
      const timestamp = new Date(result.timestamp)

      expect(timestamp).toBeInstanceOf(Date)
      expect(timestamp.getTime()).toBeLessThanOrEqual(Date.now())
    })

    it('should have positive uptime', () => {
      const result = service.getHealth()

      expect(result.uptime).toBeGreaterThan(0)
    })
  })
})
