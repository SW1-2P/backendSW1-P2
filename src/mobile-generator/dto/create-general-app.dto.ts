import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectType } from '../entities/mobile-app.entity';

export class CreateGeneralAppDto {
  @ApiProperty({
    description: 'Prompt simple para generar la aplicación automáticamente',
    example: 'una app educativa',
    examples: [
      'una app de gimnasio',
      'app de delivery de comida', 
      'aplicación educativa',
      'app de finanzas personales',
      'red social simple',
      'app médica',
      'tienda online'
    ]
  })
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @ApiProperty({
    description: 'Tipo de proyecto a generar',
    enum: ProjectType,
    default: ProjectType.FLUTTER
  })
  @IsEnum(ProjectType)
  @IsOptional()
  projectType?: ProjectType = ProjectType.FLUTTER;
} 