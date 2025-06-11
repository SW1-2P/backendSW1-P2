import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import { BaseGenerator } from './base-generator';
import { GenerationContext } from '../interfaces/generator.interface';
import { ChatgptService } from '../../chatgpt/chatgpt.service';
import { FLUTTER_WIDGETS } from './flutter-widgets';
import { GO_ROUTER_TEMPLATE, MATERIAL_APP_TEMPLATE } from '../templates/go-router.template';
import { FlutterPromptService } from '../services/flutter-prompt.service';
import { FlutterScreenDetectorService } from '../services/flutter-screen-detector.service';

@Injectable()
export class FlutterGenerator extends BaseGenerator {
  constructor(
    private readonly chatgptService: ChatgptService,
    private readonly promptService: FlutterPromptService,
    private readonly screenDetector: FlutterScreenDetectorService,
  ) {
    super();
  }

  async generateProject(context: GenerationContext): Promise<Buffer> {
    const tempDir = path.join(process.cwd(), 'temp', `flutter-project-${Date.now()}`);
    
    try {
      this.logger.debug(`🏗️ Creando directorio temporal: ${tempDir}`);
      await fs.ensureDir(tempDir);
      
      this.logger.debug('📁 Creando estructura del proyecto...');
      await this.createProjectStructure(tempDir, context);
      
      this.logger.debug('🤖 Generando código con GPT-4o...');
      const generatedCode = await this.generateWithAI(context);
      
      this.logger.debug('🔧 Procesando código generado...');
      await this.processGeneratedCode(tempDir, generatedCode);
      
      this.logger.debug('📦 Creando archivo ZIP...');
      return await this.createProjectZip(tempDir);
    } catch (error) {
      this.logger.error('❌ Error generando proyecto Flutter:', error);
      throw new InternalServerErrorException(`Error generando proyecto Flutter: ${error.message}`);
    } finally {
      await this.cleanupTempDirectory(tempDir);
    }
  }

  async createProjectStructure(projectDir: string, context: GenerationContext): Promise<void> {
    this.logger.debug('📂 Creando estructura básica del proyecto Flutter');
    
    const appName = this.generateAppName(context.xml || context.prompt || '');
    
    // Crear estructura de directorios modular
    const directories = [
      'lib',
      'lib/core/themes',
      'lib/core/router',
      'lib/shared/widgets',
      'lib/features/register/screens',
      'lib/features/project/screens',
      'android/app/src/main',
      'assets/images',
    ];
    
    for (const dir of directories) {
      await fs.mkdirp(path.join(projectDir, dir));
    }
    
    await this.createBaseFiles(projectDir, appName, context);
  }

  private async generateWithAI(context: GenerationContext): Promise<string> {
    this.logger.debug('🤖 Generando código Flutter con GPT-4o...');
    
    // Detectar elementos del XML
    const screenDetection = context.xml ? 
      this.screenDetector.detectScreens(context.xml) : null;
    
    this.logger.debug(`🔍 Análisis de contexto: XML=${!!context.xml}, Prompt=${!!context.prompt}`);
    if (context.prompt) {
      this.logger.debug(`📝 Prompt length: ${context.prompt.length} chars`);
      this.logger.debug(`📋 Primer fragmento del prompt: "${context.prompt.substring(0, 200)}..."`);
    }
    
    const systemPrompt = this.promptService.createSystemPrompt();
    const userPrompt = this.promptService.createUserPrompt(context, screenDetection);
    
    this.logger.debug(`📤 User prompt enviado a ChatGPT (${userPrompt.length} chars)`);
    this.logger.debug(`🔍 Primer fragmento del user prompt: "${userPrompt.substring(0, 300)}..."`);
    
    return await this.chatgptService.generateFlutterCode(systemPrompt, userPrompt);
  }

  async processGeneratedCode(projectDir: string, code: string): Promise<void> {
    const filePattern = /\[FILE: ([^\]]+)\]\s*```(?:\w+)?\s*([\s\S]*?)```/g;
    let match;
    
    // Obtener el nombre del paquete
    const packageName = await this.getPackageName(projectDir);
    
