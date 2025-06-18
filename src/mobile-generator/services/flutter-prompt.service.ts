import { Injectable, Logger } from '@nestjs/common';
import { GenerationContext } from '../interfaces/generator.interface';

@Injectable()
export class FlutterPromptService {
  private readonly logger = new Logger(FlutterPromptService.name);

  /**
   * Restricciones y reglas de código Flutter para evitar errores
   */
  private readonly FLUTTER_CODE_RESTRICTIONS = `
RESTRICCIONES OBLIGATORIAS PARA CÓDIGO FLUTTER:

🚫 ERRORES PROHIBIDOS:
- NO usar Theme.of(context).colorSchemeSecondary (no existe)
- NO declarar variables duplicadas como 'colorScheme'
- NO importar packages no estándar como riverpod, provider, bloc sin especificación
- NO usar getters que no existen en ThemeData
- NO crear variables no utilizadas

✅ REGLAS DE CÓDIGO LIMPIO:
- Usar SOLO Theme.of(context).colorScheme.primary, secondary, etc.
- Declarar variables únicas sin duplicados
- Usar SOLO material.dart, widgets estándar de Flutter
- Validar que todos los getters existan en la API de Flutter
- Eliminar variables no usadas automáticamente

📱 ESTRUCTURA OBLIGATORIA:
- Material Design 3 estándar
- GoRouter para navegación (sin packages adicionales)
- Widgets nativos de Flutter únicamente
- Variables con nombres únicos y descriptivos

🎨 THEME CORRECTO:
- colorScheme.primary (✅)
- colorScheme.secondary (✅) 
- colorScheme.surface (✅)
- colorScheme.onSurface (✅)
- NO colorSchemeSecondary (❌)
- NO colorScheme duplicado (❌)

💾 DEPENDENCIAS PERMITIDAS:
SOLO estas dependencias estándar:
dependencies:
  flutter:
    sdk: flutter
  go_router: ^14.2.0
  
NO incluir: riverpod, provider, bloc, dio, http sin especificación explícita.
  `;

  /**
   * Genera prompt optimizado para crear aplicación Flutter con restricciones
   */
  generatePromptForFlutterApp(input: {
    appName: string;
    description: string;
    screens?: string[];
    domain?: string;
  }): string {
    this.logger.debug(`🎯 Generando prompt Flutter con restricciones para: ${input.appName}`);

    const basePrompt = `
${this.FLUTTER_CODE_RESTRICTIONS}

GENERAR APLICACIÓN FLUTTER COMPLETA:

Nombre: ${input.appName}
Descripción: ${input.description}
Dominio: ${input.domain || 'General'}

PANTALLAS REQUERIDAS:
${input.screens?.map((screen, index) => `${index + 1}. ${screen}Screen`).join('\n') || '- HomeScreen\n- ProfileScreen\n- SettingsScreen'}

ESTRUCTURA DE ARCHIVOS OBLIGATORIA:
lib/
├── main.dart (MaterialApp con GoRouter)
├── core/
│   ├── router/app_router.dart (GoRouter config)
│   └── themes/app_theme.dart (Material 3 theme)
├── features/
│   ├── [feature]/screens/[screen]_screen.dart
│   └── [feature]/widgets/[widget].dart
└── shared/widgets/common_widgets.dart

VALIDACIONES TÉCNICAS:
✅ Verificar que NO existe colorSchemeSecondary
✅ Verificar que NO hay variables duplicadas
✅ Verificar que SOLO se usan dependencias permitidas
✅ Verificar que todas las páginas tienen contenido específico
✅ Verificar sintaxis correcta de Material Design 3

GENERAR:
1. Estructura completa de archivos
2. Navegación funcional entre pantallas
3. Tema Material Design 3 válido
4. Widgets reutilizables sin errores
5. Router con todas las rutas configuradas

CADA PANTALLA DEBE:
- Tener contenido específico y funcional
- Usar AppBar con título descriptivo
- Incluir navegación apropiada
- Mostrar widgets relevantes al propósito
- Seguir patrones de Material Design 3
    `;

    return basePrompt.trim();
  }

  /**
   * Genera prompt específico para procesar mockups XML
   */
  generatePromptFromXML(xmlContent: string, appName: string): string {
    this.logger.debug(`📱 Procesando XML mockup para app: ${appName}`);

    // Analizar XML para extraer componentes
    const extractedComponents = this.extractComponentsFromXML(xmlContent);
    
    const xmlPrompt = `
${this.FLUTTER_CODE_RESTRICTIONS}

ANALIZAR MOCKUP XML Y GENERAR FLUTTER APP:

Aplicación: ${appName}
XML Mockup Analizado:
${xmlContent}

COMPONENTES DETECTADOS:
${extractedComponents.map(comp => `- ${comp.type}: ${comp.text || comp.description}`).join('\n')}

PANTALLAS A GENERAR:
${this.generateScreensFromComponents(extractedComponents)}

CONVERSIÓN XML → FLUTTER:
1. Analizar cada elemento del mockup
2. Convertir a widgets Flutter equivalentes
3. Mantener diseño y funcionalidad del mockup
4. Crear navegación entre pantallas detectadas
5. Implementar formularios y componentes interactivos

MAPEO DE COMPONENTES:
- Botones XML → ElevatedButton/OutlinedButton
- Campos de texto → TextFormField
- Listas → ListView/Column
- Tarjetas → Card widgets
- Navegación → AppBar + Drawer/BottomNavigationBar

RESULTADO ESPERADO:
- App Flutter funcional basada en el mockup
- Navegación completa entre pantallas
- Formularios interactivos
- Diseño fiel al mockup original
- Código sin errores de compilación

IMPORTANTE: Cada pantalla debe tener contenido real, no placeholders.
    `;

    return xmlPrompt.trim();
  }

