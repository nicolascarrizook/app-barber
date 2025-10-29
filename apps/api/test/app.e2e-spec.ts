import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'

describe('AppController (e2e)', () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = moduleFixture.createNestApplication()

    // Apply the same configuration as main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true
      })
    )

    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  describe('/ (GET)', () => {
    it('should return API information', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('name')
          expect(res.body).toHaveProperty('version')
          expect(res.body).toHaveProperty('description')
          expect(res.body.name).toBe('Barbershop API')
        })
    })
  })

  describe('/health (GET)', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok')
          expect(res.body).toHaveProperty('timestamp')
          expect(res.body).toHaveProperty('uptime')
        })
    })
  })
})
