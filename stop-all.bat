@echo off
echo 🛑 Parando Basketball Scoreboard...

echo 🗄️ Parando base de datos Docker...
docker stop basketball-db 2>nul
docker rm basketball-db 2>nul

echo 🔧 Parando procesos .NET...
taskkill /f /im dotnet.exe 2>nul

echo 🎨 Parando procesos Node.js...
taskkill /f /im node.exe 2>nul

echo ✅ Todos los servicios han sido detenidos
pause
