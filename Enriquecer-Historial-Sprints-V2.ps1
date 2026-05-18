# ============================================================================
# Script: Enriquecer-Historial-Sprints-V2.ps1
# Reconstruye correctamente la pertenencia a sprints y el estado al cierre.
# Genera: tickets_enriquecidos.json
# ============================================================================

$config = Get-Content "jira_config.json" -Raw | ConvertFrom-Json
$creds = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$($config.email):$($config.apiToken)"))
$headers = @{ Authorization = "Basic $creds" }

# 1) Cargar fechas de sprints
Write-Host "Cargando fechas de sprints..." -ForegroundColor Cyan
$sprints = Import-Csv .\jira_sprints.csv -Encoding UTF8
$sprintMap = @{}
foreach ($s in $sprints) {
    if ($s.Numero -and $s.Inicio) {
        $closeDate = if ($s.Cierre) { [DateTime]::Parse($s.Cierre) } elseif ($s.Fin) { [DateTime]::Parse($s.Fin) } else { (Get-Date).AddDays(30) }
        $sprintMap[$s.Numero] = @{
            Inicio = [DateTime]::Parse($s.Inicio)
            Cierre = $closeDate
            Estado = $s.Estado
        }
    }
}
Write-Host "Sprints con fechas: $($sprintMap.Count)" -ForegroundColor Green

# 2) Cargar tickets actuales
Write-Host "`nCargando tickets..." -ForegroundColor Cyan
$tickets = Import-Csv .\jira_tickets_api.csv -Encoding UTF8
Write-Host "Total tickets: $($tickets.Count)" -ForegroundColor Green

# 3) Helpers
function Get-Bucket($estado) {
    if (-not $estado) { return "Tareas por hacer" }
    if ($estado -match "^(Done|Cerrado|Resuelto|Closed|Resolved|Finalizada|Finalizados|Finalizado)$") { return "Finalizado" }
    if ($estado -match "^(To Do|To do|Por hacer|Tareas por hacer|Open|Backlog|Nuevo|New)$") { return "Tareas por hacer" }
    return "En curso"
}

function Parse-SprintNum($text) {
    if ($null -eq $text) { return $null }
    $s = "$text"
    if ($s -match 'Sprint[\s-]*(\d+)') { return [int]$Matches[1] }
    if ($s -match '(\d+)\s*$') { return [int]$Matches[1] }
    return $null
}

function Parse-SprintList($text) {
    $list = @()
    if (-not $text) { return $list }
    foreach ($part in ($text -split ',')) {
        $n = Parse-SprintNum $part.Trim()
        if ($n) { $list += $n }
    }
    return $list
}

# 4) Procesar tickets
$enriched = @()
$processed = 0
$total = $tickets.Count
$errores = 0

