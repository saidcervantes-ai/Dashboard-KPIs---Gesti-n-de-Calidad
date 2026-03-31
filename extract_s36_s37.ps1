# =============================================================
# Extrae Sprint 36 (cerrado) + Sprint 37 (activo) de Jira
# Mantiene datos historicos de Sprint 35
# Genera: dashboard_data.js + dashboard_changelog_data.js
# IDs: S35=1163  S36=1196  S37=1229
# Fecha: 16/03/2026
# =============================================================

$config   = Get-Content "jira_config.json" | ConvertFrom-Json
$jiraUrl  = $config.jiraUrl
$email    = $config.email
$apiToken = $config.apiToken

$credentials = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${email}:${apiToken}"))
$headers = @{
    "Authorization" = "Basic $credentials"
    "Content-Type"  = "application/json"
}

$SPRINT_IDS = @{ "35" = 1163; "36" = 1196; "37" = 1229 }
$FIELDS = "summary,status,issuetype,assignee,created,resolutiondate,updated,priority,customfield_10016,customfield_10020"

# -----------------------------------------------------------
# Helpers
# -----------------------------------------------------------
function Get-BusinessDays {
    param([DateTime]$inicio, [DateTime]$fin)
    if ($fin -le $inicio) { return 0.0 }
    $totalMinutos = 0
    $current = $inicio
    while ($current -lt $fin) {
        $dow = $current.DayOfWeek
        if ($dow -ne [DayOfWeek]::Saturday -and $dow -ne [DayOfWeek]::Sunday) {
            $inicioLab = [DateTime]::new($current.Year, $current.Month, $current.Day, 9, 0, 0)
            $finLab    = [DateTime]::new($current.Year, $current.Month, $current.Day, 18, 0, 0)
            $desde = if ($current -gt $inicioLab) { $current } else { $inicioLab }
            $hasta = if ($fin -lt $finLab) { $fin } else { $finLab }
            if ($hasta -gt $desde) { $totalMinutos += ($hasta - $desde).TotalMinutes }
        }
        $current = [DateTime]::new($current.Year, $current.Month, $current.Day).AddDays(1)
    }
    return [math]::Round($totalMinutos / 540, 1)
}

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
        "Finalizada"      { return "Finalizados" }
        "Done"            { return "Finalizados" }
        "Closed"          { return "Finalizados" }
        "Resolved"        { return "Finalizados" }
        "To Do"           { return "Tareas por hacer" }
        "Backlog"         { return "Tareas por hacer" }
        "In Process"      { return "In Process" }
        "IN TEST DEV"     { return "IN TEST DEV" }
        "Blocked"         { return "Blocked" }
        "CODE REVIEW"     { return "CODE REVIEW" }
        "In Test"         { return "In Test" }
        "Test Issues"     { return "Test Issues" }
        default           { return $raw }
    }
}

function Get-SprintTickets {
    param([int]$sprintId, [string]$sprintLabel)
    $all = @(); $startAt = 0
    do {
        $url = "$jiraUrl/rest/agile/1.0/sprint/$sprintId/issue?startAt=$startAt&maxResults=100&fields=$FIELDS"
        try {
            $r = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
        } catch {
            Write-Host "  ERROR sprint $sprintLabel : $($_.Exception.Message)" -ForegroundColor Red; break
        }
        $all += $r.issues; $startAt += $r.issues.Count
        Write-Host "  Sprint $sprintLabel : $($all.Count) / $($r.total)" -ForegroundColor Cyan
    } while ($all.Count -lt $r.total)
    return $all
}

# -----------------------------------------------------------
# 1. Obtener tickets de cada sprint
# -----------------------------------------------------------
Write-Host "`n=== PASO 1: Obteniendo tickets de Jira ===" -ForegroundColor Yellow
$s35issues = Get-SprintTickets -sprintId 1163 -sprintLabel "35"
$s36issues = Get-SprintTickets -sprintId 1196 -sprintLabel "36"
$s37issues = Get-SprintTickets -sprintId 1229 -sprintLabel "37"

$keys35 = $s35issues | Select-Object -ExpandProperty key
$keys36 = $s36issues | Select-Object -ExpandProperty key
$keys37 = $s37issues | Select-Object -ExpandProperty key

# Tickets que pasaron de S36 a S37
$s36_to_s37 = $keys36 | Where-Object { $keys37 -contains $_ }
# Tickets que pasaron de S35 a S36 (ya estaban en dashboard_data.js)
$s35_to_s36 = $keys35 | Where-Object { $keys36 -contains $_ }

