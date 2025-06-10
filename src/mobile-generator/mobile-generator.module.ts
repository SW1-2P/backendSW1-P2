import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MobileGeneratorController } from './mobile-generator.controller';
import { MobileGeneratorService } from './mobile-generator.service';
import { ChatgptModule } from '../chatgpt/chatgpt.module';
import { MobileApp } from './entities/mobile-app.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MobileApp]),
    ChatgptModule
  ],
  controllers: [MobileGeneratorController],
  providers: [MobileGeneratorService],
  exports: [MobileGeneratorService],
})
export class MobileGeneratorModule {} 