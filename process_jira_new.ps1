# Script para procesar el nuevo CSV de Jira y generar dashboard_data.js
# Fecha: 03/02/2026

param(
    [string]$CsvPath = "c:\Users\scervantes\Downloads\Jira  (7).csv",
    [string]$OutputPath = "c:\Users\scervantes\Downloads\KPIs_Gestion_Calidad_Dev_Sprint30\dashboard_data.js"
)

Write-Host "Procesando CSV de Jira..." -ForegroundColor Cyan

# Leer CSV manualmente para manejar columnas duplicadas
$csvLines = Get-Content -Path $CsvPath -Encoding UTF8
$ticketsArray = @()

for ($i = 1; $i -lt $csvLines.Count; $i++) {
    $line = $csvLines[$i]
    
    # Dividir por comas (considerando comillas)
    $fields = @()
    $currentField = ""
    $inQuotes = $false
    
    for ($j = 0; $j -lt $line.Length; $j++) {
        $char = $line[$j]
        
        if ($char -eq '"') {
            $inQuotes = -not $inQuotes
        } elseif ($char -eq ',' -and -not $inQuotes) {
            $fields += $currentField
            $currentField = ""
        } else {
            $currentField += $char
        }
    }
    $fields += $currentField
    
    # Extraer valores
    if ($fields.Count -lt 19) { continue }
    
    $tipoIncidencia = $fields[0].Trim()
    $claveIncidencia = $fields[1].Trim()
    $resumen = $fields[3].Trim()
    $asignado = if ($fields[4].Trim() -ne "") { $fields[4].Trim() } else { "Sin asignar" }
    $prioridad = if ($fields[6].Trim() -ne "") { $fields[6].Trim() } else { "Medium" }
    $estado = $fields[7].Trim()
    $creada = $fields[9].Trim()
    $actualizada = $fields[10].Trim()
    
    # Extraer sprints de columnas 11-16 (índices 11-16)
    $sprints = @()
    for ($k = 11; $k -le 16; $k++) {
        if ($k -lt $fields.Count) {
            $sprintField = $fields[$k].Trim()
            if ($sprintField -match 'Sprint (\d+)') {
                $sprintNum = [int]$matches[1]
                if ($sprints -notcontains $sprintNum) {
                    $sprints += $sprintNum
                }
            }
        }
    }
    
    $resuelta = if (17 -lt $fields.Count) { $fields[17].Trim() } else { "" }
    $storyPointEstimate = if (18 -lt $fields.Count) { $fields[18].Trim() } else { "" }
    
    # Normalizar estado
    $estadoNormalizado = switch ($estado) {
        "Tareas por hacer" { "Tareas por hacer" }
        "To Do" { "Tareas por hacer" }
        "Blocked" { "Tareas por hacer" }
        "Finalizada" { "Finalizados" }
        "Done" { "Finalizados" }
        "Closed" { "Finalizados" }
        default { "En curso" }  # Todo lo demás es "En curso"
    }
    
    # Calcular días de resolución según el estado
    $diasResolucionReal = ""
    
    # Función para parsear fechas - con mapeo manual de meses
    function Parse-Fecha {
        param($fechaStr)
        if (-not $fechaStr -or $fechaStr.Trim() -eq "") { return $null }
        
        try {
            $fechaStr = $fechaStr.Trim()
            
            # Mapa de meses en español
            $mesesMap = @{
                "ene" = "01"; "feb" = "02"; "mar" = "03"; "abr" = "04"
                "may" = "05"; "jun" = "06"; "jul" = "07"; "ago" = "08"
                "sep" = "09"; "oct" = "10"; "nov" = "11"; "dic" = "12"
            }
            
            # Parsear manualmente: dd/MMM/yy
            if ($fechaStr -match "(\d{1,2})/(\w{3})/(\d{2})") {
                $dia = $matches[1].PadLeft(2, '0')
                $mes = $mesesMap[$matches[2].ToLower()]
                $anio = "20" + $matches[3]
                
                if ($mes) {
                    $fechaFormateada = "$anio-$mes-$dia"
                    return [DateTime]::Parse($fechaFormateada)
                }
            }
            
            return $null
        } catch {
            return $null
        }
    }
    
    try {
        $creadaDate = Parse-Fecha $creada
        
        if ($creadaDate) {
            if ($estadoNormalizado -eq "Finalizados" -and $resuelta -and $resuelta.Trim() -ne "") {
                # Ticket FINALIZADO: calcular días hasta resolución
                $resueltaDate = Parse-Fecha $resuelta
                if ($resueltaDate) {
                    $diasResolucionReal = [math]::Round(($resueltaDate - $creadaDate).TotalDays, 1)
                }
            } elseif ($estadoNormalizado -eq "En curso") {
                # Ticket EN CURSO: calcular días hasta actualización
                $actualizadaDate = Parse-Fecha $actualizada
                if ($actualizadaDate) {
                    $diasResolucionReal = [math]::Round(($actualizadaDate - $creadaDate).TotalDays, 1)
                }
            }
        }
        # Si es "Tareas por hacer", no calcular días (queda vacío)
    } catch {
        $diasResolucionReal = ""
    }
    
    # Limpiar fecha resuelta si está en "Tareas por hacer"
    if ($estadoNormalizado -eq "Tareas por hacer") {
        $resuelta = ""
    }
    
    # Crear objeto por cada sprint
    foreach ($sprint in $sprints) {
        $ticketObj = @{
            clave = $claveIncidencia
            tipoIncidencia = $tipoIncidencia
            resumen = $resumen
            asignado = $asignado
            prioridad = $prioridad
            estado = $estado
            estadoNormalizado = $estadoNormalizado
            creada = $creada
            actualizada = $actualizada
            resuelta = $resuelta
            sprint = $sprint
            sprints = ($sprints -join ", ")
            diasResolucionReal = $diasResolucionReal
            storyPointEstimate = $storyPointEstimate
        }
        
        $ticketsArray += $ticketObj
    }
}

