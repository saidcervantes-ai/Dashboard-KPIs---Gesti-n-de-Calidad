# 🔄 Sincronización Automática: Jira API → Dashboard

## ✅ Integración Completa Implementada

Tu dashboard ahora puede sincronizarse automáticamente con Jira usando la API REST v3, **sin perder ninguna funcionalidad existente**.

---

## 🎯 ¿Qué Se Ha Hecho?

### 1. **Conexión Exitosa a Jira API**
- ✅ Autenticación funcionando con tus credenciales
- ✅ Endpoint correcto: `POST /rest/api/3/search/jql`
- ✅ Extracción completa: **1,011 issues** del proyecto IMS

### 2. **Integración con Dashboard Existente**
- ✅ `dashboard_data.js` actualizado automáticamente
- ✅ Formato original preservado
- ✅ Todas las funcionalidades del dashboard intactas
- ✅ Respaldos automáticos antes de cada actualización

### 3. **Scripts Automatizados**
- ✅ Extracción de datos
- ✅ Transformación al formato del dashboard
- ✅ Actualización automática
- ✅ Sistema de respaldos

---

## 🚀 Uso Rápido

### **Opción 1: Archivo Batch (Más Fácil)**
```cmd
.\Sincronizar-Dashboard.bat
```
Doble clic en el archivo y listo!

### **Opción 2: PowerShell Completo**
```powershell
.\Sincronizar-Dashboard-Completo.ps1
```

### **Opción 3: Pasos Individuales**
```powershell
# 1. Extraer datos de Jira
.\Extraer-Datos-Jira.ps1

# 2. Actualizar dashboard
.\Actualizar-Dashboard-Desde-API.ps1

# 3. Abrir dashboard
Start-Process Dashboard_Dinamico_Editable.html
```

---

## 📁 Archivos Creados

### **Scripts de Extracción**
- `Extraer-Datos-Jira.ps1` - Extrae datos de Jira API
- `Test-SearchJQL.ps1` - Prueba de conexión rápida
- `Test-JQL-Endpoint.ps1` - Diagnóstico del endpoint

### **Scripts de Integración**
- `Actualizar-Dashboard-Desde-API.ps1` - Actualiza dashboard_data.js
- `Sincronizar-Dashboard-Completo.ps1` - Proceso completo automatizado
- `Sincronizar-Dashboard.bat` - Launcher Windows

### **Configuración**
- `jira_config.json` - Credenciales y configuración
- `jira_config.example.json` - Plantilla de configuración

### **Datos Generados**
- `jira_tickets_api.csv` - Datos crudos de Jira (1,011 tickets)
- `dashboard_data.js` - Dashboard actualizado (395 KB)
- `backups/` - Respaldos automáticos

### **Documentación**
- `ENDPOINTS_JIRA_API.md` - Documentación completa de la API
- `INTEGRACION_COMPLETA.md` - Este archivo

---

## 📊 Datos Actuales en Dashboard

### **Total: 1,011 Tickets**

**Por Sprint:**
- Sprint 30: 779 tickets (77.1%)
- Sprint 35: 55 tickets (5.4%)
- Sprint 34: 50 tickets (4.9%)
- Sprint 32: 47 tickets (4.6%)
- Sprint 33: 31 tickets (3.1%)
- Sprint 31: 29 tickets (2.9%)
- Sprint 36: 20 tickets (2.0%)

**Por Estado:**
- ✅ Finalizados: 770 (76.2%)
- 📋 Tareas por hacer: 215 (21.3%)
- 🔄 En curso: 26 (2.6%)

**Por Prioridad:**
- Medium: 916 (90.6%)
- High: 54 (5.3%)
- Highest: 20 (2.0%)
- Low: 15 (1.5%)
- Lowest: 6 (0.6%)

---

## 🔐 Seguridad

### **Credenciales Protegidas**
- `jira_config.json` está en `.gitignore`
- No se subirán credenciales al repositorio
- API Token cifrado en tránsito (HTTPS)

