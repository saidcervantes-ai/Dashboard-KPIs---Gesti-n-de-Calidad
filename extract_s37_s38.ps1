# =============================================================
# extract_s37_s38.ps1
# Extrae Sprint 37 (cerrado) + Sprint 38 (activo) de Jira.
# Mantiene datos históricos de Sprint 35 + 36.
# Genera: dashboard_data.js + dashboard_changelog_data.js
# IDs conocidos: S35=1163  S36=1196  S37=1229
# Sprint 38: se detecta automáticamente vía Board API.
# Fecha generación: 31/03/2026
# =============================================================

$config   = Get-Content "jira_config.json" | ConvertFrom-Json
$jiraUrl  = $config.jiraUrl
$email    = $config.email
$apiToken = $config.apiToken

$credentials = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${email}:${apiToken}"))
$headers = @{
    "Authorization" = "Basic $credentials"
    "Content-Type"  = "application/json"
    "Accept"        = "application/json"
}

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

function Build-TicketLine {
    param($t, [string]$sprintLabel, [string]$estadoOverride = "")
    $key      = $t.key
    $summary  = ($t.fields.summary -replace '"', "'") -replace '\\', '\\'
    $tipo     = $t.fields.issuetype.name
    $rawSt    = $t.fields.status.name
    $stNorm   = if ($estadoOverride -ne "") { $estadoOverride } else { Normalize-Estado $rawSt }
    $asignado = if ($t.fields.assignee) { $t.fields.assignee.displayName } else { "Sin asignar" }
    $prioridad= $t.fields.priority.name
    $creada   = Format-Fecha $t.fields.created
    $resuelta = if ($t.fields.resolutiondate) { Format-Fecha $t.fields.resolutiondate } else { "" }
    $updated  = Format-Fecha $t.fields.updated
    $sp       = if ($t.fields.customfield_10016) { $t.fields.customfield_10016.ToString() } else { "" }
    $dias     = ""
    if ($resuelta -ne "" -and $t.fields.created -and $t.fields.resolutiondate) {
        try {
            $c    = [DateTime]::Parse($t.fields.created.Substring(0,10))
            $r    = [DateTime]::Parse($t.fields.resolutiondate.Substring(0,10))
            $dias = [Math]::Max(0, ($r - $c).Days).ToString()
        } catch {}
    }
    $desv = ""
    if ($dias -ne "" -and $sp -ne "") {
        try { $desv = ([double]$dias - [double]$sp).ToString() } catch {}
    }
    return "  {clave: `"$key`", tipoIncidencia: `"$tipo`", resumen: `"$summary`", asignado: `"$asignado`", prioridad: `"$prioridad`", estado: `"$stNorm`", estadoNormalizado: `"$stNorm`", creada: `"$creada`", actualizada: `"$updated`", resuelta: `"$resuelta`", sprint: `"$sprintLabel`", sprints: `"$sprintLabel`", diasResolucionReal: `"$dias`", storyPointEstimate: `"$sp`", desviacion: `"$desv`"},"
}

# -----------------------------------------------------------
# 0. Auto-detectar Sprint 38 (buscar sprint activo en el board)
# -----------------------------------------------------------
Write-Host "`n=== PASO 0: Detectando Sprint 38 en Jira ===" -ForegroundColor Yellow

