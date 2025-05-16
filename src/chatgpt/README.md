# Módulo de ChatGPT para NestJS

Este módulo proporciona integración con la API de OpenAI para generar texto, respuestas de chat y proyectos Angular en una aplicación NestJS.

## Configuración

1. Crea una cuenta en [OpenAI](https://openai.com/) si aún no tienes una.
2. Genera una API key en [OpenAI API Keys](https://platform.openai.com/api-keys).
3. Agrega la API key a tus variables de entorno en un archivo `.env`:

```
OPENAI_API_KEY=sk-tu-api-key-aqui
```

## Uso

### Generar Texto

```typescript
// Inyecta el servicio en tu componente/controlador
constructor(private readonly chatgptService: ChatgptService) {}

// Genera texto a partir de un prompt
const texto = await this.chatgptService.generateText('Escribe un poema sobre la naturaleza');
```

### Generar Respuesta de Chat

```typescript
// Ejemplo de conversación
const mensajes = [
  { role: 'system', content: 'Eres un asistente útil y amigable.' },
  { role: 'user', content: '¿Cuáles son los principales beneficios de usar NestJS?' }
];

// Obtén una respuesta del modelo
const respuesta = await this.chatgptService.chat(mensajes);
```

### Generar Proyecto Angular desde XML

```typescript
// Recibe un XML y genera un proyecto Angular
const xmlContent = `<App>
  <Interface name="Home" type="component">
    <Component type="header" content="Mi Aplicación" />
    <Component type="button" label="Iniciar" />
  </Interface>
</App>`;

// Generar el proyecto como un buffer ZIP
const zipBuffer = await this.chatgptService.generateAngularFromXml(xmlContent);
```

## Endpoints de API

El módulo expone tres endpoints:

### POST /chatgpt/generate

Genera texto a partir de un prompt.

Cuerpo de la solicitud:
```json
{
  "prompt": "Escribe un poema sobre la naturaleza",
  "model": "gpt-3.5-turbo-instruct", // Opcional
  "maxTokens": 500, // Opcional
  "temperature": 0.7 // Opcional
}
```

### POST /chatgpt/chat

Genera una respuesta de chat basada en una conversación.

Cuerpo de la solicitud:
```json
{
  "messages": [
    { "role": "system", "content": "Eres un asistente útil y amigable." },
    { "role": "user", "content": "¿Cuáles son los principales beneficios de usar NestJS?" }
  ],
  "model": "gpt-3.5-turbo", // Opcional
  "temperature": 0.7 // Opcional
}
```

### POST /chatgpt/generate-angular

Genera un proyecto Angular completo a partir de un XML.

Cuerpo de la solicitud:
```json
{
  "xml": "<App><Interface name='Home'><Component type='header' /></Interface></App>",
  "specificInstructions": "Crear un proyecto con tema oscuro y rutas anidadas", // Opcional
  "model": "gpt-4" // Opcional
}
```

Respuesta: Un archivo ZIP descargable con el proyecto Angular completo.

## Modelos Recomendados

- Para completar texto: `gpt-3.5-turbo-instruct`
- Para chat: `gpt-3.5-turbo` o `gpt-4` (si tienes acceso)
- Para generación de código: `gpt-4` (recomendado para mejor calidad) 