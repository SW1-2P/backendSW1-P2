import 'package:flutter/material.dart';

class NavbarScreen extends StatefulWidget {
  const NavbarScreen({super.key});

  @override
  State<NavbarScreen> createState() => _NavbarScreenState();
}

class _NavbarScreenState extends State<NavbarScreen> {
  int _currentIndex = 0;
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  final List<Widget> _screens = [
    const HomeTabScreen(),
    const ExploreTabScreen(),
    const FavoritesTabScreen(),
    const ProfileTabScreen(),
  ];

  final List<BottomNavigationBarItem> _navItems = [
    const BottomNavigationBarItem(
      icon: Icon(Icons.home_outlined),
      activeIcon: Icon(Icons.home),
      label: 'Inicio',
    ),
    const BottomNavigationBarItem(
      icon: Icon(Icons.explore_outlined),
      activeIcon: Icon(Icons.explore),
      label: 'Explorar',
    ),
    const BottomNavigationBarItem(
      icon: Icon(Icons.favorite_outline),
      activeIcon: Icon(Icons.favorite),
      label: 'Favoritos',
    ),
    const BottomNavigationBarItem(
      icon: Icon(Icons.person_outline),
      activeIcon: Icon(Icons.person),
      label: 'Perfil',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      appBar: _buildAppBar(),
      drawer: _buildDrawer(),
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: _buildBottomNavigationBar(),
      floatingActionButton: _buildFloatingActionButton(),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    final List<String> titles = ['Inicio', 'Explorar', 'Favoritos', 'Perfil'];
    
    return AppBar(
      title: Text(titles[_currentIndex]),
      centerTitle: true,
      leading: IconButton(
        icon: const Icon(Icons.menu),
        onPressed: () => _scaffoldKey.currentState?.openDrawer(),
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.search),
          onPressed: () {
            // Navigator.pushNamed(context, '/search');
          },
        ),
        IconButton(
          icon: Stack(
            children: [
              const Icon(Icons.notifications_outlined),
              Positioned(
                right: 0,
                top: 0,
                child: Container(
                  padding: const EdgeInsets.all(2),
                  decoration: BoxDecoration(
                    color: Colors.red,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  constraints: const BoxConstraints(
                    minWidth: 12,
                    minHeight: 12,
                  ),
                  child: const Text(
                    '3',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 8,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
            ],
          ),
          onPressed: () {
            // Navigator.pushNamed(context, '/notifications');
          },
        ),
      ],
    );
  }

  Widget _buildDrawer() {
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          _buildDrawerHeader(),
          _buildDrawerItem(
            icon: Icons.home,
            title: 'Inicio',
            onTap: () {
              Navigator.pop(context);
              setState(() => _currentIndex = 0);
            },
          ),
          _buildDrawerItem(
            icon: Icons.explore,
            title: 'Explorar',
            onTap: () {
              Navigator.pop(context);
              setState(() => _currentIndex = 1);
            },
          ),
          _buildDrawerItem(
            icon: Icons.favorite,
            title: 'Favoritos',
            onTap: () {
              Navigator.pop(context);
              setState(() => _currentIndex = 2);
            },
          ),
          const Divider(),
          _buildDrawerItem(
            icon: Icons.shopping_cart,
            title: 'Carrito',
            onTap: () {
              Navigator.pop(context);
              // Navigator.pushNamed(context, '/cart');
            },
          ),
          _buildDrawerItem(
            icon: Icons.history,
            title: 'Historial',
            onTap: () {
              Navigator.pop(context);
              // Navigator.pushNamed(context, '/history');
            },
          ),
          _buildDrawerItem(
            icon: Icons.settings,
            title: 'Configuración',
            onTap: () {
              Navigator.pop(context);
              // Navigator.pushNamed(context, '/settings');
            },
          ),
          const Divider(),
          _buildDrawerItem(
            icon: Icons.help,
            title: 'Ayuda',
            onTap: () {
              Navigator.pop(context);
              // Navigator.pushNamed(context, '/help');
            },
          ),
          _buildDrawerItem(
            icon: Icons.info,
            title: 'Acerca de',
            onTap: () {
              Navigator.pop(context);
              showAboutDialog(
                context: context,
                applicationName: 'Mi App',
                applicationVersion: '1.0.0',
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildDrawerHeader() {
    return DrawerHeader(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Theme.of(context).primaryColor,
            Theme.of(context).primaryColor.withOpacity(0.8),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const CircleAvatar(
            radius: 30,
            backgroundColor: Colors.white,
            child: Icon(
              Icons.person,
              size: 35,
              color: Colors.grey,
            ),
          ),
          const SizedBox(height: 12),
          const Text(
            'Usuario Demo',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            'demo@email.com',
            style: TextStyle(
              color: Colors.white.withOpacity(0.8),
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDrawerItem({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      onTap: onTap,
      splashColor: Theme.of(context).primaryColor.withOpacity(0.1),
    );
  }

  Widget _buildBottomNavigationBar() {
    return BottomNavigationBar(
      currentIndex: _currentIndex,
      onTap: (index) => setState(() => _currentIndex = index),
      type: BottomNavigationBarType.fixed,
      selectedItemColor: Theme.of(context).primaryColor,
      unselectedItemColor: Colors.grey,
      items: _navItems,
      elevation: 8,
    );
  }

  Widget? _buildFloatingActionButton() {
    if (_currentIndex == 0) { // Solo mostrar FAB en la pantalla de inicio
      return FloatingActionButton(
        onPressed: () {
          // Navigator.pushNamed(context, '/create');
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Función de crear próximamente'),
            ),
          );
        },
        child: const Icon(Icons.add),
      );
    }
    return null;
  }
}

// Pantalla de Inicio
class HomeTabScreen extends StatelessWidget {
  const HomeTabScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildWelcomeCard(context),
          const SizedBox(height: 24),
          _buildQuickActions(context),
          const SizedBox(height: 24),
          _buildRecentActivity(context),
        ],
      ),
    );
  }

  Widget _buildWelcomeCard(BuildContext context) {
    return Card(
      elevation: 4,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          gradient: LinearGradient(
            colors: [
              Theme.of(context).primaryColor,
              Theme.of(context).primaryColor.withOpacity(0.7),
            ],
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              '¡Bienvenido!',
              style: TextStyle(
                color: Colors.white,
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Explora todas las funcionalidades de nuestra app',
              style: TextStyle(
                color: Colors.white.withOpacity(0.9),
                fontSize: 16,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Acciones Rápidas',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          children: [
            _buildActionCard(
              context,
              icon: Icons.shopping_bag,
              title: 'Productos',
              color: Colors.blue,
              onTap: () {
                // Navigator.pushNamed(context, '/products');
              },
            ),
            _buildActionCard(
              context,
              icon: Icons.favorite,
              title: 'Favoritos',
              color: Colors.red,
              onTap: () {
                // Cambiar a tab de favoritos
              },
            ),
            _buildActionCard(
              context,
              icon: Icons.history,
              title: 'Historial',
              color: Colors.green,
              onTap: () {
                // Navigator.pushNamed(context, '/history');
              },
            ),
            _buildActionCard(
              context,
              icon: Icons.settings,
              title: 'Configuración',
              color: Colors.orange,
              onTap: () {
                // Navigator.pushNamed(context, '/settings');
              },
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildActionCard(
    BuildContext context, {
    required IconData icon,
    required String title,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Card(
      elevation: 2,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 32,
                color: color,
              ),
              const SizedBox(height: 8),
              Text(
                title,
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRecentActivity(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Actividad Reciente',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: 5,
          separatorBuilder: (context, index) => const Divider(),
          itemBuilder: (context, index) {
            return ListTile(
              leading: CircleAvatar(
                backgroundColor: Theme.of(context).primaryColor.withOpacity(0.1),
                child: Icon(
                  Icons.shopping_bag,
                  color: Theme.of(context).primaryColor,
                ),
              ),
              title: Text('Actividad ${index + 1}'),
              subtitle: Text('Descripción de la actividad ${index + 1}'),
              trailing: const Text('Hace 1h'),
              onTap: () {
                // Navegar a detalle de actividad
              },
            );
          },
        ),
      ],
    );
  }
}

// Pantalla de Explorar
class ExploreTabScreen extends StatelessWidget {
  const ExploreTabScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.explore, size: 80, color: Colors.grey),
          SizedBox(height: 16),
          Text(
            'Explorar',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 8),
          Text('Descubre contenido nuevo aquí'),
        ],
      ),
    );
  }
}

// Pantalla de Favoritos
class FavoritesTabScreen extends StatelessWidget {
  const FavoritesTabScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.favorite, size: 80, color: Colors.red),
          SizedBox(height: 16),
          Text(
            'Favoritos',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 8),
          Text('Tus elementos favoritos aparecerán aquí'),
        ],
      ),
    );
  }
}

// Pantalla de Perfil (simplificada)
class ProfileTabScreen extends StatelessWidget {
  const ProfileTabScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.person, size: 80, color: Colors.grey),
          SizedBox(height: 16),
          Text(
            'Perfil',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 8),
          Text('Gestiona tu perfil y configuración'),
        ],
      ),
    );
  }
} 