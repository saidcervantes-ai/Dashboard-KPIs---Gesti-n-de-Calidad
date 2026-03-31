# Script: Extrae datos de Sprint 35 y 36 para actualizar dashboard
# Fecha: 2026-03-03

$config = Get-Content "jira_config.json" | ConvertFrom-Json
$base64 = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$($config.email):$($config.apiToken)"))
$headers = @{ "Authorization" = "Basic $base64"; "Content-Type" = "application/json" }

$FIELDS = "summary,status,issuetype,assignee,created,resolutiondate,updated,priority,customfield_10016,customfield_10020"

Write-Host "Extrayendo Sprint 35 (ID 1163)..."
$r35 = Invoke-RestMethod -Uri "https://vocali.atlassian.net/rest/agile/1.0/board/75/sprint/1163/issue?maxResults=100&fields=$FIELDS" -Headers $headers

Write-Host "Extrayendo Sprint 36 (ID 1196)..."
$r36 = Invoke-RestMethod -Uri "https://vocali.atlassian.net/rest/agile/1.0/board/75/sprint/1196/issue?maxResults=100&fields=$FIELDS" -Headers $headers

$keys35 = $r35.issues | Select-Object -ExpandProperty key
$keys36 = $r36.issues | Select-Object -ExpandProperty key
$inBoth = $keys35 | Where-Object { $keys36 -contains $_ }
$onlyS35 = $keys35 | Where-Object { $keys36 -notcontains $_ }
$onlyS36 = $keys36 | Where-Object { $keys35 -notcontains $_ }

Write-Host "`n=== RESUMEN ==="
Write-Host "Sprint 35 total: $($r35.total)"
Write-Host "Sprint 36 total: $($r36.total)"
Write-Host "Movidos S35->S36: $($inBoth.Count)"
Write-Host "Completados/cancelados solo en S35: $($onlyS35.Count)"
Write-Host "Nuevos en S36 (no estaban en S35): $($onlyS36.Count)"

Write-Host "`n=== Estados Sprint 35 (al cierre) ==="
$r35.issues | Group-Object { $_.fields.status.name } | Select-Object Name, Count | Sort-Object Count -Descending | Format-Table -AutoSize

Write-Host "`n=== Estado actual (S36) de tickets movidos desde S35 ==="
$movidos = $r36.issues | Where-Object { $inBoth -contains $_.key }
$movidos | Group-Object { $_.fields.status.name } | Select-Object Name, Count | Sort-Object Count -Descending | Format-Table -AutoSize

# Helper: normalizar estado
function NormalizarEstado($status) {
    switch ($status) {
        "Finalizada"       { return "Finalizados" }
        "To Do"            { return "Tareas por hacer" }
        "In Process"       { return "En curso" }
        "IN TEST DEV"      { return "IN TEST DEV" }
        "Blocked"          { return "Blocked" }
        "CODE REVIEW"      { return "CODE REVIEW" }
        "IN TEST QA"       { return "IN TEST QA" }
        "CHECKED"          { return "CHECKED" }
        "Done"             { return "Finalizados" }
        "Closed"           { return "Finalizados" }
        default            { return $status }
    }
}

# Helper: formato fecha DD/Mon/YY
function FormatFecha($isoDate) {
    if (-not $isoDate -or $isoDate -eq "") { return "" }
    try {
        $d = [DateTime]::Parse($isoDate.Substring(0,10))
        $meses = @{1="Ene";2="Feb";3="Mar";4="Abr";5="May";6="Jun";7="Jul";8="Ago";9="Sep";10="Oct";11="Nov";12="Dic"}
        return "$($d.Day.ToString('D2'))/$($meses[$d.Month])/$($d.Year.ToString().Substring(2))"
    } catch { return "" }
}

# Helper: calcular dias resolucion
function DiasResolucion($created, $resolved) {
    if (-not $resolved -or $resolved -eq "") { return "" }
    try {
        $c = [DateTime]::Parse($created.Substring(0,10))
        $r = [DateTime]::Parse($resolved.Substring(0,10))
        return [Math]::Max(0, ($r - $c).Days).ToString()
    } catch { return "" }
}

# Construir mapa de sprint por ticket (ultimo sprint asignado)
# Un ticket puede tener sprint 35, 36, o ambos
function GetSprintLabel($key) {
    if ($inBoth -contains $key) { return "35,36" }  # movido
    if ($keys35 -contains $key) { return "35" }
    if ($keys36 -contains $key) { return "36" }
    return ""
}

