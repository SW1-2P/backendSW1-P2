import { Injectable, Logger } from '@nestjs/common';
import { ChatgptService } from '../../chatgpt/chatgpt.service';

interface DomainTemplate {
  name: string;
  requiredPages: string[];
  specificFunctionalities: string[];
  keywords: string[];
}

@Injectable()
export class PromptEnrichmentService {
  private readonly logger = new Logger(PromptEnrichmentService.name);

  constructor(private readonly chatgptService: ChatgptService) {}

  /**
   * Enriquece un prompt básico usando IA para interpretar y generar páginas específicas
   * @param originalPrompt Prompt original del usuario
   * @returns Prompt enriquecido con páginas y funcionalidades específicas interpretadas por IA
   */
  async enrichPrompt(originalPrompt: string): Promise<string> {
    this.logger.debug(`🔍 Interpretando prompt: "${originalPrompt.substring(0, 50)}..."`);
    
    // Detectar dominio específico sin IA
    const detectedDomain = this.detectDomainAdvanced(originalPrompt);
    
    if (detectedDomain.name !== 'aplicacion_generica') {
      this.logger.debug(`🎯 Dominio detectado: ${detectedDomain.name} - generando especificación específica`);
      return this.generateDomainSpecificPrompt(originalPrompt, detectedDomain);
    }
    
    // Solo intentar IA si no se detectó dominio específico Y hay API key disponible
    if (process.env.OPENAI_API_KEY) {
      try {
        this.logger.debug(`🤖 Enviando prompt a IA para interpretación completa`);
        const aiInterpretedPrompt = await this.sendToAIForInterpretation(originalPrompt);
        this.logger.debug(`✅ IA interpretó y enriqueció el prompt exitosamente`);
        return aiInterpretedPrompt;
    } catch (error) {
        this.logger.error(`❌ Error en interpretación de IA: ${error.message}`);
        this.logger.warn(`⚠️ Fallback a plantilla genérica`);
      }
    } else {
      this.logger.warn(`⚠️ Sin API key de OpenAI - usando detección por keywords`);
    }
    
    // Fallback final: plantilla genérica
    return this.generatePromptWithBasicRules(originalPrompt);
  }

  /**
   * Genera un prompt enriquecido específico para el dominio detectado
   */
  private generateDomainSpecificPrompt(originalPrompt: string, domain: DomainTemplate): string {
    const pagesDescription = domain.requiredPages.map((page, index) => 
      `${index + 1}. ${page}`
    ).join('\n');

    const functionalitiesDescription = domain.specificFunctionalities.map((func, index) => 
      `- ${func}`
    ).join('\n');

    return `${originalPrompt}

APLICACIÓN DEL DOMINIO: ${domain.name.toUpperCase()}

PÁGINAS PRINCIPALES OBLIGATORIAS (mínimo ${domain.requiredPages.length}):
${pagesDescription}

FUNCIONALIDADES ESPECÍFICAS DEL DOMINIO:
${functionalitiesDescription}

FUNCIONALIDADES BASE (toda app móvil moderna):
- Sistema de autenticación completo (LoginScreen, RegisterScreen)
- Dashboard principal con navegación intuitiva
- Perfil de usuario editable (ProfileScreen)
- Configuraciones de la aplicación (SettingsScreen)
- Estados de carga, error y éxito en toda la app
- Validaciones de formularios con mensajes claros
- Navegación con bottom navigation o drawer
- Diseño Material Design 3 responsive

ESPECIFICACIONES TÉCNICAS:
- Usar Flutter con GoRouter para navegación
- Material Design 3 con useMaterial3: true
- Implementar TODAS las pantallas listadas arriba
- Formularios con validación reactiva
- Navegación fluida entre todas las pantallas
- Componentes reutilizables y código limpio
- Manejo de estados con Provider o Riverpod

PANTALLAS MÍNIMAS TOTALES: ${domain.requiredPages.length + 4} (${domain.requiredPages.length} específicas + 4 base)`;
  }

