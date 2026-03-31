# Test de conexión a JIRA API
# Verificar credenciales y conectividad

$config = Get-Content "jira_config.json" | ConvertFrom-Json
$jiraUrl = $config.jiraUrl
$email = $config.email
$apiToken = $config.apiToken

Write-Host "TEST DE CONEXION A JIRA API" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Informacion de Conexion:" -ForegroundColor Yellow
Write-Host "  URL: $jiraUrl" -ForegroundColor Gray
Write-Host "  Email: $email" -ForegroundColor Gray
Write-Host ""

# Crear credenciales en Base64
$credentials = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${email}:${apiToken}"))
Write-Host "OK: Credenciales Base64 generadas" -ForegroundColor Green

# Headers para API v3
$headers = @{
    "Authorization" = "Basic $credentials"
    "Content-Type" = "application/json"
}

Write-Host ""
Write-Host "TEST 1: Conectar al endpoint /rest/api/3/myself" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Gray

$testUrl = "$jiraUrl/rest/api/3/myself"

try {
    Write-Host "  Intentando conectar a: $testUrl" -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri $testUrl -Headers $headers -Method Get -TimeoutSec 10
    
    Write-Host "  OK: CONEXION EXITOSA" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Usuario conectado:" -ForegroundColor White
    Write-Host "    - Name: $($response.displayName)" -ForegroundColor Green
    Write-Host "    - Email: $($response.emailAddress)" -ForegroundColor Green
    Write-Host ""
    
} catch {
    Write-Host "  ERROR: No se pudo conectar" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    exit 1
}

# TEST 2: Buscar tickets del proyecto IMS
Write-Host "TEST 2: Intentar acceso directo a tickets" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Gray

$testTickets = @("IMS-1078", "IMS-984", "IMS-777")

foreach ($ticketKey in $testTickets) {
    $issueUrl = "$jiraUrl/rest/api/2/issue/$ticketKey"
    
    try {
        $issue = Invoke-RestMethod -Uri $issueUrl -Headers $headers -Method Get -TimeoutSec 10
        Write-Host "  OK: $ticketKey obtenido" -ForegroundColor Green
        Write-Host "      Estado: $($issue.fields.status.name)" -ForegroundColor Gray
    } catch {
        Write-Host "  ERROR: No se pudo obtener $ticketKey" -ForegroundColor Red
        Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# TEST 3: Obtener changelog de IMS-1078
Write-Host "TEST 3: Obtener changelog del ticket IMS-1078" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Gray

$issueUrl = "$jiraUrl/rest/api/2/issue/IMS-1078"

Write-Host "  Obteniendo..." -ForegroundColor Yellow
Write-Host ""

try {
    $issueDetail = Invoke-RestMethod -Uri $issueUrl -Headers $headers -Method Get -TimeoutSec 10
    
    Write-Host "  OK: CHANGELOG OBTENIDO" -ForegroundColor Green
    Write-Host "  Ticket: $($issueDetail.key)" -ForegroundColor Cyan
    Write-Host "  Estado actual: $($issueDetail.fields.status.name)" -ForegroundColor Gray
    Write-Host ""
    
    if ($issueDetail.changelog -and $issueDetail.changelog.histories) {
        Write-Host "  Transiciones de estado encontradas:" -ForegroundColor White
        Write-Host ""
        
        $changeCount = 0
        foreach ($history in $issueDetail.changelog.histories) {
            foreach ($item in $history.items) {
                if ($item.field -eq "status") {
                    $changeCount++
                    Write-Host "    [$changeCount] $($history.created)"
                    Write-Host "        $($item.fromString) -> $($item.toString)"
                }
            }
        }
        
        Write-Host ""
        Write-Host "  Total de transiciones: $changeCount" -ForegroundColor Green
    }
    
} catch {
    Write-Host "  ERROR: No se pudo obtener changelog" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Green
Write-Host "EXITO: Conexion a JIRA API funcionando correctamente" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Green

