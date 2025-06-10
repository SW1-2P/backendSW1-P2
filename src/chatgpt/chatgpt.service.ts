import OpenAI from 'openai';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatgptService {
  private openai: OpenAI;
  private readonly logger = new Logger(ChatgptService.name);

  constructor() {
    // Obtener la API key desde las variables de entorno
    const apiKey = process.env.OPENAI_API_KEY || '';
    
    // Para desarrollo, si no hay API key en .env, usar una clave hardcodeada
    // (¡solo para desarrollo! Eliminar en producción)
    const fallbackApiKey = 'sk-test-key123456789'; // Reemplazar con tu API key real para desarrollo
    
    // Usar la API key del entorno o el fallback
    const finalApiKey = apiKey || fallbackApiKey;
    
    if (!finalApiKey) {
      this.logger.error('La API key de OpenAI no está configurada');
      throw new Error('OPENAI_API_KEY no está configurada en las variables de entorno');
    }
    
    this.openai = new OpenAI({
      apiKey: finalApiKey,
    });
    
    this.logger.log('Servicio de ChatGPT inicializado correctamente');
  }

  /**
   * Genera texto usando el modelo de completions de OpenAI
   * @param prompt El prompt para generar texto
   * @param model Modelo a usar (por defecto gpt-3.5-turbo-instruct)
   * @param maxTokens Máximo número de tokens
   * @param temperature Temperatura para creatividad
   * @returns Texto generado
   */
  async generateText(prompt: string, model = 'gpt-3.5-turbo-instruct', maxTokens = 500, temperature = 0.7): Promise<string> {
    try {
      this.logger.debug(`Generando texto con prompt: ${prompt.substring(0, 50)}...`);
      
      const response = await this.openai.completions.create({
        model,
        prompt,
        max_tokens: maxTokens,
        temperature,
      });

      return response.choices[0].text.trim();
    } catch (error) {
      this.logger.error(`Error al llamar a la API de OpenAI: ${error.message}`, error.stack);
      
      if (error.status === 429) {
        throw new InternalServerErrorException('Límite de solicitudes a OpenAI excedido. Intente de nuevo más tarde.');
      }
      
      throw new InternalServerErrorException('Error al generar texto con OpenAI');
    }
  }

  /**
   * Realiza una conversación con ChatGPT usando el modelo de chat
   * @param messages Array de mensajes con role y content
   * @param model Modelo a usar (por defecto gpt-3.5-turbo)
   * @param temperature Temperatura para creatividad
   * @returns Respuesta del modelo
   */
  async chat(messages: Array<{ role: string; content: string }>, model = 'gpt-3.5-turbo', temperature = 0.7): Promise<string> {
    try {
      this.logger.debug(`Generando respuesta de chat con ${messages.length} mensajes`);
      
      // Asegurarse de que los mensajes tengan el formato correcto que espera OpenAI
      const validatedMessages = messages.map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content
      }));
      
      const response = await this.openai.chat.completions.create({
        model,
        messages: validatedMessages,
        temperature,
      });

      this.logger.debug('Respuesta de OpenAI recibida correctamente');
      
      return response.choices[0].message.content || '';
    } catch (error) {
      this.logger.error(`Error al llamar a la API de OpenAI: ${error.message}`, error.stack);
      
      if (error.status === 429) {
        throw new InternalServerErrorException('Límite de solicitudes a OpenAI excedido. Intente de nuevo más tarde.');
      }
      
      throw new InternalServerErrorException('Error al generar respuesta de chat con OpenAI');
    }
  }
}