import { PartialType } from '@nestjs/swagger';
import { CreateMockupDto } from './create-mockup.dto';

export class UpdateMockupDto extends PartialType(CreateMockupDto) {} 