foreach ($t in $tickets) {
    $processed++
    if ($processed % 50 -eq 0) {
        Write-Host "  $processed / $total ..." -ForegroundColor Gray
    }

    $key = $t.'Clave de incidencia'
    if (-not $key) { continue }

    try {
        $detail = Invoke-RestMethod -Uri "$($config.jiraUrl)/rest/api/2/issue/$($key)?expand=changelog" -Headers $headers -Method Get -ErrorAction Stop
    } catch {
        $errores++
        continue
    }

    $createdDate = [DateTime]::Parse($detail.fields.created)

    # Recolectar eventos: status y sprint
    $statusEvents = @()
    $sprintEvents = @()
    if ($detail.changelog -and $detail.changelog.histories) {
        foreach ($h in $detail.changelog.histories) {
            $when = [DateTime]::Parse($h.created)
            foreach ($it in $h.items) {
                if ($it.field -eq "status") {
                    $statusEvents += [PSCustomObject]@{ When = $when; From = $it.fromString; To = $it.toString }
                } elseif ($it.field -eq "Sprint") {
                    $sprintEvents += [PSCustomObject]@{
                        When = $when
                        FromList = (Parse-SprintList $it.fromString)
                        ToList = (Parse-SprintList $it.toString)
                    }
                }
            }
        }
    }

    # === STATUS TIMELINE ===
    # Estado inicial: si hay cambios de status, es from del primero. Si no, status actual.
    $statusEventsSorted = @($statusEvents | Sort-Object When)
    $estadoInicial = if ($statusEventsSorted.Count -gt 0) { $statusEventsSorted[0].From } else { $detail.fields.status.name }
    $statusTimeline = @()
    $statusTimeline += [PSCustomObject]@{ When = $createdDate; Estado = $estadoInicial }
    foreach ($ev in $statusEventsSorted) {
        $statusTimeline += [PSCustomObject]@{ When = $ev.When; Estado = $ev.To }
    }

    function Get-EstadoEnFecha($timeline, $fecha) {
        $resultado = $timeline[0].Estado
        foreach ($e in $timeline) {
            if ($e.When -le $fecha) { $resultado = $e.Estado } else { break }
        }
        return $resultado
    }

    # === SPRINT TIMELINE ===
    # Cada evento dice From=sprints antes y To=sprints despues. Construimos intervalos:
    #   - antes del primer evento: sprints = primerEvento.FromList
    #   - entre evento i y i+1: sprints = evento_i.ToList
    #   - despues del ultimo evento: sprints = ultimoEvento.ToList (= sprintsActuales)
    # Si no hay eventos: usar sprintsActuales para todo el periodo.

    $sprintsActuales = @()
    if ($detail.fields.customfield_10020) {
        foreach ($sp in @($detail.fields.customfield_10020)) {
            $spStr = if ($sp -is [string]) { $sp } else { $sp.name }
            $n = Parse-SprintNum $spStr
            if ($n) { $sprintsActuales += $n }
        }
    }

    $sprintEventsSorted = @($sprintEvents | Sort-Object When)

    $sprintIntervals = @()  # cada uno: { Start, End, Sprints }

    if ($sprintEventsSorted.Count -eq 0) {
        $sprintIntervals += [PSCustomObject]@{
            Start = $createdDate
            End = (Get-Date).AddYears(10)
            Sprints = @($sprintsActuales)
        }
    } else {
        # Primer intervalo: desde creacion hasta primer evento, con FromList del primer evento
        $sprintIntervals += [PSCustomObject]@{
            Start = $createdDate
            End = $sprintEventsSorted[0].When
            Sprints = @($sprintEventsSorted[0].FromList)
        }
        # Intervalos intermedios: cada evento define el inicio, el siguiente evento (o ahora) el fin
        for ($i = 0; $i -lt $sprintEventsSorted.Count; $i++) {
            $start = $sprintEventsSorted[$i].When
            $end = if ($i + 1 -lt $sprintEventsSorted.Count) { $sprintEventsSorted[$i + 1].When } else { (Get-Date).AddYears(10) }
            $sprintIntervals += [PSCustomObject]@{
                Start = $start
                End = $end
                Sprints = @($sprintEventsSorted[$i].ToList)
            }
        }
    }

    # Conjunto de sprints por los que pasó alguna vez
    $allSprints = @{}
    foreach ($iv in $sprintIntervals) {
        foreach ($n in $iv.Sprints) { $allSprints[$n] = $true }
    }

    # === HISTORICO POR SPRINT ===
    # REGLA: un ticket pertenece al sprint N si estaba asignado a N en la
    # fechaEvaluacion (cierre del sprint, o "ahora" si está activo).
    $historico = @{}
    foreach ($n in $allSprints.Keys) {
        $key2 = [string]$n
        if (-not $sprintMap.ContainsKey($key2)) { continue }
        $startDate = $sprintMap[$key2].Inicio
        $closeDate = $sprintMap[$key2].Cierre
        $sprintEstado = $sprintMap[$key2].Estado

        $fechaEvaluacion = if ($sprintEstado -eq "closed") { $closeDate } else { (Get-Date) }

        # El ticket no puede pertenecer si fue creado despues de la evaluacion
        if ($createdDate -gt $fechaEvaluacion) { continue }

        # Verificar asignacion al sprint N en fechaEvaluacion (inline)
        $asignado = $false
        foreach ($iv in $sprintIntervals) {
            if ($iv.Start -le $fechaEvaluacion -and $iv.End -gt $fechaEvaluacion) {
                if ($iv.Sprints -contains $n) { $asignado = $true }
                break
            }
        }
        if (-not $asignado) { continue }

        # Excluir asignaciones retroactivas: si el ticket ya estaba Finalizado
        # antes del inicio del sprint, no se trabajo en el
        if ($createdDate -lt $startDate) {
            $estadoAlInicio = Get-EstadoEnFecha $statusTimeline $startDate
            $bucketAlInicio = Get-Bucket $estadoAlInicio
            if ($bucketAlInicio -eq "Finalizado") { continue }
        }

        $estadoAlCierre = Get-EstadoEnFecha $statusTimeline $fechaEvaluacion

        $historico[$key2] = @{
            Estado = $estadoAlCierre
            Bucket = (Get-Bucket $estadoAlCierre)
        }
    }

    $sprintActualStr = if ($sprintsActuales.Count -gt 0) { ($sprintsActuales | Sort-Object | Select-Object -Last 1).ToString() } else { "" }

    $enriched += [PSCustomObject]@{
        Clave = $key
        SprintActual = $sprintActualStr
        Historico = $historico
    }
}

Write-Host "`nProcesados: $processed | Errores: $errores" -ForegroundColor Yellow

# Guardar JSON
$enriched | ConvertTo-Json -Depth 6 | Out-File -FilePath "tickets_enriquecidos.json" -Encoding UTF8
Write-Host "Guardado tickets_enriquecidos.json ($($enriched.Count) tickets)" -ForegroundColor Green

# Validacion por sprint
Write-Host "`n=== VALIDACION POR SPRINT ===" -ForegroundColor Cyan
foreach ($num in @("32","33","34","35","36","37","38","39","40")) {
    $tk = $enriched | Where-Object { $_.Historico.ContainsKey($num) }
    if ($tk.Count -eq 0) { continue }
    $buckets = @{ Finalizado = 0; "En curso" = 0; "Tareas por hacer" = 0 }
    foreach ($x in $tk) { $b = $x.Historico[$num].Bucket; $buckets[$b]++ }
    Write-Host ("S{0}: total={1} | Finalizado={2} | EnCurso={3} | Backlog={4}" -f $num, $tk.Count, $buckets["Finalizado"], $buckets["En curso"], $buckets["Tareas por hacer"])
}
