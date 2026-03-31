# 🚀 Plan de Implementación - KPIs Dashboard Calidad

**Fecha:** 17 de febrero de 2026  
**Estado:** ✅ Aprobado para implementación

---

## 📋 Respuestas del Equipo

### ✅ Confirmaciones Clave:

1. **Time Tracking (Worklog):** ❌ No se usa
   - **Solución alternativa:** Usar **changelog** para medir tiempo de asignación
   - **Lógica:** Calcular cuántos días estuvo asignado a cada persona
   - **Datos disponibles:** `assignee` + historial de cambios en Jira

2. **Herramienta de Testing:** TestRail (sin integración)
   - ⚠️ Solo para ejecución formal
   - ⚠️ No trackea tiempos ni métricas automáticas
   - **Impacto:** KPIs de testing NO son viables sin integración API

3. **Changelog:** ✅ SÍ se necesita
   - **Habilita:** Tiempo Ciclo, Reprocesos, Tiempo en InTest, Tiempo Asignación

4. **Prioridad:** 🔥 **TODOS** los KPIs solicitados

---

## 🎯 KPIs Implementables (10 de 13)

### ✅ **FASE 1: KPIs Inmediatos** (2-3 horas)
**Usa datos YA disponibles en dashboard_data.js**

| # | KPI | Estado | Prioridad |
|---|-----|--------|-----------|
| 1 | Lead Time | ✅ Listo | 🔥 Alta |
| 2 | Edad de Tickets Abiertos | ✅ Listo | 🔥 Alta |
| 3 | Errores vs Tareas/HU por Sprint | ✅ Listo | 🔥 Alta |
| 4 | % Actividades en Curso | ✅ Ya existe | - |
| 5 | % Actividades Pendientes | ✅ Ya existe | - |

**Entregables:**
- Nueva pestaña "KPIs Avanzados" en dashboard
- 3 KPIs con gráficos interactivos
- Cero riesgo para funcionalidad actual

---

### ⚠️ **FASE 2: KPIs con Changelog** (1-2 días)
**Requiere extraer historial de Jira API**

| # | KPI | Datos Necesarios | Prioridad |
|---|-----|------------------|-----------|
| 6 | Tiempo de Ciclo | Changelog: transitions | 🔥 Alta |
| 7 | Reprocesos | Changelog: backwards moves | 🔥 Alta |
| 8 | Tiempo en InTest vs Estimación | Changelog: time in status | 🔥 Alta |
| 9 | Esfuerzo Dev (Tiempo Asignado) | Changelog: assignee changes | 🔥 Alta |

**Nuevo Script Requerido:**
```powershell
Extraer-Changelog-Jira.ps1
├── Endpoint: /rest/api/3/issue/{key}/changelog
├── Para cada ticket: extraer historial completo
├── Calcular: tiempo en cada estado, cambios de asignado
└── Output: jira_changelog.csv
```

**Datos a extraer del Changelog:**

```javascript
{
  "id": "12345",
  "author": { "displayName": "Juan Dev" },
  "created": "2026-01-15T10:30:00",
  "items": [
    {
      "field": "status",
      "fromString": "In Progress",
      "toString": "In Test"
    },
    {
      "field": "assignee",
      "fromString": "Juan Dev",
      "toString": "María QA"
    }
  ]
}
```

**Cálculos posibles:**

1. **Tiempo de Ciclo:** 
   - Fecha de "To Do" → "In Progress" (inicio)
   - Fecha de "In Progress" → "Done" (fin)
   - Ciclo = fin - inicio

2. **Reprocesos:**
   - Contar transiciones "Done" → "In Progress"
   - Contar transiciones "In Test" → "In Progress"

3. **Tiempo en InTest:**
   - Fecha entrada a "In Test"
   - Fecha salida de "In Test"
   - Comparar con Story Points estimados

4. **Esfuerzo Dev (Tiempo Asignado):**
   - Cambios en campo `assignee`
   - Calcular días entre cada cambio
   - Sumar tiempo que cada dev tuvo asignado el ticket

---

### 🔴 **KPIs NO Implementables** (Sin TestRail API)