  /**
   * Detecta el dominio de aplicación con plantillas específicas
   */
  private detectDomainAdvanced(prompt: string): DomainTemplate {
    const lowerPrompt = prompt.toLowerCase();
    
    const domainTemplates: DomainTemplate[] = [
      // GYM/FITNESS
      {
        name: 'fitness_gym',
        keywords: ['gym', 'gimnasio', 'fitness', 'ejercicio', 'entrenamiento', 'rutina', 'musculo'],
        requiredPages: [
          'HomeScreen: Dashboard con resumen de entrenamientos y progreso del día',
          'WorkoutScreen: Lista de rutinas disponibles con categorías (pecho, piernas, etc.)',
          'ExerciseDetailScreen: Detalles de ejercicios con instrucciones y videos',
          'ProgressScreen: Gráficos de progreso, peso levantado y estadísticas',
          'TrainingHistoryScreen: Historial de entrenamientos completados'
        ],
        specificFunctionalities: [
          'Sistema de rutinas de ejercicio por grupos musculares',
          'Seguimiento de progreso con gráficos de peso y repeticiones',
          'Cronómetro para descansos entre series',
          'Calendario de entrenamientos',
          'Calculadora de IMC y métricas corporales',
          'Biblioteca de ejercicios con instrucciones',
          'Sistema de logros y objetivos',
          'Recordatorios de entrenamiento'
        ]
      },
      
      // FINANZAS/CONTABLE
      {
        name: 'finanzas_contable',
        keywords: ['contable', 'financiero', 'banco', 'dinero', 'transaccion', 'presupuesto', 'gasto'],
        requiredPages: [
          'HomeScreen: Dashboard financiero con balance actual y gastos del mes',
          'TransactionsScreen: Lista de todas las transacciones con filtros',
          'AddTransactionScreen: Formulario para agregar ingresos/gastos',
          'ReportsScreen: Reportes financieros con gráficos y estadísticas',
          'CategoriesScreen: Gestión de categorías de gastos e ingresos'
        ],
        specificFunctionalities: [
          'Registro de ingresos y gastos por categorías',
          'Dashboard con gráficos de flujo de dinero',
          'Reportes de balance mensual y anual',
          'Categorización automática de movimientos',
          'Presupuestos por categoría con alertas',
          'Exportación de reportes a PDF/Excel',
          'Análisis de tendencias de gasto',
          'Recordatorios de pagos recurrentes'
        ]
      },
      
      // E-COMMERCE/TIENDA
      {
        name: 'ecommerce_tienda',
        keywords: ['tienda', 'venta', 'producto', 'carrito', 'compra', 'ecommerce', 'catalogo'],
        requiredPages: [
          'HomeScreen: Catálogo de productos destacados con búsqueda',
          'ProductListScreen: Lista de productos con filtros y categorías',
          'ProductDetailScreen: Detalles del producto con galería e información',
          'CartScreen: Carrito de compras con resumen y checkout',
          'OrdersScreen: Historial de pedidos y seguimiento'
        ],
        specificFunctionalities: [
          'Catálogo de productos con búsqueda avanzada',
          'Carrito de compras persistente',
          'Sistema de favoritos/wishlist',
          'Múltiples métodos de pago',
          'Seguimiento de pedidos en tiempo real',
          'Sistema de reviews y ratings',
          'Notificaciones de ofertas y stock',
          'Gestión de direcciones de envío'
        ]
      },
      
      // DELIVERY/COMIDA
      {
        name: 'delivery_comida',
        keywords: ['delivery', 'entrega', 'pedido', 'restaurante', 'comida', 'domicilio'],
        requiredPages: [
          'HomeScreen: Lista de restaurantes cercanos con búsqueda',
          'RestaurantDetailScreen: Menú del restaurante con categorías',
          'CartScreen: Carrito con productos seleccionados y total',
          'OrderTrackingScreen: Seguimiento del pedido en tiempo real',
          'OrderHistoryScreen: Historial de pedidos anteriores'
        ],
        specificFunctionalities: [
          'Búsqueda de restaurantes por ubicación',
          'Menús categorizados con imágenes',
          'Carrito con personalización de productos',
          'Tracking en tiempo real del delivery',
          'Múltiples métodos de pago',
          'Sistema de ratings para restaurantes',
          'Estimación de tiempo de entrega',
          'Notificaciones push del estado del pedido'
        ]
      },
      
      // SALUD/MÉDICO
      {
        name: 'salud_medico',
        keywords: ['medico', 'médico', 'medica', 'médica', 'hospital', 'paciente', 'cita', 'salud', 'clinica', 'clínica', 'doctor', 'medicina', 'aplicacion medica', 'aplicación médica', 'enfermeria', 'farmacia', 'telemedicina'],
        requiredPages: [
          'HomeScreen: Dashboard de salud con próximas citas y recordatorios',
          'DoctorsScreen: Lista de médicos disponibles con especialidades',
          'AppointmentScreen: Agendar nueva cita médica',
          'MedicalHistoryScreen: Historial médico y expediente',
          'PrescriptionsScreen: Recetas médicas y medicamentos'
        ],
        specificFunctionalities: [
          'Sistema de agendamiento de citas',
          'Historial médico digital',
          'Gestión de recetas y medicamentos',
          'Recordatorios de citas y medicinas',
          'Directorio de médicos por especialidad',
          'Telemedicina básica',
          'Alertas de exámenes médicos',
          'Compartir información con familiares'
        ]
      },
      
      // EDUCACIÓN/ESCOLAR
      {
        name: 'educacion_escolar',
        keywords: ['escolar', 'estudiante', 'profesor', 'curso', 'educativo', 'educativa', 'aprendizaje', 'clase'],
        requiredPages: [
          'HomeScreen: Dashboard estudiantil con próximas clases y tareas',
          'CoursesScreen: Lista de materias/cursos inscritos',
          'AssignmentsScreen: Tareas pendientes y completadas',
          'GradesScreen: Calificaciones por materia y promedio',
          'ScheduleScreen: Horario de clases semanal'
        ],
        specificFunctionalities: [
          'Gestión de materias y horarios',
          'Sistema de tareas y entregables',
          'Calificaciones y reportes académicos',
          'Calendario académico',
          'Comunicación con profesores',
          'Biblioteca de recursos educativos',
          'Recordatorios de clases y exámenes',
          'Progreso académico por materia'
        ]
      },
      
      // SOCIAL/CHAT
      {
        name: 'social_chat',
        keywords: ['chat', 'mensaje', 'amigo', 'red social', 'post', 'comentario', 'social'],
        requiredPages: [
          'HomeScreen: Feed de publicaciones de amigos',
          'ChatsScreen: Lista de conversaciones activas',
          'ChatDetailScreen: Conversación individual con mensajería',
          'ProfileScreen: Perfil público con posts y seguidores',
          'CreatePostScreen: Crear nueva publicación con media'
        ],
        specificFunctionalities: [
          'Sistema de mensajería en tiempo real',
          'Feed de publicaciones con likes y comentarios',
          'Sistema de amigos/seguidores',
          'Compartir fotos y videos',
          'Notificaciones de actividad social',
          'Estados/stories temporales',
          'Grupos y comunidades',
          'Chat grupal'
        ]
      }
    ];

    // Buscar coincidencias por keywords
    for (const template of domainTemplates) {
      if (template.keywords.some(keyword => lowerPrompt.includes(keyword))) {
        this.logger.debug(`🎯 Dominio específico detectado: ${template.name}`);
        return template;
      }
    }

    // Fallback: plantilla genérica
    this.logger.debug(`🔄 Usando plantilla genérica`);
    return this.getGenericTemplate();
  }

