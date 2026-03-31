# =============================================================
# update_sprint36.ps1
# Reemplaza los tickets de Sprint 36 en dashboard_data.js
# con los 98 reales de Jira (71 finalizados + arrastrados + pendientes)
# NO toca S30-S35
# Sprint 36 ID: 1196   Sprint 37 ID: 1229
# =============================================================

$config   = Get-Content "jira_config.json" | ConvertFrom-Json
$jiraUrl  = $config.jiraUrl
$email    = $config.email
$apiToken = $config.apiToken
$creds    = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${email}:${apiToken}"))
$headers  = @{ "Authorization" = "Basic $creds"; "Content-Type" = "application/json" }
$FIELDS   = "summary,status,issuetype,assignee,created,resolutiondate,updated,priority,customfield_10016"

function Format-Fecha {
    param([string]$iso)
    if (-not $iso -or $iso -eq "") { return "" }
    try {
        $d = [DateTime]::Parse($iso.Substring(0,10))
        $m = @{1="Ene";2="Feb";3="Mar";4="Abr";5="May";6="Jun";7="Jul";8="Ago";9="Sep";10="Oct";11="Nov";12="Dic"}
        return "$($d.Day.ToString('D2'))/$($m[$d.Month])/$($d.Year.ToString().Substring(2))"
    } catch { return "" }
}

function Normalize-Estado {
    param([string]$raw)
    switch ($raw) {
        "Finalizada"  { return "Finalizados" }
        "Done"        { return "Finalizados" }
        "Closed"      { return "Finalizados" }
        "Resolved"    { return "Finalizados" }
        "To Do"       { return "Tareas por hacer" }
        "Backlog"     { return "Tareas por hacer" }
        default       { return $raw }
    }
}

# -----------------------------------------------------------
# 1. Obtener todos los tickets de S36 y S37 de Jira
# -----------------------------------------------------------
Write-Host "`n=== Obteniendo Sprint 36 de Jira ===" -ForegroundColor Yellow
$s36 = @(); $startAt = 0
do {
    $r = Invoke-RestMethod -Uri "$jiraUrl/rest/agile/1.0/sprint/1196/issue?startAt=$startAt&maxResults=100&fields=$FIELDS" -Headers $headers
    $s36 += $r.issues; $startAt += $r.issues.Count
    Write-Host "  S36: $($s36.Count) / $($r.total)"
} while ($s36.Count -lt $r.total)

Write-Host "=== Obteniendo Sprint 37 (para detectar arrastrados) ===" -ForegroundColor Yellow
$s37 = @(); $startAt = 0
do {
    $r = Invoke-RestMethod -Uri "$jiraUrl/rest/agile/1.0/sprint/1229/issue?startAt=$startAt&maxResults=100&fields=summary" -Headers $headers
    $s37 += $r.issues; $startAt += $r.issues.Count
    Write-Host "  S37: $($s37.Count) / $($r.total)"
} while ($s37.Count -lt $r.total)

$keys37 = $s37 | Select-Object -ExpandProperty key

# Resumen
$fin    = $s36 | Where-Object { $_.fields.status.name -eq "Finalizada" }
$arr    = $s36 | Where-Object { $keys37 -contains $_.key -and $_.fields.status.name -ne "Finalizada" }
$otros  = $s36 | Where-Object { $keys37 -notcontains $_.key -and $_.fields.status.name -ne "Finalizada" }
Write-Host "`nS36 Finalizados : $($fin.Count)"
Write-Host "S36 Arrastrados a S37: $($arr.Count)"
Write-Host "S36 Sin finalizar (no en S37): $($otros.Count)"

