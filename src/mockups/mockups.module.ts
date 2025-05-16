import { Module } from '@nestjs/common';
import { MockupsService } from './mockups.service';
import { MockupsController } from './mockups.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mockup } from './entities/mockup.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mockup])],
  controllers: [MockupsController],
  providers: [MockupsService],
  exports: [MockupsService],
})
export class MockupsModule {} 