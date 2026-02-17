# Test: POST /rest/api/3/search/jql

# Cargar configuracion
$config = Get-Content "jira_config.json" -Raw | ConvertFrom-Json

# Crear headers de autenticacion
$base64 = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$($config.email):$($config.apiToken)"))
$headers = @{
    "Authorization" = "Basic $base64"
    "Content-Type" = "application/json"
    "Accept" = "application/json"
}

# Hacer primera peticion
$url = "$($config.jiraUrl)/rest/api/3/search/jql"

$body = @{
    jql = $config.jql
    maxResults = 10
    fields = @("summary", "status", "created", "assignee")
} | ConvertTo-Json

Write-Host "`nConsultando: $url" -ForegroundColor Cyan
Write-Host "JQL: $($config.jql)`n" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Post -Body $body -ContentType "application/json"
    
    Write-Host "Resultado:" -ForegroundColor Green
    Write-Host "  Issues recibidos: $($response.issues.Count)" -ForegroundColor White
    Write-Host "  Es ultima pagina: $($response.isLast)" -ForegroundColor White
    if ($response.nextPageToken) {
        Write-Host "  Token siguiente: $($response.nextPageToken)" -ForegroundColor Yellow
    }
    
    Write-Host "`nPrimeros 3 issues:" -ForegroundColor Cyan
    for ($i = 0; $i -lt [Math]::Min(3, $response.issues.Count); $i++) {
        $issue = $response.issues[$i]
        Write-Host "  $($issue.key): $($issue.fields.summary)" -ForegroundColor White
        Write-Host "    Estado: $($issue.fields.status.name)" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Detalles: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}
