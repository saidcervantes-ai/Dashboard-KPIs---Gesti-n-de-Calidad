# 📊 KPIs Avanzados - Documentación

## 🎯 Descripción General

El módulo de **KPIs Avanzados** proporciona métricas avanzadas de calidad y gestión para el equipo de desarrollo y QA. Incluye 3 KPIs fundamentales que utilizan los datos existentes de Jira sin necesidad de configuración adicional.

---

## ✨ KPIs Implementados (FASE 1)

### 1️⃣ **Lead Time (Tiempo de Entrega)**

**Definición:** Tiempo transcurrido desde que se crea un ticket hasta que se resuelve (estado "Done").

**Métricas:**
- **Promedio General:** Tiempo promedio de todos los tickets resueltos
- **Por Sprint:** Lead time promedio por cada sprint
- **Por Prioridad:** Desglose por nivel de prioridad (Highest, High, Medium)
- **Distribución:** Cantidad de tickets en 5 rangos de tiempo:
  - 0-3 días (Muy Rápido)
  - 4-7 días (Rápido)
  - 8-14 días (Normal)
  - 15-30 días (Lento)
  - 30+ días (Muy Lento)

**Visualización:**
- Gráfico de barras horizontales por sprint
- Tabla de promedios por prioridad
- Distribución por rangos de tiempo

**Interpretación:**
- ✅ Lead time bajo = equipo eficiente
- ⚠️ Lead time alto = posibles cuellos de botella
- Comparar entre sprints para detectar tendencias

---

### 2️⃣ **Edad de Tickets Abiertos**

**Definición:** Tiempo que llevan los tickets en estado abierto (no resueltos) desde su creación.

**Métricas:**
- **Promedio General:** Edad promedio de todos los tickets abiertos
- **Tickets Críticos:** Más de 60 días abiertos (ROJO)
- **Tickets en Alerta:** Entre 30-60 días abiertos (AMARILLO)
- **Tickets Normales:** Menos de 30 días abiertos (VERDE)

**Visualización:**
- Cards con contadores de tickets por categoría
- Tabla detallada de tickets críticos con Key, Edad, Prioridad y Resumen
- Tabla de tickets en alerta con los mismos campos

**Interpretación:**
- 🔴 Tickets críticos (>60 días): Requieren atención inmediata
- 🟡 Tickets en alerta (30-60 días): Monitorear de cerca
- 🟢 Tickets normales (<30 días): Dentro del flujo normal

**Acciones Recomendadas:**
- Priorizar tickets críticos para cierre
- Investigar causas de tickets con más de 60 días abiertos
- Revisar si hay dependencias bloqueantes

---

### 3️⃣ **Análisis de Errores vs Tareas/HU**

**Definición:** Relación entre bugs y trabajo de desarrollo (Tasks/Stories) para identificar calidad del código.

**Métricas:**
- **Por Sprint:**
  - Cantidad de Bugs
  - Cantidad de Tasks/Stories
  - Ratio Bugs/Tasks (%)
- **Tendencia:** Indica si los bugs están aumentando o disminuyendo
- **Resumen General:**
  - Total de bugs
  - Total de tasks/stories
  - Ratio promedio

**Visualización:**
- Gráfico de barras apiladas por sprint (Bugs vs Tasks)
- Ratio expresado en porcentaje
- Indicador de tendencia (⬆️ Empeorando, ➡️ Estable, ⬇️ Mejorando)
- Leyenda con colores para cada tipo

**Interpretación:**
- ✅ Ratio bajo (<20%): Buena calidad de código
- ⚠️ Ratio medio (20-40%): Atención necesaria
- 🔴 Ratio alto (>40%): Problemas de calidad serios

**Significado de la Tendencia:**
- **Mejorando ⬇️:** Ratio de bugs disminuye sprint tras sprint
- **Estable ➡️:** Ratio se mantiene constante
- **Empeorando ⬆️:** Ratio de bugs está aumentando (requiere acción)

---

## 🚀 Cómo Usar

### Acceso a la Sección

