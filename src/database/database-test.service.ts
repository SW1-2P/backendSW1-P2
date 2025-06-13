import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Diagrama } from '../diagramas/entities/diagrama.entity';
import { Mockup } from '../mockups/entities/mockup.entity';
import { MobileApp } from '../mobile-generator/entities/mobile-app.entity';

/**
 * Servicio para probar la conexión a la base de datos y verificar el estado de las tablas
 */
@Injectable()
export class DatabaseTestService {
  private readonly logger = new Logger(DatabaseTestService.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Diagrama)
    private readonly diagramaRepository: Repository<Diagrama>,
    @InjectRepository(Mockup)
    private readonly mockupRepository: Repository<Mockup>,
    @InjectRepository(MobileApp)
    private readonly mobileAppRepository: Repository<MobileApp>,
  ) {}

  /**
   * Verifica la conexión a la base de datos y el estado de las tablas
   */
  async testDatabaseConnection(): Promise<any> {
    try {
      this.logger.log('🔍 Iniciando prueba de conexión a la base de datos...');
      
      // Verificar conexión
      const isConnected = this.dataSource.isInitialized;
      this.logger.log(`📡 Estado de conexión: ${isConnected ? '✅ Conectado' : '❌ Desconectado'}`);

      if (!isConnected) {
        return {
          success: false,
          message: 'Base de datos no conectada',
          connection: false,
        };
      }

      // Verificar tablas existentes
      const queryRunner = this.dataSource.createQueryRunner();
      const tables = await queryRunner.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      const tableNames = tables.map((table: any) => table.table_name);
      this.logger.log(`📋 Tablas encontradas: ${tableNames.join(', ')}`);

      // Verificar cada entidad
      const entityTests = await Promise.allSettled([
        this.testEntityTable('Usuario', this.usuarioRepository),
        this.testEntityTable('Diagrama', this.diagramaRepository),
        this.testEntityTable('Mockup', this.mockupRepository),
        this.testEntityTable('MobileApp', this.mobileAppRepository),
      ]);

      await queryRunner.release();

      const results = {
        success: true,
        connection: true,
        tablesFound: tableNames,
        expectedTables: ['usuario', 'diagrama', 'mockup', 'mobile_app'],
        entityTests: entityTests.map((result, index) => ({
          entity: ['Usuario', 'Diagrama', 'Mockup', 'MobileApp'][index],
          status: result.status,
          value: result.status === 'fulfilled' ? result.value : result.reason,
        })),
      };

      this.logger.log('✅ Prueba de base de datos completada');
      return results;

    } catch (error) {
      this.logger.error('❌ Error en la prueba de base de datos:', error);
      return {
        success: false,
        message: 'Error al probar la base de datos',
        error: error.message,
      };
    }
  }

  /**
   * Prueba una entidad específica
   */
  private async testEntityTable(entityName: string, repository: Repository<any>): Promise<any> {
    try {
      const count = await repository.count();
      this.logger.log(`🏷️  ${entityName}: ${count} registros encontrados`);
      
      return {
        entity: entityName,
        success: true,
        count,
        message: `Tabla ${entityName} disponible`,
      };
    } catch (error) {
      this.logger.error(`❌ Error en ${entityName}:`, error.message);
      return {
        entity: entityName,
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Crea datos de prueba básicos
   */
  async createTestData(): Promise<any> {
    try {
      this.logger.log('🌱 Creando datos de prueba...');

      // Verificar si ya existe un usuario de prueba
      const existingUser = await this.usuarioRepository.findOne({
        where: { email: 'test@example.com' }
      });

      if (existingUser) {
        this.logger.log('👤 Usuario de prueba ya existe');
        return {
          success: true,
          message: 'Datos de prueba ya existen',
          user: existingUser,
        };
      }

      // Crear usuario de prueba
      const testUser = this.usuarioRepository.create({
        nombre: 'Usuario de Prueba',
        email: 'test@example.com',
        password: '$2b$10$hashedPassword', // Password: test123
        rol: 'admin' as any,
      });

      const savedUser = await this.usuarioRepository.save(testUser);
      this.logger.log('✅ Usuario de prueba creado');

      return {
        success: true,
        message: 'Datos de prueba creados exitosamente',
        user: savedUser,
      };

    } catch (error) {
      this.logger.error('❌ Error creando datos de prueba:', error);
      return {
        success: false,
        message: 'Error al crear datos de prueba',
        error: error.message,
      };
    }
  }
} 