Write-Host "`n=== RESUMEN ===" -ForegroundColor Green
Write-Host "Sprint 35: $($s35issues.Count) tickets"
Write-Host "Sprint 36: $($s36issues.Count) tickets  (de S35 que continuaron: $($s35_to_s36.Count))"
Write-Host "Sprint 37: $($s37issues.Count) tickets  (de S36 que continuaron: $($s36_to_s37.Count))"

Write-Host "`n=== Estados Sprint 36 (al cierre) ===" -ForegroundColor Cyan
$s36issues | Group-Object { $_.fields.status.name } | Select-Object Name, Count | Sort-Object Count -Descending | Format-Table -AutoSize

Write-Host "=== Estados Sprint 37 (activo) ===" -ForegroundColor Cyan
$s37issues | Group-Object { $_.fields.status.name } | Select-Object Name, Count | Sort-Object Count -Descending | Format-Table -AutoSize

# -----------------------------------------------------------
# 2. Obtener changelog de todos los tickets S35+S36+S37
# -----------------------------------------------------------
Write-Host "`n=== PASO 2: Obteniendo changelogs ===" -ForegroundColor Yellow

# Combinar todos los tickets unicos para changelog
$allForChangelog = @{}
foreach ($t in ($s35issues + $s36issues + $s37issues)) {
    $allForChangelog[$t.key] = $t
}
Write-Host "Tickets únicos para changelog: $($allForChangelog.Count)"

$changelogMap = @{}
$i = 0
foreach ($key in ($allForChangelog.Keys | Sort-Object)) {
    $i++
    $issue    = $allForChangelog[$key]
    $creada   = $issue.fields.created
    $resuelta = $issue.fields.resolutiondate
    $estado   = $issue.fields.status.name

    Write-Host "[$i/$($allForChangelog.Count)] $key ..." -NoNewline

    try {
        $detail = Invoke-RestMethod -Uri "$jiraUrl/rest/api/3/issue/$key`?expand=changelog&fields=summary,status,created,resolutiondate" -Headers $headers -Method Get
    } catch {
        Write-Host " ERROR" -ForegroundColor Red; continue
    }
    Start-Sleep -Milliseconds 150

    $transitions = @()
    if ($detail.changelog -and $detail.changelog.histories) {
        foreach ($hist in $detail.changelog.histories) {
            foreach ($item in $hist.items) {
                if ($item.field -eq "status") {
                    $transitions += [PSCustomObject]@{
                        Fecha       = [DateTime]::Parse($hist.created)
                        EstadoAntes = $item.fromString
                        EstadoNuevo = $item.toString
                    }
                }
            }
        }
    }
    $transitions = $transitions | Sort-Object Fecha

    $fechaInicio = [DateTime]::Parse($creada)
    $fechaFin    = if ($resuelta) { [DateTime]::Parse($resuelta) } else { $null }
    $entradas    = @()

    if ($transitions.Count -eq 0) {
        $fin    = if ($fechaFin) { $fechaFin } else { [DateTime]::Now }
        $dias   = Get-BusinessDays -inicio $fechaInicio -fin $fin
        $finStr = if ($fechaFin) { $fechaFin.ToString("dd/MM/yyyy HH:mm") } else { "En curso" }
        $entradas += @{ estado=$estado; dias=$dias; inicio=$fechaInicio.ToString("dd/MM/yyyy HH:mm"); fin=$finStr }
    } else {
        # Primer segmento (estado antes de la primera transicion)
        $diasPrimero = Get-BusinessDays -inicio $fechaInicio -fin $transitions[0].Fecha
        $entradas += @{ estado=$transitions[0].EstadoAntes; dias=$diasPrimero; inicio=$fechaInicio.ToString("dd/MM/yyyy HH:mm"); fin=$transitions[0].Fecha.ToString("dd/MM/yyyy HH:mm") }
        # Segmentos intermedios
        for ($j = 0; $j -lt ($transitions.Count - 1); $j++) {
            $dias = Get-BusinessDays -inicio $transitions[$j].Fecha -fin $transitions[$j+1].Fecha
            $entradas += @{ estado=$transitions[$j].EstadoNuevo; dias=$dias; inicio=$transitions[$j].Fecha.ToString("dd/MM/yyyy HH:mm"); fin=$transitions[$j+1].Fecha.ToString("dd/MM/yyyy HH:mm") }
        }
        # Ultimo segmento hasta resolucion o ahora
        $ultimo = $transitions[-1]
        $fin    = if ($fechaFin) { $fechaFin } else { [DateTime]::Now }
        $finStr = if ($fechaFin) { $fechaFin.ToString("dd/MM/yyyy HH:mm") } else { "En curso" }
        $dias   = Get-BusinessDays -inicio $ultimo.Fecha -fin $fin
        $entradas += @{ estado=$ultimo.EstadoNuevo; dias=$dias; inicio=$ultimo.Fecha.ToString("dd/MM/yyyy HH:mm"); fin=$finStr }
    }

    $changelogMap[$key] = $entradas
    Write-Host " OK ($($entradas.Count) entradas)" -ForegroundColor Green
}

