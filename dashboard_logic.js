// dashboard_logic.js - Lógica completa del dashboard dinámico

// Variables globales
let allTickets = [];
let currentSprint = '32';

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

function initializeDashboard() {
    // Cargar datos de tickets
    allTickets = [...ticketsData];
    
    // Actualizar información general
    document.getElementById('last-update').textContent = new Date().toLocaleString('es-ES');
    document.getElementById('total-tickets').textContent = allTickets.length;
    
    // Actualizar footer
    updateFooterStats();
    
    // Renderizar todas las secciones
    updateDashboard();
    renderEvolucion();
    updateResumen();
    renderIncidentes();
}

// ==================== FUNCIONES DEL DASHBOARD ====================

function updateDashboard() {
    const sprint = document.getElementById('sprint-selector-dashboard').value;
    const tickets = sprint === 'all' ? allTickets : allTickets.filter(t => t.sprint == sprint);
    
    const kpis = calcularKPIs(tickets);
    renderDashboardKPIs(kpis, tickets);
}

function calcularKPIs(tickets) {
    const total = tickets.length;
    
    // Contar por estado
    const finalizados = tickets.filter(t => t.estadoNormalizado === 'Finalizados').length;
    const enCurso = tickets.filter(t => t.estadoNormalizado === 'En curso').length;
    const pendientes = tickets.filter(t => t.estadoNormalizado === 'Tareas por hacer').length;
    
    // Porcentajes
    const pctFinalizados = total > 0 ? ((finalizados / total) * 100).toFixed(1) : 0;
    const pctEnCurso = total > 0 ? ((enCurso / total) * 100).toFixed(1) : 0;
    
    // Highest abiertos (no finalizados)
    const highestAbiertos = tickets.filter(t => 
        t.prioridad === 'Highest' && t.estadoNormalizado !== 'Finalizados'
    ).length;
    
    // Backlog
    const backlog = pendientes;
    
    // Tiempos promedio por prioridad
    const tiempoHighest = calcularTiempoPromedio(tickets, 'Highest');
    const tiempoHigh = calcularTiempoPromedio(tickets, 'High');
    const tiempoMedium = calcularTiempoPromedio(tickets, 'Medium');
    const tiempoLow = calcularTiempoPromedio(tickets, 'Low');
    
    // Tasa de reapertura (simplificado: 0 por ahora)
    const tasaReapertura = 0;
    
    // Cobertura de resolución
    const coberturaResolucion = pctFinalizados;
    
    return {
        total,
        finalizados,
        enCurso,
        pendientes,
        pctFinalizados,
        pctEnCurso,
        highestAbiertos,
        backlog,
        tiempoHighest,
        tiempoHigh,
        tiempoMedium,
        tiempoLow,
        tasaReapertura,
        coberturaResolucion
    };
}

function calcularTiempoPromedio(tickets, prioridad) {
    const ticketsPrioridad = tickets.filter(t => 
        t.prioridad === prioridad && 
        t.estadoNormalizado === 'Finalizados' &&
        t.resuelta && t.resuelta !== ''
    );
    
    if (ticketsPrioridad.length === 0) return 0;
    
    const diasArray = ticketsPrioridad.map(t => {
        const dias = calcularDiasResolucion(t.creada, t.resuelta);
        return dias !== '-' ? dias : 0;
    }).filter(d => d > 0);
    
    if (diasArray.length === 0) return 0;
    
    const suma = diasArray.reduce((acc, d) => acc + d, 0);
    return (suma / diasArray.length).toFixed(1);
}