### **Respaldos Automáticos**
Antes de cada actualización, se crea un respaldo:
```
backups/dashboard_data_2026-02-17_14-30-00.js
```

---

## ⚙️ Configuración

### **Editar Credenciales**
```json
{
  "jiraUrl": "https://vocali.atlassian.net",
  "email": "tu.email@vocali.net",
  "apiToken": "TU_TOKEN_AQUI",
  "projectKey": "IMS",
  "jql": "project = IMS ORDER BY created DESC",
  "maxResults": 100
}
```

### **Modificar Query JQL**
Puedes cambiar la query en `jira_config.json`:

```json
// Solo tickets del Sprint 35
"jql": "project = IMS AND Sprint = 'Sprint 35'"

// Solo bugs de alta prioridad
"jql": "project = IMS AND issuetype = Bug AND priority = High"

// Últimos 30 días
"jql": "project = IMS AND created >= -30d"
```

---

## 🔄 Automatización Futura

### **Task Scheduler de Windows**
Para sincronización diaria automática:

```powershell
# Crear tarea programada (ejecutar como administrador)
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" `
    -Argument "-ExecutionPolicy Bypass -File `"C:\Ruta\Sincronizar-Dashboard-Completo.ps1`""

$trigger = New-ScheduledTaskTrigger -Daily -At 6:00AM

Register-ScheduledTask -Action $action -Trigger $trigger `
    -TaskName "Sincronizar Dashboard Jira" `
    -Description "Sincronizacion diaria del Dashboard KPIs con Jira API"
```

---

## 🐛 Solución de Problemas

### **Error: "No se encontró jira_config.json"**
```powershell
# Copia el ejemplo y edítalo
Copy-Item jira_config.example.json jira_config.json
notepad jira_config.json
```

### **Error: "401 Unauthorized"**
- Verifica tu email en `jira_config.json`
- Regenera tu API Token: https://id.atlassian.com/manage-profile/security/api-tokens
- Asegúrate de copiar el token completo

### **Error: "410 Gone"**
Ya resuelto! Ahora usamos el endpoint correcto: `/rest/api/3/search/jql`

### **Ver Logs Detallados**
```powershell
.\Extraer-Datos-Jira.ps1 -Verbose
```

---

## 📈 Próximas Mejoras

- [ ] Sincronización incremental (solo cambios recientes)
- [ ] Notificaciones por email al completar
- [ ] Dashboard en tiempo real con WebSockets
- [ ] Exportar a Excel/PDF
- [ ] Integración con Azure DevOps

---

## 📞 Soporte

**Documentación API:**
- [Jira REST API v3](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
- [JQL Query Guide](https://confluence.atlassian.com/x/egORLQ)

**Archivos de Ayuda:**
- `ENDPOINTS_JIRA_API.md` - Endpoints utilizados
- `README.md` - Documentación general del proyecto

---

## ✨ Características del Dashboard

### **Mantiene Toda la Funcionalidad Original:**
- ✅ Visualizaciones interactivas (ECharts)
- ✅ Filtros por Sprint, Estado, Prioridad
- ✅ KPIs calculados dinámicamente
- ✅ Exportación de datos
- ✅ Modo editable
- ✅ Diseño responsive

### **Nuevas Capacidades:**
- ✅ Datos en tiempo real desde Jira
- ✅ Sincronización con 1 clic
- ✅ Respaldos automáticos
- ✅ 1,011 tickets actualizados

---

## 🎉 ¡Listo Para Usar!

Tu dashboard ahora está completamente integrado con Jira. Los datos se actualizan automáticamente sin perder ninguna funcionalidad.

**Para sincronizar:**
```cmd
.\Sincronizar-Dashboard.bat
```

**O desde PowerShell:**
```powershell
.\Sincronizar-Dashboard-Completo.ps1
```

---

**Última actualización:** 17 de Febrero de 2026  
**Versión:** 2.0  
**Estado:** ✅ Totalmente funcional
