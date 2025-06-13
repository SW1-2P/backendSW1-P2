import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DatabaseTestService } from './database-test.service';

@ApiTags('Database Test')
@Controller('admin/database-test')
export class DatabaseTestController {
  constructor(private readonly databaseTestService: DatabaseTestService) {}

  @Get('connection')
  @ApiOperation({ summary: 'Probar conexión a la base de datos y verificar tablas' })
  @ApiResponse({ status: 200, description: 'Estado de la conexión y tablas' })
  async testConnection() {
    return await this.databaseTestService.testDatabaseConnection();
  }

  @Post('seed')
  @ApiOperation({ summary: 'Crear datos de prueba básicos' })
  @ApiResponse({ status: 201, description: 'Datos de prueba creados' })
  async createTestData() {
    return await this.databaseTestService.createTestData();
  }
} 