import { Logger } from '@nestjs/common';
import * as AdmZip from 'adm-zip';
import * as fs from 'fs-extra';
import * as path from 'path';
import { GenerationContext, IProjectGenerator } from '../interfaces/generator.interface';

export abstract class BaseGenerator implements IProjectGenerator {
  protected readonly logger = new Logger(this.constructor.name);

  abstract generateProject(context: GenerationContext): Promise<Buffer>;
  abstract createProjectStructure(projectDir: string, context: GenerationContext): Promise<void>;
  abstract processGeneratedCode(projectDir: string, code: string): Promise<void>;

  protected async createProjectZip(projectDir: string): Promise<Buffer> {
    const zip = new AdmZip();
    await this.addDirectoryToZip(zip, projectDir, '');
    return zip.toBuffer();
  }

  protected async addDirectoryToZip(zip: AdmZip, dir: string, zipFolderPath = ''): Promise<void> {
    const files = await fs.readdir(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const zipFilePath = path.join(zipFolderPath, file).replace(/\\/g, '/');
      const stats = await fs.stat(filePath);
      
      if (stats.isDirectory()) {
        await this.addDirectoryToZip(zip, filePath, zipFilePath);
      } else {
        try {
          const content = await fs.readFile(filePath);
          zip.addFile(zipFilePath, content);
          this.logger.debug(`Archivo agregado al ZIP: ${zipFilePath}`);
        } catch (error) {
          this.logger.error(`Error leyendo archivo ${filePath}:`, error);
        }
      }
    }
  }

  protected async cleanupTempDirectory(tempDir: string): Promise<void> {
    if (await fs.pathExists(tempDir)) {
      try {
        // Pequeño delay para asegurar que todos los handles estén cerrados
        await new Promise(resolve => setTimeout(resolve, 100));
        await fs.remove(tempDir);
      } catch (cleanupError) {
        this.logger.warn(`No se pudo limpiar directorio temporal ${tempDir}:`, cleanupError);
        // En Windows, a veces necesitamos más tiempo
        setTimeout(async () => {
          try {
            await fs.remove(tempDir);
          } catch (error) {
            this.logger.error(`Error final limpiando directorio temporal:`, error);
          }
        }, 1000);
      }
    }
  }

  protected generateAppName(input: string): string {
    try {
      if (input.includes('name=')) {
        const match = input.match(/name="([^"]+)"/);
        if (match) {
          return match[1].replace(/\s+/g, '_').toLowerCase();
        }
      }
      return `mobile_app_${Date.now()}`;
    } catch {
      return `mobile_app_${Date.now()}`;
    }
  }

  protected async writeFile(filePath: string, content: string): Promise<void> {
    await fs.mkdirp(path.dirname(filePath));
    await fs.writeFile(filePath, content);
    this.logger.debug(`Archivo creado: ${filePath}`);
  }
} 