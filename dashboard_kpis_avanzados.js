// dashboard_kpis_avanzados.js
// Módulo de KPIs Avanzados - FASE 1
// ============================================================================
// Descripción: Lógica para calcular y renderizar KPIs avanzados sin afectar
// el dashboard actual. Incluye Lead Time, Edad de Tickets y Análisis de Errores.
// ============================================================================

// ==================== FUNCIÓN DE PARSEO DE FECHAS ====================

/**
 * Parsea fechas en formato "16/Feb/26" o "16/feb/26 5:11 PM"
 * @param {string} fechaStr - String de fecha
 * @returns {Date|null} Objeto Date o null si no se puede parsear
 */
function parsearFechaAvanzada(fechaStr) {
    if (!fechaStr || fechaStr === '') return null;
    
    const mesesAbrev = {
        'ene': 0, 'jan': 0,
        'feb': 1,
        'mar': 2,
        'abr': 3, 'apr': 3,
        'may': 4,
        'jun': 5,
        'jul': 6,
        'ago': 7, 'aug': 7,
        'sep': 8,
        'oct': 9,
        'nov': 10,
        'dic': 11, 'dec': 11
    };
    
    try {
        // Formato: "15/ene/26 5:11 PM" o "15/Feb/26"
        const partes = fechaStr.split(' ')[0].split('/');
        if (partes.length !== 3) return null;
        
        const dia = parseInt(partes[0]);
        const mesStr = partes[1].toLowerCase();
        const año = parseInt('20' + partes[2]);
        
        const mes = mesesAbrev[mesStr];
        if (mes === undefined) {
            console.warn('[Fecha] Mes no reconocido:', mesStr, 'en fecha:', fechaStr);
            return null;
        }
        
        return new Date(año, mes, dia);
    } catch (e) {
        console.error('[Fecha] Error parseando:', fechaStr, e);
        return null;
    }
}

// ==================== CÁLCULO DE KPIS AVANZADOS ====================

/**
 * Calcula todos los KPIs avanzados basados en los tickets actuales
 * @param {Array} tickets - Array de tickets desde ticketsData
 * @param {string} sprintActual - Sprint a analizar (opcional)
 * @returns {Object} Objeto con todos los KPIs calculados
 */
function calcularKPIsAvanzados(tickets, sprintActual = null) {
    console.log('[KPIs Avanzados] Calculando con', tickets.length, 'tickets');
    
    // Para edad de tickets, mostrar Sprint 34 y 35
    const sprintsAbiertos = ['34', '35'];
    
    return {
        leadTime: calcularLeadTime(tickets, sprintActual),
        edadTickets: calcularEdadTickets(tickets, sprintsAbiertos),
        analisisErrores: calcularAnalisisErrores(tickets),
        sprintActual: sprintActual
    };
}

// ==================== LEAD TIME ====================

/**
 * Calcula métricas de Lead Time (tiempo desde creación hasta resolución)
 * Solo considera tickets FINALIZADOS en el sprint seleccionado
 * @param {Array} tickets - Array de tickets
 * @param {string} sprintActual - Sprint a analizar (ej: '34')
 * @returns {Object} Métricas de Lead Time
 */
function calcularLeadTime(tickets, sprintActual = null) {
    console.log('[Lead Time] Calculando para sprint:', sprintActual || 'todos');
    
    // Filtrar solo tickets finalizados con fechas válidas
    let ticketsFinalizados = tickets.filter(t => {
        if (t.estadoNormalizado !== 'Finalizados') return false;
        if (!t.creada || !t.resuelta || t.resuelta === '') return false;
        
        const creada = parsearFechaAvanzada(t.creada);
        const resuelta = parsearFechaAvanzada(t.resuelta);
        
        return creada && resuelta;
    });
    
    // Si hay sprint específico, filtrar por sprint de finalización
    if (sprintActual) {
        ticketsFinalizados = ticketsFinalizados.filter(t => {
            // El campo sprint puede ser "34" o "Sprint 34"
            const sprintStr = String(t.sprint || '').trim();
            const sprintNum = sprintStr.match(/\d+/) ? sprintStr.match(/\d+/)[0] : '0';
            const match = String(sprintNum) === String(sprintActual);
            return match;
        });
        console.log('[Lead Time] Tickets finalizados en Sprint', sprintActual, ':', ticketsFinalizados.length);
    }
    
    console.log('[Lead Time] Tickets finalizados:', ticketsFinalizados.length);
    
    if (ticketsFinalizados.length === 0) {
        return {
            promedio: 0,
            porSprint: [],
            porPrioridad: [],
            distribucion: [],
            total: 0
        };
    }
    
    // Calcular lead time para cada ticket
    const ticketsConLeadTime = ticketsFinalizados.map(t => {
        const creada = parsearFechaAvanzada(t.creada);
        const resuelta = parsearFechaAvanzada(t.resuelta);
        const dias = Math.round((resuelta - creada) / (1000 * 60 * 60 * 24));
        
        return {
            ...t,
            leadTimeDias: Math.max(0, dias) // No permitir negativos
        };
    });
    
    // Promedio general
    const sumaLeadTime = ticketsConLeadTime.reduce((sum, t) => sum + t.leadTimeDias, 0);
    const promedio = (sumaLeadTime / ticketsConLeadTime.length).toFixed(1);
    
    // Por Sprint
    const porSprint = calcularLeadTimePorSprint(ticketsConLeadTime);
    
    // Por Prioridad
    const porPrioridad = calcularLeadTimePorPrioridad(ticketsConLeadTime);
    
    // Distribución (para gráficos)
    const distribucion = calcularDistribucionLeadTime(ticketsConLeadTime);
    
    return {
        promedio: parseFloat(promedio),
        porSprint,
        porPrioridad,
        distribucion,
        total: ticketsConLeadTime.length
    };
}

/**
 * Calcula Lead Time promedio por Sprint
 */
function calcularLeadTimePorSprint(tickets) {
    const sprints = {};
    
    tickets.forEach(t => {
        // Extraer número de sprint (puede ser "34" o "Sprint 34")
        const sprintStr = String(t.sprint || '').trim();
        const match = sprintStr.match(/(\d+)/);
        const sprintNum = match ? match[1] : null;
        
        if (sprintNum) {
            const key = `Sprint ${sprintNum}`;
            if (!sprints[key]) {
                sprints[key] = { suma: 0, count: 0 };
            }
            sprints[key].suma += t.leadTimeDias;
            sprints[key].count++;
        }
    });
    
    return Object.keys(sprints)
        .sort((a, b) => {
            const numA = parseInt(a.match(/(\d+)/)?.[1] || 0);
            const numB = parseInt(b.match(/(\d+)/)?.[1] || 0);
            return numA - numB;
        })
        .map(sprintKey => ({
            sprint: sprintKey,
            promedio: (sprints[sprintKey].suma / sprints[sprintKey].count).toFixed(1),
            count: sprints[sprintKey].count
        }));
}

