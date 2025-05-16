import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Diagrama } from '../../diagramas/entities/diagrama.entity';
import { Mockup } from '../../mockups/entities/mockup.entity';
export enum Rol {
  ADMIN = 'admin',
  EDITOR='editor'
}

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'enum', enum: Rol})
  rol: Rol; // 'admin' o 'editor'

  @Column({ select: false })
  password: string;
  
  @OneToMany(() => Diagrama, diagrama => diagrama.usuario)
  diagramas: Diagrama[];

  @OneToMany(() => Mockup, mockup => mockup.usuario)
  mockups: Mockup[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
