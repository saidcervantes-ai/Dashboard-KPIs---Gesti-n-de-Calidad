# 📋 Guía para Compartir el Dashboard

## 🚀 Opción Recomendada: GitHub + GitHub Pages

### Paso 1: Crear Repositorio en GitHub

1. Ve a [github.com](https://github.com) e inicia sesión (o crea cuenta gratuita)
2. Click en el botón **"New"** o **"+"** → **"New repository"**
3. Configura el repositorio:
   - **Repository name:** `dashboard-kpis-calidad`
   - **Description:** "Dashboard ejecutivo de KPIs de Gestión de Calidad"
   - **Visibility:** 
     - ✅ **Private** (solo tú y tu jefe pueden ver)
     - ⚠️ **Public** (cualquiera puede ver - NO recomendado para datos corporativos)
4. ✅ Marca "Add a README file"
5. Click **"Create repository"**

### Paso 2: Subir Archivos al Repositorio

**Opción A - Desde la Web (Más Fácil):**

1. En tu repositorio, click **"Add file"** → **"Upload files"**
2. Arrastra estos archivos:
   - `Dashboard_Dinamico_Editable.html`
   - `dashboard_logic.js`
   - `dashboard_data.js`
   - Carpeta `resources/` completa
3. Escribe un mensaje: "Versión inicial del dashboard"
4. Click **"Commit changes"**

**Opción B - Usando Git desde Terminal:**

```powershell
# Navegar a tu carpeta
cd C:\Users\scervantes\Downloads\KPIs_Gestion_Calidad_Dev_Sprint30

# Inicializar repositorio
git init

# Agregar archivos
git add Dashboard_Dinamico_Editable.html
git add dashboard_logic.js
git add dashboard_data.js
git add resources/

# Primer commit
git commit -m "Versión inicial del dashboard ejecutivo"

# Conectar con GitHub (reemplaza TU_USUARIO y TU_REPO)
git remote add origin https://github.com/TU_USUARIO/dashboard-kpis-calidad.git

# Subir archivos
git branch -M main
git push -u origin main
```

### Paso 3: Activar GitHub Pages (Hospedaje Web Gratuito)

1. En tu repositorio, ve a **Settings** (⚙️)
2. En el menú lateral, click **"Pages"**
3. En **"Branch"**, selecciona **"main"** y carpeta **"/ (root)"**
4. Click **"Save"**
5. Espera 2-3 minutos y verás una URL como:
   ```
   https://TU_USUARIO.github.io/dashboard-kpis-calidad/Dashboard_Dinamico_Editable.html
   ```

### Paso 4: Compartir con tu Jefe

**Para dar acceso de visualización y edición:**

1. En GitHub, ve a **Settings** → **Collaborators**
2. Click **"Add people"**
3. Ingresa el email o username de GitHub de tu jefe
4. Selecciona rol **"Admin"** (puede editar todo)
5. Tu jefe recibirá una invitación por email

**Envía a tu jefe:**
- 🔗 URL del repositorio: `https://github.com/TU_USUARIO/dashboard-kpis-calidad`
- 🌐 URL del dashboard en vivo: `https://TU_USUARIO.github.io/dashboard-kpis-calidad/Dashboard_Dinamico_Editable.html`

### Paso 5: Flujo de Trabajo para Actualizaciones

**Cuando tú o tu jefe hagan cambios:**

1. **Editar en GitHub (Método Simple):**
   - Abre el archivo en GitHub
   - Click en el ícono del lápiz ✏️
   - Haz cambios
   - Scroll abajo, escribe mensaje
   - Click "Commit changes"
   - Cambios en vivo en 1-2 minutos

2. **Editar Localmente (Método Profesional):**
   ```powershell
   # Descargar últimos cambios
   git pull origin main
   
   # Hacer tus modificaciones en los archivos
   
   # Subir cambios
   git add .
   git commit -m "Descripción de cambios"
   git push origin main
   ```

---

## 💼 Opción 2: OneDrive / SharePoint (Para Entornos Corporativos)

### Pasos:

1. **Sube la carpeta completa a OneDrive:**
   - Arrastra la carpeta a tu OneDrive
   - Espera sincronización

2. **Comparte con tu jefe:**
   - Click derecho en la carpeta → "Compartir"
   - Ingresa email de tu jefe
   - Selecciona **"Puede editar"**
   - Envía invitación

3. **Acceso:**
   - Tu jefe abre la carpeta sincronizada
   - Abre `Dashboard_Dinamico_Editable.html` en su navegador
   - Los cambios se sincronizan automáticamente

**Ventajas:** ✅ Sincronización automática, familiar en empresas
**Desventajas:** ❌ No tiene control de versiones robusto

---

## 🖥️ Opción 3: Servidor Web Local (Red Corporativa)

Si están en la misma red de oficina:

### Usar Python (Simple):

```powershell
# Navegar a la carpeta
cd C:\Users\scervantes\Downloads\KPIs_Gestion_Calidad_Dev_Sprint30

# Iniciar servidor web
python -m http.server 8080
```

Luego tu jefe accede desde: `http://TU_IP:8080/Dashboard_Dinamico_Editable.html`

Para encontrar tu IP:
```powershell
ipconfig
# Busca "IPv4 Address" (ej: 192.168.1.100)
```

**Ventajas:** ✅ Rápido para demostración
**Desventajas:** ❌ Requiere que tu PC esté encendida, no hay edición colaborativa

---

## 📊 Opción 4: Plataformas de Hospedaje Gratuito

### Netlify Drop (Más Rápido):

1. Ve a [app.netlify.com/drop](https://app.netlify.com/drop)
2. Arrastra toda la carpeta
3. Obtienes URL instantánea como: `https://random-name.netlify.app`
4. Comparte la URL con tu jefe

**Ventajas:** ✅ Instantáneo, sin cuenta necesaria
**Desventajas:** ❌ Difícil editar, URL aleatoria

### Vercel (Profesional):

1. Instala Vercel CLI: `npm install -g vercel`
2. En la carpeta del proyecto: `vercel`
3. Sigue las instrucciones
4. Obtienes URL profesional

---

## 🏆 Recomendación Final

Para un entorno profesional con tu jefe, **recomiendo GitHub**:

✅ Control de versiones (historial completo de cambios)
✅ Colaboración profesional
✅ Gratis para repositorios privados
✅ Hospedaje web incluido (GitHub Pages)
✅ Edición desde web o localmente
✅ Ideal para presentar en revisiones
✅ Respaldos automáticos

---

## 🔐 Seguridad y Datos Sensibles

⚠️ **IMPORTANTE:** Si el dashboard contiene datos sensibles:

1. Usa repositorio **PRIVADO** en GitHub
2. O elimina datos reales y usa datos de ejemplo
3. Agrega archivo `.gitignore` para excluir datos:

```gitignore
# .gitignore
dashboard_data.js
*.xlsx
*.csv
```

Luego tu jefe puede tener su propia copia de `dashboard_data.js` localmente.

---

## 💡 Tips Adicionales

- **Para presentaciones en vivo:** Usa GitHub Pages, siempre disponible
- **Para colaboración activa:** GitHub con control de versiones
- **Para uso interno rápido:** OneDrive/SharePoint
- **Para demostración temporal:** Python SimpleHTTPServer

¿Necesitas ayuda con alguna de estas opciones?
