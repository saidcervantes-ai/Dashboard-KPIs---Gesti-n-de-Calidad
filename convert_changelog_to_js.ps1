# Script para convertir changelog CSV a JavaScript
$csvPath = "jira_changelog_tiempos_estado.csv"
$outputJs = "dashboard_changelog_data.js"

Write-Host "Convirtiendo changelog CSV a JavaScript..." -ForegroundColor Cyan

# Leer CSV
$changelogData = Import-Csv $csvPath -Encoding UTF8

# Agrupar por ticket
$ticketChangelog = @{}

foreach ($entry in $changelogData) {
    $key = $entry.Clave
    if (-not $ticketChangelog.ContainsKey($key)) {
        $ticketChangelog[$key] = @()
    }
    
    $ticketChangelog[$key] += @{
        estado = $entry.Estado
        diasEnEstado = [decimal]$entry.DiasEnEstado
        fechaInicio = $entry.FechaInicio
        fechaFin = $entry.FechaFin
    }
}

# Generar JavaScript
$jsContent = "// Datos de changelog - Generado: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n"
$jsContent += "// Total de tickets con historial: $($ticketChangelog.Count)`n"
$jsContent += "const changelogData = {`n"

$count = 0
foreach ($key in $ticketChangelog.Keys | Sort-Object) {
    $count++
    $jsContent += "  '$key': [`n"
    
    foreach ($transition in $ticketChangelog[$key]) {
        $estado = $transition.estado
        $dias = $transition.diasEnEstado
        $inicio = $transition.fechaInicio
        $fin = $transition.fechaFin
        
        $jsContent += "    {estado: '$estado', dias: $dias, inicio: '$inicio', fin: '$fin'},`n"
    }
    
    $jsContent += "  ]"
    if ($count -lt $ticketChangelog.Count) {
        $jsContent += ","
    }
    $jsContent += "`n"
}

$jsContent += "};`n"

# Guardar archivo
$jsContent | Out-File -FilePath $outputJs -Encoding UTF8

Write-Host "✓ Archivo generado: $outputJs" -ForegroundColor Green
Write-Host "  Tickets con historial: $($ticketChangelog.Count)" -ForegroundColor Cyan
Write-Host "  Total transiciones: $($changelogData.Count)" -ForegroundColor Cyan

# Mostrar ejemplo
Write-Host "`nEjemplo de datos:" -ForegroundColor Yellow
$exampleKey = ($ticketChangelog.Keys | Sort-Object | Select-Object -First 1)
$transitionCount = $ticketChangelog[$exampleKey].Count
Write-Host "  $exampleKey : $transitionCount transiciones" -ForegroundColor Gray
