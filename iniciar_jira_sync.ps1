# ============================================================================
# Script: iniciar_jira_sync.ps1
# Descripción: Sincronización completa con Jira API
# ============================================================================

param(
    [switch]$SkipConfig,
    [switch]$OpenDashboard
)

$ErrorActionPreference = "Stop"

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          Sincronización Jira - Dashboard KPIs              ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Verificar configuración
if (-not (Test-Path "jira_config.json") -and -not $SkipConfig) {
    Write-Host "⚙️  No se encontró configuración de Jira" -ForegroundColor Yellow
    Write-Host "   Ejecutando asistente de configuración...`n" -ForegroundColor Gray
    
    & .\Setup-JiraConnection.ps1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n❌ Error en la configuración" -ForegroundColor Red
        exit 1
    }
}

# Paso 1: Extraer datos de Jira
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "[1/3] Extrayendo datos de Jira API..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

try {
    & .\Connect-JiraAPI.ps1
    
    if ($LASTEXITCODE -ne 0) {
        throw "Error al ejecutar Connect-JiraAPI.ps1"
    }
} catch {
    Write-Host "`n❌ Error al extraer datos de Jira: $_" -ForegroundColor Red
    exit 1
}

# Paso 2: Procesar datos (si existe el script)
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "[2/3] Procesando datos..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

if (Test-Path "process_jira_new.ps1") {
    try {
        & .\process_jira_new.ps1
    } catch {
        Write-Host "⚠️  Advertencia al procesar datos: $_" -ForegroundColor Yellow
    }
} else {
    Write-Host "⏭️  Archivo process_jira_new.ps1 no encontrado, omitiendo..." -ForegroundColor Gray
}

# Paso 3: Generar datos finales (si existe el script)
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "[3/3] Generando datos para dashboard..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

if (Test-Path "generate_final_data.ps1") {
    try {
        & .\generate_final_data.ps1
    } catch {
        Write-Host "⚠️  Advertencia al generar datos finales: $_" -ForegroundColor Yellow
    }
} else {
    Write-Host "⏭️  Archivo generate_final_data.ps1 no encontrado, omitiendo..." -ForegroundColor Gray
}

# Resumen
Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                  ✅ Sincronización Completa!                ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📊 Dashboard listo para usar:" -ForegroundColor Cyan
Write-Host "   Dashboard_Dinamico_Editable.html`n" -ForegroundColor White

# Abrir dashboard si se especificó
if ($OpenDashboard) {
    Start-Process "Dashboard_Dinamico_Editable.html"
} else {
    $open = Read-Host "¿Deseas abrir el dashboard ahora? (S/N)"
    if ($open -eq "S" -or $open -eq "s") {
        Start-Process "Dashboard_Dinamico_Editable.html"
    }
}

Write-Host "`n✓ Proceso completado`n" -ForegroundColor Green
