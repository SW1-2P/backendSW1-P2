import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMockupDto } from './dto/create-mockup.dto';
import { UpdateMockupDto } from './dto/update-mockup.dto';
import { Mockup } from './entities/mockup.entity';

/**
 * Servicio para gestionar operaciones relacionadas con mockups
 */
@Injectable()
export class MockupsService {
  constructor(
    @InjectRepository(Mockup)
    private readonly mockupRepository: Repository<Mockup>,
  ) {}

  /**
   * Crea un nuevo mockup
   * @param createMockupDto Datos para crear el mockup
   * @returns Mockup creado
   */
  async create(createMockupDto: CreateMockupDto): Promise<Mockup> {
    const mockup = this.mockupRepository.create(createMockupDto);
    return await this.mockupRepository.save(mockup);
  }

  /**
   * Obtiene todos los mockups
   * @returns Lista de mockups
   */
  async findAll(): Promise<Mockup[]> {
    return await this.mockupRepository.find();
  }

  /**
   * Obtiene todos los mockups de un usuario específico
   * @param userId ID del usuario
   * @returns Lista de mockups del usuario
   */
  async findAllByUserId(userId: string): Promise<Mockup[]> {
    return await this.mockupRepository.find({
      where: { user_id: userId },
    });
  }

  /**
   * Busca un mockup por su ID
   * @param id ID del mockup
   * @returns Mockup encontrado
   * @throws NotFoundException si el mockup no existe
   */
  async findOne(id: string): Promise<Mockup> {
    const mockup = await this.mockupRepository.findOne({
      where: { id },
    });
    if (!mockup) {
      throw new NotFoundException(`Mockup con ID ${id} no encontrado`);
    }
    return mockup;
  }

  /**
   * Actualiza un mockup existente
   * @param id ID del mockup a actualizar
   * @param updateMockupDto Datos para actualizar
   * @returns Mockup actualizado
   */
  async update(id: string, updateMockupDto: UpdateMockupDto): Promise<Mockup> {
    const mockup = await this.findOne(id);
    Object.assign(mockup, updateMockupDto);
    return await this.mockupRepository.save(mockup);
  }

  /**
   * Elimina un mockup
   * @param id ID del mockup a eliminar
   * @returns Objeto con información del resultado de la operación
   */
  async remove(id: string): Promise<{ message: string; id: string }> {
    const mockup = await this.findOne(id);
    await this.mockupRepository.remove(mockup);
    return {
      message: 'Mockup eliminado correctamente',
      id,
    };
  }
} 