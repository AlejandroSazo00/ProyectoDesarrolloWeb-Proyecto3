@echo off
echo 🚀 Subiendo proyecto a GitHub (sin archivos pesados)...

echo 🗑️ Eliminando archivos pesados del tracking...
git rm -r --cached basketball-scoreboard/node_modules 2>nul
git rm -r --cached BasketballScoreboardAPI/bin 2>nul  
git rm -r --cached BasketballScoreboardAPI/obj 2>nul

echo 📝 Agregando .gitignore actualizado...
git add .gitignore

echo 💾 Haciendo commit...
git commit -m "🗑️ Eliminar archivos pesados para push rápido"

echo ⬆️ Subiendo a GitHub...
git push origin main --force

echo ✅ ¡Proyecto subido exitosamente!
echo 🌐 Repositorio: https://github.com/AlejandroSazo00/Proyecto2-VersionAdmin-2.0
pause
