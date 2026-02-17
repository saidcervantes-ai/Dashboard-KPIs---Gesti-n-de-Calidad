# ============================================================================
# Script: Extraer-Datos-Jira.ps1
# Descripcion: Extrae datos completos de Jira usando API REST v3
# ============================================================================

param(
    [string]$ConfigFile = "jira_config.json",
    [string]$OutputFile = "jira_tickets_api.csv"
)

Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "  Extraccion de Datos de Jira API" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

# Cargar configuracion
Write-Host "Cargando configuracion..." -ForegroundColor Gray
$config = Get-Content $ConfigFile -Raw | ConvertFrom-Json

# Crear headers de autenticacion
$base64 = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$($config.email):$($config.apiToken)"))
$headers = @{
    "Authorization" = "Basic $base64"
    "Content-Type" = "application/json"
    "Accept" = "application/json"
}

Write-Host "Conectando a: $($config.jiraUrl)" -ForegroundColor Green
Write-Host "Proyecto: $($config.projectKey)" -ForegroundColor Green
Write-Host "JQL: $($config.jql)`n" -ForegroundColor Gray

# Variables de paginacion
$allIssues = @()
$nextPageToken = $null
$isLast = $false
$pageCount = 0
$url = "$($config.jiraUrl)/rest/api/3/search/jql"

# Extraer todos los issues con paginacion
do {
    $pageCount++
    
    $body = @{
        jql = $config.jql
        maxResults = 100
        fields = @(
            "summary",
            "issuetype",
            "status",
            "priority",
            "assignee",
            "reporter",
            "created",
            "updated",
            "resolutiondate",
            "resolution",
            "customfield_10020",
            "customfield_10016"
        )
    }
    
    if ($nextPageToken) {
        $body.nextPageToken = $nextPageToken
    }
    
    $jsonBody = $body | ConvertTo-Json
    
    try {
        Write-Host "Descargando pagina $pageCount..." -ForegroundColor Cyan
        $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Post -Body $jsonBody -ContentType "application/json"
        
        if ($response.issues) {
            $allIssues += $response.issues
            Write-Host "  Recibidos: $($response.issues.Count) issues (Total: $($allIssues.Count))" -ForegroundColor Green
        }
        
        $isLast = $response.isLast
        if (-not $isLast -and $response.nextPageToken) {
            $nextPageToken = $response.nextPageToken
        }
        
    } catch {
        Write-Host "ERROR: $_" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            Write-Host "Detalles: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
        exit 1
    }
    
} while (-not $isLast)

Write-Host "`nTotal de issues descargados: $($allIssues.Count)" -ForegroundColor Green

# Procesar y transformar datos
Write-Host "`nProcesando datos..." -ForegroundColor Cyan

$tickets = @()

