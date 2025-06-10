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
