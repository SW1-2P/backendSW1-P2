import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Diagrama {
  @ApiProperty({ example: 'uuid', description: 'ID único del diagrama' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Diagrama de clases', description: 'Nombre del diagrama' })
  @Column()
  nombre: string;

  @ApiProperty({ description: 'Contenido XML del diagrama' })
  @Column({ type: 'text' })
  xml: string;

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