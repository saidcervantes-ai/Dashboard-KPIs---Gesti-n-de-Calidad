# Extrae estimacionQA de tickets de los Sprints 39, 40 y 41 usando JQL
$config = Get-Content "jira_config.json" -Raw | ConvertFrom-Json
$creds = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$($config.email):$($config.apiToken)"))
$headers = @{
    Authorization = "Basic $creds"
    Accept = "application/json"
    "Content-Type" = "application/json"
}

$jql = 'project = IMS AND sprint in ("Sprint 39","Invox Medical Suite - Sprint 40","Invox Medical Suite - Sprint 41")'
$result = @{}
$nextPageToken = $null
$conValor = 0
$totalProc = 0
$searchUrl = "$($config.jiraUrl)/rest/api/3/search/jql"

do {
    $body = @{ jql = $jql; maxResults = 100; fields = @("customfield_10302","status","summary") }
    if ($nextPageToken) { $body.nextPageToken = $nextPageToken }
    $jsonBody = $body | ConvertTo-Json

    $resp = Invoke-RestMethod -Uri $searchUrl -Headers $headers -Method Post -Body $jsonBody
    foreach ($issue in $resp.issues) {
        $totalProc++
        $val = $issue.fields.customfield_10302
        if ($null -ne $val -and $val -ne "") {
            $result[$issue.key] = $val
            $conValor++
        }
    }
    $nextPageToken = if (-not $resp.isLast) { $resp.nextPageToken } else { $null }
    Write-Host "  Procesados: $totalProc (con valor: $conValor)" -ForegroundColor Gray
} while ($nextPageToken)

Write-Host "`nTickets en Sprints 39-41: $totalProc | Con estimacionQA: $conValor" -ForegroundColor Yellow
$result | ConvertTo-Json -Depth 3 | Out-File -FilePath "estimacionQA.json" -Encoding UTF8
Write-Host "Guardado estimacionQA.json" -ForegroundColor Green
