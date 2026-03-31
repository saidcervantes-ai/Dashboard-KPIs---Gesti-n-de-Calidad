# Configuracion Jira API - Version Simple
# Sin caracteres especiales para evitar problemas de encoding

Write-Host ""
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "    Configuracion Jira API - Dashboard KPIs                  " -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Creando archivo de configuracion paso a paso..." -ForegroundColor Gray
Write-Host ""

# Solicitar datos
Write-Host "--------------------------------------------------------------" -ForegroundColor Gray
Write-Host "PASO 1: URL de Jira" -ForegroundColor Yellow
Write-Host "Ejemplo: https://tu-empresa.atlassian.net" -ForegroundColor Gray
$jiraUrl = Read-Host "URL de tu Jira"

Write-Host ""
Write-Host "--------------------------------------------------------------" -ForegroundColor Gray
Write-Host "PASO 2: Email" -ForegroundColor Yellow
Write-Host "Email de tu cuenta de Atlassian" -ForegroundColor Gray
$email = Read-Host "Email"

Write-Host ""
Write-Host "--------------------------------------------------------------" -ForegroundColor Gray
Write-Host "PASO 3: API Token" -ForegroundColor Yellow
Write-Host "Pega el token que copiaste de Atlassian" -ForegroundColor Gray
$apiToken = Read-Host "API Token"

Write-Host ""
Write-Host "--------------------------------------------------------------" -ForegroundColor Gray
Write-Host "PASO 4: Clave del Proyecto" -ForegroundColor Yellow
Write-Host "Ejemplo: IMS, PROJ, etc." -ForegroundColor Gray
Write-Host "Presiona Enter para usar IMS por defecto" -ForegroundColor Gray
$projectKey = Read-Host "Clave del proyecto"
if ([string]::IsNullOrWhiteSpace($projectKey)) { 
    $projectKey = "IMS" 
    Write-Host "Usando: IMS" -ForegroundColor Gray
}

Write-Host ""
Write-Host "--------------------------------------------------------------" -ForegroundColor Gray
Write-Host "PASO 5: Sprints" -ForegroundColor Yellow
Write-Host "Numeros de sprint separados por coma" -ForegroundColor Gray
Write-Host "Ejemplo: 30,31,32,33,34,35" -ForegroundColor Gray
Write-Host "Presiona Enter para usar 30-36 por defecto" -ForegroundColor Gray
$sprintsInput = Read-Host "Sprints"

if ([string]::IsNullOrWhiteSpace($sprintsInput)) {
    $sprints = @("30", "31", "32", "33", "34", "35", "36")
    Write-Host "Usando: 30-36" -ForegroundColor Gray
} else {
    $sprints = $sprintsInput -split ',' | ForEach-Object { $_.Trim() }
}

# Construir JQL
$sprintNames = $sprints | ForEach-Object { "'Sprint $_'" }
$sprintList = $sprintNames -join ', '
$jql = "project = $projectKey AND Sprint in ($sprintList) ORDER BY created DESC"

# Crear configuracion
$config = @{
    jiraUrl = $jiraUrl
    email = $email
    apiToken = $apiToken
    projectKey = $projectKey
    jql = $jql
    maxResults = 1000
}

# Guardar
try {
    $config | ConvertTo-Json -Depth 10 | Out-File -FilePath "jira_config.json" -Encoding UTF8
    Write-Host ""
    Write-Host "OK - Configuracion guardada en jira_config.json" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANTE: No subas este archivo a repositorios publicos" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Proximo paso: Ejecuta .\Test-JiraConnection.ps1" -ForegroundColor Cyan
    Write-Host ""
} catch {
    Write-Host ""
    Write-Host "ERROR al guardar configuracion: $_" -ForegroundColor Red
    Write-Host ""
}