| # | KPI | Problema | Solución Alternativa |
|---|-----|---------|---------------------|
| 10 | Test Automatizados vs Manuales | TestRail no integrado | Campos custom en Jira + Labels |
| 11 | Test Completos vs Total | TestRail no integrado | Campos custom en Jira |
| 12 | Test Automatizados por Sprint | TestRail no integrado | Issues con label `test-auto` |
| 13 | Test Completos por Sprint | TestRail no integrado | Issues con label `test-complete` |

**Opciones futuras:**

**Opción A: Integrar TestRail API**
- Endpoint: `https://[instance].testrail.io/index.php?/api/v2/get_tests/{run_id}`
- Requiere: API key de TestRail
- Tiempo: 2-3 días

**Opción B: Usar Jira para tracking de tests** (Recomendado a corto plazo)
- Crear campos custom en Jira:
  - `customfield_xxxxx` - "Tipo Test" (Automatizado/Manual)
  - `customfield_xxxxx` - "Estado Ejecución" (Completo/Incompleto)
- Usar labels: `test-auto`, `test-manual`, `test-complete`
- Modificar flujo de trabajo para que QA registre en Jira

**Opción C: Exportación manual de TestRail**
- Exportar CSV de TestRail mensualmente
- Importar manualmente al dashboard
- No es automático pero es viable

---

## 🏗️ Arquitectura de Implementación

### Estructura de Archivos (Sin tocar existentes)

```
dashboard/
├── 📊 EXISTENTES (NO TOCAR)
│   ├── Dashboard_Dinamico_Editable.html
│   ├── dashboard_logic.js
│   ├── dashboard_data.js          # 1,011 tickets actuales
│   └── Extraer-Datos-Jira.ps1     # Script de extracción básica
│
├── 🆕 FASE 1 - NUEVOS ARCHIVOS
│   ├── dashboard_kpis_avanzados.js    # Lógica KPIs inmediatos
│   ├── dashboard_avanzados.css        # Estilos nuevos KPIs
│   └── README_KPIS_AVANZADOS.md       # Documentación
│
└── 🆕 FASE 2 - NUEVOS ARCHIVOS
    ├── Extraer-Changelog-Jira.ps1     # Script changelog
    ├── jira_changelog.csv              # Datos de historial
    ├── dashboard_changelog.js          # Datos formateados
    ├── dashboard_kpis_changelog.js     # Lógica KPIs con changelog
    └── Sincronizar-Con-Changelog.ps1   # Orquestador completo
```

### Modificación Mínima al HTML

```html
<!-- Dashboard_Dinamico_Editable.html -->
<!-- SOLO SE AGREGA: -->

<!-- Nuevos imports -->
<script src="dashboard_kpis_avanzados.js"></script>
<script src="dashboard_changelog.js"></script>      <!-- Fase 2 -->
<script src="dashboard_kpis_changelog.js"></script> <!-- Fase 2 -->

<!-- Nueva pestaña en el menú -->
<button onclick="showTab('kpis-avanzados')">
    KPIs Avanzados
</button>

<!-- Nuevo contenedor -->
<div id="kpis-avanzados" class="tab-content">
    <!-- Aquí se renderizan los nuevos KPIs -->
</div>
```

---

## 📊 Visualizaciones Propuestas

### **Fase 1: Dashboard de KPIs Inmediatos**

