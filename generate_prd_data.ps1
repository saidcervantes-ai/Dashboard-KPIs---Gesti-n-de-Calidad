# Script para generar dashboard_data_prd.js desde CSV de incidentes de produccion

$csvPath = "jira_incidents_prd.csv"
$outputJs = "dashboard_data_prd.js"

Write-Host "Procesando CSV de incidentes de produccion..." -ForegroundColor Cyan

# Leer CSV
try {
    $tickets = Import-Csv -Path $csvPath -Encoding UTF8
} catch {
    Write-Host "Error al leer el CSV" -ForegroundColor Red
    exit 1
}

Write-Host "Total de tickets: $($tickets.Count)" -ForegroundColor Green

# Funcion para convertir fecha
function ConvertTo-ShortDate {
    param($fecha)
    
    if ([string]::IsNullOrWhiteSpace($fecha)) {
        return ""
    }
    
    try {
        $fechaEn = $fecha -replace 'ene','Jan' -replace 'feb','Feb' -replace 'mar','Mar' -replace 'abr','Apr' -replace 'may','May' -replace 'jun','Jun' -replace 'jul','Jul' -replace 'ago','Aug' -replace 'sep','Sep' -replace 'oct','Oct' -replace 'nov','Nov' -replace 'dic','Dec'
        
        $dt = [DateTime]::Parse($fechaEn)
        return $dt.ToString("dd/MMM/yy", [System.Globalization.CultureInfo]::CreateSpecificCulture("es-ES"))
    } catch {
        return $fecha
    }
}

# Funcion para obtener mes/año
function Get-MonthYear {
    param($fecha)
    
    if ([string]::IsNullOrWhiteSpace($fecha)) {
        return "Sin Fecha"
    }
    
    try {
        $fechaEn = $fecha -replace 'ene','Jan' -replace 'feb','Feb' -replace 'mar','Mar' -replace 'abr','Apr' -replace 'may','May' -replace 'jun','Jun' -replace 'jul','Jul' -replace 'ago','Aug' -replace 'sep','Sep' -replace 'oct','Oct' -replace 'nov','Nov' -replace 'dic','Dec'
        
        $dt = [DateTime]::Parse($fechaEn)
        
        $meses = @{
            1 = "Enero"; 2 = "Febrero"; 3 = "Marzo"; 4 = "Abril"
            5 = "Mayo"; 6 = "Junio"; 7 = "Julio"; 8 = "Agosto"
            9 = "Septiembre"; 10 = "Octubre"; 11 = "Noviembre"; 12 = "Diciembre"
        }
        
        return "$($meses[$dt.Month]) $($dt.Year)"
    } catch {
        return "Sin Fecha"
    }
}

# Funcion para limpiar texto
function Clean-JSString {
    param($text)
    
    if ([string]::IsNullOrWhiteSpace($text)) {
        return ""
    }
    
    $text = $text.Replace('\', '\\')
    $text = $text.Replace('"', '\"')
    $text = $text.Replace("`n", ' ')
    $text = $text.Replace("`r", '')
    $text = $text -replace '\s+', ' '
    
    return $text.Trim()
}

# Procesar tickets
$ticketsJS = @()

foreach ($ticket in $tickets) {
    $clave = Clean-JSString $ticket.'Clave de incidencia'
    $resumen = Clean-JSString $ticket.'Resumen'
    $asignado = Clean-JSString $ticket.'Persona asignada'
    $informador = Clean-JSString $ticket.'Informador'
    $prioridad = Clean-JSString $ticket.'Prioridad'
    $estado = Clean-JSString $ticket.'Estado'
    $resolucion = Clean-JSString $ticket.'Resolución'
    $creada = ConvertTo-ShortDate $ticket.'Creada'
    $actualizada = ConvertTo-ShortDate $ticket.'Actualizada'
    $mes = Get-MonthYear $ticket.'Creada'
    
    if ([string]::IsNullOrWhiteSpace($asignado)) {
        $asignado = "Sin asignar"
    }
    
    if ([string]::IsNullOrWhiteSpace($informador)) {
        $informador = "Sin informador"
    }
    
    $ticketJS = "    { clave: `"$clave`", resumen: `"$resumen`", asignado: `"$asignado`", informador: `"$informador`", prioridad: `"$prioridad`", estado: `"$estado`", resolucion: `"$resolucion`", creada: `"$creada`", actualizada: `"$actualizada`", mes: `"$mes`" }"
    
    $ticketsJS += $ticketJS
}

# Ordenar por numero de ticket (mas recientes primero)
$ticketsJS = $ticketsJS | Sort-Object { 
    $match = $_ -match 'clave: "([^"]+)"'
    if ($match) {
        $key = $Matches[1]
        if ($key -match '-(\d+)$') {
            return -[int]$Matches[1]
        }
    }
    return 0
}

# Generar archivo JavaScript
$fecha = Get-Date -Format 'dd/MM/yyyy HH:mm:ss'
$jsContent = "// dashboard_data_prd.js - Datos de Incidentes de Produccion`n"
$jsContent += "// Generado desde Jira CSV`n"
$jsContent += "// Fecha: $fecha`n`n"
$jsContent += "const bugsPRD = [`n"
$jsContent += $ticketsJS -join ",`n"
$jsContent += "`n];"

# Guardar archivo
$jsContent | Out-File -FilePath $outputJs -Encoding UTF8 -NoNewline

Write-Host "Archivo generado: $outputJs" -ForegroundColor Green
Write-Host "Total procesados: $($ticketsJS.Count)" -ForegroundColor Green

# Distribucion por mes
Write-Host "`nDistribucion por mes:" -ForegroundColor Cyan
$tickets | ForEach-Object { Get-MonthYear $_.'Creada' } | Group-Object | Sort-Object Name | ForEach-Object {
    Write-Host "  $($_.Name): $($_.Count) incidentes"
}

# Distribucion por estado  
Write-Host "`nDistribucion por estado:" -ForegroundColor Cyan
$tickets | Group-Object 'Estado' | Sort-Object Count -Descending | ForEach-Object {
    Write-Host "  $($_.Name): $($_.Count) incidentes"
}

Write-Host "`nDashboard PRD actualizado" -ForegroundColor Green
