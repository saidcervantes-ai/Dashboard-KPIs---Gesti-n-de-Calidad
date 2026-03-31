# Script para extraer datos completos de Jira HTML
$jiraPath = "C:\Users\scervantes\Downloads\Jira .html"
$outputCsv = "jira_tickets_complete.csv"

Write-Output "Leyendo archivo Jira HTML..."
$html = Get-Content $jiraPath -Raw -Encoding UTF8

# Extraer filas con data-issue-key
$rowPattern = '(?s)<tr[^>]*data-issue-key="([^"]+)"[^>]*>(.*?)</tr>'
$rows = [regex]::Matches($html, $rowPattern)
    
    Write-Output "Tickets encontrados: $($rows.Count)"
    
    $tickets = @()
    
    foreach ($row in $rows) {
        $issueKey = $row.Groups[1].Value
        $rowContent = $row.Groups[2].Value
        
        # Extraer celdas
        $cells = [regex]::Matches($rowContent, '<td[^>]*>(.*?)</td>')
        
        if ($cells.Count -ge 10) {
            # Extraer valores de cada celda
            $type = if ($cells[0].Groups[1].Value -match '>([^<]+)<') { $Matches[1] } else { "" }
            $key = $issueKey
            $summary = if ($cells[2].Groups[1].Value -match '>([^<]+)') { $Matches[1].Trim() } else { "" }
            $assignee = if ($cells[3].Groups[1].Value -match 'title="([^"]+)"') { $Matches[1] } else { "Sin asignar" }
            $priority = if ($cells[4].Groups[1].Value -match 'title="([^"]+)"') { $Matches[1] } else { "" }
            $status = if ($cells[5].Groups[1].Value -match '>([^<]+)<') { $Matches[1].Trim() } else { "" }
            $created = if ($cells[6].Groups[1].Value -match '(\d+/\w+/\d+)') { $Matches[1] } else { "" }
            $updated = if ($cells[7].Groups[1].Value -match '(\d+/\w+/\d+)') { $Matches[1] } else { "" }
            $resolved = if ($cells[8].Groups[1].Value -match '(\d+/\w+/\d+)') { $Matches[1] } else { "" }
            
            # Extraer sprint - puede estar en diferentes columnas
            $sprint = ""
            foreach ($cell in $cells) {
                if ($cell.Groups[1].Value -match 'Sprint\s+(\d+)|sprint\s+(\d+)|Sprint\s+QA\s+(\d+)') {
                    $sprint = if ($Matches[1]) { $Matches[1] } elseif ($Matches[2]) { $Matches[2] } else { $Matches[3] }
                    break
                }
            }
            
            # Si no se encontró sprint o es menor a 30, asignar 30
            if ($sprint -eq "" -or [int]$sprint -lt 30) {
                $sprint = "30"
            }
            
            # Normalizar estado
            $statusNorm = switch -Wildcard ($status) {
                "*Done*" { "Finalizados" }
                "*Cerrado*" { "Finalizados" }
                "*Resuelto*" { "Finalizados" }
                "*Closed*" { "Finalizados" }
                "*Resolved*" { "Finalizados" }
                "*En curso*" { "En curso" }
                "*In Progress*" { "En curso" }
                "*Progreso*" { "En curso" }
                default { "Tareas por hacer" }
            }
            
            # Calcular días de resolución
            $diasResolucion = ""
            if ($resolved -ne "" -and $created -ne "") {
                try {
                    $createdDate = [DateTime]::ParseExact($created, "dd/MMM/yy", [System.Globalization.CultureInfo]::CreateSpecificCulture("es-ES"))
                    $resolvedDate = [DateTime]::ParseExact($resolved, "dd/MMM/yy", [System.Globalization.CultureInfo]::CreateSpecificCulture("es-ES"))
                    $diasResolucion = ($resolvedDate - $createdDate).Days
                } catch {
                    # Si falla el parsing, dejar vacío
                }
            }
            
            $ticket = [PSCustomObject]@{
                Clave = $key
                Resumen = $summary
                Asignado = $assignee
                Prioridad = $priority
                Estado = $status
                Estado_Normalizado = $statusNorm
                Creada = $created
                Actualizada = $updated
                Resuelta = $resolved
                Sprint_Detectado = $sprint
                Dias_Resolucion = $diasResolucion
            }
            
            $tickets += $ticket
        }
    }
    
# Exportar a CSV
$tickets | Export-Csv -Path $outputCsv -NoTypeInformation -Encoding UTF8
Write-Output "Exportados $($tickets.Count) tickets a $outputCsv"

# Mostrar estadísticas por sprint
Write-Output "`nEstadísticas por Sprint:"
$tickets | Group-Object Sprint_Detectado | ForEach-Object {
    Write-Output "Sprint $($_.Name): $($_.Count) tickets"
}

Write-Output "`nPrimeros 5 tickets:"
$tickets | Select-Object -First 5 | Format-Table Clave, Prioridad, Estado_Normalizado, Sprint_Detectado