function renderDashboardKPIs(kpis, tickets) {
    const container = document.getElementById('dashboard-kpis');
    
    const html = `
        <div class="kpi-grid">
            <div class="kpi-card">
                <div class="label">Total Incidentes</div>
                <div class="value">${kpis.total}</div>
            </div>
            <div class="kpi-card">
                <div class="label">% Finalizados</div>
                <div class="value">${kpis.pctFinalizados}%</div>
                <div class="status ${getStatusClass(kpis.pctFinalizados, 80, true)}">${getStatusText(kpis.pctFinalizados, 80, true)}</div>
            </div>
            <div class="kpi-card">
                <div class="label">% En Curso</div>
                <div class="value">${kpis.pctEnCurso}%</div>
                <div class="status ${getStatusClass(kpis.pctEnCurso, 20, false)}">${getStatusText(kpis.pctEnCurso, 20, false)}</div>
            </div>
            <div class="kpi-card">
                <div class="label">Highest Abiertos</div>
                <div class="value">${kpis.highestAbiertos}</div>
                <div class="status ${kpis.highestAbiertos === 0 ? 'status-cumple' : 'status-revisar'}">${kpis.highestAbiertos === 0 ? '✓ Cumple' : '⚠ Revisar'}</div>
            </div>
            <div class="kpi-card">
                <div class="label">Backlog</div>
                <div class="value">${kpis.backlog}</div>
                <div class="status ${kpis.backlog < 5 ? 'status-cumple' : kpis.backlog < 50 ? 'status-revisar' : 'status-critico'}">${kpis.backlog < 5 ? '✓ Cumple' : kpis.backlog < 50 ? '⚠ Revisar' : '⚠ CRÍTICO'}</div>
            </div>
            <div class="kpi-card">
                <div class="label">Tiempo Highest</div>
                <div class="value">${kpis.tiempoHighest} días</div>
                <div class="status ${getStatusClass(kpis.tiempoHighest, 2, false)}">${getStatusText(kpis.tiempoHighest, 2, false)}</div>
            </div>
            <div class="kpi-card">
                <div class="label">Tiempo High</div>
                <div class="value">${kpis.tiempoHigh} días</div>
                <div class="status ${getStatusClass(kpis.tiempoHigh, 5, false)}">${getStatusText(kpis.tiempoHigh, 5, false)}</div>
            </div>
            <div class="kpi-card">
                <div class="label">Tiempo Medium</div>
                <div class="value">${kpis.tiempoMedium} días</div>
                <div class="status ${getStatusClass(kpis.tiempoMedium, 15, false)}">${getStatusText(kpis.tiempoMedium, 15, false)}</div>
            </div>
            <div class="kpi-card">
                <div class="label">Tasa Reapertura</div>
                <div class="value">${kpis.tasaReapertura}%</div>
                <div class="status status-cumple">✓ Cumple</div>
            </div>
        </div>
        
        <h3>Distribución por Prioridad</h3>
        <table>
            <thead>
                <tr>
                    <th>Prioridad</th>
                    <th>Total</th>
                    <th>Finalizados</th>
                    <th>En Curso</th>
                    <th>Pendientes</th>
                    <th>% Completado</th>
                </tr>
            </thead>
            <tbody>
                ${['Highest', 'High', 'Medium', 'Low', 'Lowest'].map(p => {
                    const ticketsPrio = tickets.filter(t => t.prioridad === p);
                    const total = ticketsPrio.length;
                    const fin = ticketsPrio.filter(t => t.estadoNormalizado === 'Finalizados').length;
                    const curso = ticketsPrio.filter(t => t.estadoNormalizado === 'En curso').length;
                    const pend = ticketsPrio.filter(t => t.estadoNormalizado === 'Tareas por hacer').length;
                    const pct = total > 0 ? ((fin / total) * 100).toFixed(1) : 0;
                    const sprintActual = document.getElementById('sprint-selector-dashboard').value;
                    return `<tr>
                        <td><strong>${p}</strong></td>
                        <td><a href="#" class="clickable-number" onclick="showTicketDetailsByPriority('${p}', 'all', '${sprintActual}'); return false;">${total}</a></td>
                        <td><a href="#" class="clickable-number" onclick="showTicketDetailsByPriority('${p}', 'Finalizados', '${sprintActual}'); return false;">${fin}</a></td>
                        <td><a href="#" class="clickable-number" onclick="showTicketDetailsByPriority('${p}', 'En curso', '${sprintActual}'); return false;">${curso}</a></td>
                        <td><a href="#" class="clickable-number" onclick="showTicketDetailsByPriority('${p}', 'Tareas por hacer', '${sprintActual}'); return false;">${pend}</a></td>
                        <td>${pct}%</td>
                    </tr>`;
                }).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

function getStatusClass(value, meta, higher) {
    if (higher) {
        return value >= meta ? 'status-cumple' : 'status-revisar';
    } else {
        return value <= meta ? 'status-cumple' : 'status-revisar';
    }
}

function getStatusText(value, meta, higher) {
    if (higher) {
        return value >= meta ? '✓ Cumple' : '⚠ Revisar';
    } else {
        return value <= meta ? '✓ Cumple' : '⚠ Revisar';
    }
}

function recalcularKPIs() {
    updateDashboard();
    updateResumen();
    renderEvolucion();
    alert('✅ KPIs recalculados correctamente');
}

// ==================== FUNCIONES DE EVOLUCIÓN ====================

function renderEvolucion() {
    const tbody = document.getElementById('evolucion-tbody');
    
    // Agrupar por sprint
    const sprints = {};
    allTickets.forEach(t => {
        const s = t.sprint;
        if (!sprints[s]) sprints[s] = [];
        sprints[s].push(t);
    });
    
    // Ordenar sprints
    const sprintNumbers = Object.keys(sprints).map(Number).sort((a, b) => a - b);
    
    let totalAcumulado = 0;
    const rows = [];
    
    sprintNumbers.forEach(s => {
        const tickets = sprints[s];
        const nuevos = tickets.length;
        const resueltos = tickets.filter(t => t.estadoNormalizado === 'Finalizados').length;
        const pendientes = nuevos - resueltos;
        totalAcumulado += nuevos;
        const pctResolucion = nuevos > 0 ? ((resueltos / nuevos) * 100).toFixed(1) : 0;
        
        rows.push({
            sprint: s,
            nuevos,
            resueltos,
            pendientes,
            totalAcumulado,
            pctResolucion
        });
    });
    
    // Agregar sprints futuros si no existen
    const maxSprint = Math.max(...sprintNumbers);
    for (let s = maxSprint + 1; s <= 35; s++) {
        rows.push({
            sprint: s,
            nuevos: 0,
            resueltos: 0,
            pendientes: 0,
            totalAcumulado,
            pctResolucion: 0
        });
    }
    
    tbody.innerHTML = rows.map(r => `
        <tr ${r.sprint == 32 ? 'style="background-color: #e3f2fd; font-weight: 600;"' : ''}>
            <td><strong>Sprint ${r.sprint}${r.sprint == 32 ? ' (Actual)' : ''}</strong></td>
            <td><a href="#" class="clickable-number" onclick="showTicketDetails(${r.sprint}, 'nuevos'); return false;">${r.nuevos}</a></td>
            <td><a href="#" class="clickable-number" onclick="showTicketDetails(${r.sprint}, 'resueltos'); return false;">${r.resueltos}</a></td>
            <td><a href="#" class="clickable-number" onclick="showTicketDetails(${r.sprint}, 'pendientes'); return false;">${r.pendientes}</a></td>
            <td>${r.totalAcumulado}</td>
            <td>${r.pctResolucion}%</td>
        </tr>
    `).join('');
    
    // Renderizar gráfico mejorado
    renderEvolutionChartProfessional(rows);
}

function renderEvolutionChartProfessional(data) {
    const canvas = document.getElementById('evolutionChart');
    const ctx = canvas.getContext('2d', { alpha: false });
    
    // Habilitar suavizado
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Limpiar canvas con fondo blanco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Configuración con márgenes escalados
    const scale = canvas.width / 900; // Factor de escala basado en tamaño original
    const padding = { 
        left: 70 * scale, 
        right: 50 * scale, 
        top: 70 * scale, 
        bottom: 70 * scale 
    };
    const width = canvas.width - padding.left - padding.right;
    const height = canvas.height - padding.top - padding.bottom;
    
    // Filtrar datos relevantes (sprints con actividad)
    const relevantData = data.filter(d => d.sprint <= 35);
    
    // Escala
    const maxTotal = Math.max(...relevantData.map(d => d.totalAcumulado), 10);
    const maxNuevos = Math.max(...relevantData.map(d => d.nuevos), 10);
    const scaleY = height / Math.max(maxTotal, maxNuevos);
    const scaleX = width / (relevantData.length - 1);
    
    // Área de fondo del gráfico con gradiente suave
    const bgGradient = ctx.createLinearGradient(padding.left, padding.top, padding.left, padding.top + height);
    bgGradient.addColorStop(0, '#f8f9fa');
    bgGradient.addColorStop(1, '#ffffff');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(padding.left, padding.top, width, height);
    
    // Borde del área de gráfico
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.2)';
    ctx.lineWidth = 2 * scale;
    ctx.strokeRect(padding.left, padding.top, width, height);
    
    // Grid lines con mejor estilo
    ctx.strokeStyle = '#e8e8e8';
    ctx.lineWidth = 1 * scale;
    for (let i = 0; i <= 5; i++) {
        const y = padding.top + (height / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + width, y);
        ctx.stroke();
        
        // Etiquetas del eje Y con mejor tipografía
        const value = Math.round((maxTotal / 5) * (5 - i));
        ctx.fillStyle = '#666';
        ctx.font = `${13 * scale}px Segoe UI`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(value, padding.left - 12 * scale, y);
    }
    
    // Ejes principales con mejor grosor
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2.5 * scale;
    
    // Eje Y
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + height);
    ctx.stroke();
    
    // Eje X
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + height);
    ctx.lineTo(padding.left + width, padding.top + height);
    ctx.stroke();
    
    // Área de relleno bajo la línea de Total Acumulado (efecto visual)
    ctx.globalAlpha = 0.08;
    const areaGradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + height);
    areaGradient.addColorStop(0, '#1e3c72');
    areaGradient.addColorStop(1, 'rgba(30, 60, 114, 0)');
    ctx.fillStyle = areaGradient;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + height);
    relevantData.forEach((d, i) => {
        const x = padding.left + i * scaleX;
        const y = padding.top + height - (d.totalAcumulado * scaleY);
        ctx.lineTo(x, y);
    });
    ctx.lineTo(padding.left + width, padding.top + height);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1.0;
    
    // Línea de Total Acumulado con sombra
    ctx.shadowColor = 'rgba(30, 60, 114, 0.3)';
    ctx.shadowBlur = 8 * scale;
    ctx.shadowOffsetY = 2 * scale;
    ctx.strokeStyle = '#1e3c72';
    ctx.lineWidth = 4 * scale;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    
    relevantData.forEach((d, i) => {
        const x = padding.left + i * scaleX;
        const y = padding.top + height - (d.totalAcumulado * scaleY);
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    
    // Línea de Nuevos con efecto
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3 * scale;
    ctx.setLineDash([8 * scale, 5 * scale]);
    ctx.beginPath();
    
    relevantData.forEach((d, i) => {
        const x = padding.left + i * scaleX;
        const y = padding.top + height - (d.nuevos * scaleY);
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Línea de Resueltos
    ctx.strokeStyle = '#28a745';
    ctx.lineWidth = 3 * scale;
    ctx.setLineDash([4 * scale, 4 * scale]);
    ctx.beginPath();
    
    relevantData.forEach((d, i) => {
        const x = padding.left + i * scaleX;
        const y = padding.top + height - (d.resueltos * scaleY);
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Puntos y etiquetas con mejor diseño
    relevantData.forEach((d, i) => {
        const x = padding.left + i * scaleX;
        const yTotal = padding.top + height - (d.totalAcumulado * scaleY);
        
        // Punto de total acumulado con anillo
        const isCurrentSprint = d.sprint == 32;
        const pointRadius = isCurrentSprint ? 8 * scale : 5 * scale;
        
        // Anillo exterior
        if (isCurrentSprint) {
            ctx.fillStyle = 'rgba(220, 53, 69, 0.2)';
            ctx.beginPath();
            ctx.arc(x, yTotal, pointRadius + 4 * scale, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Punto principal
        ctx.fillStyle = isCurrentSprint ? '#dc3545' : '#1e3c72';
        ctx.beginPath();
        ctx.arc(x, yTotal, pointRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Borde blanco
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2 * scale;
        ctx.stroke();
        
        // Etiqueta del sprint en eje X
        ctx.fillStyle = isCurrentSprint ? '#dc3545' : '#555';
        ctx.font = isCurrentSprint ? `bold ${14 * scale}px Segoe UI` : `${12 * scale}px Segoe UI`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(`S${d.sprint}`, x, padding.top + height + 15 * scale);
        
        // Valor del total acumulado sobre puntos clave
        if (d.totalAcumulado > 0 && (i % 2 === 0 || isCurrentSprint)) {
            ctx.fillStyle = '#333';
            ctx.font = `bold ${11 * scale}px Segoe UI`;
            ctx.textBaseline = 'bottom';
            ctx.fillText(d.totalAcumulado, x, yTotal - 12 * scale);
        }
    });
    
    // Leyenda mejorada con iconos
    const legendY = padding.top - 35 * scale;
    const legendX = padding.left + 50 * scale;
    
    // Total Acumulado
    ctx.strokeStyle = '#1e3c72';
    ctx.lineWidth = 4 * scale;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(legendX, legendY);
    ctx.lineTo(legendX + 40 * scale, legendY);
    ctx.stroke();
    ctx.fillStyle = '#333';
    ctx.font = `${13 * scale}px Segoe UI`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Total Acumulado', legendX + 50 * scale, legendY);
    
    // Nuevos
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3 * scale;
    ctx.setLineDash([8 * scale, 5 * scale]);
    ctx.beginPath();
    ctx.moveTo(legendX + 200 * scale, legendY);
    ctx.lineTo(legendX + 240 * scale, legendY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillText('Nuevos', legendX + 250 * scale, legendY);
    
    // Resueltos
    ctx.strokeStyle = '#28a745';
    ctx.lineWidth = 3 * scale;
    ctx.setLineDash([4 * scale, 4 * scale]);
    ctx.beginPath();
    ctx.moveTo(legendX + 360 * scale, legendY);
    ctx.lineTo(legendX + 400 * scale, legendY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillText('Resueltos', legendX + 410 * scale, legendY);
    
    // Título del eje Y
    ctx.save();
    ctx.translate(20 * scale, padding.top + height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#555';
    ctx.font = `bold ${14 * scale}px Segoe UI`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('Cantidad de Incidentes', 0, 0);
    ctx.restore();
}

// ==================== FUNCIONES DE RESUMEN ====================

function updateResumen() {
    const sprint = document.getElementById('sprint-selector-resumen').value;
    const tickets = sprint === 'all' ? allTickets : allTickets.filter(t => t.sprint == sprint);
    
    const matriz = {};
    const prioridades = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];
    const estados = ['Tareas por hacer', 'En curso', 'Finalizados'];
    
    // Inicializar matriz
    prioridades.forEach(p => {
        matriz[p] = {};
        estados.forEach(e => {
            matriz[p][e] = 0;
        });
    });
    
    // Contar tickets
    tickets.forEach(t => {
        if (matriz[t.prioridad] && estados.includes(t.estadoNormalizado)) {
            matriz[t.prioridad][t.estadoNormalizado]++;
        }
    });
    
    // Calcular totales
    const totalesPrioridad = {};
    prioridades.forEach(p => {
        totalesPrioridad[p] = estados.reduce((sum, e) => sum + matriz[p][e], 0);
    });
    
    const totalesEstado = {};
    estados.forEach(e => {
        totalesEstado[e] = prioridades.reduce((sum, p) => sum + matriz[p][e], 0);
    });
    
    const totalGeneral = tickets.length;
    
    // Renderizar tabla
    const html = `
        <h3>Distribución por Estado y Prioridad</h3>
        <table>
            <thead>
                <tr>
                    <th>Estado / Prioridad</th>
                    ${prioridades.map(p => `<th>${p}</th>`).join('')}
                    <th>TOTAL</th>
                </tr>
            </thead>
            <tbody>
                ${estados.map(e => `
                    <tr>
                        <td><strong>${e}</strong></td>
                        ${prioridades.map(p => `<td>${matriz[p][e]}</td>`).join('')}
                        <td><strong>${totalesEstado[e]}</strong></td>
                    </tr>
                `).join('')}
                <tr style="background-color: #f0f0f0; font-weight: bold;">
                    <td><strong>TOTAL</strong></td>
                    ${prioridades.map(p => `<td><strong>${totalesPrioridad[p]}</strong></td>`).join('')}
                    <td><strong>${totalGeneral}</strong></td>
                </tr>
            </tbody>
        </table>
    `;
    
    document.getElementById('resumen-content').innerHTML = html;
    
    // Renderizar ambos gráficos
    renderResumenChartPrioridad(totalesPrioridad);
    renderResumenChartEstado(totalesEstado);
}

function renderResumenChartPrioridad(data) {
    const canvas = document.getElementById('resumenChartPrioridad');
    const ctx = canvas.getContext('2d', { alpha: false });
    
    // Habilitar suavizado
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Fondo blanco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const prioridades = Object.keys(data);
    const valores = Object.values(data);
    const maxValor = Math.max(...valores, 1);
    
    const scale = canvas.width / 450;
    const padding = { 
        left: 70 * scale, 
        right: 40 * scale, 
        top: 50 * scale, 
        bottom: 80 * scale 
    };
    const width = canvas.width - padding.left - padding.right;
    const height = canvas.height - padding.top - padding.bottom;
    
    const barWidth = width / (prioridades.length * 1.8);
    const spacing = barWidth * 0.8;
    
    // Colores profesionales
    const colors = {
        'Highest': '#dc3545',
        'High': '#fd7e14',
        'Medium': '#ffc107',
        'Low': '#28a745',
        'Lowest': '#17a2b8'
    };
    
    // Área de fondo con gradiente
    const bgGradient = ctx.createLinearGradient(padding.left, padding.top, padding.left, padding.top + height);
    bgGradient.addColorStop(0, '#f8f9fa');
    bgGradient.addColorStop(1, '#ffffff');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(padding.left, padding.top, width, height);
    
    // Borde del área
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.2)';
    ctx.lineWidth = 2 * scale;
    ctx.strokeRect(padding.left, padding.top, width, height);
    
    // Grid horizontal mejorado
    ctx.strokeStyle = '#e8e8e8';
    ctx.lineWidth = 1 * scale;
    for (let i = 0; i <= 5; i++) {
        const y = padding.top + (height / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + width, y);
        ctx.stroke();
        
        // Etiquetas
        const value = Math.round((maxValor / 5) * (5 - i));
        ctx.fillStyle = '#666';
        ctx.font = `${12 * scale}px Segoe UI`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(value, padding.left - 12 * scale, y);
    }
    
    // Ejes principales
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2.5 * scale;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + height);
    ctx.lineTo(padding.left + width, padding.top + height);
    ctx.stroke();
    
    // Barras con efectos mejorados
    prioridades.forEach((p, i) => {
        const valor = valores[i];
        if (valor === 0) return;
        
        const barHeight = (valor / maxValor) * height;
        const x = padding.left + i * (barWidth + spacing) + spacing;
        const y = padding.top + height - barHeight;
        
        // Sombra de la barra
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        ctx.shadowBlur = 8 * scale;
        ctx.shadowOffsetY = 3 * scale;
        
        // Gradiente de la barra
        const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
        gradient.addColorStop(0, colors[p] || '#6c757d');
        gradient.addColorStop(0.5, colors[p] || '#6c757d');
        gradient.addColorStop(1, adjustColorBrightness(colors[p] || '#6c757d', -25));
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Reset sombra
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        
        // Borde de barra con brillo
        ctx.strokeStyle = adjustColorBrightness(colors[p] || '#6c757d', -40);
        ctx.lineWidth = 2 * scale;
        ctx.strokeRect(x, y, barWidth, barHeight);
        
        // Highlight en la parte superior
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(x, y, barWidth, Math.min(15 * scale, barHeight * 0.2));
        
        // Valor encima de la barra con fondo
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(x + barWidth/2 - 20 * scale, y - 30 * scale, 40 * scale, 22 * scale);
        
        ctx.fillStyle = '#333';
        ctx.font = `bold ${15 * scale}px Segoe UI`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(valor, x + barWidth / 2, y - 19 * scale);
        
        // Etiqueta debajo rotada
        ctx.fillStyle = colors[p] || '#333';
        ctx.font = `bold ${13 * scale}px Segoe UI`;
        ctx.save();
        ctx.translate(x + barWidth / 2, padding.top + height + 20 * scale);
        ctx.rotate(-Math.PI / 6);
        ctx.fillText(p, 0, 0);
        ctx.restore();
    });
    
    // Título del eje Y
    ctx.save();
    ctx.translate(18 * scale, padding.top + height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#555';
    ctx.font = `bold ${14 * scale}px Segoe UI`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('Cantidad de Incidentes', 0, 0);
    ctx.restore();
}

function renderResumenChartEstado(data) {
    const canvas = document.getElementById('resumenChartEstado');
    const ctx = canvas.getContext('2d', { alpha: false });
    
    // Habilitar suavizado
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Fondo blanco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const estados = Object.keys(data);
    const valores = Object.values(data);
    const total = valores.reduce((a, b) => a + b, 0);
    
    if (total === 0) return;
    
    const scale = canvas.width / 600;
    const leftPadding = 160 * scale; // Aumentado para textos largos
    const rightPadding = 20 * scale;
    const barHeight = 50 * scale;
    const barSpacing = 30 * scale;
    const maxBarWidth = canvas.width - leftPadding - rightPadding;
    
    // Colores profesionales para estados
    const colors = {
        'Tareas por hacer': '#dc3545',
        'En curso': '#ffc107',
        'Finalizados': '#28a745'
    };
    
    // Título con total
    ctx.fillStyle = '#1e3c72';
    ctx.font = `bold ${20 * scale}px Segoe UI`;
    ctx.textAlign = 'center';
    ctx.fillText(`Total: ${total} tickets`, canvas.width / 2, 30 * scale);
    
    let yPosition = 60 * scale;
    
    // Dibujar cada estado como barra horizontal
    estados.forEach((estado, i) => {
        const valor = valores[i];
        const percentage = ((valor / total) * 100).toFixed(1);
        const barWidth = (valor / total) * maxBarWidth;
        const baseColor = colors[estado] || '#6c757d';
        
        // Etiqueta del estado (izquierda) - Más resaltada
        ctx.fillStyle = '#1e3c72';
        ctx.font = `bold ${15 * scale}px Segoe UI`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(estado + ':', leftPadding - 12 * scale, yPosition + barHeight / 2);
        
        // Sombra de la barra
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        ctx.shadowBlur = 8 * scale;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 3 * scale;
        
        // Gradiente para la barra
        const gradient = ctx.createLinearGradient(leftPadding, 0, leftPadding + maxBarWidth, 0);
        gradient.addColorStop(0, adjustColorBrightness(baseColor, 20));
        gradient.addColorStop(0.5, baseColor);
        gradient.addColorStop(1, adjustColorBrightness(baseColor, -10));
        
        // Fondo de la barra (gris claro)
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(leftPadding, yPosition, maxBarWidth, barHeight);
        
        // Barra de valor con gradiente
        ctx.fillStyle = gradient;
        ctx.fillRect(leftPadding, yPosition, barWidth, barHeight);
        
        // Reset sombra
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        
        // Borde de la barra
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 2 * scale;
        ctx.strokeRect(leftPadding, yPosition, maxBarWidth, barHeight);
        
        // Highlight superior
        const highlightGradient = ctx.createLinearGradient(0, yPosition, 0, yPosition + barHeight / 3);
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = highlightGradient;
        ctx.fillRect(leftPadding, yPosition, barWidth, barHeight / 3);
        
        // Valor y porcentaje dentro de la barra (si cabe) o fuera
        const labelText = `${valor} (${percentage}%)`;
        ctx.font = `bold ${15 * scale}px Segoe UI`;
        const textWidth = ctx.measureText(labelText).width;
        
        if (barWidth > textWidth + 20 * scale) {
            // Texto dentro de la barra (blanco con sombra)
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 3 * scale;
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'left';
            ctx.fillText(labelText, leftPadding + 12 * scale, yPosition + barHeight / 2);
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
        } else {
            // Texto fuera de la barra (color del estado más oscuro)
            ctx.fillStyle = adjustColorBrightness(baseColor, -30);
            ctx.textAlign = 'left';
            ctx.fillText(labelText, leftPadding + barWidth + 10 * scale, yPosition + barHeight / 2);
        }
        
        yPosition += barHeight + barSpacing;
    });
}

// Función auxiliar para ajustar brillo de color
function adjustColorBrightness(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, (num >> 8 & 0x00FF) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

// ==================== FUNCIONES DE INCIDENTES ====================

// Función auxiliar para calcular días de resolución
function calcularDiasResolucion(fechaCreada, fechaResuelta) {
    if (!fechaResuelta || fechaResuelta === '') return '-';
    
    try {
        // Formato: "15/ene/26 5:11 PM"
        const meses = {'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5, 
                      'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11};
        
        const parseDate = (str) => {
            const parts = str.match(/(\d+)\/(\w+)\/(\d+)/);
            if (!parts) return null;
            const dia = parseInt(parts[1]);
            const mes = meses[parts[2].toLowerCase()];
            const año = 2000 + parseInt(parts[3]);
            return new Date(año, mes, dia);
        };
        
        const dateCreada = parseDate(fechaCreada);
        const dateResuelta = parseDate(fechaResuelta);
        
        if (!dateCreada || !dateResuelta) return '-';
        
        const diffTime = Math.abs(dateResuelta - dateCreada);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    } catch (e) {
        return '-';
    }
}

function renderIncidentes() {
    filterIncidentes();
    populateColumnFilters();
}

function populateColumnFilters() {
    // Poblar filtro de asignado
    const asignados = [...new Set(allTickets.map(t => t.asignado))].sort();
    const selectAsignado = document.getElementById('filter-asignado');
    const currentAsignado = selectAsignado.value;
    selectAsignado.innerHTML = '<option value="">Todos</option>' + 
        asignados.map(a => `<option value="${a}" ${a === currentAsignado ? 'selected' : ''}>${a}</option>`).join('');
    
    // Poblar filtro de sprint
    const sprints = [...new Set(allTickets.map(t => t.sprint))].sort((a, b) => a - b);
    const selectSprint = document.getElementById('filter-sprint-col');
    const currentSprint = selectSprint.value;
    selectSprint.innerHTML = '<option value="">Todos</option>' + 
        sprints.map(s => `<option value="${s}" ${s == currentSprint ? 'selected' : ''}>Sprint ${s}</option>`).join('');
}

function filterIncidentesAvanzado() {
    const filterClave = document.getElementById('filter-clave').value.toLowerCase();
    const filterResumen = document.getElementById('filter-resumen').value.toLowerCase();
    const filterAsignado = document.getElementById('filter-asignado').value;
    const filterPrioridad = document.getElementById('filter-prioridad-col').value;
    const filterEstado = document.getElementById('filter-estado-col').value;
    const filterSprint = document.getElementById('filter-sprint-col').value;
    const filterCreada = document.getElementById('filter-creada').value.toLowerCase();
    const filterResuelta = document.getElementById('filter-resuelta').value.toLowerCase();
    
    let filtered = allTickets.filter(t => {
        const matchClave = !filterClave || t.clave.toLowerCase().includes(filterClave);
        const matchResumen = !filterResumen || t.resumen.toLowerCase().includes(filterResumen);
        const matchAsignado = !filterAsignado || t.asignado === filterAsignado;
        const matchPrioridad = !filterPrioridad || t.prioridad === filterPrioridad;
        const matchEstado = !filterEstado || t.estadoNormalizado === filterEstado;
        const matchSprint = !filterSprint || t.sprint == filterSprint;
        const matchCreada = !filterCreada || t.creada.toLowerCase().includes(filterCreada);
        const matchResuelta = !filterResuelta || (t.resuelta && t.resuelta.toLowerCase().includes(filterResuelta));
        
        return matchClave && matchResumen && matchAsignado && matchPrioridad && 
               matchEstado && matchSprint && matchCreada && matchResuelta;
    });
    
    renderFilteredIncidentes(filtered);
}

function limpiarFiltros() {
    document.getElementById('filter-clave').value = '';
    document.getElementById('filter-resumen').value = '';
    document.getElementById('filter-asignado').value = '';
    document.getElementById('filter-prioridad-col').value = '';
    document.getElementById('filter-estado-col').value = '';
    document.getElementById('filter-sprint-col').value = '';
    document.getElementById('filter-creada').value = '';
    document.getElementById('filter-resuelta').value = '';
    filterIncidentesAvanzado();
}

function renderFilteredIncidentes(filtered) {
    document.getElementById('count-incidentes').textContent = filtered.length;
    
    const tbody = document.getElementById('incidentes-tbody');
    tbody.innerHTML = filtered.map((t, index) => {
        const diasCalc = calcularDiasResolucion(t.creada, t.resuelta);
        return `
        <tr data-index="${index}" data-clave="${t.clave}">
            <td contenteditable="true" data-field="clave">${t.clave}</td>
            <td contenteditable="true" data-field="resumen">${t.resumen}</td>
            <td contenteditable="true" data-field="asignado">${t.asignado}</td>
            <td contenteditable="true" data-field="prioridad">${t.prioridad}</td>
            <td data-field="estadoNormalizado">
                <select class="estado-select" onchange="cambiarEstado('${t.clave}', this.value)" style="width: 100%; padding: 5px; border: 1px solid #ddd; border-radius: 4px; background: white;">
                    <option value="Tareas por hacer" ${t.estadoNormalizado === 'Tareas por hacer' ? 'selected' : ''}>Tareas por hacer</option>
                    <option value="En curso" ${t.estadoNormalizado === 'En curso' ? 'selected' : ''}>En curso</option>
                    <option value="Finalizados" ${t.estadoNormalizado === 'Finalizados' ? 'selected' : ''}>Finalizados</option>
                </select>
            </td>
            <td contenteditable="true" data-field="sprint">${t.sprint}</td>
            <td>${t.creada}</td>
            <td>${t.resuelta}</td>
            <td>${diasCalc}</td>
            <td><button class="btn" style="padding: 5px 10px;" onclick="eliminarIncidente('${t.clave}')">🗑️</button></td>
        </tr>
    `;
    }).join('');
    
    // Agregar eventos de edición
    document.querySelectorAll('#incidentes-tbody td[contenteditable="true"]').forEach(cell => {
        cell.addEventListener('blur', function() {
            const row = this.closest('tr');
            const clave = row.querySelector('[data-field="clave"]').textContent;
            const field = this.getAttribute('data-field');
            const newValue = this.textContent;
            
            actualizarTicket(clave, field, newValue);
        });
    });
}

function filterIncidentes() {
    // Redirigir a la función de filtrado avanzado por columnas
    filterIncidentesAvanzado();
}

function cambiarEstado(clave, nuevoEstado) {
    const ticket = allTickets.find(t => t.clave === clave);
    if (ticket) {
        ticket.estadoNormalizado = nuevoEstado;
        ticket.estado = nuevoEstado;
        
        // Si cambió a Finalizados y no tiene fecha resuelta, agregarla
        if (nuevoEstado === 'Finalizados' && !ticket.resuelta) {
            const hoy = new Date();
            const mes = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'][hoy.getMonth()];
            ticket.resuelta = `${hoy.getDate()}/${mes}/${String(hoy.getFullYear()).slice(-2)} ${hoy.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit', hour12: true}).toUpperCase()}`;
            ticket.actualizada = ticket.resuelta;
        }
        
        console.log(`Estado actualizado: ${clave} -> ${nuevoEstado}`);
        
        // Actualizar vistas sin recargar tabla (para mantener el dropdown)
        const kpis = calcularKPIs(allTickets);
        renderDashboardKPIs(kpis);
    }
}

