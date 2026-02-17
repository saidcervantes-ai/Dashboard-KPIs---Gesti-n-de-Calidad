# ============================================================================
# Script: Actualizar-Dashboard-Desde-API.ps1
# Descripcion: Actualiza dashboard_data.js con datos de la API de Jira
# ============================================================================

param(
    [string]$CsvFile = "jira_tickets_api.csv",
    [string]$OutputJs = "dashboard_data.js"
)

Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "  Actualizar Dashboard desde API" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

# Verificar archivo CSV
if (-not (Test-Path $CsvFile)) {
    Write-Host "ERROR: No se encontro el archivo $CsvFile" -ForegroundColor Red
    Write-Host "Ejecuta primero: .\Extraer-Datos-Jira.ps1" -ForegroundColor Yellow
    exit 1
}

# Cargar datos CSV
Write-Host "Cargando datos de $CsvFile..." -ForegroundColor Gray
$tickets = Import-Csv $CsvFile -Encoding UTF8

Write-Host "Total de tickets cargados: $($tickets.Count)" -ForegroundColor Green

# Generar JavaScript
Write-Host "Generando JavaScript..." -ForegroundColor Cyan

$fecha = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$jsContent = @"
// Datos actualizados - Generado: $fecha
const ticketsData = [
"@

$count = 0
foreach ($ticket in $tickets) {
    $count++
    
    # Escapar comillas y caracteres especiales
    $resumen = $ticket.Resumen -replace '"', '\"' -replace '[\r\n]+', ' ' -replace '\s+', ' '
    $asignado = $ticket.'Persona asignada' -replace '"', '\"'
    $reportador = $ticket.Reportador -replace '"', '\"'
    $estado = $ticket.Estado -replace '"', '\"'
    $estadoOriginal = $ticket.'Estado Original' -replace '"', '\"'
    $resolucion = $ticket.Resolucion -replace '"', '\"'
    $tipo = $ticket.'Tipo de Incidencia' -replace '"', '\"'
    $prioridad = $ticket.Prioridad
    $clave = $ticket.'Clave de incidencia'
    $creada = $ticket.Creada
    $actualizada = $ticket.Actualizada
    $resuelta = $ticket.Resuelta
    $sprint = $ticket.'Sprint Numero'
    $diasResolucion = $ticket.'Dias Resolucion'
    $storyPoints = $ticket.'Story Points'
    
    # Calcular desviacion (para mantener compatibilidad)
    $desviacion = ""
    if ($storyPoints -and $diasResolucion) {
        try {
            $sp = [double]$storyPoints
            $dias = [double]$diasResolucion
            $desv = $dias - $sp
            $desviacion = $desv.ToString("0.0")
        } catch { }
    }
    
    # Formato Sprint completo
    $sprintCompleto = "Invox Medical Suite-Sprint $sprint"
    
    # Generar objeto JavaScript
    $jsContent += @"
  {clave: "$clave", tipoIncidencia: "$tipo", resumen: "$resumen", asignado: "$asignado", prioridad: "$prioridad", estado: "$estado", estadoNormalizado: "$estado", creada: "$creada", actualizada: "$actualizada", resuelta: "$resuelta", sprint: "$sprint", sprints: "$sprint", diasResolucionReal: "$diasResolucion", storyPointEstimate: "$storyPoints", desviacion: "$desviacion"}
"@
    
    # Agregar coma si no es el ultimo
    if ($count -lt $tickets.Count) {
        $jsContent += ","
    }
    $jsContent += "`n"
}

$jsContent += "];"

# Guardar archivo
Write-Host "Guardando $OutputJs..." -ForegroundColor Cyan
$jsContent | Out-File -FilePath $OutputJs -Encoding UTF8 -NoNewline

$fileSize = (Get-Item $OutputJs).Length
$fileSizeKB = [math]::Round($fileSize / 1KB, 2)

Write-Host "`nArchivo actualizado: $OutputJs" -ForegroundColor Green
Write-Host "  Tamaño: $fileSizeKB KB" -ForegroundColor Gray
Write-Host "  Tickets: $($tickets.Count)" -ForegroundColor Gray

# Estadisticas rapidas
$finalizados = ($tickets | Where-Object { $_.Estado -eq "Finalizados" }).Count
$enCurso = ($tickets | Where-Object { $_.Estado -eq "En curso" }).Count
$porHacer = ($tickets | Where-Object { $_.Estado -eq "Tareas por hacer" }).Count

Write-Host "`nEstadisticas:" -ForegroundColor Cyan
Write-Host "  Finalizados: $finalizados" -ForegroundColor Green
Write-Host "  En curso: $enCurso" -ForegroundColor Yellow
Write-Host "  Por hacer: $porHacer" -ForegroundColor Gray

Write-Host "`nDashboard actualizado exitosamente!" -ForegroundColor Green
Write-Host "Abre Dashboard_Dinamico_Editable.html para ver los cambios`n" -ForegroundColor Cyan
