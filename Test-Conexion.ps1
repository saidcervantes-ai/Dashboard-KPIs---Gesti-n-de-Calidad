# Test de conexion a Jira API
Write-Host ""
Write-Host "Probando conexion a Jira API..." -ForegroundColor Cyan
Write-Host ""

# Cargar configuracion
if (-not (Test-Path "jira_config.json")) {
    Write-Host "ERROR: No se encontro jira_config.json" -ForegroundColor Red
    exit 1
}

$config = Get-Content "jira_config.json" -Raw | ConvertFrom-Json
Write-Host "OK - Configuracion cargada" -ForegroundColor Green

# Crear headers
$base64AuthInfo = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$($config.email):$($config.apiToken)"))
$headers = @{
    "Authorization" = "Basic $base64AuthInfo"
    "Content-Type" = "application/json"
}

# Test 1: Autenticacion
Write-Host ""
Write-Host "Test 1: Verificando autenticacion..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$($config.jiraUrl)/rest/api/3/myself" -Headers $headers -Method Get
    Write-Host "OK - Autenticacion exitosa" -ForegroundColor Green
    Write-Host "  Usuario: $($response.displayName)" -ForegroundColor Gray
    Write-Host "  Email: $($response.emailAddress)" -ForegroundColor Gray
} catch {
    Write-Host "ERROR - Fallo la autenticacion" -ForegroundColor Red
    Write-Host "  $_" -ForegroundColor Gray
    exit 1
}

# Test 2: Consulta JQL
Write-Host ""
Write-Host "Test 2: Probando consulta JQL..." -ForegroundColor Yellow
Write-Host "  JQL: $($config.jql)" -ForegroundColor Gray

try {
    $searchUrl = "$($config.jiraUrl)/rest/api/3/search"
    $body = @{
        jql = $config.jql
        maxResults = 5
        fields = @("summary", "status", "assignee", "priority")
    } | ConvertTo-Json
    
    $searchResponse = Invoke-RestMethod -Uri $searchUrl -Headers $headers -Method Post -Body $body -ContentType "application/json"
    
    Write-Host "OK - Consulta JQL exitosa" -ForegroundColor Green
    Write-Host "  Total de issues encontrados: $($searchResponse.total)" -ForegroundColor Gray
    
    if ($searchResponse.total -gt 0) {
        Write-Host ""
        Write-Host "  Muestra de issues:" -ForegroundColor Gray
        foreach ($issue in $searchResponse.issues | Select-Object -First 3) {
            Write-Host "    - $($issue.key): $($issue.fields.summary)" -ForegroundColor Gray
        }
    }
    
} catch {
    Write-Host "ERROR - Fallo la consulta JQL" -ForegroundColor Red
    Write-Host "  $_" -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "==============================================================" -ForegroundColor Green
Write-Host "  Conexion verificada exitosamente!" -ForegroundColor Green
Write-Host "==============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Proximo paso: Ejecuta .\Connect-JiraAPI.ps1" -ForegroundColor Cyan
Write-Host ""
