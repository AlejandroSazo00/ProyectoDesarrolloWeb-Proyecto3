#!/bin/bash

# Script de despliegue para VPS
echo "🚀 Desplegando Basketball Scoreboard en VPS..."

# Variables
VPS_IP="104.131.96.162"
REPO_URL="git@github.com:AlejandroSazo00/ProyectoDesarrolloWeb-Proyecto3.git"
PROJECT_DIR="/root/ProyectoDesarrolloWeb-2.0"

echo "📡 Conectando a VPS: $VPS_IP"

# Comandos para ejecutar en la VPS
ssh melgust@$VPS_IP << EOF
    echo "🔄 Actualizando sistema..."
    apt update && apt install -y docker.io docker-compose git

    echo "📁 Preparando directorio del proyecto..."
    rm -rf $PROJECT_DIR
    
    echo "📥 Clonando repositorio..."
    git clone $REPO_URL $PROJECT_DIR
    
    echo "🔧 Configurando para producción..."
    cd $PROJECT_DIR
    
    # Reemplazar localhost por IP de VPS en archivos críticos
    sed -i 's/localhost:5163/104.131.96.162:5163/g' basketball-scoreboard/src/app/services/api.service.ts
    sed -i 's/localhost:5163/104.131.96.162:5163/g' basketball-scoreboard/src/app/admin/*/*.ts
    sed -i 's/localhost:8000/104.131.96.162:8000/g' report-service/app/models/database.py
    
    echo "🐳 Iniciando servicios con Docker..."
    docker-compose down || true
    docker-compose up -d --build
    
    echo "⏳ Esperando que los servicios inicien..."
    sleep 30
    
    echo "✅ Despliegue completado!"
    echo "🌐 URLs disponibles:"
    echo "   Frontend: http://104.131.96.162:4200"
    echo "   Admin: http://104.131.96.162:4200/admin"
    echo "   API: http://104.131.96.162:5163"
    echo "   Reports: http://104.131.96.162:8000/docs"
    
    docker-compose ps
EOF

echo "🎉 ¡Despliegue completado!"
