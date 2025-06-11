import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Usuario } from '../usuarios/entities/usuario.entity';
import { MobileApp, ProjectType } from './entities/mobile-app.entity';
import { CreateMobileAppDto } from './dto/create-mobile-app.dto';
import { UpdateMobileAppDto } from './dto/update-mobile-app.dto';
import { GeneratorFactory } from './generators/generator.factory';
import { MockupIntegrationService } from './services/mockup-integration.service';
import { GenerationContext } from './interfaces/generator.interface';

@Injectable()
export class MobileGeneratorService {
  private readonly logger = new Logger(MobileGeneratorService.name);

  constructor(
    @InjectRepository(MobileApp)
    private mobileAppRepository: Repository<MobileApp>,
    private readonly generatorFactory: GeneratorFactory,
    private readonly mockupService: MockupIntegrationService,
  ) {}

  // CRUD Operations
  async create(createMobileAppDto: CreateMobileAppDto): Promise<MobileApp> {
    // Validar que al menos uno de xml, prompt o mockup_id esté presente
    if (!createMobileAppDto.xml && !createMobileAppDto.prompt && !createMobileAppDto.mockup_id) {
      throw new Error('Debe proporcionar XML, prompt o mockup_id para crear la aplicación');
    }

    // Validar tipo de proyecto
    const projectType = createMobileAppDto.project_type || ProjectType.FLUTTER;
    if (!this.generatorFactory.isSupported(projectType)) {
      throw new Error(`Tipo de proyecto no soportado: ${projectType}`);
    }

    // Generar nombre automáticamente si no se proporciona
    const nombre = createMobileAppDto.nombre || this.generateAppName(
      createMobileAppDto.xml || createMobileAppDto.prompt || 'mobile-app'
    );

    const mobileApp = this.mobileAppRepository.create({
      ...createMobileAppDto,
      nombre,
      project_type: projectType,
    });
    
    return await this.mobileAppRepository.save(mobileApp);
  }

  async findAllByUserId(userId: string): Promise<MobileApp[]> {
    return await this.mobileAppRepository.find({
      where: { user_id: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<MobileApp> {
    const mobileApp = await this.mobileAppRepository.findOne({ where: { id } });
    if (!mobileApp) {
      throw new NotFoundException(`Aplicación móvil con ID ${id} no encontrada`);
    }
    return mobileApp;
  }

  async update(id: string, updateMobileAppDto: UpdateMobileAppDto): Promise<MobileApp> {
    const mobileApp = await this.findOne(id);
    Object.assign(mobileApp, updateMobileAppDto);
    return await this.mobileAppRepository.save(mobileApp);
  }

  async remove(id: string): Promise<void> {
    const mobileApp = await this.findOne(id);
    await this.mobileAppRepository.remove(mobileApp);
  }

  // Método principal para generar proyecto (Flutter o Angular)
  async generateProject(id: string, usuario?: Usuario): Promise<Buffer> {
    const mobileApp = await this.findOne(id);
    
    // Verificar que el usuario tenga permisos
    if (usuario && mobileApp.user_id !== usuario.id) {
      throw new Error('No tiene permisos para generar esta aplicación');
    }

    try {
      // Crear contexto de generación
      const context = await this.createGenerationContext(mobileApp, usuario);
      
      // Obtener el generador apropiado
      const generator = this.generatorFactory.createGenerator(mobileApp.project_type);
      
      // Generar proyecto
      return await generator.generateProject(context);
      
    } catch (error) {
      this.logger.error(`Error generando proyecto ${mobileApp.project_type}:`, error);
      throw new InternalServerErrorException(`Error generando proyecto ${mobileApp.project_type}`);
    }
  }

  // Método para crear contexto de generación
  private async createGenerationContext(mobileApp: MobileApp, usuario?: Usuario): Promise<GenerationContext> {
    const context: GenerationContext = {
      projectType: mobileApp.project_type,
      xml: mobileApp.xml,
      prompt: mobileApp.prompt,
      config: mobileApp.config,
      usuario,
    };

    // Si tiene mockup_id, obtener datos del mockup
    if (mobileApp.mockup_id) {
      try {
        const mockupData = await this.mockupService.getMockupData(mobileApp.mockup_id, usuario?.id);
        
        if (this.mockupService.validateMockupForGeneration(mockupData)) {
          context.mockupData = await this.mockupService.processMockupForGeneration(mockupData);
          
          // Si no hay XML, generar uno del mockup
          if (!context.xml) {
            context.xml = this.mockupService.generateXmlFromMockup(mockupData);
          }
        } else {
          this.logger.warn(`Mockup ${mobileApp.mockup_id} no es válido para generación`);
        }
      } catch (error) {
        this.logger.error(`Error obteniendo mockup ${mobileApp.mockup_id}:`, error);
        // Continuar sin mockup
      }
    }

    return context;
  }

  private generateAppName(input: string): string {
    try {
      if (input.includes('name=')) {
        const match = input.match(/name="([^"]+)"/);
        if (match) {
          return match[1].replace(/\s+/g, '_').toLowerCase();
        }
      }
      return `mobile_app_${Date.now()}`;
    } catch {
      return `mobile_app_${Date.now()}`;
    }
  }

  // Método de compatibilidad para Flutter (mantener para no romper el controller)
  async generateFlutterProject(id: string, usuario?: Usuario): Promise<Buffer> {
    this.logger.debug(`Iniciando generación Flutter para app ID: ${id}`);
    
    const mobileApp = await this.findOne(id);
    this.logger.debug(`App encontrada: ${mobileApp.nombre}, tipo: ${mobileApp.project_type}`);
    
    // Si no es Flutter, actualizar a Flutter
    if (mobileApp.project_type !== ProjectType.FLUTTER) {
      this.logger.debug(`Cambiando tipo de proyecto de ${mobileApp.project_type} a Flutter`);
      mobileApp.project_type = ProjectType.FLUTTER;
      await this.mobileAppRepository.save(mobileApp);
    }
    
    return this.generateProject(id, usuario);
  }

} 