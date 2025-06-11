import 'package:flutter/material.dart';

class CartItem {
  final String id;
  final String name;
  final String description;
  final double price;
  final String imageUrl;
  int quantity;

  CartItem({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.imageUrl,
    this.quantity = 1,
  });

  double get totalPrice => price * quantity;
}

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  List<CartItem> _cartItems = [
    CartItem(
      id: '1',
      name: 'Smartphone Pro',
      description: 'Último modelo con cámara de alta resolución',
      price: 899.99,
      imageUrl: 'https://via.placeholder.com/80',
      quantity: 1,
    ),
    CartItem(
      id: '2',
      name: 'Auriculares Bluetooth',
      description: 'Sonido premium con cancelación de ruido',
      price: 249.99,
      imageUrl: 'https://via.placeholder.com/80',
      quantity: 2,
    ),
    CartItem(
      id: '3',
      name: 'Cargador Inalámbrico',
      description: 'Carga rápida compatible con todos los dispositivos',
      price: 49.99,
      imageUrl: 'https://via.placeholder.com/80',
      quantity: 1,
    ),
  ];

  bool _isLoading = false;

  double get _subtotal {
    return _cartItems.fold(0, (sum, item) => sum + item.totalPrice);
  }

  double get _shipping => _subtotal > 100 ? 0 : 15.99;
  double get _tax => _subtotal * 0.08; // 8% tax
  double get _total => _subtotal + _shipping + _tax;

  void _updateQuantity(String itemId, int newQuantity) {
    if (newQuantity <= 0) {
      _removeItem(itemId);
      return;
    }

    setState(() {
      final index = _cartItems.indexWhere((item) => item.id == itemId);
      if (index != -1) {
        _cartItems[index].quantity = newQuantity;
      }
    });
  }

  void _removeItem(String itemId) {
    setState(() {
      _cartItems.removeWhere((item) => item.id == itemId);
    });
    
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Producto eliminado del carrito'),
        duration: Duration(seconds: 2),
      ),
    );
  }

  Future<void> _checkout() async {
    if (_cartItems.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('El carrito está vacío'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      // Simular proceso de checkout
      await Future.delayed(const Duration(seconds: 3));
      
      if (mounted) {
        // Limpiar carrito después del checkout exitoso
        setState(() {
          _cartItems.clear();
        });

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('¡Compra realizada exitosamente!'),
            backgroundColor: Colors.green,
          ),
        );

        // Navegar a pantalla de confirmación
        // Navigator.pushNamed(context, '/order-confirmation');
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error en la compra: ${error.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Carrito de Compras'),
        actions: [
          IconButton(
            icon: const Icon(Icons.delete_outline),
            onPressed: _cartItems.isEmpty ? null : () {
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Vaciar Carrito'),
                  content: const Text('¿Estás seguro de que quieres eliminar todos los productos?'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Cancelar'),
                    ),
                    ElevatedButton(
                      onPressed: () {
                        setState(() {
                          _cartItems.clear();
                        });
                        Navigator.pop(context);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red,
                        foregroundColor: Colors.white,
                      ),
                      child: const Text('Vaciar'),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
      body: _cartItems.isEmpty ? _buildEmptyCart() : _buildCartContent(),
      bottomNavigationBar: _cartItems.isEmpty ? null : _buildCheckoutSection(),
    );
  }

  Widget _buildEmptyCart() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.shopping_cart_outlined,
            size: 100,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 24),
          Text(
            'Tu carrito está vacío',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () {
              // Navigator.pushNamed(context, '/products');
            },
            child: const Text('Continuar Comprando'),
          ),
        ],
      ),
    );
  }

  Widget _buildCartContent() {
    return Column(
      children: [
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: _cartItems.length,
            separatorBuilder: (context, index) => const Divider(),
            itemBuilder: (context, index) {
              final item = _cartItems[index];
              return _buildCartItemCard(item);
            },
          ),
        ),
        _buildOrderSummary(),
      ],
    );
  }

  Widget _buildCartItemCard(CartItem item) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            // Imagen del producto
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Image.network(
                item.imageUrl,
                width: 80,
                height: 80,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    width: 80,
                    height: 80,
                    color: Colors.grey[300],
                    child: const Icon(Icons.image_not_supported),
                  );
                },
              ),
            ),
            const SizedBox(width: 12),
            
            // Información del producto
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.name,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    item.description,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Colors.grey[600],
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '\$${item.price.toStringAsFixed(2)}',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: Theme.of(context).primaryColor,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
            
            // Controles de cantidad
            Column(
              children: [
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      onPressed: () => _updateQuantity(item.id, item.quantity - 1),
                      icon: const Icon(Icons.remove_circle_outline),
                      style: IconButton.styleFrom(
                        padding: EdgeInsets.zero,
                        minimumSize: const Size(32, 32),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.grey[300]!),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        item.quantity.toString(),
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                    ),
                    IconButton(
                      onPressed: () => _updateQuantity(item.id, item.quantity + 1),
                      icon: const Icon(Icons.add_circle_outline),
                      style: IconButton.styleFrom(
                        padding: EdgeInsets.zero,
                        minimumSize: const Size(32, 32),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                IconButton(
                  onPressed: () => _removeItem(item.id),
                  icon: const Icon(Icons.delete_outline),
                  style: IconButton.styleFrom(
                    foregroundColor: Colors.red,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOrderSummary() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        border: Border(top: BorderSide(color: Colors.grey[300]!)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Resumen del Pedido',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          _buildSummaryRow('Subtotal', _subtotal),
          _buildSummaryRow('Envío', _shipping),
          _buildSummaryRow('Impuestos', _tax),
          const Divider(),
          _buildSummaryRow('Total', _total, isTotal: true),
        ],
      ),
    );
  }

  Widget _buildSummaryRow(String label, double amount, {bool isTotal = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
              fontSize: isTotal ? 16 : null,
            ),
          ),
          Text(
            amount == 0 ? 'GRATIS' : '\$${amount.toStringAsFixed(2)}',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
              fontSize: isTotal ? 16 : null,
              color: isTotal ? Theme.of(context).primaryColor : null,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCheckoutSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.2),
            spreadRadius: 1,
            blurRadius: 5,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: SizedBox(
          width: double.infinity,
          height: 50,
          child: ElevatedButton(
            onPressed: _isLoading ? null : _checkout,
            style: ElevatedButton.styleFrom(
              backgroundColor: Theme.of(context).primaryColor,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: _isLoading
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : Text(
                    'Proceder al Pago - \$${_total.toStringAsFixed(2)}',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
          ),
        ),
      ),
    );
  }
} 