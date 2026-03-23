# Script para extraer changelog de tickets específicos de JIRA
# Con parámetro &expand=changelog para obtener el histórico completo

$jiraUrl = "https://vocali.atlassian.net"
$email = "said.cervantes@vocali.net"
$apiToken = $env:JIRA_API_TOKEN  # Cargar desde variable de entorno o jira_config.json

$credentials = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${email}:${apiToken}"))

$headers = @{
    "Authorization" = "Basic $credentials"
    "Content-Type" = "application/json"
}

# Todos los tickets de Sprint 35 + Sprint 36 (unicos)
$tickets = @(
    # Sprint 35
    'IMS-1094','IMS-1093','IMS-1092','IMS-1090','IMS-1089','IMS-1087','IMS-1085',
    'IMS-1084','IMS-1082','IMS-1081','IMS-1080','IMS-1079','IMS-1078','IMS-1072',
    'IMS-1071','IMS-1069','IMS-1064','IMS-1052','IMS-1051','IMS-1043','IMS-1036',
    'IMS-1033','IMS-1028','IMS-1027','IMS-1023','IMS-1017','IMS-1012','IMS-1007',
    'IMS-1003','IMS-1001','IMS-1000','IMS-999','IMS-998','IMS-997','IMS-994',
    'IMS-993','IMS-992','IMS-990','IMS-987','IMS-984','IMS-982','IMS-974',
    'IMS-970','IMS-966','IMS-963','IMS-954','IMS-897','IMS-894','IMS-885',
    'IMS-879','IMS-878','IMS-877','IMS-876','IMS-860','IMS-777',
    # Sprint 36 (excluyendo los ya incluidos en S35)
    'IMS-1127','IMS-1150','IMS-1171','IMS-1170','IMS-1140','IMS-1138','IMS-1135',
    'IMS-1157','IMS-1162','IMS-1143','IMS-1177','IMS-1115','IMS-1139','IMS-1133',
    'IMS-1044','IMS-1165','IMS-1130','IMS-1155','IMS-1098','IMS-1163','IMS-1173',
    'IMS-1147','IMS-874','IMS-1179','IMS-1175','IMS-1169','IMS-1168','IMS-1144',
    'IMS-1145','IMS-1151','IMS-1156','IMS-1120','IMS-1154','IMS-1045','IMS-1050',
    'IMS-1132','IMS-1142','IMS-1136','IMS-1131','IMS-1149','IMS-1152','IMS-1158',
    'IMS-1166','IMS-1129','IMS-1160','IMS-1161','IMS-1172','IMS-1176','IMS-1180',
    'IMS-1137','IMS-1181','IMS-1182','IMS-1141','IMS-1046',
    # S36 criticos abiertos (algunos ya en S35, se desduplicaran)
    'IMS-1116','IMS-997','IMS-1174','IMS-1164','IMS-1146','IMS-1148'
) | Select-Object -Unique

Write-Host "EXTRACCION DE CHANGELOG DE JIRA (CON CHANGELOG EXPANDIDO)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Tickets a procesar: $($tickets.Count)" -ForegroundColor White
Write-Host ""

function NormalizarEstado {
    param([string]$estado)
    $s = $estado.ToLower().Trim()
    $map = @{
        'to do'='To do'
        'tareas por hacer'='To do'
        'backlog'='Backlog'
        'in progress'='In Process'
        'in process'='In Process'
        'en curso'='In Process'
        'blocked'='Blocked'
        'code review'='CODE REVIEW'
        'in test dev'='IN TEST DEV'
        'test in dev'='IN TEST DEV'
        'in test'='In Test'
        'test issues'='Test Issues'
        'done'='Finalizados'
    }
    
    if ($map.ContainsKey($s)) {
        return $map[$s]
    } else {
        return $estado
    }
}

