# 📚 Índice de Documentación - Dashboard KPIs + Jira API

## 🎯 Guías por Tipo de Usuario

### 👤 Usuario Final (Solo Visualizar Dashboard)
1. **Leer primero**: [Dashboard_KPIs_Dev.html](Dashboard_KPIs_Dev.html) - Simplemente abre en navegador
2. **Opcional**: [INSTRUCCIONES_COMPARTIR.md](INSTRUCCIONES_COMPARTIR.md) - Cómo compartir con equipo

### 🔧 Usuario Técnico (Sincronización con Jira)
1. **Inicio rápido**: [INICIO_RAPIDO.md](INICIO_RAPIDO.md) ⭐ **Empieza aquí**
2. **Guía completa**: [GUIA_API_JIRA.md](GUIA_API_JIRA.md)
3. **Ejemplos prácticos**: [EJEMPLOS_USO.md](EJEMPLOS_USO.md)
4. **Troubleshooting**: [GUIA_API_JIRA.md](GUIA_API_JIRA.md#troubleshooting)

### 💼 Management/Stakeholders
1. **Resumen ejecutivo**: [RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md) ⭐ **Para decisiones**
2. **Métricas de impacto**: [RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md#métricas-de-impacto)
3. **ROI**: [RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md#análisis-de-roi)

### 👨‍💻 Desarrolladores/DevOps
1. **Arquitectura**: [ARQUITECTURA.md](ARQUITECTURA.md)
2. **Changelog**: [CHANGELOG.md](CHANGELOG.md)
3. **Código fuente**: Scripts `.ps1` comentados
4. **README técnico**: [README.md](README.md)

---

## 📄 Documentos por Propósito

### 🚀 Getting Started (Primeros Pasos)

| Documento | Descripción | Tiempo Lectura | Prioridad |
|-----------|-------------|----------------|-----------|
| [INICIO_RAPIDO.md](INICIO_RAPIDO.md) | Configurar y sincronizar en 5 min | 5 min | 🔥 Alta |
| [GUIA_API_JIRA.md](GUIA_API_JIRA.md) | Guía completa paso a paso | 15 min | ⭐ Media |
| [README.md](README.md) | Visión general del proyecto | 10 min | ⭐ Media |

### 📖 Guías de Usuario

| Documento | Descripción | Cuándo usar |
|-----------|-------------|-------------|
| [GUIA_API_JIRA.md](GUIA_API_JIRA.md) | Configuración detallada de API | Primera vez usando API |
| [EJEMPLOS_USO.md](EJEMPLOS_USO.md) | Casos de uso prácticos y JQL | Necesitas consultas específicas |
| [INSTRUCCIONES_COMPARTIR.md](INSTRUCCIONES_COMPARTIR.md) | Compartir dashboard | Distribuir a equipo |

### 🏗️ Documentación Técnica

| Documento | Descripción | Audiencia |
|-----------|-------------|-----------|
| [ARQUITECTURA.md](ARQUITECTURA.md) | Diagramas y flujos del sistema | Desarrolladores |
| [CHANGELOG.md](CHANGELOG.md) | Historial de cambios | DevOps/Admins |
| [README_Dashboard.md](README_Dashboard.md) | Detalles del dashboard | Frontend devs |

### 📊 Documentos Ejecutivos

| Documento | Descripción | Para quién |
|-----------|-------------|------------|
| [RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md) | Métricas, ROI, impacto | C-Level, Management |

---

## 🛠️ Scripts y Herramientas

### 🔌 Scripts de Conexión API (Nuevos)

| Script | Propósito | Cuándo ejecutar |
|--------|-----------|----------------|
| `Setup-JiraConnection.ps1` | Configuración inicial | **Una vez** (primera vez) |
| `Test-JiraConnection.ps1` | Verificar conexión | Después de configurar |
| `Connect-JiraAPI.ps1` | Extraer datos de Jira | Cada actualización |
| `iniciar_jira_sync.ps1` | Sincronización completa | **Recomendado** uso diario |
| `iniciar_jira_sync.bat` | Atajo Windows | Doble clic para sincronizar |

### 📜 Scripts Legacy (HTML Export)

| Script | Propósito | Cuándo usar |
|--------|-----------|-------------|
| `extract_jira_simple.ps1` | Extracción básica HTML | Sin acceso a API |
| `extract_full_jira_data.ps1` | Extracción completa HTML | Datos históricos específicos |
| `extract_jira_changelog.ps1` | Historial de cambios | Auditoría detallada |

### ⚙️ Scripts de Procesamiento

| Script | Propósito | Ejecución |
|--------|-----------|-----------|
| `process_jira_new.ps1` | Procesar datos extraídos | Automático con sync |
| `generate_final_data.ps1` | Generar datos dashboard | Automático con sync |
| `calculate_kpis.ps1` | Calcular métricas | Según necesidad |

---

## 📁 Archivos de Configuración

| Archivo | Descripción | Versionado Git |
|---------|-------------|----------------|
| `jira_config.example.json` | Plantilla de configuración | ✅ Sí |
| `jira_config.json` | Credenciales reales | ❌ No (.gitignore) |
| `dashboard_data.js` | Datos del dashboard | ⚠️ Opcional |

---

## 🗺️ Mapa de Flujo de Lectura

### Para Nuevo Usuario Completo

```
1. INICIO_RAPIDO.md (5 min)
   ↓
2. Ejecutar Setup-JiraConnection.ps1
   ↓
3. Ejecutar Test-JiraConnection.ps1
   ↓
4. Ejecutar iniciar_jira_sync.ps1
   ↓
5. Abrir Dashboard_Dinamico_Editable.html
   ↓
6. [Opcional] EJEMPLOS_USO.md para consultas avanzadas
```

### Para Troubleshooting

```
1. GUIA_API_JIRA.md → Sección Troubleshooting
   ↓
2. Ejecutar Test-JiraConnection.ps1
   ↓
3. EJEMPLOS_USO.md → Sección Troubleshooting
   ↓
4. [Si persiste] Contactar soporte
```

### Para Personalización Avanzada

```
1. ARQUITECTURA.md (entender sistema)
   ↓
2. EJEMPLOS_USO.md (consultas JQL)
   ↓
3. Modificar Connect-JiraAPI.ps1
   ↓
4. Revisar CHANGELOG.md (historial)
```

---

## 🔍 Búsqueda Rápida por Problema

### "No puedo conectar con Jira"
→ [GUIA_API_JIRA.md - Troubleshooting](GUIA_API_JIRA.md#troubleshooting)  
→ Ejecutar: `Test-JiraConnection.ps1`

### "¿Cómo extraigo datos de un sprint específico?"
→ [EJEMPLOS_USO.md - Consultas JQL](EJEMPLOS_USO.md#consultas-jql-comunes)

### "¿Cómo automatizo la sincronización?"
→ [EJEMPLOS_USO.md - Automatización](EJEMPLOS_USO.md#automatización)

### "Error 401 Unauthorized"
→ [GUIA_API_JIRA.md - Error 401](GUIA_API_JIRA.md#error-401-unauthorized)

### "¿Qué impacto tiene esto en el negocio?"
→ [RESUMEN_EJECUTIVO.md - ROI](RESUMEN_EJECUTIVO.md#análisis-de-roi)

### "¿Cómo funciona técnicamente?"
→ [ARQUITECTURA.md - Diagrama](ARQUITECTURA.md#diagrama-de-arquitectura)

---

## 📊 Matriz de Documentos

|  | Lectura Rápida | Guía Completa | Referencia Técnica |
|---|---|---|---|
| **Configuración** | INICIO_RAPIDO.md | GUIA_API_JIRA.md | ARQUITECTURA.md |
| **Uso** | INICIO_RAPIDO.md | EJEMPLOS_USO.md | Connect-JiraAPI.ps1 |
| **Troubleshooting** | GUIA_API_JIRA.md | EJEMPLOS_USO.md | Test-JiraConnection.ps1 |
| **Negocio** | README.md | RESUMEN_EJECUTIVO.md | CHANGELOG.md |

---

## 🎓 Rutas de Aprendizaje

### Ruta 1: "Solo quiero que funcione" (15 minutos)
1. ✅ [INICIO_RAPIDO.md](INICIO_RAPIDO.md)
2. ✅ Ejecutar scripts siguiendo pasos
3. ✅ Verificar dashboard

### Ruta 2: "Quiero entender cómo funciona" (1 hora)
1. ✅ [README.md](README.md) - Visión general
2. ✅ [GUIA_API_JIRA.md](GUIA_API_JIRA.md) - Configuración
3. ✅ [ARQUITECTURA.md](ARQUITECTURA.md) - Arquitectura
4. ✅ [EJEMPLOS_USO.md](EJEMPLOS_USO.md) - Casos de uso

### Ruta 3: "Quiero personalizarlo" (2-3 horas)
1. ✅ Ruta 2 completa
2. ✅ Revisar código de scripts
3. ✅ [EJEMPLOS_USO.md](EJEMPLOS_USO.md) - Sección avanzada
4. ✅ Experimentar con JQL personalizado

### Ruta 4: "Necesito presentarlo a management" (30 minutos)
1. ✅ [RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md)
2. ✅ Preparar demo del dashboard
3. ✅ Métricas de impacto

---

## 📞 Contacto y Soporte

### Autoservicio
1. 📖 Esta documentación cubre >90% de casos
2. 🔍 Buscar en índice arriba
3. ⚡ Script de diagnóstico: `Test-JiraConnection.ps1`

### Soporte Técnico
- 📧 Email: equipo-devops@empresa.com
- 💬 Slack: #dashboard-kpis
- 🐛 Issues: GitHub repository

---

## 🔄 Mantenimiento del Índice

**Última actualización**: Febrero 16, 2026  
**Versión**: 2.0  
**Próxima revisión**: Al agregar nueva documentación

---

## ✅ Checklist de Documentos

### Documentación Usuario
- [x] INICIO_RAPIDO.md
- [x] GUIA_API_JIRA.md
- [x] EJEMPLOS_USO.md
- [x] INSTRUCCIONES_COMPARTIR.md

### Documentación Técnica
- [x] ARQUITECTURA.md
- [x] CHANGELOG.md
- [x] README.md
- [x] README_Dashboard.md

### Documentación Ejecutiva
- [x] RESUMEN_EJECUTIVO.md

### Scripts
- [x] Setup-JiraConnection.ps1
- [x] Connect-JiraAPI.ps1
- [x] Test-JiraConnection.ps1
- [x] iniciar_jira_sync.ps1/.bat

### Configuración
- [x] jira_config.example.json
- [x] .gitignore actualizado

---

**💡 Tip**: Marca este documento con un marcador en tu navegador para acceso rápido a toda la documentación.
