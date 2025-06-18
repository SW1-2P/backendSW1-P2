import { Injectable, Logger } from '@nestjs/common';
import { ChatgptService } from '../../chatgpt/chatgpt.service';

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
    
    // SIEMPRE usar IA para interpretación dinámica (no detectar dominios hardcodeados)
    if (process.env.OPENAI_API_KEY) {
      try {
        this.logger.debug(`🤖 Enviando prompt a IA para interpretación completa`);
        const aiInterpretedPrompt = await this.sendToAIForInterpretation(originalPrompt);
        this.logger.debug(`✅ IA interpretó y enriqueció el prompt exitosamente`);
        return aiInterpretedPrompt;
      } catch (error) {
        this.logger.error(`❌ Error en interpretación de IA: ${error.message}`);
        this.logger.warn(`⚠️ Fallback a interpretación básica`);
      }
    } else {
      this.logger.warn(`⚠️ Sin API key de OpenAI - usando interpretación básica`);
    }
    
    // Fallback final: interpretación básica sin categorización
    return this.generateBasicInterpretation(originalPrompt);
  }

  /**
   * Genera interpretación básica sin categorización hardcodeada
   */
  private generateBasicInterpretation(originalPrompt: string): string {
    return `
ESPECIFICACIÓN TÉCNICA BÁSICA PARA o3:

🎯 **ANÁLISIS DE LA APLICACIÓN SOLICITADA**
${originalPrompt}

📱 **PÁGINAS PRINCIPALES:**
Basándose en el propósito de la aplicación, se generarán las pantallas necesarias para cumplir con la funcionalidad solicitada.

🏗️ **ARQUITECTURA FLUTTER ESPECÍFICA**
- Flutter con Material Design 3
- GoRouter para navegación
- StatefulWidget con setState() para manejo de estado
- Estructura modular y componentes reutilizables

🎨 **DISEÑO UI**
- Material Design 3 con useMaterial3: true
- Diseño responsive y intuitivo
- Navegación apropiada según el número de pantallas

🔄 **FUNCIONALIDADES**
Las funcionalidades específicas se determinarán basándose en el propósito de la aplicación solicitada por el usuario.

NOTA: Esta es una especificación básica. Para obtener especificaciones más detalladas, se recomienda usar el análisis de IA.
    `;
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

1. 🎯 ANÁLISIS COMPLETO DE LA APLICACIÓN:
   - Analizar EXACTAMENTE qué quiere el usuario
   - Interpretar el propósito específico y funcionalidades requeridas
   - Definir el público objetivo y casos de uso principales

2. 📱 PÁGINAS ESPECÍFICAS DETALLADAS:
   Para cada página que identifiques como necesaria, especificar:
   - Nombre exacto de la clase (ej: [Nombre]Screen basado en la funcionalidad)
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
   - Bottom navigation o drawer específico según sea necesario
   - Deep linking structure

6. 💾 GESTIÓN DE DATOS ESPECÍFICA:
   - Modelos de datos exactos con tipos
   - Métodos CRUD específicos
   - Estados locales con StatefulWidget
   - Validación de formularios específica

GENERA UNA ESPECIFICACIÓN TÉCNICA COMPLETA Y DETALLADA que contenga:

ESPECIFICACIÓN TÉCNICA DETALLADA PARA o3:

🎯 **ANÁLISIS DE LA APLICACIÓN SOLICITADA**
${originalPrompt}

📱 **PÁGINAS PRINCIPALES OBLIGATORIAS:**
[Determinar según análisis - mínimo las necesarias para cumplir el propósito]

1. [NombreScreen]: [Propósito específico y funcionalidad detallada]
   - UI COMPONENTS: [widgets específicos]
   - FORMULARIOS: [campos y validaciones exactas si aplica]
   - ACCIONES: [funciones específicas del usuario]
   - NAVEGACIÓN: [hacia qué pantallas conecta]

[Continuar para cada página necesaria con MÁXIMO DETALLE]

🏗️ **ARQUITECTURA FLUTTER ESPECÍFICA**
- ESTRUCTURA DE DIRECTORIOS: [exacta según funcionalidad]
- ARCHIVOS NECESARIOS: [lista completa]
- MODELOS DE DATOS: [con propiedades específicas según los datos requeridos]
- SERVICIOS: [métodos específicos para la funcionalidad]

🎨 **DISEÑO UI DETALLADO**
- LAYOUT ESPECÍFICO: [widgets y estructura según funcionalidad]
- NAVEGACIÓN: [BottomNav/Drawer según número de pantallas]
- COLORES Y TEMA: [Material Design 3 apropiado para el propósito]

🔄 **FLUJO DE NAVEGACIÓN COMPLETO**
- ROUTES: [paths específicos con GoRouter según pantallas identificadas]
- TRANSICIONES: [entre pantallas específicas]

IMPORTANTE: 
- Analiza el propósito específico del usuario y genera páginas relevantes
- No uses términos genéricos sino nombres específicos relacionados a la funcionalidad
- Especifica TODOS los campos de formularios, botones, y funcionalidades necesarias
- Da suficiente detalle para que o3 pueda generar código Flutter completo y funcional
- Base todo en lo que el usuario realmente necesita, no en categorías predefinidas
    `;

    try {
      const messages = [
        { role: 'system', content: 'Eres un arquitecto de software senior especializado en Flutter que analiza requerimientos de usuario y genera especificaciones técnicas ultra-detalladas personalizadas para cada necesidad específica.' },
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
} 