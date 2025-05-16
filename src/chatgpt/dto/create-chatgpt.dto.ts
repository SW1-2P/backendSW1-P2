import { IsString, IsNotEmpty, IsArray, ValidateNested, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class MessageDto {
  @IsEnum(['system', 'user', 'assistant'])
  role: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}

export class GenerateTextDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;
  
  @IsOptional()
  @IsString()
  model?: string;
  
  @IsOptional()
  maxTokens?: number;
  
  @IsOptional()
  temperature?: number;
}

export class ChatCompletionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  messages: MessageDto[];
  
  @IsOptional()
  @IsString()
  model?: string;
  
  @IsOptional()
  temperature?: number;
}

export class CreateChatgptDto {}
