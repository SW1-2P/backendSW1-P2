import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseTestService } from './database-test.service';
import { DatabaseTestController } from './database-test.controller';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Diagrama } from '../diagramas/entities/diagrama.entity';
import { Mockup } from '../mockups/entities/mockup.entity';
import { MobileApp } from '../mobile-generator/entities/mobile-app.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Diagrama, Mockup, MobileApp])
  ],
  controllers: [DatabaseTestController],
  providers: [DatabaseTestService],
  exports: [DatabaseTestService],
})
export class DatabaseTestModule {} 