```
┌──────────────────────────────────────────────────────────────┐
│  ⭐ KPIs Avanzados - Análisis de Calidad                     │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  📈 LEAD TIME ANALYSIS                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Lead Time Promedio por Sprint                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Sprint 30: ████████████░░░░░░░░ 12.3 días            │  │
│  │ Sprint 31: ██████████░░░░░░░░░░ 10.5 días            │  │
│  │ Sprint 32: ████████░░░░░░░░░░░░  8.7 días ⬇️         │  │
│  │ Sprint 33: ███████████░░░░░░░░░ 11.2 días            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Por Prioridad:                                             │
│  • Highest:  5.2 días ⚡                                    │
│  • High:     7.8 días                                       │
│  • Medium:  12.5 días                                       │
│  • Low:     18.3 días                                       │
│                                                             │
│  📊 [Ver distribución detallada]                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  ⏰ EDAD DE TICKETS ABIERTOS                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📍 Tickets Críticos (> 60 días): 🔴 3 tickets             │
│  ├─ IMS-825 - 87 días - High                               │
│  ├─ IMS-742 - 73 días - Medium                             │
│  └─ IMS-689 - 65 días - High                               │
│                                                             │
│  ⚠️  Tickets en Alerta (30-60 días): 🟡 12 tickets        │
│                                                             │
│  ✅ Tickets Normales (< 30 días): 🟢 26 tickets           │
│                                                             │
│  Edad Promedio: 18.5 días                                   │
│                                                             │
│  📊 [Ver todos los tickets abiertos]                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  🐛 ANÁLISIS DE ERRORES vs FUNCIONALIDAD                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Distribución por Sprint:                                   │
│                                                             │
│  Sprint 30:  [████████] 45% Bugs  [██████] 30% Tasks       │
│              [█████] 25% Stories                            │
│              Ratio Bug/Feature: 1.2 🔴                      │
│                                                             │
│  Sprint 31:  [███████] 38% Bugs   [███████] 35% Tasks      │
│              [█████] 27% Stories                            │
│              Ratio Bug/Feature: 0.95 🟡                     │
│                                                             │
│  Sprint 32:  [█████] 28% Bugs     [████████] 40% Tasks     │
│              [███████] 32% Stories                          │
│              Ratio Bug/Feature: 0.58 ✅ Mejorando           │
│                                                             │
│  Tendencia: ⬇️ Reducción de 17% en ratio de bugs           │
│                                                             │
│  📊 [Ver análisis detallado por tipo]                       │
└─────────────────────────────────────────────────────────────┘
```

---

### **Fase 2: KPIs con Changelog**

```
┌─────────────────────────────────────────────────────────────┐
│  🔄 TIEMPO DE CICLO                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Ciclo Promedio (In Progress → Done):                       │
│  • Sprint 30: 8.5 días                                      │
│  • Sprint 31: 7.2 días ⬇️                                   │
│  • Sprint 32: 6.8 días ⬇️                                   │
│                                                             │
│  Por Tipo:                                                  │
│  • Bug:   4.5 días (rápidos) ✅                            │
│  • Task:  6.8 días                                          │
│  • Story: 9.2 días (complejos)                              │
│                                                             │
│  📊 Lead Time vs Ciclo:                                     │
│  Lead Time:    12.3 días                                    │
│  Ciclo:         7.8 días                                    │
│  Wait Time:     4.5 días (36% del tiempo)                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  🔁 REPROCESOS                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Tickets con Reproceso:                                     │
│  • Sprint 30: 23 tickets (23% del total) 🔴                │
│  • Sprint 31: 18 tickets (18% del total) 🟡                │
│  • Sprint 32: 12 tickets (12% del total) ✅                │
│                                                             │
│  Tipos de Reproceso:                                        │
│  • Done → In Progress: 8 tickets                            │
│  • In Test → In Progress: 15 tickets                        │
│  • Done → In Test: 2 tickets                                │
│                                                             │
│  Top Tickets con más Reprocesos:                            │
│  • IMS-950: 4 reprocesos 🔴                                 │
│  • IMS-883: 3 reprocesos                                    │
│  • IMS-745: 3 reprocesos                                    │
│                                                             │
│  Impacto Promedio: +3.2 días por reproceso                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  🧪 TIEMPO EN IN TEST                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Tiempo Promedio en Testing:                                │
│  • Sprint 30: 3.5 días                                      │
│  • Sprint 31: 2.8 días ⬇️                                   │
│  • Sprint 32: 2.2 días ⬇️                                   │
│                                                             │
│  vs Estimación (Story Points / 2):                          │
│  • Estimado: 2.0 días                                       │
│  • Real:     2.8 días                                       │
│  • Desviación: +0.8 días (+40%)                             │
│                                                             │
│  Por Prioridad:                                             │
│  • Highest: 1.5 días (rápido) ✅                           │
│  • High:    2.3 días                                        │
│  • Medium:  3.1 días                                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  👨‍💻 ESFUERZO DEV (Tiempo Asignado)                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Tiempo Promedio Asignado por Dev:                          │
│  • Juan Diaz:    12.5 días/ticket                           │
│  • Pedro del Río: 8.3 días/ticket                           │
│  • Alex Gutiérrez: 6.7 días/ticket ⚡                      │
│                                                             │
│  vs Estimación (Story Points):                              │
│  • Estimado: 5.0 días (promedio)                            │
│  • Real:     9.2 días                                       │
│  • Desviación: +4.2 días (+84%)                             │
│                                                             │
│  Tickets que cambiaron de Dev:                              │
│  • Sprint 30: 15 tickets (reasignaciones)                   │
│  • Impacto: +2.5 días promedio                              │
│                                                             │
│  📊 [Ver carga de trabajo por desarrollador]                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Detalles Técnicos de Implementación

### **Script de Extracción de Changelog**

```powershell
# Extraer-Changelog-Jira.ps1

