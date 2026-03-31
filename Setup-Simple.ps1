# Script de configuración manual simplificado

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     Configuración Jira API - Dashboard KPIs               ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "Voy a crear el archivo de configuración paso a paso...`n" -ForegroundColor Gray

# Solicitar datos
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "PASO 1: URL de Jira" -ForegroundColor Yellow
Write-Host "Ejemplo: https://tu-empresa.atlassian.net" -ForegroundColor Gray
$jiraUrl = Read-Host "URL de tu Jira"

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "PASO 2: Email" -ForegroundColor Yellow
Write-Host "Email de tu cuenta de Atlassian" -ForegroundColor Gray
$email = Read-Host "Email"

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "PASO 3: API Token" -ForegroundColor Yellow
Write-Host "Pega el token que copiaste de Atlassian" -ForegroundColor Gray
$apiToken = Read-Host "API Token"

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "PASO 4: Clave del Proyecto" -ForegroundColor Yellow
Write-Host "Ejemplo: IMS, PROJ, etc." -ForegroundColor Gray
Write-Host "Presiona Enter para usar IMS por defecto" -ForegroundColor Gray
$projectKey = Read-Host "Clave del proyecto"
if (-not $projectKey) { $projectKey = "IMS" }

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "PASO 5: Sprints" -ForegroundColor Yellow
Write-Host "Numeros de sprint separados por coma" -ForegroundColor Gray
Write-Host "Ejemplo: 30,31,32,33,34,35" -ForegroundColor Gray
Write-Host "Presiona Enter para usar 30-36 por defecto" -ForegroundColor Gray
$sprintsInput = Read-Host "Sprints"

if ($sprintsInput) {
    $sprints = $sprintsInput -split ',' | ForEach-Object { $_.Trim() }
} else {
    $sprints = @("30", "31", "32", "33", "34", "35", "36")
}

# Construir JQL
$sprintNames = $sprints | ForEach-Object { "'Sprint $_'" }
$sprintList = $sprintNames -join ', '
$jql = "project = $projectKey AND Sprint in ($sprintList) ORDER BY created DESC"

# Crear configuración
$config = @{
    jiraUrl = $jiraUrl
    email = $email
    apiToken = $apiToken
    projectKey = $projectKey
    jql = $jql
    maxResults = 1000
}

# Guardar
$config | ConvertTo-Json -Depth 10 | Out-File -FilePath "jira_config.json" -Encoding UTF8

Write-Host "`n✅ Configuración guardada en jira_config.json" -ForegroundColor Green
Write-Host "`n⚠️  IMPORTANTE: No subas este archivo a repositorios públicos" -ForegroundColor Yellow
Write-Host "`n📚 Próximo paso: Ejecuta .\Test-JiraConnection.ps1`n" -ForegroundColor Cyan
