import { PartialType } from '@nestjs/mapped-types';
import { CreateMobileAppDto } from './create-mobile-app.dto';
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMobileAppDto extends PartialType(CreateMobileAppDto) {
  @ApiProperty({
    description: 'Nombre de la aplicación móvil',
    example: 'Mi App Actualizada',
    required: false,
  })
  @IsOptional()
  @IsString()
  nombre?: string;
} 