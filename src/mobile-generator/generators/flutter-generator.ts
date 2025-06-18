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
      this.logger.warn(`⚠️ Sin API key de OpenAI - generando código con plantillas locales`);
      return this.generateWithLocalTemplates(context);
    }
    
    try {
      this.logger.debug(`📤 Generando código Flutter con información completa del XML...`);
      
      // DETECTAR PANTALLAS DEL XML
      let screenDetection: any = null;
      if (context.xml) {
        screenDetection = this.screenDetector.detectScreens(context.xml);
        this.logger.debug(`🔍 Pantallas detectadas del XML:`, {
          phoneCount: screenDetection.phoneCount,
          shouldCreateDrawer: screenDetection.shouldCreateDrawer,
          screenSections: screenDetection.screenSections.length,
          screens: screenDetection.detectedScreens,
          sections: screenDetection.screenSections.map(s => ({ title: s.title, texts: s.texts.length }))
        });
      }
      
      // USAR EL SERVICIO DE PROMPT ESPECIALIZADO
      const systemPrompt = this.promptService.createSystemPrompt();
      const userPrompt = this.promptService.createUserPrompt(context, screenDetection);
      
      this.logger.debug(`📋 Prompts generados - System: ${systemPrompt.length} chars, User: ${userPrompt.length} chars`);
      this.logger.debug(`📱 Enviando prompts especializados con pantallas detectadas`);
      
      const generatedCode = await this.chatgptService.generateFlutterCode(systemPrompt, userPrompt);
      
      this.logger.debug(`🎯 Código recibido (${generatedCode.length} chars)`);
      this.logger.debug(`📋 Primer fragmento del código: "${generatedCode.substring(0, 500)}..."`);
      
      // Verificar que el código contiene archivos en formato esperado
      if (generatedCode.length < 100 || !generatedCode.includes('[FILE:')) {
        this.logger.warn(`⚠️ Código generado insuficiente o formato incorrecto - usando plantillas locales`);
        return this.generateWithLocalTemplates(context);
      }
      
      return generatedCode;
    } catch (error) {
      this.logger.error(`❌ Error con OpenAI: ${error.message}`);
      this.logger.warn(`⚠️ Fallback a plantillas locales`);
      return this.generateWithLocalTemplates(context);
    }
  }

  private generateWithLocalTemplates(context: GenerationContext): string {
    this.logger.debug('🏠 Generando código Flutter con plantillas locales basado en interpretación de IA...');
    
    // DETECTAR PANTALLAS DEL XML TAMBIÉN EN EL FALLBACK
    let screenDetection: any = null;
    let detectedPages: string[] = [];
    
    if (context.xml) {
      screenDetection = this.screenDetector.detectScreens(context.xml);
      this.logger.debug(`🔍 Fallback - Pantallas detectadas del XML:`, {
        phoneCount: screenDetection.phoneCount,
        screenSections: screenDetection.screenSections.length,
        screens: screenDetection.detectedScreens
      });
      
      // Usar las pantallas detectadas del XML
      detectedPages = screenDetection.detectedScreens.length > 0 
        ? screenDetection.detectedScreens 
        : ['HomeScreen', 'ProfileScreen', 'SettingsScreen'];
    } else {
      // NO aplicar detección hardcodeada - usar prompt interpretado por IA
      const interpretedPrompt = context.prompt || '';
      
      // Crear una app básica que será funcional sin tipos predefinidos
      detectedPages = ['HomeScreen', 'FormScreen', 'DetailScreen', 'ProfileScreen', 'SettingsScreen'];
      
      this.logger.debug(`📱 Generando app básica desde interpretación de IA`);
      this.logger.debug(`📋 Prompt interpretado: ${interpretedPrompt.substring(0, 200)}...`);
    }
    
    return this.generateFlutterCodeFromPages(detectedPages, 'generic', screenDetection);
  }

  private generateFlutterCodeFromPages(pages: string[], appType: string, screenDetection?: any): string {
    // Detectar si necesitamos drawer (más de 2 pantallas)
    const shouldCreateDrawer = pages.length > 2;
    
    // Generar código básico con las páginas especificadas
    const routes = pages.map((page, index) => {
      const routeName = page.replace('Screen', '').toLowerCase();
      return `      GoRoute(
        path: '/${routeName}',
        name: '${routeName}',
        builder: (context, state) => const ${page}(),
      ),`;
    }).join('\n');

    const imports = pages.map(page => 
      `import '../../features/${page.replace('Screen', '').toLowerCase()}/screens/${page.replace('Screen', '').toLowerCase()}_screen.dart';`
    ).join('\n');

    const drawerImport = shouldCreateDrawer ? `import '../shared/widgets/app_drawer.dart';` : '';

    const screenFiles = pages.map(page => {
      const fileName = `lib/features/${page.replace('Screen', '').toLowerCase()}/screens/${page.replace('Screen', '').toLowerCase()}_screen.dart`;
      const className = page;
      const drawerImportForScreen = shouldCreateDrawer ? `import '../../../shared/widgets/app_drawer.dart';` : '';
      const drawerProperty = shouldCreateDrawer ? `      drawer: const AppDrawer(),` : '';
      const screenIcon = this.getIconForPage(page.replace('Screen', '').toLowerCase(), appType);
      const screenContent = this.generateScreenContent(page, appType, screenDetection);
      
      return `[FILE: ${fileName}]
\`\`\`dart
import 'package:flutter/material.dart';
${drawerImportForScreen}

class ${className} extends StatefulWidget {
  const ${className}({Key? key}) : super(key: key);

  @override
  State<${className}> createState() => _${className}State();
}

class _${className}State extends State<${className}> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('${page.replace('Screen', '')}'),
      ),
${drawerProperty}
      body: ${screenContent}
    );
  }
}
\`\`\`
`;
    }).join('\n\n');

    // Generar AppDrawer si es necesario
    const drawerFile = shouldCreateDrawer ? this.generateAppDrawerCode(pages, appType) : '';

    return `[FILE: pubspec.yaml]
\`\`\`yaml
name: flutter_app
description: Generated Flutter application
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
\`\`\`

[FILE: lib/main.dart]
\`\`\`dart
import 'package:flutter/material.dart';
import 'app.dart';

void main() {
  runApp(const MyApp());
}
\`\`\`

[FILE: lib/app.dart]
\`\`\`dart
import 'package:flutter/material.dart';
import 'core/router/app_router.dart';
import 'core/themes/app_theme.dart';

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Flutter App',
      theme: AppTheme.lightTheme,
      routerConfig: AppRouter().router,
      debugShowCheckedModeBanner: false,
    );
  }
}
\`\`\`

[FILE: lib/core/router/app_router.dart]
\`\`\`dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
${imports}
${drawerImport}

class AppRouter {
  static final _instance = AppRouter._internal();
  factory AppRouter() => _instance;
  AppRouter._internal();

  GoRouter get router => _router;

  static final GoRouter _router = GoRouter(
    initialLocation: '/${pages[0].replace('Screen', '').toLowerCase()}',
    routes: [
${routes}
    ],
  );
}
\`\`\`

[FILE: lib/core/themes/app_theme.dart]
\`\`\`dart
import 'package:flutter/material.dart';

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
    );
  }
}
\`\`\`

${screenFiles}${drawerFile}`;
  }

  /**
   * Genera el código del AppDrawer para navegación
   */
  private generateAppDrawerCode(pages: string[], appType: string = 'generic'): string {
    const drawerItems = pages.map(page => {
      const routeName = page.replace('Screen', '').toLowerCase();
      const icon = this.getIconForPage(routeName, appType);
      const title = page.replace('Screen', '');
      
      return `        _buildNavigationTile(
          context,
          icon: ${icon},
          title: '${title}',
          route: '/${routeName}',
          isSelected: GoRouterState.of(context).fullPath == '/${routeName}',
        ),`;
    }).join('\n');

    const { headerIcon, headerTitle } = this.getAppHeaderInfo(appType);

    return `

[FILE: lib/shared/widgets/app_drawer.dart]
\`\`\`dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class AppDrawer extends StatelessWidget {
  const AppDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    return NavigationDrawer(
      backgroundColor: Theme.of(context).colorScheme.surface,
      children: [
        DrawerHeader(
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.primary,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                ${headerIcon},
                size: 48,
                color: Theme.of(context).colorScheme.onPrimary,
              ),
              const SizedBox(height: 12),
              Text(
                '${headerTitle}',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  color: Theme.of(context).colorScheme.onPrimary,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
${drawerItems}
        const Divider(),
        _buildNavigationTile(
          context,
          icon: Icons.info_outline,
          title: 'About',
          route: '/about',
          isSelected: GoRouterState.of(context).fullPath == '/about',
        ),
      ],
    );
  }

  Widget _buildNavigationTile(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String route,
    required bool isSelected,
  }) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        color: isSelected 
          ? Theme.of(context).colorScheme.primaryContainer
          : Colors.transparent,
      ),
      child: ListTile(
        leading: Icon(
          icon,
          color: isSelected 
            ? Theme.of(context).colorScheme.onPrimaryContainer
            : Theme.of(context).colorScheme.onSurface,
        ),
        title: Text(
          title,
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
            color: isSelected 
              ? Theme.of(context).colorScheme.onPrimaryContainer
              : Theme.of(context).colorScheme.onSurface,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
        onTap: () {
          if (!isSelected) {
            // Usar context.go() para pantalla principal, context.push() para otras
            if (route == '/home') {
              context.go(route); // Reemplaza la pila de navegación
            } else {
              context.push(route); // Añade a la pila de navegación
            }
          }
          Navigator.of(context).pop(); // Cerrar drawer
        },
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      ),
    );
  }
}
\`\`\``;
  }

  /**
   * Obtiene el icono apropiado para cada página según el tipo de app
   */
  private getIconForPage(routeName: string, appType: string): string {
    // Iconos comunes para todas las apps
    const commonIcons: { [key: string]: string } = {
      'home': 'Icons.home',
      'profile': 'Icons.person',
      'settings': 'Icons.settings',
      'login': 'Icons.login',
      'register': 'Icons.person_add',
    };

    if (commonIcons[routeName]) {
      return commonIcons[routeName];
    }

    // Iconos específicos por tipo de app
    switch (appType) {
      case 'medical':
        const medicalIcons: { [key: string]: string } = {
          'doctors': 'Icons.local_hospital',
          'appointment': 'Icons.calendar_today',
          'medicalhistory': 'Icons.history_edu',
          'prescriptions': 'Icons.medication',
        };
        return medicalIcons[routeName] || 'Icons.medical_services';

      case 'education':
        const educationIcons: { [key: string]: string } = {
          'courses': 'Icons.school',
          'assignments': 'Icons.assignment',
          'grades': 'Icons.grade',
          'schedule': 'Icons.schedule',
          'teachers': 'Icons.group',
        };
        return educationIcons[routeName] || 'Icons.book';

      case 'project_management':
        const projectIcons: { [key: string]: string } = {
          'dashboard': 'Icons.dashboard',
          'createproject': 'Icons.create_new_folder',
          'permissions': 'Icons.security',
          'publish': 'Icons.publish',
          'repository': 'Icons.folder',
          'useraccess': 'Icons.group_add',
        };
        return projectIcons[routeName] || 'Icons.work';

      case 'ecommerce':
        const ecommerceIcons: { [key: string]: string } = {
          'products': 'Icons.shopping_bag',
          'cart': 'Icons.shopping_cart',
          'orders': 'Icons.receipt_long',
          'wishlist': 'Icons.favorite',
        };
        return ecommerceIcons[routeName] || 'Icons.store';

      case 'finance':
        const financeIcons: { [key: string]: string } = {
          'accounts': 'Icons.account_balance',
          'transactions': 'Icons.receipt',
          'payments': 'Icons.payment',
          'budget': 'Icons.pie_chart',
        };
        return financeIcons[routeName] || 'Icons.attach_money';

      case 'fitness':
        const fitnessIcons: { [key: string]: string } = {
          'workouts': 'Icons.fitness_center',
          'progress': 'Icons.trending_up',
          'nutrition': 'Icons.restaurant',
          'challenges': 'Icons.emoji_events',
        };
        return fitnessIcons[routeName] || 'Icons.sports';

      default:
        const genericIcons: { [key: string]: string } = {
          'list': 'Icons.list',
          'detail': 'Icons.info',
          'search': 'Icons.search',
          'favorites': 'Icons.favorite',
        };
        return genericIcons[routeName] || 'Icons.circle';
    }
  }

  /**
   * Obtiene información del header del drawer según el tipo de app
   */
  private getAppHeaderInfo(appType: string): { headerIcon: string; headerTitle: string } {
    switch (appType) {
      case 'medical':
        return { headerIcon: 'Icons.medical_services', headerTitle: 'Medical App' };
      case 'education':
        return { headerIcon: 'Icons.school', headerTitle: 'Education App' };
      case 'project_management':
        return { headerIcon: 'Icons.work', headerTitle: 'Project Manager' };
      case 'ecommerce':
        return { headerIcon: 'Icons.store', headerTitle: 'E-commerce App' };
      case 'finance':
        return { headerIcon: 'Icons.account_balance', headerTitle: 'Finance App' };
      case 'fitness':
        return { headerIcon: 'Icons.fitness_center', headerTitle: 'Fitness App' };
      default:
        return { headerIcon: 'Icons.mobile_friendly', headerTitle: 'Flutter App' };
    }
  }

  /**
   * Obtiene los requerimientos detallados de contenido para cada tipo de app
   */
  private getDetailedScreenRequirements(appType: string): string {
    switch (appType) {
      case 'medical':
        return `CONTENIDO ESPECÍFICO:
- HomeScreen: Dashboard con próximas citas, recordatorios medicamentos, estado salud
- DoctorsScreen: Lista doctores con especialidades, ratings, botón "Agendar Cita"
- AppointmentScreen: Calendario citas, formulario nueva cita, historial
- MedicalHistoryScreen: Timeline historial médico, documentos, resultados
- PrescriptionsScreen: Lista medicamentos activos, horarios, recordatorios
- ProfileScreen: Datos paciente, contacto emergencia, seguro médico
- SettingsScreen: Notificaciones, privacidad, idioma
- LoginScreen: Email/password, "Olvidé contraseña", registro
- RegisterScreen: Formulario completo paciente, términos servicio`;

      case 'education':
        return `CONTENIDO ESPECÍFICO:
- HomeScreen: Dashboard estudiante con próximas clases, tareas pendientes, anuncios
- CoursesScreen: Grid materias inscritas con progreso, calificaciones, accesos rápidos
- AssignmentsScreen: Lista tareas pendientes/completadas, fechas entrega, prioridades
- GradesScreen: Tabla calificaciones por materia, promedios, gráficos progreso
- ScheduleScreen: Calendario semanal clases, horarios, aulas, profesores
- TeachersScreen: Lista profesores con materias, contactos, horarios oficina
- ProfileScreen: Datos estudiante, expediente académico, contactos emergencia
- SettingsScreen: Notificaciones, tema app, sincronización calendario
- LoginScreen: Matrícula/password, "Olvidé contraseña", acceso docentes`;

      case 'project_management':
        return `CONTENIDO ESPECÍFICO:
- DashboardScreen: Panel control con proyectos activos, estadísticas, actividad reciente
- CreateProjectScreen: Formulario creación con nombre, descripción, tipo repositorio
- PermissionsScreen: Configuración permisos usuario (Read/Write, Read-only, None)
- PublishScreen: Publicación proyectos con validaciones, deploy, releases
- RepositoryScreen: Lista repositorios con branches, commits, pull requests
- UserAccessScreen: Gestión usuarios, roles, invitaciones, colaboradores
- ProfileScreen: Datos desarrollador, SSH keys, tokens, configuración Git
- SettingsScreen: Configuraciones IDE, notificaciones, integraciones
- LoginScreen: OAuth GitHub/GitLab, SSH keys, autenticación 2FA`;

      case 'ecommerce':
        return `CONTENIDO ESPECÍFICO:
- HomeScreen: Productos destacados, ofertas, categorías, búsqueda
- ProductsScreen: Grid productos con precios, ratings, filtros categoría/precio
- CartScreen: Items seleccionados, cantidades, totales, cupones descuento
- OrdersScreen: Historial pedidos, estados envío, tracking, reordenar
- WishlistScreen: Productos guardados, comparar precios, mover a carrito
- ProfileScreen: Datos usuario, direcciones envío, métodos pago
- SettingsScreen: Notificaciones ofertas, moneda, idioma
- LoginScreen: Email/password, login social, "Crear cuenta"`;

      case 'finance':
        return `CONTENIDO ESPECÍFICO:
- HomeScreen: Balance total, gráfico gastos/ingresos, transacciones recientes
- AccountsScreen: Lista cuentas bancarias, tarjetas, saldos, tipos cuenta
- TransactionsScreen: Historial movimientos con filtros fecha/categoría/monto
- PaymentsScreen: Pagos programados, transferencias, códigos QR
- BudgetScreen: Presupuestos por categoría, alertas gastos, metas ahorro
- ProfileScreen: Datos personales, configuración seguridad, verificación
- SettingsScreen: Notificaciones movimientos, categorías personalizadas
- LoginScreen: Usuario/PIN, autenticación biométrica, recuperar acceso`;

      case 'fitness':
        return `CONTENIDO ESPECÍFICO:
- HomeScreen: Progreso semanal, rutina hoy, estadísticas motivacionales
- WorkoutsScreen: Rutinas disponibles, ejercicios, temporizadores, videos
- ProgressScreen: Gráficos peso/medidas, fotos progreso, logros alcanzados
- NutritionScreen: Contador calorías, macros, recetas saludables, agua
- ChallengesScreen: Desafíos activos, rankings amigos, recompensas
- ProfileScreen: Datos físicos, objetivos fitness, historial médico
- SettingsScreen: Recordatorios ejercicio, unidades medida, privacidad
- LoginScreen: Email/password, conectar dispositivos, crear perfil`;

      default:
        return `CONTENIDO ESPECÍFICO:
- HomeScreen: Dashboard principal con accesos rápidos y notificaciones
- ListScreen: Lista elementos con búsqueda, filtros, ordenamiento
- DetailScreen: Vista detallada item con acciones principales
- SearchScreen: Búsqueda avanzada con sugerencias y historial
- FavoritesScreen: Items guardados con organización y compartir
- ProfileScreen: Datos usuario, preferencias, configuración cuenta
- SettingsScreen: Configuraciones app, notificaciones, privacidad
- LoginScreen: Autenticación segura con opciones recuperación`;
    }
  }

  /**
   * Genera contenido específico y funcional para cada tipo de pantalla
   */
  private generateScreenContent(screenName: string, appType: string, screenDetection?: any): string {
    const screenType = screenName.replace('Screen', '').toLowerCase();
    
    switch (screenType) {
      case 'home':
        return this.generateHomeContent(appType, screenDetection);
      case 'login':
        return this.generateLoginContent(appType);
      case 'profile':
        return this.generateProfileContent(appType);
      case 'settings':
        return this.generateSettingsContent(appType);
      default:
        return this.generateDomainSpecificContent(screenType, appType, screenDetection);
    }
  }

  private generateHomeContent(appType: string, screenDetection?: any): string {
    switch (appType) {
      case 'medical':
        return `SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.medical_services, color: Theme.of(context).colorScheme.primary),
                        const SizedBox(width: 8),
                        Text('Bienvenido/a', style: Theme.of(context).textTheme.headlineSmall),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text('Próxima cita: Hoy 2:30 PM - Dr. García'),
                    const SizedBox(height: 8),
                    Text('Medicamentos pendientes: 2'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            Text('Accesos Rápidos', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 16),
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              children: [
                _buildQuickAction(Icons.calendar_today, 'Citas', () {}),
                _buildQuickAction(Icons.local_hospital, 'Doctores', () {}),
                _buildQuickAction(Icons.medication, 'Medicamentos', () {}),
                _buildQuickAction(Icons.history_edu, 'Historial', () {}),
              ],
            ),
          ],
        ),
      )`;

      case 'education':
        return `SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.school, color: Theme.of(context).colorScheme.primary),
                        const SizedBox(width: 8),
                        Text('Dashboard Estudiante', style: Theme.of(context).textTheme.headlineSmall),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text('Próxima clase: Matemáticas - 10:00 AM'),
                    const SizedBox(height: 8),
                    Text('Tareas pendientes: 3'),
                    const SizedBox(height: 8),
                    Text('Promedio general: 8.5'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            Text('Accesos Rápidos', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 16),
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              children: [
                _buildQuickAction(Icons.book, 'Cursos', () {}),
                _buildQuickAction(Icons.assignment, 'Tareas', () {}),
                _buildQuickAction(Icons.grade, 'Calificaciones', () {}),
                _buildQuickAction(Icons.schedule, 'Horario', () {}),
              ],
            ),
          ],
        ),
      )`;

      default:
        return `const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.home, size: 64, color: Colors.blue),
            SizedBox(height: 16),
            Text('Dashboard Principal', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            SizedBox(height: 8),
            Text('Bienvenido a tu aplicación'),
          ],
        ),
      )`;
    }
  }

  private generateLoginContent(appType: string): string {
    return `Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(${this.getAppHeaderInfo(appType).headerIcon}, size: 80, color: Theme.of(context).colorScheme.primary),
          const SizedBox(height: 24),
          Text('${this.getAppHeaderInfo(appType).headerTitle}', style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: 32),
          TextField(
            decoration: const InputDecoration(
              labelText: 'Email',
              prefixIcon: Icon(Icons.email),
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            obscureText: true,
            decoration: const InputDecoration(
              labelText: 'Contraseña',
              prefixIcon: Icon(Icons.lock),
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {},
              child: const Text('Iniciar Sesión'),
            ),
          ),
          const SizedBox(height: 16),
          TextButton(
            onPressed: () {},
            child: const Text('¿Olvidaste tu contraseña?'),
          ),
        ],
      ),
    )`;
  }

  private generateProfileContent(appType: string): string {
    return `SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          const CircleAvatar(
            radius: 50,
            child: Icon(Icons.person, size: 50),
          ),
          const SizedBox(height: 16),
          Text('Usuario Demo', style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 8),
          Text('usuario@example.com'),
          const SizedBox(height: 24),
          Card(
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.person),
                  title: const Text('Información Personal'),
                  trailing: const Icon(Icons.arrow_forward_ios),
                  onTap: () {},
                ),
                ListTile(
                  leading: const Icon(Icons.security),
                  title: const Text('Seguridad'),
                  trailing: const Icon(Icons.arrow_forward_ios),
                  onTap: () {},
                ),
                ListTile(
                  leading: const Icon(Icons.notifications),
                  title: const Text('Notificaciones'),
                  trailing: const Icon(Icons.arrow_forward_ios),
                  onTap: () {},
                ),
              ],
            ),
          ),
        ],
      ),
    )`;
  }

  private generateSettingsContent(appType: string): string {
    return `ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          child: Column(
            children: [
              ListTile(
                leading: const Icon(Icons.notifications),
                title: const Text('Notificaciones'),
                trailing: Switch(value: true, onChanged: (value) {}),
              ),
              ListTile(
                leading: const Icon(Icons.dark_mode),
                title: const Text('Tema Oscuro'),
                trailing: Switch(value: false, onChanged: (value) {}),
              ),
              ListTile(
                leading: const Icon(Icons.language),
                title: const Text('Idioma'),
                subtitle: const Text('Español'),
                trailing: const Icon(Icons.arrow_forward_ios),
                onTap: () {},
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Card(
          child: Column(
            children: [
              ListTile(
                leading: const Icon(Icons.privacy_tip),
                title: const Text('Privacidad'),
                trailing: const Icon(Icons.arrow_forward_ios),
                onTap: () {},
              ),
              ListTile(
                leading: const Icon(Icons.help),
                title: const Text('Ayuda'),
                trailing: const Icon(Icons.arrow_forward_ios),
                onTap: () {},
              ),
              ListTile(
                leading: const Icon(Icons.info),
                title: const Text('Acerca de'),
                trailing: const Icon(Icons.arrow_forward_ios),
                onTap: () {},
              ),
            ],
          ),
        ),
      ],
    )`;
  }

  private generateDomainSpecificContent(screenType: string, appType: string, screenDetection?: any): string {
    // SI HAY DETECCIÓN DE PANTALLAS, USAR ESA INFORMACIÓN
    if (screenDetection && screenDetection.screenSections) {
      const matchingSection = screenDetection.screenSections.find(
        section => section.title.toLowerCase().includes(screenType.toLowerCase())
      );
      
      if (matchingSection) {
        this.logger.debug(`🎯 Generando contenido específico para ${screenType} basado en detección XML`);
        return this.generateContentFromDetection(matchingSection);
      }
    }
    
    // FALLBACK: Contenido genérico para pantallas específicas
    this.logger.debug(`📱 Generando contenido genérico para pantalla: ${screenType}`);
    
    // Contenido genérico si no hay detección específica
    return `Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '${screenType.charAt(0).toUpperCase() + screenType.slice(1)} Screen',
            style: Theme.of(context).textTheme.headlineMedium,
          ),
          const SizedBox(height: 16),
          const Text('Esta pantalla está en desarrollo.'),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () {},
            child: const Text('Acción Principal'),
          ),
        ],
      ),
    )`;
  }

  /**
   * Genera contenido específico basado en la detección de XML
   */
  private generateContentFromDetection(section: any): string {
    const widgets: string[] = [];
    
    // Título de la sección
    widgets.push(`Text(
      '${section.title.replace('Screen', '')}',
      style: Theme.of(context).textTheme.headlineMedium,
    )`);
    
    widgets.push('const SizedBox(height: 16)');
    
    // Agregar textos detectados
    if (section.texts && section.texts.length > 0) {
      section.texts.forEach((text: string, index: number) => {
        if (index === 0) {
          widgets.push(`Text(
            '${text}',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          )`);
        } else {
          widgets.push(`Text('${text}')`);
        }
        widgets.push('const SizedBox(height: 8)');
      });
    }
    
    // Agregar campos detectados como formulario
    if (section.fields && section.fields.length > 0) {
      widgets.push('const SizedBox(height: 16)');
      widgets.push('// Formulario generado desde detección XML');
      
      section.fields.forEach((field: string) => {
        widgets.push(`TextFormField(
          decoration: InputDecoration(
            labelText: '${field}',
            border: const OutlineInputBorder(),
          ),
        )`);
        widgets.push('const SizedBox(height: 12)');
      });
    }
    
    // Agregar radio groups detectados
    if (section.radioGroups && section.radioGroups.length > 0) {
      widgets.push('const SizedBox(height: 16)');
      
      section.radioGroups.forEach((group: any) => {
        widgets.push(`Text(
          '${group.title}',
          style: Theme.of(context).textTheme.titleMedium,
        )`);
        widgets.push('const SizedBox(height: 8)');
        
        group.options.forEach((option: any) => {
          widgets.push(`RadioListTile<String>(
            title: Text('${option.text}'),
            value: '${option.text}',
            groupValue: selectedPermission,
            onChanged: (value) => setState(() => selectedPermission = value!),
          )`);
        });
      });
    }
    
    // Agregar botones detectados
    if (section.buttons && section.buttons.length > 0) {
      widgets.push('const SizedBox(height: 24)');
      widgets.push('Row(');
      widgets.push('  children: [');
      
      section.buttons.forEach((button: string, index: number) => {
        const isPrimary = button.toLowerCase().includes('publish') || 
                         button.toLowerCase().includes('primary') ||
                         button.toLowerCase().includes('save');
        
        if (isPrimary) {
          widgets.push(`    ElevatedButton(
              onPressed: () {},
              child: Text('${button}'),
            )`);
        } else {
          widgets.push(`    TextButton(
              onPressed: () {},
              child: Text('${button}'),
            )`);
        }
        
        if (index < section.buttons.length - 1) {
          widgets.push('    const SizedBox(width: 16),');
        }
      });
      
      widgets.push('  ],');
      widgets.push(')');
    }
    
    return `Padding(
      padding: const EdgeInsets.all(16),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ${widgets.join(',\n            ')}
          ],
        ),
      ),
    )`;
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
      // Buscar bloques de código sin importar el formato
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
    const xmlContent = context.xml || '';
    const screenDetection = this.screenDetector.detectScreens(xmlContent);
    
    this.logger.debug('🔍 Verificando qué archivos base faltan después de generación de IA...');
    
    // Solo crear archivos que NO deben ser generados por la IA (archivos de configuración del sistema)
    
    // 1. ANDROID MANIFEST (siempre crear - es configuración del sistema)
    await this.createAndroidManifest(projectDir, appName);
    
    // 2. README.MD (siempre crear - es documentación)
    await this.createReadmeFile(projectDir, appName, screenDetection);
    
    this.logger.debug('✅ Archivos base de sistema creados (la IA generó el resto)');
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
}