# Diagnostico completo de Jira

Write-Host ""
Write-Host "Diagnostico de API Jira..." -ForegroundColor Cyan
Write-Host ""

$config = Get-Content "jira_config.json" -Raw | ConvertFrom-Json

$base64AuthInfo = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$($config.email):$($config.apiToken)"))
$headers = @{
    "Authorization" = "Basic $base64AuthInfo"
    "Accept" = "application/json"
}

# Test 1: Info del servidor
Write-Host "1. Informacion del servidor Jira..." -ForegroundColor Yellow
try {
    $serverInfo = Invoke-RestMethod -Uri "$($config.jiraUrl)/rest/api/2/serverInfo" -Headers $headers -Method Get
    Write-Host "   OK - Jira $($serverInfo.version)" -ForegroundColor Green
    Write-Host "   Tipo: $($serverInfo.deploymentType)" -ForegroundColor Gray
} catch {
    Write-Host "   ERROR: $_" -ForegroundColor Red
}

# Test 2: Permisos del usuario
Write-Host ""
Write-Host "2. Permisos del usuario..." -ForegroundColor Yellow
try {
    $permissions = Invoke-RestMethod -Uri "$($config.jiraUrl)/rest/api/2/mypermissions" -Headers $headers -Method Get
    Write-Host "   OK - Permisos obtenidos" -ForegroundColor Green
} catch {
    Write-Host "   ERROR: $_" -ForegroundColor Red
}

# Test 3: Acceso al proyecto
Write-Host ""
Write-Host "3. Acceso al proyecto IMS..." -ForegroundColor Yellow
try {
    $project = Invoke-RestMethod -Uri "$($config.jiraUrl)/rest/api/2/project/IMS" -Headers $headers -Method Get
    Write-Host "   OK - Proyecto accesible" -ForegroundColor Green
    Write-Host "   Nombre: $($project.name)" -ForegroundColor Gray
    Write-Host "   Lead: $($project.lead.displayName)" -ForegroundColor Gray
} catch {
    Write-Host "   ERROR: $_" -ForegroundColor Red
}

# Test 4: Intentar obtener un issue especifico
Write-Host ""
Write-Host "4. Buscando primer issue del proyecto..." -ForegroundColor Yellow
try {
    # Intentar con browse
    $response = Invoke-WebRequest -Uri "$($config.jiraUrl)/browse/IMS-1" -Headers $headers -Method Get -UseBasicParsing
    Write-Host "   OK - Issue IMS-1 existe" -ForegroundColor Green
} catch {
    Write-Host "   No se pudo acceder a IMS-1" -ForegroundColor Gray
}

# Test 5: Probar endpoint de busqueda sin JQL
Write-Host ""
Write-Host "5. Probando endpoint search con GET..." -ForegroundColor Yellow
try {
    $searchUrl = "$($config.jiraUrl)/rest/api/2/search?jql=project=IMS&maxResults=1"
    $result = Invoke-RestMethod -Uri $searchUrl -Headers $headers -Method Get
    Write-Host "   OK - Search GET funciona!" -ForegroundColor Green
    Write-Host "   Total issues: $($result.total)" -ForegroundColor Gray
} catch {
    Write-Host "   ERROR: $_" -ForegroundColor Red
    Write-Host "   Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Gray
}

Write-Host ""
