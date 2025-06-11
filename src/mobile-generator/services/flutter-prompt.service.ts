import { Injectable, Logger } from '@nestjs/common';
import { GenerationContext } from '../interfaces/generator.interface';

@Injectable()
export class FlutterPromptService {
  private readonly logger = new Logger(FlutterPromptService.name);

  createSystemPrompt(): string {
    return `Eres un experto desarrollador Flutter que genera aplicaciones modernas desde mockups XML de Draw.io.

ARQUITECTURA OBLIGATORIA:
- Flutter con Riverpod para estado (flutter_riverpod: ^2.4.9)
- GoRouter para navegación (go_router: ^13.0.0)
- Material Design 3 con useMaterial3: true
- Estructura modular: features/[domain]/screens/

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
- Estados con Riverpod
- Loading states en botones

ARCHIVOS OBLIGATORIOS:
[FILE: lib/main.dart] - ProviderScope + runApp
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
    const domainAnalysis = this.analyzePromptDomain(enrichedPrompt);
    const functionalityAnalysis = this.extractFunctionalities(enrichedPrompt);
    const screenAnalysis = this.extractRequiredScreens(enrichedPrompt);

    return `Genera una aplicación Flutter completa desde descripción enriquecida:

DESCRIPCIÓN COMPLETA DE LA APLICACIÓN:
${enrichedPrompt}

ANÁLISIS AUTOMÁTICO DEL DOMINIO:
${domainAnalysis}

FUNCIONALIDADES IDENTIFICADAS:
${functionalityAnalysis}

PANTALLAS ESPECÍFICAS REQUERIDAS:
${screenAnalysis}

CONFIGURACIÓN ADICIONAL:
${JSON.stringify(context.config || {}, null, 2)}

REQUERIMIENTOS CRÍTICOS PARA PROMPTS ENRIQUECIDOS:
1. **IMPLEMENTA TODAS LAS FUNCIONALIDADES** específicas mencionadas en la descripción
2. **GENERA PANTALLAS ESPECÍFICAS** del dominio detectado (fitness, finanzas, delivery, etc.)
3. **CREA AppDrawer AUTOMÁTICAMENTE** con navegación a TODAS las pantallas específicas
4. **FORMULARIOS ESPECIALIZADOS** según el dominio (ej: formulario de rutinas para fitness)
5. **COMPONENTES ESPECÍFICOS** del dominio (ej: gráficos de progreso, calendario de entrenamientos)
6. **ESTADOS AVANZADOS** con carga, error y éxito en todas las operaciones
7. **VALIDACIONES ESPECÍFICAS** del dominio en todos los formularios
8. **NAVEGACIÓN COMPLETA** entre todas las funcionalidades implementadas
9. **USAR ARQUITECTURA MODERNA**: Flutter + Riverpod + GoRouter + Material Design 3
10. **ELIMINA flutter_secure_storage** del pubspec.yaml

ARQUITECTURA TÉCNICA OBLIGATORIA:
- Flutter con Riverpod para estado (flutter_riverpod: ^2.4.9)
- GoRouter para navegación (go_router: ^13.0.0)
- Material Design 3 con useMaterial3: true y colores apropiados para el dominio
- Estructura modular: features/[domain_specific]/screens/
- MÍNIMO 8-10 pantallas principales funcionales específicas del dominio
- Navigation drawer con TODAS las funcionalidades específicas
- Formularios reactivos con validación específica del dominio
- Estados de carga, error y éxito en toda la app
- Componentes reutilizables específicos del dominio

IMPLEMENTACIÓN ESPECÍFICA REQUERIDA:
✅ TODAS las funcionalidades base mencionadas (auth, perfil, configuraciones)
✅ TODAS las funcionalidades específicas del dominio identificadas
✅ Navigation drawer con acceso a TODAS las pantallas específicas
✅ Formularios especializados con validación completa
✅ Componentes específicos del dominio (gráficos, calendarios, listas, etc.)
✅ Navegación fluida con GoRouter entre TODAS las pantallas
✅ Imports correctos y código bien organizado
✅ AppRouter().router (NO AppRouter.router)

VALIDACIÓN FINAL:
- ¿Implementé TODAS las funcionalidades específicas mencionadas?
- ¿Creé TODAS las pantallas específicas del dominio?
- ¿El navigation drawer incluye TODAS las funcionalidades?
- ¿Los formularios son específicos del dominio detectado?
- ¿Hay componentes especializados (gráficos, calendarios, etc.)?

Genera MÍNIMO 8-10 archivos de código Flutter funcional implementando TODAS las funcionalidades específicas mencionadas en la descripción.`;
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
   * Extrae pantallas requeridas del prompt enriquecido
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
} 