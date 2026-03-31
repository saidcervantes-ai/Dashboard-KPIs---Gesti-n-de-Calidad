# 💡 Ejemplos de Uso - Dashboard KPIs con Jira API

Este documento contiene ejemplos prácticos y casos de uso reales para trabajar con la integración de Jira API.

## 📚 Índice

1. [Configuración Inicial](#configuración-inicial)
2. [Consultas JQL Comunes](#consultas-jql-comunes)
3. [Escenarios de Uso](#escenarios-de-uso)
4. [Automatización](#automatización)
5. [Troubleshooting](#troubleshooting)

---

## Configuración Inicial

### Ejemplo 1: Primera configuración completa

```powershell
# Terminal PowerShell

# 1. Configurar conexión (ejecutar una sola vez)
PS> .\Setup-JiraConnection.ps1

# Responder preguntas:
# URL de Jira: https://miempresa.atlassian.net
# Email: juan.perez@empresa.com
# API Token: [pegar token desde Atlassian]
# Proyecto: IMS
# Sprints: 30,31,32,33,34,35

# 2. Probar conexión
PS> .\Test-JiraConnection.ps1

# 3. Primera sincronización
PS> .\iniciar_jira_sync.ps1
```

### Ejemplo 2: Configuración manual del archivo JSON

```json
{
  "jiraUrl": "https://miempresa.atlassian.net",
  "email": "maria.garcia@empresa.com",
  "apiToken": "ATATT3xFfGF0123456789abcdefg",
  "projectKey": "IMS",
  "jql": "project = IMS AND Sprint in ('Sprint 34', 'Sprint 35') AND status != Canceled ORDER BY created DESC",
  "maxResults": 1000
}
```

---

## Consultas JQL Comunes

### 🎯 Por Sprints

```sql
-- Un solo sprint
project = IMS AND Sprint = 'Sprint 34'

-- Múltiples sprints
project = IMS AND Sprint in ('Sprint 32', 'Sprint 33', 'Sprint 34')

-- Sprint actual
project = IMS AND Sprint in openSprints()

-- Sprint actual + últimos 2 cerrados
project = IMS AND Sprint in openSprints() OR Sprint in closedSprints() AND Sprint >= 'Sprint 32'
```

### 🐛 Por Tipo de Issue

```sql
-- Solo bugs
project = IMS AND issuetype = Bug AND Sprint = 'Sprint 34'

-- Bugs y errores críticos
project = IMS AND issuetype = Bug AND priority in (Highest, High)

-- Tareas y stories
project = IMS AND issuetype in (Task, Story) AND Sprint = 'Sprint 34'

-- Excluir épicas
project = IMS AND issuetype != Epic
```

### ⏱️ Por Fechas

```sql
-- Creados en los últimos 30 días
project = IMS AND created >= -30d

-- Actualizados esta semana
project = IMS AND updated >= startOfWeek()

-- Resueltos en enero 2026
project = IMS AND resolved >= '2026-01-01' AND resolved <= '2026-01-31'

-- No actualizados en 7 días
project = IMS AND status != Done AND updated <= -7d
```

### 🎯 Por Estado

```sql
-- En progreso o por hacer
project = IMS AND status in ('To Do', 'In Progress')

-- Todo excepto cancelados
project = IMS AND status != Canceled

-- Listos para QA
project = IMS AND status = 'Ready for QA' AND Sprint = 'Sprint 34'

-- Bloqueados
project = IMS AND status = Blocked
```

### 👥 Por Asignación

```sql
-- Sin asignar
project = IMS AND assignee is EMPTY AND status != Done

-- Asignados a mí
project = IMS AND assignee = currentUser()

-- Equipo específico
project = IMS AND assignee in (user1, user2, user3)

-- Por QA específico
project = IMS AND assignee = 'maria.garcia@empresa.com' AND issuetype = Bug
```

### 🔥 Por Prioridad

```sql
-- Críticos sin resolver
project = IMS AND priority = Highest AND status != Done

-- Alta y media prioridad del sprint actual
project = IMS AND Sprint in openSprints() AND priority in (High, Medium)

-- Baja prioridad antigua
project = IMS AND priority = Low AND created <= -60d AND status != Done
```

### 📊 Consultas Complejas

```sql
-- Bugs críticos del sprint actual sin asignar
project = IMS 
  AND Sprint in openSprints() 
  AND issuetype = Bug 
  AND priority in (Highest, High) 
  AND assignee is EMPTY

-- Issues estancados (no actualizados en 14 días, no finalizados)
project = IMS 
  AND status not in (Done, Canceled, Closed) 
  AND updated <= -14d 
  AND Sprint is not EMPTY
  ORDER BY updated ASC

-- Rendimiento del sprint: completados vs totales
project = IMS 
  AND Sprint = 'Sprint 34' 
  AND (status = Done OR status = 'In Progress' OR status = 'To Do')
  ORDER BY status DESC, priority DESC

-- Issues con muchos comentarios (indicador de problemas)
project = IMS 
  AND Sprint in openSprints() 
  AND comment ~ "." 
  ORDER BY updated DESC
```

---

## Escenarios de Uso

### Escenario 1: Análisis de Sprint Activo

```powershell
# Configurar JQL para sprint actual
$config = Get-Content jira_config.json | ConvertFrom-Json
$config.jql = "project = IMS AND Sprint in openSprints() ORDER BY priority DESC, created DESC"
$config | ConvertTo-Json | Set-Content jira_config.json

# Extraer datos
.\Connect-JiraAPI.ps1 -Verbose

# Ver resultados
# El dashboard mostrará solo el sprint activo
```

### Escenario 2: Reporte Mensual

```powershell
# Consultar último mes
$mesActual = (Get-Date).ToString("yyyy-MM")
$jql = "project = IMS AND created >= '$mesActual-01' ORDER BY created DESC"

# Actualizar configuración temporalmente
$config = Get-Content jira_config.json | ConvertFrom-Json
$config.jql = $jql
$config | ConvertTo-Json | Set-Content jira_config_monthly.json

# Extraer con configuración temporal
.\Connect-JiraAPI.ps1 -ConfigFile jira_config_monthly.json -OutputFile "reporte_mensual.csv"
```

### Escenario 3: Análisis de Bugs Críticos

```json
{
  "jiraUrl": "https://miempresa.atlassian.net",
  "email": "qa-lead@empresa.com",
  "apiToken": "YOUR_TOKEN",
  "projectKey": "IMS",
  "jql": "project = IMS AND issuetype = Bug AND priority in (Highest, High) AND resolution is EMPTY ORDER BY created DESC",
  "maxResults": 500
}
```

```powershell
.\Connect-JiraAPI.ps1 -OutputFile "bugs_criticos.csv"
```

### Escenario 4: Comparación de Sprints

```powershell
# Script personalizado para comparar 3 sprints
$sprints = @(32, 33, 34)

foreach ($sprint in $sprints) {
    $config = Get-Content jira_config.json | ConvertFrom-Json
    $config.jql = "project = IMS AND Sprint = 'Sprint $sprint'"
    $config | ConvertTo-Json | Set-Content "jira_config_temp.json"
    
    .\Connect-JiraAPI.ps1 -ConfigFile "jira_config_temp.json" -OutputFile "sprint_${sprint}_data.csv"
    
    Write-Host "✓ Sprint $sprint extraído" -ForegroundColor Green
}

Write-Host "`nComparación completa. Archivos generados:"
Get-ChildItem sprint_*_data.csv
```

### Escenario 5: Sincronización Incremental

```powershell
# Obtener solo issues actualizados hoy
$hoy = (Get-Date).ToString("yyyy-MM-dd")
$config = Get-Content jira_config.json | ConvertFrom-Json
$config.jql = "project = IMS AND updated >= '$hoy' ORDER BY updated DESC"
$config | ConvertTo-Json | Set-Content jira_config.json

.\Connect-JiraAPI.ps1 -OutputFile "actualizaciones_hoy.csv"
```

---

## Automatización

### Tarea Programada - Sincronización Diaria

```powershell
# Crear tarea que se ejecuta diariamente a las 8 AM

$action = New-ScheduledTaskAction `
    -Execute "PowerShell.exe" `
    -Argument "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"C:\Dashboard_KPIs\iniciar_jira_sync.ps1`" -OpenDashboard:$false"

$trigger = New-ScheduledTaskTrigger -Daily -At 8am

$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable

Register-ScheduledTask `
    -TaskName "Dashboard KPIs - Sync Jira" `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Description "Sincronización automática diaria del dashboard de KPIs con Jira" `
    -User $env:USERNAME `
    -RunLevel Highest

Write-Host "✓ Tarea programada creada exitosamente" -ForegroundColor Green
```

### Script de Backup Automático

```powershell
# backup_and_sync.ps1
$backupDir = ".\backups\$(Get-Date -Format 'yyyy-MM-dd')"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

# Backup de datos anteriores
Copy-Item jira_tickets*.csv $backupDir -ErrorAction SilentlyContinue
Copy-Item dashboard_data.js $backupDir -ErrorAction SilentlyContinue

# Sincronizar nuevos datos
.\iniciar_jira_sync.ps1 -OpenDashboard:$false

Write-Host "✓ Backup y sincronización completados" -ForegroundColor Green
Write-Host "  Backup en: $backupDir" -ForegroundColor Gray
```

### Notificación por Email (Ejemplo)

```powershell
# Después de sincronizar, enviar email con resumen
.\Connect-JiraAPI.ps1

$tickets = Import-Csv jira_tickets_api.csv
$total = $tickets.Count
$criticos = ($tickets | Where-Object { $_.'Prioridad' -eq 'Highest' }).Count
$enProgreso = ($tickets | Where-Object { $_.'Estado' -eq 'En curso' }).Count

$body = @"
Dashboard KPIs Actualizado

Total de tickets: $total
Críticos: $criticos
En progreso: $enProgreso

Dashboard: file:///C:/Dashboard_KPIs/Dashboard_Dinamico_Editable.html
"@

Send-MailMessage `
    -To "equipo-calidad@empresa.com" `
    -From "dashboard-kpis@empresa.com" `
    -Subject "Dashboard KPIs - Actualización Diaria" `
    -Body $body `
    -SmtpServer "smtp.empresa.com"
```

---

## Troubleshooting

### Problema: Timeout en consultas grandes

**Síntoma**: Error al extraer más de 1000 issues

**Solución**:
```powershell
# Dividir en consultas más pequeñas por sprint
$sprints = @(30, 31, 32, 33, 34, 35)
$allTickets = @()

foreach ($sprint in $sprints) {
    Write-Host "Extrayendo Sprint $sprint..." -ForegroundColor Cyan
    
    $config = Get-Content jira_config.json | ConvertFrom-Json
    $config.jql = "project = IMS AND Sprint = 'Sprint $sprint'"
    $config | ConvertTo-Json | Set-Content "temp_config.json"
    
    .\Connect-JiraAPI.ps1 -ConfigFile "temp_config.json" -OutputFile "temp_sprint_$sprint.csv"
    
    $tickets = Import-Csv "temp_sprint_$sprint.csv"
    $allTickets += $tickets
}

$allTickets | Export-Csv "jira_tickets_complete.csv" -NoTypeInformation
```

### Problema: Campos personalizados no aparecen

**Solución**:
```powershell
# Descubrir IDs de campos personalizados
$config = Get-Content jira_config.json | ConvertFrom-Json
$base64Auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$($config.email):$($config.apiToken)"))
$headers = @{ "Authorization" = "Basic $base64Auth" }

$fields = Invoke-RestMethod -Uri "$($config.jiraUrl)/rest/api/3/field" -Headers $headers

# Buscar campo específico
$fields | Where-Object { $_.name -like "*Sprint*" } | Select-Object id, name

# Actualizar Connect-JiraAPI.ps1 con el ID correcto
```

### Problema: Rate limiting

**Síntoma**: Error 429 "Too Many Requests"

**Solución**:
```powershell
# Agregar delays entre requests (modificar Connect-JiraAPI.ps1)

# En la función Get-JiraIssues, después de cada request:
Start-Sleep -Milliseconds 500

# Para consultas muy grandes:
Start-Sleep -Seconds 2
```

---

## Tips y Mejores Prácticas

### ✅ Hacer

- ✅ Usar JQL específico y filtrado
- ✅ Probar JQL en Jira primero
- ✅ Hacer backups antes de sincronizar
- ✅ Usar `-Verbose` para debugging
- ✅ Rotar API tokens periódicamente
- ✅ Documentar cambios en JQL

### ❌ Evitar

- ❌ Consultas muy amplias sin filtros
- ❌ Sincronizar cada minuto (rate limiting)
- ❌ Compartir API tokens
- ❌ Versionar `jira_config.json`
- ❌ Ejecutar múltiples syncs en paralelo

---

## Recursos Adicionales

- **JQL Builder**: https://jira.atlassian.com (usar búsqueda avanzada)
- **API Explorer**: https://developer.atlassian.com/cloud/jira/platform/rest/v3/
- **Campos Custom**: `/rest/api/3/field` en tu instancia

---

**Última actualización:** Febrero 2026
