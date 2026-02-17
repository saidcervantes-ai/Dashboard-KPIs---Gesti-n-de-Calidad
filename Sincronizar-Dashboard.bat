@echo off
REM ============================================================================
REM Script: Sincronizar-Dashboard.bat
REM Descripcion: Launcher para sincronizacion completa Jira -> Dashboard
REM ============================================================================

echo.
echo ============================================================
echo        SINCRONIZACION JIRA API - DASHBOARD KPIs
echo ============================================================
echo.
echo Este script actualizara tu dashboard con los datos mas
echo recientes de Jira usando la API REST v3.
echo.
echo Presiona cualquier tecla para continuar o Ctrl+C para cancelar...
pause >nul

powershell.exe -ExecutionPolicy Bypass -File "Sincronizar-Dashboard-Completo.ps1"

echo.
pause
