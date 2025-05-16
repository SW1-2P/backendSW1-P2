import { IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import { Rol } from '../entities/usuario.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUsuarioDto {
  @ApiProperty({ 
    example: 'Juan Pérez', 
    description: 'Nombre completo del usuario' 
  })
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ 
    example: 'juan.perez@example.com', 
    description: 'Correo electrónico único del usuario' 
  })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    example: 'password123', 
    description: 'Contraseña del usuario (mínimo 6 caracteres)' 
  })
  @MinLength(6)
  password: string;

  @ApiProperty({ 
    example: 'editor', 
    description: 'Rol del usuario (admin o editor)', 
    enum: Rol 
  })
  @IsEnum(Rol)
  rol: Rol;
}