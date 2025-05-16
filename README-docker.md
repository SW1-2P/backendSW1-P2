# Instrucciones para Dockerizar el Proyecto

Este documento describe cómo ejecutar el proyecto utilizando Docker y Docker Compose.

## Requisitos previos

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- Base de datos PostgreSQL (instalada localmente o en otro servidor)

## Configuración de variables de entorno

Antes de iniciar los servicios, debe crear un archivo `.env` en la raíz del proyecto con las variables de entorno necesarias:

```
# Puerto de la aplicación
PORT=3000

# Configuración de la base de datos
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=backend_sw

# API Key de OpenAI
OPENAI_API_KEY=tu_api_key_aqui

# Configuración JWT para autenticación
JWT_SECRET=tu_secreto_jwt_aqui
JWT_EXPIRATION_TIME=1d
```

**Nota importante**: 
- Reemplace `tu_api_key_aqui` y `tu_secreto_jwt_aqui` con sus propios valores.
- Ajuste los parámetros de conexión de la base de datos según su configuración.
- Si la base de datos PostgreSQL está en otro servidor, cambie `DB_HOST` a la dirección IP o nombre de host correspondiente.

## Construir y ejecutar con Docker Compose

Para construir y ejecutar el servicio definido en `docker-compose.yml`:

```bash
docker-compose up -d
```

Este comando:
1. Construirá la imagen de la aplicación NestJS basada en el Dockerfile
2. Iniciará la aplicación NestJS que se conectará a la base de datos PostgreSQL existente

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)
La documentación de Swagger estará disponible en [http://localhost:3000/api](http://localhost:3000/api)

## Verificar el estado del contenedor

```bash
docker-compose ps
```

## Ver los logs de la aplicación

```bash
docker-compose logs -f app
```

## Detener el servicio

```bash
docker-compose down
```

## Reconstruir la imagen después de realizar cambios

```bash
docker-compose build app
docker-compose up -d
``` 