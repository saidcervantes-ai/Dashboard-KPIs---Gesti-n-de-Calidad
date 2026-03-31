# 📊 Dashboard KPIs - Gestión de Calidad (Dinámico y Editable)

## ✅ Archivos Generados

### 🎯 Archivo Principal (USAR ESTE)
- **`Dashboard_Dinamico_Editable.html`** - Dashboard completamente dinámico y editable
  - ✅ 259 tickets actualizados del CSV
  - ✅ Totalmente editable (celdas amarillas)
  - ✅ Agregar/eliminar incidentes
  - ✅ KPIs calculados automáticamente
  - ✅ Gráficos interactivos
  - ✅ Filtros y búsqueda
  - ✅ Exportar a CSV

### 📁 Archivos de Soporte
- **`dashboard_data.js`** (85 KB) - Datos de los 259 tickets
- **`dashboard_logic.js`** (21 KB) - Lógica del dashboard

### 📊 Distribución de Datos Actualizados

**Por Sprint:**
- Sprint 30: 231 tickets (89.2%)
- Sprint 31: 6 tickets (2.3%)
- Sprint 32: 20 tickets (7.7%) ← **Sprint Actual**
- Sprint 33: 2 tickets (0.8%)
- **TOTAL: 259 tickets**

**Por Estado:**
- Finalizados: 224 tickets (86.5%)
- Tareas por hacer: 30 tickets (11.6%)
- En curso: 5 tickets (1.9%)

**Por Prioridad:**
- Medium: 182 tickets (70.3%)
- High: 41 tickets (15.8%)
- Highest: 16 tickets (6.2%)
- Low: 14 tickets (5.4%)
- Lowest: 6 tickets (2.3%)

## 🚀 Cómo Usar el Dashboard

### 1. Abrir el Dashboard
```
Abrir: Dashboard_Dinamico_Editable.html
```
En cualquier navegador web moderno (Chrome, Edge, Firefox)

### 2. Navegación por Pestañas
- **📊 Dashboard KPIs**: Métricas principales con selectores de sprint
- **📈 Evolución Sprint**: Gráfico de tendencia y tabla histórica
- **📑 Resumen**: Matriz de distribución por prioridad/estado
- **🐛 Incidentes**: Lista completa editable de todos los tickets
- **📖 Instrucciones**: Guía de uso completa

### 3. Funciones Principales

#### ✏️ Editar Incidentes
1. Ir a pestaña "Incidentes"
2. Click en cualquier celda amarilla
3. Modificar el valor
4. Presionar Enter o click fuera
5. Los KPIs se actualizan automáticamente

#### ➕ Agregar Nuevo Incidente
1. Click en "➕ Agregar Nuevo Incidente"
2. Completar formulario:
   - Clave (ej: IMS-999)
   - Resumen
   - Persona asignada
   - Prioridad (Highest/High/Medium/Low/Lowest)
   - Estado (Tareas por hacer/En curso/Finalizados)
   - Sprint (30, 31, 32, 33...)
3. Click en "✅ Agregar Incidente"
4. El nuevo ticket aparece y actualiza todos los KPIs

#### 🗑️ Eliminar Incidente
- Click en el botón 🗑️ en la fila del incidente
- Confirmar eliminación
- Los KPIs se recalculan automáticamente

#### 🔍 Filtrar Incidentes
- Usar barra de filtros en pestaña "Incidentes":
  - Buscar por texto (clave, resumen, asignado)
  - Filtrar por Sprint (30, 31, 32, 33)
  - Filtrar por Estado (Finalizados, En curso, Tareas por hacer)
  - Filtrar por Prioridad (Highest, High, Medium, Low, Lowest)

#### 📥 Exportar Datos
- Click en "📥 Exportar a CSV"
- Se descarga automáticamente con todos los datos actuales
- Incluye todos los cambios realizados

#### 🔄 Recalcular KPIs
- Si los datos no se actualizan automáticamente
- Click en "🔄 Recalcular KPIs" en Dashboard
- Todos los cálculos se refrescan

### 4. Interpretación de KPIs

| KPI | Meta | Descripción |
|-----|------|-------------|
| **% Finalizados** | > 80% | Porcentaje de incidentes completamente resueltos |
| **% En Curso** | < 20% | Porcentaje de incidentes actualmente en progreso |
| **Highest Abiertos** | 0 | Cantidad de incidentes de máxima prioridad sin resolver |
| **Backlog** | < 5 | Cantidad de incidentes pendientes de iniciar |
| **Tiempo Highest** | < 2 días | Tiempo promedio de resolución para prioridad Highest |
| **Tiempo High** | < 5 días | Tiempo promedio de resolución para prioridad High |
| **Tiempo Medium** | < 15 días | Tiempo promedio de resolución para prioridad Medium |

### 5. Estados de Cumplimiento
- ✅ **✓ Cumple** (verde): KPI dentro de la meta
- ⚠️ **⚠ Revisar** (amarillo): KPI requiere atención
- 🚨 **⚠ CRÍTICO** (rojo): KPI en estado crítico

## 📝 Notas Importantes

### ⚡ Características Dinámicas
- **Sin valores fijos**: Todos los KPIs se calculan desde los datos
- **Actualización automática**: Los cambios se reflejan inmediatamente
- **Edición en tiempo real**: Las celdas se actualizan al editar
- **Persistencia local**: Los datos se mantienen en la sesión del navegador

### 🔒 Criterios de Sprint
- Todos los incidentes con sprint < 30 se asignan automáticamente al Sprint 30
- El Sprint 32 es el sprint actual por defecto
- Puedes agregar incidentes a sprints futuros (33, 34, 35...)

### 💾 Guardar Cambios Permanentemente
El dashboard funciona en memoria del navegador. Para guardar cambios permanentemente:
1. Click en "📥 Exportar a CSV"
2. Guardar el archivo exportado
3. Reemplazar `update.csv` con el archivo exportado
4. Ejecutar `.\generate_final_data.ps1` para regenerar los datos

## 🔄 Actualizar con Nuevos Datos de Jira

### Opción 1: Manual
1. Exportar nuevo CSV desde Jira
2. Guardar como `update.csv` en la carpeta
3. Ejecutar PowerShell:
```powershell
.\generate_final_data.ps1
```
4. Refrescar el navegador (F5)

### Opción 2: Agregar directamente en el Dashboard
1. Usar botón "➕ Agregar Nuevo Incidente"
2. Completar datos del nuevo bug
3. Los KPIs se actualizan automáticamente

## 🛠️ Tecnologías Utilizadas
- **HTML5** - Estructura del dashboard
- **CSS3** - Estilos y diseño responsive
- **JavaScript (Vanilla)** - Lógica y cálculos dinámicos
- **Canvas API** - Gráficos interactivos
- **PowerShell** - Procesamiento de datos CSV

## 📧 Soporte
Para problemas o preguntas sobre el dashboard, contactar al equipo de desarrollo.

---
**Última Actualización**: 20 de Enero de 2026  
**Total de Tickets**: 259  
**Sprint Actual**: Sprint 32
