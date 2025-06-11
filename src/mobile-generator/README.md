# Mobile Generator Module - Flutter

Este módulo permite generar aplicaciones móviles Flutter completas a partir de archivos XML o prompts de texto que describen la aplicación deseada.

## 🚀 Características

### ✅ Generación Dual
- **XML**: Interpretación de diseños XML del frontend visual  
- **Prompt**: Generación desde descripciones de texto directo
- **IA**: Generación inteligente usando OpenAI GPT-4o para código sofisticado y rápido

### ✅ Arquitectura Flutter Moderna
- Flutter 3.x con Dart 3.x
- Material Design 3 (Material You)
- Null Safety completo
- Navegación con routing nativo
- Gestión de estado con Provider

## 📱 Endpoints Disponibles

### Endpoints CRUD (como diagramas y mockups)

#### 1. Crear aplicación móvil
```http
POST /mobile-generator
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "xml": "<?xml version=\"1.0\"?>...",  // Opcional
  "prompt": "crea una app escolar con login y notas", // Opcional
  "nombre": "Mi App Escolar"  // Opcional
}
```

#### 2. Listar aplicaciones del usuario
```http
GET /mobile-generator
Authorization: Bearer <jwt-token>
```

#### 3. Obtener aplicación específica
```http
GET /mobile-generator/:id
Authorization: Bearer <jwt-token>
```

#### 4. Actualizar aplicación
```http
PATCH /mobile-generator/:id
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "nombre": "Nuevo nombre",
  "xml": "nuevo xml...",
  "prompt": "nuevo prompt..."
}
```

#### 5. Eliminar aplicación
```http
DELETE /mobile-generator/:id
Authorization: Bearer <jwt-token>
```

### Endpoint de Generación

#### 6. Generar proyecto Flutter
```http
POST /mobile-generator/:id/generate
Authorization: Bearer <jwt-token>
```

**Respuesta**: Archivo ZIP descargable con el proyecto Flutter completo.

## 🔄 Flujo de Trabajo

1. **Crear**: Guarda tu XML o prompt en la base de datos
```bash
curl -X POST http://localhost:3000/mobile-generator \
  -H "Authorization: Bearer tu-jwt" \
  -H "Content-Type: application/json" \
  -d '{"xml": "tu-xml-aqui"}'
```

2. **Generar**: Obtén el proyecto Flutter como ZIP
```bash
curl -X POST http://localhost:3000/mobile-generator/tu-id/generate \
  -H "Authorization: Bearer tu-jwt" \
  --output proyecto-flutter.zip
```

## 📝 Ejemplos de Uso

### Ejemplo con XML (desde frontend visual)
```json
{
  "xml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?><mxfile><diagram><mxCell value=\"Login Screen\"/></diagram></mxfile>",
  "nombre": "App de Login"
}
```

### Ejemplo con Prompt (descripción directa)
```json
{
  "prompt": "crea una aplicación escolar con login, registro de estudiantes, vista de notas y panel administrativo",
  "nombre": "Sistema Escolar"
}
```

### Ejemplo Mixto
```json
{
  "xml": "<?xml version=\"1.0\"?>...",
  "prompt": "agregar funcionalidad de notificaciones push",
  "nombre": "App Completa"
}
```

## 🧠 Capacidades de IA

### Generación Inteligente
- Analiza el XML o prompt
- Genera AL MENOS 4 pantallas diferentes
- Incluye navegación completa entre pantallas
- Agrega elementos interactivos realistas
- Usa datos de ejemplo funcionales

### Pantallas Generadas Automáticamente
- Login/Registro (si aplica)
- Dashboard/Home
- Pantallas específicas de funcionalidad
- Perfil/Configuración del usuario

## 🏗️ Estructura del Proyecto Generado

```
flutter_app/
├── lib/
│   ├── main.dart
│   ├── app.dart
│   ├── core/themes/app_theme.dart
│   ├── features/
│   │   ├── auth/
│   │   ├── home/
│   │   └── ...
│   └── shared/widgets/
├── android/
├── ios/
├── assets/images/
└── pubspec.yaml
```

## 🔧 Configuración

El módulo requiere:
- OpenAI API Key configurada en `OPENAI_API_KEY`
- Base de datos TypeORM configurada
- Módulo de autenticación JWT activo

## 🎯 Consistencia con Otros Módulos

Este módulo sigue el mismo patrón que `diagramas` y `mockups`:
- Endpoints CRUD estándar
- Entidad con usuario propietario  
- Almacenamiento de XML/prompt en base de datos
- Un endpoint adicional para generar el resultado final

**Simple y limpio** - Sin parámetros complicados ni múltiples endpoints confusos. 