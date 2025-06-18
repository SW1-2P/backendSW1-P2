import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import { BaseGenerator } from './base-generator';
import { GenerationContext } from '../interfaces/generator.interface';
import { ChatgptService } from '../../chatgpt/chatgpt.service';
import { FLUTTER_WIDGETS } from './flutter-widgets';
import { GO_ROUTER_TEMPLATE, MATERIAL_APP_TEMPLATE } from '../templates/go-router.template';
import { FlutterPromptService } from '../services/flutter-prompt.service';
// import { FlutterScreenDetectorService } from '../services/flutter-screen-detector.service';

@Injectable()
export class FlutterGenerator extends BaseGenerator {
  constructor(
    private readonly chatgptService: ChatgptService,
    private readonly promptService: FlutterPromptService,
    // private readonly screenDetector: FlutterScreenDetectorService,
  ) {
    super();
  }

  async generateProject(context: GenerationContext): Promise<Buffer> {
    // Usar el directorio temporal del sistema operativo que tiene permisos garantizados
    const tempDir = path.join('/tmp', `flutter-project-${Date.now()}`);
    
    try {
      this.logger.debug(`🏗️ Creando directorio temporal: ${tempDir}`);
      await fs.ensureDir(tempDir);
      
      this.logger.debug('📁 Creando estructura del proyecto...');
      await this.createProjectStructure(tempDir, context);
      
      this.logger.debug('🤖 Generando código con o3...');
      const generatedCode = await this.generateWithAI(context);
      
      this.logger.debug('🔧 Procesando código generado por IA...');
      await this.processGeneratedCode(tempDir, generatedCode);
      
      this.logger.debug('📋 Creando archivos faltantes (AndroidManifest, README)...');
      await this.createMissingBaseFiles(tempDir, context);
      
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
    this.logger.debug('📂 Creando estructura básica de directorios (sin sobrescribir páginas de IA)');
    
    // Crear SOLO estructura de directorios - sin archivos estáticos que puedan sobrescribir la IA
    const directories = [
      'lib',
      'lib/core/themes',
      'lib/core/router',
      'lib/shared/widgets',
      'android/app/src/main',
      'assets/images',
    ];
    
    for (const dir of directories) {
      await fs.mkdirp(path.join(projectDir, dir));
    }
    
    // NO crear archivos base aquí - dejar que la IA genere todo
    this.logger.debug('✅ Estructura de directorios creada, esperando código de IA...');
  }

  private async generateWithAI(context: GenerationContext): Promise<string> {
    if (!process.env.OPENAI_API_KEY) {
      this.logger.error(`❌ Sin API key de OpenAI - no se puede generar código`);
      throw new Error('Se requiere OPENAI_API_KEY para generar código Flutter');
    }
    
    try {
      this.logger.debug(`📤 Generando código Flutter con XML completo para análisis de IA...`);
      
      // NO USAR SCREEN DETECTION - DEJAR QUE LA IA INTERPRETE TODO EL XML
      let screenDetection: any = null;
      if (context.xml) {
        this.logger.debug(`📋 Enviando XML completo (${context.xml.length} chars) para interpretación directa de IA`);
        this.logger.debug(`🤖 La IA analizará TODOS los elementos del XML sin procesamiento previo`);
      }
      
      // USAR EL SERVICIO DE PROMPT ESPECIALIZADO (sin screen detection)
      const systemPrompt = this.promptService.createSystemPrompt();
      const userPrompt = this.promptService.createUserPrompt(context, null); // null = no screen detection
      
      this.logger.debug(`📋 Prompts generados - System: ${systemPrompt.length} chars, User: ${userPrompt.length} chars`);
      this.logger.debug(`📱 Enviando XML completo para análisis e interpretación directa de IA`);
      
      const generatedCode = await this.chatgptService.generateFlutterCode(systemPrompt, userPrompt);
      
      this.logger.debug(`🎯 Código recibido (${generatedCode.length} chars)`);
      this.logger.debug(`📋 Primer fragmento del código: "${generatedCode.substring(0, 500)}..."`);
      
      // Verificar que el código contiene archivos en formato esperado
      // o3 puede devolver formato diferente, ser más flexible
      const hasValidContent = generatedCode.length > 100 && (
        generatedCode.includes('[FILE:') || 
        generatedCode.includes('pubspec.yaml') ||
        generatedCode.includes('lib/main.dart') ||
        generatedCode.includes('flutter:') ||
        generatedCode.includes('features/')
      );
      
      if (!hasValidContent) {
        this.logger.error(`❌ La IA no generó código válido - no hay fallback`);
        throw new Error('No se pudo generar código válido desde la IA y el XML');
      }
      
      this.logger.debug(`✅ Código de IA detectado como válido, procesando...`);
      return generatedCode;
    } catch (error) {
      this.logger.error(`❌ Error crítico con OpenAI: ${error.message}`);
      throw new Error(`Error generando con IA: ${error.message}`);
    }
  }

  async processGeneratedCode(projectDir: string, code: string): Promise<void> {
    this.logger.debug(`🔧 Procesando código generado (${code.length} chars)...`);
    
    // DEBUGGING: Mostrar los primeros 500 caracteres del código para analizar el formato
    this.logger.debug(`🔍 Primeros 500 chars del código: "${code.substring(0, 500)}"`);
    
    let filesCreated = 0;
    
    // Obtener el nombre del paquete
    const packageName = await this.getPackageName(projectDir);
    
    // MÉTODO 1: Intentar con patrones de regex múltiples
    const patterns = [
      // Patrón original con [FILE: ...]
      /\[FILE: ([^\]]+)\]\s*```(?:\w+)?\s*([\s\S]*?)```/g,
      // Patrón alternativo sin espacios
      /\[FILE:([^\]]+)\]\s*```(?:\w+)?\s*([\s\S]*?)```/g,
      // Patrón con FILE: al inicio de línea (sin corchetes)
      /^FILE: ([^\n]+)\n```(?:\w+)?\s*([\s\S]*?)```/gm,
      // Patrón más flexible con espacios variables
      /\[FILE:\s*([^\]]+)\]\s*```[^\n]*\n([\s\S]*?)```/g,
      // Patrón solo con nombre de archivo seguido de código
      /([a-zA-Z0-9_\/\.]+\.(?:dart|yaml))\s*```(?:\w+)?\s*([\s\S]*?)```/g,
      // NUEVO: Patrón para o3 con separadores de igual
      /={20,}\s*([^\n=]+?\.(?:dart|yaml))\s*={20,}\s*```(?:\w+)?\s*([\s\S]*?)```/g,
      // NUEVO: Patrón para o3 con separadores de doble línea ═
      /═{10,}\s*([a-zA-Z0-9_\/\.]+\.(?:dart|yaml))\s*═{10,}\s*```(?:\w+)?\s*([\s\S]*?)```/g,
    ];
    
    // Probar cada patrón hasta encontrar uno que funcione
    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      pattern.lastIndex = 0; // Reset regex
      let match;
      let tempFilesCreated = 0;
      
      this.logger.debug(`🔍 Probando patrón ${i + 1}...`);
      
      while ((match = pattern.exec(code)) !== null) {
      const filePath = match[1].trim();
      let fileContent = match[2].trim();
        
        this.logger.debug(`📄 Patrón ${i + 1} - Encontrado archivo: ${filePath} (${fileContent.length} chars)`);
      
      // APLICAR CORRECCIONES AUTOMÁTICAS
      fileContent = this.applyAutomaticFixes(fileContent, filePath);
      
      const fullPath = path.join(projectDir, filePath);
      await this.writeFile(fullPath, fileContent);
        tempFilesCreated++;
      }
      
      if (tempFilesCreated > 0) {
        filesCreated = tempFilesCreated;
        this.logger.debug(`✅ Patrón ${i + 1} funcionó: ${filesCreated} archivos creados`);
        break;
      }
    }
    
    // MÉTODO 2: Si no funcionó ningún patrón, intentar parsing inteligente
    if (filesCreated === 0) {
      this.logger.warn(`⚠️ NINGÚN patrón regex funcionó. Intentando parsing inteligente...`);
      filesCreated = await this.intelligentCodeParsing(projectDir, code);
    }
    
    this.logger.debug(`✅ Código procesado: ${filesCreated} archivos creados`);
    
    if (filesCreated === 0) {
      this.logger.error(`❌ No se pudo extraer ningún archivo del código generado`);
      this.logger.debug(`🔍 Código completo recibido: "${code}"`);
    }
  }

  /**
   * Parsing inteligente como último recurso cuando los patrones regex fallan
   */
  private async intelligentCodeParsing(projectDir: string, code: string): Promise<number> {
    let filesCreated = 0;
    
    try {
      // MÉTODO 1: Detectar formato o3 con separadores de igual
      const o3Matches = this.parseO3Format(code);
      if (o3Matches.length > 0) {
        this.logger.debug(`🔧 Detectado formato o3: ${o3Matches.length} archivos`);
        for (const match of o3Matches) {
          const cleanContent = this.applyAutomaticFixes(match.content.trim(), match.filePath);
          const fullPath = path.join(projectDir, match.filePath);
          await this.writeFile(fullPath, cleanContent);
          filesCreated++;
        }
        return filesCreated;
      }

      // MÉTODO 2: Buscar bloques de código sin importar el formato
      const codeBlocks = code.split('```');
      
      for (let i = 0; i < codeBlocks.length - 1; i += 2) {
        const beforeBlock = codeBlocks[i];
        const codeContent = codeBlocks[i + 1];
        
        // Intentar extraer nombre de archivo del texto anterior al bloque
        const filePathMatches = beforeBlock.match(/(?:FILE:|file:|\[FILE:|\[file:)\s*([^\]\n\r]+)(?:\])?/i);
        
        if (filePathMatches) {
          const filePath = filePathMatches[1].trim();
          
          // Filtrar solo archivos válidos de Flutter
          if (filePath.includes('.dart') || filePath.includes('.yaml') || filePath.includes('pubspec')) {
            this.logger.debug(`🔧 Parsing inteligente - Creando archivo: ${filePath}`);
            
            // Limpiar contenido del código (remover primera línea si es tipo de archivo)
            let cleanContent = codeContent;
            const lines = cleanContent.split('\n');
            if (lines[0] && (lines[0].includes('dart') || lines[0].includes('yaml'))) {
              cleanContent = lines.slice(1).join('\n');
            }
            
            // Aplicar correcciones automáticas
            cleanContent = this.applyAutomaticFixes(cleanContent.trim(), filePath);
            
            const fullPath = path.join(projectDir, filePath);
            await this.writeFile(fullPath, cleanContent);
            filesCreated++;
          }
        }
      }
      
      // Si aún no hay archivos, intentar detectar archivos por contenido
      if (filesCreated === 0) {
        filesCreated = await this.parseByContent(projectDir, code);
      }
      
    } catch (error) {
      this.logger.error(`❌ Error en parsing inteligente: ${error.message}`);
    }
    
    return filesCreated;
  }

  /**
   * Parse el formato específico de o3 que usa separadores ====
   */
  private parseO3Format(code: string): Array<{filePath: string, content: string}> {
    const files: Array<{filePath: string, content: string}> = [];
    
    // Buscar patrón o3: ════════════ filename ════════════ seguido de ```
    const o3Pattern = /═{10,}\s*([a-zA-Z0-9_\/\.]+\.(?:dart|yaml))\s*═{10,}\s*```(?:\w+)?\s*([\s\S]*?)```/g;
    let match;
    
    while ((match = o3Pattern.exec(code)) !== null) {
      const filePath = match[1].trim();
      const content = match[2].trim();
      
      this.logger.debug(`🔧 Formato o3 detectado: ${filePath} (${content.length} chars)`);
      files.push({ filePath, content });
    }
    
    return files;
  }

  /**
   * Último recurso: detectar archivos por su contenido característico
   */
  private async parseByContent(projectDir: string, code: string): Promise<number> {
    let filesCreated = 0;
    
    const contentPatterns = [
      {
        pattern: /name:\s+flutter_app[\s\S]*?flutter:\s*uses-material-design:\s*true/,
        filename: 'pubspec.yaml',
        type: 'yaml'
      },
      {
        pattern: /void\s+main\(\)\s*\{[\s\S]*?runApp\(/,
        filename: 'lib/main.dart',
        type: 'dart'
      },
      {
        pattern: /class\s+MyApp\s+extends\s+StatelessWidget[\s\S]*?MaterialApp/,
        filename: 'lib/app.dart', 
        type: 'dart'
      },
      {
        pattern: /GoRouter[\s\S]*?initialLocation[\s\S]*?routes:/,
        filename: 'lib/core/router/app_router.dart',
        type: 'dart'
      }
    ];
    
         for (const { pattern, filename, type } of contentPatterns) {
       const match = code.match(pattern);
       if (match && match.index !== undefined) {
         this.logger.debug(`🔧 Detectado por contenido: ${filename}`);
         
         // Extraer el bloque de código completo
         let startIndex: number = match.index;
         let endIndex: number = code.length;
         
         // Buscar hacia atrás para encontrar el inicio del bloque
         while (startIndex > 0 && !code.substring(startIndex - 10, startIndex).includes('```')) {
           startIndex--;
         }
         
         // Buscar hacia adelante para encontrar el final del bloque
         const nextTripleBacktick = code.indexOf('```', match.index + match[0].length);
         if (nextTripleBacktick !== -1) {
           endIndex = nextTripleBacktick;
         }
         
         let content = code.substring(startIndex, endIndex);
         
         // Limpiar el contenido
         content = content.replace(/^```\w*\n?/, '').replace(/```$/, '').trim();
         
         // Aplicar correcciones automáticas
         content = this.applyAutomaticFixes(content, filename);
         
         const fullPath = path.join(projectDir, filename);
         await this.writeFile(fullPath, content);
         filesCreated++;
       }
     }
    
    return filesCreated;
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
      
      // Asegurar que app.dart use siempre el singleton pattern correcto
      fixedContent = fixedContent.replace(
        /routerConfig:\s*_appRouter\.router/g,
        'routerConfig: AppRouter().router'
      );
      
      // Remover cualquier declaración _appRouter mal creada
      fixedContent = fixedContent.replace(
        /final\s+_appRouter\s*=\s*AppRouter\(\);?\s*/g,
        ''
      );
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
    
    // 6. CORREGIR referencias circulares y errores de sintaxis (aplicar a TODOS los archivos)
    fixedContent = this.fixCircularReferences(fixedContent);
    
    // 7. CORRECCIONES ADICIONALES ESPECÍFICAS PARA PANTALLAS
    
      // Corregir referencias a AppTheme en pantallas
      fixedContent = fixedContent.replace(/AppTheme\.primary/g, 'AppTheme.colorSchemePrimary');
      fixedContent = fixedContent.replace(/AppTheme\.secondary/g, 'AppTheme.secondaryBlue');
      
      // Corregir tipos de función incorrectos
      fixedContent = fixedContent.replace(
        /color:\s*AppTheme\.([a-zA-Z]+),/g,
        'color: AppTheme.$1,'
      );
      
      // Asegurar que se declare colorScheme al inicio del build method
      if (!fixedContent.includes('final colorScheme = Theme.of(context).colorScheme;')) {
        fixedContent = fixedContent.replace(
          /@override\s+Widget\s+build\(BuildContext\s+context\)\s*\{/,
          `@override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;`
        );
      }
      
      // Corregir referencias directas a colores sin contexto
      fixedContent = fixedContent.replace(
        /color:\s*Colors\.([a-zA-Z]+)\.withOpacity/g,
        'color: colorScheme.primary.withOpacity'
      );
    
    // 8. CORRECCIONES GLOBALES ADICIONALES
    
    // Corregir imports faltantes de AppTheme
    if (fixedContent.includes('AppTheme.') && !fixedContent.includes("import '../../../core/themes/app_theme.dart'")) {
      fixedContent = fixedContent.replace(
        /import 'package:flutter\/material\.dart';/,
        `import 'package:flutter/material.dart';
import '../../../core/themes/app_theme.dart';`
      );
    }
    
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
    // Corregir routerDelegate issues (legacy GoRouter syntax)
    content = content.replace(
      /routerDelegate:\s*[^,]+,\s*routeInformationParser:\s*[^,]+,/g,
      'routerConfig: AppRouter().router,'
    );
    
    // Asegurar que se use routerConfig en lugar de router deprecated
      content = content.replace(
      /router:\s*AppRouter\(\)\.router/g,
      'routerConfig: AppRouter().router'
    );
    
    // NO crear instancia _appRouter - usar el singleton directamente
    // El pattern AppRouter().router es correcto porque AppRouter es un singleton
    
    return content;
  }

  private addRequiredImports(content: string): string {
    if ((content.includes('context.push') || content.includes('context.pop')) && 
        !content.includes("import 'package:go_router/go_router.dart'")) {
      content = "import 'package:go_router/go_router.dart';\n" + content;
    }
    
    return content;
  }

  private fixCircularReferences(content: string): string {
    // Detectar y corregir referencias circulares en AppTheme
    
    // Patrón problemático: _colorScheme.primary dentro de la definición de _colorScheme
    const circularPattern = /static\s+final\s+ColorScheme\s+_colorScheme\s*=\s*ColorScheme\.fromSeed\s*\(\s*seedColor:\s*_colorScheme\.primary/g;
    
    if (circularPattern.test(content)) {
      this.logger.warn('🔧 Corrigiendo referencia circular en AppTheme...');
      
      // Reemplazar con una estructura correcta usando los mismos colores del tema
      content = content.replace(
        /static\s+final\s+ColorScheme\s+_colorScheme[\s\S]*?(?=static\s+ThemeData|$)/g,
        `  // ✅ Definir colores como constantes primero
  static const Color colorSchemePrimary = Color(0xFF4CAF50); // Verde
  static const Color secondaryBlue = Color(0xFF2196F3);
  static const Color secondaryOrange = Color(0xFFFF9800);
  static const Color secondaryPurple = Color(0xFF9C27B0);
  
  `
      );
      
      // Corregir referencias a _colorScheme.primary por primaryColor
      content = content.replace(/_colorScheme\.primary/g, 'colorSchemePrimary');
      content = content.replace(/_colorScheme\.secondary/g, 'secondaryBlue');
      content = content.replace(/_colorScheme\.accent/g, 'colorSchemePrimary');
      
      // Asegurar que ColorScheme.fromSeed use la constante
      content = content.replace(
        /ColorScheme\.fromSeed\s*\(\s*seedColor:\s*[^,)]+/g,
        'ColorScheme.fromSeed(\n        seedColor: colorSchemePrimary'
      );
    }
    
    // NUEVAS CORRECCIONES PARA ERRORES DE SINTAXIS
    
    // 1. Corregir nombres de variables inválidos como "colorScheme.primary"
    content = content.replace(
      /static\s+const\s+Color\s+colorScheme\.primary/g,
      'static const Color colorSchemePrimary'
    );
    
    content = content.replace(
      /static\s+const\s+Color\s+colorScheme\.secondary/g,
      'static const Color colorSchemeSecondary'
    );
    
    // 2. Corregir referencias a colorScheme.primary en el código
    content = content.replace(/colorScheme\.primary/g, 'colorSchemePrimary');
    content = content.replace(/colorScheme\.secondary/g, 'colorSchemeSecondary');
    
    // 3. Corregir referencias a AppTheme.primary (debe ser AppTheme.colorSchemePrimary)
    content = content.replace(/AppTheme\.primary/g, 'AppTheme.colorSchemePrimary');
    content = content.replace(/AppTheme\.secondary/g, 'AppTheme.secondaryBlue');
    
    // 4. Corregir definiciones de colores malformadas
    content = content.replace(
      /static\s+const\s+Color\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*Color\s*\(\s*([^)]+)\s*\)\s*;?\s*\/\/[^\n]*/g,
      'static const Color $1 = Color($2);'
    );
    
    // 5. CORRECCIONES ESPECÍFICAS PARA REFERENCIAS DE COLORES EN PANTALLAS
    
    // Corregir uso directo de colorSchemePrimary sin contexto
    content = content.replace(
      /backgroundColor:\s*colorSchemePrimary/g,
      'backgroundColor: Theme.of(context).colorScheme.primary'
    );
    
    content = content.replace(
      /color:\s*colorSchemePrimary(?!,)/g,
      'color: Theme.of(context).colorScheme.primary'
    );
    
    content = content.replace(
      /color:\s*colorSchemePrimary,/g,
      'color: Theme.of(context).colorScheme.primary,'
    );
    
    // Corregir referencias incorrectas a Theme.of(context).colorSchemePrimary
    content = content.replace(
      /Theme\.of\(context\)\.colorSchemePrimary/g,
      'Theme.of(context).colorScheme.primary'
    );
    
    // Corregir otras referencias de colores sin contexto
    content = content.replace(
      /color:\s*secondaryBlue/g,
      'color: Theme.of(context).colorScheme.secondary'
    );
    
    content = content.replace(
      /backgroundColor:\s*secondaryBlue/g,
      'backgroundColor: Theme.of(context).colorScheme.secondary'
    );
    
    // 6. Asegurar que se use colorScheme correctamente
    content = content.replace(
      /final\s+colorScheme\s*=\s*Theme\.of\(context\)\.colorScheme;/g,
      'final colorScheme = Theme.of(context).colorScheme;'
    );
    
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

  private async createMissingBaseFiles(projectDir: string, context: GenerationContext): Promise<void> {
    const appName = this.generateAppName(context.xml || context.prompt || '');
    
    this.logger.debug('🔍 Verificando qué archivos base faltan después de generación de IA...');
    
    // Solo crear archivos que NO deben ser generados por la IA (archivos de configuración del sistema)
    
    // 1. ANDROID MANIFEST (siempre crear - es configuración del sistema)
    await this.createAndroidManifest(projectDir, appName);
    
    // 2. README.MD (siempre crear - es documentación)
    await this.createSimpleReadmeFile(projectDir, appName);
    
    this.logger.debug('✅ Archivos base de sistema creados (la IA generó el resto)');
  }

  private async createBaseFiles(projectDir: string, appName: string, context: GenerationContext): Promise<void> {
    const xmlContent = context.xml || '';
    
    // DETECTAR PANTALLAS Y CONFIGURACIÓN
    // const screenDetection = this.screenDetector.detectScreens(xmlContent);
    // const colors = this.screenDetector.extractColors(xmlContent);
    
    // this.logger.debug(`🔍 Análisis: ${screenDetection.phoneCount} pantallas, drawer: ${screenDetection.shouldCreateDrawer}`);
    
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
    // if (screenDetection.shouldCreateDrawer) {
    //   await this.createDrawerFile(projectDir, screenDetection);
    // }
    
    // 7. APP_THEME.DART
    // await this.createThemeFile(projectDir, colors);
    
    // 8. ANDROID MANIFEST
    await this.createAndroidManifest(projectDir, appName);
    
    // 9. README.MD
    // await this.createReadmeFile(projectDir, appName, screenDetection);
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
import 'app.dart';

void main() {
  runApp(const MyApp());
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
    
    // Generar información detallada del drawer basada en las secciones detectadas
    if (screenDetection.screenSections && screenDetection.screenSections.length > 0) {
      this.logger.debug('📱 SECCIONES DETECTADAS:');
      screenDetection.screenSections.forEach((section: any, index: number) => {
        this.logger.debug(`  ${index + 1}. ${section.title}: ${section.description}`);
        this.logger.debug(`     - Textos: ${section.texts.slice(0, 3).join(', ')}${section.texts.length > 3 ? '...' : ''}`);
        this.logger.debug(`     - Campos: ${section.fields.length} | Botones: ${section.buttons.length}`);
      });
    }
    
    // El drawer ya está incluido en FLUTTER_WIDGETS, no necesitamos archivo separado
  }

  private async createThemeFile(projectDir: string, colors: any): Promise<void> {
    const themeContent = `import 'package:flutter/material.dart';

class AppTheme {
  // ✅ Definir colores como constantes primero
  static const Color colorSchemePrimary = Color(0xFF4CAF50); // Verde
  static const Color secondaryBlue = Color(0xFF2196F3);
  static const Color secondaryOrange = Color(0xFFFF9800);
  static const Color secondaryPurple = Color(0xFF9C27B0);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: colorSchemePrimary,
        brightness: Brightness.light,
      ),
      scaffoldBackgroundColor: Colors.white,
      appBarTheme: const AppBarTheme(
        elevation: 0,
        centerTitle: true,
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: colorSchemePrimary,
        foregroundColor: Colors.white,
      ),
      cardTheme: const CardTheme(
        elevation: 2,
        margin: EdgeInsets.all(8),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(12)),
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

- **State Management**: Flutter built-in (StatefulWidget)
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

  private async createSimpleReadmeFile(projectDir: string, appName: string): Promise<void> {
    const readmeContent = `# ${appName}

Flutter application generated from AI analysis.

## Getting Started

1. Make sure you have Flutter installed
2. Run \`flutter pub get\` to install dependencies
3. Run \`flutter run\` to launch the app

## Architecture

- **State Management**: Flutter built-in (StatefulWidget)
- **Navigation**: GoRouter
- **Design**: Material Design 3
- **Structure**: AI-generated modular architecture

## Navigation

- \`context.push('/route')\` to navigate
- \`context.pop()\` to go back

Generated with AI interpretation of XML mockup.
`;

    await fs.writeFile(path.join(projectDir, 'README.md'), readmeContent);
  }
}