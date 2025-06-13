import { IsString, IsOptional, IsEnum, IsObject, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectType } from '../entities/mobile-app.entity';

export class CreateFromPromptDto {
  @ApiProperty({
    description: 'Descripción de la aplicación móvil que desea crear',
    example: 'crea una aplicación móvil de gestión contable con login, formularios de transacciones, reportes y dashboard',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'El prompt es requerido' })
  prompt: string;

  @ApiProperty({
    description: 'Nombre de la aplicación móvil (opcional, se genera automáticamente si no se proporciona)',
    example: 'Mi App Contable',
    required: false,
  })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiProperty({
    description: 'Tipo de proyecto a generar',
    enum: ProjectType,
    default: ProjectType.FLUTTER,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProjectType)
  project_type?: ProjectType;

  @ApiProperty({
    description: 'Configuración adicional del proyecto',
    example: {
      package_name: 'com.example.myapp',
      version: '1.0.0',
      description: 'My awesome mobile app',
      features: ['auth', 'crud', 'notifications'],
      theme: 'material'
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  config?: {
    package_name?: string;
    version?: string;
    description?: string;
    features?: string[];
    theme?: string;
  };
} 