# Calcula dias laborales reales: Lunes-Viernes 08:00-17:00 (9h/dia)
# Opcion C: si el tiempo laboral calculado = 0 pero la transicion real duro <= 4h,
# se usa el tiempo real (en la misma unidad: dias de 540 min) para no perder
# trabajo realizado fuera de horario por personas que trabajan hasta las 9pm.
function CalcularDias {
    param([DateTime]$inicio, [DateTime]$fin)
    if ($fin -le $inicio) { return 0 }
    
    $totalMinutos = 0
    $current = $inicio
    
    while ($current -lt $fin) {
        $dow = [int]$current.DayOfWeek  # 0=Dom, 1=Lun, ..., 6=Sab
        
        if ($dow -ge 1 -and $dow -le 5) {  # Lunes a Viernes
            $y = $current.Year; $m = $current.Month; $d = $current.Day
            $labInicio = [DateTime]::new($y, $m, $d, 8, 0, 0)   # 08:00
            $labFin    = [DateTime]::new($y, $m, $d, 17, 0, 0)  # 17:00
            
            $desde = if ($current -gt $labInicio) { $current } else { $labInicio }
            $hasta = if ($fin -lt $labFin) { $fin } else { $labFin }
            
            if ($hasta -gt $desde) {
                $totalMinutos += ($hasta - $desde).TotalMinutes
            }
        }
        
        # Avanzar al inicio del siguiente dia
        $current = [DateTime]::new($current.Year, $current.Month, $current.Day).AddDays(1)
    }
    
    # Opcion C: fallback de tiempo real para transiciones cortas fuera de horario
    # Si el tiempo laboral = 0 pero la transicion real duro <= 5 horas (300 min),
    # usar el tiempo real en lugar de 0 (mismo divisor: 540 min = 1 dia laboral)
    if ($totalMinutos -eq 0) {
        $minutosReales = ($fin - $inicio).TotalMinutes
        if ($minutosReales -gt 0 -and $minutosReales -le 300) {
            return [Math]::Round($minutosReales / 540, 2)
        }
    }
    
    # 1 dia laboral = 9 horas = 540 minutos
    return [Math]::Round($totalMinutos / 540, 1)
}

$changelogData = @{}
$correctos = 0
$errores = 0

foreach ($ticketKey in $tickets) {
    Write-Host "Extrayendo $ticketKey..." -ForegroundColor Yellow
    
    try {
        # Incluir expand=changelog para obtener el histórico completo
        $issueUrl = "$jiraUrl/rest/api/2/issue/$ticketKey`?expand=changelog"
        $issue = Invoke-RestMethod -Uri $issueUrl -Headers $headers -TimeoutSec 10
        
        $historial = @()
        
        if ($issue.changelog -and $issue.changelog.histories) {
            Write-Host "  - Historias encontradas: $($issue.changelog.histories.Count)" -ForegroundColor Green
            
            $prevState = "To do"
            $prevDate = [DateTime]::Parse($issue.fields.created)
            
            # Ordenar historias por fecha (ascendente)
            $sortedHistories = $issue.changelog.histories | Sort-Object -Property { [DateTime]::Parse($_.created) }
            
            foreach ($history in $sortedHistories) {
                $currDate = [DateTime]::Parse($history.created)
                
                foreach ($item in $history.items) {
                    if ($item.field -eq "status") {
                        $historial += @{
                            estado = NormalizarEstado($prevState)
                            dias = CalcularDias $prevDate $currDate
                            inicio = $prevDate.ToString("dd/MM/yyyy HH:mm")
                            fin = $currDate.ToString("dd/MM/yyyy HH:mm")
                        }
                        
                        $prevState = $item.toString
                        $prevDate = $currDate
                    }
                }
            }
            
            # Agregar estado actual
            $currDateTime = Get-Date
            $historial += @{
                estado = NormalizarEstado($prevState)
                dias = CalcularDias $prevDate $currDateTime
                inicio = $prevDate.ToString("dd/MM/yyyy HH:mm")
                fin = "En curso"
            }
        } else {
            Write-Host "  - No hay histórico de cambios" -ForegroundColor Gray
        }
        
        $changelogData[$ticketKey] = $historial
        $correctos++
        Write-Host "  OK: $($historial.Count) transiciones" -ForegroundColor Green
        
    } catch {
        $errores++
        Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Resultado: $correctos correctos, $errores errores" -ForegroundColor Cyan
Write-Host ""

Write-Host "Generando dashboard_changelog_data.js..." -ForegroundColor Yellow

$js = "const changelogData = {`n"
$keys = $changelogData.Keys | Sort-Object
$total = $keys.Count
$count = 0

foreach ($key in $keys) {
    $count++
    $js += "  '$key': [`n"
    
    $entries = $changelogData[$key]
    for ($i = 0; $i -lt $entries.Count; $i++) {
        $entry = $entries[$i]
        $comma = if ($i -lt $entries.Count - 1) { "," } else { "" }
        $js += "    {estado: '$($entry.estado)', dias: $($entry.dias), inicio: '$($entry.inicio)', fin: '$($entry.fin)'}$comma`n"
    }
    
    if ($count -lt $total) {
        $js += "  ],`n"
    } else {
        $js += "  ]`n"
    }
}

$js += "`n};"

$js | Out-File -FilePath "dashboard_changelog_data.js" -Encoding UTF8 -Force

Write-Host "OK: Archivo generado exitosamente" -ForegroundColor Green
Write-Host ""
