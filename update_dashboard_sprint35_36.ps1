# Script: Actualiza dashboard_data.js con datos reales de Sprint 35 y 36
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

Write-Host "S35: $($r35.total) tickets | S36: $($r36.total) tickets | Movidos: $($inBoth.Count)"

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
        "Test Issues"      { return "Test Issues" }
        "In Test"          { return "IN TEST DEV" }
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

# Helper: calcular desviacion
function Desviacion($dias, $sp) {
    if ($dias -eq "" -or $sp -eq "") { return "" }
    try { return ([double]$dias - [double]$sp).ToString() } catch { return "" }
}

# --- Generar lineas JS para Sprint 35 ---
$lineas35 = @()
foreach ($t in $r35.issues) {
    $key = $t.key
    $summary = ($t.fields.summary -replace '"', "'") -replace '\\', '\\'
    $tipo = $t.fields.issuetype.name
    $rawStatus = $t.fields.status.name
    $estadoBase = NormalizarEstado $rawStatus

    # Tickets movidos a S36 = "Arrastrado" en el registro de S35
    $estadoS35 = if ($inBoth -contains $key) { "Arrastrado" } else { $estadoBase }

    $assignee = if ($t.fields.assignee) { $t.fields.assignee.displayName } else { "Sin asignar" }
    $priority = $t.fields.priority.name
    $created = FormatFecha $t.fields.created
    # Si fue arrastrado, no tiene fecha de resolucion en S35
    $resolved = if (($inBoth -notcontains $key) -and $t.fields.resolutiondate) { FormatFecha $t.fields.resolutiondate } else { "" }
    $updated = FormatFecha $t.fields.updated
    $sp = if ($null -ne $t.fields.customfield_10016) { $t.fields.customfield_10016.ToString() } else { "" }
    $dias = DiasResolucion $t.fields.created $t.fields.resolutiondate
    if ($inBoth -contains $key) { $dias = "" }
    $desv = Desviacion $dias $sp

    $lineas35 += "  {clave: `"$key`", tipoIncidencia: `"$tipo`", resumen: `"$summary`", asignado: `"$assignee`", prioridad: `"$priority`", estado: `"$estadoS35`", estadoNormalizado: `"$estadoS35`", creada: `"$created`", actualizada: `"$updated`", resuelta: `"$resolved`", sprint: `"35`", sprints: `"35`", diasResolucionReal: `"$dias`", storyPointEstimate: `"$sp`", desviacion: `"$desv`"},"
}

# --- Generar lineas JS para Sprint 36 (todos: movidos de S35 + nuevos) ---
$lineas36 = @()
foreach ($t in $r36.issues) {
    $key = $t.key
    $summary = ($t.fields.summary -replace '"', "'") -replace '\\', '\\'
    $tipo = $t.fields.issuetype.name
    $rawStatus = $t.fields.status.name
    $estadoNorm = NormalizarEstado $rawStatus

    $assignee = if ($t.fields.assignee) { $t.fields.assignee.displayName } else { "Sin asignar" }
    $priority = $t.fields.priority.name
    $created = FormatFecha $t.fields.created
    $resolved = if ($t.fields.resolutiondate) { FormatFecha $t.fields.resolutiondate } else { "" }
    $updated = FormatFecha $t.fields.updated
    $sp = if ($null -ne $t.fields.customfield_10016) { $t.fields.customfield_10016.ToString() } else { "" }
    $dias = DiasResolucion $t.fields.created $t.fields.resolutiondate
    $desv = Desviacion $dias $sp

    # Tickets movidos: indicar que vienen del sprint anterior
    $sprintLabel = "36"

    $lineas36 += "  {clave: `"$key`", tipoIncidencia: `"$tipo`", resumen: `"$summary`", asignado: `"$assignee`", prioridad: `"$priority`", estado: `"$estadoNorm`", estadoNormalizado: `"$estadoNorm`", creada: `"$created`", actualizada: `"$updated`", resuelta: `"$resolved`", sprint: `"$sprintLabel`", sprints: `"$sprintLabel`", diasResolucionReal: `"$dias`", storyPointEstimate: `"$sp`", desviacion: `"$desv`"},"
}

# --- Leer dashboard_data.js existente y extraer datos de sprints 30-34 ---
Write-Host "Leyendo dashboard_data.js existente..."
$existingLines = Get-Content "dashboard_data.js" -Encoding UTF8

