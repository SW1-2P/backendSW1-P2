import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectType } from '../entities/mobile-app.entity';

export class AnalyzeImageDto {
  @ApiProperty({
    description: 'Imagen en formato base64',
    example: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...'
  })
  @IsString()
  @IsNotEmpty()
  image: string;

  @ApiProperty({
    description: 'Tipo de proyecto a generar',
    enum: ProjectType,
    default: ProjectType.FLUTTER
  })
  @IsEnum(ProjectType)
  @IsOptional()
  projectType?: ProjectType = ProjectType.FLUTTER;
} 