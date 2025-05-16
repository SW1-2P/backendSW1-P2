import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

/**
 * Servicio para gestionar operaciones relacionadas con usuarios
 */
@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  /**
   * Crea un nuevo usuario
   * @param createUsuarioDto Datos para crear el usuario
   * @returns Usuario creado
   * @throws ConflictException si el email ya está registrado
   */
  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    try {
      const hashedPassword = await bcrypt.hash(createUsuarioDto.password, 10);
      const usuario = this.usuarioRepository.create({
        ...createUsuarioDto,
        password: hashedPassword,
      });
      return this.usuarioRepository.save(usuario);
    } catch (error) {
      if (error.code === '23505') { // Código PostgreSQL para violación de unicidad
        throw new ConflictException('El correo electrónico ya está registrado');
      }
      throw error;
    }
  }

  /**
   * Obtiene todos los usuarios
   * @returns Lista de usuarios
   */
  async findAll(): Promise<Usuario[]> {
    return this.usuarioRepository.find();
  }
  
  /**
   * Busca un usuario por su ID
   * @param id ID del usuario
   * @returns Usuario encontrado
   * @throws NotFoundException si el usuario no existe
   */
  async findOne(id: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return usuario;
  }

  /**
   * Actualiza un usuario existente
   * @param id ID del usuario a actualizar
   * @param dto Datos para actualizar
   * @returns Usuario actualizado
   */
  async update(id: string, dto: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.findOne(id);

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    await this.usuarioRepository.update(id, dto);
    return this.findOne(id);
  }

  /**
   * Elimina un usuario
   * @param id ID del usuario a eliminar
   * @returns Objeto con información del resultado de la operación
   */
  async remove(id: string): Promise<{ message: string; id: string }> {
    const usuario = await this.findOne(id);
    await this.usuarioRepository.remove(usuario);
    return {
      message: 'Usuario eliminado correctamente',
      id,
    };
  }

  /**
   * Busca un usuario por su email
   * @param email Email del usuario
   * @param includePassword Indica si incluir el campo password en la respuesta
   * @returns Usuario encontrado
   * @throws NotFoundException si el usuario no existe
   */
  async findByEmail(email: string, includePassword = false): Promise<Usuario> {
    const queryBuilder = this.usuarioRepository.createQueryBuilder('usuario');
    
    queryBuilder.where('usuario.email = :email', { email });
    
    if (includePassword) {
      queryBuilder.addSelect('usuario.password');
    }
    
    const usuario = await queryBuilder.getOne();
    
    if (!usuario) {
      throw new NotFoundException(`Usuario con email ${email} no encontrado`);
    }
    
    return usuario;
  }
}
