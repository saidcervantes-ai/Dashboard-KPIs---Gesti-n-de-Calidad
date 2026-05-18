# Descubre el board del proyecto IMS y lista todos los sprints con fechas
$config = Get-Content "jira_config.json" | ConvertFrom-Json
$creds = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$($config.email):$($config.apiToken)"))
$headers = @{ Authorization = "Basic $creds"; "Content-Type" = "application/json" }

# 1. Buscar boards
Write-Host "Buscando boards del proyecto IMS..." -ForegroundColor Cyan
$boards = Invoke-RestMethod -Uri "$($config.jiraUrl)/rest/agile/1.0/board?projectKeyOrId=IMS" -Headers $headers
$boards.values | Format-Table id, name, type

if (-not $boards.values) { Write-Host "No se encontraron boards" -ForegroundColor Red; exit }
$boardId = $boards.values[0].id
Write-Host "`nUsando boardId = $boardId" -ForegroundColor Green

# 2. Listar sprints con fechas
$allSprints = @()
$startAt = 0
do {
    $resp = Invoke-RestMethod -Uri "$($config.jiraUrl)/rest/agile/1.0/board/$boardId/sprint?startAt=$startAt&maxResults=50" -Headers $headers
    $allSprints += $resp.values
    $startAt += 50
} while (-not $resp.isLast)

Write-Host "`nTotal sprints: $($allSprints.Count)`n" -ForegroundColor Cyan

# 3. Mostrar y exportar
$sprintList = $allSprints | ForEach-Object {
    $num = if ($_.name -match '\d+') { [int]$Matches[0] } else { 0 }
    [PSCustomObject]@{
        Numero = $num
        Id = $_.id
        Nombre = $_.name
        Estado = $_.state
        Inicio = if ($_.startDate) { ([DateTime]::Parse($_.startDate)).ToString("yyyy-MM-dd") } else { "" }
        Fin = if ($_.endDate) { ([DateTime]::Parse($_.endDate)).ToString("yyyy-MM-dd") } else { "" }
        Cierre = if ($_.completeDate) { ([DateTime]::Parse($_.completeDate)).ToString("yyyy-MM-dd HH:mm") } else { "" }
    }
} | Sort-Object Numero

$sprintList | Format-Table -AutoSize
$sprintList | Export-Csv "jira_sprints.csv" -NoTypeInformation -Encoding UTF8
Write-Host "Guardado en jira_sprints.csv" -ForegroundColor Green
