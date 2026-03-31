# 📊 Propuesta: Nuevos KPIs para Dashboard de Gestión de Calidad

## 🎯 Objetivo

Agregar nuevos KPIs avanzados al dashboard actual sin afectar la funcionalidad existente, aprovechando la integración con Jira API.

---

## 📋 Análisis de Viabilidad de KPIs Solicitados

### ✅ KPIs Completamente Viables (Datos Disponibles en Jira API)

#### 1. **KPI Lead Time** ⭐⭐⭐
**Descripción:** Tiempo desde creación hasta finalización del ticket  
**Cálculo:** `resolutiondate - created`  
**Datos necesarios:**
- ✅ `created` - Ya extraemos
- ✅ `resolutiondate` - Ya extraemos
- ✅ `status` - Ya extraemos

**Implementación:** ✅ **INMEDIATA**
```javascript
leadTime = (resolutionDate - createdDate) / (1000 * 60 * 60 * 24) // días
```

**Métricas propuestas:**
- Lead Time promedio por Sprint
- Lead Time por prioridad (Highest, High, Medium, Low)
- Lead Time por tipo de issue (Bug, Story, Task)
- Distribución de Lead Time (gráfico de dispersión)

---

#### 2. **KPI Edad de los Tickets** ⭐⭐⭐
**Descripción:** Días desde creación para tickets abiertos  
**Cálculo:** `HOY - created` (solo para tickets no resueltos)  
**Datos necesarios:**
- ✅ `created` - Ya extraemos
- ✅ `status` - Ya extraemos

**Implementación:** ✅ **INMEDIATA**
```javascript
edad = (new Date() - createdDate) / (1000 * 60 * 60 * 24) // días
```

**Métricas propuestas:**
- Edad promedio de tickets abiertos
- Tickets con edad > 30 días (Alerta)
- Tickets con edad > 60 días (Crítico)
- Top 10 tickets más antiguos sin resolver

---

#### 3. **KPI Número de Errores por Sprint vs Tareas y HU** ⭐⭐⭐
**Descripción:** Comparación de tipos de issues por Sprint  
**Datos necesarios:**
- ✅ `issuetype.name` - Ya extraemos (Bug, Story, Task, etc.)
- ✅ `customfield_10020` (Sprint) - Ya extraemos

**Implementación:** ✅ **INMEDIATA**
```javascript
erroresPorSprint = issues.filter(i => i.type === 'Bug').length
tareasPorSprint = issues.filter(i => i.type === 'Task').length
historiasPorSprint = issues.filter(i => i.type === 'Story').length
ratio = errores / (tareas + historias)
```

**Métricas propuestas:**
- Gráfico de barras apiladas (Bug vs Task vs Story)
- Ratio de Errores/Funcionalidades
- Tendencia de Bugs por Sprint
- % de Bugs del total

---

#### 4. **% de Actividades en Curso** ⭐⭐⭐
**Descripción:** Ya implementado en el dashboard actual  
**Estado:** ✅ **YA EXISTE**

**Ubicación actual:** 
- `dashboard_logic.js` - Función `calcularKPIs()`
- KPI: `pctEnCurso`

---

#### 5. **% de Actividades Pendientes por Hacer** ⭐⭐⭐
**Descripción:** Ya implementado en el dashboard actual  
**Estado:** ✅ **YA EXISTE**

**Ubicación actual:**
- KPI derivado: `pendientes` / `total` * 100
- Estado: "Tareas por hacer"

---

### ⚠️ KPIs Parcialmente Viables (Requieren Campos Adicionales)

#### 6. **KPI Tiempo de Ciclo** ⭐⭐
**Descripción:** Tiempo desde "En Progreso" hasta "Done"  
**Datos necesarios:**
- ❌ **Necesita Changelog:** Historial de transiciones de estado
- Endpoint adicional: `/rest/api/3/issue/{issueKey}/changelog`

**Implementación:** 🔶 **REQUIERE NUEVA EXTRACCIÓN**

