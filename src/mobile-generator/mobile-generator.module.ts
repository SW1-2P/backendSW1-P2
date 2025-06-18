import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MobileGeneratorController } from './mobile-generator.controller';
import { MobileGeneratorService } from './mobile-generator.service';
import { ChatgptModule } from '../chatgpt/chatgpt.module';
import { MobileApp } from './entities/mobile-app.entity';
import { GeneratorFactory } from './generators/generator.factory';
import { FlutterGenerator } from './generators/flutter-generator';
import { AngularGenerator } from './generators/angular-generator';
import { MockupIntegrationService } from './services/mockup-integration.service';
import { FlutterPromptService } from './services/flutter-prompt.service';
// import { FlutterScreenDetectorService } from './services/flutter-screen-detector.service';
import { PromptEnrichmentService } from './services/prompt-enrichment.service';
import { ImageAnalysisService } from './services/image-analysis.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MobileApp]),
    ChatgptModule
  ],
  controllers: [MobileGeneratorController],
  providers: [
    MobileGeneratorService,
    GeneratorFactory,
    FlutterGenerator,
    AngularGenerator,
    MockupIntegrationService,
    FlutterPromptService,
    // FlutterScreenDetectorService,
    PromptEnrichmentService,
    ImageAnalysisService,
  ],
  exports: [
    MobileGeneratorService,
    GeneratorFactory,
    ImageAnalysisService,
  ],
})
export class MobileGeneratorModule {} 