# 🔄 Flujo de Trabajo - Dashboard KPIs con Jira API

## Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         JIRA CLOUD                              │
│                    (Atlassian REST API v3)                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTPS / API Token Auth
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTRACCIÓN DE DATOS                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Connect-JiraAPI.ps1                                     │  │
│  │  • Autenticación con token                               │  │
│  │  • Consulta JQL personalizada                            │  │
│  │  • Paginación automática                                 │  │
│  │  • Normalización de datos                                │  │
│  └─────────────────────┬────────────────────────────────────┘  │
└────────────────────────┼────────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │ jira_tickets_api.csv │
              │  • Issues completos  │
              │  • Todos los campos  │
              └──────────┬───────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PROCESAMIENTO (Opcional)                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  process_jira_new.ps1                                    │  │
│  │  • Limpieza de datos                                     │  │
│  │  • Cálculos adicionales                                  │  │
│  │  • Enriquecimiento                                       │  │
│  └─────────────────────┬────────────────────────────────────┘  │
└────────────────────────┼────────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  tickets_processed   │
              │   jira_tickets.csv   │
              └──────────┬───────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  GENERACIÓN DE DASHBOARD                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  generate_final_data.ps1                                 │  │
│  │  • Agregar por sprint                                    │  │
│  │  • Calcular KPIs                                         │  │
│  │  • Generar dashboard_data.js                             │  │
│  └─────────────────────┬────────────────────────────────────┘  │
└────────────────────────┼────────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  dashboard_data.js   │
              │  • Datos formateados │
              │  • Arrays JavaScript │
              └──────────┬───────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VISUALIZACIÓN WEB                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Dashboard_Dinamico_Editable.html                        │  │
│  │  ┌────────────┬───────────────┬──────────┬─────────────┐ │  │
│  │  │ Dashboard  │  Evolución    │ Resumen  │ Incidentes  │ │  │
│  │  │    KPIs    │    Sprint     │          │             │ │  │
│  │  └────────────┴───────────────┴──────────┴─────────────┘ │  │
│  │  • Gráficos interactivos                                 │  │
│  │  • Filtros dinámicos                                     │  │
│  │  • Edición en línea                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Scripts de Soporte

```
┌────────────────────────────────────────────────────────────┐
│                  SCRIPTS DE UTILIDAD                       │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Setup-JiraConnection.ps1                                  │
│  ├─► Configuración inicial guiada                          │
│  ├─► Validación de credenciales                            │
│  └─► Generación de jira_config.json                        │
│                                                            │
│  Test-JiraConnection.ps1                                   │
│  ├─► Verificar autenticación                               │
│  ├─► Validar JQL                                           │
│  └─► Diagnóstico de campos                                 │
│                                                            │
│  iniciar_jira_sync.ps1                                     │
│  ├─► Ejecuta Connect-JiraAPI.ps1                           │
│  ├─► Ejecuta process_jira_new.ps1                          │
│  ├─► Ejecuta generate_final_data.ps1                       │
│  └─► Abre dashboard automáticamente                        │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## Flujo de Usuario Típico

### 🆕 Primera Vez (Setup)

```
Usuario
  │
  ├─► 1. Ejecuta Setup-JiraConnection.ps1
  │    ├─► Ingresa URL de Jira
  │    ├─► Ingresa email
  │    ├─► Ingresa API token
  │    └─► Configura sprints a consultar
  │
  ├─► 2. Ejecuta Test-JiraConnection.ps1
  │    └─► Verifica que todo funciona
  │
  └─► 3. Listo para sincronizar
```

### 🔄 Uso Diario (Sincronización)

```
Usuario
  │
  ├─► 1. Ejecuta iniciar_jira_sync.ps1
  │    │   (O simplemente: iniciar_jira_sync.bat)
  │    │
  │    ├─► Extrae datos de Jira
  │    ├─► Procesa información
  │    ├─► Genera dashboard
  │    └─► Abre navegador
  │
  └─► 2. Visualiza dashboard actualizado
       ├─► Analiza KPIs
       ├─► Revisa evolución
       ├─► Edita si necesario
       └─► Exporta reportes
```

## Configuración de Automatización

### Tarea Programada Windows (Opcional)

```powershell
# Sincronización automática diaria a las 8 AM
$action = New-ScheduledTaskAction `
    -Execute "PowerShell.exe" `
    -Argument "-File C:\ruta\iniciar_jira_sync.ps1 -OpenDashboard:$false"

$trigger = New-ScheduledTaskTrigger -Daily -At 8am

Register-ScheduledTask `
    -TaskName "Jira Dashboard Sync" `
    -Action $action `
    -Trigger $trigger `
    -Description "Sincronización automática de dashboard KPIs"
```

### Flujo Automatizado

```
┌─────────────────────────────────────────┐
│    Tarea Programada Windows             │
│    • Diaria a las 8:00 AM               │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│    iniciar_jira_sync.ps1                │
│    • Extrae datos frescos               │
│    • Actualiza dashboard                │
│    • Guarda historial                   │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│    Usuario abre navegador               │
│    • Datos siempre actualizados         │
│    • Sin intervención manual            │
└─────────────────────────────────────────┘
```

## Comparación de Métodos

### Método 1: API REST (Recomendado)

```
Jira Cloud ──[API]──► Connect-JiraAPI.ps1 ──► CSV ──► Dashboard
     ↓
  Tiempo real
  Automático
  Completo
```

**Ventajas:**
- ✅ Automático
- ✅ Tiempo real
- ✅ Sin intervención manual
- ✅ Historial completo
- ✅ Todos los campos

### Método 2: HTML Export (Legacy)

```
Jira Cloud ──[Export Manual]──► HTML ──► extract_jira_*.ps1 ──► CSV ──► Dashboard
                                   ↓
                              Manual
                              Limitado
```

**Ventajas:**
- ✅ No requiere API token
- ✅ Funciona offline
- ⚠️ Para datos históricos específicos

## Seguridad del Flujo

```
┌────────────────────────────────────────┐
│  jira_config.json (LOCAL)              │
│  • Credenciales encriptadas en tránsito│
│  • No versionado en Git                │
│  • Solo accesible localmente           │
└────────────────┬───────────────────────┘
                 │
                 │ HTTPS + Base64 Auth
                 ▼
┌────────────────────────────────────────┐
│  Jira Cloud API                        │
│  • Autenticación token                 │
│  • TLS 1.3                             │
│  • Rate limiting                       │
└────────────────────────────────────────┘
```

## Archivos Importantes

| Archivo | Propósito | Versionado |
|---------|-----------|------------|
| `jira_config.json` | Credenciales reales | ❌ NO (.gitignore) |
| `jira_config.example.json` | Plantilla | ✅ SÍ |
| `jira_tickets_api.csv` | Datos extraídos | ⚠️ Opcional |
| `dashboard_data.js` | Datos dashboard | ✅ SÍ |

## Próximos Pasos

1. ✅ **Completado**: Integración API Jira
2. 🔄 **Siguiente**: Webhooks para actualización automática
3. 📅 **Futuro**: Dashboard web de administración
4. 🚀 **Futuro**: Análisis predictivo ML

---

**Versión del Diagrama:** 2.0  
**Última actualización:** Febrero 2026