**Propuesta:**
```powershell
# Nuevo script: Extraer-Changelog-Jira.ps1
$changelog = Invoke-RestMethod -Uri "$jiraUrl/rest/api/3/issue/$key/changelog"
# Buscar transición "To Do" -> "In Progress" y "In Progress" -> "Done"
```

**Métricas propuestas:**
- Ciclo promedio por Sprint
- Ciclo por tipo de issue
- Comparación Ciclo vs Lead Time

---

#### 7. **KPI de Reprocesos** ⭐⭐
**Descripción:** Tickets que volvieron a estados anteriores  
**Datos necesarios:**
- ❌ **Necesita Changelog:** Historial completo de transiciones
- Lógica: Contar transiciones de "Done" → "In Progress" o "In Test" → "In Progress"

**Implementación:** 🔶 **REQUIERE NUEVA EXTRACCIÓN**

**Métricas propuestas:**
- % de tickets con reproceso
- Número promedio de reprocesos
- Tickets con más de 2 reprocesos (Crítico)

---

#### 8. **KPI Tiempo en InTest vs Estimación** ⭐⭐
**Descripción:** Comparar tiempo real en testing vs estimado  
**Datos necesarios:**
- ❌ **Necesita Changelog:** Para saber cuándo entró/salió de "In Test"
- ✅ `customfield_10016` (Story Points) - Ya extraemos

**Implementación:** 🔶 **REQUIERE NUEVA EXTRACCIÓN + CAMPO CUSTOM**

**Consideraciones:**
- Necesitamos definir cuántos story points = 1 día en testing
- O agregar campo custom específico para "Días estimados en test"

---

#### 9. **Esfuerzo Dedicado de Dev por Ticket vs Estimación** ⭐
**Descripción:** Tiempo real trabajado vs estimado  
**Datos necesarios:**
- ❌ **Necesita Worklog:** Registro de tiempo trabajado
- Endpoint: `/rest/api/3/issue/{issueKey}/worklog`
- ✅ Story Points - Ya extraemos

**Implementación:** 🔴 **REQUIERE TIME TRACKING ACTIVO EN JIRA**

**Propuesta:**
```powershell
# Si tienen time tracking habilitado:
$worklog = Invoke-RestMethod -Uri "$jiraUrl/rest/api/3/issue/$key/worklog"
$tiempoReal = $worklog.worklogs | Measure-Object -Property timeSpentSeconds -Sum
```

**Pregunta crítica:** ¿Los desarrolladores registran tiempo en Jira? (worklog)

---

### 🔴 KPIs NO Viables (Requieren Sistema Externo)

#### 10-13. **KPIs de Testing Automatizado** 🔴
**Issues:**
- Número de test Automatizados vs Manuales
- Número de test completos vs total
- Test Automatizados por Sprint
- Test completos por Sprint

**Problema:** Jira no almacena esta información por defecto

**Soluciones posibles:**

**Opción A: Integración con Herramientas de Testing**
- ¿Usan Zephyr Scale / Xray / TestRail?
- Endpoint: `/rest/zapi/latest/execution` (si usan Zephyr)

**Opción B: Campos Personalizados en Jira**
- Crear campos custom:
  - `customfield_xxxxx` - "Tipo de Test" (Manual/Automatizado)
  - `customfield_xxxxx` - "Estado de Ejecución" (Completo/Incompleto)

**Opción C: Issues con Labels**
- Usar labels en Jira: `test-automatizado`, `test-manual`, `test-completo`
- JQL: `project = IMS AND labels = test-automatizado`

---

## 🏗️ Arquitectura Propuesta

### Enfoque: **Módulos Separados Sin Afectar Dashboard Actual**

```
dashboard/
├── dashboard_data.js          # 📊 Datos principales (NO TOCAR)
├── dashboard_logic.js         # 🎯 Lógica actual (NO TOCAR)
├── dashboard_kpis_avanzados.js  # 🆕 NUEVO: KPIs avanzados
├── dashboard_changelog.js     # 🆕 NUEVO: Datos de changelog
└── Extraer-Changelog-Jira.ps1 # 🆕 NUEVO: Script extracción
```

### Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                    JIRA API REST v3                         │
└───────────────┬─────────────────────────────────────────────┘
                │
      ┌─────────┴──────────┐
      │                    │
      ▼                    ▼
┌─────────────┐     ┌──────────────────┐
│  ACTUAL     │     │  NUEVO           │
│  Extraer-   │     │  Extraer-        │
│  Datos-     │     │  Changelog-      │
│  Jira.ps1   │     │  Jira.ps1        │
└──────┬──────┘     └────────┬─────────┘
       │                     │
       ▼                     ▼
┌──────────────┐     ┌──────────────────┐
│ dashboard_   │     │ dashboard_       │
│ data.js      │     │ changelog.js     │
│ (1011 tkts)  │     │ (changelog data) │
└──────┬───────┘     └────────┬─────────┘
       │                      │
       └──────────┬───────────┘
                  │
                  ▼
        ┌──────────────────────┐
        │ Dashboard_Dinamico_  │
        │ Editable.html        │
        │                      │
        │ • KPIs Actuales      │
        │ • KPIs Avanzados (⭐)│
        └──────────────────────┘
```

---

## 📝 Plan de Implementación por Fases

### **Fase 1: KPIs Inmediatos (Sin modificar extracción)** ⚡ 2-3 horas

**KPIs a implementar:**
1. ✅ Lead Time
2. ✅ Edad de Tickets
3. ✅ Errores vs Tareas/HU por Sprint

**Archivos a crear:**
- `dashboard_kpis_avanzados.js` - Lógica de nuevos KPIs
- `dashboard_avanzados.css` - Estilos para nueva sección

**Modificaciones:**
- `Dashboard_Dinamico_Editable.html` - Agregar nueva pestaña "KPIs Avanzados"

**Beneficios:**
- ✅ Sin riesgo para dashboard actual
- ✅ Usa datos ya disponibles
- ✅ Implementación rápida

---

### **Fase 2: KPIs con Changelog** 🔄 1-2 días

**KPIs a implementar:**
4. ⚠️ Tiempo de Ciclo
5. ⚠️ Reprocesos
6. ⚠️ Tiempo en InTest

**Archivos a crear:**
- `Extraer-Changelog-Jira.ps1` - Nuevo script de extracción
- `jira_changelog.csv` - Datos de historial
- `dashboard_changelog.js` - Datos de changelog formateados

**Consideraciones:**
- Mayor carga en Jira API (1 request por ticket)
- Puede tardar varios minutos para 1000+ tickets
- Implementar caché/incremental

---

### **Fase 3: KPIs de Time Tracking** ⏱️ 2-3 días

**KPIs a implementar:**
7. Esfuerzo dedicado vs Estimación

**Prerrequisitos:**
- ✅ Confirmar que se usa time tracking en Jira
- ✅ Permisos para acceder a worklog

**Archivos adicionales:**
- `Extraer-Worklog-Jira.ps1`
- `jira_worklog.csv`

---

### **Fase 4: KPIs de Testing** 🧪 1 semana

**Requiere decisión:**
- ¿Integrar con herramienta de testing?
- ¿Usar campos custom en Jira?
- ¿Usar sistema de labels?

---

## 💡 Recomendación Inicial

### **Empezar con Fase 1: KPIs Inmediatos**

**Ventajas:**
1. ✅ **Cero riesgo** - No tocamos lo existente
2. ✅ **Rápido** - 2-3 horas de implementación
3. ✅ **Alto valor** - Lead Time y Edad son métricas críticas
4. ✅ **Sin dependencias** - Usa datos actuales

**Entregables:**

```
Dashboard con nueva pestaña "KPIs Avanzados":

