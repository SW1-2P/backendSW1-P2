import { Injectable } from '@nestjs/common';
import { ProjectType } from '../entities/mobile-app.entity';
import { IProjectGenerator } from '../interfaces/generator.interface';
import { FlutterGenerator } from './flutter-generator';
import { AngularGenerator } from './angular-generator';
import { ChatgptService } from '../../chatgpt/chatgpt.service';
import { FlutterPromptService } from '../services/flutter-prompt.service';
import { FlutterScreenDetectorService } from '../services/flutter-screen-detector.service';

@Injectable()
export class GeneratorFactory {
  constructor(
    private readonly chatgptService: ChatgptService,
    private readonly promptService: FlutterPromptService,
    private readonly screenDetector: FlutterScreenDetectorService,
  ) {}

  createGenerator(projectType: ProjectType): IProjectGenerator {
    switch (projectType) {
      case ProjectType.FLUTTER:
        return new FlutterGenerator(
          this.chatgptService,
          this.promptService,
          this.screenDetector,
        );
      case ProjectType.ANGULAR:
        return new AngularGenerator(this.chatgptService);
      default:
        throw new Error(`Tipo de proyecto no soportado: ${projectType}`);
    }
  }

  getSupportedTypes(): ProjectType[] {
    return [ProjectType.FLUTTER, ProjectType.ANGULAR];
  }

  isSupported(projectType: ProjectType): boolean {
    return this.getSupportedTypes().includes(projectType);
  }
} 