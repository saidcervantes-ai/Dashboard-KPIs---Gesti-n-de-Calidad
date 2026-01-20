# ========================================
#   Dashboard KPIs - Servidor Local
# ========================================

Write-Host "`nIniciando servidor web en puerto 8080...`n" -ForegroundColor Cyan

Write-Host "Para acceder al dashboard, abre tu navegador en:`n" -ForegroundColor Green
Write-Host "   http://localhost:8080/Dashboard_Dinamico_Editable.html`n" -ForegroundColor Yellow

Write-Host "Para compartir en tu red local, encuentra tu IP:" -ForegroundColor Green
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike "127.*"} | Select-Object IPAddress, InterfaceAlias | Format-Table

Write-Host "Ejemplo: http://TU_IP:8080/Dashboard_Dinamico_Editable.html`n" -ForegroundColor Yellow
Write-Host "Presiona Ctrl+C para detener el servidor`n" -ForegroundColor Red
Write-Host "========================================`n" -ForegroundColor Cyan

# Iniciar servidor Python
python -m http.server 8080