/**
 * Calcula Lead Time promedio por Prioridad
 */
function calcularLeadTimePorPrioridad(tickets) {
    const prioridades = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];
    
    return prioridades.map(prioridad => {
        const ticketsPrio = tickets.filter(t => t.prioridad === prioridad);
        if (ticketsPrio.length === 0) {
            return { prioridad, promedio: 0, count: 0 };
        }
        
        const suma = ticketsPrio.reduce((s, t) => s + t.leadTimeDias, 0);
        return {
            prioridad,
            promedio: (suma / ticketsPrio.length).toFixed(1),
            count: ticketsPrio.length
        };
    }).filter(p => p.count > 0);
}

/**
 * Calcula distribución de Lead Time en rangos
 */
function calcularDistribucionLeadTime(tickets) {
    const rangos = [
        { label: '0-3 días', min: 0, max: 3, count: 0 },
        { label: '4-7 días', min: 4, max: 7, count: 0 },
        { label: '8-14 días', min: 8, max: 14, count: 0 },
        { label: '15-30 días', min: 15, max: 30, count: 0 },
        { label: '30+ días', min: 31, max: 999999, count: 0 }
    ];
    
    tickets.forEach(t => {
        const rango = rangos.find(r => t.leadTimeDias >= r.min && t.leadTimeDias <= r.max);
        if (rango) rango.count++;
    });
    
    return rangos;
}

// ==================== EDAD DE TICKETS ====================

/**
 * Estados de interés para tracking (excluir "Tareas por hacer" y "Finalizados")
 * ESTOS SON LOS NOMBRES EXACTOS DEL CHANGELOG
 */
const ESTADOS_TRACKING = [
    'In Process',      // En proceso de desarrollo
    'Blocked',         // Bloqueado
    'CODE REVIEW',     // En revisión de código
    'IN TEST DEV',     // En test de desarrollo
    'In Test',         // En pruebas
    'Test Issues'      // Problemas en test
];

/**
 * Normaliza nombres de estados del changelog
 */
function normalizarEstado(estado) {
    const estadoLower = estado.toLowerCase().trim();
    
    // Mapeo de estados similares a los estados de tracking
    if (estadoLower === 'in progress') return 'In Process';
    if (estadoLower === 'in process') return 'In Process';
    if (estadoLower === 'blocked') return 'Blocked';
    if (estadoLower === 'code review') return 'CODE REVIEW';
    if (estadoLower === 'in test dev' || estadoLower === 'test in dev') return 'IN TEST DEV';
    if (estadoLower === 'in test') return 'In Test';
    if (estadoLower === 'test issues' || estadoLower === 'test issue') return 'Test Issues';
    
    // Retornar el estado original si no hay mapeo
    return estado;
}

/**
 * Calcula días que un ticket pasó en cada estado usando changelog
 */
function calcularDiasPorEstado(issueKey) {
    // Verificar si changelogData está disponible
    if (typeof changelogData === 'undefined') {
        console.error('[calcularDiasPorEstado] changelogData NO está definido en window');
        return {};
    }
    
    if (!changelogData[issueKey]) {
        console.log(`[calcularDiasPorEstado] No hay changelog para ${issueKey}`);
        return {};
    }
    
    const historial = changelogData[issueKey];
    const diasPorEstado = {};
    
    // Inicializar contadores para estados de tracking
    ESTADOS_TRACKING.forEach(estado => {
        diasPorEstado[estado] = 0;
    });
    
    // Sumar días de cada transición
    historial.forEach(transition => {
        const estadoNorm = normalizarEstado(transition.estado);
        if (ESTADOS_TRACKING.includes(estadoNorm)) {
            diasPorEstado[estadoNorm] += transition.dias || 0;
        }
    });
    
    return diasPorEstado;
}

/**
 * Calcula métricas de Edad de Tickets Abiertos con días por estado
 * @param {Array} tickets - Array de tickets
 * @param {Array} sprintsFilter - Sprints a filtrar (ej: ['34', '35'])
 * @returns {Object} Métricas de edad
 */
function calcularEdadTickets(tickets, sprintsFilter = null) {
    console.log('[Edad Tickets] Calculando con changelog...');
    
    // Filtrar solo tickets abiertos (NO finalizados)
    let ticketsAbiertos = tickets.filter(t => 
        t.estadoNormalizado !== 'Finalizados' && t.creada
    );
    
    // Filtrar por sprints si se especifica
    if (sprintsFilter && sprintsFilter.length > 0) {
        ticketsAbiertos = ticketsAbiertos.filter(t => {
            const sprintStr = String(t.sprint || '').trim();
            const match = sprintStr.match(/(\d+)/);
            const sprintNum = match ? match[1] : null;
            return sprintNum && sprintsFilter.includes(sprintNum);
        });
        console.log(`[Edad Tickets] Filtrado por sprints ${sprintsFilter.join(', ')}: ${ticketsAbiertos.length} tickets`);
    }
    
    // NO filtrar por estado actual - el filtro se hace por si pasaron por estados de tracking en changelog
    console.log('[Edad Tickets] Tickets abiertos para analizar:', ticketsAbiertos.length);
    console.log('[Edad Tickets] Tickets abiertos para analizar:', ticketsAbiertos.length);
    
    if (ticketsAbiertos.length === 0) {
        return {
            promedio: 0,
            criticos: [],
            alertas: [],
            normales: [],
            total: 0,
            countCriticos: 0,
            countAlertas: 0,
            countNormales: 0,
            sprints: sprintsFilter || []
        };
    }
    
    const hoy = new Date();
    
    // Verificar disponibilidad de changelogData
    console.log('[Edad Tickets] changelogData disponible:', typeof changelogData !== 'undefined');
    if (typeof changelogData !== 'undefined') {
        const claves = Object.keys(changelogData);
        console.log('[Edad Tickets] Total tickets en changelog:', claves.length);
        console.log('[Edad Tickets] Primeros 3 tickets:', claves.slice(0, 3));
    }
    
    // Calcular edad y días por estado para cada ticket
    const ticketsConInfo = ticketsAbiertos.map(t => {
        const creada = parsearFechaAvanzada(t.creada);
        const edadDias = Math.round((hoy - creada) / (1000 * 60 * 60 * 24));
        const diasPorEstado = calcularDiasPorEstado(t.clave);
        
        // Calcular días totales en estados de tracking
        const diasEnTracking = Object.values(diasPorEstado).reduce((sum, dias) => sum + dias, 0);
        
        // Debug para primeros 3 tickets
        if (ticketsAbiertos.indexOf(t) < 3) {
            console.log(`[Edad Tickets] Ticket ${t.clave}: diasEnTracking = ${diasEnTracking}`, diasPorEstado);
        }
        
        return {
            ...t,
            edadDias: Math.max(0, edadDias),
            diasPorEstado: diasPorEstado,
            diasEnTracking: Math.round(diasEnTracking)
        };
    })
    .filter(t => t.diasEnTracking > 0) // Solo mostrar tickets que pasaron por estados de tracking
    .sort((a, b) => b.diasEnTracking - a.diasEnTracking); // Ordenar por días en tracking DESC
    
    console.log('[Edad Tickets] Tickets con días en tracking:', ticketsConInfo.length);
    console.log('[Edad Tickets] Tickets con días en tracking:', ticketsConInfo.length);
    
    if (ticketsConInfo.length === 0) {
        return {
            promedio: 0,
            criticos: [],
            alertas: [],
            normales: [],
            total: 0,
            countCriticos: 0,
            countAlertas: 0,
            countNormales: 0,
            sprints: sprintsFilter || [],
            estados: ESTADOS_TRACKING
        };
    }
    
    // Promedio de días en tracking
    const sumaDias = ticketsConInfo.reduce((sum, t) => sum + t.diasEnTracking, 0);
    const promedio = (sumaDias / ticketsConInfo.length).toFixed(1);
    
    // Clasificar por criticidad (basado en días en tracking)
    // Crítico: >= 15 días
    // Alerta: >= 8 días y < 15 días  
    // Normal: < 8 días
    const criticos = ticketsConInfo.filter(t => t.diasEnTracking >= 15);
    const alertas = ticketsConInfo.filter(t => t.diasEnTracking >= 8 && t.diasEnTracking < 15);
    const normales = ticketsConInfo.filter(t => t.diasEnTracking < 8);
    
    return {
        promedio: parseFloat(promedio),
        criticos: criticos,
        alertas: alertas,
        normales: normales,
        total: ticketsConInfo.length,
        countCriticos: criticos.length,
        countAlertas: alertas.length,
        countNormales: normales.length,
        sprints: sprintsFilter || [],
        estados: ESTADOS_TRACKING
    };
}

