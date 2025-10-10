@echo off
echo 🧹 Creando repositorio limpio con solo código fuente...

REM Limpiar carpeta temporal si existe
if exist temp-upload rmdir temp-upload /s /q
mkdir temp-upload
cd temp-upload

REM Inicializar git limpio
git init
git branch -M main
git remote add origin https://github.com/AlejandroSazo00/Proyecto2-VersionAdmin-2.0.git

REM Copiar solo archivos esenciales del backend
echo 📁 Copiando Backend (.NET)...
xcopy ..\BasketballScoreboardAPI\*.cs . /s /i /y
xcopy ..\BasketballScoreboardAPI\*.csproj . /s /i /y
xcopy ..\BasketballScoreboardAPI\*.json . /s /i /y
xcopy ..\BasketballScoreboardAPI\Controllers Controllers\ /s /i /y
xcopy ..\BasketballScoreboardAPI\Models Models\ /s /i /y
xcopy ..\BasketballScoreboardAPI\Data Data\ /s /i /y
xcopy ..\BasketballScoreboardAPI\Services Services\ /s /i /y
xcopy ..\BasketballScoreboardAPI\Migrations Migrations\ /s /i /y

REM Copiar solo archivos esenciales del frontend
echo 📁 Copiando Frontend (Angular)...
mkdir basketball-scoreboard
xcopy ..\basketball-scoreboard\src basketball-scoreboard\src\ /s /i /y
xcopy ..\basketball-scoreboard\*.json basketball-scoreboard\ /y
xcopy ..\basketball-scoreboard\*.js basketball-scoreboard\ /y
xcopy ..\basketball-scoreboard\*.ts basketball-scoreboard\ /y

REM Copiar archivos de configuración
echo 📁 Copiando archivos de configuración...
copy ..\README.md .
copy ..\*.bat .
copy ..\*.sln .

REM Crear .gitignore limpio
echo # Solo ignorar lo necesario > .gitignore
echo node_modules/ >> .gitignore
echo bin/ >> .gitignore
echo obj/ >> .gitignore
echo .vs/ >> .gitignore

REM Subir todo
echo ⬆️ Subiendo a GitHub...
git add .
git commit -m "🏀 Basketball Scoreboard - Solo código fuente esencial"
git push origin main --force

echo ✅ ¡Subido exitosamente!
cd ..
rmdir temp-upload /s /q

pause
