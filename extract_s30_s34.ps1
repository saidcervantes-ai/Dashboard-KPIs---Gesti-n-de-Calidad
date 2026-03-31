# =============================================================
# extract_s30_s34.ps1
# Extrae sprints 30-34 (historicos cerrados) de Jira y los
# antepone al dashboard_data.js existente (que ya tiene S35-S38).
# IDs: S30=998  S31=1031  S32=1064  S33=1097  S34=1130
# Fecha: 31/03/2026
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

$SPRINT_IDS = [ordered]@{
    "30" = 998
    "31" = 1031
    "32" = 1064
    "33" = 1097
    "34" = 1130
}

# -----------------------------------------------------------
# Helpers
# -----------------------------------------------------------
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
            Write-Host "  ERROR sprint $sprintLabel : $($_.Exception.Message)" -ForegroundColor Red
            return @()
        }
        $all += $r.issues
        $startAt += $r.issues.Count
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
# 1. Obtener tickets de S30-S34
# -----------------------------------------------------------
Write-Host "`n=== PASO 1: Obteniendo tickets S30-S34 de Jira ===" -ForegroundColor Yellow

$allLineasHistoricas = @()
$resumenSprints = @{}

foreach ($entry in $SPRINT_IDS.GetEnumerator()) {
    $sprintNum = $entry.Key
    $sprintId  = $entry.Value
    Write-Host "`nSprint $sprintNum (ID: $sprintId):" -ForegroundColor Magenta
    $issues = Get-SprintTickets -sprintId $sprintId -sprintLabel $sprintNum
    $resumenSprints[$sprintNum] = $issues.Count

    # Identificar claves del sprint siguiente para marcar arrastrados
    $nextSprintNum = ([int]$sprintNum + 1).ToString()
    $nextSprintId  = $SPRINT_IDS[$nextSprintNum]
    $keysNext = @()
    if ($nextSprintId) {
        Write-Host "  Verificando arrastrados al Sprint $nextSprintNum..." -ForegroundColor DarkCyan
        $nextIssues = Get-SprintTickets -sprintId $nextSprintId -sprintLabel $nextSprintNum
        $keysNext = $nextIssues | Select-Object -ExpandProperty key
    }

    foreach ($t in $issues) {
        $estadoOverride = if ($keysNext -contains $t.key) { "Arrastrado" } else { "" }
        $allLineasHistoricas += Build-TicketLine -t $t -sprintLabel $sprintNum -estadoOverride $estadoOverride
    }
}

Write-Host "`n=== RESUMEN S30-S34 ===" -ForegroundColor Green
foreach ($entry in $resumenSprints.GetEnumerator()) {
    Write-Host "  Sprint $($entry.Key): $($entry.Value) tickets"
}

# -----------------------------------------------------------
# 2. Leer el dashboard_data.js actual (S35-S38) y anteponer S30-S34
# -----------------------------------------------------------
Write-Host "`n=== PASO 2: Combinando datos ===" -ForegroundColor Yellow

$currentContent = Get-Content "dashboard_data.js" -Raw -Encoding UTF8

# Extraer solo las lineas de datos (entre [ y ];)
# Quitar la primera linea (// comentario) y const ticketsData = [
# Extraer el contenido entre corchetes
if ($currentContent -match "(?s)const ticketsData = \[(.*)\];") {
    $s35_s38_data = $matches[1].Trim().TrimEnd(',')
} else {
    Write-Host "ERROR: No se pudo parsear dashboard_data.js" -ForegroundColor Red
    exit 1
}

# Backup
Copy-Item "dashboard_data.js" "dashboard_data.js.bak" -Force
Write-Host "Backup creado: dashboard_data.js.bak" -ForegroundColor Gray

# Combinar: S30-S34 primero, luego S35-S38
$historicasStr = ($allLineasHistoricas -join "`n").TrimEnd(',')

$jsData = @()
$jsData += "// Dashboard Data - Generado: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') (Sprint 30 al 38)"
$jsData += "const ticketsData = ["
$jsData += $historicasStr + ","
$jsData += $s35_s38_data
$jsData += "];"

$jsData | Out-File "dashboard_data.js" -Encoding UTF8

# Contar resultado final
$finalContent = Get-Content "dashboard_data.js" -Raw -Encoding UTF8
$totalFinal = ([regex]::Matches($finalContent, 'clave:\s*"IMS-')).Count
Write-Host "`ndashboard_data.js actualizado: $totalFinal tickets totales" -ForegroundColor Green

$sprints = 30..38
foreach ($s in $sprints) {
    $cnt = ([regex]::Matches($finalContent, "sprint:\s*`"$s`"")).Count
    Write-Host "  Sprint $s : $cnt tickets"
}

Write-Host "`nListo. Recarga el dashboard en el navegador." -ForegroundColor Cyan
