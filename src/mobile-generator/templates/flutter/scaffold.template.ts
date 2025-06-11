export const FLUTTER_SCAFFOLD_TEMPLATE = `
// AppScaffold base para todas las pantallas con drawer automático
class AppScaffold extends StatelessWidget {
  final String title;
  final Widget body;
  final List<Widget>? actions;
  final Widget? floatingActionButton;
  final bool showDrawer;

  const AppScaffold({
    super.key,
    required this.title,
    required this.body,
    this.actions,
    this.floatingActionButton,
    this.showDrawer = true,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(title),
        actions: actions,
        backgroundColor: Theme.of(context).colorScheme.surface,
        foregroundColor: Theme.of(context).colorScheme.onSurface,
      ),
      drawer: showDrawer ? const AppDrawer() : null,
      body: body,
      floatingActionButton: floatingActionButton,
    );
  }
}

// Uso en RegisterScreen:
// return AppScaffold(
//   title: 'Register',
//   body: _buildBody(),
// );
`;

export const SCREEN_WITH_DRAWER_TEMPLATE = (screenName: string, content: string) => `
import 'package:flutter/material.dart';
import '../../../shared/widgets/app_drawer.dart';

class ${screenName} extends StatelessWidget {
  const ${screenName}({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('${screenName.replace('Screen', '')}'),
        backgroundColor: Theme.of(context).colorScheme.surface,
        foregroundColor: Theme.of(context).colorScheme.onSurface,
      ),
      drawer: const AppDrawer(),
      body: ${content},
    );
  }
}
`; 