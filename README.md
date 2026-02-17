# Dashboard Ejecutivo de KPIs - Gestión de Calidad

## 📊 Descripción

Dashboard ejecutivo profesional para monitoreo y gestión de incidentes/tickets de calidad con análisis de KPIs, tendencias y métricas operacionales.

## ✨ Características

- **📈 Dashboard KPIs:** Métricas clave en tiempo real
- **📊 Evolución Sprint:** Análisis de tendencias históricas
- **📑 Resumen:** Distribución por prioridad y estado
- **🪲 Incidentes:** Tabla editable con filtros avanzados
- **🎨 Diseño Ejecutivo:** Interfaz premium con animaciones y efectos glass morphism
- **🔌 Conexión API Jira:** Integración directa con Jira REST API

## � Inicio Rápido

### Primera vez (Configuración):
```powershell
.\Setup-JiraConnection.ps1
```

### Sincronizar datos:
```powershell
.\iniciar_jira_sync.ps1
```
O ejecuta: `iniciar_jira_sync.bat`

Ver: [INICIO_RAPIDO.md](INICIO_RAPIDO.md) | [GUIA_API_JIRA.md](GUIA_API_JIRA.md)

## 🔌 Conexión a Jira

### Opción 1: API REST (Recomendado) ⚡

**Ventajas:**
- ✅ Sincronización automática en tiempo real
- ✅ Sin exportaciones manuales
- ✅ Datos siempre actualizados
- ✅ Acceso a historial completo

**Scripts disponibles:**

| Script | Descripción |
|--------|-------------|
| `Setup-JiraConnection.ps1` | Asistente de configuración (ejecutar primero) |
| `Connect-JiraAPI.ps1` | Extracción de datos vía API |
| `Test-JiraConnection.ps1` | Verificar conexión y credenciales |
| `iniciar_jira_sync.ps1` | Sincronización completa automatizada |

**Configuración rápida:**
```powershell
# 1. Crear configuración
.\Setup-JiraConnection.ps1

# 2. Probar conexión
.\Test-JiraConnection.ps1

# 3. Sincronizar
.\iniciar_jira_sync.ps1
```

### Opción 2: Exportación HTML (Legacy)

Para uso sin API o datos históricos:
- `extract_jira_simple.ps1` - Extracción básica
- `extract_full_jira_data.ps1` - Extracción completa
- `extract_jira_changelog.ps1` - Historial de cambios

## 📖 Uso del Dashboard

1. **Sincronizar datos** con Jira (API o HTML)
2. **Abrir dashboard**: `Dashboard_Dinamico_Editable.html`
3. **Seleccionar sprint** en el selector superior
4. **Navegar pestañas**:
   - 📊 Dashboard KPIs
   - 📈 Evolución Sprint
   - 📑 Resumen
   - 🪲 Incidentes
5. **Editar datos** directamente en la tabla

## 📁 Estructura del Proyecto

```
📂 Dashboard KPIs - Gestión de Calidad
│
├── 📊 Dashboard
│   ├── Dashboard_Dinamico_Editable.html    # Interfaz principal
│   ├── dashboard_logic.js                   # Lógica del dashboard
│   ├── dashboard_data.js                    # Datos procesados
│   └── resources/                           # Google Charts
│
├── 🔌 Conexión API Jira
│   ├── Setup-JiraConnection.ps1            # Configuración inicial
│   ├── Connect-JiraAPI.ps1                 # Extractor API
│   ├── Test-JiraConnection.ps1             # Verificador
│   ├── iniciar_jira_sync.ps1/.bat         # Sync automático
│   ├── jira_config.example.json           # Ejemplo de config
│   └── GUIA_API_JIRA.md                   # Documentación
│
├── 📜 Scripts Legacy (HTML)
│   ├── extract_jira_simple.ps1
│   ├── extract_full_jira_data.ps1
│   └── extract_jira_changelog.ps1
│
├── ⚙️ Procesamiento
│   ├── process_jira_new.ps1
│   ├── generate_final_data.ps1
│   └── calculate_kpis.ps1
│
└── 📚 Documentación
    ├── README.md                          # Este archivo
    ├── INICIO_RAPIDO.md                   # Guía rápida
    ├── GUIA_API_JIRA.md                   # Guía completa API
    └── INSTRUCCIONES_COMPARTIR.md         # Compartir dashboard
```

