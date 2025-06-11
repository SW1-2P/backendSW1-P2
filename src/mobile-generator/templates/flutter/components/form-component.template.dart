import 'package:flutter/material.dart';

class FormScreen extends StatefulWidget {
  const FormScreen({super.key});

  @override
  State<FormScreen> createState() => _FormScreenState();
}

class _FormScreenState extends State<FormScreen> {
  final _formKey = GlobalKey<FormState>();
  
  // Controllers
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _messageController = TextEditingController();
  final _companyController = TextEditingController();
  
  // Focus nodes
  final _firstNameFocus = FocusNode();
  final _lastNameFocus = FocusNode();
  final _emailFocus = FocusNode();
  final _phoneFocus = FocusNode();
  final _messageFocus = FocusNode();
  final _companyFocus = FocusNode();
  
  // Form state
  String _selectedCountry = 'México';
  String _selectedCategory = 'General';
  bool _isAgreeToTerms = false;
  bool _isSubscribeNewsletter = true;
  bool _isLoading = false;

  final List<String> _countries = [
    'México',
    'Estados Unidos',
    'España',
    'Argentina',
    'Colombia',
    'Perú',
    'Chile',
    'Otro'
  ];

  final List<String> _categories = [
    'General',
    'Soporte Técnico',
    'Ventas',
    'Facturación',
    'Sugerencias',
    'Quejas',
    'Otro'
  ];

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _messageController.dispose();
    _companyController.dispose();
    
    _firstNameFocus.dispose();
    _lastNameFocus.dispose();
    _emailFocus.dispose();
    _phoneFocus.dispose();
    _messageFocus.dispose();
    _companyFocus.dispose();
    