  /**
   * Plantilla genérica para aplicaciones que no coinciden con dominios específicos
   */
  private getGenericTemplate(): DomainTemplate {
    return {
      name: 'aplicacion_generica',
      keywords: [],
      requiredPages: [
        'HomeScreen: Pantalla principal con funcionalidades principales',
        'ListScreen: Lista de elementos principales de la aplicación',
        'DetailScreen: Vista detallada de elementos individuales',
        'CreateEditScreen: Formulario para crear/editar elementos',
        'SearchScreen: Búsqueda y filtros avanzados'
      ],
      specificFunctionalities: [
        'CRUD completo de elementos principales',
        'Sistema de búsqueda y filtros',
        'Gestión de datos locales y remotos',
        'Interfaz intuitiva y responsive',
        'Validaciones de formularios',
        'Estados de carga y error',
        'Navegación fluida entre pantallas',
        'Persistencia de datos local'
      ]
    };
  }

  /**
   * Envía el prompt a la IA con reglas claras para interpretación completa y detallada
   */
  private async sendToAIForInterpretation(originalPrompt: string): Promise<string> {
    const interpretationPrompt = `
SISTEMA EXPERTO EN ARQUITECTURA DE APLICACIONES MÓVILES FLUTTER

MISIÓN: Interpretar "${originalPrompt}" y generar una ESPECIFICACIÓN TÉCNICA ULTRA-DETALLADA que o3 pueda convertir directamente en código Flutter funcional.

ENTRADA DEL USUARIO:
"${originalPrompt}"

REGLAS OBLIGATORIAS PARA LA ESPECIFICACIÓN:

1. 🎯 IDENTIFICACIÓN DEL DOMINIO:
   - Detectar EXACTAMENTE qué tipo de aplicación es
   - Especificar el dominio (médica, educativa, e-commerce, fitness, finanzas, etc.)
   - Definir el público objetivo y caso de uso principal

2. 📱 PÁGINAS ESPECÍFICAS DETALLADAS (MÍNIMO 6):
   Para cada página, especificar:
   - Nombre exacto de la clase (ej: AppointmentsScreen, DoctorsListScreen)
   - Propósito específico y funcionalidad principal
   - Componentes UI específicos (AppBar, Body, FAB, BottomNav, etc.)
   - Estados que maneja (loading, error, success, empty)
   - Formularios con campos específicos y validaciones
   - Acciones de usuario (tap, scroll, submit, etc.)
   - Navegación hacia otras pantallas

3. 🏗️ ARQUITECTURA TÉCNICA ESPECÍFICA:
   - Estructura de directorios exacta
   - Nombres de archivos específicos
   - Imports y dependencias necesarias
   - Modelos de datos con propiedades exactas
   - Servicios y controladores necesarios

4. 🎨 DISEÑO UI ESPECÍFICO:
   - Widgets específicos para cada pantalla
   - Layout detallado (Column, Row, ListView, etc.)
   - Colores, iconos y tipografía específica
   - Responsive design considerations
   - Material Design 3 components específicos

5. 🔄 FLUJO DE NAVEGACIÓN DETALLADO:
   - GoRouter routes específicas con paths exactos
   - Transiciones entre pantallas
   - Bottom navigation o drawer específico
   - Deep linking structure

6. 💾 GESTIÓN DE DATOS ESPECÍFICA:
   - Modelos de datos exactos con tipos
   - Métodos CRUD específicos
   - Estados locales con StatefulWidget
   - Validación de formularios específica

FORMATO DE RESPUESTA OBLIGATORIO:

ESPECIFICACIÓN TÉCNICA DETALLADA PARA o3:

══════════════════════════════════════════
📋 TIPO DE APLICACIÓN IDENTIFICADA
══════════════════════════════════════════
[Especificar dominio exacto y propósito]

══════════════════════════════════════════
📱 PÁGINAS ESPECÍFICAS (mínimo 6)
══════════════════════════════════════════
1. PÁGINA: [NombreExactoScreen]
   - PROPÓSITO: [función específica]
   - UI COMPONENTS: [widgets específicos]
   - FORMULARIOS: [campos y validaciones exactas]
   - ACCIONES: [funciones específicas]
   - NAVEGACIÓN: [hacia qué pantallas]

[Repetir para cada página con MÁXIMO DETALLE]

══════════════════════════════════════════
🏗️ ARQUITECTURA FLUTTER ESPECÍFICA
══════════════════════════════════════════
- ESTRUCTURA DE DIRECTORIOS: [exacta]
- ARCHIVOS NECESARIOS: [lista completa]
- MODELOS DE DATOS: [con propiedades específicas]
- SERVICIOS: [métodos específicos]

══════════════════════════════════════════
🎨 DISEÑO UI DETALLADO
══════════════════════════════════════════
- LAYOUT ESPECÍFICO: [widgets y estructura]
- NAVEGACIÓN: [BottomNav/Drawer específico]
- COLORES Y TEMA: [Material Design 3 específico]

══════════════════════════════════════════
🔄 FLUJO DE NAVEGACIÓN COMPLETO
══════════════════════════════════════════
- ROUTES: [paths específicos con GoRouter]
- TRANSICIONES: [entre pantallas específicas]

IMPORTANTE: 
- Cada página debe tener FUNCIONALIDAD ESPECÍFICA del dominio detectado
- No usar términos genéricos como "ListScreen" sino nombres específicos como "PatientListScreen", "AppointmentsScreen", etc.
- Especificar TODOS los campos de formularios, botones, y funcionalidades
- Dar suficiente detalle para que o3 pueda generar código Flutter completo y funcional
    `;

    try {
      const messages = [
        { role: 'system', content: 'Eres un arquitecto de software senior especializado en Flutter que genera especificaciones técnicas ultra-detalladas para que o3 pueda convertir en código funcional.' },
        { role: 'user', content: interpretationPrompt }
      ];
      
      // Usar GPT-4o para interpretación detallada
      const response = await this.chatgptService.chat(messages, 'gpt-4o', 0.2);
      return response;
    } catch (error) {
      this.logger.error('Error llamando a IA para interpretación:', error);
      throw error;
    }
  }

