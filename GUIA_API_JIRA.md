# 🔌 Guía de Conexión a API de Jira

## 📋 Descripción

Scripts para conectar directamente a la API REST de Jira y extraer datos automáticamente sin necesidad de exportar archivos HTML manualmente.

## 🚀 Configuración Inicial

### Paso 1: Obtener API Token de Jira

1. Ve a tu perfil de Atlassian: https://id.atlassian.com/manage-profile/security/api-tokens
2. Haz clic en **"Create API token"**
3. Dale un nombre descriptivo (ej: "Dashboard KPIs")
4. Copia el token generado (solo se muestra una vez)

### Paso 2: Configurar Credenciales

1. Copia el archivo de ejemplo:
   ```powershell
   Copy-Item jira_config.example.json jira_config.json
   ```

2. Edita `jira_config.json` con tus datos:
   ```json
   {
     "jiraUrl": "https://tu-empresa.atlassian.net",
     "email": "tu-email@empresa.com",
     "apiToken": "TU_TOKEN_AQUI",
     "projectKey": "IMS",
     "jql": "project = IMS AND Sprint in (...) ORDER BY created DESC",
     "maxResults": 1000
   }
   ```

### Paso 3: Personalizar JQL (Opcional)

El campo `jql` define qué tickets se extraen. Ejemplos:

```sql
-- Todos los tickets del proyecto
project = IMS ORDER BY created DESC

-- Solo sprints específicos
project = IMS AND Sprint in ('Sprint 30', 'Sprint 31', 'Sprint 32')

-- Por tipo de issue
project = IMS AND issuetype in (Bug, Task) AND Sprint = 'Sprint 32'

-- Por estado
project = IMS AND status in ('In Progress', 'Done') AND updated >= -30d

-- Combinado
project = IMS AND Sprint = 'Sprint 32' AND priority in (High, Highest) ORDER BY priority DESC
```

## 🔧 Uso

### Extracción Básica

```powershell
.\Connect-JiraAPI.ps1
```

Esto generará `jira_tickets_api.csv` con todos los datos.

### Extracción con Verbose

```powershell
.\Connect-JiraAPI.ps1 -Verbose
```

Muestra información detallada durante la extracción.

### Archivo de Salida Personalizado

```powershell
.\Connect-JiraAPI.ps1 -OutputFile "mi_reporte.csv"
```

### Usar Configuración Alternativa

```powershell
.\Connect-JiraAPI.ps1 -ConfigFile "jira_config_prod.json"
```

## 📊 Datos Extraídos

El script extrae los siguientes campos:

| Campo | Descripción |
|-------|-------------|
| Tipo de Incidencia | Bug, Task, Story, etc. |
| Clave de incidencia | IMS-1234 |
| Resumen | Título del ticket |
| Persona asignada | Usuario asignado |
| Prioridad | Highest, High, Medium, Low |
| Estado | Normalizado: Finalizados, En curso, Tareas por hacer |
| Resolución | Fixed, Won't Fix, etc. |
| Creada | Fecha de creación |
| Actualizada | Última actualización |
| Resuelta | Fecha de resolución |
| Sprint | Sprint detectado |
| Días Resolución | Días entre creación y resolución |
| Story Points | Puntos de historia (si aplica) |

## 🔄 Automatización

### Tarea Programada de Windows

Crea una tarea que ejecute el script automáticamente:

```powershell
# Crear tarea que se ejecute diariamente a las 8 AM
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File C:\ruta\Connect-JiraAPI.ps1"
$trigger = New-ScheduledTaskTrigger -Daily -At 8am
Register-ScheduledTask -TaskName "Jira Data Sync" -Action $action -Trigger $trigger
```

### Script de Actualización Completa

Crea un archivo `actualizar_dashboard.ps1`:

```powershell
# Extraer datos de Jira
.\Connect-JiraAPI.ps1

# Procesar datos
.\process_jira_new.ps1

# Generar datos para dashboard
.\generate_final_data.ps1

Write-Host "✅ Dashboard actualizado!" -ForegroundColor Green
```

## 🛡️ Seguridad

### ⚠️ IMPORTANTE

- **NUNCA** subas `jira_config.json` a repositorios públicos
- El archivo `.gitignore` ya incluye `jira_config.json`
- Usa variables de entorno en producción

### Uso con Variables de Entorno

```powershell
$env:JIRA_URL = "https://tu-empresa.atlassian.net"
$env:JIRA_EMAIL = "tu-email@empresa.com"
$env:JIRA_TOKEN = "tu-token"

# Modificar script para leer de variables de entorno
```

## 🔍 Troubleshooting

### Error: "401 Unauthorized"

- Verifica que el email y API token sean correctos
- Asegúrate de que el token no haya expirado

### Error: "400 Bad Request"

- Verifica la sintaxis JQL en `jira_config.json`
- Prueba la consulta directamente en Jira

### Error: "No se encontró el archivo de configuración"

```powershell
# Verificar que existe el archivo
Test-Path jira_config.json

# Si no existe, copiar el ejemplo
Copy-Item jira_config.example.json jira_config.json
```

### Campos Personalizados No Aparecen

Los campos personalizados de Jira tienen IDs como `customfield_10020`. Para encontrar el ID correcto:

1. Ve a la API de Jira en tu navegador:
   ```
   https://tu-empresa.atlassian.net/rest/api/3/field
   ```

2. Busca el campo que necesitas (ej: "Sprint", "Story Points")

3. Anota el `id` y actualiza el script en la sección de campos

## 📈 Integración con Dashboard

Una vez extraídos los datos:

1. El archivo `jira_tickets_api.csv` se genera automáticamente
2. Puedes copiar/renombrar a `jira_tickets.csv` para compatibilidad
3. Los scripts existentes procesarán los datos normalmente
4. El dashboard se actualizará con la nueva información

## 🔄 Comparación: API vs HTML Export

| Característica | API | HTML Export |
|----------------|-----|-------------|
| Automatización | ✅ Total | ❌ Manual |
| Actualización | ⚡ Tiempo real | 🐢 Manual |
| Historial | ✅ Completo | ⚠️ Limitado |
| Configuración | 🔧 Una vez | - |
| Campos custom | ✅ Todos | ⚠️ Algunos |
| Performance | ⚡ Rápido | 🐢 Lento |

## 📚 Recursos

- [Jira REST API Documentation](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
- [JQL Syntax Guide](https://support.atlassian.com/jira-software-cloud/docs/what-is-advanced-search-in-jira-cloud/)
- [Atlassian API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens)

## 🆘 Soporte

Para problemas o preguntas:

1. Revisa esta guía primero
2. Verifica los logs del script
3. Prueba la consulta JQL directamente en Jira
4. Contacta al equipo de DevOps/Calidad

---

**Última actualización:** Febrero 2026
