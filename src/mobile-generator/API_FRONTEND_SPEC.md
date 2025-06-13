# 📋 Especificación API - Mobile Generator (Frontend Integration)

## 🆕 NUEVO ENDPOINT AGREGADO

Se ha agregado un **nuevo endpoint especializado** para crear aplicaciones móviles desde descripciones de texto con enriquecimiento automático.

---

## 📊 RESUMEN DE ENDPOINTS

| Endpoint | Propósito | Entrada Principal |
|----------|-----------|-------------------|
| `POST /mobile-generator` | **Existente** - Crear desde XML/mockup | XML, mockup_id |
| `POST /mobile-generator/from-prompt` | **NUEVO** - Crear desde descripción | prompt (texto) |
| `POST /mobile-generator/:id/generate` | Generar proyecto Flutter | Mismo para ambos |

---

## 🔗 ENDPOINT NUEVO: Crear desde Prompt

### **URL**
```
POST /mobile-generator/from-prompt
```

### **Headers Requeridos**
```
Authorization: Bearer {jwt-token}
Content-Type: application/json
```

### **Request Body**
```typescript
interface CreateFromPromptRequest {
  prompt: string;                    // REQUERIDO
  nombre?: string;                   // OPCIONAL
  project_type?: 'flutter' | 'angular'; // OPCIONAL (default: flutter)
  config?: {                         // OPCIONAL
    package_name?: string;
    version?: string;
    description?: string;
    features?: string[];
    theme?: string;
  };
}
```

### **Response**
```typescript
interface CreateFromPromptResponse {
  id: string;                        // UUID de la app creada
  nombre: string;                    // Nombre generado/proporcionado
  prompt: string;                    // Prompt ENRIQUECIDO automáticamente
  project_type: 'flutter' | 'angular';
  config?: object;
  user_id: string;
  createdAt: string;                 // ISO date
  updatedAt: string;                 // ISO date
}
```

### **Códigos de Estado**
- `201` - Creado exitosamente
- `400` - Error de validación (prompt vacío)
- `401` - No autorizado (JWT inválido)
- `500` - Error interno del servidor

---

## 💡 EJEMPLOS DE USO FRONTEND

### **Ejemplo 1: Prompt Básico (React/Vue/Angular)**
```javascript
const crearAppDesdePrompt = async (prompt, nombre = null) => {
  try {
    const response = await fetch('/api/mobile-generator/from-prompt', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getJWTToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        nombre: nombre
      })
    });
    
    if (!response.ok) {
      throw new Error('Error creando aplicación');
    }
    
    const appCreada = await response.json();
    console.log('App creada:', appCreada);
    
    // Redirigir a página de generación o mostrar éxito
    return appCreada;
    
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// Uso
crearAppDesdePrompt("crea una app móvil de gestión contable")
  .then(app => {
    // Mostrar éxito, redirigir, etc.
  });
```

### **Ejemplo 2: Con Configuración Completa**
```javascript
const crearAppAvanzada = async (datosFormulario) => {
  const response = await fetch('/api/mobile-generator/from-prompt', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getJWTToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: datosFormulario.descripcion,
      nombre: datosFormulario.nombreApp,
      project_type: datosFormulario.tipoProyecto || 'flutter',
      config: {
        package_name: datosFormulario.packageName,
        version: '1.0.0',
        description: datosFormulario.descripcionCorta,
        features: datosFormulario.caracteristicas
      }
    })
  });
  
  return await response.json();
};
```

---

## 🎨 COMPONENTES UI SUGERIDOS

### **Formulario de Creación desde Prompt**
```html
<!-- Ejemplo HTML/React JSX -->
<form onSubmit={handleSubmitPrompt}>
  <div class="form-group">
    <label>Descripción de tu aplicación *</label>
    <textarea 
      placeholder="Ejemplo: crea una app móvil de gestión contable con login, formularios de transacciones y reportes"
      rows="4"
      required
    ></textarea>
    <small>Describe qué tipo de aplicación quieres crear. El sistema agregará funcionalidades automáticamente.</small>
  </div>
  
  <div class="form-group">
    <label>Nombre de la aplicación</label>
    <input type="text" placeholder="Mi App Contable (opcional - se genera automáticamente)">
  </div>
  
  <div class="form-group">
    <label>Tipo de proyecto</label>
    <select>
      <option value="flutter">Flutter (Recomendado)</option>
      <option value="angular">Angular</option>
    </select>
  </div>
  
  <button type="submit">🤖 Crear App con IA</button>
</form>
```

### **Diferenciación en UI**
```html
<!-- Separar claramente los dos métodos de creación -->
<div class="creation-methods">
  <div class="method-card">
    <h3>📄 Desde Mockup Visual</h3>
    <p>Sube un archivo XML o selecciona un mockup existente</p>
    <button onclick="showXmlForm()">Crear desde Diseño</button>
  </div>
  
  <div class="method-card">
    <h3>🤖 Desde Descripción</h3>
    <p>Describe tu app y la IA agregará funcionalidades automáticamente</p>
    <button onclick="showPromptForm()">Crear con IA</button>
  </div>
</div>
```

---

## 📱 FLUJO FRONTEND COMPLETO