# -----------------------------------------------------------
# 3. Generar lineas JS para cada sprint
# -----------------------------------------------------------
Write-Host "`n=== PASO 3: Generando dashboard_data.js ===" -ForegroundColor Yellow

function Build-TicketLine {
    param($t, [string]$sprintLabel, [string]$estadoOverride = "")
    $key     = $t.key
    $summary = ($t.fields.summary -replace '"', "'") -replace '\\', '\\'
    $tipo    = $t.fields.issuetype.name
    $rawSt   = $t.fields.status.name
    $stNorm  = if ($estadoOverride -ne "") { $estadoOverride } else { Normalize-Estado $rawSt }
    $asignado = if ($t.fields.assignee) { $t.fields.assignee.displayName } else { "Sin asignar" }
    $prioridad = $t.fields.priority.name
    $creada  = Format-Fecha $t.fields.created
    $resuelta = if ($t.fields.resolutiondate) { Format-Fecha $t.fields.resolutiondate } else { "" }
    $updated = Format-Fecha $t.fields.updated
    $sp      = if ($t.fields.customfield_10016) { $t.fields.customfield_10016.ToString() } else { "" }
    $dias    = ""
    if ($resuelta -ne "" -and $t.fields.created -and $t.fields.resolutiondate) {
        try {
            $c = [DateTime]::Parse($t.fields.created.Substring(0,10))
            $r = [DateTime]::Parse($t.fields.resolutiondate.Substring(0,10))
            $dias = [Math]::Max(0, ($r - $c).Days).ToString()
        } catch {}
    }
    $desv = ""
    if ($dias -ne "" -and $sp -ne "") {
        try { $desv = ([double]$dias - [double]$sp).ToString() } catch {}
    }
    return "  {clave: `"$key`", tipoIncidencia: `"$tipo`", resumen: `"$summary`", asignado: `"$asignado`", prioridad: `"$prioridad`", estado: `"$stNorm`", estadoNormalizado: `"$stNorm`", creada: `"$creada`", actualizada: `"$updated`", resuelta: `"$resuelta`", sprint: `"$sprintLabel`", sprints: `"$sprintLabel`", diasResolucionReal: `"$dias`", storyPointEstimate: `"$sp`", desviacion: `"$desv`"},"
}

# Sprint 35: tickets que cerraron en S35 (no se movieron a S36 ni S37)
$lineas35 = @()
foreach ($t in $s35issues) {
    $movedToS36 = $keys36 -contains $t.key
    # Si se movio a S36, marcarlo como arrastrado en S35, y aparecera con sprint="36" abajo
    $estado35 = if ($movedToS36) { "Arrastrado" } else { "" }
    $lineas35 += Build-TicketLine -t $t -sprintLabel "35" -estadoOverride $estado35
}

# Sprint 36: todos los tickets del S36 (incluyendo los que vinieron de S35)
# Los que se movieron a S37 se marcan como "Arrastrado" en S36
$lineas36 = @()
foreach ($t in $s36issues) {
    $movedToS37 = $keys37 -contains $t.key
    $estado36 = if ($movedToS37) { "Arrastrado" } else { "" }
    $lineas36 += Build-TicketLine -t $t -sprintLabel "36" -estadoOverride $estado36
}

# Sprint 37: todos los tickets actuales de S37
$lineas37 = @()
foreach ($t in $s37issues) {
    $lineas37 += Build-TicketLine -t $t -sprintLabel "37"
}

# Combinar todo — S35 primero, luego S36, luego S37
# Tickets en S36 que tambien estan en S37: aparecen DOS veces (una vez en cada sprint)
# Tickets en S35 que estan en S36: aparecen DOS veces
$allLineas = $lineas35 + $lineas36 + $lineas37

