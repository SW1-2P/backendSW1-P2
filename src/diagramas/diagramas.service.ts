import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDiagramaDto } from './dto/create-diagrama.dto';
import { UpdateDiagramaDto } from './dto/update-diagrama.dto';
import { Diagrama } from './entities/diagrama.entity';

/**
 * Servicio para gestionar operaciones relacionadas con diagramas
 */
@Injectable()
export class DiagramasService {
  constructor(
    @InjectRepository(Diagrama)
    private readonly diagramaRepository: Repository<Diagrama>,
  ) {}

  /**
   * Crea un nuevo diagrama
   * @param createDiagramaDto Datos para crear el diagrama
   * @returns Diagrama creado
   */
  async create(createDiagramaDto: CreateDiagramaDto): Promise<Diagrama> {
    const diagrama = this.diagramaRepository.create(createDiagramaDto);
    return await this.diagramaRepository.save(diagrama);
  }

  /**
   * Obtiene todos los diagramas
   * @returns Lista de diagramas
   */
  async findAll(): Promise<Diagrama[]> {
    return await this.diagramaRepository.find();
  }

  /**
   * Obtiene todos los diagramas de un usuario específico
   * @param userId ID del usuario
   * @returns Lista de diagramas del usuario
   */
  async findAllByUserId(userId: string): Promise<Diagrama[]> {
    return await this.diagramaRepository.find({
      where: { user_id: userId },
    });
  }

  /**
   * Busca un diagrama por su ID
   * @param id ID del diagrama
   * @returns Diagrama encontrado
   * @throws NotFoundException si el diagrama no existe
   */
  async findOne(id: string): Promise<Diagrama> {
    const diagrama = await this.diagramaRepository.findOne({
      where: { id },
    });
    if (!diagrama) {
      throw new NotFoundException(`Diagrama con ID ${id} no encontrado`);
    }
    return diagrama;
  }

  /**
   * Actualiza un diagrama existente
   * @param id ID del diagrama a actualizar
   * @param updateDiagramaDto Datos para actualizar
   * @returns Diagrama actualizado
   */
  async update(id: string, updateDiagramaDto: UpdateDiagramaDto): Promise<Diagrama> {
    const diagrama = await this.findOne(id);
    Object.assign(diagrama, updateDiagramaDto);
    return await this.diagramaRepository.save(diagrama);
  }

  /**
   * Elimina un diagrama
   * @param id ID del diagrama a eliminar
   * @returns Objeto con información del resultado de la operación
   */
  async remove(id: string): Promise<{ message: string; id: string }> {
    const diagrama = await this.findOne(id);
    await this.diagramaRepository.remove(diagrama);
    return {
      message: 'Diagrama eliminado correctamente',
      id,
    };
  }
} 