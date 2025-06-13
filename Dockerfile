FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:20-alpine as production

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

# Copiar el archivo .env si existe
COPY .env* ./

# Crear directorio temporal y dar permisos al usuario node
RUN mkdir -p temp && chown -R node:node /app

USER node

EXPOSE 3000

CMD ["node", "dist/main.js"] 