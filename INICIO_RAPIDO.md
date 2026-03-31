# 🚀 Inicio Rápido - Conexión API Jira

## Para usuarios nuevos

### 1. Configurar (solo la primera vez)
```powershell
.\Setup-JiraConnection.ps1
```
Esto te guiará paso a paso para configurar tus credenciales.

### 2. Sincronizar datos
```powershell
.\iniciar_jira_sync.ps1
```
O simplemente:
```cmd
iniciar_jira_sync.bat
```

### 3. Abrir dashboard
Abre `Dashboard_Dinamico_Editable.html` en tu navegador.

---

## Comandos útiles

### Probar conexión
```powershell
.\Test-JiraConnection.ps1
```

### Solo extraer datos (sin procesar)
```powershell
.\Connect-JiraAPI.ps1
```

### Extraer con detalles
```powershell
.\Connect-JiraAPI.ps1 -Verbose
```

---

## ¿Necesitas ayuda?

- Ver guía completa: [GUIA_API_JIRA.md](GUIA_API_JIRA.md)
- Documentación principal: [README.md](README.md)

---

## Troubleshooting rápido

### Error 401 (No autorizado)
- Verifica tu email y API token en `jira_config.json`
- Regenera tu API token en: https://id.atlassian.com/manage-profile/security/api-tokens

### Error 400 (JQL inválido)
- Edita `jira_config.json` y verifica el campo `jql`
- Prueba tu JQL directamente en Jira

### No se encuentran issues
- Verifica que los nombres de Sprint sean correctos
- Ajusta el JQL en `jira_config.json`