param(
    [string]$ConfigFile = "jira_config.json",
    [string]$InputFile = "jira_tickets_api.csv",
    [string]$OutputFile = "jira_changelog.csv"
)

# Cargar tickets
$tickets = Import-Csv $InputFile

# Para cada ticket, obtener changelog
$changelogData = @()

foreach ($ticket in $tickets) {
    $key = $ticket.'Clave de incidencia'
    
    $url = "$jiraUrl/rest/api/3/issue/$key/changelog"
    $response = Invoke-RestMethod -Uri $url -Headers $headers
    
    foreach ($history in $response.values) {
        foreach ($item in $history.items) {
            # Extraer cambios de estado, asignado, etc.
            $changelogData += [PSCustomObject]@{
                Ticket = $key
                Fecha = $history.created
                Autor = $history.author.displayName
                Campo = $item.field
                De = $item.fromString
                A = $item.toString
            }
        }
    }
}

$changelogData | Export-Csv $OutputFile
```

### **Cálculo de Métricas con Changelog**

```javascript
// dashboard_kpis_changelog.js

function calcularTiempoCiclo(ticket, changelog) {
    // Buscar transición "To Do" → "In Progress"
    const inicio = changelog.find(c => 
        c.ticket === ticket.key && 
        c.campo === 'status' && 
        c.a === 'In Progress'
    );
    
    // Buscar transición → "Done"
    const fin = changelog.find(c => 
        c.ticket === ticket.key && 
        c.campo === 'status' && 
        c.a === 'Done'
    );
    
    if (inicio && fin) {
        return (new Date(fin.fecha) - new Date(inicio.fecha)) / (1000*60*60*24);
    }
    return null;
}

function detectarReprocesos(ticket, changelog) {
    const transiciones = changelog.filter(c => 
        c.ticket === ticket.key && 
        c.campo === 'status'
    );
    
    let reprocesos = 0;
    for (let i = 1; i < transiciones.length; i++) {
        // Si vuelve a un estado anterior
        const estados = ['To Do', 'In Progress', 'In Test', 'Done'];
        const idxAntes = estados.indexOf(transiciones[i].de);
        const idxDespues = estados.indexOf(transiciones[i].a);
        
        if (idxDespues < idxAntes) {
            reprocesos++;
        }
    }
    return reprocesos;
}

