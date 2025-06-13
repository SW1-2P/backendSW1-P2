import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ChatgptService } from './chatgpt.service';
import { ChatCompletionDto } from './dto/create-chatgpt.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('ChatGPT')
@Controller('chatgpt')
export class ChatgptController {
  constructor(private readonly chatgptService: ChatgptService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Genera respuestas usando o3 para propósitos específicos' })
  @ApiResponse({ status: 200, description: 'Respuesta generada con éxito usando o3' })
  @ApiResponse({ status: 400, description: 'Solicitud inválida' })
  @ApiResponse({ status: 500, description: 'Error del servidor' })
  async chat(@Body() chatCompletionDto: ChatCompletionDto) {
    if (!chatCompletionDto.messages || !Array.isArray(chatCompletionDto.messages) || chatCompletionDto.messages.length === 0) {
      throw new BadRequestException('Se requiere un array de mensajes válido');
    }
    
    return {
      response: await this.chatgptService.chat(
        chatCompletionDto.messages,
        chatCompletionDto.model || 'o3', // Por defecto o3
        chatCompletionDto.temperature || 0.7
      )
    };
  }
}
