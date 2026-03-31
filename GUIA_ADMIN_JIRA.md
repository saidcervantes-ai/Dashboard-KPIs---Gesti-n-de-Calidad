# Guía para Administrador de Jira - Habilitar API REST

## Contexto del Problema

**Usuario**: Said Cervantes (said.cervantes@vocali.net)  
**Instancia Jira**: https://vocali.atlassian.net  
**Proyecto**: IMS (Invox Medical Suite)

### Estado Actual:
- ✅ **Autenticación funciona** correctamente con API token
- ✅ **Acceso al proyecto** IMS confirmado
- ❌ **Endpoint `/rest/api/2/search` y `/rest/api/3/search` devuelven error 410 (Gone)**

### Objetivo:
Habilitar el acceso a la API REST de búsqueda para poder extraer issues del proyecto IMS automáticamente.

---

## Pasos para el Administrador de Jira Cloud

### 1. Verificar Configuración de API

**Ubicación**: Administración de Jira > Sistema > API tokens

**Verificar:**
1. Acceder a: **⚙️ Configuración > Sistema > API**
2. Verificar que la **API REST está habilitada** para la organización
3. Confirmar que no hay restricciones en el proyecto IMS

### 2. Verificar Permisos del Proyecto IMS

**Navegación**: Configuración del Proyecto IMS > Permisos

**Acciones:**
1. Ir a **Proyecto IMS** > **Configuración del proyecto** > **Permisos**
2. Verificar que el usuario **said.cervantes@vocali.net** tiene estos permisos:
   - ✅ **Browse Projects** (Ver proyectos)
   - ✅ **View Development Tools** (Ver herramientas de desarrollo)
   - ✅ **View Read-Only Workflow** (Ver flujo de trabajo)

**Captura de pantalla recomendada**: Permisos del proyecto IMS

### 3. Verificar Configuración de la Organización Atlassian

**Ubicación**: admin.atlassian.com

**Pasos:**
1. Ir a: https://admin.atlassian.com
2. Seleccionar organización **Vocali**
3. En el menú izquierdo: **Settings > Products > Jira**
4. Verificar configuración de **API access**:
   - ✅ Debe estar **habilitado** para usuarios con API tokens
   - ✅ No debe haber restricciones de IP si el usuario trabaja remoto

### 4. Verificar Esquema de Permisos

**Navegación**: Administración de Jira > Issues > Permission schemes

**Acciones:**
1. Ir a **⚙️ Configuración > Issues > Permission schemes**
2. Identificar el esquema usado por el proyecto **IMS**
3. Verificar que incluye estos permisos para el rol del usuario:
   - **Browse Projects**
   - **View Read-Only Workflow**
   - **View Voters and Watchers**

### 5. Verificar Configuración de Producto Jira Software

**Solo si aplica** (si IMS es un proyecto de Jira Software):

1. Ir a **⚙️ Configuración > Products > Jira Software**
2. Verificar que la **API está habilitada**
3. Confirmar que no hay restricciones de features deshabilitadas

### 6. Revisar Logs de Auditoría

**Ubicación**: Administración > System > Audit log

**Buscar:**
- Filtrar por usuario: **said.cervantes@vocali.net**
- Buscar eventos relacionados con API calls
- Verificar si hay errores o restricciones registradas

---

## Pruebas para Verificar que Funciona

Una vez realizados los cambios, el usuario puede ejecutar este comando para probar:

### Test Rápido (PowerShell):

```powershell
# Ejecutar en PowerShell:
.\Test-Conexion.ps1
```

**Resultado esperado:**
```
OK - Autenticacion exitosa
OK - Consulta JQL exitosa
Total de issues encontrados: [número]
```

### Test Manual (vía navegador):

También puede probar manualmente con:
```
https://vocali.atlassian.net/rest/api/2/search?jql=project=IMS&maxResults=1
```

**Debe devolver**: JSON con issues del proyecto (no error 410)

---

## Alternativa: Habilitar Tokens de API Específicos

Si el problema persiste, considerar:

### Opción A: Crear un API Token dedicado para integración

1. Crear un usuario técnico (ej: `api-integration@vocali.net`)
2. Asignarle permisos específicos al proyecto IMS
3. Generar API token para ese usuario
4. Proporcionar credenciales al usuario Said

### Opción B: Verificar Plan de Jira Cloud

Algunos endpoints pueden estar limitados según el plan:

1. Verificar plan actual de Jira Cloud
2. Confirmar que incluye acceso completo a REST API
3. Si es plan Free, considerar upgrade a Standard o Premium

---

## Información Técnica Adicional

### Error Específico:
```
HTTP 410 Gone
Endpoint: /rest/api/2/search
Método: POST con JQL
```

### APIs que SÍ funcionan actualmente:
- ✅ `/rest/api/2/myself` - Autenticación
- ✅ `/rest/api/2/project/IMS` - Info del proyecto
- ✅ `/rest/api/2/project` - Lista de proyectos
- ✅ `/rest/api/2/serverInfo` - Info del servidor

### API que NO funciona:
- ❌ `/rest/api/2/search` - Búsqueda con JQL
- ❌ `/rest/api/3/search` - Búsqueda con JQL (v3)

### Configuración del Cliente:
- **Autenticación**: Basic Auth con email + API token (correcto)
- **Headers**: Authorization, Content-Type application/json (correcto)
- **Formato JQL**: `project = IMS ORDER BY created DESC` (correcto)

---

## Documentación Oficial de Referencia

Para consultar detalles técnicos:

1. **Jira Cloud REST API**: https://developer.atlassian.com/cloud/jira/platform/rest/v3/
2. **API Tokens**: https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/
3. **Permisos de Proyecto**: https://support.atlassian.com/jira-cloud-administration/docs/manage-project-permissions/

---

## Contacto para Seguimiento

**Usuario solicitante**:
- Nombre: Said Cervantes Correa
- Email: said.cervantes@vocali.net
- Proyecto: IMS (Invox Medical Suite)

**Propósito**: Automatizar extracción de datos para Dashboard de KPIs de Gestión de Calidad

---

## Checklist para el Administrador

- [ ] Verificar API REST habilitada en organización
- [ ] Confirmar permisos de usuario en proyecto IMS
- [ ] Revisar esquema de permisos del proyecto
- [ ] Verificar configuración de producto Jira
- [ ] Revisar logs de auditoría
- [ ] Ejecutar test de verificación
- [ ] Confirmar con usuario que funciona

---

**Fecha**: 16 de Febrero, 2026  
**Prioridad**: Media  
**Tiempo estimado**: 15-30 minutos
