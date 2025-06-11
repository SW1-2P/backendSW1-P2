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
    
    this.logger.log('Servicio de ChatGPT inicializado con o3');
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

      // o3 tiene restricciones específicas
      if (model.startsWith('o3')) {
        requestParams.max_completion_tokens = 4000;
        // o3 solo acepta temperature = 1 (valor por defecto)
        requestParams.temperature = 1;
      } else {
        requestParams.max_tokens = 4000;
        requestParams.temperature = temperature;
      }

      const response = await this.openai.chat.completions.create(requestParams);

      this.logger.debug(`✅ Respuesta de ${model} recibida correctamente`);
      
      return response.choices[0].message.content || '';
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
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];
    
    // o3 usa temperature = 1 automáticamente
    return this.chat(messages, 'o3', 1);
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
}