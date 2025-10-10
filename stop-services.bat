@echo off
echo 🛑 Parando servicios (manteniendo datos)...

echo 🗄️ Parando base de datos Docker (SIN eliminar)...
docker stop basketball-db 2>nul

echo 🔧 Parando procesos .NET...
taskkill /f /im dotnet.exe 2>nul

echo 🎨 Parando procesos Node.js...
taskkill /f /im node.exe 2>nul

echo ✅ Servicios detenidos - Los datos se mantienen
echo 💡 Para reiniciar: ./start-all.bat
