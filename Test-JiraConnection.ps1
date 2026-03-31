# ============================================================================
# Script: Test-JiraConnection.ps1
# Descripción: Prueba rápida de conexión a Jira API
# Uso: .\Test-JiraConnection.ps1
# ============================================================================

param(
    [string]$ConfigFile = "jira_config.json"
)

Write-Host "`n🔍 Probando conexión a Jira API...`n" -ForegroundColor Cyan

# Verificar archivo de configuración
if (-not (Test-Path $ConfigFile)) {
    Write-Host "❌ No se encontró $ConfigFile" -ForegroundColor Red
    Write-Host "   Ejecuta primero: .\Setup-JiraConnection.ps1`n" -ForegroundColor Yellow
    exit 1
}

# Cargar configuración
try {
    $config = Get-Content $ConfigFile -Raw | ConvertFrom-Json
    Write-Host "✓ Configuración cargada" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al leer configuración: $_" -ForegroundColor Red
    exit 1
}

# Crear headers de autenticación
$base64AuthInfo = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$($config.email):$($config.apiToken)"))
$headers = @{
    "Authorization" = "Basic $base64AuthInfo"
    "Content-Type" = "application/json"
}

# Test 1: Verificar autenticación
Write-Host "`n📋 Test 1: Autenticación" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$($config.jiraUrl)/rest/api/3/myself" -Headers $headers -Method Get
    Write-Host "✅ Autenticación exitosa" -ForegroundColor Green
    Write-Host "   Usuario: $($response.displayName)" -ForegroundColor Gray
    Write-Host "   Email: $($response.emailAddress)" -ForegroundColor Gray
    Write-Host "   Account ID: $($response.accountId)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error de autenticación" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Gray
    exit 1
}

# Test 2: Verificar acceso al proyecto
Write-Host "`n📋 Test 2: Acceso al Proyecto" -ForegroundColor Yellow
try {
    $projectUrl = "$($config.jiraUrl)/rest/api/3/project/$($config.projectKey)"
    $project = Invoke-RestMethod -Uri $projectUrl -Headers $headers -Method Get
    Write-Host "✅ Proyecto accesible" -ForegroundColor Green
    Write-Host "   Nombre: $($project.name)" -ForegroundColor Gray
    Write-Host "   Clave: $($project.key)" -ForegroundColor Gray
    Write-Host "   Lead: $($project.lead.displayName)" -ForegroundColor Gray
} catch {
    Write-Host "⚠️  Advertencia: No se pudo acceder al proyecto $($config.projectKey)" -ForegroundColor Yellow
    Write-Host "   Esto puede ser normal si no tienes permisos específicos" -ForegroundColor Gray
}

# Test 3: Ejecutar query JQL
Write-Host "`n📋 Test 3: Consulta JQL" -ForegroundColor Yellow
Write-Host "   JQL: $($config.jql)" -ForegroundColor Gray
try {
    $searchUrl = "$($config.jiraUrl)/rest/api/3/search"
    $body = @{
        jql = $config.jql
        maxResults = 5
        fields = @("summary", "status", "assignee", "priority")
    } | ConvertTo-Json
    
    $searchResponse = Invoke-RestMethod -Uri $searchUrl -Headers $headers -Method Post -Body $body -ContentType "application/json"
    
    Write-Host "✅ Consulta JQL exitosa" -ForegroundColor Green
    Write-Host "   Total de issues: $($searchResponse.total)" -ForegroundColor Gray
    
    if ($searchResponse.total -gt 0) {
        Write-Host "`n   Muestra de issues encontrados:" -ForegroundColor Gray
        foreach ($issue in $searchResponse.issues | Select-Object -First 3) {
            Write-Host "   • $($issue.key): $($issue.fields.summary)" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ⚠️  No se encontraron issues con el JQL especificado" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Error en consulta JQL" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Gray
    
    if ($_.ErrorDetails.Message) {
        $errorDetail = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "   Detalle: $($errorDetail.errorMessages -join ', ')" -ForegroundColor Gray
    }
    exit 1
}

# Test 4: Verificar campos personalizados
Write-Host "`n📋 Test 4: Campos Disponibles" -ForegroundColor Yellow
try {
    $fieldsUrl = "$($config.jiraUrl)/rest/api/3/field"
    $fields = Invoke-RestMethod -Uri $fieldsUrl -Headers $headers -Method Get
    
    # Buscar campos de Sprint y Story Points
    $sprintField = $fields | Where-Object { $_.name -like "*Sprint*" } | Select-Object -First 1
    $storyPointsField = $fields | Where-Object { $_.name -like "*Story*Point*" -or $_.name -like "*Estimate*" } | Select-Object -First 1
    
    Write-Host "✅ Campos verificados" -ForegroundColor Green
    
    if ($sprintField) {
        Write-Host "   Sprint Field: $($sprintField.name) ($($sprintField.id))" -ForegroundColor Gray
    } else {
        Write-Host "   ⚠️  No se encontró campo Sprint" -ForegroundColor Yellow
    }
    
    if ($storyPointsField) {
        Write-Host "   Story Points: $($storyPointsField.name) ($($storyPointsField.id))" -ForegroundColor Gray
    } else {
        Write-Host "   ⚠️  No se encontró campo Story Points" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "⚠️  No se pudieron verificar campos personalizados" -ForegroundColor Yellow
}

# Resumen final
Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                  ✅ Conexión Verificada                     ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host "`n📚 Todo listo para extraer datos:" -ForegroundColor Cyan
Write-Host "   Ejecuta: .\Connect-JiraAPI.ps1`n" -ForegroundColor White
