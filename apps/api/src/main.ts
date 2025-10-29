import { NestFactory } from '@nestjs/core'
import { ValidationPipe, VersioningType } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import helmet from 'helmet'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true
  })

  // Get configuration
  const configService = app.get(ConfigService)
  const port = configService.get<number>('API_PORT', 3000)
  const apiPrefix = configService.get<string>('API_PREFIX', 'api')

  // Use Winston logger
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER))

  // Security
  app.use(helmet())

  // CORS
  app.enableCors({
    origin: configService
      .get<string>('CORS_ORIGIN', 'http://localhost:3001')
      .split(','),
    credentials: true
  })

  // Global prefix
  app.setGlobalPrefix(apiPrefix)

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1'
  })

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties exist
      transform: true, // Transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true // Convert primitive types automatically
      },
      disableErrorMessages: configService.get('NODE_ENV') === 'production'
    })
  )

  // Swagger documentation
  if (configService.get('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Barbershop API')
      .setDescription('Professional barbershop management system REST API')
      .setVersion('1.0')
      .addTag('auth', 'Authentication endpoints')
      .addTag('appointments', 'Appointment management')
      .addTag('barbers', 'Barber management')
      .addTag('clients', 'Client management')
      .addTag('services', 'Service catalog')
      .addTag('availability', 'Availability checking')
      .addBearerAuth()
      .build()

    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
      swaggerOptions: {
        persistAuthorization: true
      }
    })
  }

  await app.listen(port)

  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER)
  logger.log(`🚀 Application is running on: http://localhost:${port}/${apiPrefix}`)
  logger.log(`📚 Swagger docs available at: http://localhost:${port}/${apiPrefix}/docs`)
}

bootstrap()