    while ((match = filePattern.exec(code)) !== null) {
      const filePath = match[1].trim();
      let fileContent = match[2].trim();
      
      // APLICAR CORRECCIONES AUTOMÁTICAS
      fileContent = this.applyAutomaticFixes(fileContent, filePath);
      
      const fullPath = path.join(projectDir, filePath);
      await this.writeFile(fullPath, fileContent);
    }
  }

  private applyAutomaticFixes(content: string, filePath: string): string {
    let fixedContent = content;
    
    // 1. CORREGIR AppRouter.router → AppRouter().router
    fixedContent = fixedContent.replace(
      /AppRouter\.router/g,
      'AppRouter().router'
    );
    
    // 2. CORREGIR imports del proyecto
    fixedContent = this.fixProjectImports(fixedContent, filePath);
    
    // 3. CORREGIR router delegate issues
    if (filePath.includes('app.dart')) {
      fixedContent = this.fixAppRouterConfig(fixedContent);
    }
    
    // 4. AGREGAR imports necesarios
    if (filePath.includes('_screen.dart')) {
      fixedContent = this.addRequiredImports(fixedContent);
    }
    
    // 5. ACTUALIZAR componentes obsoletos
    fixedContent = fixedContent
      .replace(/RaisedButton/g, 'ElevatedButton')
      .replace(/FlatButton/g, 'TextButton')
      .replace(/primaryColor/g, 'colorScheme.primary');
    
    return fixedContent;
  }

  private fixProjectImports(content: string, filePath: string): string {
    return content.replace(
      /import 'package:([^\/]+)\/([^']+)';/g,
      (importMatch, packageName, relativePath) => {
        // Mantener packages externos
        if (packageName === 'flutter' || 
            packageName === 'dart' || 
            packageName.includes('_riverpod') ||
            packageName === 'go_router' ||
            packageName === 'cupertino_icons') {
          return importMatch;
        }
        
        // Convertir imports del proyecto a relativos
        const isProjectImport = packageName === 'app' || 
                              packageName === 'example' ||
                              packageName.length < 4;
        
        if (isProjectImport) {
          const fileDir = path.dirname(filePath);
          const relative = path.relative(fileDir, relativePath);
          const normalizedPath = relative.replace(/\\/g, '/');
          return `import '${normalizedPath}';`;
        }
        
        return importMatch;
      }
    );
  }

  private fixAppRouterConfig(content: string): string {
    // Corregir routerDelegate issues
    content = content.replace(
      /routerDelegate:\s*[^,]+,\s*routeInformationParser:\s*[^,]+,/g,
      'routerConfig: AppRouter().router,'
    );
    
    // Asegurar instancia única
    if (!content.includes('final _appRouter = AppRouter()')) {
      content = content.replace(
        /class MyApp extends ConsumerWidget/,
        `final _appRouter = AppRouter();

class MyApp extends ConsumerWidget`
      );
      
      content = content.replace(
        /AppRouter\(\)\.router/g,
        '_appRouter.router'
      );
    }
    
    return content;
  }

  private addRequiredImports(content: string): string {
    if ((content.includes('context.push') || content.includes('context.pop')) && 
        !content.includes("import 'package:go_router/go_router.dart'")) {
      content = "import 'package:go_router/go_router.dart';\n" + content;
    }
    
    return content;
  }

  private async getPackageName(projectDir: string): Promise<string> {
    const pubspecPath = path.join(projectDir, 'pubspec.yaml');
    
    if (await fs.pathExists(pubspecPath)) {
      const pubspecContent = await fs.readFile(pubspecPath, 'utf8');
      const nameMatch = pubspecContent.match(/^name:\s*(.+)$/m);
      if (nameMatch) {
        return nameMatch[1].trim();
      }
    }
    
    return 'example_app';
  }

  private async createBaseFiles(projectDir: string, appName: string, context: GenerationContext): Promise<void> {
    const xmlContent = context.xml || '';
    
    // DETECTAR PANTALLAS Y CONFIGURACIÓN
    const screenDetection = this.screenDetector.detectScreens(xmlContent);
    const colors = this.screenDetector.extractColors(xmlContent);
    
    this.logger.debug(`🔍 Análisis: ${screenDetection.phoneCount} pantallas, drawer: ${screenDetection.shouldCreateDrawer}`);
    
    // 1. PUBSPEC.YAML
    await this.createPubspecFile(projectDir, appName);
    
    // 2. MAIN.DART
    await this.createMainFile(projectDir);
    
    // 3. APP.DART
    await this.createAppFile(projectDir, appName);
    
    // 4. APP_ROUTER.DART
    await this.createRouterFile(projectDir);
    
    // 5. SHARED WIDGETS
    await this.createSharedWidgets(projectDir);
    
    // 6. APP_DRAWER.DART (si múltiples pantallas)
    if (screenDetection.shouldCreateDrawer) {
      await this.createDrawerFile(projectDir, screenDetection);
    }
    
    // 7. APP_THEME.DART
    await this.createThemeFile(projectDir, colors);
    
    // 8. ANDROID MANIFEST
    await this.createAndroidManifest(projectDir, appName);
    
    // 9. README.MD
    await this.createReadmeFile(projectDir, appName, screenDetection);
  }

  private async createPubspecFile(projectDir: string, appName: string): Promise<void> {
    const pubspecContent = `name: ${appName}
description: Flutter application generated from mockup
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  flutter_riverpod: ^2.4.9
  go_router: ^13.0.0
  cupertino_icons: ^1.0.2

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
  assets:
    - assets/images/
`;

    await fs.writeFile(path.join(projectDir, 'pubspec.yaml'), pubspecContent);
  }

  private async createMainFile(projectDir: string): Promise<void> {
    const mainContent = `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'app.dart';

void main() {
  runApp(
    const ProviderScope(
      child: MyApp(),
    ),
  );
}
`;
    await fs.writeFile(path.join(projectDir, 'lib/main.dart'), mainContent);
  }

  private async createAppFile(projectDir: string, appName: string): Promise<void> {
    const appContent = MATERIAL_APP_TEMPLATE.replace('{{APP_NAME}}', appName);
    await fs.writeFile(path.join(projectDir, 'lib/app.dart'), appContent);
  }

  private async createRouterFile(projectDir: string): Promise<void> {
    await fs.writeFile(path.join(projectDir, 'lib/core/router/app_router.dart'), GO_ROUTER_TEMPLATE);
  }

  private async createSharedWidgets(projectDir: string): Promise<void> {
    // Usar FLUTTER_WIDGETS que ya contiene todos los widgets necesarios
    await fs.writeFile(path.join(projectDir, 'lib/shared/widgets/app_widgets.dart'), FLUTTER_WIDGETS);
  }

  private async createDrawerFile(projectDir: string, screenDetection: any): Promise<void> {
    this.logger.debug(`🗂️ NAVIGATION DRAWER - Pantallas detectadas: ${screenDetection.detectedScreens.join(', ')}`);
    // El drawer ya está incluido en FLUTTER_WIDGETS, no necesitamos archivo separado
  }

  private async createThemeFile(projectDir: string, colors: any): Promise<void> {
    const themeContent = `import 'package:flutter/material.dart';

class AppTheme {
  // Colores extraídos del mockup
  static const Color primaryColor = Color(${colors.primary});
  static const Color secondaryColor = Color(${colors.secondary});
  static const Color accentColor = Color(${colors.accent});
  
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryColor,
        brightness: Brightness.light,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.transparent,
        foregroundColor: primaryColor,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: true,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          elevation: 0,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: primaryColor, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      ),
      cardTheme: CardTheme(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
    );
  }
}
`;

    await fs.writeFile(path.join(projectDir, 'lib/core/themes/app_theme.dart'), themeContent);
  }

  private async createAndroidManifest(projectDir: string, appName: string): Promise<void> {
    const androidManifestContent = `<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application
        android:label="${appName}"
        android:name="\${applicationName}"
        android:icon="@mipmap/ic_launcher">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/LaunchTheme"
            android:windowSoftInputMode="adjustResize">
            <meta-data
              android:name="io.flutter.embedding.android.NormalTheme"
              android:resource="@style/NormalTheme"
              />
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>
        <meta-data
            android:name="flutterEmbedding"
            android:value="2" />
    </application>
</manifest>
`;

    await fs.writeFile(path.join(projectDir, 'android/app/src/main/AndroidManifest.xml'), androidManifestContent);
  }

  private async createReadmeFile(projectDir: string, appName: string, screenDetection: any): Promise<void> {
    const readmeContent = `# ${appName}

Flutter application generated from Draw.io mockup.

## Detected Features

- **Screens Detected**: ${screenDetection.detectedScreens.join(', ') || 'None'}
- **Navigation Drawer**: ${screenDetection.shouldCreateDrawer ? 'Yes' : 'No'}
- **Form Fields**: ${screenDetection.detectedFields.length} fields
- **Action Buttons**: ${screenDetection.detectedButtons.length} buttons

## Getting Started

1. Make sure you have Flutter installed
2. Run \`flutter pub get\` to install dependencies
3. Run \`flutter run\` to launch the app

## Architecture

- **State Management**: Riverpod
- **Navigation**: GoRouter
- **Design**: Material Design 3
- **Structure**: Feature-based modules

## Navigation

- \`context.push('/route')\` to navigate
- \`context.pop()\` to go back
- Navigation drawer available for multi-screen apps

Generated with improved error prevention and modern Flutter patterns.
`;

    await fs.writeFile(path.join(projectDir, 'README.md'), readmeContent);
  }
}