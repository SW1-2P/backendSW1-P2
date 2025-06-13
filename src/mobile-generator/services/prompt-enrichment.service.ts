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
   * Enriquece un prompt básico identificando automáticamente el dominio y generando páginas específicas
   * @param originalPrompt Prompt original del usuario
   * @returns Prompt enriquecido con páginas y funcionalidades específicas del dominio
   */
  async enrichPrompt(originalPrompt: string): Promise<string> {
    try {
      this.logger.debug(`🤖 Enriqueciendo prompt con páginas específicas: "${originalPrompt.substring(0, 50)}..."`);
      this.logger.debug(`📏 Longitud del prompt original: ${originalPrompt.length} caracteres`);
      
      // 1. Detectar dominio automáticamente
      const detectedDomain = this.detectDomainAdvanced(originalPrompt);
      this.logger.debug(`🔍 Dominio detectado: ${detectedDomain.name}`);
      
      // 2. Generar páginas específicas del dominio
      const enrichedPrompt = this.generateDomainSpecificPrompt(originalPrompt, detectedDomain);
      
      this.logger.debug(`📏 Prompt enriquecido: ${enrichedPrompt.length} caracteres`);
      this.logger.debug(`✅ Prompt enriquecido con ${detectedDomain.requiredPages.length} páginas específicas`);
      
      return enrichedPrompt;
      
    } catch (error) {
      this.logger.error(`❌ Error enriqueciendo prompt: ${error.message}`);
      // Fallback: usar plantilla genérica
      this.logger.debug(`🔄 Usando plantilla genérica como fallback`);
      return this.generateGenericEnrichedPrompt(originalPrompt);
    }
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
        keywords: ['medico', 'hospital', 'paciente', 'cita', 'salud', 'clinica', 'doctor'],
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
   * Genera prompt genérico como fallback
   */
  private generateGenericEnrichedPrompt(originalPrompt: string): string {
    const genericTemplate = this.getGenericTemplate();
    return this.generateDomainSpecificPrompt(originalPrompt, genericTemplate);
  }
} 