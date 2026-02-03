// dashboard_logic.js - Lógica completa del dashboard dinámico

// Variables globales
let allTickets = [];
let currentSprint = '34';

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
    
    // Poblar selector de meses
    populateMonthSelector();
    
    // Configurar filtros por defecto: Sprint 33 (Actual)
    const filterType = document.getElementById('filter-type-selector');
    const filterValue = document.getElementById('filter-value-selector');
    
    if (filterType && filterValue) {
        filterType.value = 'sprint';
        filterValue.value = '33';
    }
    
    // Actualizar footer
    updateFooterStats();
    
    // Renderizar todas las secciones
    updateDashboard();
    renderEvolucion();
    updateResumen();
    renderIncidentes();
}

// Cambiar tipo de filtro (Sprint o Mes)
function cambiarTipoFiltro() {
    const tipoFiltro = document.getElementById('filter-type-selector').value;
    const label = document.getElementById('filter-value-label');
    const selector = document.getElementById('filter-value-selector');
    
    selector.innerHTML = '';
    
    if (tipoFiltro === 'sprint') {
        label.textContent = 'Seleccionar Sprint:';
        selector.innerHTML = `
            <option value="all">Todos los Sprints</option>
            <option value="30">Sprint 30</option>
            <option value="31">Sprint 31</option>
            <option value="32" selected>Sprint 32 (Actual)</option>
            <option value="33">Sprint 33</option>
        `;
    } else if (tipoFiltro === 'mes') {
        label.textContent = 'Seleccionar Mes:';
        const option = document.createElement('option');
        option.value = 'all';
        option.textContent = 'Todos los Meses';
        selector.appendChild(option);
        
        // Poblar meses
        const meses = new Set();
        allTickets.forEach(ticket => {
            const fecha = parsearFecha(ticket.creada);
            if (fecha) {
                const mesCreada = fecha.toLocaleString('es-ES', {month: 'long', year: 'numeric'});
                meses.add(mesCreada);
            }
        });
        
        const mesesOrdenados = Array.from(meses).sort((a, b) => {
            const [mesA, añoA] = a.split(' de ');
            const [mesB, añoB] = b.split(' de ');
            const dateA = new Date(añoA + '-' + obtenerNumeroMes(mesA) + '-01');
            const dateB = new Date(añoB + '-' + obtenerNumeroMes(mesB) + '-01');
            return dateB - dateA;
        });
        
        mesesOrdenados.forEach(mes => {
            const opt = document.createElement('option');
            opt.value = mes;
            opt.textContent = mes.charAt(0).toUpperCase() + mes.slice(1);
            selector.appendChild(opt);
        });
    }
    
    updateDashboard();
}

// Poblar selector de meses
function populateMonthSelector() {
    const meses = new Set();
    
    allTickets.forEach(ticket => {
        const fecha = parsearFecha(ticket.creada);
        if (fecha) {
            const mesCreada = fecha.toLocaleString('es-ES', {month: 'long', year: 'numeric'});
            meses.add(mesCreada);
        }
    });
    
    const selectMes = document.getElementById('month-selector-dashboard');
    const mesesOrdenados = Array.from(meses).sort((a, b) => {
        const [mesA, añoA] = a.split(' de ');
        const [mesB, añoB] = b.split(' de ');
        const dateA = new Date(añoA + '-' + obtenerNumeroMes(mesA) + '-01');
        const dateB = new Date(añoB + '-' + obtenerNumeroMes(mesB) + '-01');
        return dateB - dateA;
    });
    
    mesesOrdenados.forEach(mes => {
        const option = document.createElement('option');
        option.value = mes;
        option.textContent = mes.charAt(0).toUpperCase() + mes.slice(1);
        selectMes.appendChild(option);
    });
}

function parsearFecha(fechaStr) {
    if (!fechaStr) return null;
    
    const mesesAbrev = {
        'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5,
        'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11
    };
    
    // Formato: "15/ene/26 5:11 PM" o "15/ene/26"
    const partes = fechaStr.split(' ')[0].split('/');
    if (partes.length !== 3) return null;
    
    const dia = parseInt(partes[0]);
    const mesStr = partes[1].toLowerCase();
    const año = parseInt('20' + partes[2]);
    
    const mes = mesesAbrev[mesStr];
    if (mes === undefined) return null;
    
    return new Date(año, mes, dia);
}

function obtenerNumeroMes(nombreMes) {
    const meses = {
        'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04',
        'mayo': '05', 'junio': '06', 'julio': '07', 'agosto': '08',
        'septiembre': '09', 'octubre': '10', 'noviembre': '11', 'diciembre': '12'
    };
    return meses[nombreMes.toLowerCase()] || '01';
}

// ==================== FUNCIONES DEL DASHBOARD ====================

function updateDashboard() {
    const tipoFiltro = document.getElementById('filter-type-selector').value;
    const valorFiltro = document.getElementById('filter-value-selector').value;
    
    console.log('updateDashboard - Filtro:', tipoFiltro, 'Valor:', valorFiltro);
    
    let tickets = allTickets;
    
    // Aplicar filtro según el tipo seleccionado
    if (tipoFiltro === 'sprint' && valorFiltro !== 'all') {
        tickets = tickets.filter(t => t.sprint == valorFiltro);
        console.log('Tickets filtrados por sprint', valorFiltro, ':', tickets.length);
    } else if (tipoFiltro === 'mes' && valorFiltro !== 'all') {
        tickets = tickets.filter(t => {
            const fecha = parsearFecha(t.creada);
            if (!fecha) return false;
            const mesCreada = fecha.toLocaleString('es-ES', {month: 'long', year: 'numeric'});
            return mesCreada.toLowerCase() === valorFiltro.toLowerCase();
        });
    }
    
    const kpis = calcularKPIs(tickets);
    renderDashboardKPIs(kpis, tickets);
}

