import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as AdmZip from 'adm-zip';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as xml2js from 'xml2js';
import { ChatgptService } from '../chatgpt/chatgpt.service';

import { Usuario } from '../usuarios/entities/usuario.entity';
import { MobileApp } from './entities/mobile-app.entity';
import { CreateMobileAppDto } from './dto/create-mobile-app.dto';
import { UpdateMobileAppDto } from './dto/update-mobile-app.dto';

@Injectable()
export class MobileGeneratorService {
  private readonly logger = new Logger(MobileGeneratorService.name);

  constructor(
    @InjectRepository(MobileApp)
    private mobileAppRepository: Repository<MobileApp>,
    private readonly chatgptService: ChatgptService,
  ) {}

  // CRUD Operations (igual que diagramas y mockups)
  async create(createMobileAppDto: CreateMobileAppDto): Promise<MobileApp> {
    // Validar que al menos uno de xml o prompt esté presente
    if (!createMobileAppDto.xml && !createMobileAppDto.prompt) {
      throw new Error('Debe proporcionar XML o prompt para crear la aplicación');
    }

    // Generar nombre automáticamente si no se proporciona
    const nombre = createMobileAppDto.nombre || this.generateAppName(createMobileAppDto.xml || createMobileAppDto.prompt || '');

    const mobileApp = this.mobileAppRepository.create({
      ...createMobileAppDto,
      nombre,
    });
    
    return await this.mobileAppRepository.save(mobileApp);
  }

