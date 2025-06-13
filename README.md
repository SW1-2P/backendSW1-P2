# Backend API - Sistema de Diagramas y Mockups

API REST desarrollada con NestJS que gestiona usuarios, diagramas y mockups, proporcionando autenticación mediante JWT y documentación Swagger.

## Características

- Autenticación con JWT
- Roles de usuario (admin, editor)
- CRUD de diagramas
- CRUD de mockups
- Documentación Swagger
- Validación de datos
- Protección de rutas
- TypeORM con PostgreSQL

## Requisitos

- Node.js (v16 o superior)
- PostgreSQL
- npm o yarn

## Instalación

1. Clonar el repositorio:
```bash
git clone <url-del-repositorio>
cd BackendSW_P1
```

2. Instalar dependencias:
```bash
npm install
```

3. Crear archivo `.env` en la raíz del proyecto con la siguiente configuración:
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_contraseña
DB_NAME=backend_sw
JWT_SECRET=secreto_muy_seguro
```

4. Iniciar la aplicación en modo desarrollo:
```bash
npm run start:dev
```

La aplicación estará disponible en `http://localhost:3000` y la documentación Swagger en `http://localhost:3000/api`.

## Estructura del Proyecto

```
src/
├── auth/               # Autenticación con JWT
├── usuarios/           # Módulo de usuarios
├── diagramas/          # Módulo de diagramas
├── mockups/            # Módulo de mockups
├── app.controller.ts   # Controlador principal
├── app.module.ts       # Módulo principal
├── app.service.ts      # Servicio principal
└── main.ts             # Punto de entrada
```

## Endpoints

### Autenticación

- `POST /auth/register` - Registro de nuevo usuario
- `POST /auth/login` - Inicio de sesión
- `GET /auth/profile` - Perfil del usuario autenticado

### Usuarios

- `GET /usuarios` - Lista todos los usuarios (requiere autenticación)
- `GET /usuarios/:id` - Obtiene un usuario por ID
- `POST /usuarios` - Crea un nuevo usuario (solo admin)
- `PATCH /usuarios/:id` - Actualiza un usuario (solo admin)
- `DELETE /usuarios/:id` - Elimina un usuario (solo admin)

### Diagramas

- `GET /diagramas` - Lista diagramas del usuario actual
- `GET /diagramas/:id` - Obtiene diagrama por ID
- `POST /diagramas` - Crea un nuevo diagrama
- `PATCH /diagramas/:id` - Actualiza un diagrama
- `DELETE /diagramas/:id` - Elimina un diagrama

### Mockups

- `GET /mockups` - Lista mockups del usuario actual
- `GET /mockups/:id` - Obtiene mockup por ID
- `POST /mockups` - Crea un nuevo mockup
- `PATCH /mockups/:id` - Actualiza un mockup
- `DELETE /mockups/:id` - Elimina un mockup

## Autenticación y Autorización

La API utiliza token JWT para la autenticación. Para acceder a endpoints protegidos:

1. Obtenga un token mediante el endpoint `/auth/login` o `/auth/register`
2. Incluya el token en los headers de las peticiones:
   - Header: `Authorization: Bearer <token>`

## Modelos de Datos

### Usuario
```typescript
{
  id: string;         // UUID generado automáticamente
  nombre: string;     // Nombre del usuario
  email: string;      // Email único
  rol: 'admin' | 'editor'; // Rol del usuario
  password: string;   // Contraseña (no devuelta en las respuestas)
  createdAt: Date;    // Fecha de creación
  updatedAt: Date;    // Fecha de última actualización
}
```

### Diagrama
```typescript
{
  id: string;         // UUID generado automáticamente
  nombre: string;     // Nombre del diagrama
  xml: string;        // Contenido XML del diagrama
  user_id: string;    // ID del usuario propietario
  createdAt: Date;    // Fecha de creación
  updatedAt: Date;    // Fecha de última actualización
}
```

