import { Injectable, Logger } from '@nestjs/common';
import { ChatgptService } from '../../chatgpt/chatgpt.service';
import { ProjectType } from '../entities/mobile-app.entity';
import { PromptEnrichmentService } from './prompt-enrichment.service';

export interface ImageAnalysisResult {
  success: boolean;
  description?: string;
  error?: string;
}

export interface GeneralAppResult {
  success: boolean;
  enrichedPrompt: string;
  detectedDomain: string;
  generatedPages: string[];
  error?: string;
}

@Injectable()
export class ImageAnalysisService {
  private readonly logger = new Logger(ImageAnalysisService.name);

  constructor(
    private readonly chatGptService: ChatgptService,
    private readonly promptEnrichmentService: PromptEnrichmentService
  ) {}

  /**
   * Crea una app móvil de manera GENERAL - Automática con generación inteligente de páginas
   */
  async createGeneralApp(
    prompt: string,
    projectType: ProjectType = ProjectType.FLUTTER
  ): Promise<GeneralAppResult> {
    try {
      this.logger.debug(`🚀 Creando app general con prompt: "${prompt}"`);

      // 1. ENRIQUECER EL PROMPT automáticamente
      const enrichedPrompt = await this.promptEnrichmentService.enrichPrompt(prompt);
      
      this.logger.debug(`✅ Prompt enriquecido (${enrichedPrompt.length} caracteres)`);

      // 2. DETECTAR DOMINIO específico
      const detectedDomain = this.extractDomainFromEnrichedPrompt(enrichedPrompt);
      
      // 3. EXTRAER PÁGINAS generadas automáticamente
      const generatedPages = this.extractPagesFromEnrichedPrompt(enrichedPrompt);

      this.logger.debug(`🎯 Dominio detectado: ${detectedDomain}`);
      this.logger.debug(`📱 Páginas generadas: ${generatedPages.length}`);

      return {
        success: true,
        enrichedPrompt,
        detectedDomain,
        generatedPages
      };

    } catch (error) {
      this.logger.error(`❌ Error creando app general: ${error.message}`);
      return {
        success: false,
        enrichedPrompt: '',
        detectedDomain: 'error',
        generatedPages: [],
        error: error.message || 'Error desconocido creando app general'
      };
    }
  }

  /**
   * Extrae el dominio detectado del prompt enriquecido
   */
  private extractDomainFromEnrichedPrompt(enrichedPrompt: string): string {
    // Buscar líneas que indican el dominio detectado
    const domainMatch = enrichedPrompt.match(/DOMINIO ESPECÍFICO DETECTADO:\s*([^\n]+)/i);
    if (domainMatch) {
      return domainMatch[1].trim();
    }

    // Buscar patrones alternativos
    const altDomainMatch = enrichedPrompt.match(/(?:FITNESS|EDUCACIÓN|DELIVERY|FINANZAS|ECOMMERCE|SALUD|SOCIAL)\/\w+/i);
    if (altDomainMatch) {
      return altDomainMatch[0];
    }

    return 'Aplicación General';
  }

  /**
   * Extrae las páginas específicas del prompt enriquecido
   */
  private extractPagesFromEnrichedPrompt(enrichedPrompt: string): string[] {
    const pages: string[] = [];

    // Buscar páginas en formato estructurado
    const pageLines = enrichedPrompt
      .split('\n')
      .filter(line => line.match(/^\d+\.\s*\w+Screen:/));

    pageLines.forEach(line => {
      const match = line.match(/^\d+\.\s*(\w+Screen):\s*(.+)$/);
      if (match) {
        const screenName = match[1];
        const description = match[2];
        pages.push(`${screenName}: ${description}`);
      }
    });

    // Si no se encontraron páginas estructuradas, buscar páginas base
    if (pages.length === 0) {
      const basePages = [
        'LoginScreen: Pantalla de inicio de sesión',
        'RegisterScreen: Pantalla de registro',
        'HomeScreen: Pantalla principal',
        'ProfileScreen: Pantalla de perfil'
      ];
      pages.push(...basePages);
    }

    return pages;
  }

