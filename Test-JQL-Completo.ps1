# Test completo con endpoint correcto

Write-Host ""
Write-Host "Probando /rest/api/3/search/jql con campos..." -ForegroundColor Cyan
Write-Host ""

$config = Get-Content "jira_config.json" -Raw | ConvertFrom-Json

$base64AuthInfo = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$($config.email):$($config.apiToken)"))
$headers = @{
    "Authorization" = "Basic $base64AuthInfo"
    "Content-Type" = "application/json"
    "Accept" = "application/json"
}

try {
    Add-Type -AssemblyName System.Web
    
    $jql = [System.Web.HttpUtility]::UrlEncode("project = IMS ORDER BY created DESC")
    $fields = [System.Web.HttpUtility]::UrlEncode("summary,status,assignee,priority,created,updated,resolutiondate,issuetype")
    
    $searchUrl = "$($config.jiraUrl)/rest/api/3/search/jql?jql=$jql&maxResults=20&fields=$fields"
    
    Write-Host "Consultando Jira..." -ForegroundColor Yellow
    
    $result = Invoke-RestMethod -Uri $searchUrl -Headers $headers -Method Get
    
    Write-Host "OK - Datos obtenidos exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "==============================================================" -ForegroundColor Cyan
    Write-Host "  Total de issues en el proyecto: $($result.total)" -ForegroundColor White
    Write-Host "==============================================================" -ForegroundColor Cyan
    Write-Host ""
    
    if ($result.issues -and $result.issues.Count -gt 0) {
        Write-Host "Primeros 10 issues encontrados:" -ForegroundColor Yellow
        Write-Host ""
        
        $counter = 1
        foreach ($issue in $result.issues | Select-Object -First 10) {
            Write-Host "  $counter. [$($issue.key)]" -ForegroundColor Cyan
            Write-Host "     Resumen: $($issue.fields.summary)" -ForegroundColor White
            Write-Host "     Estado: $($issue.fields.status.name)" -ForegroundColor Gray
            Write-Host "     Tipo: $($issue.fields.issuetype.name)" -ForegroundColor Gray
            
            if ($issue.fields.assignee) {
                Write-Host "     Asignado: $($issue.fields.assignee.displayName)" -ForegroundColor Gray
            } else {
                Write-Host "     Asignado: Sin asignar" -ForegroundColor Gray
            }
            
            Write-Host ""
            $counter++
        }
        
        Write-Host "==============================================================" -ForegroundColor Green
        Write-Host "  EXITO! La API funciona correctamente" -ForegroundColor Green
        Write-Host "==============================================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Proximo paso: Ejecutar .\Connect-JiraAPI.ps1 para extraer todos los datos" -ForegroundColor Cyan
        Write-Host ""
        
    } else {
        Write-Host "No se encontraron issues" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
    Write-Host ""
    if ($_.Exception.Response) {
        Write-Host "  Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Gray
    }
}
