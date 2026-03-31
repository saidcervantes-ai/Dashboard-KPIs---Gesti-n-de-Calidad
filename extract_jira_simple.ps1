# Script simplificado para extraer datos de Jira
$jiraPath = "C:\Users\scervantes\Downloads\Jira .html"
$html = Get-Content $jiraPath -Raw -Encoding UTF8

Write-Output "Extrayendo datos de Jira..."

# Dividir por cada link de issue
$issueBlocks = $html -split 'data-issue-key="'
Write-Output "Bloques encontrados: $($issueBlocks.Count - 1)"

$tickets = @()
$sprintCounts = @{
    "30" = 0
    "31" = 0
    "32" = 0
}

for ($i = 1; $i -lt $issueBlocks.Count; $i++) {
    $block = $issueBlocks[$i]
    
    # Extraer issue key
    if ($block -match '^([A-Z]+-\d+)') {
        $key = $Matches[1]
    } else { continue }
    
    # Extraer prioridad
    $priority = if ($block -match 'alt="Highest"') { "Highest" }
                elseif ($block -match 'alt="High"') { "High" }
                elseif ($block -match 'alt="Medium"') { "Medium" }
                elseif ($block -match 'alt="Low"') { "Low" }
                else { "Medium" }
    
    # Extraer estado
    $status = if ($block -match '<span[^>]*>([^<]+)</span>[\s\S]{0,200}</td>[\s\S]{0,100}<td class="created"') {
        $Matches[1].Trim()
    } else { "" }
    
    # Normalizar estado
    $statusNorm = if ($status -match 'Done|Cerrado|Resuelto|Closed|Resolved') { "Finalizados" }
                  elseif ($status -match 'En curso|In Progress|Progreso') { "En curso" }
                  else { "Tareas por hacer" }
    
    # Extraer resumen
    $summary = if ($block -match '<td class="summary"><p>\s*(.*?)\s*</p>') {
        $Matches[1].Trim() -replace '<[^>]+>', '' -replace '\s+', ' '
    } else { "" }
    
    # Extraer asignado
    $assignee = if ($block -match '<td class="assignee">\s*([^<\s][^<]*?)\s*</td>') {
        $Matches[1].Trim()
    } else { "Sin asignar" }
    
    # Extraer fechas
    $created = if ($block -match '<td class="created">\s*(\d+/\w+/\d+)') { $Matches[1] } else { "" }
    $updated = if ($block -match '<td class="updated">\s*(\d+/\w+/\d+)') { $Matches[1] } else { "" }
    $resolved = if ($block -match '<td class="resolved">\s*(\d+/\w+/\d+)') { $Matches[1] } else { "" }
    
    # Extraer sprint - buscar en todo el bloque
    $sprint = "30"  # Default
    if ($block -match 'Sprint\s+QA\s+(\d+)|Sprint\s+(\d+)|sprint\s+(\d+)') {
        $sprintNum = if ($Matches[1]) { [int]$Matches[1] } 
                     elseif ($Matches[2]) { [int]$Matches[2] } 
                     else { [int]$Matches[3] }
        
        # Si es menor a 30, asignar 30
        if ($sprintNum -lt 30) {
            $sprint = "30"
        } else {
            $sprint = $sprintNum.ToString()
        }
    }
    
    # Contar por sprint
    if ($sprintCounts.ContainsKey($sprint)) {
        $sprintCounts[$sprint]++
    }
    
    # Calcular días de resolución
    $diasResolucion = ""
    if ($resolved -ne "" -and $created -ne "") {
        try {
            $createdDate = [DateTime]::ParseExact($created, "dd/MMM/yy", [System.Globalization.CultureInfo]::CreateSpecificCulture("es-ES"))
            $resolvedDate = [DateTime]::ParseExact($resolved, "dd/MMM/yy", [System.Globalization.CultureInfo]::CreateSpecificCulture("es-ES"))
            $diasResolucion = ($resolvedDate - $createdDate).Days
            if ($diasResolucion -lt 0) { $diasResolucion = "" }
        } catch {
            # Si falla el parsing
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

# Exportar
$tickets | Export-Csv -Path "jira_tickets_complete.csv" -NoTypeInformation -Encoding UTF8
Write-Output "`nExportados $($tickets.Count) tickets"

Write-Output "`nDistribución por Sprint:"
Write-Output "Sprint 30: $($sprintCounts['30']) tickets"
Write-Output "Sprint 31: $($sprintCounts['31']) tickets"
Write-Output "Sprint 32: $($sprintCounts['32']) tickets"

Write-Output "`nPrimeros 3 tickets:"
$tickets | Select-Object -First 3 | Format-Table Clave, Prioridad, Estado_Normalizado, Sprint_Detectado -AutoSize
