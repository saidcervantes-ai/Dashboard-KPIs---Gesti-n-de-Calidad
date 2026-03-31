# =============================================================
# append_sprint37.ps1
# Solo extrae Sprint 37 de Jira y AGREGA los tickets al
# dashboard_data.js existente (sin tocar S35/S36).
# Tambien marca como "Arrastrado" los tickets de S36 que
# pasaron a S37.
# Sprint 37 ID: 1229
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

$SPRINT_ID_37 = 1229
$FIELDS = "summary,status,issuetype,assignee,created,resolutiondate,updated,priority,customfield_10016,customfield_10020"

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
# 1. Obtener tickets de Sprint 37
# -----------------------------------------------------------
Write-Host "`n=== Obteniendo tickets de Sprint 37 ===" -ForegroundColor Yellow
$s37issues = @()
$startAt = 0
do {
    $url = "$jiraUrl/rest/agile/1.0/sprint/$SPRINT_ID_37/issue?startAt=$startAt&maxResults=100&fields=$FIELDS"
    try {
        $r = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
    } catch {
        Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
    $s37issues += $r.issues
    $startAt += $r.issues.Count
    Write-Host "  Obtenidos: $($s37issues.Count) / $($r.total)"
} while ($s37issues.Count -lt $r.total)

Write-Host "Sprint 37: $($s37issues.Count) tickets totales" -ForegroundColor Green

# Mostrar estados
$s37issues | Group-Object { $_.fields.status.name } | Select-Object Name, Count | Sort-Object Count -Descending | Format-Table -AutoSize

# Claves de S37
$keys37 = $s37issues | Select-Object -ExpandProperty key

# -----------------------------------------------------------
# 2. Leer dashboard_data.js actual (tiene S35 + S36)
# -----------------------------------------------------------
Write-Host "`n=== Leyendo dashboard_data.js actual ===" -ForegroundColor Yellow
$dataContent = Get-Content "dashboard_data.js" -Raw -Encoding UTF8

# Verificar cuantos tickets tiene (contando lineas con "clave:")
$countExisting = ([regex]::Matches($dataContent, '"clave":\s*"IMS-')).Count +
                 ([regex]::Matches($dataContent, 'clave:\s*"IMS-')).Count
Write-Host "Tickets actuales en el archivo: $countExisting"

# Detectar claves de S36 que estan en S37 (arrastrados)
$s36KeysInFile = [regex]::Matches($dataContent, 'clave:\s*"([^"]+)"[^}]*sprint:\s*"36"') |
    ForEach-Object { $_.Groups[1].Value }
$arrastradosS36 = $s36KeysInFile | Where-Object { $keys37 -contains $_ }
Write-Host "Tickets S36 arrastrados a S37: $($arrastradosS36.Count)"

# -----------------------------------------------------------
# 3. Marcar tickets S36 arrastrados a S37 como "Arrastrado"
# -----------------------------------------------------------
Write-Host "`n=== Marcando arrastrados S36 -> S37 ===" -ForegroundColor Yellow

foreach ($key in $arrastradosS36) {
    # Patron: linea que tiene este clave y sprint:"36"
    # Reemplazar estado:"CUALQUIER_COSA" y estadoNormalizado:"CUALQUIER_COSA"
    $pattern = '(clave:\s*"' + [regex]::Escape($key) + '".*?estado:\s*")[^"]*("[^}]*estadoNormalizado:\s*")[^"]*(".*?sprint:\s*"36")'
    if ($dataContent -match $pattern) {
        $dataContent = $dataContent -replace $pattern, '${1}Arrastrado${2}Arrastrado${3}'
        Write-Host "  $key -> Arrastrado" -ForegroundColor Cyan
    } else {
        Write-Host "  $key -> no encontrado en S36 (puede ya estar marcado)" -ForegroundColor DarkYellow
    }
}

# -----------------------------------------------------------
# 4. Generar lineas JS para Sprint 37
# -----------------------------------------------------------
Write-Host "`n=== Generando entradas Sprint 37 ===" -ForegroundColor Yellow

$lineas37 = @()
foreach ($t in $s37issues) {
    $key      = $t.key
    $summary  = ($t.fields.summary -replace '"', "'") -replace '\\', '\\'
    $tipo     = $t.fields.issuetype.name
    $rawSt    = $t.fields.status.name
    $stNorm   = Normalize-Estado $rawSt
    $asignado = if ($t.fields.assignee) { $t.fields.assignee.displayName } else { "Sin asignar" }
    $prioridad = if ($t.fields.priority) { $t.fields.priority.name } else { "Medium" }
    $creada   = Format-Fecha $t.fields.created
    $resuelta = if ($t.fields.resolutiondate) { Format-Fecha $t.fields.resolutiondate } else { "" }
    $updated  = Format-Fecha $t.fields.updated
    $sp       = if ($t.fields.customfield_10016) { $t.fields.customfield_10016.ToString() } else { "" }

    $dias = ""
    if ($resuelta -ne "" -and $t.fields.created -and $t.fields.resolutiondate) {
        try {
            $c = [DateTime]::Parse($t.fields.created.Substring(0,10))
            $r2 = [DateTime]::Parse($t.fields.resolutiondate.Substring(0,10))
            $dias = [Math]::Max(0, ($r2 - $c).Days).ToString()
        } catch {}
    }

    $desv = ""
    if ($dias -ne "" -and $sp -ne "") {
        try { $desv = ([double]$dias - [double]$sp).ToString() } catch {}
    }

    $lineas37 += "  {clave: `"$key`", tipoIncidencia: `"$tipo`", resumen: `"$summary`", asignado: `"$asignado`", prioridad: `"$prioridad`", estado: `"$stNorm`", estadoNormalizado: `"$stNorm`", creada: `"$creada`", actualizada: `"$updated`", resuelta: `"$resuelta`", sprint: `"37`", sprints: `"37`", diasResolucionReal: `"$dias`", storyPointEstimate: `"$sp`", desviacion: `"$desv`"},"
}

Write-Host "Generadas $($lineas37.Count) entradas para Sprint 37" -ForegroundColor Green

# -----------------------------------------------------------
# 5. Insertar S37 al final del array en dashboard_data.js
# -----------------------------------------------------------
Write-Host "`n=== Actualizando dashboard_data.js ===" -ForegroundColor Yellow

# Quitar el cierre del array ]; del final
# El archivo termina con algo como:  ...},\n];\n
# Necesitamos: quitar ]; y despues agregar los nuevos tickets + ];

# Asegurarse que la ultima entrada de S36 tenga coma (el archivo git puede haberla quitado en la ultima linea)
# Buscar el patron del cierre del array
if ($dataContent -match '(\}),?\s*\n\s*\];\s*$') {
    # Reemplazar el cierre ]; con una coma en la ultima entrada + nuevas lineas + ];
    $s37Block = $lineas37 -join "`n"
    # Remover coma final del ultimo ticket S37 (si existe)
    if ($s37Block.EndsWith(',')) {
        $s37Block = $s37Block.Substring(0, $s37Block.Length - 1)
    }
    # Reemplazar el cierre: ultima } seguida de ]; por ultima },\n  S37 entries\n];
    $dataContent = $dataContent -replace '(\}),?\s*(\n\s*\];\s*)$', ('$1,' + "`n" + $s37Block + "`n];")
    Write-Host "Sprint 37 insertado correctamente." -ForegroundColor Green
} else {
    Write-Host "ERROR: No se encontro el patron de cierre del array en dashboard_data.js" -ForegroundColor Red
    exit 1
}

# Actualizar el comentario del encabezado
$dataContent = $dataContent -replace '(// Dashboard Data - Generated:[^\n]+)', "// Dashboard Data - Sprint 35 + 36 (sin modificar) + 37 (append). Actualizado: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

# Guardar
$dataContent | Out-File "dashboard_data.js" -Encoding UTF8 -NoNewline
Write-Host "dashboard_data.js actualizado." -ForegroundColor Green

# Verificar resultado
$finalCount = ([regex]::Matches((Get-Content "dashboard_data.js" -Raw), 'clave:\s*"IMS-')).Count
Write-Host "`nVerificacion final: $finalCount tickets en dashboard_data.js"
$expected = $countExisting + $s37issues.Count
Write-Host "Esperado: $expected (existentes $countExisting + S37: $($s37issues.Count))"

Write-Host "`n=== Listo ===" -ForegroundColor Green
Write-Host "  dashboard_data.js actualizado con Sprint 37 (S35/S36 sin cambios excepto marcadores Arrastrado)"
Write-Host "  dashboard_changelog_data.js no modificado (ya tiene datos frescos de S37)"
Write-Host "  Solo la seccion 'Edad de tickets abiertos' usa Sprint 37 (sprintsAbiertos = ['37'])"