# Buscar sprint activo en el board
$boardUrl = "$jiraUrl/rest/agile/1.0/board?projectKeyOrId=IMS"
try {
    $boards = Invoke-RestMethod -Uri $boardUrl -Headers $headers -Method Get
} catch {
    Write-Host "ERROR buscando board: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$board = $boards.values | Select-Object -First 1
if (-not $board) {
    Write-Host "ERROR: No se encontro ningun board para el proyecto IMS" -ForegroundColor Red
    exit 1
}
Write-Host "Board encontrado: $($board.name) (ID: $($board.id))" -ForegroundColor Green

# Buscar SOLO sprints activos (sin paginacion problematica)
$activeSprintUrl = "$jiraUrl/rest/agile/1.0/board/$($board.id)/sprint?state=active"
try {
    $activeSprints = Invoke-RestMethod -Uri $activeSprintUrl -Headers $headers -Method Get
} catch {
    Write-Host "ERROR obteniendo sprints activos: $($_.Exception.Message)" -ForegroundColor Red
    $activeSprints = @{ values = @() }
}

$s38Sprint = $activeSprints.values | Sort-Object id -Descending | Select-Object -First 1

if (-not $s38Sprint) {
    Write-Host "AVISO: No se encontro sprint activo via API. Usando ID conocido 1262." -ForegroundColor Yellow
    $SPRINT_ID_38 = 1262
} else {
    $SPRINT_ID_38 = $s38Sprint.id
    Write-Host "Sprint activo detectado: ID=$SPRINT_ID_38  Nombre=$($s38Sprint.name)" -ForegroundColor Green
}

# -----------------------------------------------------------
# 1. Obtener tickets de cada sprint
# -----------------------------------------------------------
Write-Host "`n=== PASO 1: Obteniendo tickets de Jira ===" -ForegroundColor Yellow
$s35issues = Get-SprintTickets -sprintId 1163 -sprintLabel "35"
$s36issues = Get-SprintTickets -sprintId 1196 -sprintLabel "36"
$s37issues = Get-SprintTickets -sprintId 1229 -sprintLabel "37"
$s38issues = Get-SprintTickets -sprintId $SPRINT_ID_38 -sprintLabel "38"

$keys35 = $s35issues | Select-Object -ExpandProperty key
$keys36 = $s36issues | Select-Object -ExpandProperty key
$keys37 = $s37issues | Select-Object -ExpandProperty key
$keys38 = $s38issues | Select-Object -ExpandProperty key

$s35_to_s36 = $keys35 | Where-Object { $keys36 -contains $_ }
$s36_to_s37 = $keys36 | Where-Object { $keys37 -contains $_ }
$s37_to_s38 = $keys37 | Where-Object { $keys38 -contains $_ }

Write-Host "`n=== RESUMEN SPRINTS ===" -ForegroundColor Green
Write-Host "Sprint 35: $($s35issues.Count) tickets"
Write-Host "Sprint 36: $($s36issues.Count) tickets  (arrastrados de S35: $($s35_to_s36.Count))"
Write-Host "Sprint 37: $($s37issues.Count) tickets  (arrastrados de S36: $($s36_to_s37.Count))"
Write-Host "Sprint 38: $($s38issues.Count) tickets  (arrastrados de S37: $($s37_to_s38.Count))"

Write-Host "`n=== Estados Sprint 37 (cerrado) ===" -ForegroundColor Cyan
$s37issues | Group-Object { $_.fields.status.name } | Select-Object Name, Count | Sort-Object Count -Descending | Format-Table -AutoSize

Write-Host "=== Estados Sprint 38 (activo) ===" -ForegroundColor Cyan
$s38issues | Group-Object { $_.fields.status.name } | Select-Object Name, Count | Sort-Object Count -Descending | Format-Table -AutoSize

# -----------------------------------------------------------
# 2. Obtener changelog de todos los tickets (S35+S36+S37+S38)
# -----------------------------------------------------------
Write-Host "`n=== PASO 2: Obteniendo changelogs ===" -ForegroundColor Yellow

$allForChangelog = @{}
foreach ($t in ($s35issues + $s36issues + $s37issues + $s38issues)) {
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
        $diasPrimero = Get-BusinessDays -inicio $fechaInicio -fin $transitions[0].Fecha
        $entradas += @{ estado=$transitions[0].EstadoAntes; dias=$diasPrimero; inicio=$fechaInicio.ToString("dd/MM/yyyy HH:mm"); fin=$transitions[0].Fecha.ToString("dd/MM/yyyy HH:mm") }
        for ($j = 0; $j -lt ($transitions.Count - 1); $j++) {
            $dias = Get-BusinessDays -inicio $transitions[$j].Fecha -fin $transitions[$j+1].Fecha
            $entradas += @{ estado=$transitions[$j].EstadoNuevo; dias=$dias; inicio=$transitions[$j].Fecha.ToString("dd/MM/yyyy HH:mm"); fin=$transitions[$j+1].Fecha.ToString("dd/MM/yyyy HH:mm") }
        }
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
# 3. Generar dashboard_data.js (S35 + S36 + S37 + S38)
# -----------------------------------------------------------
Write-Host "`n=== PASO 3: Generando dashboard_data.js ===" -ForegroundColor Yellow

# Backup del archivo actual
Copy-Item "dashboard_data.js" "dashboard_data.js.bak" -Force
Write-Host "Backup creado: dashboard_data.js.bak" -ForegroundColor Gray

# Sprint 35: marcar como Arrastrado los que continuaron a S36
$lineas35 = @()
foreach ($t in $s35issues) {
    $estado35 = if ($keys36 -contains $t.key) { "Arrastrado" } else { "" }
    $lineas35 += Build-TicketLine -t $t -sprintLabel "35" -estadoOverride $estado35
}

# Sprint 36: marcar como Arrastrado los que continuaron a S37
$lineas36 = @()
foreach ($t in $s36issues) {
    $estado36 = if ($keys37 -contains $t.key) { "Arrastrado" } else { "" }
    $lineas36 += Build-TicketLine -t $t -sprintLabel "36" -estadoOverride $estado36
}

# Sprint 37 (cerrado): marcar como Arrastrado los que continuaron a S38
$lineas37 = @()
foreach ($t in $s37issues) {
    $estado37 = if ($keys38 -contains $t.key) { "Arrastrado" } else { "" }
    $lineas37 += Build-TicketLine -t $t -sprintLabel "37" -estadoOverride $estado37
}

# Sprint 38 (activo): estado real
$lineas38 = @()
foreach ($t in $s38issues) {
    $lineas38 += Build-TicketLine -t $t -sprintLabel "38"
}

$allLineas = $lineas35 + $lineas36 + $lineas37 + $lineas38

$jsData = @()
$jsData += "// Dashboard Data - Generado: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') (Sprint 35 + 36 + 37 + 38)"
$jsData += "const ticketsData = ["
$jsData += $allLineas
$jsData[-1] = $jsData[-1].TrimEnd(',')
$jsData += "];"
$jsData | Out-File "dashboard_data.js" -Encoding UTF8

Write-Host "dashboard_data.js generado: $($allLineas.Count) entradas" -ForegroundColor Green
Write-Host "  Sprint 35: $($lineas35.Count)  |  Sprint 36: $($lineas36.Count)  |  Sprint 37: $($lineas37.Count)  |  Sprint 38: $($lineas38.Count)"

# -----------------------------------------------------------
# 4. Generar dashboard_changelog_data.js
# -----------------------------------------------------------
Write-Host "`n=== PASO 4: Generando dashboard_changelog_data.js ===" -ForegroundColor Yellow

$jsLog = @()
$jsLog += "// Changelog Data - Generado: $(Get-Date -Format 'MM/dd/yyyy HH:mm:ss') (Sprint 35 + 36 + 37 + 38)"
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
$jsLog[-1] = $jsLog[-1].TrimEnd(',')
$jsLog += "};"
$jsLog | Out-File "dashboard_changelog_data.js" -Encoding UTF8

Write-Host "dashboard_changelog_data.js generado: $($changelogMap.Count) tickets" -ForegroundColor Green

# -----------------------------------------------------------
# 5. KPIs resumen Sprint 37 (cierre) y Sprint 38 (estado actual)
# -----------------------------------------------------------
Write-Host "`n=== KPIs Sprint 37 (cierre) ===" -ForegroundColor Yellow
$s37fin = $s37issues | Where-Object {
    $_.fields.status.name -eq "Finalizada" -or
    $_.fields.status.name -eq "Done" -or
    $_.fields.status.name -eq "Finalizados"
}
$s37arr    = $s37issues | Where-Object { $keys38 -contains $_.key }
$s37sp     = 0; $s37fin | Where-Object { $_.fields.customfield_10016 } | ForEach-Object { $s37sp += [double]$_.fields.customfield_10016 }
$s37sp     = [Math]::Round($s37sp, 1)
$velS37    = if ($s37issues.Count -gt 0) { [Math]::Round($s37fin.Count * 100 / $s37issues.Count, 1) } else { 0 }
Write-Host "Finalizados en S37  : $($s37fin.Count) / $($s37issues.Count)"
Write-Host "Arrastrados a S38   : $($s37arr.Count)"
Write-Host "SP completados S37  : $s37sp"
Write-Host "Tasa completado S37 : $velS37 %"

Write-Host "`n=== Sprint 38 (activo) ===" -ForegroundColor Yellow
$s38fin    = $s38issues | Where-Object {
    $_.fields.status.name -eq "Finalizada" -or
    $_.fields.status.name -eq "Done" -or
    $_.fields.status.name -eq "Finalizados"
}
$s38abiertos = $s38issues | Where-Object {
    $_.fields.status.name -ne "Finalizada" -and $_.fields.status.name -ne "Done"
}
Write-Host "Total tickets S38   : $($s38issues.Count)"
Write-Host "Finalizados         : $($s38fin.Count)"
Write-Host "Abiertos/En curso   : $($s38abiertos.Count)"
$s38issues | Group-Object { $_.fields.status.name } | Select-Object Name, Count | Sort-Object Count -Descending | Format-Table -AutoSize

# -----------------------------------------------------------
# 6. Actualizar kpis_resumen.json
# -----------------------------------------------------------
Write-Host "`n=== PASO 6: Actualizando kpis_resumen.json ===" -ForegroundColor Yellow

$allTicketsCombined = $s35issues + $s36issues + $s37issues + $s38issues | Group-Object key | ForEach-Object { $_.Group[0] }
$totalTickets   = $allTicketsCombined.Count
$finalizados    = ($allTicketsCombined | Where-Object {
    $_.fields.status.name -eq "Finalizada" -or $_.fields.status.name -eq "Done"
}).Count
$enCurso        = ($allTicketsCombined | Where-Object {
    $_.fields.status.name -notin @("Finalizada","Done","To Do","Backlog")
}).Count
$pendientes     = ($allTicketsCombined | Where-Object {
    $_.fields.status.name -eq "To Do" -or $_.fields.status.name -eq "Backlog"
}).Count

$highest = $allTicketsCombined | Where-Object { $_.fields.priority.name -eq "Highest" }
$high    = $allTicketsCombined | Where-Object { $_.fields.priority.name -eq "High" }
$medium  = $allTicketsCombined | Where-Object { $_.fields.priority.name -eq "Medium" }
$low     = $allTicketsCombined | Where-Object { $_.fields.priority.name -eq "Low" }

function Avg-Days {
    param($tickets)
    $con = $tickets | Where-Object { $_.fields.resolutiondate -and $_.fields.created }
    if ($con.Count -eq 0) { return 0.0 }
    $sumas = $con | ForEach-Object {
        $c = [DateTime]::Parse($_.fields.created.Substring(0,10))
        $r = [DateTime]::Parse($_.fields.resolutiondate.Substring(0,10))
        [Math]::Max(0, ($r - $c).Days)
    }
    return [Math]::Round(($sumas | Measure-Object -Sum).Sum / $con.Count, 1)
}

$pctFin   = if ($totalTickets -gt 0) { [Math]::Round($finalizados * 100 / $totalTickets, 1) } else { 0 }
$pctCurso = if ($totalTickets -gt 0) { [Math]::Round($enCurso * 100 / $totalTickets, 1) } else { 0 }

$highestAbiertos = ($s38issues | Where-Object {
    $_.fields.priority.name -eq "Highest" -and
    $_.fields.status.name -notin @("Finalizada","Done")
}).Count

$kpisJson = [ordered]@{
    TotalIncidentes     = $totalTickets
    Finalizados         = $finalizados
    EnCurso             = $enCurso
    Pendientes          = $pendientes
    PctFinalizados      = $pctFin
    PctEnCurso          = $pctCurso
    Backlog             = $pendientes
    HighestTotal        = $highest.Count
    HighTotal           = $high.Count
    MediumTotal         = $medium.Count
    LowTotal            = $low.Count
    HighestAbiertos     = $highestAbiertos
    CoberturaResolucion = $velS37
    SprintActivo        = 38
    SprintCerrado       = 37
    TiempoHighest       = Avg-Days -tickets $highest
    TiempoHigh          = Avg-Days -tickets $high
    TiempoMedium        = Avg-Days -tickets $medium
    TiempoLow           = Avg-Days -tickets $low
    FechaActualizacion  = (Get-Date -Format "dd/MM/yyyy HH:mm")
}

$kpisJson | ConvertTo-Json -Depth 3 | Out-File "kpis_resumen.json" -Encoding UTF8
Write-Host "kpis_resumen.json actualizado" -ForegroundColor Green

# -----------------------------------------------------------
# Resumen final
# -----------------------------------------------------------
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  ACTUALIZACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Archivos actualizados:" -ForegroundColor White
Write-Host ("  dashboard_data.js           " + $allLineas.Count + " entradas")
Write-Host ("  dashboard_changelog_data.js " + $changelogMap.Count + " tickets")
Write-Host "  kpis_resumen.json"
Write-Host ("`nSprint 37 cerrado : " + $velS37 + " pct completado")
Write-Host ("Sprint 38 activo  : " + $s38issues.Count + " tickets, " + $s38abiertos.Count + " abiertos")
Write-Host "`nEl dashboard se actualizará al recargar en el navegador."
Write-Host "No se modificó el diseño — solo los datos." -ForegroundColor Cyan
