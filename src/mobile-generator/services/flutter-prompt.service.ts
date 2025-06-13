import { Injectable, Logger } from '@nestjs/common';
import { GenerationContext } from '../interfaces/generator.interface';

@Injectable()
export class FlutterPromptService {
  private readonly logger = new Logger(FlutterPromptService.name);

  createSystemPrompt(): string {
    return `Eres un experto desarrollador Flutter que genera aplicaciones modernas desde mockups XML de Draw.io.

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
    const structuredInstructions = this.createStructuredInstructions(context.xml!, screenDetection);
    
    return `Genera una aplicación Flutter completa desde mockup XML:

ANÁLISIS DEL MOCKUP:
${this.analyzeXmlContent(context.xml!, screenDetection)}

${structuredInstructions}

CONTEXTO ADICIONAL:
- Prompt del usuario: ${context.prompt || 'No especificado'}
- Configuración: ${JSON.stringify(context.config || {})}

REQUERIMIENTOS ESPECÍFICOS PARA XML:
1. **ANALIZA EL XML** y extrae elementos específicos (botones, inputs, radio buttons, textos)
2. **DETECTA MÚLTIPLES PANTALLAS** por número de elementos android.phone2
3. **GENERA AppDrawer AUTOMÁTICAMENTE** si hay múltiples pantallas
4. **USA COLORES** del mockup en el tema de la aplicación
5. **IMPLEMENTA NAVEGACIÓN** entre pantallas con GoRouter
6. **CORRIGE AppRouter**: usar AppRouter().router NO AppRouter.router
7. **ELIMINA flutter_secure_storage** del pubspec.yaml
8. **SOLO genera pantallas** que están en el mockup
9. **INCLUYE IMPORTS OBLIGATORIOS** para AppDrawer y app_widgets
10. **GENERA RADIO BUTTONS** para elementos ellipse con opciones específicas
11. **INCLUYE TODOS LOS TEXTOS** del mockup en las pantallas correspondientes

ELEMENTOS DETECTADOS:
${screenDetection ? this.formatScreenDetection(screenDetection) : ''}

XML COMPLETO PARA REFERENCIA:
\`\`\`xml
${context.xml!.substring(0, 2000) + (context.xml!.length > 2000 ? '...[truncated]' : '')}
\`\`\`

VALIDACIÓN REQUERIDA:
- ✅ Generar EXACTAMENTE las pantallas del XML
- ✅ TODOS los textos del mockup deben aparecer en las pantallas
- ✅ Colores del mockup aplicados en AppTheme
- ✅ Navigation drawer para múltiples pantallas
- ✅ Imports correctos en todas las pantallas

Genera MÍNIMO 6 archivos de código Flutter funcional con imports relativos correctos.`;
  }

