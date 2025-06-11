import { IsString, IsNotEmpty, IsArray, ValidateNested, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class MessageDto {
  @ApiProperty({ 
    description: 'Rol del mensaje', 
    enum: ['system', 'user', 'assistant'],
    example: 'user'
  })
  @IsEnum(['system', 'user', 'assistant'])
  role: string;

  @ApiProperty({ 
    description: 'Contenido del mensaje',
    example: 'Genera una aplicación Flutter desde este mockup XML...'
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class ChatCompletionDto {
  @ApiProperty({ 
    description: 'Array de mensajes para la conversación',
    type: [MessageDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  messages: MessageDto[];
  
  @ApiProperty({ 
    description: 'Modelo de OpenAI a usar', 
    example: 'o3',
    default: 'o3',
    required: false
  })
  @IsOptional()
  @IsString()
  model?: string;
  
  @ApiProperty({ 
    description: 'Temperatura para creatividad (0.0 - 1.0)', 
    example: 0.7,
    default: 0.7,
    required: false
  })
  @IsOptional()
  temperature?: number;
}

export class CreateChatgptDto {}
