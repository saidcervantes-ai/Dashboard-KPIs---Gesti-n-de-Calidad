# Descubrir proyectos disponibles en Jira

Write-Host ""
Write-Host "Descubriendo proyectos en Jira..." -ForegroundColor Cyan
Write-Host ""

$config = Get-Content "jira_config.json" -Raw | ConvertFrom-Json

$base64AuthInfo = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$($config.email):$($config.apiToken)"))
$headers = @{
    "Authorization" = "Basic $base64AuthInfo"
    "Content-Type" = "application/json"
}

# Listar proyectos
Write-Host "Obteniendo lista de proyectos..." -ForegroundColor Yellow
try {
    $projects = Invoke-RestMethod -Uri "$($config.jiraUrl)/rest/api/3/project" -Headers $headers -Method Get
    
    Write-Host "OK - Proyectos encontrados: $($projects.Count)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Proyectos disponibles:" -ForegroundColor Cyan
    Write-Host "=====================" -ForegroundColor Cyan
    
    foreach ($project in $projects) {
        Write-Host ""
        Write-Host "  Clave: $($project.key)" -ForegroundColor Yellow
        Write-Host "  Nombre: $($project.name)" -ForegroundColor Gray
        Write-Host "  Tipo: $($project.projectTypeKey)" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "=====================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Actualiza el campo 'projectKey' en jira_config.json con la clave correcta" -ForegroundColor Cyan
    
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
}
