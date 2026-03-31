# INSTRUCCIONES: Actualizar Changelog desde JIRA

## Resumen del Problema
El archivo `dashboard_changelog_data.js` está desactualizado. No incluye:
- Transición de IMS-1078 de CODE REVIEW a TEST (ocurrió el 23/03)
- Otros cambios de estado posteriores a la última generación del changelog

## Solución: Extraer Datos Nuevamente de JIRA

### Opción 1: Script PowerShell (Recomendado)

El archivo `extract_jira_changelog.ps1` ya existe con las configuraciones necesarias:

```powershell
# 1. Abre PowerShell en la carpeta del proyecto
# 2. Ejecuta:

.\extract_jira_changelog.ps1

# 3. Este script generará:
#    - jira_changelog_tiempos_estado.csv
#    - Actualizará dashboard_changelog_data.js
```

**Requisitos:**
- ✅ Credenciales JIRA válidas (ya configuradas en el script)
- ✅ Conexión a Internet
- ✅ Acceso a JIRA API

### Opción 2: Script Completo de Sincronización

```powershell
.\Sincronizar-Dashboard-Completo.ps1
```

Este script ejecuta todo el proceso:
1. Extrae datos nuevos de JIRA
2. Procesa el changelog
3. Calcula todos los KPIs
4. Actualiza el dashboard

---

## Pasos Exactos

### 1. Abre PowerShell
- Presiona `Win + R`
- Escribe `powershell`
- Navega a la carpeta del proyecto:
  ```powershell
  cd "c:\Users\scervantes\Downloads\KPIs_Gestion_Calidad_Dev_Sprint30"
  ```

### 2. Ejecuta la Extracción
```powershell
# Opción A: Solo changelog
.\extract_jira_changelog.ps1

# Opción B: Sincronización completa
.\Sincronizar-Dashboard-Completo.ps1
```

### 3. Verifica el Resultado
Después de ejecutar, verifica:

```bash
# Comprueba que se actualizó el changelog
node validate_tickets_criticos.js
```

---

## ¿Qué Ocurrirá?

Una vez actualizado el changelog:

### Tickets que cambiarán:
- **IMS-1078**: CODE REVIEW será reemplazado por IN TEST (nuevo estado)
- **Otros tickets**: Se actualizarán si tienen cambios recientes

### Ejemplo de IMS-1078 después de actualizar:
```javascript
// ANTES (desactualizado):
'IMS-1078': [
    {estado: 'To do', dias: 14.6, inicio: '10/02/2026 12:32', fin: '02/03/2026 20:51'},
    {estado: 'In Process', dias: 4, inicio: '02/03/2026 20:51', fin: '06/03/2026 19:36'},
    {estado: 'Blocked', dias: 1, inicio: '06/03/2026 19:36', fin: '10/03/2026 03:16'},
    {estado: 'In Process', dias: 0.3, inicio: '10/03/2026 03:16', fin: '10/03/2026 11:28'},
    {estado: 'CODE REVIEW', dias: 4.7, inicio: '10/03/2026 11:28', fin: 'En curso'}  // ← PROBLEMA
]

// DESPUÉS (actualizado):
'IMS-1078': [
    {estado: 'To do', dias: 14.6, inicio: '10/02/2026 12:32', fin: '02/03/2026 20:51'},
    {estado: 'In Process', dias: 4, inicio: '02/03/2026 20:51', fin: '06/03/2026 19:36'},
    {estado: 'Blocked', dias: 1, inicio: '06/03/2026 19:36', fin: '10/03/2026 03:16'},
    {estado: 'In Process', dias: 0.3, inicio: '10/03/2026 03:16', fin: '10/03/2026 11:28'},
    {estado: 'CODE REVIEW', dias: 13, inicio: '10/03/2026 11:28', fin: '23/03/2026 12:00'},  // ← ACTUALIZADO
    {estado: 'IN TEST', dias: 0.5, inicio: '23/03/2026 12:00', fin: 'En curso'}  // ← NUEVO ESTADO
]
```

---

## Posibles Errores y Soluciones

### Error: "Conexión rechazada"
- **Causa**: Credenciales expiradas o sin acceso a JIRA
- **Solución**: Verificar que las credenciales en `extract_jira_changelog.ps1` sean válidas

### Error: "archivo en uso"
- **Causa**: El dashboard está abierto en el navegador
- **Solución**: Cierra el dashboard en el navegador antes de ejecutar

### Error: "No se puede ejecutar scripts"
- **Causa**: Política de ejecución de PowerShell
- **Solución**: Ejecuta:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

---

## Próximos Pasos después de Actualizar

1. **Espera a que termine** la extracción (5-10 minutos)
2. **Valida** los nuevos datos:
   ```bash
   node validate_tickets_criticos.js
   ```
3. **Recarga** el dashboard en el navegador (Ctrl+F5)
4. **Verifica** que IMS-1078 ahora muestre:
   - ✅ CODE REVIEW: ~13d (el tiempo correcto)
   - ✅ Estado: IN TEST (o el actual)

---

## Ayuda Adicional

- Documentación: Ver `ARQUITECTURA.md`
- Scripts disponibles: Ver `README.md`
- Configuración JIRA: Ver `jira_config.json`

