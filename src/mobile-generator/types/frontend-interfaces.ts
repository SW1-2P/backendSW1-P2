/**
 * 📋 Interfaces TypeScript para Frontend - Mobile Generator
 * 
 * Copia este archivo a tu proyecto frontend para tener tipado completo
 */

// ==========================================
// 🆕 NUEVO ENDPOINT: from-prompt
// ==========================================

/**
 * Request para crear aplicación desde prompt
 */
export interface CreateFromPromptRequest {
  /** Descripción de la aplicación (requerido) */
  prompt: string;
  
  /** Nombre de la aplicación (opcional - se genera automáticamente) */
  nombre?: string;
  
  /** Tipo de proyecto (opcional - default: flutter) */
  project_type?: ProjectType;
  
  /** Configuración adicional (opcional) */
  config?: ProjectConfig;
}

/**
 * Response de creación desde prompt
 */
export interface CreateFromPromptResponse {
  /** UUID de la aplicación creada */
  id: string;
  
  /** Nombre de la aplicación */
  nombre: string;
  
  /** Prompt ENRIQUECIDO automáticamente por la IA */
  prompt: string;
  
  /** Tipo de proyecto */
  project_type: ProjectType;
  
  /** Configuración del proyecto */
  config?: ProjectConfig;
  
  /** ID del usuario propietario */
  user_id: string;
  
  /** Fecha de creación */
  createdAt: string;
  
  /** Fecha de última actualización */
  updatedAt: string;
}

// ==========================================
// 📄 ENDPOINT EXISTENTE: XML/mockup  
// ==========================================

/**
 * Request para crear aplicación desde XML/mockup (EXISTENTE)
 */
export interface CreateFromXmlRequest {
  /** Contenido XML del mockup (opcional) */
  xml?: string;
  
  /** Prompt adicional (opcional) */
  prompt?: string;
  
  /** ID del mockup de referencia (opcional) */
  mockup_id?: string;
  
  /** Nombre de la aplicación (opcional) */
  nombre?: string;
  
  /** Tipo de proyecto (opcional) */
  project_type?: ProjectType;
  
  /** Configuración adicional (opcional) */
  config?: ProjectConfig;
}

/**
 * Response de creación desde XML/mockup
 */
export interface CreateFromXmlResponse {
  id: string;
  nombre: string;
  xml?: string;
  prompt?: string;
  mockup_id?: string;
  project_type: ProjectType;
  config?: ProjectConfig;
  user_id: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 🔄 TIPOS COMPARTIDOS
// ==========================================

/**
 * Tipos de proyecto soportados
 */
export type ProjectType = 'flutter' | 'angular';

/**
 * Configuración del proyecto
 */
export interface ProjectConfig {
  /** Nombre del paquete (ej: com.empresa.app) */
  package_name?: string;
  
  /** Versión de la aplicación */
  version?: string;
  
  /** Descripción corta */
  description?: string;
  
  /** Características específicas */
  features?: string[];
  
  /** Tema de la aplicación */
  theme?: string;
}

/**
 * Aplicación móvil (response general)
 */
export interface MobileApp {
  id: string;
  nombre: string;
  xml?: string;
  prompt?: string;
  mockup_id?: string;
  project_type: ProjectType;
  config?: ProjectConfig;
  user_id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request para actualizar aplicación
 */
export interface UpdateMobileAppRequest {
  nombre?: string;
  xml?: string;
  prompt?: string;
  mockup_id?: string;
  project_type?: ProjectType;
  config?: ProjectConfig;
}

// ==========================================
// 🛠️ UTILIDADES FRONTEND
// ==========================================

/**
 * Estados de la aplicación frontend
 */
export interface AppState {
  /** Está creando la aplicación */
  creando: boolean;
  
  /** Está generando el proyecto */
  generando: boolean;
  
  /** Error actual (null si no hay error) */
  error: string | null;
  
  /** Aplicación actual */
  app: MobileApp | null;
}

/**
 * Configuración de endpoints
 */
export interface ApiEndpoints {
  /** Crear desde XML/mockup */
  crearDesdeXml: string;
  
  /** Crear desde prompt */
  crearDesdePrompt: string;
  
  /** Generar proyecto */
  generar: (id: string) => string;
  
  /** Listar aplicaciones */
  listar: string;
  
  /** Obtener aplicación específica */
  obtener: (id: string) => string;
  
  /** Actualizar aplicación */
  actualizar: (id: string) => string;
  
  /** Eliminar aplicación */
  eliminar: (id: string) => string;
}

/**
 * Errores de validación
 */
export interface ValidationErrors {
  prompt?: string;
  nombre?: string;
  xml?: string;
  mockup_id?: string;
  config?: string;
}

/**
 * Ejemplos de prompts por categoría
 */
export interface PromptExamples {
  basicos: string[];
  detallados: string[];
  porDominio: {
    [domain: string]: string[];
  };
}

// ==========================================
// 🎯 CONSTANTES ÚTILES
// ==========================================

export const PROJECT_TYPES: ProjectType[] = ['flutter', 'angular'];

export const DEFAULT_PROJECT_TYPE: ProjectType = 'flutter';

export const PROMPT_MIN_LENGTH = 10;
export const PROMPT_MAX_LENGTH = 2000;
export const NOMBRE_MAX_LENGTH = 50;

export const EJEMPLO_PROMPTS: PromptExamples = {
  basicos: [
    "crea una app móvil de gestión contable",
    "crea una app de delivery de comida", 
    "crea una app de citas médicas",
    "crea una app escolar para estudiantes",
    "crea una app de gimnasio y fitness"
  ],
  detallados: [
    "crea una aplicación móvil de gestión contable con login, formularios de transacciones, reportes financieros, dashboard con gráficos y categorización de gastos",
    "crea una app de delivery con catálogo de restaurantes, carrito de compras, tracking en tiempo real, métodos de pago y sistema de ratings"
  ],
  porDominio: {
    finanzas: [
      "app de gestión contable",
      "app de control de gastos personales",
      "app de inversiones y portfolio"
    ],
    salud: [
      "app de citas médicas",
      "app de seguimiento de medicamentos",
      "app de fitness y nutrición"
    ],
    educacion: [
      "app escolar para estudiantes",
      "app de cursos online",
      "app de gestión universitaria"
    ]
  }
};

// ==========================================
// 🔧 HELPER FUNCTIONS TYPE
// ==========================================

/**
 * Función para crear aplicación desde prompt
 */
export type CreateFromPromptFunction = (
  request: CreateFromPromptRequest
) => Promise<CreateFromPromptResponse>;

/**
 * Función para crear aplicación desde XML
 */
export type CreateFromXmlFunction = (
  request: CreateFromXmlRequest  
) => Promise<CreateFromXmlResponse>;

/**
 * Función para generar proyecto
 */
export type GenerateProjectFunction = (
  appId: string
) => Promise<Blob>;

/**
 * Función para validar formulario de prompt
 */
export type ValidatePromptFunction = (
  data: Partial<CreateFromPromptRequest>
) => ValidationErrors; 