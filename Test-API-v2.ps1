# Test con API v2
Write-Host ""
Write-Host "Probando con Jira API v2..." -ForegroundColor Cyan
Write-Host ""

$config = Get-Content "jira_config.json" -Raw | ConvertFrom-Json

$base64AuthInfo = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$($config.email):$($config.apiToken)"))
$headers = @{
    "Authorization" = "Basic $base64AuthInfo"
    "Content-Type" = "application/json"
}

# Probar con API v2
Write-Host "Intentando busqueda con API v2..." -ForegroundColor Yellow

try {
    $searchUrl = "$($config.jiraUrl)/rest/api/2/search"
    $body = @{
        jql = "project = IMS"
        maxResults = 10
    } | ConvertTo-Json
    
    $searchResponse = Invoke-RestMethod -Uri $searchUrl -Headers $headers -Method Post -Body $body -ContentType "application/json"
    
    Write-Host "OK - Consulta exitosa!" -ForegroundColor Green
    Write-Host "  Total de issues: $($searchResponse.total)" -ForegroundColor Gray
    
    if ($searchResponse.total -gt 0) {
        Write-Host ""
        Write-Host "  Primeros issues:" -ForegroundColor Gray
        foreach ($issue in $searchResponse.issues | Select-Object -First 5) {
            Write-Host "    - $($issue.key): $($issue.fields.summary)" -ForegroundColor Gray
        }
    }
    
    Write-Host ""
    Write-Host "==============================================================" -ForegroundColor Green
    Write-Host "  Conexion verificada! API v2 funciona correctamente" -ForegroundColor Green
    Write-Host "==============================================================" -ForegroundColor Green
    Write-Host ""
    
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        $errorDetail = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($errorDetail) {
            Write-Host "  Detalle: $($errorDetail.errorMessages -join ', ')" -ForegroundColor Gray
        }
    }
}