1. Abre el dashboard: `Dashboard_Dinamico_Editable.html`
2. En la sección **Dev-Test**, selecciona del dropdown:
   - **▸ KPIs Avanzados**
3. Los KPIs se calcularán automáticamente con los datos actuales

### Actualización de Datos

Los KPIs se actualizan automáticamente cuando:
- Cambias de vista al seleccionar "KPIs Avanzados"
- Los datos de Jira se recargan (`dashboard_data.js`)

**No se requiere ninguna acción adicional.**

---

## 📁 Archivos del Módulo

### JavaScript
- **`dashboard_kpis_avanzados.js`** (23 KB)
  - Funciones de cálculo: `calcularLeadTime()`, `calcularEdadTickets()`, `calcularAnalisisErrores()`
  - Funciones de renderizado: `renderKPIsAvanzados()` y subsecciones
  - Punto de entrada: `actualizarKPIsAvanzados()` (llamada por `showView()`)

### CSS
- **`dashboard_avanzados.css`**
  - Estilos para cards, tablas y gráficos
  - Clases de alerta: `.kpi-critical`, `.kpi-warning`, `.kpi-success`
  - Responsive design para móviles

### HTML
- **`Dashboard_Dinamico_Editable.html`** (modificado)
  - Nueva opción en dropdown de Dev-Test
  - Nuevo contenedor: `<div id="kpis-avanzados">`
  - Imports de CSS y JS

### Lógica
- **`dashboard_logic.js`** (modificado)
  - Función `showView()` actualizada para llamar a `actualizarKPIsAvanzados()`

---

## 🔧 Requisitos Técnicos

### Dependencias Externas
- **ECharts** (v5.4.3): Ya incluido en el dashboard
- **Lucide Icons**: Ya incluido en el dashboard
- **dashboard_data.js**: Datos de tickets de Jira

### Compatibilidad
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+

### Datos Necesarios
Los KPIs funcionan con los campos existentes de Jira:
- `key`: Clave del ticket (ej: IMS-123)
- `created`: Fecha de creación
- `resolutiondate`: Fecha de resolución
- `status`: Estado actual del ticket
- `priority`: Prioridad
- `summary`: Resumen
- `tipo`: Tipo (Bug, Task, Story)
- `sprint`: Sprint asignado

**No se requieren campos adicionales en Jira.**

---

## 📊 Ejemplos de Uso

### Caso de Uso 1: Detectar Cuellos de Botella
**Problema:** El equipo siente que los tickets tardan mucho en cerrarse.

**Análisis:**
1. Ir a KPIs Avanzados → Lead Time
2. Revisar el promedio general (ej: 18 días)
3. Comparar con sprints anteriores
4. Identificar sprints con lead time alto

**Acción:** Si Sprint 32 tiene 25 días vs Sprint 31 con 12 días, investigar qué pasó en Sprint 32.

---

### Caso de Uso 2: Identificar Tickets Abandonados
**Problema:** Hay tickets que nunca se cierran.

**Análisis:**
1. Ir a KPIs Avanzados → Edad de Tickets
2. Revisar sección "Tickets Críticos" (>60 días)
3. Ver lista detallada con Key, Edad y Prioridad

**Acción:** 
- Priorizar cierre de tickets con más de 90 días
- Verificar si siguen siendo relevantes
- Reasignar o cerrar si no aplican

---

### Caso de Uso 3: Evaluar Calidad del Código
**Problema:** Muchos bugs están apareciendo.

**Análisis:**
1. Ir a KPIs Avanzados → Análisis de Errores
2. Revisar ratio Bugs/Tasks por sprint
3. Observar la tendencia (⬆️ ⬇️ ➡️)

**Acción:** 
- Si ratio >40%: Implementar más testing
- Si tendencia ⬆️: Revisar prácticas de desarrollo
- Considerar pair programming o code reviews más estrictos

---

## 🎨 Personalización

### Modificar Rangos de Edad
En `dashboard_kpis_avanzados.js`, línea ~120:

```javascript
// Cambiar umbrales de edad
if (diasAbierto > 60) {
    criticos.push(ticket);
} else if (diasAbierto > 30) {  // Cambiar a 45 para más flexibilidad
    alertas.push(ticket);
}
```

