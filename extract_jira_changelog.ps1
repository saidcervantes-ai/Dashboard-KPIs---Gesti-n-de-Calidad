# Script para extraer historial de transiciones de estado de Jira (API v3)
# Calcula días que cada ticket pasó en cada estado
# Actualizado para usar API v3 compatible

# Configuración
$config = Get-Content "jira_config.json" | ConvertFrom-Json
$jiraUrl = $config.jiraUrl
$email = $config.email
$apiToken = $config.apiToken
$jqlQuery = "project = IMS ORDER BY created DESC"
$outputCsv = "jira_changelog_tiempos_estado.csv"

# Credenciales Base64
$credentials = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${email}:${apiToken}"))

# Headers para la API
$headers = @{
    "Authorization" = "Basic $credentials"
    "Content-Type" = "application/json"
}

Write-Host "Buscando tickets con JQL: $jqlQuery" -ForegroundColor Cyan
Write-Host ""

# Función para obtener tickets usando API v2
function Get-JiraIssues {
    param($jql, $startAt = 0, $maxResults = 100)
    
    $url = $jiraUrl + '/rest/api/2/search'
    $body = @{
        jql = $jql
        startAt = $startAt
        maxResults = $maxResults
        fields = @("summary", "status", "created", "resolutiondate", "assignee", "customfield_10020")
    }
    
    $bodyJson = $body | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Post -Body $bodyJson -ContentType "application/json"
        return $response
    } catch {
        Write-Host "Error al conectar con Jira: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "StatusCode: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
        exit 1
    }
}

# Obtener todos los tickets
$allIssues = @()
$startAt = 0
$total = 0
$page = 1
$pageSize = 50

do {
    Write-Host "Obteniendo página $page..." -ForegroundColor Yellow
    $response = Get-JiraIssues -jql $jqlQuery -startAt $startAt -maxResults $pageSize
    $allIssues += $response.issues
    $total = $response.total
    $startAt += $pageSize
    Write-Host "Obtenidos $($allIssues.Count) de $total tickets" -ForegroundColor Cyan
    $page++
} while ($allIssues.Count -lt $total)

Write-Host "Total de tickets encontrados: $($allIssues.Count)" -ForegroundColor Green
Write-Host ""

# Procesar cada ticket
$resultados = @()

