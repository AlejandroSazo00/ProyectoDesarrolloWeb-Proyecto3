# Etapa de construcción
FROM node:20-alpine AS build
WORKDIR /app

# Instalar dependencias del sistema necesarias para compilación
RUN apk add --no-cache python3 make g++

# Copiar archivos de configuración
COPY package*.json ./

# Limpiar cache de npm y instalar todas las dependencias
RUN npm cache clean --force
RUN npm install

# Copiar el resto del código
COPY . .

# Construir la aplicación para producción
RUN npm run build

# Debug: Verificar estructura de archivos generados
RUN ls -la /app/dist/

# Etapa de producción
FROM nginx:alpine

# Copiar la configuración de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar los archivos construidos (usar ruta correcta)
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]