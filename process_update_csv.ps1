# Script para procesar el CSV actualizado y generar datos para el dashboard
$csvPath = "update.csv"
$lines = Get-Content $csvPath

# Leer encabezados y corregir duplicados
$header = $lines[0] -split ','
$headerCorrected = @()
$sprintCount = 0
foreach ($h in $header) {
    if ($h -eq "Sprint") {
        $sprintCount++
        if ($sprintCount -eq 1) {
            $headerCorrected += "Sprint"
        } else {
            $headerCorrected += "Sprint$sprintCount"
        }
    } else {
        $headerCorrected += $h
    }
}

Write-Output "Procesando CSV actualizado..."
Write-Output "Total de líneas: $($lines.Count - 1)"

# Procesar cada línea
$tickets = @()
for ($i = 1; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    if ($line.Trim() -eq "") { continue }
    
    # Dividir por comas (simple split, puede fallar con comas dentro de campos)
    $fields = $line -split ','
    
    if ($fields.Count -ge 13) {
        $clave = $fields[1].Trim()
        $resumen = $fields[3].Trim() -replace '"', ''
        $asignado = if ($fields[4].Trim()) { $fields[4].Trim() } else { "Sin asignar" }
        $prioridad = $fields[8].Trim()
        $estado = $fields[9].Trim()
        $creada = $fields[11].Trim() -replace '"', ''
        $actualizada = $fields[12].Trim() -replace '"', ''
        $sprintRaw = $fields[13].Trim() -replace '"', ''
        $resuelta = if ($fields.Count -ge 19) { $fields[18].Trim() -replace '"', '' } else { "" }
        
        # Extraer número de sprint
        $sprintNum = 30  # Default
        if ($sprintRaw -match '(\d+)') {
            $sprintNum = [int]$Matches[1]
            if ($sprintNum -lt 30) {
                $sprintNum = 30
            }
        }
        
        # Normalizar estado
        $estadoNorm = switch -Wildcard ($estado) {
            "*Finalizada*" { "Finalizados" }
            "*Done*" { "Finalizados" }
            "*Cerrado*" { "Finalizados" }
            "*Hecho*" { "Finalizados" }
            "*En curso*" { "En curso" }
            "*In Process*" { "En curso" }
            "*In Progress*" { "En curso" }
            "*TEST*" { "En curso" }
            "*Test*" { "En curso" }
            default { "Tareas por hacer" }
        }
        
        # Normalizar prioridad
        if ($prioridad -eq "") { $prioridad = "Medium" }
        
        $ticket = [PSCustomObject]@{
            Clave = $clave
            Resumen = $resumen
            Asignado = $asignado
            Prioridad = $prioridad
            Estado = $estado
            Estado_Normalizado = $estadoNorm
            Creada = $creada
            Actualizada = $actualizada
            Resuelta = $resuelta
            Sprint = $sprintNum
        }
        
        $tickets += $ticket
    }
}

Write-Output "`nTotal tickets procesados: $($tickets.Count)"

# Estadísticas por Sprint
Write-Output "`nDistribución por Sprint:"
$tickets | Group-Object Sprint | Sort-Object Name | ForEach-Object {
    Write-Output "  Sprint $($_.Name): $($_.Count) tickets"
}

# Estadísticas por Estado
Write-Output "`nDistribución por Estado:"
$tickets | Group-Object Estado_Normalizado | ForEach-Object {
    Write-Output "  $($_.Name): $($_.Count) tickets"
}

# Estadísticas por Prioridad
Write-Output "`nDistribución por Prioridad:"
$tickets | Group-Object Prioridad | Sort-Object Name | ForEach-Object {
    Write-Output "  $($_.Name): $($_.Count) tickets"
}

# Generar archivo JavaScript con los datos
$jsContent = @"
// Datos de tickets generados automáticamente desde CSV
const ticketsData = [
"@

foreach ($ticket in $tickets) {
    $jsContent += @"

    {
        clave: "$($ticket.Clave)",
        resumen: "$($ticket.Resumen -replace '"', '\"')",
        asignado: "$($ticket.Asignado)",
        prioridad: "$($ticket.Prioridad)",
        estado: "$($ticket.Estado)",
        estadoNormalizado: "$($ticket.Estado_Normalizado)",
        creada: "$($ticket.Creada)",
        actualizada: "$($ticket.Actualizada)",
        resuelta: "$($ticket.Resuelta)",
        sprint: $($ticket.Sprint)
    },
"@
}

$jsContent += @"

];

// Última actualización
const lastUpdate = new Date().toLocaleString('es-ES');
"@

$jsContent | Out-File -FilePath "dashboard_data.js" -Encoding UTF8
Write-Output "`nArchivo dashboard_data.js generado exitosamente"

# Exportar también a CSV limpio
$tickets | Export-Csv -Path "tickets_processed.csv" -NoTypeInformation -Encoding UTF8
Write-Output "Archivo tickets_processed.csv generado exitosamente"

Write-Output "`nPrimeros 3 tickets:"
$tickets | Select-Object -First 3 | Format-Table Clave, Prioridad, Estado_Normalizado, Sprint -AutoSize