// ==================== ANÁLISIS DE ERRORES ====================

/**
 * Calcula análisis de Errores vs Tareas/HU por Sprint
 * @param {Array} tickets - Array de tickets
 * @returns {Object} Análisis de errores
 */
function calcularAnalisisErrores(tickets) {
    console.log('[Análisis Errores] Calculando...');
    
    // FILTRO CRÍTICO: Solo tickets finalizados o en curso (NO "Tareas por hacer")
    const ticketsValidos = tickets.filter(t => {
        const estadoNorm = (t.estadoNormalizado || '').toLowerCase();
        const excluirEstados = ['tareas por hacer', 'to do', 'backlog'];
        return !excluirEstados.some(estado => estadoNorm.includes(estado));
    });
    
    console.log(`[Análisis Errores] Tickets totales: ${tickets.length}, Tickets válidos (sin "Por hacer"): ${ticketsValidos.length}`);
    
    // Agrupar por Sprint solo los tickets válidos
    const porSprint = agruparPorSprint(ticketsValidos);
    
    // Calcular análisis para cada sprint (EXCLUYENDO Sprint 30)
    const analisisSprints = Object.keys(porSprint)
        .filter(sprint => {
            // Extraer el número del string "Sprint 35" -> 35
            const num = parseInt(sprint.replace('Sprint ', ''));
            return num >= 31;
        })
        .sort((a, b) => {
            // Orden descendente: más reciente primero (36, 35, 34, 33...)
            const numA = parseInt(a.replace('Sprint ', ''));
            const numB = parseInt(b.replace('Sprint ', ''));
            return numB - numA;
        })
        .map(sprint => {
            const ticketsSprint = porSprint[sprint];
            
            // Extraer número del sprint para uso posterior
            const sprintNum = sprint.replace('Sprint ', '');
            
            // EXCLUIR Epics y otros tipos que no son trabajo real
            const ticketsReales = ticketsSprint.filter(t => {
                const tipo = (t.tipoIncidencia || '').toLowerCase();
                return !tipo.includes('epic') && !tipo.includes('spike') && !tipo.includes('subtarea');
            });
            
            const bugs = ticketsReales.filter(t => 
                t.tipoIncidencia && (
                    t.tipoIncidencia.toLowerCase().includes('bug') ||
                    t.tipoIncidencia.toLowerCase().includes('error') ||
                    t.tipoIncidencia.toLowerCase() === 'defect'
                )
            );
            
            const tasks = ticketsReales.filter(t => 
                t.tipoIncidencia && (
                    t.tipoIncidencia.toLowerCase().includes('task') ||
                    t.tipoIncidencia.toLowerCase().includes('tarea')
                )
            );
            
            const stories = ticketsReales.filter(t => 
                t.tipoIncidencia && (
                    t.tipoIncidencia.toLowerCase().includes('story') ||
                    t.tipoIncidencia.toLowerCase().includes('historia')
                )
            );
            
            const otros = ticketsReales.filter(t => 
                !bugs.includes(t) && !tasks.includes(t) && !stories.includes(t)
            );
            
            const total = ticketsReales.length;
            const funcionalidades = tasks.length + stories.length;
            const porcentajeBugs = total > 0 
                ? ((bugs.length / total) * 100).toFixed(1)
                : 0;
            
            console.log(`[Sprint ${sprint}] Total: ${total}, Bugs: ${bugs.length}, Tasks: ${tasks.length}, Stories: ${stories.length}, Otros: ${otros.length}, % Bugs: ${porcentajeBugs}%`);
            
            return {
                sprint: sprint, // "Sprint 35"
                sprintNum: sprintNum, // "35"
                bugs: {
                    count: bugs.length,
                    percent: ((bugs.length / total) * 100).toFixed(1),
                    tickets: bugs
                },
                tasks: {
                    count: tasks.length,
                    percent: ((tasks.length / total) * 100).toFixed(1),
                    tickets: tasks
                },
                stories: {
                    count: stories.length,
                    percent: ((stories.length / total) * 100).toFixed(1),
                    tickets: stories
                },
                otros: {
                    count: otros.length,
                    percent: ((otros.length / total) * 100).toFixed(1)
                },
                total,
                bugPercentage: parseFloat(porcentajeBugs)
            };
        });
    
    // Calcular tendencia (últimos 3 sprints)
    const ultimos3 = analisisSprints.slice(-3);
    const tendencia = calcularTendenciaErrores(ultimos3);
    
    // Resumen general (usando solo tickets válidos)
    const totalBugs = ticketsValidos.filter(t => 
        t.tipoIncidencia && (
            t.tipoIncidencia.toLowerCase().includes('bug') ||
            t.tipoIncidencia.toLowerCase().includes('error')
        )
    ).length;
    
    const totalFuncionalidades = ticketsValidos.filter(t => 
        t.tipoIncidencia && (
            t.tipoIncidencia.toLowerCase().includes('task') ||
            t.tipoIncidencia.toLowerCase().includes('tarea') ||
            t.tipoIncidencia.toLowerCase().includes('story') ||
            t.tipoIncidencia.toLowerCase().includes('historia')
        )
    ).length;
    
    console.log(`[Análisis Errores] Resumen Global: Bugs: ${totalBugs}, Funcionalidades: ${totalFuncionalidades}`);
    
    return {
        porSprint: analisisSprints,
        tendencia,
        resumen: {
            totalBugs,
            totalFuncionalidades,
            ratioGlobal: totalFuncionalidades > 0 
                ? (totalBugs / totalFuncionalidades).toFixed(2)
                : 0
        }
    };
}

