# 🎯 Sistema de Generación Automática de Páginas por Dominio

## 📋 Descripción General

Cuando un usuario ingresa un prompt simple como **"una app gym"**, el sistema automáticamente:

1. ✅ **Detecta el dominio específico** basado en palabras clave
2. ✅ **Genera páginas principales específicas** (mínimo 4-5 por dominio)
3. ✅ **Agrega funcionalidades específicas** del dominio detectado
4. ✅ **Incluye páginas base obligatorias** (Login, Profile, Settings)

## 🎯 Dominios Soportados y Páginas Generadas

### 🏋️ **FITNESS/GYM**
**Palabras clave detectadas:** `gym`, `gimnasio`, `fitness`, `ejercicio`, `entrenamiento`, `rutina`, `musculo`

**Páginas generadas automáticamente:**
1. **HomeScreen**: Dashboard con resumen de entrenamientos y progreso del día
2. **WorkoutScreen**: Lista de rutinas disponibles con categorías (pecho, piernas, etc.)
3. **ExerciseDetailScreen**: Detalles de ejercicios con instrucciones y videos
4. **ProgressScreen**: Gráficos de progreso, peso levantado y estadísticas
5. **TrainingHistoryScreen**: Historial de entrenamientos completados

**Funcionalidades específicas:**
- Sistema de rutinas de ejercicio por grupos musculares
- Seguimiento de progreso con gráficos de peso y repeticiones
- Cronómetro para descansos entre series
- Calendario de entrenamientos
- Calculadora de IMC y métricas corporales
- Sistema de logros y objetivos

---

### 🍕 **DELIVERY/COMIDA**
**Palabras clave detectadas:** `delivery`, `entrega`, `pedido`, `restaurante`, `comida`, `domicilio`

**Páginas generadas automáticamente:**
1. **HomeScreen**: Lista de restaurantes cercanos con búsqueda
2. **RestaurantDetailScreen**: Menú del restaurante con categorías
3. **CartScreen**: Carrito con productos seleccionados y total
4. **OrderTrackingScreen**: Seguimiento del pedido en tiempo real
5. **OrderHistoryScreen**: Historial de pedidos anteriores

**Funcionalidades específicas:**
- Búsqueda de restaurantes por ubicación
- Menús categorizados con imágenes
- Carrito con personalización de productos
- Tracking en tiempo real del delivery
- Sistema de ratings para restaurantes

---

### 💰 **FINANZAS/CONTABLE**
**Palabras clave detectadas:** `contable`, `financiero`, `banco`, `dinero`, `transaccion`, `presupuesto`, `gasto`

**Páginas generadas automáticamente:**
1. **HomeScreen**: Dashboard financiero con balance actual y gastos del mes
2. **TransactionsScreen**: Lista de todas las transacciones con filtros
3. **AddTransactionScreen**: Formulario para agregar ingresos/gastos
4. **ReportsScreen**: Reportes financieros con gráficos y estadísticas
5. **CategoriesScreen**: Gestión de categorías de gastos e ingresos

**Funcionalidades específicas:**
- Registro de ingresos y gastos por categorías
- Dashboard con gráficos de flujo de dinero
- Reportes de balance mensual y anual
- Presupuestos por categoría con alertas
- Exportación de reportes a PDF/Excel

---

### 🛒 **E-COMMERCE/TIENDA**
**Palabras clave detectadas:** `tienda`, `venta`, `producto`, `carrito`, `compra`, `ecommerce`, `catalogo`

**Páginas generadas automáticamente:**
1. **HomeScreen**: Catálogo de productos destacados con búsqueda
2. **ProductListScreen**: Lista de productos con filtros y categorías
3. **ProductDetailScreen**: Detalles del producto con galería e información
4. **CartScreen**: Carrito de compras con resumen y checkout
5. **OrdersScreen**: Historial de pedidos y seguimiento

**Funcionalidades específicas:**
- Catálogo de productos con búsqueda avanzada
- Carrito de compras persistente
- Sistema de favoritos/wishlist
- Múltiples métodos de pago
- Sistema de reviews y ratings

---

### 🏥 **SALUD/MÉDICO**
**Palabras clave detectadas:** `medico`, `hospital`, `paciente`, `cita`, `salud`, `clinica`, `doctor`

**Páginas generadas automáticamente:**
1. **HomeScreen**: Dashboard de salud con próximas citas y recordatorios
2. **DoctorsScreen**: Lista de médicos disponibles con especialidades
3. **AppointmentScreen**: Agendar nueva cita médica
4. **MedicalHistoryScreen**: Historial médico y expediente
5. **PrescriptionsScreen**: Recetas médicas y medicamentos

**Funcionalidades específicas:**
- Sistema de agendamiento de citas
- Historial médico digital
- Gestión de recetas y medicamentos
- Recordatorios de citas y medicinas
- Directorio de médicos por especialidad
- Telemedicina básica

---

