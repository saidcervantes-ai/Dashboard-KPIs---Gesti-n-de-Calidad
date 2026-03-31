# Script para inspeccionar la estructura del changelog en JIRA

$config = Get-Content "jira_config.json" | ConvertFrom-Json
$jiraUrl = $config.jiraUrl
$email = $config.email
$apiToken = $config.apiToken

$credentials = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${email}:${apiToken}"))

$headers = @{
    "Authorization" = "Basic $credentials"
    "Content-Type" = "application/json"
}

Write-Host "Inspeccionando estructura de changelog para IMS-1078..." -ForegroundColor Cyan
Write-Host ""

try {
    $issue = Invoke-RestMethod -Uri "$jiraUrl/rest/api/2/issue/IMS-1078?expand=changelog" -Headers $headers -TimeoutSec 10
    
    Write-Host "1. Existe changelog? $($null -ne $issue.changelog)" -ForegroundColor Yellow
    
    if ($issue.changelog) {
        Write-Host "2. Tipo de changelog: $($issue.changelog.GetType().Name)" -ForegroundColor Yellow
        Write-Host "3. Propiedades: $($issue.changelog.PSObject.Properties.Name -join ', ')" -ForegroundColor Yellow
        Write-Host "4. Existe histories? $($null -ne $issue.changelog.histories)" -ForegroundColor Yellow
        
        if ($issue.changelog.histories) {
            Write-Host "5. Cantidad de historias: $($issue.changelog.histories.Count)" -ForegroundColor Yellow
            Write-Host "6. Tipo de histories: $($issue.changelog.histories.GetType().Name)" -ForegroundColor Yellow
            
            if ($issue.changelog.histories.Count -gt 0) {
                Write-Host ""
                Write-Host "Primera historia:" -ForegroundColor Green
                $h1 = $issue.changelog.histories[0]
                Write-Host "  - created: $($h1.created)" -ForegroundColor White
                Write-Host "  - Propiedades: $($h1.PSObject.Properties.Name -join ', ')" -ForegroundColor White
                Write-Host "  - items count: $($h1.items.Count)" -ForegroundColor White
                
                if ($h1.items.Count -gt 0) {
                    Write-Host ""
                    Write-Host "Primer item:" -ForegroundColor Green
                    $i1 = $h1.items[0]
                    Write-Host "  - field: $($i1.field)" -ForegroundColor White
                    Write-Host "  - fieldtype: $($i1.fieldtype)" -ForegroundColor White
                    Write-Host "  - from: $($i1.from)" -ForegroundColor White
                    Write-Host "  - fromString: $($i1.fromString)" -ForegroundColor White
                    Write-Host "  - to: $($i1.to)" -ForegroundColor White
                    Write-Host "  - toString: $($i1.toString)" -ForegroundColor White
                    Write-Host "  - Propiedades: $($i1.PSObject.Properties.Name -join ', ')" -ForegroundColor White
                    
                    Write-Host ""
                    Write-Host "Buscando items con field='status'..." -ForegroundColor Cyan
                    $statusChanges = $issue.changelog.histories | ForEach-Object { 
                        $_.items | Where-Object { $_.field -eq 'status' }
                    }
                    Write-Host "Encontrados $($statusChanges.Count) cambios de status" -ForegroundColor Green
                    
                    if ($statusChanges.Count -gt 0) {
                        foreach ($idx in 0..([Math]::Min($statusChanges.Count-1, 3))) {
                            Write-Host ""
                            Write-Host "Cambio $($idx + 1):" -ForegroundColor Yellow
                            Write-Host "  from: $($statusChanges[$idx].fromString) -> to: $($statusChanges[$idx].toString)" -ForegroundColor White
                        }
                    }
                }
            }
        }
    }
    
    Write-Host ""
    Write-Host "Estado actual: $($issue.fields.status.name)" -ForegroundColor Cyan
    Write-Host "Created: $($issue.fields.created)" -ForegroundColor Cyan
    
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}
