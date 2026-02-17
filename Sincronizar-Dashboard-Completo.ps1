# ============================================================================
# Script: Sincronizar-Dashboard-Completo.ps1
# Descripcion: Proceso completo de sincronizacion desde Jira API al Dashboard
# ============================================================================

Write-Host "`n" -NoNewline
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "       SINCRONIZACION COMPLETA: JIRA API -> DASHBOARD       " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "`n"

$startTime = Get-Date

# Paso 1: Extraer datos de Jira
Write-Host "[1/3] Extrayendo datos desde Jira API..." -ForegroundColor Yellow
Write-Host "------------------------------------------------------------" -ForegroundColor Gray

$extractResult = & .\Extraer-Datos-Jira.ps1
if ($LASTEXITCODE -ne 0) {
    Write-Host "`nERROR en la extraccion de datos" -ForegroundColor Red
    exit 1
}

Write-Host "`n"

# Paso 2: Actualizar dashboard_data.js
Write-Host "[2/3] Actualizando dashboard_data.js..." -ForegroundColor Yellow
Write-Host "------------------------------------------------------------" -ForegroundColor Gray

$updateResult = & .\Actualizar-Dashboard-Desde-API.ps1
if ($LASTEXITCODE -ne 0) {
    Write-Host "`nERROR al actualizar dashboard" -ForegroundColor Red
    exit 1
}

Write-Host "`n"

# Paso 3: Crear respaldo
Write-Host "[3/3] Creando respaldo..." -ForegroundColor Yellow
Write-Host "------------------------------------------------------------" -ForegroundColor Gray

$backupDir = "backups"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFile = "$backupDir\dashboard_data_$timestamp.js"
Copy-Item "dashboard_data.js" $backupFile

Write-Host "Respaldo creado: $backupFile" -ForegroundColor Green

# Calcular tiempo total
$endTime = Get-Date
$duration = $endTime - $startTime
$durationSeconds = [math]::Round($duration.TotalSeconds, 1)

Write-Host "`n"
Write-Host "============================================================" -ForegroundColor Green
Write-Host "                 SINCRONIZACION COMPLETADA                  " -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host "`n"
Write-Host "Tiempo total: $durationSeconds segundos" -ForegroundColor Cyan
Write-Host "Fecha: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" -ForegroundColor Gray
Write-Host "`n"
Write-Host "Archivos actualizados:" -ForegroundColor Yellow
Write-Host "  - jira_tickets_api.csv (datos crudos)" -ForegroundColor White
Write-Host "  - dashboard_data.js (dashboard actualizado)" -ForegroundColor White
Write-Host "  - $backupFile (respaldo)" -ForegroundColor White
Write-Host "`n"

$openDashboard = Read-Host "Deseas abrir el dashboard? (S/N)"
if ($openDashboard -eq "S" -or $openDashboard -eq "s") {
    Write-Host "Abriendo dashboard..." -ForegroundColor Cyan
    Start-Process "Dashboard_Dinamico_Editable.html"
}

Write-Host "`nListo! El dashboard esta sincronizado con Jira`n" -ForegroundColor Green
