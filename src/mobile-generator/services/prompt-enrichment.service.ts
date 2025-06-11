import { Injectable, Logger } from '@nestjs/common';
import { ChatgptService } from '../../chatgpt/chatgpt.service';

@Injectable()
export class PromptEnrichmentService {
  private readonly logger = new Logger(PromptEnrichmentService.name);

  constructor(private readonly chatgptService: ChatgptService) {}

  /**
   * Enriquece un prompt básico con funcionalidades estándar y específicas del dominio
   * @param originalPrompt Prompt original del usuario
   * @returns Prompt enriquecido con funcionalidades detalladas
   */
  async enrichPrompt(originalPrompt: string): Promise<string> {
    try {
      this.logger.debug(`🤖 Enriqueciendo prompt: "${originalPrompt.substring(0, 50)}..."`);
      this.logger.debug(`📏 Longitud del prompt original: ${originalPrompt.length} caracteres`);
      
      // Si el prompt ya es muy detallado (>100 caracteres), no enriquecerlo demasiado
      if (originalPrompt.length > 100) {
        this.logger.debug('📝 Prompt ya es detallado, enriquecimiento mínimo');
        const result = originalPrompt + this.getBaseFunctionalities();
        this.logger.debug(`📏 Prompt con enriquecimiento mínimo: ${result.length} caracteres`);
        return result;
      }
      
      // Enriquecimiento completo para prompts básicos
      const enrichedPrompt = await this.performFullEnrichment(originalPrompt);
      this.logger.debug(`📏 Prompt totalmente enriquecido: ${enrichedPrompt.length} caracteres`);
      this.logger.debug(`🔍 Primeros 200 caracteres del resultado: "${enrichedPrompt.substring(0, 200)}..."`);
      
      this.logger.debug(`✅ Prompt enriquecido completamente`);
      return enrichedPrompt;
      
    } catch (error) {
      this.logger.error(`❌ Error enriqueciendo prompt: ${error.message}`);
      // Fallback: agregar solo funcionalidades base
      const fallback = originalPrompt + this.getBaseFunctionalities();
      this.logger.debug(`🔄 Usando fallback con ${fallback.length} caracteres`);
      return fallback;
    }
  }

  /**
   * Realiza enriquecimiento completo usando IA para detectar dominio y sugerir funcionalidades
   */
  private async performFullEnrichment(originalPrompt: string): Promise<string> {
    const analysisPrompt = `Analiza este prompt de aplicación móvil y enriquécelo con funcionalidades específicas:

PROMPT ORIGINAL: "${originalPrompt}"

Tu tarea es detectar el tipo de aplicación y sugerir funcionalidades específicas que DEBE tener una app moderna de este tipo.

FORMATO DE RESPUESTA REQUERIDO:
PROMPT ENRIQUECIDO:
[El prompt original] con las siguientes funcionalidades específicas:

FUNCIONALIDADES BASE (toda app móvil moderna):
- Sistema de autenticación completo (login, registro, logout, recuperar contraseña)
- Dashboard principal con navegación intuitiva (drawer o tabs)
- Perfil de usuario editable con foto y configuraciones
- Sistema de notificaciones push
- Estados de carga, error y éxito en toda la app
- Diseño responsive para diferentes tamaños de pantalla
- Modo oscuro/claro configurable
- Configuraciones de la aplicación

FUNCIONALIDADES ESPECÍFICAS DEL DOMINIO [detecta automáticamente]:
[Lista 6-8 funcionalidades específicas del tipo de app detectado]

PANTALLAS MÍNIMAS REQUERIDAS:
[Lista las pantallas principales que debe tener la app]

Ejemplos de dominios: E-commerce, Delivery, Finanzas, Salud, Educación, Social, Productividad, Entretenimiento, etc.

IMPORTANTE: Mantén el prompt original pero expándelo con funcionalidades específicas y técnicas.`;

    const enrichedContent = await this.chatgptService.chat([
      { role: 'user', content: analysisPrompt }
    ], 'gpt-4o', 0.7);

    return enrichedContent;
  }

  /**
   * Funcionalidades base que toda aplicación móvil debe tener
   */
  private getBaseFunctionalities(): string {
    return `

FUNCIONALIDADES BASE OBLIGATORIAS (toda app móvil moderna debe incluir):
- Sistema de autenticación completo (login, registro, logout, recuperar contraseña)
- Dashboard/Home principal con navegación clara
- Perfil de usuario editable con configuraciones personales  
- Sistema de notificaciones y alertas
- Estados de carga, error y éxito en todas las operaciones
- Validaciones de formularios con mensajes claros
- Navegación intuitiva entre pantallas (drawer o bottom navigation)
- Diseño responsive para diferentes dispositivos
- Configuraciones de la aplicación (tema, idioma, etc.)
- Manejo de conexión offline/online

ARQUITECTURA TÉCNICA REQUERIDA:
- Mínimo 5-6 pantallas principales funcionales
- Formularios reactivos con validación en tiempo real
- Estados de la aplicación gestionados correctamente
- Navegación fluida entre todas las pantallas
- Componentes reutilizables y código organizado`;
  }

  /**
   * Detecta el dominio de la aplicación basado en palabras clave
   * (Método auxiliar para casos donde la IA no esté disponible)
   */
  private detectDomain(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    const domains = {
      'finanzas': ['contable', 'financiero', 'banco', 'dinero', 'transaccion', 'pago', 'factura', 'presupuesto'],
      'educacion': ['escolar', 'estudiante', 'profesor', 'curso', 'educativo', 'aprendizaje', 'clase'],
      'salud': ['medico', 'hospital', 'paciente', 'cita', 'salud', 'clinica', 'doctor'],
      'comercio': ['tienda', 'venta', 'producto', 'carrito', 'compra', 'ecommerce', 'catalogo'],
      'delivery': ['delivery', 'entrega', 'pedido', 'restaurante', 'comida', 'domicilio'],
      'social': ['chat', 'mensaje', 'amigo', 'red social', 'post', 'comentario'],
      'productividad': ['tarea', 'proyecto', 'organizacion', 'tiempo', 'calendario', 'agenda'],
      'entretenimiento': ['juego', 'musica', 'video', 'streaming', 'entretenimiento']
    };

    for (const [domain, keywords] of Object.entries(domains)) {
      if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
        return domain;
      }
    }

    return 'generico';
  }
} 