Write-Host "Total de registros procesados: $($ticketsArray.Count)" -ForegroundColor Green

# Generar archivo JavaScript
$jsContent = @"
// Datos actualizados - Generado: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
const ticketsData = [

"@

foreach ($ticket in $ticketsArray) {
    $clave = $ticket.clave
    $tipoIncidencia = $ticket.tipoIncidencia
    $resumen = $ticket.resumen -replace '"', '\"' -replace "`n", " " -replace "`r", ""
    $asignado = $ticket.asignado
    $prioridad = $ticket.prioridad
    $estado = $ticket.estado
    $estadoNormalizado = $ticket.estadoNormalizado
    $creada = $ticket.creada
    $actualizada = $ticket.actualizada
    $resuelta = $ticket.resuelta
    $sprint = $ticket.sprint
    $sprints = $ticket.sprints
    $diasResolucionReal = $ticket.diasResolucionReal
    $storyPointEstimate = $ticket.storyPointEstimate
    
    $jsContent += "  {clave: `"$clave`", tipoIncidencia: `"$tipoIncidencia`", resumen: `"$resumen`", asignado: `"$asignado`", prioridad: `"$prioridad`", estado: `"$estado`", estadoNormalizado: `"$estadoNormalizado`", creada: `"$creada`", actualizada: `"$actualizada`", resuelta: `"$resuelta`", sprint: `"$sprint`", sprints: `"$sprints`", diasResolucionReal: `"$diasResolucionReal`", storyPointEstimate: `"$storyPointEstimate`"},`n"
}

$jsContent += @"
];

// Función auxiliar para calcular días de resolución
function calcularDiasResolucion(fechaCreada, fechaResuelta) {
    if (!fechaResuelta || fechaResuelta === '') return '-';
    
    try {
        const meses = { 'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5, 
                       'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11 };
        
        const parseDate = (str) => {
            const parts = str.split('/');
            if (parts.length < 3) return null;
            const dia = parseInt(parts[0]);
            const mes = meses[parts[1].toLowerCase()];
            const anio = 2000 + parseInt(parts[2].substring(0, 2));
            return new Date(anio, mes, dia);
        };
        
        const creada = parseDate(fechaCreada);
        const resuelta = parseDate(fechaResuelta);
        
        if (!creada || !resuelta) return '-';
        
        const diffTime = Math.abs(resuelta - creada);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    } catch (e) {
        return '-';
    }
}
"@

# Guardar archivo
$jsContent | Out-File -FilePath $OutputPath -Encoding UTF8 -NoNewline

Write-Host "Archivo generado exitosamente: $OutputPath" -ForegroundColor Green
Write-Host "Total de tickets en el dashboard: $($ticketsArray.Count)" -ForegroundColor Cyan