/**
 * Calcula tendencia de errores
 */
function calcularTendenciaErrores(sprints) {
    if (sprints.length < 2) return 'Insuficientes datos';
    
    const primero = parseFloat(sprints[0].ratio);
    const ultimo = parseFloat(sprints[sprints.length - 1].ratio);
    
    const cambio = ((ultimo - primero) / primero) * 100;
    
    if (cambio < -10) return 'Mejorando significativamente ⬇️';
    if (cambio < 0) return 'Mejorando ⬇️';
    if (cambio < 10) return 'Estable →';
    return 'Empeorando ⬆️';
}

/**
 * Agrupa tickets por número de Sprint
 */
function agruparPorSprint(tickets) {
    const grupos = {};
    
    tickets.forEach(t => {
        // Extraer número de sprint del campo sprint (puede ser "34" o "Sprint 34")
        const sprintStr = String(t.sprint || '').trim();
        const match = sprintStr.match(/(\d+)/);
        const sprintNum = match ? match[1] : null;
        
        if (sprintNum) {
            const key = `Sprint ${sprintNum}`;
            if (!grupos[key]) {
                grupos[key] = [];
            }
            grupos[key].push(t);
        }
    });
    
    return grupos;
}

/**
 * Extrae número de sprint de un string como "Invox Medical Suite-Sprint 30"
 */
function extraerNumeroSprint(sprintStr) {
    if (!sprintStr) return '0';
    const match = sprintStr.match(/Sprint[^\d]*(\d+)/i);
    return match ? match[1] : '0';
}

// ==================== RENDERIZADO DE KPIS AVANZADOS ====================

/**
 * Renderiza el dashboard completo de KPIs Avanzados
 * @param {Object} kpis - Objeto con todos los KPIs calculados
 */
function renderKPIsAvanzados(kpis) {
    const container = document.getElementById('kpis-avanzados-content');
    
    if (!container) {
        console.error('[KPIs Avanzados] Contenedor no encontrado');
        return;
    }
    
    const html = `
        <div class="kpis-avanzados-header">
            <h1>
                <i data-lucide="trending-up" style="display: inline-block; width: 32px; height: 32px; margin-right: 12px; color: #6C5CE7; vertical-align: middle;"></i>
                KPIs Avanzados - Análisis de Calidad
            </h1>
            <p class="subtitle">Métricas avanzadas para análisis profundo de gestión de calidad</p>
        </div>
        
        ${renderLeadTimeSection(kpis.leadTime, kpis.sprintActual)}
        ${renderEdadTicketsSection(kpis.edadTickets)}
        ${renderAnalisisErroresSection(kpis.analisisErrores)}
    `;
    
    container.innerHTML = html;
    
    // Inicializar iconos de Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    console.log('[KPIs Avanzados] Renderizado completado');
}

// ==================== SECCIÓN LEAD TIME ====================

function renderLeadTimeSection(leadTime, sprintActual) {
    const subtituloSprint = sprintActual ? `Sprint ${sprintActual}` : 'Todos los Sprints';
    
    if (!leadTime || leadTime.total === 0) {
        return `
            <div class="kpi-section-avanzado">
                <div class="section-header-avanzado collapsible" onclick="toggleSection('leadtime-content')">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span class="collapse-icon" id="icon-leadtime-content">▼</span>
                        <h2>
                            <i data-lucide="clock" style="display: inline-block; width: 24px; height: 24px; margin-right: 8px; color: #6C5CE7; vertical-align: middle;"></i>
                            Lead Time Analysis
                        </h2>
                    </div>
                </div>
                <div class="section-content-avanzado" id="leadtime-content">
                    <p class="no-data">No hay suficientes datos de tickets finalizados para calcular Lead Time.</p>
                </div>
            </div>
        `;
    }
    
    return `
        <div class="kpi-section-avanzado">
            <div class="section-header-avanzado collapsible" onclick="toggleSection('leadtime-content')">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span class="collapse-icon" id="icon-leadtime-content">▼</span>
                    <h2>
                        <i data-lucide="clock" style="display: inline-block; width: 24px; height: 24px; margin-right: 8px; color: #6C5CE7; vertical-align: middle;"></i>
                        Lead Time Analysis
                    </h2>
                </div>
                <span class="badge-info">${leadTime.total} tickets analizados</span>
            </div>
            
            <div class="section-content-avanzado" id="leadtime-content">
            <div class="kpi-cards-grid-3">
                <div class="kpi-card-avanzado kpi-highlight">
                    <div class="kpi-icon-circle" style="background: linear-gradient(135deg, #667EEA, #764BA2);">
                        <i data-lucide="target"></i>
                    </div>
                    <div class="kpi-content-avanzado">
                        <div class="kpi-label-avanzado">Lead Time Promedio</div>
                        <div class="kpi-value-large">${leadTime.promedio} <span class="kpi-unit">días</span></div>
                        <div class="kpi-meta">Tiempo creación → finalización</div>
                        <div class="kpi-subtitle" style="margin-top: 8px; font-size: 0.85em; color: rgba(255,255,255,0.8); font-weight: 500;">${subtituloSprint}</div>
                    </div>
                </div>
                
                ${renderLeadTimePorPrioridad(leadTime.porPrioridad)}
            </div>
            
            <div class="chart-container-avanzado">
                <h3>Lead Time por Sprint</h3>
                ${renderLeadTimeSprintChart(leadTime.porSprint)}
            </div>
            
            <div class="chart-container-avanzado">
                <h3>Distribución de Lead Time</h3>
                ${renderLeadTimeDistribucionChart(leadTime.distribucion, leadTime.ticketsConLeadTime, sprintActual)}
            </div>
            </div>
        </div>
    `;
}

function renderLeadTimePorPrioridad(porPrioridad) {
    const colores = {
        'Highest': '#E91E63',
        'High': '#FF5722',
        'Medium': '#2196F3',
        'Low': '#4CAF50',
        'Lowest': '#9E9E9E'
    };
    
    return porPrioridad.slice(0, 2).map(p => `
        <div class="kpi-card-avanzado">
            <div class="kpi-icon-circle" style="background: ${colores[p.prioridad]};">
                <i data-lucide="zap"></i>
            </div>
            <div class="kpi-content-avanzado">
                <div class="kpi-label-avanzado">${p.prioridad}</div>
                <div class="kpi-value-medium">${p.promedio} <span class="kpi-unit">días</span></div>
                <div class="kpi-meta">${p.count} tickets</div>
            </div>
        </div>
    `).join('');
}