### Modificar Rangos de Lead Time
En `dashboard_kpis_avanzados.js`, línea ~70:

```javascript
// Ajustar rangos de distribución
if (dias <= 3) return '0-3 días';
else if (dias <= 7) return '4-7 días';  // Cambiar a 10 para más holgura
```

### Cambiar Colores
En `dashboard_avanzados.css`:

```css
/* Colores de alerta */
.kpi-critical { border-left: 4px solid #F44336; } /* Rojo */
.kpi-warning { border-left: 4px solid #FF9800; }  /* Amarillo */
.kpi-success { border-left: 4px solid #4CAF50; }  /* Verde */
```

---

## 🐛 Solución de Problemas

### Problema: Los KPIs no se muestran
**Solución:**
1. Verifica que `dashboard_data.js` esté cargado
2. Abre la consola del navegador (F12)
3. Busca errores en rojo
4. Asegúrate de que `ticketsData` existe: `console.log(ticketsData)`

### Problema: Los cálculos parecen incorrectos
**Solución:**
1. Abre la consola del navegador
2. Los KPIs Avanzados imprimen debug info:
   ```
   [KPIs Avanzados] Calculando con 259 tickets
   [Lead Time] Tickets resueltos: 156
   [Edad] Tickets abiertos: 103
   ```
3. Verifica que los números coincidan con tus expectativas

### Problema: Estilos rotos o mal alineados
**Solución:**
1. Verifica que `dashboard_avanzados.css` esté cargado
2. Abre DevTools → Network → Busca `dashboard_avanzados.css`
3. Si falla, verifica la ruta del archivo

### Problema: No aparece la opción en el dropdown
**Solución:**
1. Refresca la página con Ctrl+F5 (limpiar caché)
2. Verifica en `Dashboard_Dinamico_Editable.html` línea ~1779:
   ```html
   <option value="kpis-avanzados">▸ KPIs Avanzados</option>
   ```

---

## 🔮 FASE 2: KPIs Futuros

Los siguientes KPIs requieren extracción de changelog de Jira (en desarrollo):

### 1. Tiempo de Ciclo
Tiempo desde "In Progress" hasta "Done"

### 2. Reprocesos
Tickets que regresan a estados anteriores (Done → In Progress)

### 3. Tiempo en Testing
Tiempo que los tickets pasan en estado "In Test"

### 4. Esfuerzo por Dev
Tiempo que cada desarrollador tuvo tickets asignados

**Estimación FASE 2:** 2 días de desarrollo
- Script PowerShell para extraer changelog
- Nuevo módulo JavaScript para cálculos
- Integración con dashboard

---

## 📞 Soporte

Para reportar problemas o sugerir mejoras:
1. Documenta el problema con capturas de pantalla
2. Incluye la consola del navegador (F12)
3. Indica qué datos de Jira tienes disponibles

---

## 📝 Notas Técnicas

### Algoritmo de Lead Time
```
Lead Time = FechaResolucion - FechaCreacion
```
- Solo considera tickets con `resolutiondate` válida
- Excluye tickets sin resolver
- Calcula en días calendario (no días laborables)

### Algoritmo de Edad
```
Edad = HoyUtc - FechaCreacion
```
- Solo considera tickets sin `resolutiondate`
- Basado en UTC para consistencia
- Clasificación automática en 3 categorías

### Algoritmo de Ratio de Bugs
```
Ratio = (Bugs / (Tasks + Stories)) * 100
```
- Agrupa por sprint
- Excluye sprints sin tasks/stories
- Tendencia calculada comparando últimos 3 sprints

---

## 🎉 ¡Listo para Usar!

Los KPIs Avanzados están completamente funcionales y listos para proporcionar insights valiosos sobre tu proceso de desarrollo. 

**¡Empieza a analizar ahora mismo abriendo el dashboard!** 🚀

---

**Versión:** 1.0.0 (FASE 1)  
**Última Actualización:** Febrero 2026  
**Autor:** Dashboard KPIs - Gestión de Calidad
