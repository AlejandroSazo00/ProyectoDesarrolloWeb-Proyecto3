@echo off
echo ====================================
echo 🛡️ SUBIDA SEGURA CON GIT LFS
echo ====================================
echo.
echo ⚠️  IMPORTANTE: Este script NO modifica tu código actual
echo ✅ Trabaja solo con copias en carpeta temporal
echo ✅ Tu proyecto original permanece intacto
echo.
pause

REM Crear carpeta temporal completamente separada
set TEMP_DIR=basketball-upload-temp
if exist %TEMP_DIR% rmdir %TEMP_DIR% /s /q
mkdir %TEMP_DIR%

echo 📁 Copiando proyecto a carpeta temporal...
xcopy . %TEMP_DIR%\ /s /i /y /EXCLUDE:exclude-temp.txt

cd %TEMP_DIR%

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

echo 📄 Creando .gitignore seguro...
echo # Archivos temporales > .gitignore
echo *.tmp >> .gitignore
echo *.temp >> .gitignore
echo basketball-upload-temp/ >> .gitignore
echo exclude-temp.txt >> .gitignore

echo 🔗 Configurando repositorio remoto...
git remote add origin git@github.com:AlejandroSazo00/ProyectoDesarrolloWeb-2.0.git

echo ➕ Agregando archivos...
git add .gitattributes
git add .

echo 💾 Haciendo commit inicial...
git commit -m "🏀 Basketball Scoreboard - Proyecto completo con Git LFS

✅ API Backend (.NET Core)
✅ Frontend Angular
✅ Configuración Docker  
✅ Documentación
🔒 Archivos grandes manejados con LFS"

echo ⬆️ Subiendo a GitHub con LFS...
git push -u origin main

echo.
echo ✅ ¡SUBIDA COMPLETADA EXITOSAMENTE!
echo.
echo 🌐 Tu repositorio: https://github.com/AlejandroSazo00/ProyectoDesarrolloWeb-2.0
echo 🛡️ Tu código original NO fue modificado
echo 📁 Carpeta temporal: %TEMP_DIR%
echo.

cd ..
echo 🧹 ¿Quieres eliminar la carpeta temporal? (S/N)
set /p cleanup=
if /i "%cleanup%"=="S" (
    rmdir %TEMP_DIR% /s /q
    echo ✅ Carpeta temporal eliminada
)

pause