function renderLeadTimeSprintChart(porSprint) {
    if (!porSprint || porSprint.length === 0) {
        return '<p class="no-data">No hay datos por sprint</p>';
    }
    
    const maxValue = Math.max(...porSprint.map(s => parseFloat(s.promedio)));
    
    return `
        <div class="bar-chart-horizontal">
            ${porSprint.map(sprint => {
                const width = (parseFloat(sprint.promedio) / maxValue) * 100;
                const color = parseFloat(sprint.promedio) > 10 ? '#FF5722' : '#4CAF50';
                
                return `
                    <div class="bar-row">
                        <div class="bar-label">${sprint.sprint}</div>
                        <div class="bar-container">
                            <div class="bar-fill" style="width: ${width}%; background: ${color};"></div>
                            <span class="bar-value">${sprint.promedio} días</span>
                        </div>
                        <div class="bar-meta">${sprint.count} tickets</div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function renderLeadTimeDistribucionChart(distribucion, ticketsConLeadTime, sprintActual) {
    const total = distribucion.reduce((sum, r) => sum + r.count, 0);
    
    return `
        <div class="distribution-chart">
            ${distribucion.map((rango, index) => {
                const percent = total > 0 ? ((rango.count / total) * 100).toFixed(1) : 0;
                
                return `
                    <div class="distribution-item" style="cursor: pointer;" 
                         onclick="window.mostrarTicketsRango('${rango.label}', ${rango.min}, ${rango.max}, '${sprintActual || ''}')" 
                         title="Click para ver los ${rango.count} tickets">
                        <div class="distribution-bar" style="width: ${percent}%; transition: opacity 0.2s;" 
                             onmouseover="this.style.opacity='0.8'" 
                             onmouseout="this.style.opacity='1'">
                            <span class="distribution-label">${rango.label}</span>
                        </div>
                        <div class="distribution-value">${rango.count} <span class="small">(${percent}%)</span></div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// ==================== SECCIÓN EDAD DE TICKETS ====================

function renderEdadTicketsSection(edadTickets) {
    if (!edadTickets || edadTickets.total === 0) {
        return `
            <div class="kpi-section-avanzado">
                <div class="section-header-avanzado collapsible" onclick="toggleSection('edad-content')">
                <div style="display: flex; align-items: center; gap: 12px;">
                <span class="collapse-icon" id="icon-edad-content">▼</span>
                <h2><i data-lucide="calendar" style="display: inline-block; width: 24px; height: 24px; margin-right: 8px; color: #FF9800; vertical-align: middle;"></i> Edad de Tickets Abiertos</h2>
                </div>
                </div>
                <div class="section-content-avanzado" id="edad-content">
                <p class="no-data">No hay tickets abiertos en los sprints ${edadTickets.sprints.join(', ')} en estados de tracking.</p>
                </div>
            </div>
        `;
    }
    
    const sprintsText = edadTickets.sprints.length > 0 ? `Sprint ${edadTickets.sprints.join(' y ')}` : 'Todos los sprints';
    
    return `
        <div class="kpi-section-avanzado">
            <div class="section-header-avanzado collapsible" onclick="toggleSection('edad-content')">
                <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                    <span class="collapse-icon" id="icon-edad-content">▼</span>
                    <h2>
                        <i data-lucide="calendar" style="display: inline-block; width: 24px; height: 24px; margin-right: 8px; color: #FF9800; vertical-align: middle;"></i>
                        Edad de Tickets Abiertos
                    </h2>
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <span class="badge-info">${edadTickets.total} tickets</span>
                    <span class="badge-info">${sprintsText}</span>
                </div>
            </div>
            
            <div class="section-content-avanzado" id="edad-content">
                <div class="kpi-cards-grid-4">
                    <div class="kpi-card-avanzado">
                        <div class="kpi-content-avanzado">
                            <div class="kpi-label-avanzado">Promedio en Tracking</div>
                            <div class="kpi-value-medium">${edadTickets.promedio} <span class="kpi-unit">días</span></div>
                        </div>
                    </div>
                    
                    <div class="kpi-card-avanzado ${edadTickets.countCriticos > 0 ? 'kpi-critical' : ''}">
                        <div class="kpi-content-avanzado">
                            <div class="kpi-label-avanzado">🔴 Críticos (≥15 días)</div>
                            <div class="kpi-value-medium">${edadTickets.countCriticos}</div>
                        </div>
                    </div>
                    
                    <div class="kpi-card-avanzado ${edadTickets.countAlertas > 0 ? 'kpi-warning' : ''}">
                        <div class="kpi-content-avanzado">
                            <div class="kpi-label-avanzado">🟡 Alertas (8-14 días)</div>
                            <div class="kpi-value-medium">${edadTickets.countAlertas}</div>
                        </div>
                    </div>
                    
                    <div class="kpi-card-avanzado kpi-success">
                        <div class="kpi-content-avanzado">
                            <div class="kpi-label-avanzado">🟢 Normales (<8 días)</div>
                            <div class="kpi-value-medium">${edadTickets.countNormales}</div>
                        </div>
                    </div>
                </div>
                
                ${edadTickets.countCriticos > 0 ? renderTicketsPorEstado(edadTickets.criticos, 'Críticos', 'critical', edadTickets.estados) : ''}
                ${edadTickets.countAlertas > 0 ? renderTicketsPorEstado(edadTickets.alertas, 'Alertas', 'warning', edadTickets.estados) : ''}
                ${edadTickets.countNormales > 0 && edadTickets.countNormales <= 20 ? renderTicketsPorEstado(edadTickets.normales, 'Normales', 'success', edadTickets.estados) : ''}
            </div>
        </div>
    `;
}

function renderTicketsPorEstado(tickets, categoria, cssClass, estados) {
    const emojis = {
        'Críticos': '🔴',
        'Alertas': '🟡',
        'Normales': '🟢'
    };
    
    const criterios = {
        'Críticos': '≥15 días',
        'Alertas': '8-14 días',
        'Normales': '<8 días'
    };
    
    const uniqueId = `tickets-${cssClass}`;
    
    return `
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div class="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors duration-150" onclick="toggleSection('${uniqueId}')">
                <h3 class="text-base font-semibold text-gray-800 flex items-center gap-2 m-0">
                    <span class="collapse-icon text-sm transition-transform duration-200" id="icon-${uniqueId}">▼</span>
                    ${emojis[categoria]} Tickets ${categoria}
                </h3>
            </div>
            <div id="${uniqueId}" class="overflow-hidden">
                <div class="overflow-x-auto p-5 pt-0">
                    <table class="w-full border-collapse">
                        <thead>
                            <tr class="bg-gray-50 border-b border-gray-200">
                                <th class="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Ticket</th>
                                <th class="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Asignado</th>
                                <th class="text-center py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Total</th>
                                ${estados.map(estado => `<th class="text-center py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">${estado.replace('CODE REVIEW', 'Code Review').replace('IN TEST DEV', 'Test in Dev')}</th>`).join('')}
                                <th class="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Estado Actual</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            ${tickets.map(t => {
                                const totalDias = t.diasEnTracking || 0;
                                const rowClass = totalDias >= 15 ? 'bg-red-50 hover:bg-red-100' : totalDias >= 8 ? 'bg-yellow-50 hover:bg-yellow-100' : 'hover:bg-gray-50';
                                
                                return `
                                    <tr class="${rowClass} transition-colors duration-150">
                                        <td class="py-3 px-4 font-semibold"><a href="#" onclick="mostrarDetalleTicket('${t.clave}', event); return false;" class="text-blue-600 hover:text-blue-800 no-underline cursor-pointer">${t.clave}</a></td>
                                        <td class="py-3 px-4 text-gray-700">${t.asignado || 'Sin asignar'}</td>
                                        <td class="py-3 px-4 text-center font-bold text-gray-900">${totalDias}</td>
                                        ${estados.map(estado => {
                                            const dias = t.diasPorEstado[estado] || 0;
                                            const diasRedondeados = Math.round(dias);
                                            const cellClass = diasRedondeados > 0 ? 'bg-green-100 font-semibold text-green-800' : 'bg-gray-50 text-gray-400';
                                            return `<td class="py-3 px-4 text-center ${cellClass}">${diasRedondeados > 0 ? diasRedondeados : '-'}</td>`;
                                        }).join('')}
                                        <td class="py-3 px-4"><span class="inline-block px-3 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded">${t.estado || t.estadoNormalizado}</span></td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// Remover funciones antiguas no necesarias
function renderTicketsCriticos_OLD(tickets) {
    // Esta función ya no se usa
}

function renderTicketsAlertas_OLD(tickets) {
    // Esta función ya no se usa
}

// ==================== SECCIÓN ANÁLISIS DE ERRORES ====================

function renderAnalisisErroresSection(analisis) {
    if (!analisis || !analisis.porSprint || analisis.porSprint.length === 0) {
        return `
            <div class="kpi-section-avanzado">
                <h2><i data-lucide="bug"></i> Análisis de Errores</h2>
                <p class="no-data">No hay suficientes datos para análisis de errores.</p>
            </div>
        `;
    }
    
    return `
        <div class="kpi-section-avanzado">
            <div class="section-header-avanzado collapsible" onclick="toggleSection('errores-content')">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span class="collapse-icon" id="icon-errores-content">▼</span>
                    <h2>
                        <i data-lucide="bug" style="display: inline-block; width: 24px; height: 24px; margin-right: 8px; color: #F44336; vertical-align: middle;"></i>
                        Análisis de Errores vs Funcionalidad
                    </h2>
                </div>
            </div>
            
            <div class="section-content-avanzado" id="errores-content">
                <div class="chart-container-avanzado">
                    <h3>Distribución por Sprint</h3>
                    ${renderErroresSprintChart(analisis.porSprint)}
                </div>
                
                <div class="chart-container-avanzado">
                    <div class="collapsible-header" onclick="toggleSection('errores-detalle')" style="cursor: pointer; user-select: none; display: flex; align-items: center; gap: 8px; margin-bottom: 15px;">
                        <span class="collapse-icon" id="icon-errores-detalle">▼</span>
                        <h3 style="margin: 0;">Detalles por Sprint</h3>
                    </div>
                    <div id="errores-detalle" class="collapsible-content">
                        ${renderErroresDetalleTable(analisis.porSprint)}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderErroresSprintChart(sprints) {
    return `
        <div class="stacked-bar-chart">
            ${sprints.map(sprint => {
                const funcionalidadesPercent = (parseFloat(sprint.tasks.percent) + parseFloat(sprint.stories.percent)).toFixed(1);
                const funcionalidadesCount = sprint.tasks.count + sprint.stories.count;
                
                return `
                <div class="stacked-bar-row">
                    <div class="stacked-bar-label">${sprint.sprint}</div>
                    <div class="stacked-bar-container">
                        <div class="stacked-bar-segment" 
                             style="width: ${sprint.bugs.percent}%; background: #F44336;" 
                             title="Bugs: ${sprint.bugs.count} (${sprint.bugs.percent}%)">
                            ${sprint.bugs.percent}%
                        </div>
                        <div class="stacked-bar-segment" 
                             style="width: ${funcionalidadesPercent}%; background: #4CAF50;" 
                             title="Funcionalidades: ${funcionalidadesCount} (${funcionalidadesPercent}%)">
                            ${funcionalidadesPercent}%
                        </div>
                        ${sprint.otros.count > 0 ? `
                            <div class="stacked-bar-segment" 
                                 style="width: ${sprint.otros.percent}%; background: #9E9E9E;" 
                                 title="Otros: ${sprint.otros.count} (${sprint.otros.percent}%)">
                                ${sprint.otros.percent}%
                            </div>
                        ` : ''}
                    </div>
                </div>
            `}).join('')}
        </div>
        <div class="chart-legend">
            <span class="legend-item"><span class="legend-color" style="background: #F44336;"></span> Bugs</span>
            <span class="legend-item"><span class="legend-color" style="background: #4CAF50;"></span> Tasks + Stories</span>
        </div>
    `;
}

function renderErroresDetalleTable(sprints) {
    // Guardar datos en variable global para popups
    window.erroresSprintsData = sprints;
    
    return `
        <table class="kpi-table-modern">
            <thead>
                <tr>
                    <th>Sprint</th>
                    <th>Bugs</th>
                    <th>Tasks</th>
                    <th>Historias de Usuario</th>
                    <th>Total</th>
                    <th>% Bugs</th>
                </tr>
            </thead>
            <tbody>
                ${sprints.map((sprint, idx) => {
                    return `
                        <tr>
                            <td><strong>${sprint.sprint}</strong></td>
                            <td>
                                <span class="badge-error clickable-value" onclick="mostrarTicketsPorTipo('${sprint.sprintNum}', 'bugs')" style="cursor: pointer;">
                                    ${sprint.bugs.count}
                                </span> ${sprint.bugs.percent}%
                            </td>
                            <td>
                                <span class="badge-info clickable-value" onclick="mostrarTicketsPorTipo('${sprint.sprintNum}', 'tasks')" style="cursor: pointer;">
                                    ${sprint.tasks.count}
                                </span> ${sprint.tasks.percent}%
                            </td>
                            <td>
                                <span class="badge-success clickable-value" onclick="mostrarTicketsPorTipo('${sprint.sprintNum}', 'stories')" style="cursor: pointer;">
                                    ${sprint.stories.count}
                                </span> ${sprint.stories.percent}%
                            </td>
                            <td><strong>${sprint.total}</strong></td>
                            <td class="${sprint.bugPercentage > 25 ? 'text-danger' : sprint.bugPercentage > 15 ? 'text-warning' : 'text-success'}">
                                <strong>${sprint.bugPercentage}%</strong>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

// ==================== UTILIDADES ====================

/**
 * Trunca un texto a una longitud máxima
 */
function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Actualiza la vista de KPIs Avanzados
 */
function actualizarKPIsAvanzados() {
    console.log('[KPIs Avanzados] Actualizando vista...');
    
    // Verificar que hay tickets disponibles (usar allTickets o ticketsData)
    const ticketsSource = (typeof allTickets !== 'undefined' && allTickets.length > 0) ? allTickets : 
                         (typeof ticketsData !== 'undefined' ? ticketsData : []);
    
    if (!Array.isArray(ticketsSource) || ticketsSource.length === 0) {
        console.error('[KPIs Avanzados] No hay datos de tickets disponibles');
        document.getElementById('kpis-avanzados-content').innerHTML = 
            '<div style="padding: 40px; text-align: center; color: red;">' +
            '<h3>Error: No se encontraron datos de tickets</h3>' +
            '<p>Asegúrate de que dashboard_data.js esté cargado correctamente.</p>' +
            '</div>';
        return;
    }
    
    console.log('[KPIs Avanzados] Datos disponibles:', ticketsSource.length, 'tickets');
    
    // Para KPIs Avanzados, usar TODOS los tickets para análisis global
    // (Los KPIs se encargan internamente de agrupar por sprint)
    let tickets = [...ticketsSource];
    
    console.log('[KPIs Avanzados] Usando todos los tickets para análisis:', tickets.length);
    
    // Detectar sprint actual del filtro principal
    const tipoFiltro = document.getElementById('filter-type-selector')?.value;
    const valorFiltro = document.getElementById('filter-value-selector')?.value;
    const sprintActual = (tipoFiltro === 'sprint' && valorFiltro !== 'all') ? valorFiltro : null;
    
    console.log('[KPIs Avanzados] Sprint seleccionado:', sprintActual || 'Todos');
    
    // Calcular y renderizar
    const kpis = calcularKPIsAvanzados(tickets, sprintActual);
    renderKPIsAvanzados(kpis);
}

// ==================== FUNCIONES DE UI ====================

/**
 * Toggle para mostrar/ocultar secciones
 */
function toggleSection(contentId) {
    const content = document.getElementById(contentId);
    const icon = document.getElementById('icon-' + contentId);
    
    if (!content || !icon) {
        console.error('No se encontró el elemento:', contentId);
        return;
    }
    
    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block';
        icon.textContent = '▼';
    } else {
        content.style.display = 'none';
        icon.textContent = '▶';
    }
}

/**
 * Muestra los tickets de un rango específico de Lead Time en un modal popup
 */
function mostrarTicketsRango(label, min, max, sprintActual) {
    console.log('[Modal] mostrarTicketsRango llamado con:', { label, min, max, sprintActual });
    
    // Obtener los KPIs actuales
    const ticketsSource = (typeof allTickets !== 'undefined' && allTickets.length > 0) ? allTickets : 
                         (typeof ticketsData !== 'undefined' ? ticketsData : []);
    
    // Calcular lead time para todos los tickets finalizados
    let ticketsConLeadTime = ticketsSource.filter(t => {
        if (t.estadoNormalizado !== 'Finalizados') return false;
        if (!t.creada || !t.resuelta || t.resuelta === '') return false;
        return true;
    }).map(t => {
        const creada = parsearFechaAvanzada(t.creada);
        const resuelta = parsearFechaAvanzada(t.resuelta);
        const dias = Math.round((resuelta - creada) / (1000 * 60 * 60 * 24));
        return { ...t, leadTimeDias: Math.max(0, dias) };
    });
    
    // Filtrar por sprint si se especificó
    if (sprintActual && sprintActual !== '') {
        console.log('[Modal] Filtrando por sprint:', sprintActual);
        ticketsConLeadTime = ticketsConLeadTime.filter(t => {
            const sprintStr = String(t.sprint || '').trim();
            const sprintNum = sprintStr.match(/\d+/) ? sprintStr.match(/\d+/)[0] : '0';
            return String(sprintNum) === String(sprintActual);
        });
        console.log('[Modal] Tickets después de filtro de sprint:', ticketsConLeadTime.length);
    }
    
    // Filtrar por rango
    console.log('[Modal] Total tickets con lead time:', ticketsConLeadTime.length);
    console.log('[Modal] Filtrando por rango - min:', min, 'max:', max);
    
    const ticketsEnRango = ticketsConLeadTime.filter(t => {
        const enRango = t.leadTimeDias >= min && t.leadTimeDias <= max;
        return enRango;
    });
    
    console.log('[Modal] Tickets encontrados en rango:', ticketsEnRango.length);
    console.log('[Modal] Primeros 5 tickets:', ticketsEnRango.slice(0, 5).map(t => ({ clave: t.clave, leadTime: t.leadTimeDias })));
    
    if (ticketsEnRango.length === 0) {
        alert('No hay tickets en este rango');
        return;
    }
    
    // Eliminar cualquier modal previo
    const modalPrevio = document.getElementById('tickets-modal');
    if (modalPrevio) {
        console.log('[Modal] Eliminando modal previo...');
        modalPrevio.remove();
    }
    
    console.log('[Modal] Creando modal HTML con', ticketsEnRango.length, 'tickets...');
    
    // Crear modal
    const modalHTML = `
        <div class="modal-overlay" id="tickets-modal" onclick="window.cerrarModalTickets(event)">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2>📊 Tickets en rango: ${label}</h2>
                    <button class="modal-close" onclick="window.cerrarModalTickets()">&times;</button>
                </div>
                <div class="modal-body">
                    <p class="modal-info"><strong>${ticketsEnRango.length}</strong> tickets encontrados</p>
                    <div class="modal-table-wrapper">
                        <table class="kpi-table-modern">
                            <thead>
                                <tr>
                                    <th>Clave</th>
                                    <th>Resumen</th>
                                    <th>Tipo</th>
                                    <th>Prioridad</th>
                                    <th>Sprint</th>
                                    <th>Lead Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${ticketsEnRango.map(t => `
                                    <tr>
                                        <td><strong>${t.clave}</strong></td>
                                        <td>${truncateText(t.resumen, 60)}</td>
                                        <td>${t.tipoIncidencia || t.tipo || '-'}</td>
                                        <td><span class="priority-badge priority-${(t.prioridad || 'medium').toLowerCase()}">${t.prioridad || '-'}</span></td>
                                        <td>Sprint ${t.sprint}</td>
                                        <td class="text-center"><strong>${t.leadTimeDias} días</strong></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn" onclick="window.cerrarModalTickets()">Cerrar</button>
                </div>
            </div>
        </div>
    `;
    
    console.log('[Modal] HTML generado, longitud:', modalHTML.length, 'caracteres');
    
    console.log('[Modal] HTML generado, longitud:', modalHTML.length, 'caracteres');
    console.log('[Modal] Insertando modal en body...');
    
    // Insertar modal en el body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    console.log('[Modal] Modal insertado correctamente');
    
    // Verificar que el modal existe en el DOM y contar filas
    const modalElement = document.getElementById('tickets-modal');
    if (modalElement) {
        const filas = modalElement.querySelectorAll('tbody tr');
        console.log('[Modal] Modal encontrado en DOM');
        console.log('[Modal] Filas de tickets en la tabla:', filas.length);
        console.log('[Modal] Esperadas:', ticketsEnRango.length);
        
        if (filas.length !== ticketsEnRango.length) {
            console.error('[Modal] ¡DISCREPANCIA! Filas en tabla:', filas.length, 'vs Tickets filtrados:', ticketsEnRango.length);
        }
    } else {
        console.error('[Modal] Modal NO encontrado en DOM!');
    }
    
    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';
}

/**
 * Muestra popup con tickets filtrados por tipo (bugs, tasks, stories)
 * @param {string} sprintNum - Número del sprint
 * @param {string} tipo - Tipo de tickets: 'bugs', 'tasks', 'stories'
 */
function mostrarTicketsPorTipo(sprintNum, tipo) {
    if (!window.erroresSprintsData) {
        console.error('[Tickets por Tipo] No hay datos disponibles');
        return;
    }
    
    // Buscar el sprint
    const sprintData = window.erroresSprintsData.find(s => s.sprintNum === sprintNum);
    if (!sprintData) {
        console.error('[Tickets por Tipo] Sprint no encontrado:', sprintNum);
        return;
    }
    
    // Obtener tickets según el tipo
    let tickets = [];
    let titulo = '';
    let color = '';
    
    switch(tipo) {
        case 'bugs':
            tickets = sprintData.bugs.tickets || [];
            titulo = 'Bugs';
            color = '#F44336';
            break;
        case 'tasks':
            tickets = sprintData.tasks.tickets || [];
            titulo = 'Tasks';
            color = '#2196F3';
            break;
        case 'stories':
            tickets = sprintData.stories.tickets || [];
            titulo = 'Historias de Usuario';
            color = '#4CAF50';
            break;
    }
    
    if (tickets.length === 0) {
        alert('No hay tickets de este tipo en el sprint seleccionado');
        return;
    }
    
    // Crear modal con tabla de tickets
    const modalHTML = `
        <div class="modal-overlay" id="tickets-tipo-modal" onclick="cerrarModalTicketsTipo(event)">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2>${titulo} - Sprint ${sprintNum} (${tickets.length} tickets)</h2>
                    <button class="modal-close" onclick="cerrarModalTicketsTipo()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="modal-table-wrapper">
                        <table class="kpi-table-modern">
                            <thead>
                                <tr>
                                    <th>Ticket</th>
                                    <th>Resumen</th>
                                    <th>Asignado</th>
                                    <th>Estado</th>
                                    <th>Prioridad</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tickets.map(t => `
                                    <tr>
                                        <td>
                                            <strong class="ticket-link" onclick="mostrarDetalleTicket('${t.clave}', event)" style="cursor: pointer; color: ${color};">
                                                ${t.clave}
                                            </strong>
                                        </td>
                                        <td>${t.resumen || t.titulo || '-'}</td>
                                        <td>${t.asignado || 'Sin asignar'}</td>
                                        <td><span class="estado-badge">${t.estadoNormalizado || t.estado || '-'}</span></td>
                                        <td><span class="priority-badge priority-${(t.prioridad || 'medium').toLowerCase()}">${t.prioridad || '-'}</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Insertar modal en el body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';
}

/**
 * Cierra el modal de tickets por tipo
 */
function cerrarModalTicketsTipo(event) {
    if (event && event.target.id !== 'tickets-tipo-modal') return;
    
    const modal = document.getElementById('tickets-tipo-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

/**
 * Cierra el modal de tickets
 */
function cerrarModalTickets(event) {
    // Si se pasa un evento, verificar que fue click en el overlay
    if (event && event.target.className !== 'modal-overlay') return;
    
    const modal = document.getElementById('tickets-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

/**
 * Muestra popup con detalles del ticket (nombre y descripción)
 * @param {string} clave - Clave del ticket (ej: 'IMS-894')
 * @param {Event} event - Evento de click
 */
function mostrarDetalleTicket(clave, event) {
    if (event) event.preventDefault();
    
    // Buscar el ticket en ticketsData
    const ticket = ticketsData.find(t => t.clave === clave);
    
    if (!ticket) {
        console.error('[Detalle Ticket] No se encontró el ticket:', clave);
        return;
    }
    
    const descripcion = ticket.descripcion || 'Sin descripción';
    const resumen = ticket.resumen || ticket.titulo || 'Sin título';
    
    // Crear modal
    const modalHTML = `
        <div id="detalle-ticket-modal" class="modal-overlay" onclick="cerrarDetalleTicket(event)">
            <div class="modal-content-detalle" onclick="event.stopPropagation()">
                <div class="modal-header-detalle">
                    <h2>${clave}</h2>
                    <button onclick="cerrarDetalleTicket()" class="modal-close-btn">×</button>
                </div>
                <div class="modal-body-detalle">
                    <div class="ticket-field">
                        <label><strong>Resumen:</strong></label>
                        <p>${resumen}</p>
                    </div>
                    <div class="ticket-field">
                        <label><strong>Descripción:</strong></label>
                        <p>${descripcion}</p>
                    </div>
                    <div class="ticket-meta">
                        <span><strong>Asignado:</strong> ${ticket.asignado || 'Sin asignar'}</span>
                        <span><strong>Estado:</strong> ${ticket.estado || ticket.estadoNormalizado}</span>
                        <span><strong>Prioridad:</strong> ${ticket.prioridad || 'N/A'}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Insertar modal en el body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';
}

/**
 * Cierra el modal de detalle del ticket
 */
function cerrarDetalleTicket(event) {
    if (event && event.target.id !== 'detalle-ticket-modal') return;
    
    const modal = document.getElementById('detalle-ticket-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

// Hacer funciones disponibles globalmente
window.calcularKPIsAvanzados = calcularKPIsAvanzados;
window.renderKPIsAvanzados = renderKPIsAvanzados;
window.actualizarKPIsAvanzados = actualizarKPIsAvanzados;
window.toggleSection = toggleSection;
window.mostrarTicketsRango = mostrarTicketsRango;
window.cerrarModalTickets = cerrarModalTickets;
window.mostrarDetalleTicket = mostrarDetalleTicket;
window.cerrarDetalleTicket = cerrarDetalleTicket;
window.mostrarTicketsPorTipo = mostrarTicketsPorTipo;
window.cerrarModalTicketsTipo = cerrarModalTicketsTipo;

console.log('[KPIs Avanzados] Módulo cargado correctamente');