  /**
   * Genera prompt con reglas básicas como fallback
   */
  private generatePromptWithBasicRules(originalPrompt: string): string {
    return `
${originalPrompt}

ESPECIFICACIÓN TÉCNICA AUTOMÁTICA:

PÁGINAS PRINCIPALES (mínimo 4):
1. HomeScreen: Pantalla principal con funcionalidades principales
2. ListScreen: Lista de elementos principales de la aplicación  
3. DetailScreen: Vista detallada de elementos individuales
4. FormScreen: Formulario para crear/editar elementos
5. ProfileScreen: Perfil de usuario
6. SettingsScreen: Configuraciones de la aplicación

FUNCIONALIDADES BASE:
- Sistema de autenticación (login/registro)
- CRUD completo de elementos principales
- Navegación fluida entre pantallas
- Formularios con validación
- Estados de carga y error
- Búsqueda y filtros
- Persistencia de datos

ESPECIFICACIONES TÉCNICAS:
- Flutter con Material Design 3
- GoRouter para navegación
- Provider o Riverpod para manejo de estado
- Validación de formularios reactiva
- Diseño responsive
- Componentes reutilizables

TOTAL DE PANTALLAS: 6 principales + pantallas de autenticación
    `;
  }

  /**
   * Genera prompt genérico como fallback
   */
  private generateGenericEnrichedPrompt(originalPrompt: string): string {
    const genericTemplate = this.getGenericTemplate();
    return this.generateDomainSpecificPrompt(originalPrompt, genericTemplate);
  }
} 