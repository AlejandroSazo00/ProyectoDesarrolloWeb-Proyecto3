@echo off
echo 🏀 Iniciando Basketball Scoreboard (Modo Híbrido)...

echo 🗄️ 1. Iniciando base de datos en Docker...
docker stop basketball-db 2>nul
docker rm basketball-db 2>nul

docker run -d --name basketball-db ^
  -e ACCEPT_EULA=Y ^
  -e SA_PASSWORD=YourStrong@Passw0rd ^
  -e MSSQL_PID=Express ^
  -p 1433:1433 ^
  mcr.microsoft.com/mssql/server:2022-latest

echo ⏳ Esperando a que SQL Server esté listo (30 segundos)...
timeout /t 30 /nobreak > nul

echo 🔧 2. Iniciando backend (.NET API)...
start "Basketball API" cmd /k "cd BasketballScoreboardAPI && echo 🔧 Iniciando Backend... && dotnet run --urls http://localhost:5163"

echo ⏳ Esperando a que el backend esté listo...
timeout /t 15 /nobreak > nul

echo 🎨 3. Iniciando frontend (Angular)...
start "Basketball Frontend" cmd /k "cd basketball-scoreboard && echo 🎨 Iniciando Frontend... && ng serve"

echo ✅ ¡Basketball Scoreboard iniciado en modo híbrido!
echo.
echo 🌐 URLs disponibles:
echo    Frontend: http://localhost:4200
echo    Backend:  http://localhost:5163
echo    Swagger:  http://localhost:5163/swagger
echo    Database: localhost:1433
echo.
echo 🔐 Credenciales admin:
echo    Usuario: admin
echo    Contraseña: Admin123!
echo.
echo 💡 Tip: Cada componente se ejecuta en su propia ventana
echo    Puedes cerrar esta ventana sin afectar los servicios
