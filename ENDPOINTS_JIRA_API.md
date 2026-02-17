# Endpoints API Jira - Integración Dashboard KPIs

## 📋 Resumen Ejecutivo

Este documento identifica los endpoints específicos de la API REST v3 de Jira Cloud necesarios para la integración completa del Dashboard de KPIs de Gestión de Calidad.

---

## 🎯 Endpoint Principal (IMPLEMENTADO)

### **POST /rest/api/3/search/jql**
**Enhanced Search - Búsqueda JQL Mejorada**

#### ✅ Ventajas
- ✓ **Activo y Recomendado** - No marcado como deprecated
- ✓ **Paginación Moderna** - Usa `nextPageToken` en lugar de `startAt`
- ✓ **Más Eficiente** - Campo `isLast` indica claramente fin de resultados
- ✓ **Mejor Performance** - Optimizado para grandes volúmenes de datos
- ✓ **Read-After-Write Consistency** - Soporta `reconcileIssues` para consistencia

#### 📝 Request Body
```json
{
  "jql": "project = IMS ORDER BY created DESC",
  "maxResults": 100,
  "fields": [
    "summary",
    "issuetype",
    "status",
    "priority",
    "assignee",
    "created",
    "updated",
    "resolutiondate",
    "resolution",
    "customfield_10020",
    "customfield_10016"
  ],
  "nextPageToken": "string"
}
```

#### 📊 Response Structure
```json
{
  "isLast": true,
  "nextPageToken": "eyJzdGFydEF0IjoxMDB9",
  "issues": [
    {
      "id": "10002",
      "key": "IMS-123",
      "fields": {
        "summary": "Implementar funcionalidad X",
        "status": {
          "name": "En curso"
        },
        "assignee": {
          "displayName": "Juan Pérez"
        },
        "created": "2026-02-15T10:30:00.000+0000",
        "updated": "2026-02-17T14:20:00.000+0000"
      }
    }
  ]
}
```

#### 🔄 Paginación
```powershell
# Primera petición
$body = @{
    jql = "project = IMS"
    maxResults = 100
    fields = @("summary", "status", "created")
}

# Peticiones subsiguientes
$body = @{
    jql = "project = IMS"
    maxResults = 100
    nextPageToken = $response.nextPageToken
    fields = @("summary", "status", "created")
}

# Continuar mientras $response.isLast = $false
```

---

## ⚠️ Endpoints Deprecated (NO USAR)

