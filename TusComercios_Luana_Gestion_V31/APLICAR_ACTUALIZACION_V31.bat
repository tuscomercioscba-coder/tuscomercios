@echo off
setlocal
title TusComercios - Acceso Luana y Gestion V31
cd /d "%~dp0"

if not exist "..\package.json" (
  echo.
  echo ERROR: Esta carpeta debe estar dentro de C:\Desarrollo\tuscomercios
  echo Copia la carpeta completa alli y vuelve a ejecutar este archivo.
  echo.
  pause
  exit /b 1
)

echo ======================================================
echo  TUSCOMERCIOS - ACCESO LUANA Y GESTION V31
echo ======================================================
echo.
echo [1/4] Copiando archivos completos...
xcopy "ARCHIVOS\*" "..\" /E /I /Y /Q >nul
if errorlevel 1 goto error

cd /d ".."

echo [2/4] Aplicando acceso seguro y precio en Supabase...
supabase db push
if errorlevel 1 goto error

echo [3/4] Actualizando Mentor IA...
supabase functions deploy mentor-ia
if errorlevel 1 goto error

echo [4/4] Verificando build de produccion...
call npm run build
if errorlevel 1 goto error

echo.
echo ======================================================
echo  ACTUALIZACION V31 APLICADA Y BUILD CORRECTO
echo ======================================================
echo Luana debe ingresar con Google usando:
echo luanasolis260@gmail.com
echo.
pause
exit /b 0

:error
echo.
echo ERROR: La actualizacion no pudo completarse.
echo Envia una captura completa de esta ventana a ChatGPT.
echo.
pause
exit /b 1
