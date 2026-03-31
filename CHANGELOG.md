# 📝 Changelog - Dashboard KPIs Gestión de Calidad

Todos los cambios notables en este proyecto serán documentados en este archivo.

## [2.0.0] - 2026-02-16

### 🎉 Nueva Funcionalidad Principal
- **Integración directa con Jira REST API**
  - Conexión automática sin exportaciones manuales
  - Sincronización en tiempo real
  - Autenticación segura con API tokens

### ✨ Nuevos Scripts

#### Scripts de Conexión API
- `Connect-JiraAPI.ps1` - Extractor principal de datos vía API
  - Autenticación con Jira Cloud
  - Manejo de paginación automático
  - Soporte para campos personalizados
  - Exportación a CSV compatible

- `Setup-JiraConnection.ps1` - Asistente de configuración
  - Configuración guiada paso a paso
  - Validación de credenciales
  - Prueba de conexión automática
  - Generación segura de configuración

- `Test-JiraConnection.ps1` - Verificador de conexión
  - Validación de autenticación
  - Verificación de acceso a proyecto
  - Test de consultas JQL
  - Diagnóstico de campos personalizados

- `iniciar_jira_sync.ps1` / `.bat` - Sincronización completa
  - Proceso automatizado end-to-end
  - Extracción + Procesamiento + Dashboard
  - Manejo de errores robusto
  - Opción de apertura automática del dashboard

#### Archivos de Configuración
- `jira_config.example.json` - Plantilla de configuración
  - Estructura clara y documentada
  - Valores de ejemplo
  - Configuración de JQL personalizable

### 📚 Nueva Documentación
- `GUIA_API_JIRA.md` - Guía completa de API
  - Instrucciones detalladas de configuración
  - Ejemplos de JQL
  - Troubleshooting extensivo
  - Mejores prácticas de seguridad

- `INICIO_RAPIDO.md` - Guía de inicio rápido
  - Comandos básicos
  - Troubleshooting común
  - Referencias cruzadas

### 🔒 Mejoras de Seguridad
- Actualizado `.gitignore` para proteger credenciales
  - Exclusión de `jira_config.json`
  - Protección de archivos de credenciales
  - Patrones para archivos sensibles

### 📖 Documentación Actualizada
- `README.md` mejorado
  - Sección de conexión API agregada
  - Estructura del proyecto clarificada
  - Requisitos detallados
  - Troubleshooting expandido
  - Recursos adicionales

### 🎨 Características de los Scripts API

#### Visualización Mejorada
- Barras de progreso durante descarga
- Mensajes con colores para mejor legibilidad
- Estadísticas detalladas post-extracción
- Resúmenes por sprint, estado y prioridad

#### Funcionalidades Técnicas
- **Paginación automática**: Maneja grandes cantidades de issues
- **Normalización de estados**: Compatible con sistema existente
- **Extracción de sprints**: Detección automática de números de sprint
- **Cálculo de métricas**: Días de resolución, story points
- **Manejo de errores**: Mensajes claros y útiles

#### Compatibilidad
- Salida CSV compatible con scripts existentes
- Estructura de datos consistente
- Integración transparente con dashboard

### 🔄 Comparación con Método Anterior

| Aspecto | HTML Export (v1.x) | API REST (v2.0) |
|---------|-------------------|-----------------|
| Actualización | ❌ Manual | ✅ Automática |
| Configuración | - | ⚙️ Una vez |
| Tiempo real | ❌ No | ✅ Sí |
| Historial | ⚠️ Limitado | ✅ Completo |
| Campos custom | ⚠️ Algunos | ✅ Todos |
| Automatización | ❌ No | ✅ Completa |

### 🐛 Correcciones
- Mejora en detección de números de sprint
- Normalización de estados más robusta
- Manejo de fechas más confiable

### 📦 Archivos Mantenidos (Compatibilidad)
- Scripts legacy de HTML mantienen funcionalidad
- Dashboard sin cambios (100% compatible)
- Estructura de datos CSV idéntica

---

## [1.x] - Versiones Anteriores

### Características Existentes
- Dashboard ejecutivo con diseño premium
- Múltiples vistas (KPIs, Evolución, Resumen, Incidentes)
- Tabla editable de incidentes
- Procesamiento de exports HTML de Jira
- Múltiples scripts de procesamiento
- Cálculo de KPIs automático

---

## Roadmap Futuro

### Planeado para v2.1
- [ ] Soporte para webhooks de Jira
- [ ] Sincronización incremental (solo cambios)
- [ ] Cache de datos para mejor performance
- [ ] Exportación a múltiples formatos (Excel, JSON)
- [ ] Dashboard de configuración web

### Planeado para v2.2
- [ ] Análisis predictivo con ML
- [ ] Alertas automáticas por email
- [ ] Integración con Slack/Teams
- [ ] Reportes programados
- [ ] Panel de administración

### Ideas Futuras
- [ ] Soporte para múltiples proyectos
- [ ] Comparación entre equipos
- [ ] Métricas de velocidad de sprint
- [ ] Burndown/burnup charts
- [ ] Integración con GitHub/GitLab

---

**Formato del Changelog**: Basado en [Keep a Changelog](https://keepachangelog.com/)  
**Versionado**: [Semantic Versioning](https://semver.org/)