  /**
   * Crea prompt optimizado para generación desde descripción de texto (prompt enriquecido)
   */
  private createPromptBasedPrompt(context: GenerationContext): string {
    const enrichedPrompt = context.prompt || 'Aplicación móvil estándar';
    const requestedFeatures = this.extractRequestedFeatures(enrichedPrompt);
    const requiredScreens = this.extractExactScreensRequested(enrichedPrompt);
    const shouldIncludeDrawer = requiredScreens.length > 2;
    const domainContext = this.detectDomainContext(enrichedPrompt);

    return `Genera una aplicación Flutter EXACTAMENTE como se solicita:

DESCRIPCIÓN ORIGINAL DEL USUARIO:
${enrichedPrompt}

CONTEXTO ESPECÍFICO DETECTADO:
${domainContext}

FUNCIONALIDADES ESPECÍFICAMENTE SOLICITADAS:
${requestedFeatures}

PANTALLAS QUE DEBES GENERAR (NO MÁS, NO MENOS):
${requiredScreens.join('\n')}

${shouldIncludeDrawer ? '✅ INCLUIR: Navigation drawer con las pantallas solicitadas' : '❌ NO INCLUIR: Navigation drawer (pocas pantallas)'}

CONFIGURACIÓN ADICIONAL:
${JSON.stringify(context.config || {}, null, 2)}

REQUERIMIENTOS CRÍTICOS - SOLO LO SOLICITADO:
1. **GENERA ÚNICAMENTE** las pantallas específicamente mencionadas por el usuario
2. **NO AGREGUES** pantallas adicionales que no fueron solicitadas
3. **IMPLEMENTA SOLO** las funcionalidades explícitamente mencionadas
4. **USA ARQUITECTURA LIMPIA**: Flutter + GoRouter + Material Design 3
5. **ELIMINA flutter_secure_storage** del pubspec.yaml
6. **IMPORTS CORRECTOS** en todos los archivos
7. **AppRouter().router** (NO AppRouter.router)
8. **PROHIBIDO USAR PROVIDERS**: NO usar Riverpod, Provider, ChangeNotifier, Consumer
9. **SOLO StatefulWidget**: Para estado usar setState() únicamente

ARQUITECTURA TÉCNICA MÍNIMA:
- Flutter puro con StatefulWidget para estado (NO usar Riverpod ni Provider)
- GoRouter para navegación (go_router: ^13.0.0)
- Material Design 3 con useMaterial3: true
- Estructura simple: features/auth/screens/ para auth, etc.
- Solo las pantallas solicitadas por el usuario
- Navigation drawer SOLO si hay más de 2 pantallas principales
- Formularios básicos con validación simple usando StatefulWidget
- Estados simples (loading, error, success) con setState() donde sea necesario

PROHIBICIONES ESTRICTAS:
❌ NO usar flutter_riverpod
❌ NO usar provider package
❌ NO usar ChangeNotifier
❌ NO usar Consumer widgets
❌ NO usar ProviderScope
❌ NO usar StateNotifier
❌ NO usar AsyncValue
❌ NO usar ref.watch() o ref.read()
❌ NO importar 'package:flutter_riverpod/flutter_riverpod.dart'
❌ NO importar 'package:provider/provider.dart'
❌ NO crear referencias circulares en AppTheme
❌ NO usar variables que se referencien a sí mismas

IMPLEMENTACIÓN ESPECÍFICA REQUERIDA:
✅ SOLO las pantallas específicamente solicitadas
✅ SOLO las funcionalidades específicamente mencionadas
✅ Navigation drawer SOLO si hay más de 2 pantallas principales
✅ Formularios básicos apropiados para las pantallas solicitadas
✅ Navegación entre las pantallas solicitadas con GoRouter
✅ Imports correctos y código limpio
✅ AppRouter().router (NO AppRouter.router)
✅ StatefulWidget con setState() para TODOS los estados
✅ Variables de instancia simples (String, bool, int) para datos
✅ Formularios con GlobalKey<FormState> y TextEditingController

VALIDACIÓN CRÍTICA:
- ¿Generé SOLO las pantallas que el usuario pidió?
- ¿No agregué pantallas adicionales innecesarias?
- ¿El drawer incluye SOLO las pantallas solicitadas?
- ¿Los formularios corresponden a las funcionalidades pedidas?
- ¿NO usé ningún Provider, Riverpod o ChangeNotifier?
- ¿Todas las pantallas usan StatefulWidget con setState()?
- ¿No hay imports de flutter_riverpod o provider?
- ¿AppTheme NO tiene referencias circulares?
- ¿Los colores están definidos como constantes antes de usarse?
- ¿ColorScheme.fromSeed usa constantes, NO variables que se referencien a sí mismas?

Genera EXACTAMENTE los archivos necesarios para implementar SOLO lo que el usuario solicitó - ni más, ni menos.`;
  }