# --- Generar lineas JS para Sprint 35 ---
# Todos los tickets del Sprint 35 con su estado al cierre del sprint
$lineas35 = @()
foreach ($t in $r35.issues) {
    $key = $t.key
    $summary = ($t.fields.summary -replace '"', "'") -replace '\\', '\\'
    $tipo = $t.fields.issuetype.name
    $rawStatus = $t.fields.status.name
    $estadoNorm = NormalizarEstado $rawStatus

    # Si el ticket se movio a S36, marcarlo como "Arrastrado" en S35
    $estadoS35 = if ($inBoth -contains $key) { "Arrastrado" } else { $estadoNorm }

    $assignee = if ($t.fields.assignee) { $t.fields.assignee.displayName } else { "Sin asignar" }
    $priority = $t.fields.priority.name
    $created = FormatFecha $t.fields.created
    $resolved = if ($t.fields.resolutiondate) { FormatFecha $t.fields.resolutiondate } else { "" }
    $updated = FormatFecha $t.fields.updated
    $sp = if ($t.fields.customfield_10016) { $t.fields.customfield_10016.ToString() } else { "" }

    # Dias resolucion
    $dias = if ($resolved -ne "" -and ($inBoth -notcontains $key)) { DiasResolucion $t.fields.created $t.fields.resolutiondate } else { "" }

    # Desviacion (dias - sp)
    $desv = if ($dias -ne "" -and $sp -ne "") {
        try { ([double]$dias - [double]$sp).ToString() } catch { "" }
    } else { "" }

    $sprintLabel = "35"

    $lineas35 += "  {clave: `"$key`", tipoIncidencia: `"$tipo`", resumen: `"$summary`", asignado: `"$assignee`", prioridad: `"$priority`", estado: `"$estadoS35`", estadoNormalizado: `"$estadoS35`", creada: `"$created`", actualizada: `"$updated`", resuelta: `"$resolved`", sprint: `"$sprintLabel`", sprints: `"$sprintLabel`", diasResolucionReal: `"$dias`", storyPointEstimate: `"$sp`", desviacion: `"$desv`"},"
}

Write-Host "`n=== Primeras 5 lineas generadas para S35 ==="
$lineas35 | Select-Object -First 5

# --- Generar lineas JS para Sprint 36 (SOLO los nuevos, no los movidos de S35) ---
$lineas36 = @()
foreach ($t in $r36.issues) {
    $key = $t.key
    # Los movidos de S35 ya se incluyeron arriba con sprint "35"
    # Aqui los incluimos con sprint "36" para que aparezcan en el sprint actual
    $summary = ($t.fields.summary -replace '"', "'") -replace '\\', '\\'
    $tipo = $t.fields.issuetype.name
    $rawStatus = $t.fields.status.name
    $estadoNorm = NormalizarEstado $rawStatus

    $assignee = if ($t.fields.assignee) { $t.fields.assignee.displayName } else { "Sin asignar" }
    $priority = $t.fields.priority.name
    $created = FormatFecha $t.fields.created
    $resolved = if ($t.fields.resolutiondate) { FormatFecha $t.fields.resolutiondate } else { "" }
    $updated = FormatFecha $t.fields.updated
    $sp = if ($t.fields.customfield_10016) { $t.fields.customfield_10016.ToString() } else { "" }
    $dias = if ($resolved -ne "") { DiasResolucion $t.fields.created $t.fields.resolutiondate } else { "" }
    $desv = if ($dias -ne "" -and $sp -ne "") {
        try { ([double]$dias - [double]$sp).ToString() } catch { "" }
    } else { "" }

    # Para tickets movidos, indicar ambos sprints
    $sprintLabel = if ($inBoth -contains $key) { "36" } else { "36" }

    $lineas36 += "  {clave: `"$key`", tipoIncidencia: `"$tipo`", resumen: `"$summary`", asignado: `"$assignee`", prioridad: `"$priority`", estado: `"$estadoNorm`", estadoNormalizado: `"$estadoNorm`", creada: `"$created`", actualizada: `"$updated`", resuelta: `"$resolved`", sprint: `"$sprintLabel`", sprints: `"$sprintLabel`", diasResolucionReal: `"$dias`", storyPointEstimate: `"$sp`", desviacion: `"$desv`"},"
}

# Estadisticas finales Sprint 35
Write-Host "`n=== KPIs Sprint 35 ==="
$s35tickets = $r35.issues
$s35total = $s35tickets.Count
$s35finalizados = ($s35tickets | Where-Object { $_.fields.status.name -eq "Finalizada" }).Count
$s35arrastrados = $inBoth.Count
$s35bugs = ($s35tickets | Where-Object { $_.fields.issuetype.name -eq "Error" }).Count
$s35bugsFinalizados = ($s35tickets | Where-Object { $_.fields.issuetype.name -eq "Error" -and $_.fields.status.name -eq "Finalizada" }).Count
$s35spTotal = ($s35tickets | Where-Object { $_.fields.customfield_10016 } | Measure-Object { $_.fields.customfield_10016 } -Sum).Sum
$s35spFinalizado = ($s35tickets | Where-Object { $_.fields.status.name -eq "Finalizada" -and $_.fields.customfield_10016 } | Measure-Object { $_.fields.customfield_10016 } -Sum).Sum

Write-Host "Total tickets S35: $s35total"
Write-Host "Finalizados: $s35finalizados"
Write-Host "Arrastrados a S36: $s35arrastrados"
Write-Host "Bugs total: $s35bugs"
Write-Host "Bugs resueltos: $s35bugsFinalizados"
Write-Host "Story Points totales: $s35spTotal"
Write-Host "Story Points completados: $s35spFinalizado"
$velocidad = if ($s35total -gt 0) { [Math]::Round($s35finalizados * 100 / $s35total, 1) } else { 0 }
Write-Host "Tasa completado: $velocidad %"

# Guardar los datos
$lineas35 | Out-File "data_sprint35_generated.txt" -Encoding UTF8
$lineas36 | Out-File "data_sprint36_generated.txt" -Encoding UTF8
Write-Host "`nArchivos guardados: data_sprint35_generated.txt y data_sprint36_generated.txt"
