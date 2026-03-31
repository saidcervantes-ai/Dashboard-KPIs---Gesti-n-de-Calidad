$s35keys = @()
$lines = Get-Content "dashboard_data.js"
foreach ($line in $lines) {
    if ($line -match 'sprint: "35"' -and $line -match 'estadoNormalizado: "Finalizados"') {
        if ($line -match 'clave: "([^"]+)"') {
            $s35keys += $matches[1]
        }
    }
}
Write-Host "S35 Finalizados: $($s35keys.Count)"

$clkeys = @()
$cllines = Get-Content "dashboard_changelog_data.js"
foreach ($line in $cllines) {
    if ($line -match "^\s+'(IMS-\d+)':\s*\[") {
        $clkeys += $matches[1]
    }
}
Write-Host "Changelog entries: $($clkeys.Count)"

$sinCL = $s35keys | Where-Object { $_ -notin $clkeys }
Write-Host "Sin changelog: $($sinCL.Count)"
$sinCL | ForEach-Object { Write-Host "  - $_" }