  private analyzeXmlContent(xml: string, screenDetection?: any): string {
    try {
      const analysis: string[] = [];
      
      // DETECTAR MÚLTIPLES PANTALLAS
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
            
            if (lowerText.includes('register') || lowerText.includes('create a project')) {
              screenTitles.push(text);
              analysis.push(`📋 PANTALLA: "${text}"`);
            } else if (lowerText.includes('name') || lowerText.includes('password') || 
                      lowerText.includes('key') || lowerText.includes('description')) {
              formFields.push(text);
              analysis.push(`📝 Campo: ${text}`);
            } else if (lowerText.includes('guardar') || lowerText.includes('publish') || 
                      lowerText.includes('cancel')) {
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
        analysis.push(`📍 Rutas: /, /create-project`);
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
    
    return info.join('\n');
  }

  private createStructuredInstructions(xml: string, screenDetection?: any): string {
    const instructions: string[] = [];
    
    instructions.push('📋 INSTRUCCIONES ESPECÍFICAS DE GENERACIÓN:');
    
    // Instrucciones para pantallas
    if (screenDetection?.detectedScreens?.length > 0) {
      instructions.push('\\n🎯 PANTALLAS A GENERAR:');
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

  private extractColorsFromXml(xml: string): string[] {
    const colorMatches = xml.match(/#[0-9A-Fa-f]{6}/g);
    if (colorMatches) {
      return [...new Set(colorMatches)].slice(0, 3);
    }
    return [];
  }

  /**
   * Analiza el dominio específico de la aplicación desde el prompt enriquecido
   */
  private analyzePromptDomain(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    const domains = [
      { keywords: ['gimnasio', 'fitness', 'entrenamiento', 'ejercicio', 'rutina'], name: 'FITNESS & GYM', icon: '💪' },
      { keywords: ['delivery', 'comida', 'restaurante', 'pedido', 'entrega'], name: 'FOOD DELIVERY', icon: '🍔' },
      { keywords: ['contable', 'financiero', 'dinero', 'transaccion', 'factura'], name: 'FINANZAS', icon: '💰' },
      { keywords: ['educativo', 'escolar', 'estudiante', 'curso', 'aprendizaje'], name: 'EDUCACIÓN', icon: '📚' },
      { keywords: ['medico', 'salud', 'hospital', 'cita', 'paciente'], name: 'SALUD', icon: '🏥' },
      { keywords: ['tienda', 'ecommerce', 'producto', 'venta', 'carrito'], name: 'E-COMMERCE', icon: '🛒' },
      { keywords: ['social', 'chat', 'mensaje', 'amigo', 'red'], name: 'SOCIAL', icon: '👥' }
    ];

    for (const domain of domains) {
      if (domain.keywords.some(keyword => lowerPrompt.includes(keyword))) {
        return `${domain.icon} DOMINIO DETECTADO: ${domain.name}`;
      }
    }
    return '🔧 DOMINIO: APLICACIÓN GENERAL';
  }

  /**
   * Extrae funcionalidades específicas del prompt enriquecido
   */
  private extractFunctionalities(prompt: string): string {
    const functionalities: string[] = [];
    
    // Buscar secciones de funcionalidades
    const baseFunctionalitiesMatch = prompt.match(/FUNCIONALIDADES BASE[^:]*:([\s\S]*?)(?=FUNCIONALIDADES ESPECÍFICAS|PANTALLAS|$)/i);
    const specificFunctionalitiesMatch = prompt.match(/FUNCIONALIDADES ESPECÍFICAS[^:]*:([\s\S]*?)(?=PANTALLAS|$)/i);
    
    if (baseFunctionalitiesMatch) {
      const baseItems = baseFunctionalitiesMatch[1]
        .split('-')
        .map(item => item.trim())
        .filter(item => item.length > 10)
        .slice(0, 8);
      
      if (baseItems.length > 0) {
        functionalities.push('📋 FUNCIONALIDADES BASE:');
        baseItems.forEach(item => functionalities.push(`   • ${item}`));
      }
    }
    
    if (specificFunctionalitiesMatch) {
      const specificItems = specificFunctionalitiesMatch[1]
        .split('-')
        .map(item => item.trim())
        .filter(item => item.length > 10)
        .slice(0, 8);
      
      if (specificItems.length > 0) {
        functionalities.push('🎯 FUNCIONALIDADES ESPECÍFICAS:');
        specificItems.forEach(item => functionalities.push(`   • ${item}`));
      }
    }
    
    return functionalities.length > 0 ? functionalities.join('\n') : 'Funcionalidades básicas de aplicación móvil';
  }

  /**
   * Extrae EXACTAMENTE las funcionalidades solicitadas por el usuario
   */
  private extractRequestedFeatures(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    const features: string[] = [];
    
    // Detectar funcionalidades específicas mencionadas
    if (lowerPrompt.includes('login') || lowerPrompt.includes('iniciar sesion') || lowerPrompt.includes('autenticacion')) {
      features.push('🔐 Funcionalidad de Login/Autenticación');
    }
    
    if (lowerPrompt.includes('register') || lowerPrompt.includes('registro') || lowerPrompt.includes('crear cuenta')) {
      features.push('📝 Funcionalidad de Registro de usuarios');
    }
    
    if (lowerPrompt.includes('home') || lowerPrompt.includes('dashboard') || lowerPrompt.includes('panel') || lowerPrompt.includes('inicio')) {
      features.push('🏠 Pantalla principal/Home con datos específicos');
    }
    
    if (lowerPrompt.includes('perfil') || lowerPrompt.includes('profile') || lowerPrompt.includes('cuenta')) {
      features.push('👤 Gestión de perfil de usuario');
    }
    
    if (lowerPrompt.includes('configuracion') || lowerPrompt.includes('settings') || lowerPrompt.includes('ajustes')) {
      features.push('⚙️ Configuraciones de la aplicación');
    }
    
    // Detectar funcionalidades específicas de gym/fitness
    if (lowerPrompt.includes('gym') || lowerPrompt.includes('gimnasio') || lowerPrompt.includes('fitness')) {
      features.push('💪 Aplicación específica de GYM/FITNESS');
      
      if (lowerPrompt.includes('rutina') || lowerPrompt.includes('ejercicio') || lowerPrompt.includes('workout')) {
        features.push('🏋️ Gestión de rutinas de ejercicio');
      }
      if (lowerPrompt.includes('progreso') || lowerPrompt.includes('estadistica') || lowerPrompt.includes('progress')) {
        features.push('📊 Seguimiento de progreso y estadísticas');
      }
      if (lowerPrompt.includes('muscle') || lowerPrompt.includes('musculo') || lowerPrompt.includes('peso')) {
        features.push('💪 Registro de pesos y grupos musculares');
      }
    }
    
    // Si no se detectan funcionalidades específicas, usar el prompt completo
    if (features.length === 0) {
      features.push(`🎯 Funcionalidad solicitada: ${prompt.substring(0, 100)}...`);
    }
    
    return features.join('\n');
  }

  /**
   * Extrae EXACTAMENTE las pantallas solicitadas por el usuario
   */
  private extractExactScreensRequested(prompt: string): string[] {
    const lowerPrompt = prompt.toLowerCase();
    const screens: string[] = [];
    
    // Detectar pantallas específicas mencionadas
    if (lowerPrompt.includes('login') || lowerPrompt.includes('iniciar sesion')) {
      screens.push('📱 LoginScreen - Pantalla de inicio de sesión');
    }
    
    if (lowerPrompt.includes('register') || lowerPrompt.includes('registro')) {
      screens.push('📱 RegisterScreen - Pantalla de registro');
    }
    
    // Detectar variantes de pantalla principal/home
    if (lowerPrompt.includes('home') || lowerPrompt.includes('inicio') || 
        lowerPrompt.includes('dashboard') || lowerPrompt.includes('panel') ||
        lowerPrompt.includes('principal')) {
      screens.push('📱 HomeScreen - Pantalla principal');
    }
    
    if (lowerPrompt.includes('perfil') || lowerPrompt.includes('profile')) {
      screens.push('📱 ProfileScreen - Pantalla de perfil');
    }
    
    if (lowerPrompt.includes('configuracion') || lowerPrompt.includes('settings') || lowerPrompt.includes('ajustes')) {
      screens.push('📱 SettingsScreen - Pantalla de configuraciones');
    }
    
    // Detectar pantallas específicas de gym/fitness
    if (lowerPrompt.includes('gym') || lowerPrompt.includes('gimnasio') || lowerPrompt.includes('fitness')) {
      if (lowerPrompt.includes('rutina') || lowerPrompt.includes('ejercicio') || lowerPrompt.includes('workout')) {
        screens.push('📱 WorkoutScreen - Pantalla de rutinas de ejercicio');
      }
      if (lowerPrompt.includes('progreso') || lowerPrompt.includes('estadistica') || lowerPrompt.includes('progress')) {
        screens.push('📱 ProgressScreen - Pantalla de progreso y estadísticas');
      }
    }
    
    // Si no se detectan pantallas específicas, usar pantallas básicas
    if (screens.length === 0) {
      screens.push('📱 HomeScreen - Pantalla principal');
    }
    
    return screens;
  }

  /**
   * Extrae pantallas requeridas del prompt enriquecido (método legacy)
   */
  private extractRequiredScreens(prompt: string): string {
    const screens: string[] = [];
    
    // Buscar sección de pantallas
    const screensMatch = prompt.match(/PANTALLAS[^:]*:([\s\S]*?)(?=IMPORTANTE|Este prompt|$)/i);
    
    if (screensMatch) {
      const screenItems = screensMatch[1]
        .split('-')
        .map(item => item.trim())
        .filter(item => item.length > 5 && item.toLowerCase().includes('pantalla'))
        .slice(0, 12);
      
      if (screenItems.length > 0) {
        screens.push('📱 PANTALLAS ESPECÍFICAS A IMPLEMENTAR:');
        screenItems.forEach((item, index) => {
          const cleanItem = item.replace(/^pantalla\s+de\s*/i, '').trim();
          screens.push(`   ${index + 1}. ${cleanItem}`);
        });
        
        screens.push('\n🗂️ NAVIGATION DRAWER DEBE INCLUIR TODAS ESTAS PANTALLAS');
      }
    }
    
    return screens.length > 0 ? screens.join('\n') : 'Pantallas básicas: Login, Dashboard, Perfil, Configuraciones';
  }

  /**
   * Detecta el contexto específico del dominio para proporcionar datos relevantes
   */
  private detectDomainContext(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('gym') || lowerPrompt.includes('gimnasio') || lowerPrompt.includes('fitness')) {
      return `💪 APLICACIÓN DE GYM/FITNESS DETECTADA:
- HomeScreen debe mostrar: rutinas del día, progreso reciente, próximos entrenamientos
- Datos específicos: ejercicios, series, repeticiones, pesos, músculos trabajados
- UI específica: gráficos de progreso, calendarios de entrenamientos, listas de ejercicios
- Colores sugeridos: azules/verdes para fitness, rojos para esfuerzo, grises para descanso
- Iconos específicos: fitness_center, timeline, insights, schedule, person`;
    }
    
    if (lowerPrompt.includes('delivery') || lowerPrompt.includes('comida') || lowerPrompt.includes('restaurante')) {
      return `🍔 APLICACIÓN DE DELIVERY DETECTADA:
- HomeScreen debe mostrar: restaurantes cercanos, pedidos recientes, ofertas especiales
- Datos específicos: menús, precios, tiempos de entrega, calificaciones
- UI específica: cards de restaurantes, carrito de compras, mapa de ubicaciones
- Colores sugeridos: rojos/naranjas para comida, verdes para disponible`;
    }
    
    if (lowerPrompt.includes('finanza') || lowerPrompt.includes('banco') || lowerPrompt.includes('dinero')) {
      return `💰 APLICACIÓN FINANCIERA DETECTADA:
- HomeScreen debe mostrar: balance actual, transacciones recientes, gastos del mes
- Datos específicos: montos, categorías, fechas, gráficos de gastos
- UI específica: cards de balance, listas de transacciones, gráficos circulares
- Colores sugeridos: azules para confianza, verdes para ingresos, rojos para gastos`;
    }
    
    return '🔧 APLICACIÓN GENERAL: HomeScreen con datos básicos apropiados para la funcionalidad solicitada';
  }
} 