### **GET/POST /rest/api/3/search**
**Status:** 🚫 Currently being removed ([CHANGE-2046](https://developer.atlassian.com/changelog/#CHANGE-2046))

**Razón:** Atlassian está removiendo este endpoint. Usar `/search/jql` en su lugar.

**Problema en vocali.atlassian.net:** Este endpoint retorna **410 Gone** en tu instancia, confirmando que ya fue deshabilitado.

---

## 🔧 Endpoints Complementarios

### 1. **GET /rest/api/3/serverInfo**
**Información del Servidor**

```bash
GET https://vocali.atlassian.net/rest/api/3/serverInfo
```

**Uso:** Verificar conectividad y versión de Jira
**Respuesta:**
```json
{
  "baseUrl": "https://vocali.atlassian.net",
  "version": "1001.0.0-SNAPSHOT",
  "deploymentType": "Cloud"
}
```

---

### 2. **GET /rest/api/3/project**
**Listar Proyectos Disponibles**

```bash
GET https://vocali.atlassian.net/rest/api/3/project
```

**Uso:** Descubrir proyectos accesibles
**Respuesta:**
```json
[
  {
    "id": "10000",
    "key": "IMS",
    "name": "Invox Medical Suite",
    "projectTypeKey": "software"
  }
]
```

---

### 3. **GET /rest/api/3/project/{projectKey}**
**Detalles de Proyecto Específico**

```bash
GET https://vocali.atlassian.net/rest/api/3/project/IMS
```

**Uso:** Obtener información detallada del proyecto IMS
**Respuesta:**
```json
{
  "id": "10000",
  "key": "IMS",
  "name": "Invox Medical Suite",
  "lead": {
    "displayName": "Rafael Bomate"
  },
  "description": "...",
  "projectTypeKey": "software"
}
```

---

### 4. **GET /rest/api/3/issue/{issueKey}**
**Detalles de Issue Individual**

```bash
GET https://vocali.atlassian.net/rest/api/3/issue/IMS-1
```

**Uso:** Obtener información completa de un issue específico
**Parámetros:**
- `expand=changelog` - Incluir historial de cambios
- `fields=summary,status,assignee` - Campos específicos

---

### 5. **POST /rest/api/3/search/approximate-count**
**Contar Issues**

```json
{
  "jql": "project = IMS"
}
```

**Uso:** Obtener conteo aproximado sin descargar todos los issues
**Respuesta:**
```json
{
  "count": 153
}
```

---

### 6. **GET /rest/api/3/myself**
**Información del Usuario Actual**

```bash
GET https://vocali.atlassian.net/rest/api/3/myself
```

**Uso:** Verificar autenticación y obtener datos del usuario
**Respuesta:**
```json
{
  "accountId": "5b10a2844c20165700ede21g",
  "displayName": "Said Cervantes Correa",
  "emailAddress": "said.cervantes@vocali.net",
  "active": true
}
```

---

## 📊 Campos Customizados Comunes

### Sprint
```
customfield_10020
```
**Formato:** Array de strings con información del sprint
```json
[
  "com.atlassian.greenhopper.service.sprint.Sprint@14b[id=42,rapidViewId=23,state=ACTIVE,name=Sprint 32,startDate=2026-02-01T10:00:00.000Z,endDate=2026-02-15T10:00:00.000Z]"
]
```

### Story Points
```
customfield_10016
```
**Formato:** Número decimal
```json
5.0
```

### Epic Link
```
customfield_10014
```

### Sprint Field (alternativo)
```
customfield_10021
```

> **Nota:** Los IDs de campos custom pueden variar por instancia. Usar el endpoint `/rest/api/3/field` para identificarlos.

---

## 🔐 Autenticación

### Basic Auth con API Token
```powershell
$email = "said.cervantes@vocali.net"
$apiToken = "ATATT3xFfGF0..."
$base64 = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${email}:${apiToken}"))

$headers = @{
    "Authorization" = "Basic $base64"
    "Content-Type" = "application/json"
    "Accept" = "application/json"
}
```

---

## 📝 JQL Queries Útiles

### Todos los issues del proyecto IMS
```jql
project = IMS ORDER BY created DESC
```

### Issues del Sprint 32
```jql
project = IMS AND Sprint = "Sprint 32" ORDER BY created DESC
```

### Issues creados en los últimos 30 días
```jql
project = IMS AND created >= -30d ORDER BY created DESC
```

### Issues sin resolver
```jql
project = IMS AND resolution = Unresolved ORDER BY priority DESC
```

### Bugs de alta prioridad
```jql
project = IMS AND issuetype = Bug AND priority = High ORDER BY created DESC
```

### Issues asignados a usuario específico
```jql
project = IMS AND assignee = currentUser() ORDER BY updated DESC
```

---

## 🎯 Scopes OAuth 2.0 Requeridos

Para autenticación OAuth 2.0 (futuro):

**Classic:**
- `read:jira-work`

**Granular:**
- `read:issue-details:jira`
- `read:field:jira`
- `read:field.option:jira`
- `read:group:jira`

---

## 📦 Rate Limits

**Jira Cloud:**
- ~3 requests por segundo por usuario
- Límites más altos disponibles con [App Rate Limiting](https://developer.atlassian.com/cloud/jira/platform/rate-limiting/)

**Recomendaciones:**
- Usar `maxResults` alto (100-500) para reducir número de requests
- Implementar retry con backoff exponencial
- Cachear resultados cuando sea posible

---

## ✅ Implementación Actual

### Script Principal
[Connect-JiraAPI.ps1](Connect-JiraAPI.ps1)

### Endpoints Utilizados
1. ✅ `POST /rest/api/3/search/jql` - Búsqueda principal
2. ✅ `GET /rest/api/3/serverInfo` - Verificación de conectividad
3. ✅ `GET /rest/api/3/myself` - Autenticación
4. ✅ `GET /rest/api/3/project` - Listar proyectos

### Configuración
[jira_config.json](jira_config.json)

---

## 📚 Referencias

- [Jira REST API v3 - Issue Search](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-search/)
- [JQL Documentation](https://confluence.atlassian.com/x/egORLQ)
- [API Token Management](https://id.atlassian.com/manage-profile/security/api-tokens)
- [Atlassian API Guidelines](https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/)

---

## 🔄 Próximos Pasos

1. ✅ Actualizado `Connect-JiraAPI.ps1` para usar `/rest/api/3/search/jql`
2. ⏳ Probar extracción completa con paginación
3. ⏳ Validar campos customizados (Sprint, Story Points)
4. ⏳ Integrar con generación de `dashboard_data.js`
5. ⏳ Automatizar sincronización periódica

---

**Última actualización:** 17 de Febrero de 2026  
**Versión del script:** 2.1  
**Estado:** ✅ Endpoint principal actualizado y listo para prueba
