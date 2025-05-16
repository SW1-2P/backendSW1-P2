import { PartialType } from '@nestjs/mapped-types';
import { CreateChatgptDto } from './create-chatgpt.dto';

export class UpdateChatgptDto extends PartialType(CreateChatgptDto) {}
