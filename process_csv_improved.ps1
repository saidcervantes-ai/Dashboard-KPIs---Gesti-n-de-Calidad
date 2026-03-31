# Script mejorado para procesar CSV con campos entre comillas
$csvContent = Get-Content "update.csv" -Raw -Encoding UTF8

# Escribir CSV temporal sin columnas duplicadas
$lines = $csvContent -split "`r?`n"
$header = $lines[0]

# Reemplazar encabezados duplicados
$header = $header -replace 'Sprint,Sprint,Sprint,Sprint,Sprint', 'Sprint,Sprint2,Sprint3,Sprint4,Sprint5'
$newContent = $header

for ($i = 1; $i -lt $lines.Count; $i++) {
    if ($lines[$i].Trim()) {
        $newContent += "`n" + $lines[$i]
    }
}

$newContent | Out-File -FilePath "update_fixed.csv" -Encoding UTF8

# Ahora importar correctamente
$tickets = Import-Csv "update_fixed.csv" | ForEach-Object {
    $sprintRaw = $_."Sprint"
    $sprintNum = 30
    
    if ($sprintRaw -match 'Sprint\s+(\d+)') {
        $sprintNum = [int]$Matches[1]
        if ($sprintNum -lt 30) {
            $sprintNum = 30
        }
    }
    
    # Normalizar estado
    $estadoNorm = switch -Wildcard ($_.Estado) {
        "*Finalizada*" { "Finalizados" }
        "*Done*" { "Finalizados" }
        "*Hecho*" { "Finalizados" }
        "*En curso*" { "En curso" }
        "*In Process*" { "En curso" }
        "*In Progress*" { "En curso" }
        "*TEST*" { "En curso" }
        "*Test*" { "En curso" }
        default { "Tareas por hacer" }
    }
    
    # Normalizar prioridad
    $prioridad = $_.Prioridad
    if ($prioridad -notmatch '^(Highest|High|Medium|Low|Lowest)$') {
        $prioridad = "Medium"
    }
    
    # Calcular días de resolución
    $diasResolucion = ""
    if ($_.Resuelta -and $_.Creada) {
        try {
            $createdDate = [DateTime]::Parse($_.Creada)
            $resolvedDate = [DateTime]::Parse($_.Resuelta)
            $diasResolucion = ($resolvedDate - $createdDate).Days
        } catch {}
    }
    
    [PSCustomObject]@{
        Clave = $_."Clave de incidencia"
        Resumen = $_.Resumen
        Asignado = if ($_."Persona asignada") { $_."Persona asignada" } else { "Sin asignar" }
        Prioridad = $prioridad
        Estado = $_.Estado
        Estado_Normalizado = $estadoNorm
        Creada = $_.Creada
        Actualizada = $_.Actualizada
        Resuelta = $_.Resuelta
        Sprint = $sprintNum
        Dias_Resolucion = $diasResolucion
    }
}

Write-Output "Total tickets procesados: $($tickets.Count)"

Write-Output "`nDistribución por Sprint:"
$tickets | Group-Object Sprint | Sort-Object Name | ForEach-Object {
    Write-Output "  Sprint $($_.Name): $($_.Count) tickets"
}

Write-Output "`nDistribución por Estado Normalizado:"
$tickets | Group-Object Estado_Normalizado | ForEach-Object {
    Write-Output "  $($_.Name): $($_.Count) tickets"
}

Write-Output "`nDistribución por Prioridad:"
$tickets | Group-Object Prioridad | Sort-Object Name | ForEach-Object {
    Write-Output "  $($_.Name): $($_.Count) tickets"
}

# Generar datos JavaScript
$jsContent = "// Datos de tickets actualizados - Generado: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n"
$jsContent += "const ticketsData = [`n"

foreach ($ticket in $tickets) {
    $resumenEscaped = $ticket.Resumen -replace '"', '\"' -replace "`r", '' -replace "`n", ' '
    $jsContent += "    {"
    $jsContent += "clave: `"$($ticket.Clave)`", "
    $jsContent += "resumen: `"$resumenEscaped`", "
    $jsContent += "asignado: `"$($ticket.Asignado)`", "
    $jsContent += "prioridad: `"$($ticket.Prioridad)`", "
    $jsContent += "estado: `"$($ticket.Estado)`", "
    $jsContent += "estadoNormalizado: `"$($ticket.Estado_Normalizado)`", "
    $jsContent += "creada: `"$($ticket.Creada)`", "
    $jsContent += "actualizada: `"$($ticket.Actualizada)`", "
    $jsContent += "resuelta: `"$($ticket.Resuelta)`", "
    $jsContent += "sprint: $($ticket.Sprint), "
    $jsContent += "diasResolucion: `"$($ticket.Dias_Resolucion)`""
    $jsContent += "},`n"
}

$jsContent += "];`n"
$jsContent | Out-File -FilePath "dashboard_data.js" -Encoding UTF8 -NoNewline

Write-Output "`nArchivo dashboard_data.js generado"

# Exportar CSV procesado
$tickets | Export-Csv -Path "tickets_processed.csv" -NoTypeInformation -Encoding UTF8
Write-Output "Archivo tickets_processed.csv generado"

Write-Output "`nMuestra de datos:"
$tickets | Select-Object -First 5 | Format-Table Clave, Prioridad, Estado_Normalizado, Sprint -AutoSize
