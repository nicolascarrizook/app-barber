import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getApiInfo() {
    return {
      name: 'Barbershop API',
      version: '1.0.0',
      description: 'Professional barbershop management system',
      environment: this.configService.get('NODE_ENV'),
      documentation: `${this.configService.get('API_URL')}/${this.configService.get('API_PREFIX')}/docs`
    }
  }

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: this.configService.get('NODE_ENV')
    }
  }
}
