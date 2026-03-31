# =============================================================
# Regenera dashboard_changelog_data.js con datos frescos de Jira
# Sprint 35 (ID 1163) + Sprint 36 (ID 1196)
# Fecha generacion: hoy
# =============================================================

$config    = Get-Content "jira_config.json" | ConvertFrom-Json
$jiraUrl   = $config.jiraUrl
$email     = $config.email
$apiToken  = $config.apiToken
$outputJs  = "dashboard_changelog_data.js"

$credentials = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${email}:${apiToken}"))
$headers = @{
    "Authorization" = "Basic $credentials"
    "Content-Type"  = "application/json"
}

# -----------------------------------------------------------
# Calcula días laborables (L-V) entre dos fechas, con decimales
# basados en horas laborables (1 día = 8h laborables, 9:00-17:00)
# -----------------------------------------------------------
function Get-BusinessDays {
    param(
        [DateTime]$inicio,
        [DateTime]$fin
    )
    if ($fin -le $inicio) { return 0.0 }

    $totalMinutos = 0
    $current = $inicio

    while ($current -lt $fin) {
        $diaSemana = $current.DayOfWeek
        if ($diaSemana -ne [DayOfWeek]::Saturday -and $diaSemana -ne [DayOfWeek]::Sunday) {
            # Calcular minutos laborables en este día (9:00 - 18:00 = 9h)
            $inicioLaboral = [DateTime]::new($current.Year, $current.Month, $current.Day, 9, 0, 0)
            $finLaboral    = [DateTime]::new($current.Year, $current.Month, $current.Day, 18, 0, 0)

            $desdeEfectivo = if ($current -gt $inicioLaboral) { $current } else { $inicioLaboral }
            $hastaEfectivo = if ($fin -lt $finLaboral) { $fin } else { $finLaboral }

            if ($hastaEfectivo -gt $desdeEfectivo) {
                $totalMinutos += ($hastaEfectivo - $desdeEfectivo).TotalMinutes
            }
        }
        # Avanzar al inicio del día siguiente
        $current = [DateTime]::new($current.Year, $current.Month, $current.Day).AddDays(1)
    }

    # Convertir minutos a días laborables (1 día laboral = 9h = 540 min)
    return [math]::Round($totalMinutos / 540, 1)
}

# -----------------------------------------------------------
# 1. Obtener todos los tickets de Sprint 35 y 36
# -----------------------------------------------------------
function Get-SprintTickets {
    param($sprintId)
    $allIssues = @()
    $startAt   = 0
    $pageSize  = 100
    do {
        $url = "$jiraUrl/rest/agile/1.0/sprint/$sprintId/issue?startAt=$startAt&maxResults=$pageSize&fields=summary,status,created,resolutiondate,assignee,priority"
        try {
            $resp = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
        } catch {
            Write-Host "Error obteniendo tickets sprint ${sprintId} : $($_.Exception.Message)" -ForegroundColor Red
            break
        }
        $allIssues += $resp.issues
        $startAt   += $resp.issues.Count
        Write-Host "  Sprint ${sprintId}: obtenidos $($allIssues.Count) / $($resp.total)" -ForegroundColor Cyan
    } while ($allIssues.Count -lt $resp.total)
    return $allIssues
}

Write-Host "Obteniendo tickets de Sprint 35..." -ForegroundColor Yellow
$s35 = Get-SprintTickets -sprintId 1163
Write-Host "Obteniendo tickets de Sprint 36..." -ForegroundColor Yellow
$s36 = Get-SprintTickets -sprintId 1196

# Combinar y deduplicar por clave
$allIssues = @()
$seen      = @{}
foreach ($t in ($s35 + $s36)) {
    if (-not $seen[$t.key]) {
        $seen[$t.key] = $true
        $allIssues += $t
    }
}
Write-Host "Total tickets únicos a procesar: $($allIssues.Count)" -ForegroundColor Green

# -----------------------------------------------------------
# 2. Por cada ticket, obtener changelog y calcular tiempos
# -----------------------------------------------------------
$changelogMap = @{}  # clave -> array de entradas