# Conservar SOLO lineas que NO sean sprint 35 ni 36 (excluye esas entradas)
# Las lineas de sprint 35/36 actuales se reemplazaran con los datos del API
$lineasHistoricas = $existingLines | Where-Object {
    # Conservar lineas de cabecera/pie del fichero JS
    if ($_ -match '^\s*//') { return $true }
    if ($_ -match '^const ticketsData') { return $true }
    if ($_ -match '^\];') { return $true }
    if ($_ -eq '') { return $false }
    # Excluir entradas de sprint 35 y 36 (se reemplazaran)
    if ($_ -match 'sprint: "35"' -or $_ -match "sprint: '35'") { return $false }
    if ($_ -match 'sprint: "36"' -or $_ -match "sprint: '36'") { return $false }
    return $true
}

# Reconstruir el archivo:
# 1. Cabecera
# 2. Datos historicos (sprints 30-34) 
# 3. Datos Sprint 35 (actualizados)
# 4. Datos Sprint 36 (nuevos)
# 5. Pie

$fechaHoy = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$nuevasCabecera = @("// Datos actualizados - Generado: $fechaHoy")

# Separar la primera linea (header) del resto
$primeraLinea = $existingLines | Select-Object -First 1
$lineaConst = $existingLines | Where-Object { $_ -match '^const ticketsData' } | Select-Object -First 1
$lineaCierre = $existingLines | Where-Object { $_ -match '^\];' } | Select-Object -First 1

# Obtener solo las lineas de datos (entradas de tickets) sin sprint 35/36
$lineasDatos = $existingLines | Where-Object {
    if ($_ -match '^const ticketsData') { return $false }
    if ($_ -match '^\];') { return $false }
    if ($_ -match '^\s*//') { return $false }
    if ($_ -match 'sprint: "35"' -or $_ -match "sprint: '35'") { return $false }
    if ($_ -match 'sprint: "36"' -or $_ -match "sprint: '36'") { return $false }
    if ($_ -eq '') { return $false }
    return $true
}

# Construir nuevo archivo
$nuevoContenido = @()
$nuevoContenido += "// Datos actualizados - Generado: $fechaHoy"
$nuevoContenido += "const ticketsData = ["
$nuevoContenido += $lineasDatos
$nuevoContenido += ""
$nuevoContenido += "  // ===== SPRINT 35 (16 Feb - 02 Mar 2026) | 77 tickets | 43 finalizados | 36 arrastrados a S36 ====="
$nuevoContenido += $lineas35
$nuevoContenido += ""
$nuevoContenido += "  // ===== SPRINT 36 (02 Mar 2026 - activo) | $($r36.total) tickets | incluye 36 arrastrados de S35 ====="
$nuevoContenido += $lineas36
$nuevoContenido += "];"

# Guardar backup primero
Copy-Item "dashboard_data.js" "dashboard_data.js.bak" -Force
Write-Host "Backup guardado: dashboard_data.js.bak"

# Escribir nuevo archivo
$nuevoContenido | Out-File "dashboard_data.js" -Encoding UTF8 -Force
Write-Host "dashboard_data.js actualizado con $($nuevoContenido.Count) lineas"

# Verificar conteos
$verify = Get-Content "dashboard_data.js"
$vs35 = ($verify | Where-Object { $_ -match 'sprint: "35"' }).Count
$vs36 = ($verify | Where-Object { $_ -match 'sprint: "36"' }).Count
Write-Host "Verificacion - S35: $vs35 tickets | S36: $vs36 tickets"

# Mostrar KPIs finales Sprint 35
Write-Host "`n=== KPIs FINALES SPRINT 35 ==="
$finalizados35 = ($r35.issues | Where-Object { $_.fields.status.name -eq "Finalizada" }).Count
$arrastrados35 = $inBoth.Count
$bugs35 = ($r35.issues | Where-Object { $_.fields.issuetype.name -eq "Error" }).Count
$bugsResueltos35 = ($r35.issues | Where-Object { $_.fields.issuetype.name -eq "Error" -and $_.fields.status.name -eq "Finalizada" }).Count
$spTotal35 = ($r35.issues | ForEach-Object { if ($_.fields.customfield_10016) { [double]$_.fields.customfield_10016 } else { 0 } } | Measure-Object -Sum).Sum
$spCompletado35 = ($r35.issues | Where-Object { $_.fields.status.name -eq "Finalizada" } | ForEach-Object { if ($_.fields.customfield_10016) { [double]$_.fields.customfield_10016 } else { 0 } } | Measure-Object -Sum).Sum

Write-Host "Total tickets: 77"
Write-Host "Finalizados: $finalizados35 ($([Math]::Round($finalizados35*100/77,1))%)"
Write-Host "Arrastrados a S36: $arrastrados35 ($([Math]::Round($arrastrados35*100/77,1))%)"
Write-Host "Bugs reportados: $bugs35 | Resueltos: $bugsResueltos35 ($([Math]::Round($bugsResueltos35*100/$bugs35,1))%)"
Write-Host "Story Points totales: $spTotal35 | Completados: $spCompletado35"
Write-Host "Velocidad (SP completados): $spCompletado35"