function actualizarTicket(clave, field, value) {
    const ticket = allTickets.find(t => t.clave === clave);
    if (ticket) {
        ticket[field] = value;
        console.log(`Actualizado: ${clave} - ${field} = ${value}`);
        // No recalcular automáticamente para evitar recargas constantes
    }
}

function agregarIncidente() {
    const nuevoTicket = {
        clave: document.getElementById('new-clave').value,
        resumen: document.getElementById('new-resumen').value,
        asignado: document.getElementById('new-asignado').value || 'Sin asignar',
        prioridad: document.getElementById('new-prioridad').value,
        estado: document.getElementById('new-estado').value,
        estadoNormalizado: document.getElementById('new-estado').value,
        creada: new Date().toLocaleDateString('es-ES'),
        actualizada: new Date().toLocaleDateString('es-ES'),
        resuelta: '',
        sprint: parseInt(document.getElementById('new-sprint').value),
        diasResolucion: ''
    };
    
    allTickets.push(nuevoTicket);
    
    // Limpiar formulario
    document.getElementById('new-clave').value = '';
    document.getElementById('new-resumen').value = '';
    document.getElementById('new-asignado').value = '';
    document.getElementById('add-row-form').style.display = 'none';
    
    // Actualizar vistas
    renderIncidentes();
    recalcularKPIs();
    
    alert('✅ Incidente agregado correctamente');
}

