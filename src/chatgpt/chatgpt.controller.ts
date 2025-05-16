import { Controller, Post, Body, BadRequestException, Res, HttpStatus } from '@nestjs/common';
import { ChatgptService } from './chatgpt.service';
import { GenerateTextDto, ChatCompletionDto } from './dto/create-chatgpt.dto';
import { XmlToAngularDto } from './dto/xml-to-angular.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { json } from 'body-parser';

@ApiTags('ChatGPT')
@Controller('chatgpt')
export class ChatgptController {
  constructor(private readonly chatgptService: ChatgptService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Genera texto utilizando OpenAI' })
  @ApiResponse({ status: 200, description: 'Texto generado con éxito' })
  @ApiResponse({ status: 400, description: 'Solicitud inválida' })
  @ApiResponse({ status: 500, description: 'Error del servidor' })
  async generateText(@Body() generateTextDto: GenerateTextDto) {
    if (!generateTextDto.prompt) {
      throw new BadRequestException('El prompt es requerido');
    }
    return {
      text: await this.chatgptService.generateText(
        generateTextDto.prompt,
        generateTextDto.model,
        generateTextDto.maxTokens,
        generateTextDto.temperature
      )
    };
  }

  @Post('chat')
  @ApiOperation({ summary: 'Genera una respuesta de chat utilizando OpenAI' })
  @ApiResponse({ status: 200, description: 'Respuesta generada con éxito' })
  @ApiResponse({ status: 400, description: 'Solicitud inválida' })
  @ApiResponse({ status: 500, description: 'Error del servidor' })
  async chat(@Body() chatCompletionDto: ChatCompletionDto) {
    if (!chatCompletionDto.messages || !Array.isArray(chatCompletionDto.messages) || chatCompletionDto.messages.length === 0) {
      throw new BadRequestException('Se requiere un array de mensajes válido');
    }
    return {
      response: await this.chatgptService.chat(
        chatCompletionDto.messages,
        chatCompletionDto.model,
        chatCompletionDto.temperature
      )
    };
  }

  @Post('generate-angular')
  @ApiOperation({ summary: 'Genera un proyecto Angular a partir de XML utilizando OpenAI' })
  @ApiResponse({ status: 200, description: 'Proyecto Angular generado con éxito' })
  @ApiResponse({ status: 400, description: 'Solicitud inválida' })
  @ApiResponse({ status: 500, description: 'Error del servidor' })
  @ApiConsumes('application/json')
  @ApiBody({
    type: XmlToAngularDto,
    examples: {
      ejemplo1: {
        summary: 'Ejemplo básico',
        value: {
          xml: '<App><Interface name="Test"></Interface></App>',
          specificInstructions: 'Incluir un dashboard con gráficos'
        }
      }
    }
  })
  async generateAngularFromXml(
    @Body() xmlToAngularDto: XmlToAngularDto,
    @Res() res: Response
  ) {
    try {
      if (!xmlToAngularDto.xml) {
        throw new BadRequestException('El contenido XML es requerido');
      }

      // Llamar al servicio para generar el proyecto Angular
      const zipBuffer = await this.chatgptService.generateAngularFromXml(
        xmlToAngularDto.xml,
        xmlToAngularDto.specificInstructions,
        xmlToAngularDto.model
      );

      // Configurar la respuesta para descargar un archivo ZIP
      res.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename=angular-openai-project.zip',
      });

      res.status(HttpStatus.OK).send(zipBuffer);
    } catch (error) {
      // Manejar errores
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error generando proyecto Angular con OpenAI',
        error: error.message,
      });
    }
  }
}
