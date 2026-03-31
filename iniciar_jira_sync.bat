@echo off
REM ============================================================================
REM Script: iniciar_jira_sync.bat
REM Descripción: Inicia proceso completo de sincronización con Jira
REM ============================================================================

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║          Sincronización Jira - Dashboard KPIs              ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Verificar si existe configuración
if not exist "jira_config.json" (
    echo [!] No se encontró configuración de Jira
    echo.
    echo Ejecutando asistente de configuración...
    echo.
    powershell -ExecutionPolicy Bypass -File Setup-JiraConnection.ps1
    
    if errorlevel 1 (
        echo.
        echo [X] Error en la configuración
        pause
        exit /b 1
    )
)

echo.
echo [1/3] Extrayendo datos de Jira API...
powershell -ExecutionPolicy Bypass -File Connect-JiraAPI.ps1

if errorlevel 1 (
    echo.
    echo [X] Error al extraer datos de Jira
    pause
    exit /b 1
)

echo.
echo [2/3] Procesando datos...
if exist "process_jira_new.ps1" (
    powershell -ExecutionPolicy Bypass -File process_jira_new.ps1
)

echo.
echo [3/3] Generando datos para dashboard...
if exist "generate_final_data.ps1" (
    powershell -ExecutionPolicy Bypass -File generate_final_data.ps1
)

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                  Sincronización Completa!                  ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Abre Dashboard_Dinamico_Editable.html para ver los datos
echo.

REM Preguntar si desea abrir el dashboard
set /p OPEN="¿Deseas abrir el dashboard ahora? (S/N): "
if /i "%OPEN%"=="S" (
    start Dashboard_Dinamico_Editable.html
)

pause