┌────────────────────────────────────────┐
│  🎯 Dashboard KPIs (Actual)            │ ← NO SE TOCA
│  - % Finalizados                       │
│  - % En Curso                          │
│  - Tiempos por prioridad               │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  ⭐ KPIs Avanzados (NUEVO)              │
│                                        │
│  📈 Lead Time Analysis                 │
│  - Promedio por Sprint: 8.5 días      │
│  - Por prioridad (gráfico)            │
│  - Tendencia mensual                   │
│                                        │
│  ⏰ Edad de Tickets Abiertos           │
│  - Promedio: 15 días                   │
│  - Críticos (>60 días): 3 tickets     │
│  - Alertas (>30 días): 12 tickets     │
│                                        │
│  🐛 Análisis de Errores                │
│  - Sprint 30: 45% Bugs                 │
│  - Sprint 31: 38% Bugs                 │
│  - Ratio Bug/Feature: 1.2              │
│  - Tendencia: ⬇️ Mejorando              │
└────────────────────────────────────────┘
```

---

## 🚀 Próximos Pasos Sugeridos

### 1. **Validación** (Ahora)
- [ ] Confirmar si usan time tracking en Jira
- [ ] Confirmar si usan herramienta de testing (Zephyr/Xray)
- [ ] Validar permisos de API para changelog

### 2. **Aprobación** (Esta semana)
- [ ] Aprobar Fase 1: KPIs Inmediatos
- [ ] Decidir sobre Fase 2: ¿Necesitan Changelog?
- [ ] Priorizar KPIs de testing

### 3. **Implementación** (Próxima semana)
- [ ] Desarrollar módulo de KPIs Avanzados
- [ ] Testing con datos reales
- [ ] Despliegue sin afectar dashboard actual

---

## 📊 Resumen de Viabilidad

| KPI | Viabilidad | Tiempo | Riesgo | Prioridad |
|-----|-----------|--------|--------|-----------|
| Lead Time | ✅ Alta | 1h | Bajo | ⭐⭐⭐ Alta |
| Edad Tickets | ✅ Alta | 1h | Bajo | ⭐⭐⭐ Alta |
| Errores vs Tareas | ✅ Alta | 2h | Bajo | ⭐⭐⭐ Alta |
| % En Curso | ✅ **Existe** | 0h | - | - |
| % Pendientes | ✅ **Existe** | 0h | - | - |
| Tiempo Ciclo | ⚠️ Media | 1d | Medio | ⭐⭐ Media |
| Reprocesos | ⚠️ Media | 1d | Medio | ⭐⭐ Media |
| Tiempo InTest | ⚠️ Media | 1d | Medio | ⭐ Baja |
| Esfuerzo Dev | 🔴 Baja | 2d | Alto | ⭐ Baja |
| Tests Auto | 🔴 Baja | 1w | Alto | ⭐ Baja |

---

## ❓ Preguntas para el Equipo

1. **Time Tracking:** ¿Los desarrolladores registran tiempo trabajado en Jira?
2. **Testing:** ¿Qué herramienta usan para gestionar tests? (Zephyr, Xray, otra)
3. **Prioridad:** ¿Cuáles de estos KPIs son más críticos para el negocio?
4. **Changelog:** ¿Es importante tener historial de cambios de estado?
5. **Frecuencia:** ¿Con qué frecuencia necesitan actualizar estos KPIs? (diario, semanal)

---

## 🎯 Propuesta Final

**Recomiendo empezar con un MVP (Minimum Viable Product):**

### **MVP - Fase 1: KPIs Avanzados Básicos**

**Incluye:**
1. ✅ Lead Time (promedio y distribución)
2. ✅ Edad de Tickets Abiertos (con alertas)
3. ✅ Análisis de Errores por Sprint

**Tiempo estimado:** 2-3 horas  
**Riesgo:** Muy bajo  
**Valor:** Alto

**Después del MVP, evaluar:**
- Feedback del equipo
- Necesidad real de KPIs con changelog
- Decisión sobre testing y time tracking

---

¿Quieres que proceda con la **Fase 1: KPIs Inmediatos**? Puedo crear el módulo completo manteniendo el dashboard actual intacto.
