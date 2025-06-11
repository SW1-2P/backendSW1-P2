export const FLUTTER_DRAWER_TEMPLATE = `
// [FILE: lib/shared/widgets/app_drawer.dart]
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
                Icons.mobile_friendly,
                size: 48,
                color: Theme.of(context).colorScheme.onPrimary,
              ),
              const SizedBox(height: 12),
              Text(
                'Mobile App',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  color: Theme.of(context).colorScheme.onPrimary,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
        _buildNavigationTile(
          context,
          icon: Icons.person_add,
          title: 'Register',
          route: '/',
          isSelected: GoRouterState.of(context).fullPath == '/',
        ),
        _buildNavigationTile(
          context,
          icon: Icons.create,
          title: 'Create Project',
          route: '/create-project',
          isSelected: GoRouterState.of(context).fullPath == '/create-project',
        ),
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
            if (route == '/') {
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
`; 