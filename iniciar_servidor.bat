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

python -m http.server 8080
