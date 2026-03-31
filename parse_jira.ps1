# Script para parsear el HTML de Jira y extraer los datos
$htmlPath = 'c:\Users\scervantes\Downloads\Jira .html'
$html = Get-Content $htmlPath -Raw -Encoding UTF8

# Extraer los datos usando regex más específico
$ticketData = @()

# Buscar todos los issue-keys
$issueKeys = [regex]::Matches($html, 'data-issue-key="([^"]+)"')

Write-Output "Claves de issues encontradas: $($issueKeys.Count)"

# Dividir el HTML en bloques por cada issue
$issueBlocks = $html -split 'data-issue-key='

foreach ($block in $issueBlocks) {
    if ($block -match '^"([^"]+)"') {
        $key = $matches[1]
        
        # Extraer resumen - buscar en td class="summary"
        $summary = ''
        if ($block -match '<td class="summary">\s*<p>\s*([^<]+)') {
            $summary = $matches[1].Trim()
        }
        elseif ($block -match 'class="summary"[^>]*>([^<]+)<') {
            $summary = $matches[1].Trim()
        }
        
        # Extraer asignado
        $assignee = 'sin asignar'
        if ($block -match '<em>sin asignar</em>') {
            $assignee = 'sin asignar'
        }
        elseif ($block -match 'class="assignee"[^>]*>([^<]+)<') {
            $assignee = $matches[1].Trim()
        }
        
        # Extraer prioridad basado en imágenes
        $priority = 'Medium'
        if ($block -match 'Highest') { $priority = 'Highest' }
        elseif ($block -match 'Priority: High') { $priority = 'High' }
        elseif ($block -match 'Priority: Low') { $priority = 'Low' }
        
        # Extraer estado
        $status = 'Tareas por hacer'
        if ($block -match 'status-badge[^>]*>([^<]+)<') {
            $statusText = $matches[1].Trim()
            if ($statusText -match 'Done|Hecho|Finalizado') {
                $status = 'Finalizados'
            }
            elseif ($statusText -match 'In Progress|En curso') {
                $status = 'En curso'
            }
        }
        
        # Extraer fechas
        $dates = [regex]::Matches($block, '(\d{1,2}/\w{3}/\d{2,4})')
        $created = if ($dates.Count -ge 1) { $dates[0].Value } else { '' }
        $updated = if ($dates.Count -ge 2) { $dates[1].Value } else { '' }
        $resolved = if ($dates.Count -ge 3) { $dates[2].Value } else { '' }
        
        if ($key) {
            $ticketData += [PSCustomObject]@{
                Key = $key
                Summary = $summary
                Assignee = $assignee
                Priority = $priority
                Status = $status
                Created = $created
                Updated = $updated
                Resolved = $resolved
            }
        }
    }
}

# Exportar a CSV para análisis
$ticketData | Export-Csv -Path "jira_tickets.csv" -NoTypeInformation -Encoding UTF8

Write-Output "Procesados $($ticketData.Count) tickets"
Write-Output "Archivo CSV generado: jira_tickets.csv"

# Mostrar resumen
$statusCount = $ticketData | Group-Object Status | Select-Object Name, Count
Write-Output "`nResumen por Estado:"
$statusCount | Format-Table -AutoSize

$priorityCount = $ticketData | Group-Object Priority | Select-Object Name, Count
Write-Output "`nResumen por Prioridad:"
$priorityCount | Format-Table -AutoSize