### Mockup
```typescript
{
  id: string;         // UUID generado automáticamente
  nombre: string;     // Nombre del mockup
  xml: string;        // Contenido XML del mockup
  user_id: string;    // ID del usuario propietario
  createdAt: Date;    // Fecha de creación
  updatedAt: Date;    // Fecha de última actualización
}
```

## Respuestas de Error

La API devuelve respuestas de error con el siguiente formato:

```json
{
  "statusCode": 400,
  "message": "Descripción del error",
  "error": "Tipo de error"
}
```

Códigos de estado comunes:
- `400` - Bad Request (datos incorrectos)
- `401` - Unauthorized (no autenticado)
- `403` - Forbidden (sin permisos)
- `404` - Not Found (recurso no encontrado)
- `500` - Internal Server Error (error del servidor)

## Desarrollado con

- [NestJS](https://nestjs.com/)
- [TypeORM](https://typeorm.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [JWT](https://jwt.io/)
- [Swagger](https://swagger.io/)

# 📱 Sistema de Generación de Apps Móviles

Sistema completo para la generación automática de aplicaciones móviles Flutter desde diferentes tipos de entrada.

## 🎯 **APARTADOS IMPLEMENTADOS**

### **1️⃣ APARTADO GENERAL - Creación Automática**
- **Entrada**: Prompt simple (`"una app educativa"`)
- **Proceso**: Enriquecimiento automático con IA
- **Salida**: App completa con 8-9 páginas específicas del dominio
- **Endpoint**: `POST /mobile-generator/create-general-app`

**Flujo**:
```
Prompt Simple → Detección de Dominio → Enriquecimiento Automático → App Completa
```

**Dominios Soportados**: 
- 🏃‍♂️ FITNESS_GYM
- 📚 EDUCACION_ESCOLAR  
- 🍕 DELIVERY_COMIDA
- 💰 FINANZAS_CONTABLE
- 🛒 ECOMMERCE_TIENDA
- 🏥 SALUD_MEDICO
- 💬 SOCIAL_CHAT

### **2️⃣ APARTADO DETALLADO - Prompt Específico**
- **Entrada**: Prompt detallado con especificaciones exactas
- **Proceso**: SIN enriquecimiento automático - exactamente lo solicitado
- **Salida**: App fiel a las especificaciones del usuario
- **Endpoint**: `POST /mobile-generator/create-detailed-app`

**Flujo**:
```
Prompt Detallado → Generación Directa → App Según Especificaciones
```

**Ejemplo de Prompt Detallado**:
```
Crear aplicación Flutter con:
1. LoginScreen: email, password, botón login
2. HomeScreen: dashboard con 4 cards, navegación inferior
3. ProfileScreen: formulario edición, avatar circular
4. SettingsScreen: lista configuraciones, toggles
Material Design 3, colores azul/blanco, BottomNavigationBar
```

### **3️⃣ APARTADO DESDE IMAGEN - Análisis Visual**
- **Entrada**: Imagen/mockup/wireframe
- **Proceso**: Análisis visual de componentes con IA
- **Salida**: App fiel al diseño original
- **Endpoint**: `POST /mobile-generator/create-from-image`

**Flujo**:
```
Imagen/Mockup → Análisis Visual IA → Detección Componentes → App Fiel al Diseño
```

**Formatos Soportados**: JPG, PNG, GIF, WEBP

## 🛠️ **ARQUITECTURA TÉCNICA**

### Backend (NestJS)
```
src/mobile-generator/
├── mobile-generator.controller.ts     # 3 endpoints diferenciados
├── mobile-generator.service.ts        # Lógica de creación
├── prompt-enrichment.service.ts       # Enriquecimiento automático (APARTADO 1)
├── flutter-prompt.service.ts          # Generación de prompts Flutter
├── image-analysis.service.ts          # Análisis de imágenes (APARTADO 3)
└── chatgpt.service.ts                 # Integración OpenAI
```

### Frontend (React + TypeScript)
```
src/pages/
├── MobileAppsMainPage.tsx             # Selección de apartado
├── MobileAppFromPromptPage.tsx        # APARTADO 1: GENERAL
├── MobileAppDetailedPage.tsx          # APARTADO 2: DETALLADO  
└── MobileAppFromImagePage.tsx         # APARTADO 3: DESDE IMAGEN
```

### API Endpoints

#### **APARTADO 1: GENERAL**
```http
POST /mobile-generator/create-general-app
Content-Type: application/json

{
  "prompt": "una app educativa",
  "nombre": "EduApp"
}
```

#### **APARTADO 2: DETALLADO**
```http
POST /mobile-generator/create-detailed-app
Content-Type: application/json

{
  "prompt": "Crear app Flutter con: 1. LoginScreen...",
  "nombre": "App Detallada",
  "projectType": "flutter"
}
```

#### **APARTADO 3: DESDE IMAGEN**
```http
POST /mobile-generator/create-from-image
Content-Type: application/json

{
  "image": "data:image/jpeg;base64,/9j/4AAQ...",
  "nombre": "App from Mockup",
  "projectType": "flutter"
}
```

## 🔬 **TESTING REALIZADO**

### Test APARTADO GENERAL
```bash
curl -X POST http://localhost:3000/mobile-generator/create-general-app \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -d '{"prompt": "una app educativa", "nombre": "EduApp"}'
```

**Resultado**: ✅ Dominio EDUCACION_ESCOLAR detectado, 9 páginas generadas

### Test APARTADO DETALLADO
- **Input**: Prompt específico con 4 pantallas detalladas
- **Resultado**: ✅ App exactamente según especificaciones

### Test APARTADO DESDE IMAGEN
- **Input**: Mockup de Figma
- **Resultado**: ✅ Componentes detectados y app fiel al diseño

## 🚀 **INSTALACIÓN Y USO**

### 1. Backend
```bash
cd backendSW1-P2
npm install
npm run build
npm run start:prod
```

### 2. Frontend  
```bash
cd mockup-front
npm install
npm run build
npm run preview
```

### 3. Acceso
- **Frontend**: http://localhost:4173
- **Backend**: http://localhost:3000
- **Swagger**: http://localhost:3000/api

## 📊 **ESTADÍSTICAS DEL SISTEMA**

- ✅ **3 Apartados** completamente implementados
- ✅ **7 Dominios** con plantillas específicas  
- ✅ **8-9 Páginas** generadas mínimo por app
- ✅ **Frontend/Backend** totalmente funcionales
- ✅ **TypeScript** sin errores de compilación
- ✅ **JWT Authentication** implementado
- ✅ **Swagger Documentation** disponible

## 🎯 **DIFERENCIAS CLAVE ENTRE APARTADOS**

| Aspecto | GENERAL | DETALLADO | DESDE IMAGEN |
|---------|---------|-----------|--------------|
| **Entrada** | Prompt simple | Prompt específico | Imagen/Mockup |
| **IA Automática** | ✅ Sí | ❌ No | ✅ Análisis visual |
| **Control Usuario** | Bajo | Alto | Medio |
| **Páginas Típicas** | 8-9 (dominio+base) | Según especificado | Según diseño |
| **Tiempo Generación** | Rápido | Medio | Medio-Alto |
| **Casos de Uso** | Prototipado rápido | Apps específicas | Fidelidad diseño |

## 📈 **PRÓXIMAS MEJORAS**

- [ ] Soporte para React Native
- [ ] Templates adicionales por dominio
- [ ] Análisis de múltiples imágenes
- [ ] Integración con Figma API
- [ ] Generación de tests automáticos
- [ ] Deployment automático

---

**Desarrollado con**: NestJS + React + TypeScript + OpenAI GPT-4 + Material Design 3
