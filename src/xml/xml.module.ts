import { Module } from '@nestjs/common';
import { XmlService } from './xml.service';
import { XmlController } from './xml.controller';
import { GeneratorModule } from 'src/generator/generator.module';

@Module({
  imports: [GeneratorModule],
  controllers: [XmlController],
  providers: [XmlService],
})
export class XmlModule {}