foreach ($issue in $allIssues) {
    $key = $issue.key
    $summary = $issue.fields.summary
    $estadoActual = $issue.fields.status.name
    $creada = $issue.fields.created
    $resuelta = $issue.fields.resolutiondate
    
    Write-Host "Procesando $key..." -ForegroundColor Cyan
    
    # Obtener changelog del ticket individualmente usando API v2
    $issueUrl = "$jiraUrl/rest/api/2/issue/$key"
    try {
        $issueDetail = Invoke-RestMethod -Uri $issueUrl -Headers $headers -Method Get
    } catch {
        Write-Host "  Error obteniendo changelog de $key" -ForegroundColor Red
        continue
    }
    
    # Obtener historial de cambios de estado
    $historial = @()
    $fechaInicial = [DateTime]::Parse($creada)
    
    # Buscar cambios de estado en el changelog
    if ($issueDetail.changelog -and $issueDetail.changelog.histories) {
        foreach ($history in $issueDetail.changelog.histories) {
            foreach ($item in $history.items) {
                if ($item.field -eq "status") {
                    $fechaCambio = [DateTime]::Parse($history.created)
                    $historial += [PSCustomObject]@{
                        Fecha = $fechaCambio
                        EstadoAnterior = $item.fromString
                        EstadoNuevo = $item.toString
                    }
                }
            }
        }
    }
    
    # Rate limiting: 200ms entre peticiones
    Start-Sleep -Milliseconds 200
    
    # Ordenar historial por fecha
    $historial = $historial | Sort-Object Fecha
    
    if ($historial.Count -eq 0) {
        # El ticket nunca cambió de estado
        $fechaFin = if ($resuelta) { [DateTime]::Parse($resuelta) } else { [DateTime]::Now }
        $diasEnEstado = ($fechaFin - $fechaInicial).TotalDays
        
        $resultados += [PSCustomObject]@{
            Clave = $key
            Resumen = $summary
            Estado = $estadoActual
            DiasEnEstado = [math]::Round($diasEnEstado, 1)
            FechaInicio = $fechaInicial.ToString("dd/MM/yyyy HH:mm")
            FechaFin = if ($resuelta) { ([DateTime]::Parse($resuelta)).ToString("dd/MM/yyyy HH:mm") } else { "En curso" }
        }
    } else {
        # Calcular tiempo en el primer estado
        $primerCambio = $historial[0]
        $diasPrimerEstado = ($primerCambio.Fecha - $fechaInicial).TotalDays
        
        $resultados += [PSCustomObject]@{
            Clave = $key
            Resumen = $summary
            Estado = $primerCambio.EstadoAnterior
            DiasEnEstado = [math]::Round($diasPrimerEstado, 1)
            FechaInicio = $fechaInicial.ToString("dd/MM/yyyy HH:mm")
            FechaFin = $primerCambio.Fecha.ToString("dd/MM/yyyy HH:mm")
        }
        
        # Calcular tiempo entre cada transición
        for ($i = 0; $i -lt ($historial.Count - 1); $i++) {
            $cambioActual = $historial[$i]
            $cambioSiguiente = $historial[$i + 1]
            
            $diasEnEstado = ($cambioSiguiente.Fecha - $cambioActual.Fecha).TotalDays
            
            $resultados += [PSCustomObject]@{
                Clave = $key
                Resumen = $summary
                Estado = $cambioActual.EstadoNuevo
                DiasEnEstado = [math]::Round($diasEnEstado, 1)
                FechaInicio = $cambioActual.Fecha.ToString("dd/MM/yyyy HH:mm")
                FechaFin = $cambioSiguiente.Fecha.ToString("dd/MM/yyyy HH:mm")
            }
        }
        
        # Calcular tiempo en el estado actual
        $ultimoCambio = $historial[-1]
        $fechaFin = if ($resuelta) { [DateTime]::Parse($resuelta) } else { [DateTime]::Now }
        $diasEnEstadoActual = ($fechaFin - $ultimoCambio.Fecha).TotalDays
        
        $resultados += [PSCustomObject]@{
            Clave = $key
            Resumen = $summary
            Estado = $estadoActual
            DiasEnEstado = [math]::Round($diasEnEstadoActual, 1)
            FechaInicio = $ultimoCambio.Fecha.ToString("dd/MM/yyyy HH:mm")
            FechaFin = if ($resuelta) { ([DateTime]::Parse($resuelta)).ToString("dd/MM/yyyy HH:mm") } else { "En curso" }
        }
    }
}

# Exportar resultados a CSV
$resultados | Export-Csv -Path $outputCsv -NoTypeInformation -Encoding UTF8

Write-Host ""
Write-Host "Archivo generado: $outputCsv" -ForegroundColor Green
Write-Host "Total de registros (transiciones): $($resultados.Count)" -ForegroundColor Green
Write-Host ""

# Mostrar resumen por estado
Write-Host "Resumen promedio de dias por estado:" -ForegroundColor Cyan
$resumenEstados = $resultados | Group-Object Estado | ForEach-Object {
    [PSCustomObject]@{
        Estado = $_.Name
        TotalTransiciones = $_.Count
        PromedoDias = [math]::Round(($_.Group | Measure-Object DiasEnEstado -Average).Average, 1)
        TotalDias = [math]::Round(($_.Group | Measure-Object DiasEnEstado -Sum).Sum, 1)
    }
} | Sort-Object PromedoDias -Descending

$resumenEstados | Format-Table -AutoSize
