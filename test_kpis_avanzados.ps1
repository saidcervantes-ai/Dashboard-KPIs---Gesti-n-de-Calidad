# Script para abrir el Dashboard con KPIs Avanzados
# Ejecutar: .\test_kpis_avanzados.ps1

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "   PRUEBA: KPIs Avanzados - FASE 1" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

$dashboardPath = "$PSScriptRoot\Dashboard_Dinamico_Editable.html"

if (Test-Path $dashboardPath) {
    Write-Host "[OK] Dashboard encontrado" -ForegroundColor Green
    Write-Host ""
    Write-Host "INSTRUCCIONES DE PRUEBA:" -ForegroundColor Yellow
    Write-Host "------------------------"
    Write-Host "1. El dashboard se abrirá en tu navegador predeterminado"
    Write-Host "2. En la sección 'Dev-Test', selecciona del dropdown:"
    Write-Host "   > KPIs Avanzados" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "3. Verifica que se muestren 3 KPIs:" -ForegroundColor Yellow
    Write-Host "   - Lead Time (Tiempo de Entrega)" -ForegroundColor White
    Write-Host "   - Edad de Tickets Abiertos" -ForegroundColor White
    Write-Host "   - Análisis de Errores vs Tareas/HU" -ForegroundColor White
    Write-Host ""
    Write-Host "4. Abre la consola del navegador (F12) para ver logs:" -ForegroundColor Yellow
    Write-Host "   [KPIs Avanzados] Calculando con X tickets..." -ForegroundColor Gray
    Write-Host ""
    Write-Host "ARCHIVOS CREADOS:" -ForegroundColor Yellow
    Write-Host "- dashboard_kpis_avanzados.js  (23 KB)" -ForegroundColor Green
    Write-Host "- dashboard_avanzados.css      (CSS styling)" -ForegroundColor Green
    Write-Host "- README_KPIS_AVANZADOS.md     (Documentación)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Presiona cualquier tecla para abrir el dashboard..." -ForegroundColor Magenta
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    
    Write-Host ""
    Write-Host "Abriendo dashboard..." -ForegroundColor Cyan
    Start-Process $dashboardPath
    
    Write-Host ""
    Write-Host "[✓] Dashboard abierto!" -ForegroundColor Green
    Write-Host ""
    Write-Host "CHECKLIST DE PRUEBAS:" -ForegroundColor Yellow
    Write-Host "- Los 3 KPIs se muestran correctamente" -ForegroundColor White
    Write-Host "- Lead Time muestra promedio y graficos por sprint" -ForegroundColor White
    Write-Host "- Edad de Tickets muestra criticos, alertas y normales" -ForegroundColor White
    Write-Host "- Analisis de Errores muestra ratio y tendencia" -ForegroundColor White
    Write-Host "- Los estilos se aplican correctamente (cards, colores, tablas)" -ForegroundColor White
    Write-Host "- No hay errores en la consola (F12)" -ForegroundColor White
    Write-Host ""
    Write-Host "Si todo funciona, FASE 1 está completa! ✓" -ForegroundColor Green
    Write-Host ""
    
} else {
    Write-Host "[ERROR] No se encuentra el archivo Dashboard_Dinamico_Editable.html" -ForegroundColor Red
    Write-Host "Ruta esperada: $dashboardPath" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Presiona cualquier tecla para salir..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
