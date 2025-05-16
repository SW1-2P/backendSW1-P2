import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUsuarioDto: CreateUsuarioDto) {
    try {
      const usuario = await this.usuariosService.create(createUsuarioDto);
      
      // Generar JWT
      const payload: JwtPayload = { 
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol
      };

      return {
        token: this.jwtService.sign(payload),
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol
        }
      };
    } catch (error) {
      if (error.code === '23505') { // Código PostgreSQL para violación de unicidad
        throw new ConflictException('El correo electrónico ya está registrado');
      }
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;
      
      // Buscar usuario con password (select: true para incluir password)
      const usuario = await this.usuariosService.findByEmail(email, true);
      
      // Verificar password
      const passwordValid = await bcrypt.compare(password, usuario.password);
      
      if (!passwordValid) {
        throw new UnauthorizedException('Credenciales incorrectas');
      }

      // Generar JWT
      const payload: JwtPayload = { 
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol
      };

      return {
        token: this.jwtService.sign(payload),
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol
        }
      };
    } catch (error) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }
  }

  validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (error) {
      return null;
    }
  }
} 