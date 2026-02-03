# Script final para generar datos limpios del dashboard
# Leer el CSV línea por línea para manejar columnas duplicadas de Sprint
$lines = Get-Content "jira_tickets.csv"
$header = $lines[0] -split ','

# Identificar índices de las columnas Sprint
$sprintIndices = @()
for ($i = 0; $i -lt $header.Count; $i++) {
    if ($header[$i] -eq 'Sprint') {
        $sprintIndices += $i
    }
}

# Procesar cada línea
$allData = @()

for ($lineNum = 1; $lineNum -lt $lines.Count; $lineNum++) {
    $line = $lines[$lineNum]
    if (-not $line) { continue }
    
    # Parsear CSV manualmente respetando comillas
    $fields = @()
    $currentField = ""
    $inQuotes = $false
    
    for ($i = 0; $i -lt $line.Length; $i++) {
        $char = $line[$i]
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
    
    if ($fields.Count -lt $header.Count) { continue }
    
    # Extraer todos los sprints
    $sprintNumbers = @()
    foreach ($idx in $sprintIndices) {
        $sprintValue = $fields[$idx].Trim('"')
        if ($sprintValue -and $sprintValue -match 'Sprint\s*-?\s*(\d+)') {
            $sprintNumbers += [int]$Matches[1]
        }
    }
    
    # Si no hay sprints, asignar por defecto
    if ($sprintNumbers.Count -eq 0) {
        $sprintNumbers = @(34)
    }
    
    # El sprint actual es el más alto
    $sprint = ($sprintNumbers | Measure-Object -Maximum).Maximum
    $sprints = ($sprintNumbers | Sort-Object) -join ', '
    
    # Obtener valores de las columnas
    $tipoIncidencia = $fields[[array]::IndexOf($header, 'Tipo de Incidencia')].Trim('"')
    $clave = $fields[[array]::IndexOf($header, 'Clave de incidencia')].Trim('"')
    $resumen = $fields[[array]::IndexOf($header, 'Resumen')].Trim('"')
    $asignado = $fields[[array]::IndexOf($header, 'Persona asignada')].Trim('"')
    $prioridad = $fields[[array]::IndexOf($header, 'Prioridad')].Trim('"')
    $estado = $fields[[array]::IndexOf($header, 'Estado')].Trim('"')
    $creada = $fields[[array]::IndexOf($header, 'Creada')].Trim('"')
    $actualizada = $fields[[array]::IndexOf($header, 'Actualizada')].Trim('"')
    $resuelta = $fields[[array]::IndexOf($header, 'Resuelta')].Trim('"').Trim()
    $storyPoints = $fields[[array]::IndexOf($header, 'Campo personalizado (Story point estimate)')].Trim('"').Trim()
    
    if (-not $asignado) { $asignado = "Sin asignar" }
    if (-not $tipoIncidencia) { $tipoIncidencia = "Tarea" }
    
    # Normalizar estado
    $estadoNorm = "Tareas por hacer"  # Por defecto
    
    # Finalizados
    if ($estado -match 'Done|Hecho|Finalizada|Cerrada|Closed') {
        $estadoNorm = "Finalizados"
    }
    # En Curso - Estados específicos
    elseif ($estado -match 'IN PROCESS|BLOCKED|CODE REVIEW|IN TEST DEV|IN TEST.*QA|TEST ISSUES') {
        $estadoNorm = "En Curso"
    }
    # Tareas por hacer - por defecto para el resto
    
    if ($prioridad -notmatch '^(Highest|High|Medium|Low|Lowest)$') {
        $prioridad = "Medium"
    }
    
    # Calcular días reales de resolución
    $diasReal = ""
    if ($creada -and $resuelta -and $resuelta -ne "") {
        try {
            # Convertir nombres de meses en español a inglés
            $creadaEn = $creada -replace 'ene','Jan' -replace 'feb','Feb' -replace 'mar','Mar' -replace 'abr','Apr' -replace 'may','May' -replace 'jun','Jun' -replace 'jul','Jul' -replace 'ago','Aug' -replace 'sep','Sep' -replace 'oct','Oct' -replace 'nov','Nov' -replace 'dic','Dec'
            $resueltaEn = $resuelta -replace 'ene','Jan' -replace 'feb','Feb' -replace 'mar','Mar' -replace 'abr','Apr' -replace 'may','May' -replace 'jun','Jun' -replace 'jul','Jul' -replace 'ago','Aug' -replace 'sep','Sep' -replace 'oct','Oct' -replace 'nov','Nov' -replace 'dic','Dec'
            
            $fechaCreada = [DateTime]::Parse($creadaEn)
            $fechaResuelta = [DateTime]::Parse($resueltaEn)
            $diasCalculados = [math]::Round(($fechaResuelta - $fechaCreada).TotalDays, 1)
            
            # Si el valor es 0, usar 0.5 como valor mínimo
            if ($diasCalculados -eq 0) {
                $diasReal = "0.5"
            } else {
                $diasReal = $diasCalculados.ToString()
            }
        } catch {
            $diasReal = ""
        }
    }
    
    # Calcular desviación (si hay story points y días reales)
    $desviacion = ""
    if ($diasReal -ne "" -and $diasReal -ne $null -and $storyPoints -ne "" -and $storyPoints -ne $null) {
        try {
            $spValue = [double]$storyPoints
            $drValue = [double]$diasReal
            $desviacion = [math]::Round($drValue - $spValue, 1).ToString()
        } catch {
            # Silenciar error
        }
    }
    
    $allData += [PSCustomObject]@{
        Clave = $clave
        TipoIncidencia = $tipoIncidencia
        Resumen = $resumen
        Asignado = $asignado
        Prioridad = $prioridad
        Estado = $estado
        Estado_Normalizado = $estadoNorm
        Creada = $creada
        Actualizada = $actualizada
        Resuelta = $resuelta
        Sprint = $sprint
        Sprints = $sprints
        DiasResolucionReal = $diasReal
        StoryPointEstimate = $storyPoints
        Desviacion = $desviacion
    }
}

Write-Output "Procesando $($allData.Count) tickets..."

# Generar JavaScript
$jsContent = "// Datos actualizados - Generado: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n"
$jsContent += "const ticketsData = [`n"

foreach ($item in $allData) {
    $resumenClean = $item.Resumen -replace '"', '\"' -replace "`n", ' ' -replace "`r", '' -replace '\s+', ' '
    $jsContent += "  {"
    $jsContent += "clave: `"$($item.Clave)`", "
    $jsContent += "tipoIncidencia: `"$($item.TipoIncidencia)`", "
    $jsContent += "resumen: `"$resumenClean`", "
    $jsContent += "asignado: `"$($item.Asignado)`", "
    $jsContent += "prioridad: `"$($item.Prioridad)`", "
    $jsContent += "estado: `"$($item.Estado)`", "
    $jsContent += "estadoNormalizado: `"$($item.Estado_Normalizado)`", "
    $jsContent += "creada: `"$($item.Creada)`", "
    $jsContent += "actualizada: `"$($item.Actualizada)`", "
    $jsContent += "resuelta: `"$($item.Resuelta)`", "
    $jsContent += "sprint: `"$($item.Sprint)`", "
    $jsContent += "sprints: `"$($item.Sprints)`", "
    $jsContent += "diasResolucionReal: `"$($item.DiasResolucionReal)`", "
    $jsContent += "storyPointEstimate: `"$($item.StoryPointEstimate)`", "
    $jsContent += "desviacion: `"$($item.Desviacion)`""
    $jsContent += "},`n"
}

$jsContent += "];"

$jsContent | Out-File "dashboard_data.js" -Encoding UTF8

Write-Output "`nArchivo dashboard_data.js generado con $($allData.Count) tickets"

# Mostrar resumen
Write-Output "`nDistribucion por Sprint:"
$allData | Group-Object Sprint | Sort-Object Name | ForEach-Object {
    Write-Output "  Sprint $($_.Name): $($_.Count) tickets"
}

Write-Output "`nDistribucion por Estado:"
$allData | Group-Object Estado_Normalizado | Sort-Object Name | ForEach-Object {
    Write-Output "  $($_.Name): $($_.Count) tickets"
}

Write-Output "`nDistribucion por Prioridad:"
$allData | Group-Object Prioridad | Sort-Object Name | ForEach-Object {
    Write-Output "  $($_.Name): $($_.Count) tickets"
}

Write-Output ""
Write-Output "Primeros 5 tickets:"
Write-Output ""
$allData | Select-Object -First 5 Clave, Prioridad, Estado_Normalizado, Sprint | Format-Table