function calcularTiempoAsignado(ticket, changelog) {
    const asignaciones = changelog.filter(c => 
        c.ticket === ticket.key && 
        c.campo === 'assignee'
    ).sort((a,b) => new Date(a.fecha) - new Date(b.fecha));
    
    let tiempoPorDev = {};
    
    for (let i = 0; i < asignaciones.length; i++) {
        const dev = asignaciones[i].a;
        const inicio = new Date(asignaciones[i].fecha);
        const fin = i < asignaciones.length - 1 
            ? new Date(asignaciones[i+1].fecha)
            : new Date(); // Si aún está asignado
        
        const dias = (fin - inicio) / (1000*60*60*24);
        tiempoPorDev[dev] = (tiempoPorDev[dev] || 0) + dias;
    }
    
    return tiempoPorDev;
}
```

---

## ⚠️ Consideraciones de Rendimiento

### **Fase 2: Extracción de Changelog**

**Problema:** 1 request por ticket = 1,011 requests

**Optimizaciones:**

1. **Rate Limiting:**
   ```powershell
   Start-Sleep -Milliseconds 200  # 5 requests/segundo
   ```

2. **Batching:**
   ```powershell
   # Procesar en lotes de 100
   $batches = 0..10
   foreach ($batch in $batches) {
       $start = $batch * 100
       $end = $start + 100
       # Procesar tickets $start..$end
   }
   ```

3. **Caché Incremental:**
   ```powershell
   # Solo extraer changelog de tickets nuevos/actualizados
   $ultimaSync = Get-Content "ultima_sync.txt"
   $ticketsNuevos = $tickets | Where-Object { $_.Actualizada -gt $ultimaSync }
   ```

4. **Tiempo Estimado:**
   - 1,011 tickets × 200ms = ~3.5 minutos
   - Primera ejecución: 5-10 minutos
   - Sincronizaciones posteriores: 1-2 minutos

---

## 📅 Cronograma de Implementación

### **Semana 1: FASE 1**

| Día | Tarea | Duración | Entregable |
|-----|-------|----------|-----------|
| Lunes | Crear `dashboard_kpis_avanzados.js` | 2h | Lógica KPIs inmediatos |
| Lunes | Crear visualizaciones HTML/CSS | 1h | Gráficos Lead Time, Edad, Errores |
| Martes | Integrar en dashboard principal | 1h | Nueva pestaña funcional |
| Martes | Testing y validación | 1h | QA de KPIs Fase 1 |
| Miércoles | Deploy y documentación | 1h | ✅ **FASE 1 COMPLETA** |

**Total Fase 1:** 6 horas

---

### **Semana 2: FASE 2**

| Día | Tarea | Duración | Entregable |
|-----|-------|----------|-----------|
| Jueves | Crear `Extraer-Changelog-Jira.ps1` | 4h | Script de extracción |
| Jueves | Primera extracción completa | 30min | jira_changelog.csv |
| Viernes | Crear `dashboard_kpis_changelog.js` | 4h | Lógica KPIs con changelog |
| Viernes | Visualizaciones Ciclo/Reprocesos | 2h | Gráficos interactivos |
| Lunes | Testing y optimización | 2h | Validación de cálculos |
| Martes | Integración completa | 2h | ✅ **FASE 2 COMPLETA** |

**Total Fase 2:** 14.5 horas (~2 días)

---

### **Opcional: TestRail Integration**

Si deciden integrar TestRail en el futuro:

| Fase | Duración | Dependencias |
|------|----------|--------------|
| Investigación API TestRail | 2h | API key |
| Script de extracción | 4h | Documentación TestRail |
| Mapeo con Jira | 2h | Relación test-ticket |
| Visualizaciones | 3h | - |
| Testing | 2h | - |
| **TOTAL** | **13h (~2 días)** | - |

---

## 🎯 Resultado Final

### **Dashboard Completo con 10 KPIs:**

```
┌───────────────────────────────────────────────────────────┐
│  📊 Dashboard de Gestión de Calidad                       │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  [Dashboard KPIs] [Evolución] [Resumen] [Incidentes]     │
│  [⭐ KPIs Avanzados] ← NUEVA PESTAÑA                      │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  FASE 1 - KPIs Inmediatos                           │ │
│  │  ✅ Lead Time                                        │ │
│  │  ✅ Edad de Tickets                                  │ │
│  │  ✅ Errores vs Tareas/HU                             │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  FASE 2 - KPIs con Changelog                        │ │
│  │  ✅ Tiempo de Ciclo                                  │ │
│  │  ✅ Reprocesos                                       │ │
│  │  ✅ Tiempo en InTest                                 │ │
│  │  ✅ Esfuerzo Dev (Tiempo Asignado)                   │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  📊 [Exportar Reporte] [Actualizar Datos]                │
└───────────────────────────────────────────────────────────┘
```

---

## 🚀 Próximos Pasos Inmediatos

### **Aprobación para comenzar:**

1. ✅ **FASE 1 está lista para iniciar ahora mismo**
   - 0 dependencias
   - 0 riesgo
   - 6 horas de trabajo

2. ⏸️ **FASE 2 requiere preparación:**
   - Validar límites de rate en Jira API
   - Preparar caché para optimización
   - Planificar ventana de primera extracción

---

## 💬 ¿Comenzamos?

**Propuesta:** Empezar con **FASE 1** inmediatamente

**Entregables en 6 horas:**
- ✅ Lead Time por Sprint y Prioridad
- ✅ Alertas de Tickets Antiguos
- ✅ Análisis de Errores con tendencias
- ✅ Dashboard completamente funcional
- ✅ Sin afectar funcionalidad actual

**¿Procedemos con la implementación?** 🎯
