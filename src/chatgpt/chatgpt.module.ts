import { Module } from '@nestjs/common';
import { ChatgptService } from './chatgpt.service';
import { ChatgptController } from './chatgpt.controller';
import { GeneratorModule } from '../generator/generator.module';

@Module({
  imports: [GeneratorModule],
  controllers: [ChatgptController],
  providers: [ChatgptService],
  exports: [ChatgptService],
})
export class ChatgptModule {}