  /**
   * Extrae componentes del XML mockup
   */
  private extractComponentsFromXML(xmlContent: string): any[] {
    const components: any[] = [];
    
    try {
      // Buscar elementos comunes en el XML
      const textMatches = xmlContent.match(/value="([^"]+)"/g) || [];
      const styleMatches = xmlContent.match(/style="([^"]+)"/g) || [];
      
      textMatches.forEach(match => {
        const text = match.replace('value="', '').replace('"', '');
        if (text.length > 1 && !text.includes('mxgraph')) {
          components.push({
            type: this.determineComponentType(text),
            text: text,
            description: `Componente con texto: ${text}`
          });
        }
      });

      // Detectar tipos de componentes por estilo
      if (xmlContent.includes('fillColor')) {
        components.push({
          type: 'form',
          description: 'Formulario detectado'
        });
      }

      if (xmlContent.includes('button') || xmlContent.includes('rounded')) {
        components.push({
          type: 'button',
          description: 'Botones detectados'
        });
      }

      if (xmlContent.includes('strokeColor')) {
        components.push({
          type: 'input',
          description: 'Campos de entrada detectados'
        });
      }

    } catch (error) {
      this.logger.error('Error parsing XML mockup:', error);
      // Fallback: generar componentes básicos
      components.push(
        { type: 'screen', description: 'Pantalla principal' },
        { type: 'form', description: 'Formulario' },
        { type: 'button', description: 'Botones de acción' }
      );
    }

    return components.length > 0 ? components : [
      { type: 'home', description: 'Pantalla de inicio' },
      { type: 'detail', description: 'Pantalla de detalles' },
      { type: 'settings', description: 'Configuraciones' }
    ];
  }

  /**
   * Determina el tipo de componente basado en el texto
   */
  private determineComponentType(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('dashboard') || lowerText.includes('home')) {
      return 'home';
    }
    if (lowerText.includes('create') || lowerText.includes('add')) {
      return 'create';
    }
    if (lowerText.includes('project') || lowerText.includes('item')) {
      return 'project';
    }
    if (lowerText.includes('publish') || lowerText.includes('save')) {
      return 'button';
    }
    if (lowerText.includes('permission') || lowerText.includes('setting')) {
      return 'settings';
    }
    if (lowerText.includes('description') || lowerText.includes('text')) {
      return 'input';
    }
    
    return 'component';
  }

  /**
   * Genera lista de pantallas basada en componentes detectados
   */
  private generateScreensFromComponents(components: any[]): string {
    const screens = new Set<string>();
    
    components.forEach(comp => {
      switch (comp.type) {
        case 'home':
          screens.add('HomeScreen - Dashboard principal');
          break;
        case 'create':
          screens.add('CreateProjectScreen - Crear nuevo proyecto');
          break;
        case 'project':
          screens.add('ProjectDetailScreen - Detalles del proyecto');
          break;
        case 'settings':
          screens.add('SettingsScreen - Configuraciones y permisos');
          break;
        case 'form':
          screens.add('FormScreen - Formulario de entrada');
          break;
        default:
          screens.add('DetailScreen - Pantalla de detalles');
      }
    });

    // Asegurar mínimo de pantallas
    if (screens.size < 3) {
      screens.add('HomeScreen - Pantalla principal');
      screens.add('DetailScreen - Pantalla de detalles');
      screens.add('ProfileScreen - Perfil de usuario');
    }

    return Array.from(screens).join('\n');
  }

  /**
   * Valida que el prompt generado cumple las restricciones
   */
  validateFlutterPrompt(prompt: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Verificar restricciones
    if (prompt.includes('colorSchemeSecondary')) {
      errors.push('Uso prohibido de colorSchemeSecondary');
    }
    
    if (prompt.includes('riverpod') && !prompt.includes('PERMITIR riverpod')) {
      errors.push('Dependencia riverpod no permitida sin especificación');
    }
    
    if (!prompt.includes('Material Design 3')) {
      errors.push('Debe especificar Material Design 3');
    }

    if (!prompt.includes('GoRouter')) {
      errors.push('Debe usar GoRouter para navegación');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  createSystemPrompt(): string {
    return `Eres un experto desarrollador Flutter que genera aplicaciones modernas desde mockups XML de Draw.io.

**FORMATO DE RESPUESTA OBLIGATORIO:**
DEBES usar EXACTAMENTE este formato para cada archivo generado:

[FILE: ruta/del/archivo.dart]
\`\`\`dart
// Tu código aquí
\`\`\`

[FILE: pubspec.yaml]
\`\`\`yaml
# Tu código aquí
\`\`\`

EJEMPLO CORRECTO:
[FILE: lib/main.dart]
\`\`\`dart
import 'package:flutter/material.dart';
import 'app.dart';

void main() {
  runApp(const MyApp());
}
\`\`\`

[FILE: pubspec.yaml]
\`\`\`yaml
name: example_app
description: A Flutter application
\`\`\`

❌ NO USES: separadores como ═══, ───, o cualquier otro formato
❌ NO USES: markdown headers como # Archivo
❌ NO USES: texto explicativo entre archivos
✅ USA SOLO: [FILE: ruta] seguido de \`\`\`tipo

ARQUITECTURA OBLIGATORIA:
- Flutter puro con StatefulWidget para estado (NO usar Riverpod ni Provider)
- GoRouter para navegación (go_router: ^13.0.0)
- Material Design 3 con useMaterial3: true
- Estructura modular: features/[domain]/screens/

PROHIBICIONES ABSOLUTAS:
❌ NUNCA uses flutter_riverpod
❌ NUNCA uses provider package
❌ NUNCA uses ChangeNotifier
❌ NUNCA uses Consumer widgets
❌ NUNCA uses ProviderScope
❌ NUNCA uses StateNotifier
❌ NUNCA uses ref.watch() o ref.read()
❌ NUNCA importes 'package:flutter_riverpod/flutter_riverpod.dart'
❌ NUNCA importes 'package:provider/provider.dart'

SOLO USA:
✅ StatefulWidget con setState() para estado
✅ Variables de instancia simples (String, bool, int)
✅ TextEditingController para formularios
✅ GlobalKey<FormState> para validación

APPTHEME CORRECTO (SIN REFERENCIAS CIRCULARES):
\`\`\`dart
class AppTheme {
  // ✅ CORRECTO: Definir colores como constantes primero
  static const Color primaryColor = Color(0xFF2196F3);
  static const Color secondaryColor = Color(0xFF03DAC6);
  
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryColor, // ✅ Usar la constante, NO _colorScheme.primary
        brightness: Brightness.light,
      ),
      // Resto de la configuración...
    );
  }
}
\`\`\`

❌ INCORRECTO (CAUSA STACK OVERFLOW):
\`\`\`dart
class AppTheme {
  static final ColorScheme _colorScheme = ColorScheme.fromSeed(
    seedColor: _colorScheme.primary, // ❌ REFERENCIA CIRCULAR
    brightness: Brightness.light,
  );
}
\`\`\`

DETECCIÓN AUTOMÁTICA DE PANTALLAS:
- Si el XML tiene múltiples elementos 'android.phone2' → CREAR NAVIGATION DRAWER AUTOMÁTICAMENTE
- RegisterScreen para textos "Register", "Your name", "Password", "Guardar"
- CreateProjectScreen para textos "Create a project", "Name", "Key", "Description", "Publish"
- SIEMPRE generar AppDrawer cuando hay 2+ pantallas detectadas

REGLAS CRÍTICAS PARA EVITAR ERRORES:
1. **AppRouter SINGLETON**: SIEMPRE usar AppRouter().router NO AppRouter.router
2. **Import paths relativos**: '../../../shared/widgets/app_drawer.dart' NO package imports
3. **Material Design 3**: colorScheme.primary NO primaryColor
4. **GoRouter moderno**: routerConfig: AppRouter().router NO routerDelegate
5. **Constructor moderno**: const Widget({super.key}) NO {Key? key}
6. **IMPORTS OBLIGATORIOS** en screens que usan AppDrawer:
   import '../../../shared/widgets/app_drawer.dart';
7. **RADIO BUTTONS**: Usar AppRadioGroup del shared/widgets para selecciones múltiples

EJEMPLO CORRECTO AppRouter:
\`\`\`dart
// [FILE: lib/app.dart]
final _appRouter = AppRouter();

MaterialApp.router(
  routerConfig: _appRouter.router, // ✅ CORRECTO
  // NO: routerConfig: AppRouter.router, // ❌ ERROR
)
\`\`\`

SCAFFOLD CON DRAWER AUTOMÁTICO:
\`\`\`dart
// IMPORTS OBLIGATORIOS:
import '../../../shared/widgets/app_drawer.dart';

Scaffold(
  backgroundColor: Theme.of(context).colorScheme.background,
  appBar: AppBar(
    title: Text('Title'),
    backgroundColor: Theme.of(context).colorScheme.surface,
    foregroundColor: Theme.of(context).colorScheme.onSurface,
    elevation: 0,
    centerTitle: true,
  ),
  drawer: const AppDrawer(), // OBLIGATORIO si múltiples pantallas
  body: SafeArea(
    child: Padding(
      padding: EdgeInsets.all(16),
      child: // Content
    ),
  ),
)
\`\`\`

RADIO BUTTONS CON AppRadioGroup:
\`\`\`dart
// IMPORTS OBLIGATORIOS:
import '../../../shared/widgets/app_widgets.dart';

// ESTADO REQUERIDO EN WIDGET:
String? selectedAccess = 'read_write';

// WIDGET COMPLETO:
AppRadioGroup<String>(
  title: 'User access',
  options: [
    RadioOption(title: 'Read and write', value: 'read_write'),
    RadioOption(title: 'Read only', value: 'read_only'),
    RadioOption(title: 'None', value: 'none'),
  ],
  groupValue: selectedAccess,
  onChanged: (value) => setState(() => selectedAccess = value),
)

// EJEMPLO COMPLETO EN CreateProjectScreen:
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    AppTitle(text: 'Project permissions'),
    SizedBox(height: 16),
    AppRadioGroup<String>(
      title: 'User access',
      options: [
        RadioOption(title: 'Read and write', value: 'read_write'),
        RadioOption(title: 'Read only', value: 'read_only'),
        RadioOption(title: 'None', value: 'none'),
      ],
      groupValue: selectedAccess,
      onChanged: (value) => setState(() => selectedAccess = value),
    ),
  ],
)
\`\`\`

NAVIGATION DRAWER CON GoRouter:
\`\`\`dart
// IMPORTS OBLIGATORIOS PARA NAVEGACIÓN:
import 'package:go_router/go_router.dart';

// AppDrawer DEBE USAR GoRouter (NO Navigator.pushNamed):
NavigationDrawer(
  backgroundColor: Theme.of(context).colorScheme.surface,
  children: [
    DrawerHeader(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primaryContainer,
      ),
      child: // Header content
    ),
    // ❌ INCORRECTO: Navigator.of(context).pushNamed('/')
    // ✅ CORRECTO: context.go() o context.push()
    ListTile(
      leading: Icon(Icons.person_add),
      title: Text('Register'),
      onTap: () => context.go('/'), // Pantalla principal
    ),
    ListTile(
      leading: Icon(Icons.create),
      title: Text('Create Project'),
      onTap: () => context.push('/create-project'), // Nueva pantalla
    ),
  ],
)

// DIFERENCIAS EN NAVEGACIÓN:
// context.go('/route')   - Reemplaza la pila de navegación
// context.push('/route') - Añade a la pila (permite regresar)
\`\`\`

FORMULARIOS REACTIVOS:
- TextFormField con borderRadius: 12
- GlobalKey<FormState> para validación
- Estados con StatefulWidget y setState()
- Loading states en botones con variables bool

ARCHIVOS OBLIGATORIOS:
[FILE: lib/main.dart] - runApp(const MyApp())
[FILE: lib/app.dart] - MaterialApp.router con AppRouter().router
[FILE: lib/core/router/app_router.dart] - Singleton pattern
[FILE: lib/core/themes/app_theme.dart] - Material Design 3
[FILE: lib/shared/widgets/app_drawer.dart] - Si múltiples pantallas
[FILE: lib/features/register/screens/register_screen.dart]
[FILE: lib/features/project/screens/create_project_screen.dart]
[FILE: pubspec.yaml] - Dependencies correctas

USAR FORMATO [FILE: ruta] para cada archivo generado`;
  }

  createUserPrompt(context: GenerationContext, screenDetection?: any): string {
    // Si HAY XML, usar flujo específico para XML
    if (context.xml) {
      return this.createXmlBasedPrompt(context, screenDetection);
    }
    
    // Si NO hay XML, usar flujo específico para prompts
    return this.createPromptBasedPrompt(context);
  }

  /**
   * Crea prompt optimizado para generación desde XML (flujo original)
   */
  private createXmlBasedPrompt(context: GenerationContext, screenDetection?: any): string {
    const xml = context.xml || '';
    const appName = context.config?.package_name || 'MockupApp';
    
    // Contar pantallas en el XML
    const phoneCount = (xml.match(/shape=mxgraph\.android\.phone2/g) || []).length;
    
    return `GENERAR APLICACIÓN FLUTTER COMPLETA DESDE XML MOCKUP

**FORMATO DE RESPUESTA OBLIGATORIO:**
Debes usar EXACTAMENTE este formato para cada archivo:

[FILE: ruta/del/archivo.dart]
\`\`\`dart
// código aquí
\`\`\`

[FILE: pubspec.yaml]
\`\`\`yaml
# código aquí
\`\`\`

❌ NO uses separadores como ═══, ───, o texto explicativo
✅ USA SOLO: [FILE: ruta] seguido de \`\`\`tipo

APLICACIÓN: ${appName}
TIPO: Flutter con Material Design 3

🔍 **ANÁLISIS CRÍTICO DEL XML:**
El XML contiene ${phoneCount} PANTALLAS MÓVILES (shape=mxgraph.android.phone2).
DEBES GENERAR UNA SCREEN DART PARA CADA PANTALLA DETECTADA.

📱 **PANTALLAS OBLIGATORIAS A GENERAR:**
${phoneCount > 0 ? Array.from({length: phoneCount}, (_, i) => `${i + 1}. lib/features/screen${i + 1}/screens/screen${i + 1}_screen.dart`).join('\n') : 'Detectar pantallas del XML'}

🚨 **INSTRUCCIONES ESPECÍFICAS PARA MÚLTIPLES PANTALLAS:**
- Si hay ${phoneCount} pantallas → DEBES generar ${phoneCount} archivos _screen.dart
- Cada pantalla debe tener su propio directorio en features/
- INCLUIR Navigation Drawer automáticamente para navegar entre pantallas
- Analizar el contenido específico de cada pantalla en el XML

${this.analyzeXmlContent(xml, screenDetection)}

${this.formatScreenDetection(screenDetection)}

${this.createStructuredInstructions(xml, screenDetection)}

GENERAR PROYECTO FLUTTER COMPLETO:
- pubspec.yaml con dependencias correctas
- lib/main.dart como punto de entrada
- lib/app.dart con MaterialApp.router
- lib/core/router/app_router.dart con GoRouter configurado para ${phoneCount} rutas
- lib/core/themes/app_theme.dart con Material Design 3
- lib/shared/widgets/app_widgets.dart con componentes reutilizables
- lib/shared/widgets/app_drawer.dart (OBLIGATORIO para ${phoneCount} pantallas)
- **${phoneCount} PANTALLAS INDIVIDUALES** en lib/features/[nombre]/screens/

⚠️ **CRÍTICO**: Debes generar exactamente ${phoneCount} archivos _screen.dart, uno por cada elemento android.phone2 en el XML.

IMPORTANTE: Cada archivo debe usar el formato [FILE: ruta] exacto sin variaciones.

XML MOCKUP A ANALIZAR (${phoneCount} PANTALLAS):
${xml}`;
  }

  /**
   * Crea prompt optimizado para generación desde descripción de texto (prompt enriquecido por IA)
   */
  private createPromptBasedPrompt(context: GenerationContext): string {
    const aiInterpretedPrompt = context.prompt || 'Aplicación móvil estándar';
    const appName = context.config?.package_name || 'GeneratedApp';

    return `GENERAR APLICACIÓN FLUTTER COMPLETA DESDE INTERPRETACIÓN GPT

**FORMATO DE RESPUESTA OBLIGATORIO:**
Debes usar EXACTAMENTE este formato para cada archivo:

[FILE: ruta/del/archivo.dart]
\`\`\`dart
// código aquí
\`\`\`

[FILE: pubspec.yaml]
\`\`\`yaml
# código aquí
\`\`\`

❌ NO uses separadores como ═══, ───, o texto explicativo
✅ USA SOLO: [FILE: ruta] seguido de \`\`\`tipo

APLICACIÓN: ${appName}

🤖 **ESPECIFICACIÓN COMPLETA DE GPT-4o:**
La IA GPT-4o ya analizó, interpretó y especificó EXACTAMENTE toda la aplicación que necesitas generar:

${aiInterpretedPrompt}

🎯 **INSTRUCCIONES CRÍTICAS:**
- Implementa EXACTAMENTE lo que GPT especificó en su análisis completo
- Genera TODAS las pantallas que GPT detalló
- Incluye TODAS las funcionalidades que GPT mencionó
- Respeta TODA la arquitectura que GPT definió
- Sigue TODAS las especificaciones técnicas que GPT proporcionó

ARQUITECTURA TÉCNICA OBLIGATORIA:
- Flutter puro con StatefulWidget + setState() (NO Riverpod, NO Provider)
- GoRouter para navegación (go_router: ^13.0.0)
- Material Design 3 con useMaterial3: true
- Estructura modular: lib/features/[domain]/screens/

GENERAR PROYECTO FLUTTER COMPLETO:
- pubspec.yaml con dependencias correctas
- lib/main.dart como punto de entrada
- lib/app.dart con MaterialApp.router
- lib/core/router/app_router.dart con GoRouter configurado
- lib/core/themes/app_theme.dart con Material Design 3
- lib/shared/widgets/app_widgets.dart con componentes reutilizables
- **TODAS LAS PANTALLAS** según especificación GPT
- Models y servicios según lo que especificó GPT

PROHIBICIONES ESTRICTAS:
❌ NO usar flutter_riverpod, provider, ChangeNotifier
❌ NO usar Consumer widgets, ProviderScope, StateNotifier
❌ NO usar ref.watch() o ref.read()
❌ NO crear referencias circulares en AppTheme

✅ SOLO USAR:
✅ StatefulWidget con setState() para TODOS los estados
✅ Variables de instancia simples (String, bool, int)
✅ TextEditingController para formularios
✅ GlobalKey<FormState> para validación
✅ AppRouter().router (NO AppRouter.router)

IMPORTANTE: Cada archivo debe usar el formato [FILE: ruta] exacto sin variaciones.

ESPECIFICACIÓN GPT A IMPLEMENTAR:
${aiInterpretedPrompt}`;
  }

  private analyzeXmlContent(xml: string, screenDetection?: any): string {
    try {
      const analysis: string[] = [];
      
      // USAR LAS NUEVAS SECCIONES DE PANTALLAS SI ESTÁN DISPONIBLES
      if (screenDetection?.screenSections && screenDetection.screenSections.length > 0) {
        analysis.push(`🔍 SECCIONES DE PANTALLAS DETECTADAS: ${screenDetection.screenSections.length}`);
        
        screenDetection.screenSections.forEach((section, index) => {
          analysis.push(`\n📱 PANTALLA ${index + 1}: ${section.title}`);
          analysis.push(`   ${section.description}`);
          
          if (section.texts.length > 0) {
            analysis.push(`   📝 Textos: ${section.texts.slice(0, 5).join(', ')}${section.texts.length > 5 ? '...' : ''}`);
          }
          
          if (section.fields.length > 0) {
            analysis.push(`   🔤 Campos: ${section.fields.join(', ')}`);
          }
          
          if (section.buttons.length > 0) {
            analysis.push(`   🔘 Botones: ${section.buttons.join(', ')}`);
          }
          
          if (section.radioGroups.length > 0) {
            section.radioGroups.forEach(group => {
              analysis.push(`   ⚪ ${group.title}: ${group.options.map(opt => opt.text).join(', ')}`);
            });
          }
          
          if (section.colors.length > 0) {
            analysis.push(`   🎨 Colores: ${section.colors.slice(0, 3).join(', ')}`);
          }
        });
        
        // NAVEGACIÓN BASADA EN SECCIONES
        if (screenDetection.screenSections.length > 1) {
          analysis.push(`\n🧭 DRAWER AUTOMÁTICO - Rutas:`);
          screenDetection.screenSections.forEach((section, index) => {
            const route = index === 0 ? '/' : `/${section.title.toLowerCase().replace(/screen$/, '').replace(/\s+/g, '-')}`;
            analysis.push(`   - ${route} → ${section.title}`);
          });
        }
        
      } else {
        // FALLBACK: ANÁLISIS TRADICIONAL
        const phoneMatches = xml.match(/shape=["']mxgraph\.android\.phone2["']/g);
        const phoneCount = phoneMatches ? phoneMatches.length : 0;
        
        if (phoneCount > 1) {
          analysis.push(`🔍 MÚLTIPLES PANTALLAS DETECTADAS: ${phoneCount} pantallas → CREAR DRAWER`);
        } else if (phoneCount === 1) {
          analysis.push(`📱 PANTALLA ÚNICA detectada → Sin drawer`);
        }
        
        // Buscar elementos de texto específicos
        const textMatches = xml.match(/value="([^"]*)"[^>]*>/g);
        if (textMatches) {
          const texts = textMatches
            .map(match => {
              const result = match.match(/value="([^"]*)"/);
              return result ? result[1] : null;
            })
            .filter((text): text is string => text !== null && text.trim().length > 0 && text !== 'Text' && text !== '')
            .slice(0, 15);
          
          if (texts.length > 0) {
            analysis.push(`TEXTOS DEL MOCKUP: ${texts.join(', ')}`);
            
            // ANÁLISIS POR PANTALLA
            const screenTitles: string[] = [];
            const formFields: string[] = [];
            const buttons: string[] = [];
            
            texts.forEach(text => {
              const lowerText = text.toLowerCase();
              
              if (lowerText.includes('register') || lowerText.includes('create a project') || lowerText.includes('dashboard')) {
                screenTitles.push(text);
                analysis.push(`📋 PANTALLA: "${text}"`);
              } else if (lowerText.includes('name') || lowerText.includes('password') || 
                        lowerText.includes('key') || lowerText.includes('description')) {
                formFields.push(text);
                analysis.push(`📝 Campo: ${text}`);
              } else if (lowerText.includes('guardar') || lowerText.includes('publish') || 
                        lowerText.includes('cancel') || lowerText.includes('primary')) {
                buttons.push(text);
                analysis.push(`🔘 Botón: ${text}`);
              }
            });
            
            if (screenTitles.length > 0) {
              analysis.push(`\n🎯 PANTALLAS A GENERAR: ${screenTitles.join(' + ')}`);
            }
          }
        }
        
        // Buscar colores
        const colorMatches = xml.match(/fillColor=([#\w]+)/g);
        if (colorMatches) {
          const colors = [...new Set(colorMatches.map(match => match.split('=')[1]))].slice(0, 3);
          analysis.push(`🎨 COLORES: ${colors.join(', ')}`);
        }
        
        // DETECTAR RADIO BUTTONS
        const radioButtonMatches = xml.match(/shape=["']ellipse["'][^>]*strokeColor/g);
        if (radioButtonMatches && radioButtonMatches.length > 0) {
          analysis.push(`🔘 Radio buttons detectados: ${radioButtonMatches.length}`);
          
          const radioTexts = xml.match(/Read and write|Read only|None/g);
          if (radioTexts) {
            analysis.push(`📋 Opciones: ${radioTexts.join(', ')}`);
          }
        }

        // NAVEGACIÓN REQUERIDA
        if (phoneCount > 1) {
          analysis.push(`\n🧭 DRAWER OBLIGATORIO para ${phoneCount} pantallas`);
        }
      }
      
      return analysis.length > 0 ? analysis.join('\n') : 'No se encontraron elementos específicos.';
    } catch (error) {
      this.logger.warn('Error analizando XML:', error);
      return 'Error analizando el mockup.';
    }
  }

  private formatScreenDetection(screenDetection: any): string {
    if (!screenDetection) return '';
    
    const info: string[] = [];
    
    if (screenDetection.shouldCreateDrawer) {
      info.push('🗂️ DRAWER AUTOMÁTICO ACTIVADO');
    }
    
    // MOSTRAR SECCIONES DETALLADAS SI ESTÁN DISPONIBLES
    if (screenDetection.screenSections?.length > 0) {
      info.push(`📱 SECCIONES DETECTADAS: ${screenDetection.screenSections.length}`);
      
      screenDetection.screenSections.forEach((section: any, index: number) => {
        info.push(`   ${index + 1}. ${section.title} - ${section.description}`);
        
        if (section.fields?.length > 0) {
          info.push(`      📝 Campos: ${section.fields.join(', ')}`);
        }
        
        if (section.buttons?.length > 0) {
          info.push(`      🔘 Botones: ${section.buttons.join(', ')}`);
        }
        
        if (section.radioGroups?.length > 0) {
          section.radioGroups.forEach((group: any) => {
            info.push(`      ⚪ ${group.title}: ${group.options.map((opt: any) => opt.text).join(', ')}`);
          });
        }
      });
    } else {
      // FALLBACK: FORMATO TRADICIONAL
      if (screenDetection.detectedScreens?.length > 0) {
        info.push(`📱 Pantallas: ${screenDetection.detectedScreens.join(', ')}`);
      }
      
      if (screenDetection.detectedFields?.length > 0) {
        info.push(`📝 Campos: ${screenDetection.detectedFields.join(', ')}`);
      }
      
      if (screenDetection.detectedButtons?.length > 0) {
        info.push(`🔘 Botones: ${screenDetection.detectedButtons.join(', ')}`);
      }
      
      if (screenDetection.detectedRadioGroups?.length > 0) {
        const radioInfo = screenDetection.detectedRadioGroups
          .map((group: any) => `${group.title}: ${group.options.map((opt: any) => opt.text).join(', ')}`)
          .join(' | ');
        info.push(`🔘 Radio Groups: ${radioInfo}`);
      }
    }
    
    return info.join('\n');
  }

  private createStructuredInstructions(xml: string, screenDetection?: any): string {
    const instructions: string[] = [];
    
    // Analizar pantallas individualmente
    const phoneMatches = xml.match(/shape=mxgraph\.android\.phone2/g) || [];
    const phoneCount = phoneMatches.length;
    
    instructions.push('📋 INSTRUCCIONES ESPECÍFICAS DE GENERACIÓN:');
    
    if (phoneCount > 1) {
      instructions.push(`\n🎯 DETECTADAS ${phoneCount} PANTALLAS - GENERAR TODAS:`);
      
      // Analizar contenido alrededor de cada pantalla
      const phoneElements = this.extractIndividualScreenContent(xml);
      
      phoneElements.forEach((screen, index) => {
        instructions.push(`\n📱 PANTALLA ${index + 1}:`);
        instructions.push(`   [FILE: lib/features/screen${index + 1}/screens/screen${index + 1}_screen.dart]`);
        
        if (screen.texts.length > 0) {
          instructions.push(`   📝 Textos a incluir: ${screen.texts.slice(0, 5).join(', ')}`);
        }
        
        if (screen.fields.length > 0) {
          instructions.push(`   🔲 Campos de entrada: ${screen.fields.join(', ')}`);
        }
        
        if (screen.buttons.length > 0) {
          instructions.push(`   🔘 Botones: ${screen.buttons.join(', ')}`);
        }
        
        if (screen.hasTable) {
          instructions.push(`   📊 Incluir tabla con datos`);
        }
        
        if (screen.hasRadioButtons) {
          instructions.push(`   ⚪ Incluir radio buttons`);
        }
        
        // Detectar tipo de pantalla por contenido
        if (screen.texts.some(t => t.includes('Create a project'))) {
          instructions.push(`   🎯 Tipo: Formulario de creación de proyecto`);
          instructions.push(`   🚀 Incluir: AppRadioGroup para permisos`);
        } else if (screen.texts.some(t => t.includes('Dashboard') || t.includes('Dasboard'))) {
          instructions.push(`   🎯 Tipo: Pantalla dashboard principal`);
        } else if (screen.hasTable) {
          instructions.push(`   🎯 Tipo: Pantalla de datos con tabla`);
        } else {
          instructions.push(`   🎯 Tipo: Pantalla con contenido específico`);
        }
      });
      
      instructions.push(`\n🗂️ NAVIGATION DRAWER OBLIGATORIO:`);
      instructions.push(`   [FILE: lib/shared/widgets/app_drawer.dart]`);
      instructions.push(`   - Incluir navegación a las ${phoneCount} pantallas`);
      instructions.push(`   - Usar context.go() y context.push() con GoRouter`);
      
    } else if (phoneCount === 1) {
      instructions.push('\n🎯 PANTALLA ÚNICA DETECTADA:');
      instructions.push('   Generar aplicación con una pantalla principal');
    }
    
    // Instrucciones para pantallas específicas (compatibilidad con código existente)
    if (screenDetection?.detectedScreens?.length > 0) {
      instructions.push('\\n🎯 PANTALLAS ADICIONALES DETECTADAS:');
      screenDetection.detectedScreens.forEach((screen: string, index: number) => {
        if (screen.toLowerCase().includes('register')) {
          instructions.push(`   ${index + 1}. RegisterScreen:`);
          instructions.push(`      - Título: "${screen}"`);
          instructions.push(`      - Campo: Your name (TextFormField con validación)`);
          instructions.push(`      - Campo: Password (TextFormField obscureText: true)`);
          instructions.push(`      - Botón: Guardar (ElevatedButton)`);
          instructions.push(`      - Import: '../../../shared/widgets/app_drawer.dart'`);
        } else if (screen.toLowerCase().includes('create a project')) {
          instructions.push(`   ${index + 1}. CreateProjectScreen:`);
          instructions.push(`      - Título: "${screen}"`);
          instructions.push(`      - Descripción: "Projects are where your repositories live..."`);
          instructions.push(`      - Campo: Name (TextFormField)`);
          instructions.push(`      - Campo: Key* (TextFormField con asterisco rojo)`);
          instructions.push(`      - Campo: Description (TextFormField multiline)`);
          instructions.push(`      - Sección: Project permissions`);
          instructions.push(`      - RadioGroup: User access con opciones:`);
          instructions.push(`        * Read and write (seleccionado por defecto)`);
          instructions.push(`        * Read only`);
          instructions.push(`        * None`);
          instructions.push(`      - Botón: Publish (ElevatedButton)`);
          instructions.push(`      - Botón: Cancel (TextButton)`);
          instructions.push(`      - Import: '../../../shared/widgets/app_drawer.dart'`);
          instructions.push(`      - Import: '../../../shared/widgets/app_widgets.dart'`);
          instructions.push(`      - AppDrawer DEBE usar: import 'package:go_router/go_router.dart'`);
          instructions.push(`      - Navigation: context.go('/') y context.push('/create-project')`);
          instructions.push(`      - PROHIBIDO: Navigator.pushNamed() en AppDrawer`);
        }
      });
    }
    
    // Instrucciones específicas para radio buttons
    if (screenDetection?.detectedRadioGroups?.length > 0) {
      instructions.push('\\n🔘 RADIO BUTTONS OBLIGATORIOS:');
      screenDetection.detectedRadioGroups.forEach((group: any) => {
        instructions.push(`   Generar AppRadioGroup para "${group.title}":`);
        instructions.push('   ```dart');
        instructions.push('   String? selectedAccess = "read_write"; // Estado');
        instructions.push('   ');
        instructions.push('   AppRadioGroup<String>(');
        instructions.push(`     title: "${group.title}",`);
        instructions.push('     options: [');
        group.options.forEach((option: any) => {
          const value = option.text.toLowerCase().replace(/\\s+/g, '_');
          instructions.push(`       RadioOption(title: "${option.text}", value: "${value}"),`);
        });
        instructions.push('     ],');
        instructions.push('     groupValue: selectedAccess,');
        instructions.push('     onChanged: (value) => setState(() => selectedAccess = value),');
        instructions.push('   )');
        instructions.push('   ```');
      });
    }
    
    // Instrucciones para textos específicos
    const allTexts = screenDetection?.allTexts || [];
    const importantTexts = allTexts.filter((text: string) => 
      text.includes('Projects are where') || 
      text.includes('Project permissions') ||
      text.includes('BETA') ||
      text.length > 20
    );
    
    if (importantTexts.length > 0) {
      instructions.push('\\n📝 TEXTOS ESPECÍFICOS A INCLUIR:');
      importantTexts.forEach((text: string) => {
        if (text.includes('Projects are where')) {
          instructions.push(`   - Descripción: "${text.replace(/&#xa;/g, '\\\\n')}"`);
        } else if (text.includes('Project permissions')) {
          instructions.push(`   - Sección título: "${text}"`);
        } else if (text === 'BETA') {
          instructions.push('   - Badge: "BETA" (Container con color azul)');
        }
      });
    }
    
    // Instrucciones para colores
    const colors = this.extractColorsFromXml(xml);
    if (colors.length > 0) {
      instructions.push('\\n🎨 COLORES DEL MOCKUP:');
      instructions.push(`   Usar en AppTheme: ${colors.join(', ')}`);
    }
    
    return instructions.join('\\n');
  }

  /**
   * Extrae contenido específico de cada pantalla individual
   */
  private extractIndividualScreenContent(xml: string): Array<{
    texts: string[];
    fields: string[];
    buttons: string[];
    hasTable: boolean;
    hasRadioButtons: boolean;
  }> {
    const screens: Array<{
      texts: string[];
      fields: string[];
      buttons: string[];
      hasTable: boolean;
      hasRadioButtons: boolean;
    }> = [];
    
    // Dividir el XML por grupos de elementos cerca de cada teléfono
    const phonePattern = /verticalLabelPosition=bottom.*?shape=mxgraph\.android\.phone2/g;
    const phoneMatches = [...xml.matchAll(phonePattern)];
    
    phoneMatches.forEach((match, index) => {
      const startPos = match.index || 0;
      const endPos = phoneMatches[index + 1]?.index || xml.length;
      const screenXml = xml.substring(startPos, endPos);
      
      // Extraer contenido específico de esta pantalla
      const texts = this.extractTextsFromSection(screenXml);
      const fields = this.extractFieldsFromSection(screenXml);  
      const buttons = this.extractButtonsFromSection(screenXml);
      const hasTable = screenXml.includes('shape=table');
      const hasRadioButtons = screenXml.includes('shape=ellipse');
      
      screens.push({
        texts,
        fields,
        buttons,
        hasTable,
        hasRadioButtons
      });
    });
    
    return screens;
  }

  private extractTextsFromSection(section: string): string[] {
    const texts: string[] = [];
    const textMatches = section.match(/value="([^"]+)"/g) || [];
    textMatches.forEach(match => {
      const text = match.replace('value="', '').replace('"', '');
      if (text.length > 1 && !text.includes('mxgraph')) {
        texts.push(text);
      }
    });
    return texts;
  }

  private extractFieldsFromSection(section: string): string[] {
    const fields: string[] = [];
    const fieldMatches = section.match(/name="([^"]+)"/g) || [];
    fieldMatches.forEach(match => {
      const field = match.replace('name="', '').replace('"', '');
      if (field.length > 1 && !field.includes('mxgraph')) {
        fields.push(field);
      }
    });
    return fields;
  }

  private extractButtonsFromSection(section: string): string[] {
    const buttons: string[] = [];
    const buttonMatches = section.match(/shape=["']ellipse["'][^>]*strokeColor/g) || [];
    buttonMatches.forEach(match => {
      const button = match.replace('shape="', '').replace('"', '');
      if (button.length > 1 && !button.includes('mxgraph')) {
        buttons.push(button);
      }
    });
    return buttons;
  }

  private extractColorsFromXml(xml: string): string[] {
    const colorMatches = xml.match(/#[0-9A-Fa-f]{6}/g);
    if (colorMatches) {
      return [...new Set(colorMatches)].slice(0, 3);
    }
    return [];
  }
} 