# -----------------------------------------------------------
# 2. Generar lineas JS para S36
# -----------------------------------------------------------
Write-Host "`n=== Generando lineas JS ===" -ForegroundColor Yellow
$lineas36 = @()
foreach ($t in $s36) {
    $key      = $t.key
    $summary  = ($t.fields.summary -replace '"', "'") -replace '\\', '\\'
    $tipo     = $t.fields.issuetype.name
    $rawSt    = $t.fields.status.name
    # Estado: Arrastrado si paso a S37 y no esta finalizado; sino normalizar
    if ($keys37 -contains $key -and $rawSt -ne "Finalizada") {
        $stNorm = "Arrastrado"
    } else {
        $stNorm = Normalize-Estado $rawSt
    }
    $asignado  = if ($t.fields.assignee) { $t.fields.assignee.displayName } else { "Sin asignar" }
    $prioridad = if ($t.fields.priority) { $t.fields.priority.name } else { "Medium" }
    $creada    = Format-Fecha $t.fields.created
    $resuelta  = if ($t.fields.resolutiondate) { Format-Fecha $t.fields.resolutiondate } else { "" }
    $updated   = Format-Fecha $t.fields.updated
    $sp        = if ($t.fields.customfield_10016) { $t.fields.customfield_10016.ToString() } else { "" }
    $dias = ""
    if ($resuelta -ne "" -and $t.fields.created -and $t.fields.resolutiondate) {
        try {
            $c2 = [DateTime]::Parse($t.fields.created.Substring(0,10))
            $r2 = [DateTime]::Parse($t.fields.resolutiondate.Substring(0,10))
            $dias = [Math]::Max(0, ($r2 - $c2).Days).ToString()
        } catch {}
    }
    $desv = ""
    if ($dias -ne "" -and $sp -ne "") {
        try { $desv = ([double]$dias - [double]$sp).ToString() } catch {}
    }
    $lineas36 += "  {clave: `"$key`", tipoIncidencia: `"$tipo`", resumen: `"$summary`", asignado: `"$asignado`", prioridad: `"$prioridad`", estado: `"$stNorm`", estadoNormalizado: `"$stNorm`", creada: `"$creada`", actualizada: `"$updated`", resuelta: `"$resuelta`", sprint: `"36`", sprints: `"36`", diasResolucionReal: `"$dias`", storyPointEstimate: `"$sp`", desviacion: `"$desv`"},"
}
Write-Host "Generadas $($lineas36.Count) entradas para S36"

# -----------------------------------------------------------
# 3. Leer dashboard_data.js y reemplazar bloque S36
# -----------------------------------------------------------
Write-Host "`n=== Actualizando dashboard_data.js ===" -ForegroundColor Yellow
$content = Get-Content "dashboard_data.js" -Raw -Encoding UTF8

# Contar tickets S36 actuales
$count36antes = ([regex]::Matches($content, 'sprint:\s*"36"')).Count
Write-Host "Tickets S36 en archivo actualmente: $count36antes"

# Eliminar todas las lineas que tengan sprint:"36"
# Cada linea del array tiene el formato: "  {..., sprint: "36", ...},"
$content = $content -replace '(?m)^\s*\{[^}]*sprint:\s*"36"[^}]*\},?\r?\n', ''
$count36despues = ([regex]::Matches($content, 'sprint:\s*"36"')).Count
Write-Host "Tickets S36 tras eliminar: $count36despues (debe ser 0)"

# Insertar nuevas lineas S36 antes del cierre ]; del array
# Buscar la ultima entrada (sprint 35) y agregar S36 despues
$s36Block = $lineas36 -join "`n"
# Quitar coma final de la ultima linea S36 (se repondra al insertar antes del cierre)
$content = $content -replace '(\}),?\s*(\n\s*\];\s*)$', ('$1,' + "`n" + $s36Block + "`n];")

# Verificar
$count36final = ([regex]::Matches($content, 'sprint:\s*"36"')).Count
Write-Host "Tickets S36 en archivo final: $count36final (esperado: $($lineas36.Count))"

# Guardar
$content | Out-File "dashboard_data.js" -Encoding UTF8 -NoNewline
Write-Host "`ndashboard_data.js actualizado correctamente." -ForegroundColor Green

# Resumen final
$totalFinal = ([regex]::Matches((Get-Content "dashboard_data.js" -Raw), 'clave:\s*"IMS-')).Count
Write-Host "Total tickets en archivo: $totalFinal"
Write-Host "`nS36: $($fin.Count) Finalizados | $($arr.Count) Arrastrados | $($otros.Count) pendientes"
