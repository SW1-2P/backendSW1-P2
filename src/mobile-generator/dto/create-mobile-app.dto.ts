import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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

  // Campo interno, se asigna automáticamente por el sistema
  @IsOptional()
  @IsUUID()
  user_id?: string;
} 