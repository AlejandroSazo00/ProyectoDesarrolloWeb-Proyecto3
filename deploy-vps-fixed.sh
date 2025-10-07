#!/bin/bash

echo "🚀 DESPLIEGUE VPS - PROYECTO 3 BASKETBALL"
echo "=========================================="

# Detener contenedores existentes
echo "🛑 Deteniendo contenedores existentes..."
docker-compose down --remove-orphans

# Limpiar imágenes problemáticas
echo "🧹 Limpiando imágenes..."
docker system prune -f

# Construir servicios principales (sin report-service)
echo "🔨 Construyendo servicios principales..."
docker-compose build --no-cache basketball-api basketball-frontend

# Iniciar servicios principales
echo "🚀 Iniciando servicios principales..."
docker-compose up -d sql-server basketball-api basketball-frontend

# Esperar a que los servicios estén listos
echo "⏳ Esperando servicios..."
sleep 30

# Intentar construir report-service por separado
echo "📊 Construyendo servicio de reportes..."
cd report-service
docker build -t report-service-custom .
cd ..

# Ejecutar report-service directamente
echo "🏃 Ejecutando servicio de reportes..."
docker run -d \
  --name report-service-manual \
  --network proyectodesarrolloweb-proyecto3_basketball-network \
  -p 8000:8000 \
  -e DB_SERVER=sql-server \
  -e DB_NAME=BasketballDB \
  -e DB_USER=sa \
  -e DB_PASSWORD=YourStrong@Passw0rd \
  report-service-custom

echo "✅ DESPLIEGUE COMPLETADO"
echo "🌐 URLs disponibles:"
echo "   Frontend: http://104.131.96.162:4200"
echo "   API: http://104.131.96.162:5163"
echo "   Reports: http://104.131.96.162:8000"
echo "   Admin: http://104.131.96.162:4200/admin"

# Verificar estado
echo "📋 Estado de contenedores:"
docker ps