### 🎓 **EDUCACIÓN/ESCOLAR**
**Palabras clave detectadas:** `escolar`, `estudiante`, `profesor`, `curso`, `educativo`, `aprendizaje`, `clase`

**Páginas generadas automáticamente:**
1. **HomeScreen**: Dashboard estudiantil con próximas clases y tareas
2. **CoursesScreen**: Lista de materias/cursos inscritos
3. **AssignmentsScreen**: Tareas pendientes y completadas
4. **GradesScreen**: Calificaciones por materia y promedio
5. **ScheduleScreen**: Horario de clases semanal

**Funcionalidades específicas:**
- Gestión de materias y horarios
- Sistema de tareas y entregables
- Calificaciones y reportes académicos
- Calendario académico
- Comunicación con profesores
- Biblioteca de recursos educativos

---

### 💬 **SOCIAL/CHAT**
**Palabras clave detectadas:** `chat`, `mensaje`, `amigo`, `red social`, `post`, `comentario`, `social`

**Páginas generadas automáticamente:**
1. **HomeScreen**: Feed de publicaciones de amigos
2. **ChatsScreen**: Lista de conversaciones activas
3. **ChatDetailScreen**: Conversación individual con mensajería
4. **ProfileScreen**: Perfil público con posts y seguidores
5. **CreatePostScreen**: Crear nueva publicación con media

**Funcionalidades específicas:**
- Sistema de mensajería en tiempo real
- Feed de publicaciones con likes y comentarios
- Sistema de amigos/seguidores
- Compartir fotos y videos
- Estados/stories temporales
- Grupos y comunidades

---

### 📱 **APLICACIÓN GENÉRICA** (Fallback)
**Para prompts que no coinciden con dominios específicos**

**Páginas generadas automáticamente:**
1. **HomeScreen**: Pantalla principal con funcionalidades principales
2. **ListScreen**: Lista de elementos principales de la aplicación
3. **DetailScreen**: Vista detallada de elementos individuales
4. **CreateEditScreen**: Formulario para crear/editar elementos
5. **SearchScreen**: Búsqueda y filtros avanzados

**Funcionalidades específicas:**
- CRUD completo de elementos principales
- Sistema de búsqueda y filtros
- Gestión de datos locales y remotos
- Validaciones de formularios
- Persistencia de datos local

---

## 🔧 Páginas Base (Agregadas Automáticamente)

**Todas las aplicaciones incluyen estas páginas adicionales:**
- **LoginScreen**: Autenticación de usuarios
- **RegisterScreen**: Registro de nuevos usuarios
- **ProfileScreen**: Perfil de usuario editable
- **SettingsScreen**: Configuraciones de la aplicación

---

## 🚀 Especificaciones Técnicas Automáticas

**Todas las aplicaciones se generan con:**
- Flutter con GoRouter para navegación
- Material Design 3 con `useMaterial3: true`
- Formularios con validación reactiva
- Navegación fluida entre pantallas
- Componentes reutilizables y código limpio
- Manejo de estados con Provider o Riverpod
- Estados de carga, error y éxito
- Diseño responsive

---

## 📊 Ejemplo de Transformación

### Input:
```
"una app gym"
```

### Output Enriquecido:
```
una app gym

APLICACIÓN DEL DOMINIO: FITNESS_GYM

PÁGINAS PRINCIPALES OBLIGATORIAS (mínimo 5):
1. HomeScreen: Dashboard con resumen de entrenamientos y progreso del día
2. WorkoutScreen: Lista de rutinas disponibles con categorías (pecho, piernas, etc.)
3. ExerciseDetailScreen: Detalles de ejercicios con instrucciones y videos
4. ProgressScreen: Gráficos de progreso, peso levantado y estadísticas
5. TrainingHistoryScreen: Historial de entrenamientos completados

FUNCIONALIDADES ESPECÍFICAS DEL DOMINIO:
- Sistema de rutinas de ejercicio por grupos musculares
- Seguimiento de progreso con gráficos de peso y repeticiones
- Cronómetro para descansos entre series
- Calendario de entrenamientos
[...más funcionalidades...]

PANTALLAS MÍNIMAS TOTALES: 9 (5 específicas + 4 base)
```

---

## ✅ Garantías del Sistema

1. **Mínimo 4 páginas específicas** para cualquier dominio
2. **4 páginas base adicionales** (Login, Register, Profile, Settings)
3. **Total mínimo: 8-9 páginas** por aplicación
4. **Funcionalidades específicas** del dominio detectado
5. **Aplicaciones completas y funcionales** desde prompts simples

---

## 🔄 Futuras Expansiones

El sistema puede expandirse fácilmente agregando nuevos dominios como:
- **Gaming/Entretenimiento**
- **IoT/Smart Home**
- **Productividad/Tareas**
- **Música/Streaming**
- **Viajes/Turismo**
- **Agricultura/Campo**

Cada nuevo dominio seguirá el mismo patrón: palabras clave + páginas específicas + funcionalidades del dominio. 