# Test con endpoint /rest/api/3/search/jql

Write-Host ""
Write-Host "Probando endpoint alternativo: /rest/api/3/search/jql" -ForegroundColor Cyan
Write-Host ""

$config = Get-Content "jira_config.json" -Raw | ConvertFrom-Json

$base64AuthInfo = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$($config.email):$($config.apiToken)"))
$headers = @{
    "Authorization" = "Basic $base64AuthInfo"
    "Content-Type" = "application/json"
    "Accept" = "application/json"
}

# Probar con GET usando query parameters
Write-Host "Metodo 1: GET con parametros..." -ForegroundColor Yellow
try {
    $jql = [System.Web.HttpUtility]::UrlEncode("project = IMS")
    $searchUrl = "$($config.jiraUrl)/rest/api/3/search/jql?jql=$jql&maxResults=10"
    
    $result = Invoke-RestMethod -Uri $searchUrl -Headers $headers -Method Get
    
    Write-Host "OK - Funciona con GET!" -ForegroundColor Green
    Write-Host "  Total de issues: $($result.total)" -ForegroundColor Gray
    
    if ($result.issues) {
        Write-Host ""
        Write-Host "  Primeros issues:" -ForegroundColor Gray
        foreach ($issue in $result.issues | Select-Object -First 5) {
            Write-Host "    - $($issue.key): $($issue.fields.summary)" -ForegroundColor Gray
        }
    }
    
    Write-Host ""
    Write-Host "==============================================================" -ForegroundColor Green
    Write-Host "  EXITO! Este endpoint funciona correctamente" -ForegroundColor Green
    Write-Host "==============================================================" -ForegroundColor Green
    Write-Host ""
    
} catch {
    Write-Host "  ERROR con GET: $_" -ForegroundColor Red
    
    # Probar con POST
    Write-Host ""
    Write-Host "Metodo 2: POST con body..." -ForegroundColor Yellow
    try {
        $searchUrl = "$($config.jiraUrl)/rest/api/3/search/jql"
        $body = @{
            jql = "project = IMS"
            maxResults = 10
        } | ConvertTo-Json
        
        $result = Invoke-RestMethod -Uri $searchUrl -Headers $headers -Method Post -Body $body
        
        Write-Host "OK - Funciona con POST!" -ForegroundColor Green
        Write-Host "  Total de issues: $($result.total)" -ForegroundColor Gray
        
        if ($result.issues) {
            Write-Host ""
            Write-Host "  Primeros issues:" -ForegroundColor Gray
            foreach ($issue in $result.issues | Select-Object -First 5) {
                Write-Host "    - $($issue.key): $($issue.fields.summary)" -ForegroundColor Gray
            }
        }
        
        Write-Host ""
        Write-Host "==============================================================" -ForegroundColor Green
        Write-Host "  EXITO! Este endpoint funciona correctamente" -ForegroundColor Green
        Write-Host "==============================================================" -ForegroundColor Green
        Write-Host ""
        
    } catch {
        Write-Host "  ERROR con POST: $_" -ForegroundColor Red
    }
}
