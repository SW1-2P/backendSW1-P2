export const GO_ROUTER_TEMPLATE = `import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../features/register/screens/register_screen.dart';
import '../../features/project/screens/create_project_screen.dart';
import '../../shared/widgets/app_drawer.dart';

class AppRouter {
  static final _instance = AppRouter._internal();
  factory AppRouter() => _instance;
  AppRouter._internal();

  GoRouter get router => _router;

  static final GoRouter _router = GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(
        path: '/',
        name: 'register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/create-project',
        name: 'create-project',
        builder: (context, state) => const CreateProjectScreen(),
      ),
      // Rutas adicionales basadas en contenido del mockup
    ],
    errorBuilder: (context, state) => const Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text(
              'Página no encontrada',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w500),
            ),
            SizedBox(height: 8),
            Text(
              'Ruta: \${state.uri}',
              style: TextStyle(color: Colors.grey),
            ),
          ],
        ),
      ),
    ),
  );
}`;

export const MATERIAL_APP_TEMPLATE = `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/themes/app_theme.dart';
import 'core/router/app_router.dart';

class MyApp extends ConsumerWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Instancia única del router
    final appRouter = AppRouter();
    
    return MaterialApp.router(
      title: '{{APP_NAME}}',
      theme: AppTheme.lightTheme,
      routerConfig: appRouter.router,
      debugShowCheckedModeBanner: false,
    );
  }
}`; 