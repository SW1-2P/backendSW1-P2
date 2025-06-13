import { Usuario } from '../../usuarios/entities/usuario.entity';
import { ProjectType } from '../entities/mobile-app.entity';

export interface ProjectConfig {
  package_name?: string;
  version?: string;
  description?: string;
  features?: string[];
  theme?: string;
}

export interface GenerationContext {
  projectType: ProjectType;
  mockupData?: any;
  xml?: string;
  prompt?: string;
  config?: ProjectConfig;
  usuario?: Usuario;
}

export interface ProjectStructure {
  directories: string[];
  files: { [path: string]: string };
}

export interface IProjectGenerator {
  generateProject(context: GenerationContext): Promise<Buffer>;
  createProjectStructure(projectDir: string, context: GenerationContext): Promise<void>;
  processGeneratedCode(projectDir: string, code: string): Promise<void>;
} 