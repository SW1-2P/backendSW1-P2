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

    // Limpiar carpetas temporales antiguas antes de crear una nueva
    await this.cleanupOldTempDirectories();

    const tempDir = path.join(process.cwd(), 'temp', `flutter-project-${Date.now()}-${Math.random().toString(36).substring(7)}`);
    
    try {
      this.logger.debug(`Creando directorio temporal: ${tempDir}`);
      await fs.ensureDir(tempDir);
      
      // Crear estructura base y copiar templates disponibles
      await this.createFlutterProjectStructure(tempDir);
      await this.copyAvailableTemplates(tempDir);
      
      // Generar usando XML o prompt
      if (mobileApp.xml) {
        await this.generateFromXml(tempDir, mobileApp.xml, usuario);
      } else if (mobileApp.prompt) {
        await this.generateFromPrompt(tempDir, mobileApp.prompt, usuario);
      }

      // Crear archivo ZIP
      const zip = new AdmZip();
      await this.addDirectoryToZip(zip, tempDir, '');
      
      this.logger.debug(`Proyecto Flutter generado exitosamente: ${tempDir}`);
      return zip.toBuffer();
    } catch (error) {
      this.logger.error(`Error generando proyecto Flutter en ${tempDir}:`, error);
      throw new InternalServerErrorException('Error generando proyecto Flutter');
    } finally {
      // Limpiar archivos temporales con método mejorado
      await this.cleanupTempDirectory(tempDir);
    }
  }

  private async generateFromXml(projectDir: string, xml: string, usuario?: Usuario): Promise<void> {
    try {
      this.logger.debug('Generando aplicación desde XML');
      
      // Generar estructura completa del proyecto Flutter
      await this.createFlutterProjectStructure(projectDir);
      
      // Procesar XML de draw.io si es necesario
      const processedXmlInfo = await this.processDrawioXml(xml);
      
      // Generar código usando IA
      const systemPrompt = `Eres un experto desarrollador Flutter.
Recibirás información sobre una aplicación móvil (puede ser XML de draw.io o XML simple) y debes generar código Flutter completo.

REQUISITOS CRÍTICOS:
1. Generar AL MENOS 4 pantallas diferentes
2. Usar Material Design 3 y buenas prácticas de Flutter
3. Incluir navegación entre pantallas
4. Agregar elementos interactivos realistas
5. Usar datos de ejemplo
6. Si es XML de draw.io, interpreta los elementos del diagrama para crear la aplicación

IMPORTANTE - CONFIGURACIÓN MODERNA:
- Usa Flutter 3.x con Dart 3.x
- SDK en pubspec.yaml: 'sdk: >=3.0.0 <4.0.0'
- Flutter versión: >=3.10.0
- Null safety habilitado (obligatorio)
- Material Design 3 (useMaterial3: true)

DEPENDENCIAS RECOMENDADAS para pubspec.yaml:
- cupertino_icons: ^1.0.6
- provider: ^6.1.1 (para state management)
- go_router: ^13.2.0 (para navegación)
- http: ^1.1.2 (para APIs)

ARCHIVOS A GENERAR:
- pubspec.yaml (con configuración moderna)
- lib/ archivos .dart (toda la aplicación)
- assets/ si necesitas recursos
- Puedes generar otros archivos específicos de la app

Genera archivos Flutter completos con [FILE: ruta] como marcadores.`;

      const userPrompt = `Genera una aplicación Flutter completa basada en esta información:

${processedXmlInfo.isDrawio ? `
INFORMACIÓN DEL DIAGRAMA DRAW.IO:
${processedXmlInfo.description}

XML ORIGINAL (para referencia):
${xml.substring(0, 500)}...
` : `
XML DIRECTO:
${xml}
`}

IMPORTANTE:
- Crea pubspec.yaml con SDK moderno: sdk: '>=3.0.0 <4.0.0'
- Usa Flutter 3.x features y null safety
- Incluye navegación moderna con go_router
- Material Design 3 con useMaterial3: true
- Al menos 4 pantallas funcionales

Genera todos los archivos necesarios para una aplicación completa y moderna.`;

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

  /**
   * Procesa XML de draw.io y extrae información útil
   */
  private async processDrawioXml(xml: string): Promise<{ isDrawio: boolean; description: string }> {
    try {
      // Verificar si es XML de draw.io
      if (xml.includes('mxfile') && xml.includes('app.diagrams.net')) {
        this.logger.debug('XML de draw.io detectado, procesando...');
        
        // Parsear XML de draw.io
        const result = await xml2js.parseStringPromise(xml, { explicitArray: false });
        
        let description = 'Aplicación móvil basada en diagrama de draw.io:\n';
        
        // Extraer información básica
        if (result.mxfile?.diagram?.name) {
          description += `- Nombre del diagrama: ${result.mxfile.diagram.name}\n`;
        }
        
        // Intentar extraer información de celdas/elementos
        try {
          const diagram = result.mxfile.diagram;
          if (diagram && typeof diagram === 'object') {
            description += '- El diagrama contiene elementos de interfaz móvil\n';
            description += '- Interpreta los elementos como pantallas, botones, formularios y navegación\n';
            description += '- Crea una aplicación móvil funcional basada en el diseño\n';
          }
        } catch (parseError) {
          this.logger.warn('Error procesando elementos del diagrama:', parseError);
          description += '- Diagrama complejo, interpreta como aplicación móvil genérica\n';
        }
        
        description += '\nINSTRUCCIONES ADICIONALES:\n';
        description += '- Crea pantallas basadas en los elementos del diagrama\n';
        description += '- Si no hay elementos claros, crea una aplicación móvil completa con login, dashboard, y funcionalidades típicas\n';
        description += '- Usa Material Design 3 y navegación moderna\n';
        
        return { isDrawio: true, description };
      } else {
        this.logger.debug('XML simple detectado');
        return { isDrawio: false, description: xml };
      }
    } catch (error) {
      this.logger.warn('Error procesando XML, usando como XML simple:', error);
      return { isDrawio: false, description: xml };
    }
  }

  private async generateFromPrompt(projectDir: string, prompt: string, usuario?: Usuario): Promise<void> {
    try {
      this.logger.debug('Generando aplicación desde prompt directo');
      
      await this.createFlutterProjectStructure(projectDir);
      
      // Leer información de templates disponibles
      const templatesInfoPath = path.join(projectDir, 'templates_info.json');
      let templatesInfo: { available: string[], location: string, files: string[] } | null = null;
      
      if (await fs.pathExists(templatesInfoPath)) {
        const templatesContent = await fs.readFile(templatesInfoPath, 'utf-8');
        templatesInfo = JSON.parse(templatesContent);
      }

      const systemPrompt = `Eres un experto desarrollador Flutter que crea aplicaciones móviles usando TEMPLATES PRE-CREADOS de alta calidad.

TEMPLATES DISPONIBLES:
${templatesInfo ? `
📱 TEMPLATES COPIADOS AL PROYECTO:
${templatesInfo.available.map(t => `- ${t}_screen.dart (en lib/screens/)`).join('\n')}

ESTOS ARCHIVOS YA ESTÁN LISTOS Y FUNCIONALES. NO LOS REGENERES.
` : 'No hay templates disponibles, genera desde cero.'}

MISIÓN: Crear una aplicación Flutter COMPLETAMENTE FUNCIONAL usando los templates existentes + código adicional personalizado.

ESTRATEGIA:
1. **USA LOS TEMPLATES** que ya están copiados en lib/screens/
2. **PERSONALIZA** solo lo necesario para el contexto específico  
3. **CONECTA** todo con navegación funcional
4. **AGREGA** pantallas adicionales solo si son necesarias

ARCHIVOS QUE DEBES GENERAR:

📂 **OBLIGATORIOS**:
- pubspec.yaml (con SDK >=3.0.0 <4.0.0)
- lib/main.dart (con rutas a los templates + nuevas pantallas)
- lib/app.dart (MaterialApp con navegación)

📂 **SOLO SI ES NECESARIO**:
- lib/screens/[nueva_pantalla].dart (solo si no existe template)
- lib/widgets/[componente_custom].dart 
- lib/models/[modelo].dart
- lib/services/[servicio].dart

CONFIGURACIÓN TÉCNICA:
- pubspec.yaml con SDK >=3.0.0 <4.0.0
- Material Design 3 (useMaterial3: true)
- Navegación funcional entre templates y nuevas pantallas
- Imports correctos para todos los archivos

INSTRUCCIONES CRÍTICAS:
1. **REUTILIZA** los templates copiados, NO los regeneres
2. **PERSONALIZA** solo nombres, textos, colores específicos del contexto
3. **CONECTA** todo con navegación fluida
4. **AGREGA** funcionalidad específica del prompt si es necesario

 EJEMPLO DE MAIN.DART ESPERADO:
 - Importar todos los templates desde lib/screens/
 - MaterialApp con rutas a todos los templates
 - Navegación funcional entre pantallas
 - Theme moderno con Material Design 3

NO regeneres templates existentes. ÚSALOS y personalízalos según el contexto.`;

      const userPrompt = `Crea una aplicación Flutter COMPLETAMENTE FUNCIONAL para:

"${prompt}"

INSTRUCCIONES ESPECÍFICAS:

1. **USA LOS TEMPLATES DISPONIBLES**: Los archivos en lib/screens/ ya están listos
2. **PERSONALIZA SEGÚN CONTEXTO**: Cambia textos, títulos, colores para que coincidan con "${prompt}"
3. **CONECTA CON NAVEGACIÓN**: Crea rutas funcionales entre todas las pantallas
4. **AGREGA SOLO LO NECESARIO**: Pantallas adicionales específicas del contexto si son requeridas

ESTRUCTURA FINAL ESPERADA:
- ✅ Templates existentes conectados y funcionando
- ✅ Navegación fluida entre todas las pantallas  
- ✅ Personalización específica del contexto
- ✅ Funcionalidad completa sin pantallas en blanco

IMPORTANTE: 
- NO regeneres los templates que ya existen
- SÍ personaliza contenido, títulos, y navegación
- SÍ agrega pantallas específicas si el contexto lo requiere
- ASEGURA que flutter run funcione perfectamente

¡Crea una aplicación funcional usando los templates de calidad + personalización!`;

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
    this.logger.debug('Creando estructura completa del proyecto Flutter');
    
    const appName = this.generateAppName('');
    
    // Crear estructura de directorios completa
    const directories = [
      // Directorios principales
      'lib',
      'lib/core/themes',
      'lib/features/auth',
      'lib/features/home',
      'lib/shared/widgets',
      
      // Android
      'android',
      'android/app',
      'android/app/src',
      'android/app/src/main',
      'android/app/src/main/kotlin',
      `android/app/src/main/kotlin/com/example/${appName}`,
      'android/app/src/main/res',
      'android/app/src/main/res/drawable',
      'android/app/src/main/res/drawable-v21',
      'android/app/src/main/res/mipmap-hdpi',
      'android/app/src/main/res/mipmap-mdpi',
      'android/app/src/main/res/mipmap-xhdpi',
      'android/app/src/main/res/mipmap-xxhdpi',
      'android/app/src/main/res/mipmap-xxxhdpi',
      'android/app/src/main/res/values',
      'android/app/src/main/res/values-night',
      'android/app/src/debug',
      'android/app/src/profile',
      'android/gradle',
      'android/gradle/wrapper',
      
      // iOS
      'ios',
      'ios/Runner',
      'ios/Runner/Assets.xcassets',
      'ios/Runner/Assets.xcassets/AppIcon.appiconset',
      'ios/Runner/Assets.xcassets/LaunchImage.imageset',
      'ios/Runner/Base.lproj',
      'ios/Runner.xcodeproj',
      'ios/Runner.xcodeproj/project.xcworkspace',
      'ios/Runner.xcodeproj/project.xcworkspace/xcshareddata',
      'ios/Runner.xcodeproj/xcshareddata',
      'ios/Runner.xcodeproj/xcshareddata/xcschemes',
      'ios/Runner.xcworkspace',
      'ios/Runner.xcworkspace/xcshareddata',
      
      // Linux
      'linux',
      'linux/flutter',
      
      // macOS
      'macos',
      'macos/Runner',
      'macos/Runner/Assets.xcassets',
      'macos/Runner/Assets.xcassets/AppIcon.appiconset',
      'macos/Runner/Base.lproj',
      'macos/Runner.xcodeproj',
      'macos/Runner.xcodeproj/project.xcworkspace',
      'macos/Runner.xcodeproj/project.xcworkspace/xcshareddata',
      'macos/Runner.xcodeproj/xcshareddata',
      'macos/Runner.xcodeproj/xcshareddata/xcschemes',
      'macos/Runner.xcworkspace',
      'macos/Runner.xcworkspace/xcshareddata',
      
      // Web
      'web',
      
      // Windows
      'windows',
      'windows/flutter',
      'windows/runner',
      
      // Test
      'test',
      
      // Assets
      'assets',
      'assets/images',
    ];
    
    for (const dir of directories) {
      await fs.mkdirp(path.join(projectDir, dir));
    }
    
    // Crear archivos base
    await this.createPubspecYaml(projectDir, appName);
    await this.createMainDart(projectDir);
    await this.createAppDart(projectDir, appName);
    await this.createMetadataFile(projectDir);
    await this.createGitignore(projectDir);
    await this.createAnalysisOptions(projectDir);
    await this.createREADME(projectDir, appName);
    
    // Archivos Android
    await this.createAndroidFiles(projectDir, appName);
    
    // Archivos iOS
    await this.createIOSFiles(projectDir, appName);
    
    // Archivos Web
    await this.createWebFiles(projectDir, appName);
    
    // Archivos Windows
    await this.createWindowsFiles(projectDir, appName);
    
    // Archivos Linux
    await this.createLinuxFiles(projectDir, appName);
    
    // Archivos macOS
    await this.createMacOSFiles(projectDir, appName);
    
    // Test básico
    await this.createTestFiles(projectDir, appName);
    
    // Tema personalizado
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

  private async createAndroidFiles(projectDir: string, appName: string): Promise<void> {
    // build.gradle del proyecto
    const projectGradle = `buildscript {
    ext.kotlin_version = '1.7.10'
    repositories {
        google()
        mavenCentral()
    }

    dependencies {
        classpath 'com.android.tools.build:gradle:7.3.0'
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.buildDir = '../build'
gradle.projectsEvaluated {
    tasks.withType(JavaCompile) {
        options.compilerArgs << "-Xlint:unchecked" << "-Xlint:deprecation"
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}
`;
    
    await fs.writeFile(path.join(projectDir, 'android/build.gradle'), projectGradle);

    // build.gradle de la app
    const appGradle = `def localProperties = new Properties()
def localPropertiesFile = rootProject.file('local.properties')
if (localPropertiesFile.exists()) {
    localPropertiesFile.withReader('UTF-8') { reader ->
        localProperties.load(reader)
    }
}

def flutterRoot = localProperties.getProperty('flutter.sdk')
if (flutterRoot == null) {
    throw new GradleException("Flutter SDK not found. Define location with flutter.sdk in the local.properties file.")
}

def flutterVersionCode = localProperties.getProperty('flutter.versionCode')
if (flutterVersionCode == null) {
    flutterVersionCode = '1'
}

def flutterVersionName = localProperties.getProperty('flutter.versionName')
if (flutterVersionName == null) {
    flutterVersionName = '1.0'
}

apply plugin: 'com.android.application'
apply plugin: 'kotlin-android'
apply from: "$flutterRoot/packages/flutter_tools/gradle/flutter.gradle"

android {
    namespace "com.example.${appName}"
    compileSdkVersion flutter.compileSdkVersion
    ndkVersion flutter.ndkVersion

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }

    kotlinOptions {
        jvmTarget = '1.8'
    }

    sourceSets {
        main.java.srcDirs += 'src/main/kotlin'
    }

    defaultConfig {
        applicationId "com.example.${appName}"
        minSdkVersion flutter.minSdkVersion
        targetSdkVersion flutter.targetSdkVersion
        versionCode flutterVersionCode.toInteger()
        versionName flutterVersionName
    }

    buildTypes {
        release {
            signingConfig signingConfigs.debug
        }
    }
}

flutter {
    source '../..'
}

dependencies {
    implementation "org.jetbrains.kotlin:kotlin-stdlib-jdk7:$kotlin_version"
}
`;
    
    await fs.writeFile(path.join(projectDir, 'android/app/build.gradle'), appGradle);

    // MainActivity.kt
    const mainActivity = `package com.example.${appName}

import io.flutter.embedding.android.FlutterActivity

class MainActivity: FlutterActivity() {
}
`;
    
    await fs.writeFile(path.join(projectDir, `android/app/src/main/kotlin/com/example/${appName}/MainActivity.kt`), mainActivity);

    // AndroidManifest.xml
    const manifest = `<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.${appName}">
   <application
        android:label="${appName}"
        android:name="\${applicationName}"
        android:icon="@mipmap/ic_launcher">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/LaunchTheme"
            android:taskAffinity=""
            android:excludeFromRecents="false">
            <intent-filter>
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
    
    await fs.writeFile(path.join(projectDir, 'android/app/src/main/AndroidManifest.xml'), manifest);

    // gradle.properties
    const gradleProperties = `org.gradle.jvmargs=-Xmx1536M
android.useAndroidX=true
android.enableJetifier=true
`;
    
    await fs.writeFile(path.join(projectDir, 'android/gradle.properties'), gradleProperties);

    // gradle-wrapper.properties
    const wrapperProperties = `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-7.5-all.zip
`;
    
    await fs.writeFile(path.join(projectDir, 'android/gradle/wrapper/gradle-wrapper.properties'), wrapperProperties);

    // settings.gradle
    const settingsGradle = `include ':app'

def localPropertiesFile = new File(rootProject.projectDir, "local.properties")
def properties = new Properties()

assert localPropertiesFile.exists()
localPropertiesFile.withReader("UTF-8") { reader -> properties.load(reader) }

def flutterSdkPath = properties.getProperty("flutter.sdk")
assert flutterSdkPath != null, "flutter.sdk not set in local.properties"
apply from: "$flutterSdkPath/packages/flutter_tools/gradle/app_plugin_loader.gradle"
`;
    
    await fs.writeFile(path.join(projectDir, 'android/settings.gradle'), settingsGradle);
  }

  private async createIOSFiles(projectDir: string, appName: string): Promise<void> {
    // Info.plist
    const infoPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleDevelopmentRegion</key>
	<string>$(DEVELOPMENT_LANGUAGE)</string>
	<key>CFBundleDisplayName</key>
	<string>${appName}</string>
	<key>CFBundleExecutable</key>
	<string>$(EXECUTABLE_NAME)</string>
	<key>CFBundleIdentifier</key>
	<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
	<key>CFBundleInfoDictionaryVersion</key>
	<string>6.0</string>
	<key>CFBundleName</key>
	<string>${appName}</string>
	<key>CFBundlePackageType</key>
	<string>APPL</string>
	<key>CFBundleShortVersionString</key>
	<string>$(FLUTTER_BUILD_NAME)</string>
	<key>CFBundleSignature</key>
	<string>????</string>
	<key>CFBundleVersion</key>
	<string>$(FLUTTER_BUILD_NUMBER)</string>
	<key>LSRequiresIPhoneOS</key>
	<true/>
	<key>UILaunchStoryboardName</key>
	<string>LaunchScreen</string>
	<key>UIMainStoryboardFile</key>
	<string>Main</string>
	<key>UISupportedInterfaceOrientations</key>
	<array>
		<string>UIInterfaceOrientationPortrait</string>
		<string>UIInterfaceOrientationLandscapeLeft</string>
		<string>UIInterfaceOrientationLandscapeRight</string>
	</array>
	<key>UISupportedInterfaceOrientations~ipad</key>
	<array>
		<string>UIInterfaceOrientationPortrait</string>
		<string>UIInterfaceOrientationPortraitUpsideDown</string>
		<string>UIInterfaceOrientationLandscapeLeft</string>
		<string>UIInterfaceOrientationLandscapeRight</string>
	</array>
	<key>UIViewControllerBasedStatusBarAppearance</key>
	<false/>
	<key>CADisableMinimumFrameDurationOnPhone</key>
	<true/>
	<key>UIApplicationSupportsIndirectInputEvents</key>
	<true/>
</dict>
</plist>
`;
    
    await fs.writeFile(path.join(projectDir, 'ios/Runner/Info.plist'), infoPlist);

    // AppDelegate.swift
    const appDelegate = `import UIKit
import Flutter

@UIApplicationMain
@objc class AppDelegate: FlutterAppDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    GeneratedPluginRegistrant.register(with: self)
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
}
`;
    
    await fs.writeFile(path.join(projectDir, 'ios/Runner/AppDelegate.swift'), appDelegate);
  }

  private async createWebFiles(projectDir: string, appName: string): Promise<void> {
    // index.html
    const indexHtml = `<!DOCTYPE html>
<html>
<head>
  <base href="$FLUTTER_BASE_HREF">

  <meta charset="UTF-8">
  <meta content="IE=Edge" http-equiv="X-UA-Compatible">
  <meta name="description" content="A new Flutter project.">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black">
  <meta name="apple-mobile-web-app-title" content="${appName}">
  <link rel="apple-touch-icon" href="icons/Icon-192.png">
  <link rel="manifest" href="manifest.json">

  <title>${appName}</title>
  <link rel="manifest" href="manifest.json">

  <script>
    var serviceWorkerVersion = null;
    var scriptLoaded = false;
    function loadMainDartJs() {
      if (scriptLoaded) {
        return;
      }
      scriptLoaded = true;
      var scriptTag = document.createElement('script');
      scriptTag.src = 'main.dart.js';
      scriptTag.type = 'application/javascript';
      document.body.append(scriptTag);
    }

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('flutter_service_worker.js?v=' + serviceWorkerVersion);
      });
    }
  </script>
</head>
<body>
  <script>
    window.addEventListener('load', function(ev) {
      _flutter.loader.loadEntrypoint({
        serviceWorker: {
          serviceWorkerVersion: serviceWorkerVersion,
        }
      }).then(function(engineInitializer) {
        return engineInitializer.initializeEngine();
      }).then(function(appRunner) {
        return appRunner.runApp();
      });
    });
  </script>
</body>
</html>
`;
    
    await fs.writeFile(path.join(projectDir, 'web/index.html'), indexHtml);

    // manifest.json
    const manifest = `{
    "name": "${appName}",
    "short_name": "${appName}",
    "start_url": ".",
    "display": "standalone",
    "background_color": "#0175C2",
    "theme_color": "#0175C2",
    "description": "A new Flutter project.",
    "orientation": "portrait-primary",
    "prefer_related_applications": false,
    "icons": [
        {
            "src": "icons/Icon-192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "icons/Icon-512.png",
            "sizes": "512x512",
            "type": "image/png"
        },
        {
            "src": "icons/Icon-maskable-192.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "maskable"
        },
        {
            "src": "icons/Icon-maskable-512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "maskable"
        }
    ]
}
`;
    
    await fs.writeFile(path.join(projectDir, 'web/manifest.json'), manifest);
  }

  private async createWindowsFiles(projectDir: string, appName: string): Promise<void> {
    // Crear archivos básicos para Windows (simplified)
    const cmakeLists = `# Generated file

cmake_minimum_required(VERSION 3.15)
project(${appName})

# Flutter install
set(FLUTTER_TOOL "\${CMAKE_CURRENT_SOURCE_DIR}/../flutter/ephemeral/.plugin_symlinks/flutter_tools/bin/flutter_tools.snapshot")

# Flutter wrapper
execute_process(
  COMMAND dart "\${FLUTTER_TOOL}" windows-x64 \${CMAKE_BUILD_TYPE}
  WORKING_DIRECTORY "\${CMAKE_CURRENT_SOURCE_DIR}/../"
  RESULT_VARIABLE result
)
`;
    
    await fs.writeFile(path.join(projectDir, 'windows/CMakeLists.txt'), cmakeLists);
  }

  private async createLinuxFiles(projectDir: string, appName: string): Promise<void> {
    // Crear archivos básicos para Linux (simplified)
    const cmakeLists = `# Generated file

cmake_minimum_required(VERSION 3.13)
project(${appName})

# Flutter install
set(FLUTTER_TOOL "\${CMAKE_CURRENT_SOURCE_DIR}/../flutter/ephemeral/.plugin_symlinks/flutter_tools/bin/flutter_tools.snapshot")

# Flutter wrapper
execute_process(
  COMMAND dart "\${FLUTTER_TOOL}" linux-x64 \${CMAKE_BUILD_TYPE}
  WORKING_DIRECTORY "\${CMAKE_CURRENT_SOURCE_DIR}/../"
  RESULT_VARIABLE result
)
`;
    
    await fs.writeFile(path.join(projectDir, 'linux/CMakeLists.txt'), cmakeLists);
  }

  private async createMacOSFiles(projectDir: string, appName: string): Promise<void> {
    // Info.plist para macOS
    const infoPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleDevelopmentRegion</key>
	<string>$(DEVELOPMENT_LANGUAGE)</string>
	<key>CFBundleExecutable</key>
	<string>$(EXECUTABLE_NAME)</string>
	<key>CFBundleIconFile</key>
	<string></string>
	<key>CFBundleIdentifier</key>
	<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
	<key>CFBundleInfoDictionaryVersion</key>
	<string>6.0</string>
	<key>CFBundleName</key>
	<string>$(PRODUCT_NAME)</string>
	<key>CFBundlePackageType</key>
	<string>APPL</string>
	<key>CFBundleShortVersionString</key>
	<string>$(FLUTTER_BUILD_NAME)</string>
	<key>CFBundleVersion</key>
	<string>$(FLUTTER_BUILD_NUMBER)</string>
	<key>LSMinimumSystemVersion</key>
	<string>$(MACOSX_DEPLOYMENT_TARGET)</string>
	<key>NSHumanReadableCopyright</key>
	<string>$(PRODUCT_COPYRIGHT)</string>
	<key>NSMainStoryboardFile</key>
	<string>Main</string>
	<key>NSPrincipalClass</key>
	<string>NSApplication</string>
</dict>
</plist>
`;
    
    await fs.writeFile(path.join(projectDir, 'macos/Runner/Info.plist'), infoPlist);
  }

  private async createTestFiles(projectDir: string, appName: string): Promise<void> {
    const testContent = `import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:${appName}/main.dart';

void main() {
  testWidgets('Counter increments smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const MyApp());

    // Verify that our counter starts at 0.
    expect(find.text('0'), findsOneWidget);
    expect(find.text('1'), findsNothing);

    // Tap the '+' icon and trigger a frame.
    await tester.tap(find.byIcon(Icons.add));
    await tester.pump();

    // Verify that our counter has incremented.
    expect(find.text('0'), findsNothing);
    expect(find.text('1'), findsOneWidget);
  });
}
`;
    
    await fs.writeFile(path.join(projectDir, 'test/widget_test.dart'), testContent);
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

  private async createMetadataFile(projectDir: string): Promise<void> {
    const content = `# This file tracks properties of this Flutter project.
# Used by Flutter tool to assess capabilities and perform upgrades etc.
#
# This file should be checked into version control.

name: flutter_app
description: Flutter Demo
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'
  flutter: ">=3.10.0"
`;
    
    await fs.writeFile(path.join(projectDir, '.metadata'), content);
  }

  private async createGitignore(projectDir: string): Promise<void> {
    const content = `# Miscellaneous
*.class
*.log
*.pyc
*.swp
.DS_Store
.atom/
.buildlog/
.history
.svn/
migrate_working_dir/

# IntelliJ related
*.iml
*.ipr
*.iws
.idea/

# The .vscode folder contains launch configuration and tasks you configure in
# VS Code which you may wish to be included in version control, so this line
# is commented out by default.
#.vscode/

# Flutter/Dart/Pub related
**/doc/api/
**/ios/Flutter/.last_build_id
.dart_tool/
.flutter-plugins
.flutter-plugins-dependencies
.packages
.pub-cache/
.pub/
/build/

# Symbolication related
app.*.symbols

# Obfuscation related
app.*.map.json

# Android Studio will place build artifacts here
/android/app/debug
/android/app/profile
/android/app/release
`;
    
    await fs.writeFile(path.join(projectDir, '.gitignore'), content);
  }

  private async createAnalysisOptions(projectDir: string): Promise<void> {
    const content = `# This file configures the analyzer, which statically analyzes Dart code to
# check for errors, warnings, and lints.
#
# The issues identified by the analyzer are surfaced in the UI of Dart-enabled
# IDEs (https://dart.dev/tools#ides-and-editors). The analyzer can also be
# invoked from the command line by running \`flutter analyze\`.

# The following line activates a set of recommended lints for Flutter apps,
# packages, and plugins designed to encourage good coding practices.
include: package:flutter_lints/flutter.yaml

linter:
  # The lint rules applied to this project can be customized in the
  # section below to disable rules from the \`package:flutter_lints/flutter.yaml\`
  # included above or to enable additional rules. A list of all available lints
  # and their documentation is published at
  # https://dart-lang.github.io/linter/lints/index.html.
  #
  # Instead of disabling a lint rule for the entire project in the
  # section below, it can also be suppressed for a single line of code
  # or a specific dart file by using the \`// ignore: name_of_lint\` and
  # \`// ignore_for_file: name_of_lint\` syntax on the line or in the file
  # producing the lint.
  rules:
    # avoid_print: false  # Uncomment to disable the \`avoid_print\` rule
    # prefer_single_quotes: true  # Uncomment to enable the \`prefer_single_quotes\` rule

# Additional information about this file can be found at
# https://dart.dev/guides/language/analysis-options
`;
    
    await fs.writeFile(path.join(projectDir, 'analysis_options.yaml'), content);
  }

  private async createREADME(projectDir: string, appName: string): Promise<void> {
    const content = `# ${appName}

Una nueva aplicación Flutter.

## Comenzando

Este proyecto es un punto de partida para una aplicación Flutter.

Algunos recursos para comenzar si este es tu primer proyecto Flutter:

- [Lab: Escribe tu primera aplicación Flutter](https://docs.flutter.dev/get-started/codelab)
- [Cookbook: Ejemplos útiles de Flutter](https://docs.flutter.dev/cookbook)

Para obtener ayuda para comenzar con el desarrollo de Flutter, consulta la
[documentación en línea](https://docs.flutter.dev/), que ofrece tutoriales,
ejemplos, orientación sobre desarrollo móvil y una referencia completa de la API.
`;
    
    await fs.writeFile(path.join(projectDir, 'README.md'), content);
  }

  private async processGeneratedCode(projectDir: string, code: string): Promise<void> {
    // Solo proteger archivos críticos de plataforma que la IA no debería modificar
    const protectedFiles = [
      'android/app/src/main/AndroidManifest.xml',
      'android/gradle.properties',
      'android/settings.gradle',
      'android/build.gradle',
      'android/app/build.gradle',
      'ios/Runner/Info.plist',
      'ios/Runner/AppDelegate.swift',
      '.metadata',
      '.gitignore'
    ];

    const filePattern = /\[FILE: ([^\]]+)\]\s*```(?:\w+)?\s*([\s\S]*?)```/g;
    let match;
    
    while ((match = filePattern.exec(code)) !== null) {
      const filePath = match[1].trim();
      const fileContent = match[2].trim();
      
      // Solo proteger archivos críticos de plataforma
      if (protectedFiles.includes(filePath)) {
        this.logger.warn(`Archivo de plataforma protegido ignorado: ${filePath} (no se sobrescribe)`);
        continue;
      }
      
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

  /**
   * Limpia un directorio temporal específico de forma segura
   */
  private async cleanupTempDirectory(tempDir: string): Promise<void> {
    if (!await fs.pathExists(tempDir)) {
      return;
    }

    const maxRetries = 3;
    let attempts = 0;

    while (attempts < maxRetries) {
      try {
        // Pequeño delay para asegurar que todos los handles estén cerrados
        await new Promise(resolve => setTimeout(resolve, 100 * (attempts + 1)));
        
        await fs.remove(tempDir);
        this.logger.debug(`Directorio temporal eliminado exitosamente: ${tempDir}`);
        return;
      } catch (cleanupError) {
        attempts++;
        this.logger.warn(`Intento ${attempts}/${maxRetries} - Error limpiando ${tempDir}:`, cleanupError);
        
        if (attempts >= maxRetries) {
          this.logger.error(`No se pudo eliminar directorio temporal después de ${maxRetries} intentos: ${tempDir}`);
          
          // En Windows, programar eliminación posterior
          if (process.platform === 'win32') {
            setTimeout(async () => {
              try {
                await fs.remove(tempDir);
                this.logger.debug(`Directorio temporal eliminado en limpieza diferida: ${tempDir}`);
              } catch (delayedError) {
                this.logger.error(`Error en limpieza diferida de ${tempDir}:`, delayedError);
              }
            }, 5000);
          }
          return;
        }
        
        // Esperar antes del siguiente intento
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }
  }

  /**
   * Limpia directorios temporales antiguos (más de 1 hora)
   */
  private async cleanupOldTempDirectories(): Promise<void> {
    try {
      const tempBasePath = path.join(process.cwd(), 'temp');
      
      if (!await fs.pathExists(tempBasePath)) {
        return;
      }

      const entries = await fs.readdir(tempBasePath, { withFileTypes: true });
      const now = Date.now();
      const oneHourInMs = 60 * 60 * 1000; // 1 hora en milisegundos
      
      let cleanedCount = 0;

      for (const entry of entries) {
        if (entry.isDirectory() && entry.name.startsWith('flutter-project-')) {
          const dirPath = path.join(tempBasePath, entry.name);
          
          try {
            const stats = await fs.stat(dirPath);
            const ageInMs = now - stats.birthtimeMs;
            
            // Si el directorio tiene más de 1 hora, eliminarlo
            if (ageInMs > oneHourInMs) {
              await fs.remove(dirPath);
              cleanedCount++;
              this.logger.debug(`Directorio temporal antiguo eliminado: ${entry.name}`);
            }
          } catch (statError) {
            this.logger.warn(`Error verificando directorio temporal ${entry.name}:`, statError);
          }
        }
      }

      if (cleanedCount > 0) {
        this.logger.log(`Limpieza completada: ${cleanedCount} directorios temporales antiguos eliminados`);
      }
    } catch (error) {
      this.logger.warn('Error durante limpieza de directorios temporales antiguos:', error);
    }
  }

  /**
   * Copia templates disponibles al proyecto
   */
  private async copyAvailableTemplates(projectDir: string): Promise<void> {
    try {
      const templatesPath = path.join(process.cwd(), 'src/mobile-generator/templates/flutter/components');
      
      if (!await fs.pathExists(templatesPath)) {
        this.logger.warn('Directorio de templates no encontrado');
        return;
      }

      // Crear directorio de screens en el proyecto
      const screensDir = path.join(projectDir, 'lib/screens');
      await fs.mkdirp(screensDir);

      // Obtener lista de templates disponibles
      const templateFiles = await fs.readdir(templatesPath);
      const availableTemplates: string[] = [];

      for (const file of templateFiles) {
        if (file.endsWith('.template.dart')) {
          const templateName = file.replace('.template.dart', '');
          const templatePath = path.join(templatesPath, file);
          
          // Leer el contenido del template
          const templateContent = await fs.readFile(templatePath, 'utf-8');
          
          // Copiar al directorio de screens con nombre apropiado
          const screenName = templateName.replace('-component', '_screen') + '.dart';
          const destPath = path.join(screensDir, screenName);
          
          await fs.writeFile(destPath, templateContent);
          availableTemplates.push(templateName);
          
          this.logger.debug(`Template copiado: ${templateName} -> ${screenName}`);
        }
      }

      // Guardar lista de templates para la IA
      const templatesInfo = {
        available: availableTemplates,
        location: 'lib/screens/',
        files: templateFiles.filter(f => f.endsWith('.template.dart')).map(f => f.replace('.template.dart', '_screen.dart'))
      };

      await fs.writeFile(
        path.join(projectDir, 'templates_info.json'), 
        JSON.stringify(templatesInfo, null, 2)
      );

    } catch (error) {
      this.logger.error('Error copiando templates:', error);
    }
  }
} 