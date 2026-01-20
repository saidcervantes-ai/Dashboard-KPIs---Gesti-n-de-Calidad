// ============================================
// SECCIÓN PRD - BUGS DE PRODUCCIÓN
// ============================================

let allBugsPRD = [];
let currentMonth = 'Enero 2026';

// Inicializar sección PRD al cargar
document.addEventListener('DOMContentLoaded', function() {
    initializePRD();
});

function initializePRD() {
    allBugsPRD = [...bugsPRD];
    
    // Actualizar información general PRD
    document.getElementById('last-update-prd').textContent = new Date().toLocaleString('es-ES');
    document.getElementById('total-bugs-prd').textContent = allBugsPRD.length;
    
    // Poblar selectores de filtros
    populateFiltersPRD();
    
    // Renderizar secciones PRD
    updateDashboardPRD();
    renderEvolucionPRD();
    updateResumenPRD();
    renderBugsPRD();
    
    // Actualizar footer con estadísticas de PRD
    if (typeof updateFooterStats === 'function') {
        updateFooterStats();
    }
}

// ==================== DASHBOARD KPIs PRD ====================

function updateDashboardPRD() {
    const mes = document.getElementById('month-selector-dashboard-prd').value;
    const bugs = mes === 'all' ? allBugsPRD : allBugsPRD.filter(b => b.mes === mes);
    
    const kpis = calcularKPIsPRD(bugs);
    renderDashboardKPIsPRD(kpis, bugs);
}

function calcularKPIsPRD(bugs) {
    const total = bugs.length;
    
    // Contar por estado
    const finalizados = bugs.filter(b => b.estado === 'Finalizada').length;
    const enCurso = bugs.filter(b => b.estado === 'En curso').length;
    const pendientes = bugs.filter(b => b.estado === 'Tareas por hacer').length;
    
    // Porcentajes
    const pctFinalizados = total > 0 ? ((finalizados / total) * 100).toFixed(1) : 0;
    const pctEnCurso = total > 0 ? ((enCurso / total) * 100).toFixed(1) : 0;
    
    // Highest abiertos
    const highestAbiertos = bugs.filter(b => 
        b.prioridad === 'Highest' && b.estado !== 'Finalizada'
    ).length;
    
    // High abiertos
    const highAbiertos = bugs.filter(b => 
        b.prioridad === 'High' && b.estado !== 'Finalizada'
    ).length;
    
    // Calcular tiempo promedio de resolución
    const bugsFinalizados = bugs.filter(b => b.estado === 'Finalizada' && b.creada && b.actualizada);
    let tiempoPromedio = 0;
    if (bugsFinalizados.length > 0) {
        const totalDias = bugsFinalizados.reduce((sum, bug) => {
            const dias = calcularDiasResolucionPRD(bug.creada, bug.actualizada);
            return sum + (dias || 0);
        }, 0);
        tiempoPromedio = (totalDias / bugsFinalizados.length).toFixed(1);
    }
    
    return {
        total,
        finalizados,
        enCurso,
        pendientes,
        pctFinalizados,
        pctEnCurso,
        highestAbiertos,
        highAbiertos,
        tiempoPromedio
    };
}

