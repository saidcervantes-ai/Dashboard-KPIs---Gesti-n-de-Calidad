@echo off
echo ========================================
echo   Dashboard KPIs - Servidor Local
echo ========================================
echo.
echo Iniciando servidor web en puerto 8080...
echo.
echo Para acceder al dashboard, abre tu navegador en:
echo.
echo    http://localhost:8080/Dashboard_Dinamico_Editable.html
echo.
echo Para compartir en tu red local, usa tu IP:
echo.
ipconfig | findstr /i "IPv4"
echo.
echo Ejemplo: http://TU_IP:8080/Dashboard_Dinamico_Editable.html
echo.
echo Presiona Ctrl+C para detener el servidor
echo ========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js no esta instalado.
    echo Descargalo desde https://nodejs.org/
    pause
    exit /b 1
)

REM Localizar http-server (PATH o carpeta global de npm)
set "HTTP_SERVER="
where http-server.cmd >nul 2>nul && set "HTTP_SERVER=http-server.cmd"
if "%HTTP_SERVER%"=="" if exist "%APPDATA%\npm\http-server.cmd" set "HTTP_SERVER=%APPDATA%\npm\http-server.cmd"

if "%HTTP_SERVER%"=="" (
    echo Instalando http-server por unica vez...
    call npm install -g http-server
    if errorlevel 1 (
        echo [ERROR] No se pudo instalar http-server.
        pause
        exit /b 1
    )
    set "HTTP_SERVER=%APPDATA%\npm\http-server.cmd"
)

REM Abrir navegador despues de 2s
start "" cmd /c "timeout /t 2 >nul && start http://localhost:8080/Dashboard_Dinamico_Editable.html"

REM Arrancar servidor (sirviendo desde la carpeta del .bat)
call "%HTTP_SERVER%" "%~dp0." -p 8080 -c-1 --cors

echo.
echo El servidor se cerro. Codigo: %errorlevel%
pause
