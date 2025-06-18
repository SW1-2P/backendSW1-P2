import OpenAI from 'openai';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatgptService {
  private openai: OpenAI;
  private readonly logger = new Logger(ChatgptService.name);

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      this.logger.error('La API key de OpenAI no está configurada');
      throw new Error('OPENAI_API_KEY no está configurada en las variables de entorno');
    }
    
    this.openai = new OpenAI({
      apiKey,
    });
    
    this.logger.log('Servicio de ChatGPT inicializado: o3 para código, 4o para interpretación');
  }

  /**
   * Genera respuestas usando o3 para generación de código Flutter/Angular
   * @param messages Array de mensajes con role y content
   * @param model Modelo a usar (por defecto o3 para mejor calidad)
   * @param temperature Temperatura para creatividad (por defecto 0.7)
   * @returns Respuesta del modelo
   */
  async chat(messages: Array<{ role: string; content: string }>, model = 'o3', temperature = 1): Promise<string> {
    try {
      this.logger.debug(`🤖 Generando código con ${model} - ${messages.length} mensajes`);
      
      // Validar mensajes para OpenAI
      const validatedMessages = messages.map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content
      }));
      
      // Configurar parámetros según el modelo
      const requestParams: any = {
        model,
        messages: validatedMessages,
      };

      // Configurar parámetros según el modelo
      if (model.startsWith('o3')) {
        // o3 necesita más tokens: reasoning_tokens + completion_tokens
        requestParams.max_completion_tokens = 8000;
        requestParams.temperature = 1; // o3 solo acepta temperature = 1
      } else if (model === 'gpt-4o' || model === 'gpt-4o-mini') {
        // GPT-4o usa max_tokens estándar
        requestParams.max_tokens = 4000;
        requestParams.temperature = temperature;
      } else {
        // Otros modelos (gpt-4, gpt-3.5-turbo, etc.)
        requestParams.max_tokens = 4000;
        requestParams.temperature = temperature;
      }

      const response = await this.openai.chat.completions.create(requestParams);

      const content = response.choices[0]?.message?.content || '';
      
      this.logger.debug(`✅ Respuesta de ${model} recibida: ${content.length} chars`);
      
      // Debugging específico para o3
      if (model.startsWith('o3')) {
        this.logger.debug(`🔍 o3 response details: choices=${response.choices?.length}, finish_reason=${response.choices[0]?.finish_reason}`);
        if (content.length === 0) {
          this.logger.debug(`❌ o3 returned empty content. Full response:`, JSON.stringify(response, null, 2));
        }
      }
      
      return content;
    } catch (error) {
      this.logger.error(`❌ Error al llamar a la API de OpenAI: ${error.message}`, error.stack);
      
      if (error.status === 429) {
        throw new InternalServerErrorException('Límite de solicitudes a OpenAI excedido. Intente de nuevo más tarde.');
      }
      
      if (error.status === 400) {
        throw new InternalServerErrorException('Error en el formato de la solicitud a OpenAI. Verifique los parámetros.');
      }
      
      if (error.status === 401) {
        throw new InternalServerErrorException('API key de OpenAI inválida o expirada.');
      }
      
      throw new InternalServerErrorException(`Error al generar respuesta con ${model}: ${error.message}`);
    }
  }

  /**
   * Método especializado para generación de código Flutter
   * Optimizado para prompts largos y respuestas complejas
   */
  async generateFlutterCode(systemPrompt: string, userPrompt: string): Promise<string> {
    // Intentar o3 primero con prompts optimizados
    try {
      this.logger.debug('🚀 Intentando generación con o3...');
      
      // Crear prompts específicamente optimizados para o3
      const o3SystemPrompt = this.optimizePromptForO3(systemPrompt);
      const o3UserPrompt = this.optimizePromptForO3(userPrompt);
      
      this.logger.debug(`📏 Longitud prompts para o3: system=${o3SystemPrompt.length}, user=${o3UserPrompt.length}`);
      
      const messages = [
        { role: 'system', content: o3SystemPrompt },
        { role: 'user', content: o3UserPrompt }
      ];
      
      const result = await this.chat(messages, 'o3', 1);
      
      // Verificar que o3 devolvió contenido válido
      if (result && result.trim().length > 100) {
        this.logger.debug(`✅ o3 generó código exitosamente (${result.length} chars)`);
        return result;
      } else {
        this.logger.warn(`⚠️ o3 devolvió respuesta vacía o muy corta (${result?.length || 0} chars)`);
        throw new Error('o3 response too short or empty');
      }
    } catch (error) {
      this.logger.error(`❌ Error con o3: ${error.message}`);
      this.logger.debug('🔄 Fallback a GPT-4o para generación de código...');
      
      // Fallback a GPT-4o con prompts originales
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];
      
      return this.chat(messages, 'gpt-4o', 0.2);
    }
  }

  /**
   * Optimiza prompts para o3 reduciéndolos y simplificándolos
   * NO truncar cuando el prompt contiene XML completo de mockup
   */
  private optimizePromptForO3(prompt: string): string {
    // Si el prompt contiene XML de mockup, NO truncar para preservar toda la información
    if (prompt.includes('XML MOCKUP COMPLETO') || prompt.includes('<mxfile') || prompt.includes('<mxGraphModel')) {
      this.logger.debug(`📋 Prompt contiene XML de mockup completo - NO se truncará (${prompt.length} chars)`);
      return prompt;
    }
    
    // o3 usa muchos tokens para reasoning, necesitamos prompts MUY cortos solo para otros casos
    if (prompt.length > 1500) {
      this.logger.debug(`🔧 Reduciendo prompt de ${prompt.length} a ~1500 chars para o3`);
      
      // Para o3: SOLO lo esencial
      const lines = prompt.split('\n');
      const criticalLines = lines.filter(line => {
        const lower = line.toLowerCase();
        return (
          lower.includes('screen:') ||
          lower.includes('homescreen') ||
          lower.includes('doctorsscreen') ||
          lower.includes('appointmentscreen') ||
          lower.includes('prescriptionsscreen') ||
          lower.includes('medicalhistoryscreen') ||
          lower.includes('profilescreen') ||
          lower.includes('settingsscreen') ||
          lower.includes('loginscreen') ||
          lower.includes('registerscreen') ||
          line.trim().length < 80
        );
      });
      
      // Máximo 20 líneas para o3
      return criticalLines.slice(0, 20).join('\n');
    }
    
    return prompt;
  }

  /**
   * Método especializado para generación de código Angular
   * Optimizado para componentes y servicios Angular
   */
  async generateAngularCode(systemPrompt: string, userPrompt: string): Promise<string> {
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];
    
    // o3 usa temperature = 1 automáticamente
    return this.chat(messages, 'o3', 1);
  }

  /**
   * Genera respuestas usando GPT-4 Vision para análisis de imágenes
   * @param messages Array de mensajes que pueden incluir imágenes
   * @param options Opciones adicionales como maxTokens y temperature
   * @returns Respuesta del modelo
   */
  async generateResponseWithVision(
    messages: Array<{ 
      role: 'system' | 'user' | 'assistant'; 
      content: string | Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string; detail?: string } }> 
    }>,
    options: { maxTokens?: number; temperature?: number } = {}
  ): Promise<string> {
    try {
      this.logger.debug(`🔍 Analizando imagen con GPT-4 Vision - ${messages.length} mensajes`);
      
      const { maxTokens = 2000, temperature = 0.7 } = options;
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o', // gpt-4o tiene capacidades de visión
        messages: messages as any,
        max_tokens: maxTokens,
        temperature: temperature,
      });

      this.logger.debug(`✅ Respuesta de GPT-4 Vision recibida correctamente`);
      
      return response.choices[0].message.content || '';
    } catch (error) {
      this.logger.error(`❌ Error al llamar a GPT-4 Vision: ${error.message}`, error.stack);
      
      if (error.status === 429) {
        throw new InternalServerErrorException('Límite de solicitudes a OpenAI excedido. Intente de nuevo más tarde.');
      }
      
      if (error.status === 400) {
        throw new InternalServerErrorException('Error en el formato de la solicitud a OpenAI Vision. Verifique la imagen y parámetros.');
      }
      
      if (error.status === 401) {
        throw new InternalServerErrorException('API key de OpenAI inválida o expirada.');
      }
      
      throw new InternalServerErrorException(`Error al analizar imagen con GPT-4 Vision: ${error.message}`);
    }
  }
}