$i = 0
foreach ($issue in $allIssues) {
    $i++
    $key     = $issue.key
    $creada  = $issue.fields.created
    $resuelta = $issue.fields.resolutiondate
    $estado  = $issue.fields.status.name

    Write-Host "[$i/$($allIssues.Count)] $key ..." -ForegroundColor Cyan -NoNewline

    $issueUrl = "$jiraUrl/rest/api/3/issue/$key`?expand=changelog&fields=summary,status,created,resolutiondate"
    try {
        $detail = Invoke-RestMethod -Uri $issueUrl -Headers $headers -Method Get
    } catch {
        Write-Host " ERROR: $($_.Exception.Message)" -ForegroundColor Red
        continue
    }

    Start-Sleep -Milliseconds 150   # rate limit

    # Recopilar transiciones de estado ordenadas por fecha
    $transitions = @()
    if ($detail.changelog -and $detail.changelog.histories) {
        foreach ($hist in $detail.changelog.histories) {
            foreach ($item in $hist.items) {
                if ($item.field -eq "status") {
                    $transitions += [PSCustomObject]@{
                        Fecha         = [DateTime]::Parse($hist.created)
                        EstadoAntes   = $item.fromString
                        EstadoNuevo   = $item.toString
                    }
                }
            }
        }
    }
    $transitions = $transitions | Sort-Object Fecha

    $fechaInicio = [DateTime]::Parse($creada)
    $fechaFin    = if ($resuelta) { [DateTime]::Parse($resuelta) } else { $null }

    $entradas = @()

    if ($transitions.Count -eq 0) {
        # Sin historial: todo el tiempo en el estado actual (solo días laborables L-V, 9h-18h)
        $fin = if ($fechaFin) { $fechaFin } else { [DateTime]::Now }
        $dias = Get-BusinessDays -inicio $fechaInicio -fin $fin
        $finStr = if ($fechaFin) { $fechaFin.ToString("dd/MM/yyyy HH:mm") } else { "En curso" }
        $entradas += @{ estado=$estado; dias=$dias; inicio=$fechaInicio.ToString("dd/MM/yyyy HH:mm"); fin=$finStr }
    } else {
        # Primer estado (antes de la primera transición)
        $primerCambio = $transitions[0]
        $diasPrimero  = Get-BusinessDays -inicio $fechaInicio -fin $primerCambio.Fecha
        $entradas += @{ estado=$primerCambio.EstadoAntes; dias=$diasPrimero; inicio=$fechaInicio.ToString("dd/MM/yyyy HH:mm"); fin=$primerCambio.Fecha.ToString("dd/MM/yyyy HH:mm") }

        # Estados intermedios
        for ($j = 0; $j -lt ($transitions.Count - 1); $j++) {
            $curr = $transitions[$j]
            $next = $transitions[$j + 1]
            $dias = Get-BusinessDays -inicio $curr.Fecha -fin $next.Fecha
            $entradas += @{ estado=$curr.EstadoNuevo; dias=$dias; inicio=$curr.Fecha.ToString("dd/MM/yyyy HH:mm"); fin=$next.Fecha.ToString("dd/MM/yyyy HH:mm") }
        }

        # Último estado hasta resolución o ahora
        $ultimo = $transitions[-1]
        $fin    = if ($fechaFin) { $fechaFin } else { [DateTime]::Now }
        $dias   = Get-BusinessDays -inicio $ultimo.Fecha -fin $fin
        $finStr = if ($fechaFin) { $fechaFin.ToString("dd/MM/yyyy HH:mm") } else { "En curso" }
        $entradas += @{ estado=$ultimo.EstadoNuevo; dias=$dias; inicio=$ultimo.Fecha.ToString("dd/MM/yyyy HH:mm"); fin=$finStr }
    }

    $changelogMap[$key] = $entradas
    Write-Host " OK ($($entradas.Count) entradas)" -ForegroundColor Green
}

# -----------------------------------------------------------
# 3. Generar dashboard_changelog_data.js
# -----------------------------------------------------------
Write-Host "`nGenerando $outputJs ..." -ForegroundColor Yellow

$js = @()
$js += "// Changelog Data - Generated: $(Get-Date -Format 'MM/dd/yyyy HH:mm:ss') (Sprint 35 + Sprint 36)"
$js += "const changelogData = {"

$keys = $changelogMap.Keys | Sort-Object
foreach ($key in $keys) {
    $entradas = $changelogMap[$key]
    $js += "  '$key': ["
    foreach ($e in $entradas) {
        $estadoEsc = $e.estado -replace "'", "''"
        $inicioEsc = $e.inicio
        $finEsc    = $e.fin
        $js += "    {estado: '$estadoEsc', dias: $($e.dias), inicio: '$inicioEsc', fin: '$finEsc'},"
    }
    # Eliminar la coma de la última entrada
    $last = $js[-1]
    $js[-1] = $last.TrimEnd(',')
    $js += "  ],"
}
# Eliminar la coma del último bloque
$lastBlock = $js[-1]
$js[-1] = $lastBlock.TrimEnd(',')

$js += "};"

$js | Set-Content $outputJs -Encoding UTF8

Write-Host "Archivo generado: $outputJs" -ForegroundColor Green
Write-Host "Tickets procesados: $($changelogMap.Count)" -ForegroundColor Green
Write-Host "Fecha: $(Get-Date)" -ForegroundColor Green