### **Paso 1: Creación**
```javascript
// Usuario elige método de creación
const metodoCreacion = 'prompt'; // o 'xml'

if (metodoCreacion === 'prompt') {
  // Mostrar formulario de descripción
  const app = await crearAppDesdePrompt(descripcionUsuario);
  
} else if (metodoCreacion === 'xml') {
  // Mostrar formulario XML existente (sin cambios)
  const app = await crearAppDesdeXML(xmlData);
}
```

### **Paso 2: Confirmación**
```javascript
// Mostrar detalles de la app creada
mostrarDetallesApp({
  id: app.id,
  nombre: app.nombre,
  tipo: app.project_type,
  promptEnriquecido: app.prompt, // Mostrar el prompt enriquecido
  fechaCreacion: app.createdAt
});
```

### **Paso 3: Generación (Igual para ambos métodos)**
```javascript
const generarProyecto = async (appId) => {
  const response = await fetch(`/api/mobile-generator/${appId}/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getJWTToken()}`
    }
  });
  
  if (response.ok) {
    // Descargar ZIP
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flutter-project-${appId}.zip`;
    a.click();
  }
};
```

---

## 🔍 VALIDACIONES FRONTEND

### **Validaciones Requeridas**
```javascript
const validarFormularioPrompt = (datos) => {
  const errores = {};
  
  // Prompt requerido
  if (!datos.prompt || datos.prompt.trim() === '') {
    errores.prompt = 'La descripción de la aplicación es requerida';
  }
  
  // Longitud mínima
  if (datos.prompt && datos.prompt.length < 10) {
    errores.prompt = 'La descripción debe tener al menos 10 caracteres';
  }
  
  // Nombre opcional pero con validación
  if (datos.nombre && datos.nombre.length > 50) {
    errores.nombre = 'El nombre no puede exceder 50 caracteres';
  }
  
  return errores;
};
```

### **Estados de Loading**
```javascript
const [estado, setEstado] = useState({
  creando: false,
  generando: false,
  error: null
});

const handleCrearApp = async () => {
  setEstado({...estado, creando: true, error: null});
  
  try {
    const app = await crearAppDesdePrompt(prompt);
    // Éxito
  } catch (error) {
    setEstado({...estado, error: error.message});
  } finally {
    setEstado({...estado, creando: false});
  }
};
```

---

## 🎯 MENSAJES DE USUARIO

### **Ejemplos de Prompts Sugeridos**
```javascript
const ejemplosPrompts = [
  "crea una app móvil de gestión contable",
  "crea una app de delivery de comida",
  "crea una app de citas médicas",
  "crea una app escolar para estudiantes",
  "crea una app de gimnasio y fitness",
  "crea una app de red social para mascotas"
];
```

### **Mensajes de Estado**
```javascript
const mensajes = {
  creando: "🤖 Analizando descripción y enriqueciendo funcionalidades...",
  generando: "🏗️ Generando código Flutter completo...",
  exito: "✅ ¡Aplicación creada exitosamente! El sistema agregó funcionalidades automáticamente.",
  error: "❌ Error creando la aplicación. Intenta con una descripción más específica."
};
```

---

## 🔧 CONFIGURACIÓN TÉCNICA

### **URLs Base**
```javascript
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const endpoints = {
  crearDesdeXml: `${API_BASE}/mobile-generator`,
  crearDesdePrompt: `${API_BASE}/mobile-generator/from-prompt`,
  generar: (id) => `${API_BASE}/mobile-generator/${id}/generate`,
  listar: `${API_BASE}/mobile-generator`,
  obtener: (id) => `${API_BASE}/mobile-generator/${id}`
};
```

### **Manejo de Errores**
```javascript
const manejarErroresAPI = (error, response) => {
  if (response?.status === 401) {
    // Redirigir a login
    redirectToLogin();
  } else if (response?.status === 400) {
    // Error de validación
    return 'Verifica que la descripción sea válida';
  } else if (response?.status === 500) {
    // Error del servidor
    return 'Error interno del servidor. Intenta más tarde.';
  }
  
  return 'Error desconocido. Contacta soporte.';
};
```

---

## 📋 CHECKLIST PARA DESARROLLADOR FRONTEND

- [ ] Crear nuevo formulario para prompt
- [ ] Implementar llamada a `/mobile-generator/from-prompt`
- [ ] Separar UI entre creación XML vs Prompt
- [ ] Validar formulario (prompt requerido, longitud mínima)
- [ ] Mostrar ejemplos de prompts
- [ ] Implementar estados de loading
- [ ] Manejar errores específicos
- [ ] Mostrar prompt enriquecido en confirmación
- [ ] Mantener flujo de generación existente
- [ ] Testing con diferentes tipos de prompts

---

## 🚀 NOTAS IMPORTANTES

1. **No cambiar endpoints existentes** - Todo lo de XML sigue igual
2. **El endpoint de generación es el mismo** - No duplicar lógica
3. **JWT requerido** - Mantener autenticación en todas las llamadas
4. **Prompt enriquecido** - El sistema devuelve el prompt mejorado automáticamente
5. **Fallback** - Si falla el enriquecimiento, usar prompt original + funcionalidades base 