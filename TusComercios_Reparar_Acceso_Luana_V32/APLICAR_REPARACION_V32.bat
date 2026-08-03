@echo off
setlocal
title TusComercios - Reparar acceso de Luana V32
cd /d "%~dp0"

if not exist "..\package.json" (
  echo ERROR: Copia esta carpeta dentro de C:\Desarrollo\tuscomercios
  pause
  exit /b 1
)

echo [1/3] Copiando reparacion...
xcopy "ARCHIVOS\*" "..\" /E /I /Y /Q >nul
if errorlevel 1 goto error
cd /d ".."

echo [2/3] Corrigiendo el acceso en Supabase...
supabase db push
if errorlevel 1 goto error

echo [3/3] Verificando el proyecto...
call npm run build
if errorlevel 1 goto error

echo.
echo REPARACION V32 APLICADA Y BUILD CORRECTO
echo Luana debe cerrar sesion y volver a ingresar con Google.
pause
exit /b 0

:error
echo.
echo ERROR: Envia una captura completa a ChatGPT.
pause
exit /b 1