function renderDashboardKPIsPRD(kpis, bugs) {
    const container = document.getElementById('dashboard-kpis-prd');
    
    let html = '<div class="kpi-grid">';
    
    // KPI 1: Total Bugs
    html += `
        <div class="kpi-card">
            <div class="label">Total Bugs</div>
            <div class="value">${kpis.total}</div>
        </div>
    `;
    
    // KPI 2: Bugs Finalizados
    html += `
        <div class="kpi-card">
            <div class="label">Finalizados</div>
            <div class="value">${kpis.finalizados}</div>
            <div class="status status-cumple">${kpis.pctFinalizados}% del Total</div>
        </div>
    `;
    
    // KPI 3: En Curso
    html += `
        <div class="kpi-card">
            <div class="label">En Curso</div>
            <div class="value">${kpis.enCurso}</div>
            <div class="status ${kpis.enCurso > 5 ? 'status-revisar' : 'status-cumple'}">${kpis.pctEnCurso}% del Total</div>
        </div>
    `;
    
    // KPI 4: Pendientes
    html += `
        <div class="kpi-card">
            <div class="label">Tareas por Hacer</div>
            <div class="value">${kpis.pendientes}</div>
            <div class="status ${kpis.pendientes > 3 ? 'status-revisar' : 'status-cumple'}">${kpis.pendientes > 3 ? 'Revisar' : 'Bajo Control'}</div>
        </div>
    `;
    
    // KPI 5: Highest Abiertos
    html += `
        <div class="kpi-card">
            <div class="label">🔴 Highest Abiertos</div>
            <div class="value">${kpis.highestAbiertos}</div>
            <div class="status ${kpis.highestAbiertos > 0 ? 'status-critico' : 'status-cumple'}">${kpis.highestAbiertos > 0 ? 'CRÍTICO' : 'OK'}</div>
        </div>
    `;
    
    // KPI 6: High Abiertos
    html += `
        <div class="kpi-card">
            <div class="label">🟠 High Abiertos</div>
            <div class="value">${kpis.highAbiertos}</div>
            <div class="status ${kpis.highAbiertos > 2 ? 'status-revisar' : 'status-cumple'}">${kpis.highAbiertos > 2 ? 'Revisar' : 'OK'}</div>
        </div>
    `;
    
    // KPI 7: Tiempo Promedio
    html += `
        <div class="kpi-card">
            <div class="label">⏱️ Tiempo Promedio Resolución</div>
            <div class="value">${kpis.tiempoPromedio}</div>
            <div class="status ${kpis.tiempoPromedio > 7 ? 'status-revisar' : 'status-cumple'}">días</div>
        </div>
    `;
    
    html += '</div>';
    container.innerHTML = html;
}

function calcularDiasResolucionPRD(fechaCreada, fechaActualizada) {
    if (!fechaCreada || !fechaActualizada) return 0;
    
    try {
        const fecha1 = parseFechaPRD(fechaCreada);
        const fecha2 = parseFechaPRD(fechaActualizada);
        
        if (!fecha1 || !fecha2) return 0;
        
        const diff = fecha2 - fecha1;
        const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return dias >= 0 ? dias : 0;
    } catch (error) {
        return 0;
    }
}

function parseFechaPRD(fechaStr) {
    if (!fechaStr) return null;
    
    const meses = {
        'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5,
        'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11
    };
    
    // Formato: "11/dic/25 11:38 AM" o "11/dic/25"
    const partes = fechaStr.split(' ')[0].split('/');
    if (partes.length !== 3) return null;
    
    const dia = parseInt(partes[0]);
    const mesStr = partes[1].toLowerCase();
    const anio = parseInt('20' + partes[2]);
    
    const mes = meses[mesStr];
    if (mes === undefined) return null;
    
    return new Date(anio, mes, dia);
}

function recalcularKPIsPRD() {
    updateDashboardPRD();
    alert('✅ KPIs PRD recalculados correctamente');
}

// ==================== EVOLUCIÓN PRD ====================