foreach ($issue in $allIssues) {
    $fields = $issue.fields
    
    # Extraer datos basicos
    $key = $issue.key
    $summary = $fields.summary
    $type = $fields.issuetype.name
    $status = $fields.status.name
    $priority = if ($fields.priority) { $fields.priority.name } else { "Medium" }
    $assignee = if ($fields.assignee) { $fields.assignee.displayName } else { "Sin asignar" }
    $reporter = if ($fields.reporter) { $fields.reporter.displayName } else { "Desconocido" }
    
    # Fechas
    $created = if ($fields.created) { 
        ([DateTime]::Parse($fields.created)).ToString("dd/MMM/yy")
    } else { "" }
    
    $updated = if ($fields.updated) { 
        ([DateTime]::Parse($fields.updated)).ToString("dd/MMM/yy")
    } else { "" }
    
    $resolved = if ($fields.resolutiondate) { 
        ([DateTime]::Parse($fields.resolutiondate)).ToString("dd/MMM/yy")
    } else { "" }
    
    # Sprint - extraer numero
    $sprintNum = "30"
    if ($fields.customfield_10020) {
        $sprintText = if ($fields.customfield_10020 -is [array]) {
            $fields.customfield_10020[-1]
        } else {
            $fields.customfield_10020.ToString()
        }
        
        if ($sprintText -match 'Sprint[^\d]*(\d+)|sprint[^\d]*(\d+)') {
            $num = if ($Matches[1]) { [int]$Matches[1] } else { [int]$Matches[2] }
            if ($num -ge 30) { $sprintNum = $num.ToString() }
        }
    }
    
    # Story Points
    $storyPoints = if ($fields.customfield_10016) { $fields.customfield_10016 } else { "" }
    
    # Dias de resolucion
    $diasResolucion = ""
    if ($fields.resolutiondate -and $fields.created) {
        try {
            $createdDate = [DateTime]::Parse($fields.created)
            $resolvedDate = [DateTime]::Parse($fields.resolutiondate)
            $days = ($resolvedDate - $createdDate).Days
            if ($days -ge 0) { $diasResolucion = $days }
        } catch { }
    }
    
    # Normalizacion de estado
    $statusNorm = "Tareas por hacer"
    if ($status -match "Done|Cerrado|Resuelto|Closed|Resolved|Finalizada") {
        $statusNorm = "Finalizados"
    } elseif ($status -match "En curso|In Progress|Progreso|Process|TEST") {
        $statusNorm = "En curso"
    }
    
    # Resolucion
    $resolution = if ($fields.resolution) { $fields.resolution.name } else { "" }
    
    # Crear objeto ticket
    $ticket = [PSCustomObject]@{
        "Tipo de Incidencia" = $type
        "Clave de incidencia" = $key
        "Resumen" = $summary
        "Persona asignada" = $assignee
        "Reportador" = $reporter
        "Prioridad" = $priority
        "Estado" = $statusNorm
        "Estado Original" = $status
        "Resolucion" = $resolution
        "Creada" = $created
        "Actualizada" = $updated
        "Resuelta" = $resolved
        "Sprint" = "Invox Medical Suite-Sprint $sprintNum"
        "Sprint Numero" = $sprintNum
        "Dias Resolucion" = $diasResolucion
        "Story Points" = $storyPoints
    }
    
    $tickets += $ticket
}

# Exportar a CSV
Write-Host "Exportando a CSV..." -ForegroundColor Cyan
$tickets | Export-Csv -Path $OutputFile -NoTypeInformation -Encoding UTF8
Write-Host "Archivo creado: $OutputFile" -ForegroundColor Green

# Estadisticas
Write-Host "`n=== ESTADISTICAS ===" -ForegroundColor Cyan
Write-Host "Total de tickets: $($tickets.Count)" -ForegroundColor White

$sprintGroups = $tickets | Group-Object "Sprint Numero" | Sort-Object Name
Write-Host "`nPor Sprint:" -ForegroundColor Yellow
foreach ($g in $sprintGroups) {
    $pct = [math]::Round(($g.Count / $tickets.Count) * 100, 1)
    Write-Host "  Sprint $($g.Name): $($g.Count) tickets ($pct%)" -ForegroundColor White
}

$statusGroups = $tickets | Group-Object "Estado" | Sort-Object Count -Descending
Write-Host "`nPor Estado:" -ForegroundColor Yellow
foreach ($g in $statusGroups) {
    $pct = [math]::Round(($g.Count / $tickets.Count) * 100, 1)
    Write-Host "  $($g.Name): $($g.Count) tickets ($pct%)" -ForegroundColor White
}

$priorityGroups = $tickets | Group-Object "Prioridad" | Sort-Object Count -Descending
Write-Host "`nPor Prioridad:" -ForegroundColor Yellow
foreach ($g in $priorityGroups) {
    $pct = [math]::Round(($g.Count / $tickets.Count) * 100, 1)
    Write-Host "  $($g.Name): $($g.Count) tickets ($pct%)" -ForegroundColor White
}

Write-Host "`nPrimeros 10 tickets:" -ForegroundColor Yellow
$tickets | Select-Object -First 10 | Format-Table "Clave de incidencia", "Estado", "Prioridad", "Sprint Numero" -AutoSize

Write-Host "`nExtraccion completada exitosamente!`n" -ForegroundColor Green
