# ============================================================================
# Script: Setup-JiraConnection.ps1
# Descripción: Asistente de configuración para conexión a Jira API
# Autor: Dashboard KPIs - Gestión de Calidad
# ============================================================================

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     Asistente de Configuración - Jira API Connection      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Verificar si ya existe configuración
$configFile = "jira_config.json"
if (Test-Path $configFile) {
    Write-Host "⚠️  Ya existe un archivo de configuración: $configFile" -ForegroundColor Yellow
    $overwrite = Read-Host "¿Deseas sobrescribirlo? (S/N)"
    if ($overwrite -ne "S" -and $overwrite -ne "s") {
        Write-Host "`n✓ Configuración existente preservada" -ForegroundColor Green
        exit 0
    }
}

Write-Host "`n📝 Vamos a configurar tu conexión a Jira paso a paso...`n" -ForegroundColor Cyan

# Paso 1: URL de Jira
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "PASO 1: URL de Jira" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "Ejemplo: https://tu-empresa.atlassian.net" -ForegroundColor Gray
$jiraUrl = Read-Host "URL de tu instancia de Jira"

if (-not $jiraUrl -or -not $jiraUrl.StartsWith("http")) {
    Write-Host "❌ Error: URL inválida" -ForegroundColor Red
    exit 1
}

# Paso 2: Email
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "PASO 2: Email de Jira" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "El email de tu cuenta de Atlassian" -ForegroundColor Gray
$email = Read-Host "Email"

if (-not $email -or $email -notmatch "@") {
    Write-Host "❌ Error: Email inválido" -ForegroundColor Red
    exit 1
}

# Paso 3: API Token
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "PASO 3: API Token" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "Si no tienes un API Token, créalo aquí:" -ForegroundColor Gray
Write-Host "https://id.atlassian.com/manage-profile/security/api-tokens" -ForegroundColor Cyan
Write-Host "`n¿Deseas abrir la página ahora? (S/N)" -ForegroundColor Yellow
$openUrl = Read-Host
if ($openUrl -eq "S" -or $openUrl -eq "s") {
    Start-Process "https://id.atlassian.com/manage-profile/security/api-tokens"
    Write-Host "Esperando... Presiona ENTER cuando tengas el token" -ForegroundColor Gray
    Read-Host
}

$apiToken = Read-Host "API Token" -AsSecureString
$apiTokenPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($apiToken))

if (-not $apiTokenPlain) {
    Write-Host "❌ Error: Token vacío" -ForegroundColor Red
    exit 1
}

# Paso 4: Clave del Proyecto
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "PASO 4: Clave del Proyecto" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "Ejemplo: IMS, PROJ, etc." -ForegroundColor Gray
$projectKey = Read-Host "Clave del proyecto"

if (-not $projectKey) {
    $projectKey = "IMS"
    Write-Host "Usando valor por defecto: IMS" -ForegroundColor Gray
}

# Paso 5: Sprints
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "PASO 5: Sprints a Consultar" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "Ingresa los números de sprint separados por coma" -ForegroundColor Gray
Write-Host "Ejemplo: 30,31,32,33,34,35" -ForegroundColor Gray
$sprintsInput = Read-Host "Sprints"

$sprints = if ($sprintsInput) {
    $sprintsInput -split ',' | ForEach-Object { $_.Trim() }
} else {
    @("30", "31", "32", "33", "34", "35", "36")
}

# Construir JQL
$sprintNames = $sprints | ForEach-Object { "'Sprint $_'" }
$sprintList = $sprintNames -join ', '
$jql = "project = $projectKey AND Sprint in ($sprintList) ORDER BY created DESC"

# Crear objeto de configuración
$config = [PSCustomObject]@{
    jiraUrl = $jiraUrl
    email = $email
    apiToken = $apiTokenPlain
    projectKey = $projectKey
    jql = $jql
    maxResults = 1000
}

# Guardar configuración
try {
    $config | ConvertTo-Json -Depth 10 | Out-File -FilePath $configFile -Encoding UTF8
    Write-Host "`n✅ Configuración guardada exitosamente!" -ForegroundColor Green
    Write-Host "   Archivo: $configFile" -ForegroundColor Gray
} catch {
    Write-Host "`n❌ Error al guardar configuración: $_" -ForegroundColor Red
    exit 1
}

# Probar conexión
Write-Host "`n🔍 ¿Deseas probar la conexión ahora? (S/N)" -ForegroundColor Yellow
$testConnection = Read-Host

if ($testConnection -eq "S" -or $testConnection -eq "s") {
    Write-Host "`n🔄 Probando conexión a Jira..." -ForegroundColor Cyan
    
    try {
        # Crear headers
        $base64AuthInfo = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${email}:${apiTokenPlain}"))
        $headers = @{
            "Authorization" = "Basic $base64AuthInfo"
            "Content-Type" = "application/json"
        }
        
        # Probar conexión
        $testUrl = "$jiraUrl/rest/api/3/myself"
        $response = Invoke-RestMethod -Uri $testUrl -Headers $headers -Method Get
        
        Write-Host "✅ Conexión exitosa!" -ForegroundColor Green
        Write-Host "   Usuario: $($response.displayName)" -ForegroundColor Gray
        Write-Host "   Email: $($response.emailAddress)" -ForegroundColor Gray
        
        # Probar query
        Write-Host "`n🔍 Probando consulta JQL..." -ForegroundColor Cyan
        $searchUrl = "$jiraUrl/rest/api/3/search"
        $body = @{
            jql = $jql
            maxResults = 1
        } | ConvertTo-Json
        
        $searchResponse = Invoke-RestMethod -Uri $searchUrl -Headers $headers -Method Post -Body $body -ContentType "application/json"
        Write-Host "✅ Consulta JQL válida!" -ForegroundColor Green
        Write-Host "   Total de issues encontrados: $($searchResponse.total)" -ForegroundColor Gray
        
    } catch {
        Write-Host "❌ Error al conectar con Jira: $_" -ForegroundColor Red
        Write-Host "   Verifica tus credenciales y URL" -ForegroundColor Yellow
    }
}

# Mostrar próximos pasos
Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    ¡Configuración Lista!                   ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host "`n📚 Próximos pasos:" -ForegroundColor Cyan
Write-Host "   1. Ejecuta: .\Connect-JiraAPI.ps1" -ForegroundColor White
Write-Host "   2. Los datos se guardarán en: jira_tickets_api.csv" -ForegroundColor White
Write-Host "   3. Abre el dashboard: Dashboard_Dinamico_Editable.html" -ForegroundColor White

Write-Host "`n📖 Para más información: GUIA_API_JIRA.md" -ForegroundColor Gray
Write-Host "`n⚠️  IMPORTANTE: No subas jira_config.json a repositorios públicos`n" -ForegroundColor Yellow