  async findAllByUserId(userId: string): Promise<MobileApp[]> {
    return await this.mobileAppRepository.find({
      where: { user_id: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<MobileApp> {
    const mobileApp = await this.mobileAppRepository.findOne({ where: { id } });
    if (!mobileApp) {
      throw new NotFoundException(`Aplicación móvil con ID ${id} no encontrada`);
    }
    return mobileApp;
  }

  async update(id: string, updateMobileAppDto: UpdateMobileAppDto): Promise<MobileApp> {
    const mobileApp = await this.findOne(id);
    Object.assign(mobileApp, updateMobileAppDto);
    return await this.mobileAppRepository.save(mobileApp);
  }

  async remove(id: string): Promise<void> {
    const mobileApp = await this.findOne(id);
    await this.mobileAppRepository.remove(mobileApp);
  }

  // Método principal para generar proyecto Flutter
  async generateFlutterProject(id: string, usuario?: Usuario): Promise<Buffer> {
    const mobileApp = await this.findOne(id);
    
    // Verificar que el usuario tenga permisos
    if (usuario && mobileApp.user_id !== usuario.id) {
      throw new Error('No tiene permisos para generar esta aplicación');
    }

    const tempDir = path.join(process.cwd(), 'temp', `flutter-project-${Date.now()}`);
    
    try {
      await fs.ensureDir(tempDir);
      
      // Generar usando XML o prompt
      if (mobileApp.xml) {
        await this.generateFromXml(tempDir, mobileApp.xml, usuario);
      } else if (mobileApp.prompt) {
        await this.generateFromPrompt(tempDir, mobileApp.prompt, usuario);
      }

      // Crear archivo ZIP
      const zip = new AdmZip();
      await this.addDirectoryToZip(zip, tempDir, '');
      
      return zip.toBuffer();
    } catch (error) {
      this.logger.error('Error generando proyecto Flutter:', error);
      throw new InternalServerErrorException('Error generando proyecto Flutter');
    } finally {
      // Limpiar archivos temporales - con manejo especial para Windows
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
  }

  private async generateFromXml(projectDir: string, xml: string, usuario?: Usuario): Promise<void> {
    try {
      this.logger.debug('Generando aplicación desde XML');
      
      // Crear estructura básica del proyecto Flutter
      await this.createFlutterProjectStructure(projectDir);
      
      // Generar código usando IA
      const systemPrompt = `Eres un experto desarrollador Flutter.
Recibirás un XML que describe una aplicación móvil y debes generar código Flutter completo.

REQUISITOS:
1. Generar AL MENOS 4 pantallas diferentes
2. Usar Material Design 3 y buenas prácticas de Flutter
3. Incluir navegación entre pantallas
4. Agregar elementos interactivos realistas
5. Usar datos de ejemplo

Genera archivos Flutter completos con [FILE: ruta] como marcadores.`;

      const userPrompt = `Genera una aplicación Flutter completa basada en este XML:

${xml}

Crea una aplicación funcional con navegación, formularios y elementos interactivos.`;

             const messages = [
         { role: 'system', content: systemPrompt },
         { role: 'user', content: userPrompt }
       ];
       
       const flutterCode = await this.chatgptService.chat(messages, 'gpt-4', 0.7);
       await this.processGeneratedCode(projectDir, flutterCode);
       
     } catch (error) {
       this.logger.error('Error generando desde XML:', error);
       throw error;
     }
  }

  private async generateFromPrompt(projectDir: string, prompt: string, usuario?: Usuario): Promise<void> {
    try {
      this.logger.debug('Generando aplicación desde prompt directo');
      
      await this.createFlutterProjectStructure(projectDir);
      
      const systemPrompt = `Eres un experto desarrollador Flutter.
Recibirás una descripción de una aplicación que el usuario quiere crear.

REQUISITOS CRÍTICOS:
1. Generar AL MENOS 4 pantallas diferentes
2. Si el prompt es general, crear una app completa con:
   - Pantalla de login
   - Dashboard/Home
   - Al menos 2 pantallas específicas de funcionalidad
   - Perfil o configuración
3. Usar Material Design 3 y buenas prácticas Flutter
4. Incluir navegación apropiada entre pantallas
5. Cada pantalla debe ser completamente funcional con datos de ejemplo

Genera archivos Flutter completos con [FILE: ruta] como marcadores.`;

      const userPrompt = `Crea una aplicación Flutter completa basada en esta descripción:

"${prompt}"

IMPORTANTE: 
- Si es una solicitud general, crea una app completa con al menos 4 pantallas
- Si es específica, implementa exactamente lo solicitado más pantallas de apoyo necesarias
- Haz la app completamente funcional con datos de ejemplo y navegación apropiada

Genera TODOS los archivos Flutter necesarios para una aplicación funcional.`;

             const messages = [
         { role: 'system', content: systemPrompt },
         { role: 'user', content: userPrompt }
       ];
       
       const flutterCode = await this.chatgptService.chat(messages, 'gpt-4', 0.7);
       await this.processGeneratedCode(projectDir, flutterCode);
       
     } catch (error) {
       this.logger.error('Error generando desde prompt:', error);
       throw error;
     }
  }

  private generateAppName(xml: string): string {
    // Extraer nombre del XML si existe, sino generar uno
    try {
      if (xml.includes('name=')) {
        const match = xml.match(/name="([^"]+)"/);
        if (match) {
          return match[1].replace(/\s+/g, '_').toLowerCase();
        }
      }
      return `flutter_app_${Date.now()}`;
    } catch {
      return `flutter_app_${Date.now()}`;
    }
  }

  private async createFlutterProjectStructure(projectDir: string): Promise<void> {
    this.logger.debug('Creando estructura básica del proyecto Flutter');
    
    const appName = this.generateAppName('');
    
    // Crear estructura de directorios
    const directories = [
      'lib',
      'lib/core/themes',
      'lib/features/auth',
      'lib/features/home',
      'lib/shared/widgets',
      'android/app',
      'ios/Runner',
      'assets/images',
    ];
    
    for (const dir of directories) {
      await fs.mkdirp(path.join(projectDir, dir));
    }
    
    // Crear archivos base
    await this.createPubspecYaml(projectDir, appName);
    await this.createMainDart(projectDir);
    await this.createAppDart(projectDir, appName);
    await this.createAndroidConfig(projectDir, appName);
    await this.createIOSConfig(projectDir, appName);
    await this.createTheme(projectDir);
  }

  private async createPubspecYaml(projectDir: string, appName: string): Promise<void> {
    const content = `name: ${appName}
description: Aplicación Flutter generada automáticamente
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'
  flutter: ">=3.10.0"

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.6
  provider: ^6.1.1
  go_router: ^13.2.0
  http: ^1.1.2

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.1

flutter:
  uses-material-design: true
  assets:
    - assets/images/
`;
    
    await fs.writeFile(path.join(projectDir, 'pubspec.yaml'), content);
  }

  private async createMainDart(projectDir: string): Promise<void> {
    const content = `import 'package:flutter/material.dart';
import 'app.dart';

void main() {
  runApp(const MyApp());
}
`;
    
    await fs.writeFile(path.join(projectDir, 'lib/main.dart'), content);
  }

  private async createAppDart(projectDir: string, appName: string): Promise<void> {
    const content = `import 'package:flutter/material.dart';
import 'core/themes/app_theme.dart';
import 'features/home/home_screen.dart';

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '${appName}',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      home: const HomeScreen(),
    );
  }
}
`;
    
    await fs.writeFile(path.join(projectDir, 'lib/app.dart'), content);
  }

  private async createAndroidConfig(projectDir: string, packageName: string): Promise<void> {
    const content = `android {
    namespace "${packageName}"
    compileSdkVersion flutter.compileSdkVersion
    
    defaultConfig {
        applicationId "${packageName}"
        minSdkVersion flutter.minSdkVersion
        targetSdkVersion flutter.targetSdkVersion
        versionCode 1
        versionName "1.0"
    }
}
`;
    
    await fs.writeFile(path.join(projectDir, 'android/app/build.gradle'), content);
  }

  private async createIOSConfig(projectDir: string, appName: string): Promise<void> {
    const content = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleDisplayName</key>
	<string>${appName}</string>
	<key>CFBundleName</key>
	<string>${appName}</string>
</dict>
</plist>
`;
    
    await fs.writeFile(path.join(projectDir, 'ios/Runner/Info.plist'), content);
  }

  private async createTheme(projectDir: string): Promise<void> {
    const content = `import 'package:flutter/material.dart';

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
    );
  }
  
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: Colors.blue,
        brightness: Brightness.dark,
      ),
    );
  }
}
`;
    
    await fs.writeFile(path.join(projectDir, 'lib/core/themes/app_theme.dart'), content);
    
    // Home screen básico
    const homeContent = `import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Flutter App'),
      ),
      body: const Center(
        child: Text('¡Bienvenido a tu aplicación Flutter!'),
      ),
    );
  }
}
`;
    
    await fs.writeFile(path.join(projectDir, 'lib/features/home/home_screen.dart'), homeContent);
  }

  private async processGeneratedCode(projectDir: string, code: string): Promise<void> {
    const filePattern = /\[FILE: ([^\]]+)\]\s*```(?:\w+)?\s*([\s\S]*?)```/g;
    let match;
    
    while ((match = filePattern.exec(code)) !== null) {
      const filePath = match[1].trim();
      const fileContent = match[2].trim();
      
      const fullPath = path.join(projectDir, filePath);
      await fs.mkdirp(path.dirname(fullPath));
      await fs.writeFile(fullPath, fileContent);
      
      this.logger.debug(`Archivo generado: ${filePath}`);
    }
  }

  private async addDirectoryToZip(zip: AdmZip, dir: string, zipFolderPath = ''): Promise<void> {
    const files = await fs.readdir(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const zipFilePath = path.join(zipFolderPath, file).replace(/\\/g, '/'); // Usar barras normales en ZIP
      const stats = await fs.stat(filePath);
      
      if (stats.isDirectory()) {
        // Crear directorio en ZIP
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
} 