## 🛠️ Tecnologías

- **Frontend**: HTML5 + CSS3 (Glass Morphism, Gradients, Animations)
- **JavaScript**: Vanilla JS
- **Charts**: Google Charts API + Canvas API
- **Backend**: PowerShell scripts
- **API**: Jira REST API v3
- **Diseño**: Responsive + Dark Mode

## 📋 Requisitos

### Para usar el Dashboard:
- Navegador moderno (Chrome, Firefox, Edge)
- No requiere instalación

### Para sincronización con Jira API:
- **Windows PowerShell 5.1+** (incluido en Windows)
- **Cuenta de Jira Cloud** con acceso al proyecto
- **API Token de Atlassian** ([obtener aquí](https://id.atlassian.com/manage-profile/security/api-tokens))
- **Conexión a Internet**

## 🔒 Seguridad

### ⚠️ IMPORTANTE
- **NUNCA** subas `jira_config.json` a repositorios públicos
- El archivo `.gitignore` ya protege las credenciales
- Rota tu API token periódicamente
- No compartas tu API token por email o chat

### Buenas prácticas:
```powershell
# Verificar que jira_config.json esté protegido
git status  # No debe aparecer jira_config.json

# Si aparece, agregarlo a .gitignore
echo "jira_config.json" >> .gitignore
```

## 🐛 Troubleshooting

### Error: "401 Unauthorized"
**Causa**: Credenciales incorrectas o expiradas

**Solución**:
```powershell
# 1. Verificar configuración
.\Test-JiraConnection.ps1

# 2. Regenerar API token en:
# https://id.atlassian.com/manage-profile/security/api-tokens

# 3. Reconfigurar
.\Setup-JiraConnection.ps1
```

### Error: "400 Bad Request - JQL inválido"
**Causa**: Consulta JQL mal formada

**Solución**:
1. Editar `jira_config.json`
2. Probar JQL directamente en Jira
3. Ajustar sintaxis y nombres de Sprint

### No se encuentran issues
**Posibles causas**:
- Nombres de Sprint incorrectos
- Permisos insuficientes en Jira
- Proyecto no accesible

**Solución**:
```powershell
# Verificar configuración y acceso
.\Test-JiraConnection.ps1

# Ajustar JQL en jira_config.json
# Ejemplo: project = IMS AND updated >= -30d
```

### Script no se ejecuta
**Error**: "...no se puede cargar porque la ejecución de scripts está deshabilitada..."

**Solución**:
```powershell
# Permitir ejecución de scripts locales
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### Campos personalizados no aparecen
**Causa**: IDs de campos personalizados incorrectos

**Solución**:
1. Visitar: `https://tu-empresa.atlassian.net/rest/api/3/field`
2. Buscar campo deseado (Sprint, Story Points)
3. Actualizar ID en `Connect-JiraAPI.ps1`

## 📚 Recursos Adicionales

- [Jira REST API Documentation](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
- [JQL Syntax Guide](https://support.atlassian.com/jira-software-cloud/docs/what-is-advanced-search-in-jira-cloud/)
- [API Tokens Management](https://id.atlassian.com/manage-profile/security/api-tokens)

## 🤝 Contribuir

1. Fork el repositorio
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 👥 Colaboración

Ver [INSTRUCCIONES_COMPARTIR.md](INSTRUCCIONES_COMPARTIR.md) para opciones de compartir el dashboard.

## 📝 Licencia

Uso interno corporativo - Gestión de Calidad

## 📧 Soporte

Para preguntas o problemas:
1. Revisar [GUIA_API_JIRA.md](GUIA_API_JIRA.md)
2. Ejecutar `.\Test-JiraConnection.ps1` para diagnóstico
3. Contactar al equipo de DevOps/Calidad

---

**Última actualización:** Febrero 2026  
**Versión:** 2.0 - Con integración API Jira