    super.dispose();
  }

  Future<void> _submitForm() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (!_isAgreeToTerms) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Debes aceptar los términos y condiciones'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      // Simular envío del formulario
      await Future.delayed(const Duration(seconds: 3));
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('¡Formulario enviado exitosamente!'),
            backgroundColor: Colors.green,
          ),
        );

        // Limpiar formulario después del envío exitoso
        _clearForm();
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error enviando formulario: ${error.toString()}'),
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

  void _clearForm() {
    _formKey.currentState?.reset();
    _firstNameController.clear();
    _lastNameController.clear();
    _emailController.clear();
    _phoneController.clear();
    _messageController.clear();
    _companyController.clear();
    
    setState(() {
      _selectedCountry = 'México';
      _selectedCategory = 'General';
      _isAgreeToTerms = false;
      _isSubscribeNewsletter = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Formulario de Contacto'),
        actions: [
          TextButton(
            onPressed: _clearForm,
            child: const Text('Limpiar'),
          ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildHeader(),
              const SizedBox(height: 24),
              _buildPersonalInfoSection(),
              const SizedBox(height: 24),
              _buildContactInfoSection(),
              const SizedBox(height: 24),
              _buildMessageSection(),
              const SizedBox(height: 24),
              _buildPreferencesSection(),
              const SizedBox(height: 32),
              _buildSubmitButton(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Icon(
              Icons.contact_mail,
              size: 48,
              color: Theme.of(context).primaryColor,
            ),
            const SizedBox(height: 12),
            Text(
              'Contactanos',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Completa el formulario y nos pondremos en contacto contigo pronto',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.grey[600],
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPersonalInfoSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Información Personal',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _firstNameController,
                    focusNode: _firstNameFocus,
                    decoration: const InputDecoration(
                      labelText: 'Nombre *',
                      prefixIcon: Icon(Icons.person_outline),
                      border: OutlineInputBorder(),
                    ),
                    textInputAction: TextInputAction.next,
                    onFieldSubmitted: (_) => _lastNameFocus.requestFocus(),
                    validator: (value) {
                      if (value == null || value.trim().isEmpty) {
                        return 'El nombre es requerido';
                      }
                      if (value.trim().length < 2) {
                        return 'El nombre debe tener al menos 2 caracteres';
                      }
                      return null;
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextFormField(
                    controller: _lastNameController,
                    focusNode: _lastNameFocus,
                    decoration: const InputDecoration(
                      labelText: 'Apellido *',
                      prefixIcon: Icon(Icons.person_outline),
                      border: OutlineInputBorder(),
                    ),
                    textInputAction: TextInputAction.next,
                    onFieldSubmitted: (_) => _companyFocus.requestFocus(),
                    validator: (value) {
                      if (value == null || value.trim().isEmpty) {
                        return 'El apellido es requerido';
                      }
                      if (value.trim().length < 2) {
                        return 'El apellido debe tener al menos 2 caracteres';
                      }
                      return null;
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _companyController,
              focusNode: _companyFocus,
              decoration: const InputDecoration(
                labelText: 'Empresa (Opcional)',
                prefixIcon: Icon(Icons.business_outlined),
                border: OutlineInputBorder(),
              ),
              textInputAction: TextInputAction.next,
              onFieldSubmitted: (_) => _emailFocus.requestFocus(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContactInfoSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Información de Contacto',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _emailController,
              focusNode: _emailFocus,
              decoration: const InputDecoration(
                labelText: 'Correo Electrónico *',
                prefixIcon: Icon(Icons.email_outlined),
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.emailAddress,
              textInputAction: TextInputAction.next,
              onFieldSubmitted: (_) => _phoneFocus.requestFocus(),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'El correo electrónico es requerido';
                }
                if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value)) {
                  return 'Ingresa un correo electrónico válido';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _phoneController,
              focusNode: _phoneFocus,
              decoration: const InputDecoration(
                labelText: 'Teléfono *',
                prefixIcon: Icon(Icons.phone_outlined),
                border: OutlineInputBorder(),
                hintText: '+52 123 456 7890',
              ),
              keyboardType: TextInputType.phone,
              textInputAction: TextInputAction.next,
              onFieldSubmitted: (_) => _messageFocus.requestFocus(),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'El teléfono es requerido';
                }
                if (value.trim().length < 10) {
                  return 'Ingresa un teléfono válido';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _selectedCountry,
              decoration: const InputDecoration(
                labelText: 'País *',
                prefixIcon: Icon(Icons.public_outlined),
                border: OutlineInputBorder(),
              ),
              items: _countries.map((country) {
                return DropdownMenuItem(
                  value: country,
                  child: Text(country),
                );
              }).toList(),
              onChanged: (value) {
                setState(() {
                  _selectedCountry = value!;
                });
              },
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Selecciona un país';
                }
                return null;
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMessageSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Mensaje',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _selectedCategory,
              decoration: const InputDecoration(
                labelText: 'Categoría *',
                prefixIcon: Icon(Icons.category_outlined),
                border: OutlineInputBorder(),
              ),
              items: _categories.map((category) {
                return DropdownMenuItem(
                  value: category,
                  child: Text(category),
                );
              }).toList(),
              onChanged: (value) {
                setState(() {
                  _selectedCategory = value!;
                });
              },
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Selecciona una categoría';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _messageController,
              focusNode: _messageFocus,
              decoration: const InputDecoration(
                labelText: 'Mensaje *',
                hintText: 'Escribe tu mensaje aquí...',
                border: OutlineInputBorder(),
                alignLabelWithHint: true,
              ),
              maxLines: 5,
              textInputAction: TextInputAction.newline,
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'El mensaje es requerido';
                }
                if (value.trim().length < 10) {
                  return 'El mensaje debe tener al menos 10 caracteres';
                }
                return null;
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPreferencesSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Preferencias',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            CheckboxListTile(
              title: const Text('Acepto los términos y condiciones'),
              subtitle: const Text('Requerido para enviar el formulario'),
              value: _isAgreeToTerms,
              onChanged: (value) {
                setState(() {
                  _isAgreeToTerms = value ?? false;
                });
              },
              controlAffinity: ListTileControlAffinity.leading,
              activeColor: Theme.of(context).primaryColor,
            ),
            CheckboxListTile(
              title: const Text('Suscribirse al boletín'),
              subtitle: const Text('Recibir actualizaciones y noticias'),
              value: _isSubscribeNewsletter,
              onChanged: (value) {
                setState(() {
                  _isSubscribeNewsletter = value ?? false;
                });
              },
              controlAffinity: ListTileControlAffinity.leading,
              activeColor: Theme.of(context).primaryColor,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSubmitButton() {
    return SizedBox(
      height: 50,
      child: ElevatedButton(
        onPressed: _isLoading ? null : _submitForm,
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
            : const Text(
                'Enviar Formulario',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
      ),
    );
  }
} 