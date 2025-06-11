import { IsString, IsOptional, IsUUID, IsEnum, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectType } from '../entities/mobile-app.entity';

export class CreateMobileAppDto {
  @ApiProperty({
    description: 'Nombre de la aplicación móvil (opcional, se genera automáticamente si no se proporciona)',
    example: 'Mi App Flutter',
    required: false,
  })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiProperty({
    description: 'Contenido XML del mockup/diagrama (del frontend)',
    example: '<App><Screen name="Login"><Button>Login</Button></Screen></App>',
    required: false,
  })
  @IsOptional()
  @IsString()
  xml?: string;

  @ApiProperty({
    description: 'Prompt directo describiendo la aplicación que quiere crear',
    example: 'crea una aplicación escolar con login, registro de estudiantes, vista de notas y panel administrativo',
    required: false,
  })
  @IsOptional()
  @IsString()
  prompt?: string;

  @ApiProperty({
    description: 'ID del mockup de referencia (desde @/pages)',
    example: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  mockup_id?: string;

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

  // Campo interno, se asigna automáticamente por el sistema
  @IsOptional()
  @IsUUID()
  user_id?: string;
} 