  /**
   * Analiza una imagen y genera una descripción detallada para crear una aplicación móvil
   */
  async analyzeImageForProject(
    base64Image: string,
    projectType: ProjectType = ProjectType.FLUTTER
  ): Promise<ImageAnalysisResult> {
    try {
      this.logger.debug(`🔍 Analizando imagen para proyecto ${projectType}`);

      const systemPrompt = this.createImageAnalysisPrompt(projectType);
      const userPrompt = `Analiza esta imagen y genera una descripción detallada para crear una aplicación ${projectType}. Describe todas las pantallas, funcionalidades, elementos UI, colores, y flujo de navegación que observas.`;

      // Preparar el mensaje con imagen
      const messages = [
        {
          role: 'system' as const,
          content: systemPrompt
        },
        {
          role: 'user' as const,
          content: [
            {
              type: 'text' as const,
              text: userPrompt
            },
            {
              type: 'image_url' as const,
              image_url: {
                url: base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`,
                detail: 'high' as const
              }
            }
          ]
        }
      ];

      // Usar ChatGPT service con visión
      const response = await this.chatGptService.generateResponseWithVision(messages, {
        maxTokens: 2000,
        temperature: 0.7
      });

      if (!response || !response.trim()) {
        throw new Error('No se recibió respuesta del análisis de imagen');
      }

      this.logger.debug(`✅ Imagen analizada correctamente (${response.length} caracteres)`);

      return {
        success: true,
        description: response
      };

    } catch (error) {
      this.logger.error(`❌ Error analizando imagen: ${error.message}`);
      return {
        success: false,
        error: error.message || 'Error desconocido analizando imagen'
      };
    }
  }

  /**
   * Crea el prompt del sistema para análisis de imágenes
   */
  private createImageAnalysisPrompt(projectType: ProjectType): string {
    return `Eres un experto analista de UI/UX especializado en generar especificaciones detalladas para aplicaciones ${projectType} desde imágenes.

Tu tarea es analizar la imagen proporcionada y generar una descripción completa y estructurada que permita crear una aplicación ${projectType} funcional.

ESTRUCTURA DE ANÁLISIS REQUERIDA:

1. **TIPO DE APLICACIÓN**:
   - Identifica el dominio/categoría (ej: e-commerce, fitness, finanzas, social, etc.)
   - Propósito principal de la aplicación

2. **PANTALLAS IDENTIFICADAS**:
   - Lista todas las pantallas visibles en la imagen
   - Describe el contenido y propósito de cada pantalla
   - Identifica la pantalla principal/home

3. **ELEMENTOS UI ESPECÍFICOS**:
   - Botones: ubicación, texto, función
   - Formularios: campos, validaciones, propósito
   - Listas: tipo de contenido, estructura
   - Navegación: tabs, drawer, bottom navigation
   - Cards: contenido, layout
   - Imágenes: ubicación, propósito

4. **COLORES Y TEMA**:
   - Colores primarios y secundarios identificados
   - Estilo visual (moderno, minimalista, colorido, etc.)
   - Modo claro/oscuro si es visible

5. **FUNCIONALIDADES DETECTADAS**:
   - Autenticación (login, registro)
   - CRUD operations
   - Búsqueda y filtros
   - Notificaciones
   - Configuraciones
   - Funcionalidades específicas del dominio

6. **FLUJO DE NAVEGACIÓN**:
   - Cómo se conectan las pantallas
   - Navegación principal (drawer, tabs, etc.)
   - Flujos específicos (registro, compra, etc.)

7. **DATOS Y CONTENIDO**:
   - Tipo de datos mostrados
   - Estructura de la información
   - Contenido de ejemplo específico del dominio

FORMATO DE RESPUESTA:
Genera una descripción en español, detallada y estructurada que incluya:
- Descripción general de la aplicación
- Lista específica de pantallas a implementar
- Funcionalidades exactas requeridas
- Elementos UI específicos
- Colores y tema visual
- Datos de ejemplo apropiados para el dominio

EJEMPLO DE SALIDA:
"Aplicación de fitness y gimnasio con las siguientes características:

PANTALLAS PRINCIPALES:
- Pantalla de login con campos email y contraseña
- Pantalla de registro con datos personales
- Home/Dashboard con resumen de entrenamientos y progreso
- Pantalla de rutinas con lista de ejercicios
- Pantalla de progreso con gráficos y estadísticas

FUNCIONALIDADES:
- Sistema de autenticación completo
- Gestión de rutinas de ejercicio
- Seguimiento de progreso y estadísticas
- Calendario de entrenamientos
- Perfil de usuario editable

ELEMENTOS UI:
- Navigation drawer con acceso a todas las secciones
- Cards para mostrar rutinas y ejercicios
- Gráficos de progreso (barras, líneas)
- Formularios para crear/editar rutinas
- Botones de acción flotantes

COLORES:
- Primario: Azul (#2196F3)
- Secundario: Verde (#4CAF50)
- Acento: Naranja (#FF9800)

DATOS DE EJEMPLO:
- Rutinas: 'Pecho y tríceps', 'Piernas', 'Espalda y bíceps'
- Ejercicios: 'Press de banca', 'Sentadillas', 'Dominadas'
- Estadísticas: peso levantado, repeticiones, tiempo de entrenamiento"

Sé específico y detallado para que la descripción permita generar una aplicación completa y funcional.`;
  }

  /**
   * Valida que la imagen sea válida para análisis
   */
  validateImageData(base64Image: string): { valid: boolean; error?: string } {
    if (!base64Image || base64Image.trim() === '') {
      return {
        valid: false,
        error: 'Imagen vacía o no válida'
      };
    }

    // Verificar que sea base64 válido
    if (!base64Image.startsWith('data:image/')) {
      return {
        valid: false,
        error: 'Formato de imagen no válido. Debe ser base64 con prefijo data:image/'
      };
    }

    // Verificar tipos de imagen soportados
    const supportedTypes = ['jpeg', 'jpg', 'png', 'gif', 'webp'];
    const imageType = base64Image.split(';')[0].split('/')[1];
    
    if (!supportedTypes.includes(imageType.toLowerCase())) {
      return {
        valid: false,
        error: `Tipo de imagen no soportado: ${imageType}. Use: ${supportedTypes.join(', ')}`
      };
    }

    return { valid: true };
  }
} 