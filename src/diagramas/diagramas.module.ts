import { Module } from '@nestjs/common';
import { DiagramasService } from './diagramas.service';
import { DiagramasController } from './diagramas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Diagrama } from './entities/diagrama.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Diagrama])],
  controllers: [DiagramasController],
  providers: [DiagramasService],
  exports: [DiagramasService],
})
export class DiagramasModule {}