function eliminarIncidente(clave) {
    if (confirm(`¿Seguro que deseas eliminar el incidente ${clave}?`)) {
        allTickets = allTickets.filter(t => t.clave !== clave);
        renderIncidentes();
        recalcularKPIs();
        alert('✅ Incidente eliminado');
    }
}

function exportarCSV() {
    let csv = 'Clave,Resumen,Asignado,Prioridad,Estado,Sprint,Creada,Actualizada,Resuelta,Dias_Resolucion\\n';
    
    allTickets.forEach(t => {
        csv += `"${t.clave}","${t.resumen}","${t.asignado}","${t.prioridad}","${t.estadoNormalizado}",${t.sprint},"${t.creada}","${t.actualizada}","${t.resuelta}","${t.diasResolucion}"\\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incidentes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
}

// ==================== FUNCIONES DE NAVEGACIÓN ====================

// Nueva función para manejar la navegación con selectores
function showView(section, viewName) {
    // Ocultar todos los contenidos
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Activar el contenido seleccionado
    const targetView = document.getElementById(viewName);
    if (targetView) {
        targetView.classList.add('active');
    }
}

// Función legacy para compatibilidad (por si se necesita)
function showTab(tabName) {
    showView('legacy', tabName);
}

// ==================== ACTUALIZAR FOOTER ====================

function updateFooterStats() {
    const total = allTickets.length;
    const resueltos = allTickets.filter(t => t.estadoNormalizado === 'Finalizados').length;
    
    // Stats de bugs PRD (usar bugsPRD que es el nombre correcto del array)
    const totalBugs = typeof bugsPRD !== 'undefined' ? bugsPRD.length : 0;
    const resueltosBugs = typeof bugsPRD !== 'undefined' ? bugsPRD.filter(b => b.estado === 'Finalizada').length : 0;
    
    // Actualizar elementos del footer
    const footerTotal = document.getElementById('footer-total');
    const footerResolved = document.getElementById('footer-resolved');
    const footerBugsTotal = document.getElementById('footer-bugs-total');
    const footerBugsResolved = document.getElementById('footer-bugs-resolved');
    const headerTotal = document.getElementById('header-total-tickets');
    const headerBugsTotal = document.getElementById('header-total-bugs-prd');
    
    if (footerTotal) footerTotal.textContent = total;
    if (footerResolved) footerResolved.textContent = resueltos;
    if (footerBugsTotal) footerBugsTotal.textContent = totalBugs;
    if (footerBugsResolved) footerBugsResolved.textContent = resueltosBugs;
    if (headerTotal) headerTotal.textContent = total;
    if (headerBugsTotal) headerBugsTotal.textContent = totalBugs;
}

// ==================== MODAL DE DETALLES DE TICKETS ====================

function showTicketDetails(sprint, tipo) {
    // Filtrar tickets del sprint
    const ticketsSprint = allTickets.filter(t => t.sprint == sprint);
    
    let ticketsFiltrados = [];
    let titulo = '';
    
    switch(tipo) {
        case 'nuevos':
            ticketsFiltrados = ticketsSprint;
            titulo = `Incidentes Nuevos - Sprint ${sprint}`;
            break;
        case 'resueltos':
            ticketsFiltrados = ticketsSprint.filter(t => t.estadoNormalizado === 'Finalizados');
            titulo = `Incidentes Resueltos - Sprint ${sprint}`;
            break;
        case 'pendientes':
            ticketsFiltrados = ticketsSprint.filter(t => t.estadoNormalizado !== 'Finalizados');
            titulo = `Incidentes Pendientes - Sprint ${sprint}`;
            break;
    }
    
    // Crear modal si no existe
    let modal = document.getElementById('ticket-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'ticket-modal';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }
    
    // Contenido del modal
    const tablaHTML = ticketsFiltrados.length > 0 ? `
        <table class="modal-table">
            <thead>
                <tr>
                    <th>Clave</th>
                    <th>Resumen</th>
                    <th>Asignado</th>
                    <th>Prioridad</th>
                    <th>Estado</th>
                    <th>Creada</th>
                </tr>
            </thead>
            <tbody>
                ${ticketsFiltrados.map(t => `
                    <tr>
                        <td><strong>${t.clave}</strong></td>
                        <td>${t.resumen}</td>
                        <td>${t.asignado}</td>
                        <td><span class="priority-badge priority-${t.prioridad.toLowerCase()}">${t.prioridad}</span></td>
                        <td><span class="status-badge status-${t.estadoNormalizado.toLowerCase().replace(' ', '-')}">${t.estado}</span></td>
                        <td>${t.creada}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    ` : '<p class="no-data">No hay incidentes en esta categoría</p>';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${titulo}</h2>
                <button class="modal-close" onclick="closeTicketModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="modal-summary">
                    <span class="summary-label">Total de incidentes:</span>
                    <span class="summary-value">${ticketsFiltrados.length}</span>
                </div>
                ${tablaHTML}
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeTicketModal() {
    const modal = document.getElementById('ticket-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Cerrar modal al hacer clic fuera
document.addEventListener('click', function(e) {
    const modal = document.getElementById('ticket-modal');
    if (modal && e.target === modal) {
        closeTicketModal();
    }
});

// ==================== MODAL POR PRIORIDAD Y ESTADO ====================

function showTicketDetailsByPriority(prioridad, estado, sprint) {
    // Filtrar tickets
    let ticketsFiltrados = allTickets.filter(t => t.prioridad === prioridad);
    
    // Filtrar por sprint si no es "all"
    if (sprint !== 'all') {
        ticketsFiltrados = ticketsFiltrados.filter(t => t.sprint == sprint);
    }
    
    // Filtrar por estado si no es "all"
    let titulo = '';
    if (estado === 'all') {
        titulo = `Incidentes ${prioridad}${sprint !== 'all' ? ' - Sprint ' + sprint : ' - Todos los Sprints'}`;
    } else {
        ticketsFiltrados = ticketsFiltrados.filter(t => t.estadoNormalizado === estado);
        titulo = `Incidentes ${prioridad} - ${estado}${sprint !== 'all' ? ' - Sprint ' + sprint : ' - Todos los Sprints'}`;
    }
    
    // Crear modal si no existe
    let modal = document.getElementById('ticket-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'ticket-modal';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }
    
    // Contenido del modal
    const tablaHTML = ticketsFiltrados.length > 0 ? `
        <table class="modal-table">
            <thead>
                <tr>
                    <th>Clave</th>
                    <th>Resumen</th>
                    <th>Asignado</th>
                    <th>Sprint</th>
                    <th>Estado</th>
                    <th>Creada</th>
                </tr>
            </thead>
            <tbody>
                ${ticketsFiltrados.map(t => `
                    <tr>
                        <td><strong>${t.clave}</strong></td>
                        <td>${t.resumen}</td>
                        <td>${t.asignado}</td>
                        <td>Sprint ${t.sprint}</td>
                        <td><span class="status-badge status-${t.estadoNormalizado.toLowerCase().replace(' ', '-')}">${t.estado}</span></td>
                        <td>${t.creada}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    ` : '<p class="no-data">No hay incidentes en esta categoría</p>';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${titulo}</h2>
                <button class="modal-close" onclick="closeTicketModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="modal-summary">
                    <span class="summary-label">Total de incidentes:</span>
                    <span class="summary-value">${ticketsFiltrados.length}</span>
                </div>
                ${tablaHTML}
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}