function calcularKPIs(tickets) {
    const total = tickets.length;
    
    // Contar por estado
    const finalizados = tickets.filter(t => t.estadoNormalizado === 'Finalizados').length;
    const enCurso = tickets.filter(t => t.estadoNormalizado === 'En Curso').length;
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
    
    // Nuevo KPI: Días de cierre (Estimado vs Real)
    const ticketsConEstimacion = tickets.filter(t => 
        t.storyPointEstimate && t.storyPointEstimate !== '' && 
        t.diasResolucionReal && t.diasResolucionReal !== '' &&
        t.estadoNormalizado && t.estadoNormalizado.trim() === 'Finalizados'
    );
    
    console.log('Tickets con estimación para KPI:', ticketsConEstimacion.length);
    
    let diasEstimadoPromedio = 0;
    let diasRealPromedio = 0;
    let desviacionPromedio = 0;
    
    if (ticketsConEstimacion.length > 0) {
        const sumaEstimado = ticketsConEstimacion.reduce((acc, t) => acc + parseFloat(t.storyPointEstimate), 0);
        const sumaReal = ticketsConEstimacion.reduce((acc, t) => acc + parseFloat(t.diasResolucionReal), 0);
        
        diasEstimadoPromedio = (sumaEstimado / ticketsConEstimacion.length).toFixed(1);
        diasRealPromedio = (sumaReal / ticketsConEstimacion.length).toFixed(1);
        desviacionPromedio = (diasRealPromedio - diasEstimadoPromedio).toFixed(1);
    }
    
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
        coberturaResolucion,
        diasEstimadoPromedio,
        diasRealPromedio,
        desviacionPromedio,
        ticketsConEstimacion: ticketsConEstimacion.length
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

// Función para mostrar tickets según el tipo de KPI clickeado
function showKPITickets(kpiType, sprintNum = null) {
    console.log('showKPITickets llamada:', kpiType, sprintNum);
    
    // Obtener el sprint actual del filtro del dashboard
    const tipoFiltro = document.getElementById('filter-type-selector').value;
    const valorFiltro = document.getElementById('filter-value-selector').value;
    
    let tickets = [...ticketsData];
    
    // Aplicar el mismo filtro que está usando el dashboard
    if (tipoFiltro === 'sprint' && valorFiltro !== 'all') {
        tickets = tickets.filter(t => String(t.sprint) === String(valorFiltro));
        console.log('Filtrando tickets por sprint:', valorFiltro, 'Total:', tickets.length);
    } else if (tipoFiltro === 'mes' && valorFiltro !== 'all') {
        tickets = tickets.filter(t => {
            const fecha = parsearFecha(t.creada);
            if (!fecha) return false;
            const mesCreada = fecha.toLocaleString('es-ES', {month: 'long', year: 'numeric'});
            return mesCreada.toLowerCase() === valorFiltro.toLowerCase();
        });
    }
    
    let filteredTickets = [];
    let title = '';
    
    switch(kpiType) {
        case 'total':
            filteredTickets = tickets;
            title = 'Total de Actividades';
            break;
        case 'finalizados':
            filteredTickets = tickets.filter(t => t.estadoNormalizado === 'Finalizados');
            title = 'Actividades Finalizadas';
            break;
        case 'enCurso':
            filteredTickets = tickets.filter(t => t.estadoNormalizado === 'En Curso');
            title = 'Actividades En Curso';
            break;
        case 'highestAbiertos':
            filteredTickets = tickets.filter(t => t.prioridad === 'Highest' && t.estadoNormalizado !== 'Finalizados');
            title = 'Actividades Highest Abiertos';
            break;
        case 'backlog':
            filteredTickets = tickets.filter(t => t.estado === 'Backlog');
            title = 'Actividades en Backlog';
            break;
        case 'tiempoHighest':
            filteredTickets = tickets.filter(t => t.prioridad === 'Highest' && t.diasResolucionReal !== null);
            title = 'Actividades Highest (Resueltos)';
            break;
        case 'tiempoHigh':
            filteredTickets = tickets.filter(t => t.prioridad === 'High' && t.diasResolucionReal !== null);
            title = 'Actividades High (Resueltos)';
            break;
        case 'tiempoMedium':
            filteredTickets = tickets.filter(t => t.prioridad === 'Medium' && t.diasResolucionReal !== null);
            title = 'Actividades Medium (Resueltos)';
            break;
        case 'diasEstimado':
            console.log('Filtrando diasEstimado. Tickets iniciales:', tickets.length);
            filteredTickets = tickets.filter(t => {
                const tieneEstimacion = t.storyPointEstimate && t.storyPointEstimate !== '';
                const tieneDiasReal = t.diasResolucionReal && t.diasResolucionReal !== '';
                const estaFinalizado = t.estadoNormalizado && t.estadoNormalizado.trim() === 'Finalizados';
                if (tieneEstimacion && tieneDiasReal && !estaFinalizado) {
                    console.log('Ticket NO finalizado:', t.clave, 'Estado:', t.estadoNormalizado);
                }
                return tieneEstimacion && tieneDiasReal && estaFinalizado;
            });
            console.log('Tickets filtrados finales:', filteredTickets.length);
            title = 'Actividades Finalizadas con Estimación';
            break;
        case 'diasReal':
            filteredTickets = tickets.filter(t => {
                const tieneEstimacion = t.storyPointEstimate && t.storyPointEstimate !== '';
                const tieneDiasReal = t.diasResolucionReal && t.diasResolucionReal !== '';
                const estaFinalizado = t.estadoNormalizado && t.estadoNormalizado.trim() === 'Finalizados';
                return tieneEstimacion && tieneDiasReal && estaFinalizado;
            });
            title = 'Actividades Finalizadas con Tiempo Real';
            break;
        default:
            filteredTickets = tickets;
            title = 'Actividades';
    }
    
    console.log('Mostrando modal:', title, 'con', filteredTickets.length, 'tickets');
    showTicketModal(title, filteredTickets);
}

// Función para mostrar tickets por tipo de incidencia
function showTipoTickets(tipoIncidencia, filtro) {
    // Obtener filtro actual del dashboard
    const tipoFiltro = document.getElementById('filter-type-selector').value;
    const valorFiltro = document.getElementById('filter-value-selector').value;
    
    // Filtrar tickets según el filtro del dashboard
    let tickets = ticketsData;
    if (tipoFiltro === 'sprint' && valorFiltro !== 'all') {
        tickets = tickets.filter(t => t.sprint === valorFiltro);
    } else if (tipoFiltro === 'mes' && valorFiltro !== 'all') {
        tickets = tickets.filter(t => {
            if (!t.creada) return false;
            const fecha = new Date(t.creada);
            const mes = fecha.getMonth() + 1;
            const año = fecha.getFullYear();
            return `${año}-${mes.toString().padStart(2, '0')}` === valorFiltro;
        });
    }
    
    // Filtrar por tipo de incidencia
    tickets = tickets.filter(t => t.tipoIncidencia === tipoIncidencia);
    
    let filteredTickets = [];
    let title = '';
    
    switch(filtro) {
        case 'all':
            filteredTickets = tickets;
            title = `Todos los tickets de ${tipoIncidencia}`;
            break;
        case 'Finalizados':
            filteredTickets = tickets.filter(t => t.estadoNormalizado === 'Finalizados');
            title = `${tipoIncidencia} - Finalizados`;
            break;
        case 'En Curso':
            filteredTickets = tickets.filter(t => t.estadoNormalizado === 'En Curso');
            title = `${tipoIncidencia} - En Curso`;
            break;
        case 'Tareas por hacer':
            filteredTickets = tickets.filter(t => t.estadoNormalizado === 'Tareas por hacer');
            title = `${tipoIncidencia} - Tareas por hacer`;
            break;
        case 'diasReal':
            filteredTickets = tickets.filter(t => {
                const tieneDiasReal = t.diasResolucionReal && t.diasResolucionReal !== '' && t.diasResolucionReal !== null;
                return tieneDiasReal && t.estadoNormalizado.trim() === 'Finalizados';
            });
            title = `${tipoIncidencia} - Con Días Reales`;
            break;
        case 'estimado':
            filteredTickets = tickets.filter(t => {
                const tieneEstimacion = t.storyPointEstimate && t.storyPointEstimate !== '' && t.storyPointEstimate !== null;
                return tieneEstimacion;
            });
            title = `${tipoIncidencia} - Con Estimación`;
            break;
        default:
            filteredTickets = tickets;
            title = `${tipoIncidencia}`;
    }
    
    console.log('Mostrando modal:', title, 'con', filteredTickets.length, 'tickets');
    showTicketModal(title, filteredTickets);
}

// Función genérica para mostrar modal de tickets
function showTicketModal(titulo, ticketsFiltrados) {
    // Crear modal si no existe
    let modal = document.getElementById('ticket-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'ticket-modal';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }
    
    // Determinar qué columnas mostrar
    const mostrarDiasReal = ticketsFiltrados.some(ticket => ticket.diasResolucionReal !== null && ticket.diasResolucionReal !== undefined && ticket.diasResolucionReal !== '');
    const mostrarEstimacion = ticketsFiltrados.some(ticket => ticket.storyPointEstimate && ticket.storyPointEstimate > 0);
    const mostrarDesviacion = ticketsFiltrados.some(ticket => ticket.desviacion !== null && ticket.desviacion !== undefined && ticket.desviacion !== '');
    const mostrarResuelta = ticketsFiltrados.some(ticket => ticket.resuelta && ticket.resuelta !== '');
    
    // Contenido del modal
    const tablaHTML = ticketsFiltrados.length > 0 ? `
        <table class="modal-table">
            <thead>
                <tr>
                    <th>Clave</th>
                    <th>Tipo</th>
                    <th>Resumen</th>
                    <th>Asignado</th>
                    <th>Prioridad</th>
                    <th>Estado</th>
                    <th>Creada</th>
                    ${mostrarResuelta ? '<th>Resuelta</th>' : ''}
                    ${mostrarEstimacion ? '<th>Estimación</th>' : ''}
                    ${mostrarDiasReal ? '<th>Días Real</th>' : ''}
                    ${mostrarDesviacion ? '<th>Desviación</th>' : ''}
                </tr>
            </thead>
            <tbody>
                ${ticketsFiltrados.map(t => `
                    <tr>
                        <td><strong>${t.clave}</strong></td>
                        <td><span class="type-badge type-${t.tipoIncidencia.toLowerCase()}">${t.tipoIncidencia}</span></td>
                        <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis;" title="${t.resumen}">${t.resumen}</td>
                        <td>${t.asignado}</td>
                        <td><span class="priority-badge priority-${t.prioridad.toLowerCase()}">${t.prioridad}</span></td>
                        <td><span class="status-badge status-${t.estadoNormalizado.toLowerCase().replace(' ', '-')}">${t.estado}</span></td>
                        <td>${t.creada}</td>
                        ${mostrarResuelta ? `<td>${t.resuelta || '-'}</td>` : ''}
                        ${mostrarEstimacion ? `<td>${(t.storyPointEstimate && t.storyPointEstimate > 0) ? t.storyPointEstimate + ' días' : '-'}</td>` : ''}
                        ${mostrarDiasReal ? `<td>${(t.diasResolucionReal !== null && t.diasResolucionReal !== undefined && t.diasResolucionReal !== '') ? t.diasResolucionReal + ' días' : '-'}</td>` : ''}
                        ${mostrarDesviacion ? `<td style="${t.desviacion && t.desviacion !== '' ? (parseFloat(t.desviacion) <= 0 ? 'background-color: rgba(16, 185, 129, 0.15);' : 'background-color: rgba(239, 68, 68, 0.15);') : ''}">${(t.desviacion !== null && t.desviacion !== undefined && t.desviacion !== '') ? t.desviacion + ' días' : '-'}</td>` : ''}
                    </tr>
                `).join('')}
            </tbody>
        </table>
    ` : '<p class="no-data">No hay actividades en esta categoría</p>';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${titulo}</h2>
                <button class="modal-close" onclick="closeTicketModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="modal-summary">
                    <span class="summary-label">Total de actividades:</span>
                    <span class="summary-value">${ticketsFiltrados.length}</span>
                </div>
                ${tablaHTML}
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function renderDashboardKPIs(kpis, tickets) {
    const container = document.getElementById('dashboard-kpis');
    
    if (!container) {
        console.error('Contenedor dashboard-kpis no encontrado');
        return;
    }
    
    const html = `
        <div class="kpi-grid">
            <div class="kpi-card-modern">
                <div class="kpi-icon-wrapper" style="background: linear-gradient(135deg, rgba(108, 92, 231, 0.1), rgba(108, 92, 231, 0.05));">
                    <i data-lucide="activity" style="color: #6C5CE7; width: 24px; height: 24px;"></i>
                </div>
                <div class="kpi-content">
                    <div class="kpi-label">Total Actividades</div>
                    <div class="kpi-value kpi-value-clickable" onclick="showKPITickets('total')" title="Click para ver tickets">${kpis.total}</div>
                </div>
            </div>
            
            <div class="kpi-card-modern ${kpis.pctFinalizados >= 80 ? 'kpi-success' : 'kpi-warning'}">
                <div class="kpi-icon-wrapper" style="background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.05));">
                    <i data-lucide="check-circle-2" style="color: #4CAF50; width: 24px; height: 24px;"></i>
                </div>
                <div class="kpi-content">
                    <div class="kpi-label">% Finalizados</div>
                    <div class="kpi-value kpi-value-clickable" onclick="showKPITickets('finalizados')" title="Click para ver tickets">${kpis.pctFinalizados}%</div>
                    <div class="kpi-badge ${kpis.pctFinalizados >= 80 ? 'badge-success' : 'badge-warning'}">
                        ${kpis.pctFinalizados >= 80 ? 'Cumple' : 'Revisar'}
                    </div>
                </div>
            </div>
            
            <div class="kpi-card-modern">
                <div class="kpi-icon-wrapper" style="background: linear-gradient(135deg, rgba(255, 152, 0, 0.1), rgba(255, 152, 0, 0.05));">
                    <i data-lucide="clock" style="color: #FF9800; width: 24px; height: 24px;"></i>
                </div>
                <div class="kpi-content">
                    <div class="kpi-label">% En Curso</div>
                    <div class="kpi-value kpi-value-clickable" onclick="showKPITickets('enCurso')" title="Click para ver tickets">${kpis.pctEnCurso}%</div>
                    <div class="kpi-badge ${kpis.pctEnCurso <= 20 ? 'badge-success' : 'badge-warning'}">
                        ${kpis.pctEnCurso <= 20 ? 'Cumple' : 'Revisar'}
                    </div>
                </div>
            </div>
            
            <div class="kpi-card-modern ${kpis.highestAbiertos === 0 ? 'kpi-success' : 'kpi-alert'}">
                <div class="kpi-icon-wrapper" style="background: linear-gradient(135deg, rgba(244, 67, 54, 0.1), rgba(244, 67, 54, 0.05));">
                    <i data-lucide="alert-circle" style="color: #F44336; width: 24px; height: 24px;"></i>
                </div>
                <div class="kpi-content">
                    <div class="kpi-label">Highest Abiertos</div>
                    <div class="kpi-value kpi-value-clickable" onclick="showKPITickets('highestAbiertos')" title="Click para ver tickets">${kpis.highestAbiertos}</div>
                    <div class="kpi-badge ${kpis.highestAbiertos === 0 ? 'badge-success' : 'badge-danger'}">
                        ${kpis.highestAbiertos === 0 ? 'Cumple' : 'Revisar'}
                    </div>
                </div>
            </div>
            
            <div class="kpi-card-modern">
                <div class="kpi-icon-wrapper" style="background: linear-gradient(135deg, rgba(156, 39, 176, 0.1), rgba(156, 39, 176, 0.05));">
                    <i data-lucide="layers" style="color: #9C27B0; width: 24px; height: 24px;"></i>
                </div>
                <div class="kpi-content">
                    <div class="kpi-label">Backlog</div>
                    <div class="kpi-value kpi-value-clickable" onclick="showKPITickets('backlog')" title="Click para ver tickets">${kpis.backlog}</div>
                    <div class="kpi-badge ${kpis.backlog < 5 ? 'badge-success' : kpis.backlog < 50 ? 'badge-warning' : 'badge-danger'}">
                        ${kpis.backlog < 5 ? 'Cumple' : kpis.backlog < 50 ? 'Revisar' : 'Crítico'}
                    </div>
                </div>
            </div>
            
            <div class="kpi-card-modern">
                <div class="kpi-icon-wrapper" style="background: linear-gradient(135deg, rgba(233, 30, 99, 0.1), rgba(233, 30, 99, 0.05));">
                    <i data-lucide="zap" style="color: #E91E63; width: 24px; height: 24px;"></i>
                </div>
                <div class="kpi-content">
                    <div class="kpi-label">Tiempo Highest</div>
                    <div class="kpi-value kpi-value-clickable" onclick="showKPITickets('tiempoHighest')" title="Click para ver tickets"><span>${kpis.tiempoHighest}</span> <span class="kpi-unit">días</span></div>
                    <div class="kpi-badge ${kpis.tiempoHighest <= 2 ? 'badge-success' : 'badge-warning'}">
                        ${kpis.tiempoHighest <= 2 ? 'Cumple' : 'Revisar'}
                    </div>
                </div>
            </div>
            
            <div class="kpi-card-modern">
                <div class="kpi-icon-wrapper" style="background: linear-gradient(135deg, rgba(255, 87, 34, 0.1), rgba(255, 87, 34, 0.05));">
                    <i data-lucide="trending-up" style="color: #FF5722; width: 24px; height: 24px;"></i>
                </div>
                <div class="kpi-content">
                    <div class="kpi-label">Tiempo High</div>
                    <div class="kpi-value kpi-value-clickable" onclick="showKPITickets('tiempoHigh')" title="Click para ver tickets"><span>${kpis.tiempoHigh}</span> <span class="kpi-unit">días</span></div>
                    <div class="kpi-badge ${kpis.tiempoHigh <= 5 ? 'badge-success' : 'badge-warning'}">
                        ${kpis.tiempoHigh <= 5 ? 'Cumple' : 'Revisar'}
                    </div>
                </div>
            </div>
            
            <div class="kpi-card-modern">
                <div class="kpi-icon-wrapper" style="background: linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(33, 150, 243, 0.05));">
                    <i data-lucide="timer" style="color: #2196F3; width: 24px; height: 24px;"></i>
                </div>
                <div class="kpi-content">
                    <div class="kpi-label">Tiempo Medium</div>
                    <div class="kpi-value kpi-value-clickable" onclick="showKPITickets('tiempoMedium')" title="Click para ver tickets"><span>${kpis.tiempoMedium}</span> <span class="kpi-unit">días</span></div>
                    <div class="kpi-badge ${kpis.tiempoMedium <= 15 ? 'badge-success' : 'badge-warning'}">
                        ${kpis.tiempoMedium <= 15 ? 'Cumple' : 'Revisar'}
                    </div>
                </div>
            </div>
            
            <div class="kpi-card-modern">
                <div class="kpi-icon-wrapper" style="background: linear-gradient(135deg, rgba(0, 150, 136, 0.1), rgba(0, 150, 136, 0.05));">
                    <i data-lucide="rotate-ccw" style="color: #009688; width: 24px; height: 24px;"></i>
                </div>
                <div class="kpi-content">
                    <div class="kpi-label">Tasa Reapertura</div>
                    <div class="kpi-value">${kpis.tasaReapertura}%</div>
                    <div class="kpi-badge badge-success">Cumple</div>
                </div>
            </div>
            
            <div class="kpi-card-modern kpi-highlight" style="background: linear-gradient(135deg, #00BCD4 0%, #0097A7 100%);">
                <div class="kpi-icon-wrapper" style="background: rgba(255, 255, 255, 0.15);">
                    <i data-lucide="calendar-check" style="color: white; width: 24px; height: 24px;"></i>
                </div>
                <div class="kpi-content">
                    <div class="kpi-label" style="color: rgba(255,255,255,0.9);">Días Estimado (Promedio)</div>
                    <div class="kpi-value kpi-value-clickable" onclick="showKPITickets('diasEstimado')" style="color: white;" title="Click para ver tickets"><span>${kpis.diasEstimadoPromedio}</span> <span class="kpi-unit" style="color: rgba(255,255,255,0.8);">días</span></div>
                    <div class="kpi-badge" style="background: rgba(255,255,255,0.2); color: white;">${kpis.ticketsConEstimacion} tickets</div>
                </div>
            </div>
            
            <div class="kpi-card-modern kpi-highlight" style="background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);">
                <div class="kpi-icon-wrapper" style="background: rgba(255, 255, 255, 0.15);">
                    <i data-lucide="bar-chart-2" style="color: white; width: 24px; height: 24px;"></i>
                </div>
                <div class="kpi-content">
                    <div class="kpi-label" style="color: rgba(255,255,255,0.9);">Días Real (Promedio)</div>
                    <div class="kpi-value kpi-value-clickable" onclick="showKPITickets('diasReal')" style="color: white;" title="Click para ver tickets"><span>${kpis.diasRealPromedio}</span> <span class="kpi-unit" style="color: rgba(255,255,255,0.8);">días</span></div>
                    <div class="kpi-badge" style="background: rgba(255,255,255,0.2); color: white;">${kpis.desviacionPromedio > 0 ? '+' : ''}${kpis.desviacionPromedio} días desviación</div>
                </div>
            </div>
        </div>
        
        <h3><i data-lucide="flag" style="display: inline-block; width: 24px; height: 24px; margin-right: 8px; color: #6C5CE7; vertical-align: middle;"></i>Distribución por Prioridad</h3>
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
                    const curso = ticketsPrio.filter(t => t.estadoNormalizado === 'En Curso').length;
                    const pend = ticketsPrio.filter(t => t.estadoNormalizado === 'Tareas por hacer').length;
                    const pct = total > 0 ? ((fin / total) * 100).toFixed(1) : 0;
                    const tipoFiltro = document.getElementById('filter-type-selector').value;
                    const valorFiltro = document.getElementById('filter-value-selector').value;
                    return `<tr>
                        <td><strong>${p}</strong></td>
                        <td><a href="#" class="clickable-number" onclick="showTicketDetailsByPriority('${p}', 'all', '${tipoFiltro}', '${valorFiltro}'); return false;">${total}</a></td>
                        <td><a href="#" class="clickable-number" onclick="showTicketDetailsByPriority('${p}', 'Finalizados', '${tipoFiltro}', '${valorFiltro}'); return false;">${fin}</a></td>
                        <td><a href="#" class="clickable-number" onclick="showTicketDetailsByPriority('${p}', 'En Curso', '${tipoFiltro}', '${valorFiltro}'); return false;">${curso}</a></td>
                        <td><a href="#" class="clickable-number" onclick="showTicketDetailsByPriority('${p}', 'Tareas por hacer', '${tipoFiltro}', '${valorFiltro}'); return false;">${pend}</a></td>
                        <td>${pct}%</td>
                    </tr>`;
                }).join('')}
            </tbody>
        </table>
        
        <h3 style="margin-top: 40px;"><i data-lucide="bar-chart-3" style="display: inline-block; width: 24px; height: 24px; margin-right: 8px; color: #6C5CE7; vertical-align: middle;"></i>Distribución por Tipo de Actividad</h3>
        <div class="tipo-cards-grid">
            ${renderTipoCards(tickets)}
        </div>
    `;
    
    container.innerHTML = html;
    
    // Inicializar iconos de Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function renderTipoCards(tickets) {
    const tipos = [
        { nombre: 'Historia', icono: 'book-open', iconClass: 'icon-historia', color: '#2196F3', colorClaro: '#E3F2FD' },
        { nombre: 'Error', icono: 'bug', iconClass: 'icon-error', color: '#F44336', colorClaro: '#FFEBEE' },
        { nombre: 'Tarea', icono: 'check-circle', iconClass: 'icon-tarea', color: '#9C27B0', colorClaro: '#F3E5F5' },
        { nombre: 'Subtarea', icono: 'list-checks', iconClass: 'icon-subtarea', color: '#009688', colorClaro: '#E0F2F1' }
    ];
    
    return tipos.map(tipo => {
        const ticketsTipo = tickets.filter(t => t.tipoIncidencia === tipo.nombre);
        const total = ticketsTipo.length;
        const finalizados = ticketsTipo.filter(t => t.estadoNormalizado === 'Finalizados').length;
        const enCurso = ticketsTipo.filter(t => t.estadoNormalizado === 'En Curso').length;
        const pendientes = ticketsTipo.filter(t => t.estadoNormalizado === 'Tareas por hacer').length;
        const pctCompletado = total > 0 ? ((finalizados / total) * 100).toFixed(1) : '0.0';
        
        // Calcular promedio de días reales
        const ticketsConDias = ticketsTipo.filter(t => t.diasResolucionReal !== "" && t.diasResolucionReal !== null);
        const diasPromedio = ticketsConDias.length > 0 
            ? (ticketsConDias.reduce((sum, t) => sum + parseFloat(t.diasResolucionReal || 0), 0) / ticketsConDias.length).toFixed(1)
            : '-';
        
        // Calcular promedio de estimación
        const ticketsConEstimacion = ticketsTipo.filter(t => t.storyPointEstimate !== "" && t.storyPointEstimate !== null);
        const estimadoPromedio = ticketsConEstimacion.length > 0
            ? (ticketsConEstimacion.reduce((sum, t) => sum + parseFloat(t.storyPointEstimate || 0), 0) / ticketsConEstimacion.length).toFixed(1)
            : '-';
        
        return `
            <div class="tipo-card" style="background: linear-gradient(135deg, ${tipo.colorClaro} 0%, white 100%); border-left: 5px solid ${tipo.color};">
                <div class="tipo-header">
                    <div class="icon-container ${tipo.iconClass}">
                        <i data-lucide="${tipo.icono}" style="color: ${tipo.color};"></i>
                    </div>
                    <h4 style="margin: 0; color: ${tipo.color};">${tipo.nombre}</h4>
                </div>
                
                <div class="tipo-stats">
                    <div class="tipo-stat-main">
                        <span class="tipo-total clickable-number" onclick="showTipoTickets('${tipo.nombre}', 'all'); return false;" style="font-size: 2.5em; font-weight: bold; color: ${tipo.color}; cursor: pointer;" title="Click para ver todos los tickets">${total}</span>
                        <span style="color: #666; font-size: 0.9em;">Total</span>
                    </div>
                    
                    <div class="tipo-progress">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span style="font-size: 0.85em; color: #666;">Progreso</span>
                            <span style="font-size: 0.85em; font-weight: bold; color: ${tipo.color};">${pctCompletado}%</span>
                        </div>
                        <div class="progress-bar" style="background: #e0e0e0; height: 8px; border-radius: 10px; overflow: hidden;">
                            <div style="width: ${pctCompletado}%; height: 100%; background: ${tipo.color}; transition: width 0.3s;"></div>
                        </div>
                    </div>
                    
                    <div class="tipo-breakdown">
                        <div class="breakdown-item">
                            <span class="breakdown-dot" style="background: #4CAF50;"></span>
                            <span class="breakdown-label">Finalizados:</span>
                            <span class="breakdown-value"><a href="#" class="clickable-number" onclick="showTipoTickets('${tipo.nombre}', 'Finalizados'); return false;">${finalizados}</a></span>
                        </div>
                        <div class="breakdown-item">
                            <span class="breakdown-dot" style="background: #FF9800;"></span>
                            <span class="breakdown-label">En Curso:</span>
                            <span class="breakdown-value"><a href="#" class="clickable-number" onclick="showTipoTickets('${tipo.nombre}', 'En Curso'); return false;">${enCurso}</a></span>
                        </div>
                        <div class="breakdown-item">
                            <span class="breakdown-dot" style="background: #9E9E9E;"></span>
                            <span class="breakdown-label">Pendientes:</span>
                            <span class="breakdown-value"><a href="#" class="clickable-number" onclick="showTipoTickets('${tipo.nombre}', 'Tareas por hacer'); return false;">${pendientes}</a></span>
                        </div>
                    </div>
                    
                    <div class="tipo-metrics">
                        <div class="metric-box">
                            <div class="metric-label">
                                <i data-lucide="clock" style="width: 14px; height: 14px; margin-right: 4px; vertical-align: middle; color: #666;"></i>
                                Días Real
                            </div>
                            <div class="metric-value clickable-number" onclick="showTipoTickets('${tipo.nombre}', 'diasReal'); return false;" style="color: ${tipo.color}; cursor: pointer;" title="Click para ver tickets con días reales">${diasPromedio}</div>
                        </div>
                        <div class="metric-box">
                            <div class="metric-label">
                                <i data-lucide="calendar-days" style="width: 14px; height: 14px; margin-right: 4px; vertical-align: middle; color: #666;"></i>
                                Estimado
                            </div>
                            <div class="metric-value clickable-number" onclick="showTipoTickets('${tipo.nombre}', 'estimado'); return false;" style="color: ${tipo.color}; cursor: pointer;" title="Click para ver tickets con estimación">${estimadoPromedio}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
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
    
    if (!tbody) {
        console.error('No se encontró el elemento evolucion-tbody');
        return;
    }
    
    // Agrupar por sprint
    const sprints = {};
    allTickets.forEach(t => {
        const s = t.sprint;
        if (!sprints[s]) sprints[s] = [];
        sprints[s].push(t);
    });
    
    // Ordenar sprints (descendente: recientes primero)
    const sprintNumbers = Object.keys(sprints).map(Number).sort((a, b) => b - a);
    
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
    
    // Agregar sprints futuros si no existen (en orden descendente)
    const maxSprint = Math.max(...sprintNumbers);
    const futureRows = [];
    for (let s = maxSprint + 1; s <= 35; s++) {
        futureRows.push({
            sprint: s,
            nuevos: 0,
            resueltos: 0,
            pendientes: 0,
            totalAcumulado,
            pctResolucion: 0
        });
    }
    rows.unshift(...futureRows.reverse());
    
    tbody.innerHTML = rows.map(r => `
        <tr ${r.sprint == 34 ? 'style="background-color: #e3f2fd; font-weight: 600;"' : ''}>
            <td><strong>Sprint ${r.sprint}${r.sprint == 34 ? ' (Actual)' : ''}</strong></td>
            <td><a href="#" class="clickable-number" onclick="showTicketDetails(${r.sprint}, 'nuevos'); return false;">${r.nuevos}</a></td>
            <td><a href="#" class="clickable-number" onclick="showTicketDetails(${r.sprint}, 'resueltos'); return false;">${r.resueltos}</a></td>
            <td><a href="#" class="clickable-number" onclick="showTicketDetails(${r.sprint}, 'pendientes'); return false;">${r.pendientes}</a></td>
            <td>${r.totalAcumulado}</td>
            <td>${r.pctResolucion}%</td>
        </tr>
    `).join('');
    
    // Renderizar gráfico mejorado con Apache ECharts
    renderEvolutionChartModern(rows);
}

let evolutionChartInstance = null;

function renderEvolutionChartModern(data) {
    const chartDom = document.getElementById('evolutionChart');
    
    if (!chartDom) {
        console.error('No se encontró el elemento evolutionChart');
        return;
    }
    
    // Destruir instancia anterior si existe
    if (evolutionChartInstance) {
        evolutionChartInstance.dispose();
    }
    
    // Inicializar ECharts
    evolutionChartInstance = echarts.init(chartDom);
    
    // Filtrar datos relevantes
    const relevantData = data.filter(d => d.sprint <= 35);
    
    console.log('Total tickets disponibles:', allTickets.length);
    console.log('Sprints en datos:', relevantData.map(d => d.sprint));
    
    // Calcular datos por tipo de actividad para cada sprint
    const sprintLabels = [];
    const historiasData = [];
    const erroresData = [];
    const tareasData = [];
    const subtareasData = [];
    
    relevantData.forEach(d => {
        const sprintNum = d.sprint;
        sprintLabels.push(`Sprint ${sprintNum}`);
        
        // Filtrar tickets del sprint actual - sprint es un string en los datos
        const sprintTickets = allTickets.filter(t => {
            // Convertir ambos a string para comparar correctamente
            const ticketSprint = String(t.sprint);
            const targetSprint = String(sprintNum);
            
            // También verificar en el campo 'sprints' que puede tener múltiples sprints separados por coma
            const sprints = t.sprints ? t.sprints.split(',').map(s => s.trim()) : [];
            
            return ticketSprint === targetSprint || sprints.includes(targetSprint);
        });
        
        const historias = sprintTickets.filter(t => t.tipoIncidencia === 'Historia').length;
        const errores = sprintTickets.filter(t => t.tipoIncidencia === 'Error').length;
        const tareas = sprintTickets.filter(t => t.tipoIncidencia === 'Tarea').length;
        const subtareas = sprintTickets.filter(t => t.tipoIncidencia === 'Subtarea').length;
        
        console.log(`Sprint ${sprintNum}: ${sprintTickets.length} tickets - H:${historias} E:${errores} T:${tareas} Su:${subtareas}`);
        
        historiasData.push(historias);
        erroresData.push(errores);
        tareasData.push(tareas);
        subtareasData.push(subtareas);
    });
    
    // Configuración de Apache ECharts
    const option = {
        backgroundColor: '#ffffff',
        title: {
            show: false
        },
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            borderWidth: 0,
            textStyle: {
                color: '#fff',
                fontSize: 13,
                fontFamily: 'Inter, sans-serif'
            },
            axisPointer: {
                type: 'cross',
                label: {
                    backgroundColor: '#6C5CE7'
                },
                crossStyle: {
                    color: '#999'
                }
            },
            formatter: function(params) {
                let result = `<div style="font-weight: bold; margin-bottom: 8px;">${params[0].axisValue}</div>`;
                params.forEach(param => {
                    result += `
                        <div style="display: flex; align-items: center; margin: 4px 0;">
                            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${param.color}; margin-right: 8px;"></span>
                            <span style="flex: 1;">${param.seriesName}:</span>
                            <span style="font-weight: bold; margin-left: 12px;">${param.value}</span>
                        </div>
                    `;
                });
                return result;
            }
        },
        legend: {
            data: ['Historia', 'Error', 'Tarea', 'Subtarea'],
            top: 20,
            left: 'center',
            itemGap: 25,
            textStyle: {
                fontSize: 13,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                color: '#333'
            },
            itemWidth: 14,
            itemHeight: 14,
            icon: 'circle'
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '8%',
            top: '18%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: sprintLabels,
            axisLine: {
                lineStyle: {
                    color: '#ddd'
                }
            },
            axisLabel: {
                color: '#666',
                fontSize: 11,
                fontFamily: 'Inter, sans-serif',
                rotate: 45
            },
            axisTick: {
                show: false
            }
        },
        yAxis: {
            type: 'value',
            name: 'Cantidad',
            nameTextStyle: {
                color: '#666',
                fontSize: 12,
                fontWeight: 'bold',
                fontFamily: 'Inter, sans-serif',
                padding: [0, 0, 0, 0]
            },
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                color: '#666',
                fontSize: 12,
                fontFamily: 'Inter, sans-serif'
            },
            splitLine: {
                lineStyle: {
                    color: '#f0f0f0',
                    type: 'dashed'
                }
            }
        },
        series: [
            {
                name: 'Historia',
                type: 'line',
                smooth: false,
                data: historiasData,
                symbol: 'circle',
                symbolSize: 8,
                lineStyle: {
                    width: 3,
                    color: '#6C5CE7'
                },
                itemStyle: {
                    color: '#6C5CE7',
                    borderWidth: 2,
                    borderColor: '#fff'
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(108, 92, 231, 0.3)' },
                        { offset: 1, color: 'rgba(108, 92, 231, 0.05)' }
                    ])
                },
                emphasis: {
                    focus: 'series',
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(108, 92, 231, 0.5)'
                    }
                }
            },
            {
                name: 'Error',
                type: 'line',
                smooth: false,
                data: erroresData,
                symbol: 'circle',
                symbolSize: 8,
                lineStyle: {
                    width: 3,
                    color: '#ef4444'
                },
                itemStyle: {
                    color: '#ef4444',
                    borderWidth: 2,
                    borderColor: '#fff'
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(239, 68, 68, 0.3)' },
                        { offset: 1, color: 'rgba(239, 68, 68, 0.05)' }
                    ])
                },
                emphasis: {
                    focus: 'series',
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(239, 68, 68, 0.5)'
                    }
                }
            },
            {
                name: 'Tarea',
                type: 'line',
                smooth: false,
                data: tareasData,
                symbol: 'circle',
                symbolSize: 8,
                lineStyle: {
                    width: 3,
                    color: '#10b981'
                },
                itemStyle: {
                    color: '#10b981',
                    borderWidth: 2,
                    borderColor: '#fff'
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
                        { offset: 1, color: 'rgba(16, 185, 129, 0.05)' }
                    ])
                },
                emphasis: {
                    focus: 'series',
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(16, 185, 129, 0.5)'
                    }
                }
            },
            {
                name: 'Subtarea',
                type: 'line',
                smooth: false,
                data: subtareasData,
                symbol: 'circle',
                symbolSize: 8,
                lineStyle: {
                    width: 3,
                    color: '#8b5cf6'
                },
                itemStyle: {
                    color: '#8b5cf6',
                    borderWidth: 2,
                    borderColor: '#fff'
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(139, 92, 246, 0.3)' },
                        { offset: 1, color: 'rgba(139, 92, 246, 0.05)' }
                    ])
                },
                emphasis: {
                    focus: 'series',
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(139, 92, 246, 0.5)'
                    }
                }
            }
        ],
        animation: true,
        animationDuration: 1200,
        animationEasing: 'cubicOut'
    };
    
    // Aplicar configuración
    evolutionChartInstance.setOption(option);
    
    // Hacer responsive
    window.addEventListener('resize', function() {
        if (evolutionChartInstance) {
            evolutionChartInstance.resize();
        }
    });
}

// ==================== FUNCIONES DE RESUMEN ====================

function updateResumen() {
    const sprint = document.getElementById('sprint-selector-resumen').value;
    const tickets = sprint === 'all' ? allTickets : allTickets.filter(t => t.sprint == sprint);
    
    const matriz = {};
    const prioridades = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];
    const estados = ['Tareas por hacer', 'En Curso', 'Finalizados'];
    
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
    
    // Renderizar distribución por tipo
    renderDistribucionPorTipo(tickets);
}

function renderDistribucionPorTipo(tickets) {
    const tbody = document.getElementById('tipo-distribution-tbody');
    
    if (!tbody) {
        console.warn('No se encontró el elemento tipo-distribution-tbody');
        return;
    }
    
    // Tipos de incidencia
    const tipos = ['Historia', 'Error', 'Tarea', 'Subtarea'];
    
    const distribucion = {};
    
    tipos.forEach(tipo => {
        const ticketsTipo = tickets.filter(t => t.tipoIncidencia === tipo);
        const total = ticketsTipo.length;
        const finalizados = ticketsTipo.filter(t => t.estadoNormalizado === 'Finalizados').length;
        const enCurso = ticketsTipo.filter(t => t.estadoNormalizado === 'En Curso').length;
        const pendientes = ticketsTipo.filter(t => t.estadoNormalizado === 'Tareas por hacer').length;
        const pctCompletado = total > 0 ? ((finalizados / total) * 100).toFixed(1) : '0.0';
        
        // Calcular promedio de días reales (solo tickets con valor)
        const ticketsConDias = ticketsTipo.filter(t => t.diasResolucionReal !== "" && t.diasResolucionReal !== null && t.diasResolucionReal !== undefined);
        const diasPromedio = ticketsConDias.length > 0 
            ? (ticketsConDias.reduce((sum, t) => sum + parseFloat(t.diasResolucionReal || 0), 0) / ticketsConDias.length).toFixed(1)
            : '-';
        
        // Calcular promedio de estimación (solo tickets con valor)
        const ticketsConEstimacion = ticketsTipo.filter(t => t.storyPointEstimate !== "" && t.storyPointEstimate !== null && t.storyPointEstimate !== undefined);
        const estimadoPromedio = ticketsConEstimacion.length > 0
            ? (ticketsConEstimacion.reduce((sum, t) => sum + parseFloat(t.storyPointEstimate || 0), 0) / ticketsConEstimacion.length).toFixed(1)
            : '-';
        
        distribucion[tipo] = {
            total,
            finalizados,
            enCurso,
            pendientes,
            pctCompletado,
            diasPromedio,
            estimadoPromedio
        };
    });
    
    // Renderizar tabla
    const rows = tipos.map(tipo => {
        const d = distribucion[tipo];
        let colorFila = '';
        
        // Color según tipo
        if (tipo === 'Error') colorFila = 'background-color: #ffebee;';
        else if (tipo === 'Historia') colorFila = 'background-color: #e3f2fd;';
        else if (tipo === 'Tarea') colorFila = 'background-color: #f3e5f5;';
        else if (tipo === 'Subtarea') colorFila = 'background-color: #e0f2f1;';
        
        return `
            <tr style="${colorFila}">
                <td><strong>${tipo}</strong></td>
                <td><a href="#" class="clickable-number" onclick="filtrarPorTipo('${tipo}'); return false;">${d.total}</a></td>
                <td><a href="#" class="clickable-number" onclick="filtrarPorTipoYEstado('${tipo}', 'Finalizados'); return false;">${d.finalizados}</a></td>
                <td><a href="#" class="clickable-number" onclick="filtrarPorTipoYEstado('${tipo}', 'En Curso'); return false;">${d.enCurso}</a></td>
                <td><a href="#" class="clickable-number" onclick="filtrarPorTipoYEstado('${tipo}', 'Tareas por hacer'); return false;">${d.pendientes}</a></td>
                <td>${d.pctCompletado}%</td>
                <td>${d.diasPromedio}</td>
                <td>${d.estimadoPromedio}</td>
            </tr>
        `;
    }).join('');
    
    tbody.innerHTML = rows;
}

// Función auxiliar para filtrar por tipo y cambiar a pestaña de incidentes
function filtrarPorTipo(tipo) {
    // Cambiar a pestaña de incidentes
    cambiarTab('incidentes');
    
    // Aplicar filtro
    const filterTipo = document.getElementById('filter-tipo');
    if (filterTipo) {
        filterTipo.value = tipo;
        filterIncidentesAvanzado();
    }
}

// Función auxiliar para filtrar por tipo y estado
function filtrarPorTipoYEstado(tipo, estado) {
    // Cambiar a pestaña de incidentes
    cambiarTab('incidentes');
    
    // Aplicar filtros
    const filterTipo = document.getElementById('filter-tipo');
    const filterEstado = document.getElementById('filter-estado');
    
    if (filterTipo) filterTipo.value = tipo;
    if (filterEstado) filterEstado.value = estado;
    
    filterIncidentesAvanzado();
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
        'En Curso': '#ffc107',
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
    const filterTipo = document.getElementById('filter-tipo').value;
    const filterResumen = document.getElementById('filter-resumen').value.toLowerCase();
    const filterAsignado = document.getElementById('filter-asignado').value;
    const filterPrioridad = document.getElementById('filter-prioridad-col').value;
    const filterEstado = document.getElementById('filter-estado-col').value;
    const filterSprint = document.getElementById('filter-sprint-col').value;
    const filterCreada = document.getElementById('filter-creada').value.toLowerCase();
    const filterActualizada = document.getElementById('filter-actualizada').value.toLowerCase();
    const filterResuelta = document.getElementById('filter-resuelta').value.toLowerCase();
    
    let filtered = allTickets.filter(t => {
        const matchClave = !filterClave || t.clave.toLowerCase().includes(filterClave);
        const matchTipo = !filterTipo || t.tipoIncidencia === filterTipo;
        const matchResumen = !filterResumen || t.resumen.toLowerCase().includes(filterResumen);
        const matchAsignado = !filterAsignado || t.asignado === filterAsignado;
        const matchPrioridad = !filterPrioridad || t.prioridad === filterPrioridad;
        const matchEstado = !filterEstado || t.estadoNormalizado === filterEstado;
        const matchSprint = !filterSprint || t.sprint == filterSprint;
        const matchCreada = !filterCreada || t.creada.toLowerCase().includes(filterCreada);
        const matchActualizada = !filterActualizada || t.actualizada.toLowerCase().includes(filterActualizada);
        const matchResuelta = !filterResuelta || (t.resuelta && t.resuelta.toLowerCase().includes(filterResuelta));
        
        return matchClave && matchTipo && matchResumen && matchAsignado && matchPrioridad && 
               matchEstado && matchSprint && matchCreada && matchActualizada && matchResuelta;
    });
    
    renderFilteredIncidentes(filtered);
}

function limpiarFiltros() {
    document.getElementById('filter-clave').value = '';
    document.getElementById('filter-tipo').value = '';
    document.getElementById('filter-resumen').value = '';
    document.getElementById('filter-asignado').value = '';
    document.getElementById('filter-prioridad-col').value = '';
    document.getElementById('filter-estado-col').value = '';
    document.getElementById('filter-sprint-col').value = '';
    document.getElementById('filter-creada').value = '';
    document.getElementById('filter-actualizada').value = '';
    document.getElementById('filter-resuelta').value = '';
    filterIncidentesAvanzado();
}

function renderFilteredIncidentes(filtered) {
    document.getElementById('count-incidentes').textContent = filtered.length;
    
    const tbody = document.getElementById('incidentes-tbody');
    tbody.innerHTML = filtered.map((t, index) => {
        // Usar valores directos sin || que convierte "0" en falsy
        const diasReal = (t.diasResolucionReal !== undefined && t.diasResolucionReal !== null && t.diasResolucionReal !== '') ? t.diasResolucionReal : '';
        const estimado = (t.storyPointEstimate !== undefined && t.storyPointEstimate !== null && t.storyPointEstimate !== '') ? t.storyPointEstimate : '';
        
        // Calcular desviación solo si hay días reales Y estimado
        let desviacion = '';
        let desviacionColor = '';
        let desviacionStyle = '';
        
        if (diasReal !== '' && estimado !== '') {
            const diasRealNum = parseFloat(diasReal);
            const estimadoNum = parseFloat(estimado);
            
            if (!isNaN(diasRealNum) && !isNaN(estimadoNum) && estimadoNum > 0) {
                const desv = ((diasRealNum - estimadoNum) / estimadoNum * 100).toFixed(1);
                desviacion = `${desv > 0 ? '+' : ''}${desv}%`;
                
                // Colores según desviación
                if (desv > 20) {
                    desviacionColor = '#ffcdd2'; // Rojo claro
                    desviacionStyle = 'color: #c62828; font-weight: bold;';
                } else if (desv > 10) {
                    desviacionColor = '#fff9c4'; // Amarillo claro
                    desviacionStyle = 'color: #f57c00; font-weight: bold;';
                } else if (desv < -10) {
                    desviacionColor = '#c8e6c9'; // Verde claro
                    desviacionStyle = 'color: #2e7d32; font-weight: bold;';
                } else {
                    desviacionStyle = 'font-weight: bold;';
                }
            }
        }
        
        // Mostrar fecha resuelta solo si NO está en "Tareas por hacer"
        const fechaResuelta = t.estadoNormalizado === 'Tareas por hacer' ? '' : (t.resuelta || '');
        
        // Resaltar días real según el estado
        let diasRealStyle = 'font-weight: bold;';
        if (t.estadoNormalizado === 'Finalizados') {
            diasRealStyle += ' background-color: #c8e6c9;'; // Verde si finalizado
        } else if (t.estadoNormalizado === 'En Curso') {
            diasRealStyle += ' background-color: #fff9c4;'; // Amarillo si en curso
        }
        
        return `
        <tr data-index="${index}" data-clave="${t.clave}">
            <td contenteditable="true" data-field="clave">${t.clave}</td>
            <td>${t.tipoIncidencia || 'N/A'}</td>
            <td contenteditable="true" data-field="resumen">${t.resumen}</td>
            <td contenteditable="true" data-field="asignado">${t.asignado}</td>
            <td contenteditable="true" data-field="prioridad">${t.prioridad}</td>
            <td data-field="estadoNormalizado">
                <select class="estado-select" onchange="cambiarEstado('${t.clave}', this.value)" style="width: 100%; padding: 5px; border: 1px solid #ddd; border-radius: 4px; background: white;">
                    <option value="Tareas por hacer" ${t.estadoNormalizado === 'Tareas por hacer' ? 'selected' : ''}>Tareas por hacer</option>
                    <option value="En curso" ${t.estadoNormalizado === 'En Curso' ? 'selected' : ''}>En curso</option>
                    <option value="Finalizados" ${t.estadoNormalizado === 'Finalizados' ? 'selected' : ''}>Finalizados</option>
                </select>
            </td>
            <td contenteditable="true" data-field="sprint">${t.sprint}</td>
            <td style="font-size: 0.85em; color: #666;">${t.sprints || t.sprint}</td>
            <td>${t.creada}</td>
            <td>${t.actualizada}</td>
            <td>${fechaResuelta}</td>
            <td style="${diasRealStyle}">${diasReal}</td>
            <td style="background-color: #e3f2fd; font-weight: bold;">${estimado}</td>
            <td style="background-color: ${desviacionColor}; ${desviacionStyle}">${desviacion}</td>
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

function importarCSV(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const text = e.target.result;
            const lines = text.split('\\n').filter(line => line.trim());
            
            if (lines.length < 2) {
                alert('❌ El archivo CSV está vacío o no tiene datos');
                return;
            }
            
            // Saltar la primera línea (encabezados)
            const dataLines = lines.slice(1);
            let importados = 0;
            let errores = 0;
            
            dataLines.forEach((line, index) => {
                try {
                    // Parsear CSV considerando campos entre comillas
                    const campos = [];
                    let campo = '';
                    let dentroComillas = false;
                    
                    for (let i = 0; i < line.length; i++) {
                        const char = line[i];
                        
                        if (char === '"') {
                            dentroComillas = !dentroComillas;
                        } else if (char === ',' && !dentroComillas) {
                            campos.push(campo.trim());
                            campo = '';
                        } else {
                            campo += char;
                        }
                    }
                    campos.push(campo.trim()); // Último campo
                    
                    // Validar que tenga al menos los campos esenciales
                    if (campos.length < 3) {
                        console.warn(`Línea ${index + 2} omitida: datos incompletos`);
                        errores++;
                        return;
                    }
                    
                    const nuevoTicket = {
                        clave: campos[0] || `INC-${Date.now()}-${index}`,
                        resumen: campos[1] || 'Sin resumen',
                        asignado: campos[2] || 'Sin asignar',
                        prioridad: campos[3] || 'Medium',
                        estado: campos[4] || 'Abierto',
                        estadoNormalizado: campos[4] || 'Abierto',
                        sprint: parseInt(campos[5]) || 0,
                        creada: campos[6] || new Date().toLocaleDateString('es-ES'),
                        actualizada: campos[7] || new Date().toLocaleDateString('es-ES'),
                        resuelta: campos[8] || '',
                        diasResolucion: campos[9] || ''
                    };
                    
                    allTickets.push(nuevoTicket);
                    importados++;
                } catch (err) {
                    console.error(`Error en línea ${index + 2}:`, err);
                    errores++;
                }
            });
            
            // Actualizar vistas
            renderIncidentes();
            recalcularKPIs();
            
            // Limpiar el input
            event.target.value = '';
            
            // Mostrar resultado
            if (errores > 0) {
                alert(`✅ Importación completada:\\n${importados} incidentes importados\\n${errores} líneas con errores (ver consola)`);
            } else {
                alert(`✅ ${importados} incidentes importados correctamente`);
            }
        } catch (error) {
            console.error('Error al procesar CSV:', error);
            alert('❌ Error al procesar el archivo CSV: ' + error.message);
        }
    };
    
    reader.onerror = function() {
        alert('❌ Error al leer el archivo');
    };
    
    reader.readAsText(file);
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
        
        // Renderizar contenido específico según la vista
        if (viewName === 'evolucion') {
            renderEvolucion();
        } else if (viewName === 'resumen') {
            updateResumen();
        } else if (viewName === 'incidentes') {
            renderIncidentes();
        } else if (viewName === 'dashboard') {
            updateDashboard();
        }
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

// Hacer funciones accesibles globalmente
window.showKPITickets = showKPITickets;
window.showTipoTickets = showTipoTickets;
window.showTicketModal = showTicketModal;
window.closeTicketModal = closeTicketModal;
console.log('Funciones KPI registradas:', typeof window.showKPITickets, typeof window.showTipoTickets, typeof window.showTicketModal, typeof window.closeTicketModal);

// Cerrar modal al hacer clic fuera
document.addEventListener('click', function(e) {
    const modal = document.getElementById('ticket-modal');
    if (modal && e.target === modal) {
        closeTicketModal();
    }
});

// ==================== MODAL POR PRIORIDAD Y ESTADO ====================

function showTicketDetailsByPriority(prioridad, estado, tipoFiltro, valorFiltro) {
    // Filtrar tickets
    let ticketsFiltrados = allTickets.filter(t => t.prioridad === prioridad);
    
    // Aplicar filtro según el tipo
    if (tipoFiltro === 'sprint' && valorFiltro !== 'all') {
        ticketsFiltrados = ticketsFiltrados.filter(t => t.sprint == valorFiltro);
    } else if (tipoFiltro === 'mes' && valorFiltro !== 'all') {
        ticketsFiltrados = ticketsFiltrados.filter(t => {
            const fecha = parsearFecha(t.creada);
            if (!fecha) return false;
            const mesCreada = fecha.toLocaleString('es-ES', {month: 'long', year: 'numeric'});
            return mesCreada.toLowerCase() === valorFiltro.toLowerCase();
        });
    }
    
    // Filtrar por estado si no es "all"
    let titulo = '';
    let filtroTexto = '';
    
    if (valorFiltro === 'all') {
        filtroTexto = tipoFiltro === 'sprint' ? 'Todos los Sprints' : 'Todos los Meses';
    } else {
        filtroTexto = tipoFiltro === 'sprint' ? `Sprint ${valorFiltro}` : valorFiltro.charAt(0).toUpperCase() + valorFiltro.slice(1);
    }
    
    if (estado === 'all') {
        titulo = `Incidentes ${prioridad} - ${filtroTexto}`;
    } else {
        ticketsFiltrados = ticketsFiltrados.filter(t => t.estadoNormalizado === estado);
        titulo = `Incidentes ${prioridad} - ${estado} - ${filtroTexto}`;
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

// Actualizado: 2026-02-03 17:30:15

// Actualizado con iconos avanzados: 2026-02-03 17:39:46

// Actualizado: 2026-02-03 17:41:53

// Actualizado con Lucide Icons: 2026-02-03 17:46:43


