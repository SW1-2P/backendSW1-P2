import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum ProjectType {
  FLUTTER = 'flutter',
  ANGULAR = 'angular'
}

@Entity()
export class MobileApp {
  @ApiProperty({ example: 'uuid', description: 'ID único de la aplicación móvil' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Mi App Flutter', description: 'Nombre de la aplicación móvil' })
  @Column()
  nombre: string;

  @ApiProperty({ description: 'Contenido XML del mockup/diagrama (opcional)' })
  @Column({ type: 'text', nullable: true })
  xml?: string;

  @ApiProperty({ description: 'Prompt directo de descripción de la aplicación (opcional)' })
  @Column({ type: 'text', nullable: true })
  prompt?: string;

  @ApiProperty({ description: 'ID del mockup de referencia (desde @/pages)', example: 'uuid' })
  @Column({ nullable: true })
  mockup_id?: string;

  @ApiProperty({ 
    description: 'Tipo de proyecto a generar',
    enum: ProjectType,
    default: ProjectType.FLUTTER
  })
  @Column({ 
    type: 'enum', 
    enum: ProjectType, 
    default: ProjectType.FLUTTER 
  })
  project_type: ProjectType;

  @ApiProperty({ description: 'Configuración adicional del proyecto en JSON' })
  @Column({ type: 'json', nullable: true })
  config?: {
    package_name?: string;
    version?: string;
    description?: string;
    features?: string[];
    theme?: string;
  };

  @ApiProperty({ description: 'ID del usuario propietario' })
  @Column()
  user_id: string;

  @ManyToOne(() => Usuario, usuario => usuario.id, { eager: true })
  @JoinColumn({ name: 'user_id' })
  usuario: Usuario;

  @ApiProperty({ description: 'Fecha de creación' })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 