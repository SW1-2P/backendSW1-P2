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
import { SetMetadata } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { ProjectType } from './entities/mobile-app.entity';

@ApiTags('Mobile Generator')
@Controller('mobile-generator')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MobileGeneratorController {
  private readonly logger = new Logger(MobileGeneratorController.name);

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
  @ApiOperation({ summary: 'Analizar imagen para generar descripción de aplicación móvil (endpoint público)' })
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

  @Post('create-general-app')
  @ApiOperation({ 
    summary: 'APARTADO GENERAL - Crear app automática desde prompt simple',
    description: 'Endpoint para generar apps automáticamente desde prompts simples con enriquecimiento de dominio automático'
  })
  @ApiResponse({ status: 201, description: 'App móvil general creada y almacenada correctamente' })
  @ApiBody({
    description: 'Prompt simple para generar app automáticamente',
    examples: {
      fitness: {
        summary: 'App de Fitness',
        value: {
          prompt: 'una app de gimnasio',
          nombre: 'MyGym App'
        }
      },
      educacion: {
        summary: 'App Educativa',
        value: {
          prompt: 'una app educativa',
          nombre: 'EduApp'
        }
      }
    }
  })
  async createGeneralApp(@Body() createGeneralAppDto: any, @GetUser() usuario: Usuario) {
    try {
      // FLUJO APARTADO GENERAL: Prompt simple → Enriquecimiento automático → App completa
      this.logger.debug(`📱 APARTADO GENERAL: Creando app desde "${createGeneralAppDto.prompt}"`);
      
      // Usar el método existente createFromPrompt que ya incluye enriquecimiento
      const createFromPromptDto: CreateFromPromptDto = {
        prompt: createGeneralAppDto.prompt,
        nombre: createGeneralAppDto.nombre || this.generateAppName(createGeneralAppDto.prompt),
        project_type: ProjectType.FLUTTER
      };
      
      const savedApp = await this.mobileGeneratorService.createFromPrompt(createFromPromptDto, usuario.id);
      
      this.logger.debug(`✅ App GENERAL creada: ${savedApp.nombre} (ID: ${savedApp.id})`);
      
      return {
        success: true,
        type: 'general_automatic',
        app: savedApp,
        enrichedPrompt: (savedApp.prompt || '').substring(0, 500) + '...',
        detectedDomain: this.extractDomainFromPrompt(savedApp.prompt || ''),
        totalPages: this.countPagesInPrompt(savedApp.prompt || ''),
        message: `App "${savedApp.nombre}" creada automáticamente con páginas específicas del dominio detectado`
      };
    } catch (error) {
      this.logger.error('Error en APARTADO GENERAL:', error);
      return {
        success: false,
        error: error.message || 'Error creando app general automática'
      };
    }
  }

  @Post('create-detailed-app')
  @ApiOperation({ 
    summary: 'APARTADO DETALLADO - Crear app desde prompt detallado',
    description: 'Endpoint para generar apps desde prompts detallados SIN enriquecimiento automático, el usuario especifica exactamente lo que quiere'
  })
  @ApiResponse({ status: 201, description: 'App móvil detallada creada desde prompt específico' })
  @ApiBody({
    description: 'Prompt detallado con especificaciones exactas',
    examples: {
      detallado: {
        summary: 'Prompt Detallado',
        value: {
          prompt: 'Crear una aplicación Flutter con las siguientes pantallas: 1. LoginScreen con email y password, 2. HomeScreen con dashboard y navegación, 3. ProfileScreen con edición de datos, 4. SettingsScreen con configuraciones. Usar Material Design 3, colores azul y blanco, navegación con BottomNavigationBar.',
          nombre: 'App Detallada',
          projectType: 'flutter'
        }
      }
    }
  })
  async createDetailedApp(@Body() createDetailedAppDto: any, @GetUser() usuario: Usuario) {
    try {
      // FLUJO APARTADO DETALLADO: Prompt detallado → Aplicar restricciones → Generación SIN enriquecimiento
      this.logger.debug(`🎯 APARTADO DETALLADO: Creando app desde prompt específico`);
      
      // Aplicar restricciones de Flutter para evitar errores comunes
      const restrictedPrompt = this.applyFlutterRestrictions(createDetailedAppDto.prompt);
      
      // Crear app directamente SIN enriquecimiento pero CON restricciones aplicadas
      const createMobileAppDto: CreateMobileAppDto = {
        xml: '', // No hay XML, se genera desde prompt
        prompt: restrictedPrompt, // Usar prompt con restricciones aplicadas
        nombre: createDetailedAppDto.nombre || 'App Detallada',
        project_type: ProjectType.FLUTTER,
        user_id: usuario.id
      };
      
      const savedApp = await this.mobileGeneratorService.create(createMobileAppDto);
      
      this.logger.debug(`✅ App DETALLADA creada: ${savedApp.nombre} (ID: ${savedApp.id})`);

      return {
        success: true,
        type: 'detailed_from_prompt',
        app: savedApp,
        originalPrompt: createDetailedAppDto.prompt.substring(0, 500) + '...',
        specifiedFeatures: this.extractFeaturesFromDetailedPrompt(createDetailedAppDto.prompt),
        totalPages: this.countPagesInPrompt(createDetailedAppDto.prompt),
        message: `App "${savedApp.nombre}" creada desde especificaciones detalladas del usuario`
      };
    } catch (error) {
      this.logger.error('Error en APARTADO DETALLADO:', error);
      return {
        success: false,
        error: error.message || 'Error creando app detallada desde prompt específico'
      };
    }
  }

  @Post('create-from-image')
  @ApiOperation({ 
    summary: 'APARTADO DESDE IMAGEN - Crear app desde análisis de imagen/mockup',
    description: 'Endpoint para generar apps desde análisis detallado de imágenes y mockups específicos'
  })
  @ApiResponse({ status: 201, description: 'App móvil creada desde análisis de imagen' })
  @ApiBody({
    description: 'Imagen y datos para análisis detallado',
    examples: {
      mockup: {
        summary: 'Análisis de Mockup',
        value: {
          image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...',
          nombre: 'App from Mockup',
          projectType: 'flutter'
        }
      }
    }
  })
  async createFromImageApp(@Body() createFromImageDto: any, @GetUser() usuario: Usuario) {
    try {
      // FLUJO APARTADO DESDE IMAGEN: Imagen → Análisis IA → Prompt específico → App fiel al diseño
      this.logger.debug(`🎨 APARTADO DESDE IMAGEN: Creando app desde imagen/mockup`);
      
      // Verificar si la entrada es una imagen o XML
      let finalPrompt: string;
      let analysisDescription: string;
      
      if (createFromImageDto.image.startsWith('<mxfile') || createFromImageDto.image.includes('mxGraphModel')) {
        // Es un XML mockup, no una imagen
        this.logger.debug('🔍 Detectado XML mockup en lugar de imagen');
        
        // Procesar XML mockup con restricciones
        analysisDescription = this.processXMLMockup(createFromImageDto.image, createFromImageDto.nombre);
        finalPrompt = this.applyFlutterRestrictions(analysisDescription);
        
      } else {
        // Es una imagen real
        const validation = this.imageAnalysisService.validateImageData(createFromImageDto.image);
        if (!validation.valid) {
          return {
            success: false,
            error: validation.error
          };
        }

        // Analizar imagen para generar prompt específico
        const analysisResult = await this.imageAnalysisService.analyzeImageForProject(
          createFromImageDto.image,
          createFromImageDto.projectType || 'flutter'
        );

        if (!analysisResult.success || !analysisResult.description) {
          return {
            success: false,
            error: analysisResult.error || 'Error analizando la imagen'
          };
        }

        analysisDescription = analysisResult.description;
        finalPrompt = this.applyFlutterRestrictions(analysisDescription);
      }

      // Crear app desde el análisis detallado
      const createMobileAppDto: CreateMobileAppDto = {
        xml: '', // No hay XML, se genera desde análisis
        prompt: finalPrompt,
        nombre: createFromImageDto.nombre || 'App from Image',
        project_type: ProjectType.FLUTTER,
        user_id: usuario.id
      };
      
      const savedApp = await this.mobileGeneratorService.create(createMobileAppDto);
      
      this.logger.debug(`✅ App DESDE IMAGEN creada: ${savedApp.nombre} (ID: ${savedApp.id})`);

      return {
        success: true,
        type: 'from_image_analysis',
        app: savedApp,
        imageAnalysis: analysisDescription.substring(0, 500) + '...',
        detectedComponents: this.extractComponentsFromAnalysis(analysisDescription),
        totalPages: this.countPagesInPrompt(analysisDescription),
        message: `App "${savedApp.nombre}" creada desde análisis detallado de imagen/mockup`
      };
    } catch (error) {
      this.logger.error('Error en APARTADO DESDE IMAGEN:', error);
      return {
        success: false,
        error: error.message || 'Error creando app desde imagen'
      };
    }
  }

  // Métodos auxiliares
  private generateAppName(prompt: string): string {
    const words = prompt.split(' ').filter(w => w.length > 2);
    if (words.length > 0) {
      return words[0].charAt(0).toUpperCase() + words[0].slice(1) + ' App';
    }
    return 'My App';
  }

  private extractDomainFromPrompt(prompt: string): string {
    if (prompt.includes('EDUCACIÓN') || prompt.includes('educativa')) return 'EDUCACIÓN';
    if (prompt.includes('FITNESS') || prompt.includes('gimnasio')) return 'FITNESS & GYM';
    if (prompt.includes('DELIVERY') || prompt.includes('comida')) return 'FOOD DELIVERY';
    if (prompt.includes('FINANZAS') || prompt.includes('contable')) return 'FINANZAS';
    if (prompt.includes('SALUD') || prompt.includes('médico')) return 'SALUD';
    if (prompt.includes('ECOMMERCE') || prompt.includes('tienda')) return 'E-COMMERCE';
    if (prompt.includes('SOCIAL') || prompt.includes('chat')) return 'SOCIAL';
    return 'GENERAL';
  }

  private countPagesInPrompt(prompt: string): number {
    const pageMatches = prompt.match(/\d+\.\s*\w+Screen:/g);
    return pageMatches ? pageMatches.length : 0;
  }

  private extractComponentsFromAnalysis(analysis: string): string[] {
    const components: string[] = [];
    if (analysis.includes('button') || analysis.includes('botón')) components.push('Botones');
    if (analysis.includes('form') || analysis.includes('formulario')) components.push('Formularios');
    if (analysis.includes('list') || analysis.includes('lista')) components.push('Listas');
    if (analysis.includes('nav') || analysis.includes('navegación')) components.push('Navegación');
    return components;
  }

  private extractFeaturesFromDetailedPrompt(prompt: string): string[] {
    const features: string[] = [];
    const lines = prompt.split('\n').filter(line => line.trim().length > 0);
    
    lines.forEach(line => {
      if (line.includes('Screen') || line.includes('pantalla')) {
        features.push(line.trim());
      }
    });
    
    if (features.length === 0) {
      features.push('Funcionalidades especificadas por el usuario');
    }
    
    return features;
  }

  /**
   * Aplica restricciones de Flutter para evitar errores comunes
   */
  private applyFlutterRestrictions(userPrompt: string): string {
    const restrictionsPrefix = `
RESTRICCIONES OBLIGATORIAS PARA CÓDIGO FLUTTER:

🚫 ERRORES PROHIBIDOS:
- NO usar Theme.of(context).colorSchemeSecondary (no existe)
- NO declarar variables duplicadas como 'colorScheme'
- NO importar packages no estándar como riverpod, provider, bloc sin especificación
- NO usar getters que no existen en ThemeData
- NO crear variables no utilizadas

✅ REGLAS DE CÓDIGO LIMPIO:
- Usar SOLO Theme.of(context).colorScheme.primary, secondary, etc.
- Declarar variables únicas sin duplicados
- Usar SOLO material.dart, widgets estándar de Flutter
- Validar que todos los getters existan en la API de Flutter
- Eliminar variables no usadas automáticamente

💾 DEPENDENCIAS PERMITIDAS:
SOLO estas dependencias estándar:
dependencies:
  flutter:
    sdk: flutter
  go_router: ^14.2.0

NO incluir: riverpod, provider, bloc, dio, http sin especificación explícita.

📱 ESTRUCTURA OBLIGATORIA:
- Material Design 3 estándar
- GoRouter para navegación
- Widgets nativos de Flutter únicamente
- Variables con nombres únicos y descriptivos

GENERAR APLICACIÓN FLUTTER BASADA EN ESTAS ESPECIFICACIONES:

${userPrompt}

IMPORTANTE: Cumplir ESTRICTAMENTE las restricciones mencionadas arriba.
    `;

    return restrictionsPrefix.trim();
  }

  /**
   * Procesa XML mockup para generar descripción específica
   */
  private processXMLMockup(xmlContent: string, appName: string): string {
    this.logger.debug('📱 Procesando XML mockup para generar prompt específico');
    
    // Extraer textos del XML
    const texts = this.extractTextsFromXML(xmlContent);
    const components = this.analyzeXMLComponents(xmlContent);
    const screens = this.generateScreensFromXMLContent(texts, components);
    
    const xmlAnalysisPrompt = `
ANÁLISIS COMPLETO DE MOCKUP XML PARA APP: ${appName}

TEXTOS EXTRAÍDOS DEL MOCKUP:
${texts.map(text => `- "${text}"`).join('\n')}

COMPONENTES DETECTADOS:
${components.join('\n')}

PANTALLAS A GENERAR:
${screens.join('\n')}

ESTRUCTURA DE LA APLICACIÓN FLUTTER:

1. HomeScreen/DashboardScreen:
   - Título principal basado en los textos del mockup
   - Navegación principal
   - Cards o componentes principales detectados

2. CreateProjectScreen (si se detecta funcionalidad de creación):
   - Formulario con campos detectados en el mockup
   - Validaciones de campos
   - Botones de acción (Publish/Cancel/Save)

3. SettingsScreen/PermissionsScreen (si se detectan configuraciones):
   - Radio buttons para permisos detectados
   - Configuraciones específicas
   - Opciones de usuario

4. DetailScreen:
   - Detalles específicos de elementos
   - Información adicional
   - Acciones secundarias

CARACTERÍSTICAS ESPECÍFICAS DEL MOCKUP:
- Formularios interactivos con validación
- Radio buttons para selección de permisos
- Campos de texto con placeholders específicos
- Botones de acción con funcionalidad real
- Navegación fluida entre pantallas
- Diseño basado en los elementos visuales del mockup

IMPORTANTE: Cada pantalla debe implementar la funcionalidad específica detectada en el mockup, no usar placeholders genéricos.
    `;

    return xmlAnalysisPrompt.trim();
  }

  /**
   * Extrae textos relevantes del XML
   */
  private extractTextsFromXML(xmlContent: string): string[] {
    const texts: string[] = [];
    
    // Buscar valores de texto en el XML
    const valueMatches = xmlContent.match(/value="([^"]+)"/g) || [];
    
    valueMatches.forEach(match => {
      const text = match.replace(/value="|"/g, '');
      if (text.length > 1 && 
          !text.includes('mxgraph') && 
          !text.includes('font') &&
          !text.includes('http') &&
          text.trim() !== '') {
        texts.push(text);
      }
    });

    return [...new Set(texts)]; // Eliminar duplicados
  }

  /**
   * Analiza componentes del XML
   */
  private analyzeXMLComponents(xmlContent: string): string[] {
    const components: string[] = [];

    // Detectar tipos de componentes
    if (xmlContent.includes('rounded') || xmlContent.includes('button')) {
      components.push('- Botones interactivos detectados');
    }
    
    if (xmlContent.includes('fillColor')) {
      components.push('- Campos de formulario detectados');
    }
    
    if (xmlContent.includes('strokeColor')) {
      components.push('- Elementos con bordes (inputs, cards)');
    }
    
    if (xmlContent.includes('ellipse')) {
      components.push('- Radio buttons o checkboxes detectados');
    }
    
    if (xmlContent.includes('text')) {
      components.push('- Elementos de texto y labels');
    }

    if (xmlContent.includes('phone')) {
      components.push('- Diseño móvil/responsivo');
    }

    return components.length > 0 ? components : ['- Componentes básicos de UI'];
  }

  /**
   * Genera pantallas basadas en el contenido XML
   */
  private generateScreensFromXMLContent(texts: string[], components: string[]): string[] {
    const screens: string[] = [];
    
    // Analizar textos para determinar pantallas
    const lowerTexts = texts.map(t => t.toLowerCase());
    
    if (lowerTexts.some(t => t.includes('dashboard') || t.includes('home'))) {
      screens.push('1. DashboardScreen - Pantalla principal con navegación');
    }
    
    if (lowerTexts.some(t => t.includes('create') || t.includes('project'))) {
      screens.push('2. CreateProjectScreen - Formulario de creación de proyectos');
    }
    
    if (lowerTexts.some(t => t.includes('permission') || t.includes('access'))) {
      screens.push('3. PermissionsScreen - Configuración de permisos y acceso');
    }
    
    if (lowerTexts.some(t => t.includes('publish') || t.includes('save'))) {
      screens.push('4. PublishScreen - Publicación y guardado de proyectos');
    }

    // Asegurar mínimo de pantallas
    if (screens.length === 0) {
      screens.push(
        '1. HomeScreen - Pantalla principal',
        '2. FormScreen - Formulario principal',
        '3. SettingsScreen - Configuraciones',
        '4. DetailScreen - Detalles y acciones'
      );
    }

    return screens;
  }
} 