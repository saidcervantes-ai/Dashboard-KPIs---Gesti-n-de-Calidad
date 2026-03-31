# Test de parseo de fechas
$fechasTest = @(
    "30/ene/26 10:17 AM",
    "02/feb/26 4:18 PM",
    "29/ene/26 11:53 AM",
    "27/ene/26 11:44 AM"
)

function Parse-Fecha {
    param($fechaStr)
    if (-not $fechaStr -or $fechaStr.Trim() -eq "") { return $null }
    
    try {
        $fechaStr = $fechaStr.Trim()
        Write-Host "Intentando parsear: '$fechaStr'"
        
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
                Write-Host "  Fecha formateada: $fechaFormateada"
                $fecha = [DateTime]::Parse($fechaFormateada)
                Write-Host "  OK Parseado exitosamente: $fecha"
                return $fecha
            }
        }
        
        Write-Host "  x No se pudo parsear"
        return $null
    } catch {
        Write-Host "  ERROR GENERAL: $($_.Exception.Message)"
        return $null
    }
}

foreach ($fecha in $fechasTest) {
    $resultado = Parse-Fecha $fecha
    Write-Host "Resultado: $resultado"
    Write-Host ""
}