# Generar JS
$jsData = @()
$jsData += "// Dashboard Data - Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') (Sprint 35 + 36 + 37)"
$jsData += "const ticketsData = ["
$jsData += $allLineas
# Fix: quitar ultima coma
$last = $jsData[-1]
$jsData[-1] = $last.TrimEnd(',')
$jsData += "];"

$jsData | Out-File "dashboard_data.js" -Encoding UTF8
Write-Host "dashboard_data.js generado: $($allLineas.Count) entradas" -ForegroundColor Green

# Resumen por sprint
Write-Host "`nDistribucion:"
Write-Host "  Sprint 35: $($lineas35.Count) tickets"
Write-Host "  Sprint 36: $($lineas36.Count) tickets (incluye $($s35_to_s36.Count) de S35)"
Write-Host "  Sprint 37: $($lineas37.Count) tickets (incluye $($s36_to_s37.Count) de S36)"

# -----------------------------------------------------------
# 4. Generar dashboard_changelog_data.js
# -----------------------------------------------------------
Write-Host "`n=== PASO 4: Generando dashboard_changelog_data.js ===" -ForegroundColor Yellow

$jsLog = @()
$jsLog += "// Changelog Data - Generated: $(Get-Date -Format 'MM/dd/yyyy HH:mm:ss') (Sprint 35 + 36 + 37)"
$jsLog += "const changelogData = {"

$sortedKeys = $changelogMap.Keys | Sort-Object
foreach ($key in $sortedKeys) {
    $entradas = $changelogMap[$key]
    $jsLog += "  '$key': ["
    for ($e = 0; $e -lt $entradas.Count; $e++) {
        $en     = $entradas[$e]
        $estEsc = $en.estado -replace "'", "''"
        $comma  = if ($e -lt ($entradas.Count - 1)) { "," } else { "" }
        $jsLog += "    {estado: '$estEsc', dias: $($en.dias), inicio: '$($en.inicio)', fin: '$($en.fin)'}$comma"
    }
    $jsLog += "  ],"
}
# Quitar coma del ultimo bloque
$jsLog[-1] = $jsLog[-1].TrimEnd(',')
$jsLog += "};"

$jsLog | Out-File "dashboard_changelog_data.js" -Encoding UTF8
Write-Host "dashboard_changelog_data.js generado: $($changelogMap.Count) tickets" -ForegroundColor Green

# -----------------------------------------------------------
# 5. KPIs resumen
# -----------------------------------------------------------
Write-Host "`n=== KPIs Sprint 36 (cierre) ===" -ForegroundColor Yellow
$s36fin = $s36issues | Where-Object { $_.fields.status.name -eq "Finalizada" -or $_.fields.status.name -eq "Done" }
$s36arr = $s36issues | Where-Object { $keys37 -contains $_.key }
$s36sp  = ($s36fin | Where-Object { $_.fields.customfield_10016 } | Measure-Object { $_.fields.customfield_10016 } -Sum).Sum
Write-Host "Finalizados en S36   : $($s36fin.Count) / $($s36issues.Count)"
Write-Host "Arrastrados a S37    : $($s36arr.Count)"
Write-Host "SP completados S36   : $s36sp"
$velS36 = if ($s36issues.Count -gt 0) { [Math]::Round($s36fin.Count * 100 / $s36issues.Count, 1) } else { 0 }
Write-Host "Tasa completado S36  : $velS36 %"

Write-Host "`n=== Sprint 37 (activo) ===" -ForegroundColor Yellow
$s37abiertos = $s37issues | Where-Object { $_.fields.status.name -ne "Finalizada" -and $_.fields.status.name -ne "Done" }
Write-Host "Total tickets S37    : $($s37issues.Count)"
Write-Host "Abiertos             : $($s37abiertos.Count)"
$s37issues | Group-Object { $_.fields.status.name } | Select-Object Name, Count | Sort-Object Count -Descending | Format-Table -AutoSize

Write-Host "`nListo. Archivos actualizados:" -ForegroundColor Green
Write-Host "  dashboard_data.js"
Write-Host "  dashboard_changelog_data.js"
Write-Host "`nRecuerda actualizar en dashboard_kpis_avanzados.js:"
Write-Host "  SPRINT_LEAD_TIME = '36'"
Write-Host "  sprintsCalidad   = ['35', '36']"
Write-Host "  sprintsAbiertos  = ['37']"
