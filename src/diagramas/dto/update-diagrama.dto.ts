import { PartialType } from '@nestjs/swagger';
import { CreateDiagramaDto } from './create-diagrama.dto';

export class UpdateDiagramaDto extends PartialType(CreateDiagramaDto) {} 