function renderEvolucionPRD() {
    const canvas = document.getElementById('evolucionChartPRD');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: false });
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Agrupar bugs por mes
    const mesesOrdenados = [
        'Abril 2025', 'Mayo 2025', 'Junio 2025', 'Julio 2025', 
        'Agosto 2025', 'Septiembre 2025', 'Octubre 2025', 
        'Noviembre 2025', 'Diciembre 2025', 'Enero 2026'
    ];
    
    const datosPorMes = {};
    mesesOrdenados.forEach(mes => {
        datosPorMes[mes] = {
            total: 0,
            nuevos: 0,
            resueltos: 0
        };
    });
    
    allBugsPRD.forEach(bug => {
        const mes = bug.mes;
        if (datosPorMes[mes]) {
            datosPorMes[mes].nuevos++;
            if (bug.estado === 'Finalizada') {
                datosPorMes[mes].resueltos++;
            }
        }
    });
    
    // Calcular acumulados
    let acumulado = 0;
    mesesOrdenados.forEach(mes => {
        acumulado += datosPorMes[mes].nuevos - datosPorMes[mes].resueltos;
        datosPorMes[mes].total = Math.max(0, acumulado);
    });
    
    renderEvolucionChartProfessionalPRD(canvas, ctx, mesesOrdenados, datosPorMes);
    
    // Llenar tabla de evolución
    const tbody = document.getElementById('evolucion-prd-tbody');
    if (tbody) {
        tbody.innerHTML = '';
        mesesOrdenados.forEach(mes => {
            const datos = datosPorMes[mes];
            const porcentajeResolucion = datos.nuevos > 0 ? ((datos.resueltos / datos.nuevos) * 100).toFixed(1) : '0.0';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${mes}</strong></td>
                <td style="color: #dc3545;">${datos.nuevos}</td>
                <td style="color: #28a745;">${datos.resueltos}</td>
                <td style="color: #667eea;">${datos.nuevos - datos.resueltos}</td>
                <td><strong>${datos.total}</strong></td>
                <td>${porcentajeResolucion}%</td>
            `;
            tbody.appendChild(row);
        });
    }
}

function renderEvolucionChartProfessionalPRD(canvas, ctx, meses, datos) {
    const width = canvas.width;
    const height = canvas.height;
    const scale = width / 1200;
    
    // Limpiar canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    const padding = 80 * scale;
    const chartWidth = width - (padding * 2);
    const chartHeight = height - (padding * 2);
    
    // Encontrar valores máximos
    const maxTotal = Math.max(...meses.map(m => datos[m].total), 10);
    const maxNuevos = Math.max(...meses.map(m => datos[m].nuevos), 10);
    const maxResueltos = Math.max(...meses.map(m => datos[m].resueltos), 10);
    const maxValue = Math.max(maxTotal, maxNuevos, maxResueltos) * 1.1;
    
    // Dibujar líneas de cuadrícula
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1 * scale;
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight * i / 5);
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + chartWidth, y);
        ctx.stroke();
        
        const valor = Math.round(maxValue - (maxValue * i / 5));
        ctx.fillStyle = '#666';
        ctx.font = `${12 * scale}px Segoe UI`;
        ctx.textAlign = 'right';
        ctx.fillText(valor, padding - 10 * scale, y + 4 * scale);
    }
    
    // Función para dibujar línea con área
    function drawLineWithArea(dataKey, color) {
        const points = [];
        meses.forEach((mes, i) => {
            const x = padding + (chartWidth * i / (meses.length - 1));
            const value = datos[mes][dataKey];
            const y = padding + chartHeight - (chartHeight * value / maxValue);
            points.push({ x, y, value });
        });
        
        // Área bajo la línea
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(points[0].x, padding + chartHeight);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(points[points.length - 1].x, padding + chartHeight);
        ctx.closePath();
        
        const gradient = ctx.createLinearGradient(0, padding, 0, padding + chartHeight);
        gradient.addColorStop(0, color + '40');
        gradient.addColorStop(1, color + '00');
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();
        
        // Línea
        ctx.strokeStyle = color;
        ctx.lineWidth = 3 * scale;
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 4 * scale;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
        
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        
        // Puntos
        points.forEach(p => {
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 5 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2 * scale;
            ctx.stroke();
        });
    }
    
    // Dibujar las tres líneas
    drawLineWithArea('resueltos', '#28a745');
    drawLineWithArea('nuevos', '#dc3545');
    drawLineWithArea('total', '#667eea');
    
    // Etiquetas del eje X
    ctx.fillStyle = '#333';
    ctx.font = `${11 * scale}px Segoe UI`;
    ctx.textAlign = 'center';
    meses.forEach((mes, i) => {
        const x = padding + (chartWidth * i / (meses.length - 1));
        const mesCorto = mes.split(' ')[0].substring(0, 3);
        ctx.fillText(mesCorto, x, padding + chartHeight + 25 * scale);
    });
    
    // Leyenda
    const legendX = padding + 20 * scale;
    const legendY = padding + 20 * scale;
    const legends = [
        { label: 'Bugs Abiertos', color: '#667eea' },
        { label: 'Nuevos', color: '#dc3545' },
        { label: 'Resueltos', color: '#28a745' }
    ];
    
    legends.forEach((legend, i) => {
        const y = legendY + (i * 25 * scale);
        
        ctx.fillStyle = legend.color;
        ctx.fillRect(legendX, y, 20 * scale, 12 * scale);
        
        ctx.fillStyle = '#333';
        ctx.font = `bold ${13 * scale}px Segoe UI`;
        ctx.textAlign = 'left';
        ctx.fillText(legend.label, legendX + 30 * scale, y + 10 * scale);
    });
}

// ==================== RESUMEN PRD ====================

function updateResumenPRD() {
    const mes = document.getElementById('month-selector-resumen-prd').value;
    const bugs = mes === 'all' ? allBugsPRD : allBugsPRD.filter(b => b.mes === mes);
    
    renderResumenChartPrioridadPRD(bugs);
    renderResumenChartEstadoPRD(bugs);
}

function renderResumenChartPrioridadPRD(bugs) {
    const canvas = document.getElementById('resumenChartPrioridadPRD');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: false });
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Limpiar
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Agrupar por prioridad
    const prioridades = ['Highest', 'High', 'Medium', 'Low'];
    const data = {};
    prioridades.forEach(p => {
        data[p] = bugs.filter(b => b.prioridad === p).length;
    });
    
    const scale = canvas.width / 600;
    const padding = 60 * scale;
    const barWidth = 80 * scale;
    const barSpacing = 30 * scale;
    const maxValue = Math.max(...Object.values(data), 5) * 1.2;
    const chartHeight = canvas.height - (padding * 2);
    
    const colors = {
        'Highest': '#dc3545',
        'High': '#fd7e14',
        'Medium': '#ffc107',
        'Low': '#28a745'
    };
    
    let x = padding + 50 * scale;
    
    prioridades.forEach(prioridad => {
        const valor = data[prioridad];
        const barHeight = (valor / maxValue) * chartHeight;
        const y = padding + chartHeight - barHeight;
        const baseColor = colors[prioridad];
        
        // Sombra
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = 8 * scale;
        ctx.shadowOffsetY = 3 * scale;
        
        // Gradiente
        const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
        gradient.addColorStop(0, adjustColorBrightness(baseColor, 20));
        gradient.addColorStop(0.5, baseColor);
        gradient.addColorStop(1, adjustColorBrightness(baseColor, -20));
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);
        
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        
        // Borde
        ctx.strokeStyle = adjustColorBrightness(baseColor, -30);
        ctx.lineWidth = 2 * scale;
        ctx.strokeRect(x, y, barWidth, barHeight);
        
        // Highlight
        const highlightGradient = ctx.createLinearGradient(x, y, x, y + barHeight / 3);
        highlightGradient.addColorStop(0, 'rgba(255,255,255,0.4)');
        highlightGradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = highlightGradient;
        ctx.fillRect(x, y, barWidth, barHeight / 3);
        
        // Valor
        if (valor > 0) {
            ctx.fillStyle = '#fff';
            ctx.font = `bold ${16 * scale}px Segoe UI`;
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = 3 * scale;
            ctx.fillText(valor, x + barWidth / 2, y + barHeight / 2);
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
        }
        
        // Etiqueta
        ctx.fillStyle = '#333';
        ctx.font = `${13 * scale}px Segoe UI`;
        ctx.textAlign = 'center';
        ctx.fillText(prioridad, x + barWidth / 2, padding + chartHeight + 25 * scale);
        
        x += barWidth + barSpacing;
    });
}

function renderResumenChartEstadoPRD(bugs) {
    const canvas = document.getElementById('resumenChartEstadoPRD');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: false });
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Limpiar
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Agrupar por estado
    const data = {
        'Tareas por hacer': bugs.filter(b => b.estado === 'Tareas por hacer').length,
        'En curso': bugs.filter(b => b.estado === 'En curso').length,
        'Finalizada': bugs.filter(b => b.estado === 'Finalizada').length
    };
    
    const estados = Object.keys(data);
    const valores = Object.values(data);
    const total = valores.reduce((a, b) => a + b, 0);
    
    if (total === 0) return;
    
    const scale = canvas.width / 600;
    const leftPadding = 160 * scale;
    const rightPadding = 20 * scale;
    const barHeight = 50 * scale;
    const barSpacing = 30 * scale;
    const maxBarWidth = canvas.width - leftPadding - rightPadding;
    
    const colors = {
        'Tareas por hacer': '#dc3545',
        'En curso': '#ffc107',
        'Finalizada': '#28a745'
    };
    
    // Título con total
    ctx.fillStyle = '#1e3c72';
    ctx.font = `bold ${20 * scale}px Segoe UI`;
    ctx.textAlign = 'center';
    ctx.fillText(`Total: ${total} bugs`, canvas.width / 2, 30 * scale);
    
    let yPosition = 60 * scale;
    
    estados.forEach((estado, i) => {
        const valor = valores[i];
        const percentage = ((valor / total) * 100).toFixed(1);
        const barWidth = (valor / total) * maxBarWidth;
        const baseColor = colors[estado];
        
        // Etiqueta del estado
        ctx.fillStyle = '#1a1a2e';
        ctx.font = `bold ${15 * scale}px Segoe UI`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(estado + ':', leftPadding - 12 * scale, yPosition + barHeight / 2);
        
        // Sombra de la barra
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        ctx.shadowBlur = 8 * scale;
        ctx.shadowOffsetY = 3 * scale;
        
        // Gradiente
        const gradient = ctx.createLinearGradient(leftPadding, 0, leftPadding + maxBarWidth, 0);
        gradient.addColorStop(0, adjustColorBrightness(baseColor, 20));
        gradient.addColorStop(0.5, baseColor);
        gradient.addColorStop(1, adjustColorBrightness(baseColor, -10));
        
        // Fondo de la barra
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(leftPadding, yPosition, maxBarWidth, barHeight);
        
        // Barra de valor
        ctx.fillStyle = gradient;
        ctx.fillRect(leftPadding, yPosition, barWidth, barHeight);
        
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        
        // Borde
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 2 * scale;
        ctx.strokeRect(leftPadding, yPosition, maxBarWidth, barHeight);
        
        // Highlight
        const highlightGradient = ctx.createLinearGradient(0, yPosition, 0, yPosition + barHeight / 3);
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = highlightGradient;
        ctx.fillRect(leftPadding, yPosition, barWidth, barHeight / 3);
        
        // Valor y porcentaje
        const labelText = `${valor} (${percentage}%)`;
        ctx.font = `bold ${15 * scale}px Segoe UI`;
        const textWidth = ctx.measureText(labelText).width;
        
        if (barWidth > textWidth + 20 * scale) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 3 * scale;
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'left';
            ctx.fillText(labelText, leftPadding + 12 * scale, yPosition + barHeight / 2);
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
        } else {
            ctx.fillStyle = adjustColorBrightness(baseColor, -30);
            ctx.textAlign = 'left';
            ctx.fillText(labelText, leftPadding + barWidth + 10 * scale, yPosition + barHeight / 2);
        }
        
        yPosition += barHeight + barSpacing;
    });
}

// ==================== TABLA BUGS PRD ====================

function populateFiltersPRD() {
    // Poblar filtro de asignados
    const asignados = [...new Set(allBugsPRD.map(b => b.asignado).filter(a => a))].sort();
    const selectAsignado = document.getElementById('filter-asignado-prd');
    asignados.forEach(asignado => {
        const option = document.createElement('option');
        option.value = asignado;
        option.textContent = asignado;
        selectAsignado.appendChild(option);
    });
    
    // Poblar filtro de informadores
    const informadores = [...new Set(allBugsPRD.map(b => b.informador).filter(i => i))].sort();
    const selectInformador = document.getElementById('filter-informador-prd');
    informadores.forEach(informador => {
        const option = document.createElement('option');
        option.value = informador;
        option.textContent = informador;
        selectInformador.appendChild(option);
    });
    
    // Poblar filtro de meses
    const meses = [...new Set(allBugsPRD.map(b => b.mes))].sort().reverse();
    const selectMes = document.getElementById('filter-mes-prd');
    meses.forEach(mes => {
        const option = document.createElement('option');
        option.value = mes;
        option.textContent = mes;
        selectMes.appendChild(option);
    });
}

function renderBugsPRD() {
    const tbody = document.getElementById('bugs-prd-tbody');
    tbody.innerHTML = '';
    
    allBugsPRD.forEach((bug, index) => {
        const tr = document.createElement('tr');
        tr.id = `bug-prd-${index}`;
        
        tr.innerHTML = `
            <td>${bug.clave}</td>
            <td contenteditable="true" onblur="actualizarBugPRD(${index}, 'resumen', this.textContent)">${bug.resumen}</td>
            <td contenteditable="true" onblur="actualizarBugPRD(${index}, 'asignado', this.textContent)">${bug.asignado}</td>
            <td contenteditable="true" onblur="actualizarBugPRD(${index}, 'informador', this.textContent)">${bug.informador}</td>
            <td>
                <select onchange="cambiarPrioridadPRD(${index}, this.value)" style="width:100%; padding:5px;">
                    <option value="Highest" ${bug.prioridad === 'Highest' ? 'selected' : ''}>Highest</option>
                    <option value="High" ${bug.prioridad === 'High' ? 'selected' : ''}>High</option>
                    <option value="Medium" ${bug.prioridad === 'Medium' ? 'selected' : ''}>Medium</option>
                    <option value="Low" ${bug.prioridad === 'Low' ? 'selected' : ''}>Low</option>
                </select>
            </td>
            <td>
                <select onchange="cambiarEstadoPRD(${index}, this.value)" style="width:100%; padding:5px;">
                    <option value="Tareas por hacer" ${bug.estado === 'Tareas por hacer' ? 'selected' : ''}>Tareas por hacer</option>
                    <option value="En curso" ${bug.estado === 'En curso' ? 'selected' : ''}>En curso</option>
                    <option value="Finalizada" ${bug.estado === 'Finalizada' ? 'selected' : ''}>Finalizada</option>
                </select>
            </td>
            <td contenteditable="true" onblur="actualizarBugPRD(${index}, 'resolucion', this.textContent)">${bug.resolucion}</td>
            <td>${bug.creada}</td>
            <td>${bug.actualizada}</td>
            <td>${bug.mes}</td>
            <td>
                <button class="btn btn-primary" style="padding:5px 10px; font-size:12px;" onclick="eliminarBugPRD(${index})">🗑️</button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

function filterBugsPRD() {
    const mes = document.getElementById('month-selector-bugs-prd').value;
    
    const rows = document.querySelectorAll('#bugs-prd-tbody tr');
    rows.forEach((row, index) => {
        const bug = allBugsPRD[index];
        if (mes === 'all' || bug.mes === mes) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function filterBugsAvanzadoPRD() {
    const filters = {
        clave: document.getElementById('filter-clave-prd').value.toLowerCase(),
        resumen: document.getElementById('filter-resumen-prd').value.toLowerCase(),
        asignado: document.getElementById('filter-asignado-prd').value,
        informador: document.getElementById('filter-informador-prd').value,
        prioridad: document.getElementById('filter-prioridad-prd').value,
        estado: document.getElementById('filter-estado-prd').value,
        resolucion: document.getElementById('filter-resolucion-prd').value.toLowerCase(),
        creada: document.getElementById('filter-creada-prd').value.toLowerCase(),
        actualizada: document.getElementById('filter-actualizada-prd').value.toLowerCase(),
        mes: document.getElementById('filter-mes-prd').value
    };
    
    const rows = document.querySelectorAll('#bugs-prd-tbody tr');
    rows.forEach((row, index) => {
        const bug = allBugsPRD[index];
        let mostrar = true;
        
        if (filters.clave && !bug.clave.toLowerCase().includes(filters.clave)) mostrar = false;
        if (filters.resumen && !bug.resumen.toLowerCase().includes(filters.resumen)) mostrar = false;
        if (filters.asignado && bug.asignado !== filters.asignado) mostrar = false;
        if (filters.informador && bug.informador !== filters.informador) mostrar = false;
        if (filters.prioridad && bug.prioridad !== filters.prioridad) mostrar = false;
        if (filters.estado && bug.estado !== filters.estado) mostrar = false;
        if (filters.resolucion && !bug.resolucion.toLowerCase().includes(filters.resolucion)) mostrar = false;
        if (filters.creada && !bug.creada.toLowerCase().includes(filters.creada)) mostrar = false;
        if (filters.actualizada && !bug.actualizada.toLowerCase().includes(filters.actualizada)) mostrar = false;
        if (filters.mes && bug.mes !== filters.mes) mostrar = false;
        
        row.style.display = mostrar ? '' : 'none';
    });
}

function actualizarBugPRD(index, campo, valor) {
    allBugsPRD[index][campo] = valor;
}

function cambiarPrioridadPRD(index, nuevaPrioridad) {
    allBugsPRD[index].prioridad = nuevaPrioridad;
    updateDashboardPRD();
    updateResumenPRD();
}

function cambiarEstadoPRD(index, nuevoEstado) {
    allBugsPRD[index].estado = nuevoEstado;
    
    // Si se marca como finalizada, actualizar fecha
    if (nuevoEstado === 'Finalizada' && !allBugsPRD[index].resolucion) {
        allBugsPRD[index].resolucion = 'Hecho';
        allBugsPRD[index].actualizada = new Date().toLocaleDateString('es-ES');
        renderBugsPRD();
        filterBugsAvanzadoPRD();
    }
    
    updateDashboardPRD();
    updateResumenPRD();
}

function eliminarBugPRD(index) {
    if (confirm('¿Estás seguro de eliminar este bug?')) {
        allBugsPRD.splice(index, 1);
        renderBugsPRD();
        updateDashboardPRD();
        updateResumenPRD();
        renderEvolucionPRD();
    }
}

function exportarTablaExcelPRD() {
    let csv = 'Clave,Resumen,Asignado,Informador,Prioridad,Estado,Resolución,Creada,Actualizada,Mes\n';
    
    allBugsPRD.forEach(bug => {
        csv += `"${bug.clave}","${bug.resumen}","${bug.asignado}","${bug.informador}","${bug.prioridad}","${bug.estado}","${bug.resolucion}","${bug.creada}","${bug.actualizada}","${bug.mes}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'bugs_produccion_' + new Date().toISOString().split('T')[0] + '.csv';
    link.click();
}
