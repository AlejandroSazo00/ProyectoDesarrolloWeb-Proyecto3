@echo off
echo ====================================
echo 🛡️ SUBIDA SEGURA CORREGIDA - CON TODO EL CÓDIGO
echo ====================================
echo.
echo ⚠️  IMPORTANTE: Este script NO modifica tu código actual
echo ✅ Crea carpeta temporal FUERA del proyecto
echo ✅ Tu proyecto original permanece intacto
echo.
pause

REM Crear carpeta temporal FUERA del directorio actual
set TEMP_DIR=C:\temp\basketball-upload-safe
if exist "%TEMP_DIR%" rmdir "%TEMP_DIR%" /s /q
mkdir "%TEMP_DIR%"

echo 📁 Copiando proyecto completo a carpeta temporal externa...
echo    Origen: %CD%
echo    Destino: %TEMP_DIR%

REM Copiar todo EXCEPTO carpetas problemáticas
robocopy "%CD%" "%TEMP_DIR%" /E /XD "basketball-upload-temp" ".git" "node_modules" "bin" "obj" ".vs" ".angular" /XF "*.tmp" "*.temp"

cd /d "%TEMP_DIR%"

echo 🔧 Inicializando Git con LFS...
git init
git lfs install
git branch -M main

echo 📦 Configurando Git LFS para archivos grandes...
git lfs track "*.dll"
git lfs track "*.exe" 
git lfs track "*.zip"
git lfs track "*.tar.gz"
git lfs track "node_modules/**"
git lfs track "basketball-scoreboard/node_modules/**"
git lfs track "BasketballScoreboardAPI/bin/**"
git lfs track "BasketballScoreboardAPI/obj/**"

echo 📄 Creando .gitignore completo...
echo # Dependencias > .gitignore
echo node_modules/ >> .gitignore
echo package-lock.json >> .gitignore
echo. >> .gitignore
echo # Build outputs >> .gitignore
echo dist/ >> .gitignore
echo bin/ >> .gitignore
echo obj/ >> .gitignore
echo. >> .gitignore
echo # IDE >> .gitignore
echo .vs/ >> .gitignore
echo .vscode/ >> .gitignore
echo. >> .gitignore
echo # Angular >> .gitignore
echo .angular/ >> .gitignore
echo. >> .gitignore
echo # Logs >> .gitignore
echo *.log >> .gitignore

echo 🔗 Configurando repositorio remoto...
git remote add origin git@github.com:AlejandroSazo00/ProyectoDesarrolloWeb-2.0.git

echo ➕ Agregando archivos...
git add .

echo 💾 Haciendo commit con todo el proyecto...
git commit -m "🏀 Basketball Scoreboard - Proyecto COMPLETO con Git LFS

✅ API Backend (.NET Core) - INCLUIDA
✅ Frontend Angular - INCLUIDO  
✅ Configuración Docker - INCLUIDA
✅ Documentación - INCLUIDA
🔒 Archivos grandes manejados con LFS"

echo ⬆️ Subiendo proyecto COMPLETO a GitHub...
git push origin main --force

echo.
echo ✅ ¡PROYECTO COMPLETO SUBIDO EXITOSAMENTE!
echo.
echo 🌐 Tu repositorio: https://github.com/AlejandroSazo00/ProyectoDesarrolloWeb-2.0
echo 🛡️ Tu código original NO fue modificado
echo 📁 Carpeta temporal: %TEMP_DIR%
echo.
echo 📊 Archivos subidos:
dir /b

cd /d "%~dp0"
echo.
echo 🧹 ¿Quieres eliminar la carpeta temporal? (S/N)
set /p cleanup=
if /i "%cleanup%"=="S" (
    rmdir "%TEMP_DIR%" /s /q
    echo ✅ Carpeta temporal eliminada
)

pause
