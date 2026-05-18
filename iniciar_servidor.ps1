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

# Verificar Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js no esta instalado." -ForegroundColor Red
    Write-Host "Descargalo desde https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Instalar http-server una sola vez si no existe
if (-not (Get-Command http-server -ErrorAction SilentlyContinue)) {
    Write-Host "Instalando http-server por unica vez..." -ForegroundColor Yellow
    npm install -g http-server
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] No se pudo instalar http-server." -ForegroundColor Red
        Read-Host "Presiona Enter para salir"
        exit 1
    }
}

# Abrir navegador en 2s y arrancar servidor
Start-Job -ScriptBlock {
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:8080/Dashboard_Dinamico_Editable.html"
} | Out-Null

http-server $PSScriptRoot -p 8080 -c-1 --cors

Write-Host "`nEl servidor se cerro." -ForegroundColor Yellow
Read-Host "Presiona Enter para salir"
