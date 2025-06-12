import { Controller, Post, Body, Res, HttpStatus, UseGuards, Get, Param, Delete, Patch } from '@nestjs/common';
import { MobileGeneratorService } from './mobile-generator.service';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CreateMobileAppDto } from './dto/create-mobile-app.dto';
import { UpdateMobileAppDto } from './dto/update-mobile-app.dto';
import { CreateFromPromptDto } from './dto/create-from-prompt.dto';
import { AnalyzeImageDto } from './dto/analyze-image.dto';
import { ImageAnalysisService } from './services/image-analysis.service';

@ApiTags('Mobile Generator')
@Controller('mobile-generator')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MobileGeneratorController {
  constructor(
    private readonly mobileGeneratorService: MobileGeneratorService,
    private readonly imageAnalysisService: ImageAnalysisService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear y almacenar una nueva aplicación móvil desde XML o mockup' })
  @ApiResponse({ status: 201, description: 'Aplicación móvil creada correctamente' })
  create(@Body() createMobileAppDto: CreateMobileAppDto, @GetUser() usuario: Usuario) {
    // Asegurar que el usuario actual sea el propietario
    createMobileAppDto.user_id = usuario.id;
    return this.mobileGeneratorService.create(createMobileAppDto);
  }

  @Post('from-prompt')
  @ApiOperation({ summary: 'Crear aplicación móvil desde descripción de texto (con enriquecimiento automático)' })
  @ApiResponse({ status: 201, description: 'Aplicación móvil creada desde prompt enriquecido' })
  @ApiBody({
    type: CreateFromPromptDto,
    description: 'Datos para crear aplicación desde prompt',
    examples: {
      basico: {
        summary: 'Prompt básico',
        value: {
          prompt: 'crea una app móvil de gestión contable'
        }
      },
      detallado: {
        summary: 'Prompt detallado',
        value: {
          prompt: 'crea una aplicación móvil de gestión contable con login, formularios de transacciones, reportes financieros, dashboard con gráficos y categorización de gastos',
          nombre: 'ContaApp Pro',
          project_type: 'flutter'
        }
      }
    }
  })
  createFromPrompt(@Body() createFromPromptDto: CreateFromPromptDto, @GetUser() usuario: Usuario) {
    return this.mobileGeneratorService.createFromPrompt(createFromPromptDto, usuario.id);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las aplicaciones móviles del usuario actual' })
  @ApiResponse({ status: 200, description: 'Lista de aplicaciones móviles' })
  findAll(@GetUser() usuario: Usuario) {
    return this.mobileGeneratorService.findAllByUserId(usuario.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una aplicación móvil por ID' })
  @ApiResponse({ status: 200, description: 'Aplicación móvil encontrada' })
  @ApiResponse({ status: 404, description: 'Aplicación móvil no encontrada' })
  findOne(@Param('id') id: string) {
    return this.mobileGeneratorService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una aplicación móvil' })
  @ApiResponse({ status: 200, description: 'Aplicación móvil actualizada' })
  @ApiResponse({ status: 404, description: 'Aplicación móvil no encontrada' })
  update(@Param('id') id: string, @Body() updateMobileAppDto: UpdateMobileAppDto) {
    return this.mobileGeneratorService.update(id, updateMobileAppDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una aplicación móvil' })
  @ApiResponse({ status: 200, description: 'Aplicación móvil eliminada' })
  @ApiResponse({ status: 404, description: 'Aplicación móvil no encontrada' })
  remove(@Param('id') id: string) {
    return this.mobileGeneratorService.remove(id);
  }

  @Post(':id/generate')
  @ApiOperation({ summary: 'Generar proyecto (Flutter o Angular) desde una aplicación móvil guardada' })
  @ApiResponse({ status: 200, description: 'Proyecto generado como ZIP' })
  @ApiResponse({ status: 404, description: 'Aplicación móvil no encontrada' })
  async generateProject(
    @Param('id') id: string,
    @GetUser() usuario: Usuario,
    @Res() res: Response,
  ) {
    try {
      const zipBuffer = await this.mobileGeneratorService.generateProject(id, usuario);
      const mobileApp = await this.mobileGeneratorService.findOne(id);
      
      const filename = `${mobileApp.project_type}-project-${mobileApp.nombre}.zip`;

      res.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename=${filename}`,
      });

      res.status(HttpStatus.OK).send(zipBuffer);
    } catch (error) {
      console.error('Error generando proyecto:', error);
      
      // Enviar error 500 en lugar de 400 para errores internos
      const statusCode = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
        message: error.message || 'Error generando proyecto',
        error: 'Internal Server Error',
        statusCode: statusCode,
      });
    }
  }

  @Post(':id/generate-flutter')
  @ApiOperation({ summary: 'Generar proyecto Flutter (método de compatibilidad)' })
  @ApiResponse({ status: 200, description: 'Proyecto Flutter generado como ZIP' })
  @ApiResponse({ status: 404, description: 'Aplicación móvil no encontrada' })
  async generateFlutterProject(
    @Param('id') id: string,
    @GetUser() usuario: Usuario,
    @Res() res: Response,
  ) {
    try {
      const zipBuffer = await this.mobileGeneratorService.generateFlutterProject(id, usuario);
      const mobileApp = await this.mobileGeneratorService.findOne(id);
      
      const filename = `flutter-project-${mobileApp.nombre}.zip`;

      res.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename=${filename}`,
      });

      res.status(HttpStatus.OK).send(zipBuffer);
    } catch (error) {
      console.error('Error generando proyecto Flutter:', error);
      
      // Enviar error 500 en lugar de 400 para errores internos
      const statusCode = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
        message: error.message || 'Error generando proyecto Flutter',
        error: 'Internal Server Error',
        statusCode: statusCode,
      });
    }
  }

  @Post('analyze-image')
  @ApiOperation({ summary: 'Analizar imagen para generar descripción de aplicación móvil' })
  @ApiResponse({ status: 200, description: 'Imagen analizada correctamente' })
  @ApiResponse({ status: 400, description: 'Imagen no válida o error en el análisis' })
  @ApiBody({
    type: AnalyzeImageDto,
    description: 'Imagen en base64 para analizar',
    examples: {
      ejemplo: {
        summary: 'Análisis de imagen',
        value: {
          image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...',
          projectType: 'flutter'
        }
      }
    }
  })
  async analyzeImage(@Body() analyzeImageDto: AnalyzeImageDto) {
    // Validar imagen
    const validation = this.imageAnalysisService.validateImageData(analyzeImageDto.image);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error
      };
    }

    // Analizar imagen
    const result = await this.imageAnalysisService.analyzeImageForProject(
      analyzeImageDto.image,
      analyzeImageDto.projectType
    );

    return result;
  }
} 