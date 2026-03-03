// dashboard_kpis_avanzados.js
// Módulo de KPIs Avanzados - FASE 1
// ============================================================================
// Descripción: Lógica para calcular y renderizar KPIs avanzados sin afectar
// el dashboard actual. Incluye Lead Time, Edad de Tickets y Análisis de Errores.
// ============================================================================

// ==================== UTILIDADES GLOBALES ====================

/**
 * Formatea días laborales a texto legible (1 día = 9 horas laborales)
 * Precisión hasta minutos para valores sub-hora
 * e.g. 0.05 → "27m", 0.5 → "4h 30m", 1.5 → "1d 4h"
 */
function formatTime(dias) {
    if (!dias || dias === 0) return '0h';
    const MINS_POR_DIA = 9 * 60; // 540 min
    const totalMins = Math.round(dias * MINS_POR_DIA);
    if (totalMins === 0) return '0h';
    // Minimum unit is 1h; minutes are not shown
    const totalHoras = Math.max(1, Math.floor(totalMins / 60));
    if (totalHoras < 9) {
        return `${totalHoras}h`;
    }
    const diasEnteros = Math.floor(totalHoras / 9);
    const horasRestantes = totalHoras % 9;
    if (horasRestantes === 0) return `${diasEnteros}d`;
    return `${diasEnteros}d ${horasRestantes}h`;
}

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
    
    // Para edad de tickets, mostrar Sprint 35 y 36
    const sprintsAbiertos = ['35', '36'];
    
    // Filtrar sprints disponibles para KPIs de calidad
    // Sprint 35 (anterior) y 36 (actual)
    const sprintsCalidad = ['35', '36'];
    
    // Lead Time siempre usa el último sprint cerrado (35).
    // Sprint 36 está activo y no es representativo para esta métrica.
    const SPRINT_LEAD_TIME = '35';
    
    return {
        leadTime: calcularLeadTime(tickets, SPRINT_LEAD_TIME),
        sprintLeadTime: SPRINT_LEAD_TIME,
        edadTickets: calcularEdadTickets(tickets, sprintsAbiertos),
        analisisErrores: calcularAnalisisErrores(tickets),
        cycleTime: calcularCycleTime(tickets, sprintsCalidad),
        rework: calcularRework(tickets),
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
            
            // Calcular Story Points para Sprint 35 (vista de esfuerzo)
            let spData = null;
            if (sprintNum === '35') {
                const getSP = (t) => parseFloat(t.storyPointEstimate) || 0;
                const bugsSP    = bugs.reduce((sum, t) => sum + getSP(t), 0);
                const tasksSP   = tasks.reduce((sum, t) => sum + getSP(t), 0);
                const storiesSP = stories.reduce((sum, t) => sum + getSP(t), 0);
                const otrosSP   = otros.reduce((sum, t) => sum + getSP(t), 0);
                const totalSP   = bugsSP + tasksSP + storiesSP + otrosSP;
                const funcSP    = tasksSP + storiesSP;
                spData = {
                    bugsSP, tasksSP, storiesSP, otrosSP, funcSP, totalSP,
                    bugsPct:     totalSP > 0 ? ((bugsSP / totalSP) * 100).toFixed(1)     : '0.0',
                    tasksPct:    totalSP > 0 ? ((tasksSP / totalSP) * 100).toFixed(1)    : '0.0',
                    storiesPct:  totalSP > 0 ? ((storiesSP / totalSP) * 100).toFixed(1)  : '0.0',
                    funcPct:     totalSP > 0 ? ((funcSP / totalSP) * 100).toFixed(1)     : '0.0',
                    bugPercentSP: totalSP > 0 ? parseFloat(((bugsSP / totalSP) * 100).toFixed(1)) : 0,
                    coverage:      ticketsReales.filter(t => getSP(t) > 0).length,
                    coverageTotal: ticketsReales.length
                };
                console.log(`[Sprint 35 SP] Bugs: ${bugsSP}SP (${spData.bugsPct}%), Tasks: ${tasksSP}SP, Stories: ${storiesSP}SP, Total: ${totalSP}SP`);
            }
            
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
                bugPercentage: parseFloat(porcentajeBugs),
                spData
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

// ==================== CYCLE TIME (TIEMPO DE CICLO) ====================

/**
 * Calcula el Tiempo de Ciclo para tickets de sprints históricos
 * Tiempo de Ciclo = Suma de días desde primer "In Process" hasta "Finalizada"
 * Incluye todos los estados intermedios: Blocked, In Test Dev, In Test, etc.
 * @param {Array} tickets - Array de tickets
 * @param {Array} sprintsCalidad - Array de sprints a analizar (ej: ['30', '34'])
 * @returns {Object} Métricas de Cycle Time
 */
function calcularCycleTime(tickets, sprintsCalidad = ['35', '36']) {
    console.log('[Cycle Time] Calculando para sprints:', sprintsCalidad.join(', '));

    // Filtrar tickets de los sprints objetivo que estén finalizados
    const ticketsFinalizados = tickets.filter(t => {
        const sprintStr = String(t.sprint || '').trim();
        return sprintsCalidad.includes(sprintStr) && t.estadoNormalizado === 'Finalizados';
    });

    console.log('[Cycle Time] Tickets finalizados:', ticketsFinalizados.length);

    if (ticketsFinalizados.length === 0) {
        return { promedio: 0, ticketsDetalle: [], total: 0 };
    }

    /**
     * Mapeo de nombres de estado del changelog → bucket de etapa del pipeline:
     * Los estados con variantes (Done, Finalizada, etc.) se normalizan a 'finalizado'
     * y no cuentan para el ciclo activo.
     */
    const estadoAEtapa = {
        'in process':  'inProcess',
        'code review': 'codeReview',
        'in test dev': 'inTestDev',
        'in test':     'inTest',
        'blocked':     'blocked',
        'test issues': 'testIssue',
        'test issue':  'testIssue',
        'in test issues': 'testIssue',
    };
    // Estados que NO cuentan como tiempo activo del ciclo
    const estadosIgnorar = new Set(['to do', 'tareas por hacer', 'done', 'finalizada', 'finalizados', 'finalizado']);

    const ticketsConDetalle = ticketsFinalizados.map(t => {
        const historial = (typeof changelogData !== 'undefined') ? changelogData[t.clave] : null;

        // Acumuladores por etapa
        const etapas = {
            inProcess: 0,
            codeReview: 0,
            inTestDev: 0,
            inTest: 0,
            blocked: 0,
            testIssue: 0,
        };

        let diasActivosTotal = 0;

        if (historial && historial.length > 0) {
            historial.forEach(entrada => {
                const key = (entrada.estado || '').toLowerCase().trim();
                if (estadosIgnorar.has(key)) return;
                const etapa = estadoAEtapa[key];
                const dias = parseFloat(entrada.dias) || 0;
                if (etapa) {
                    etapas[etapa] += dias;
                    diasActivosTotal += dias;
                }
            });
            // Redondear a 1 decimal
            Object.keys(etapas).forEach(k => {
                etapas[k] = Math.round(etapas[k] * 10) / 10;
            });
        } else {
            // Fallback: si no hay changelog, usar lead time y distribuir proporcionalmente
            const creada   = parsearFechaAvanzada(t.creada);
            const resuelta = parsearFechaAvanzada(t.resuelta);
            diasActivosTotal = creada && resuelta
                ? Math.max(0, Math.round((resuelta - creada) / (1000 * 60 * 60 * 24)))
                : 0;
        }

        return {
            clave: t.clave,
            resumen: t.resumen,
            sprint: t.sprint,
            prioridad: t.prioridad,
            diasTotal: Math.round(diasActivosTotal * 10) / 10,
            etapas,
        };
    });

    const suma = ticketsConDetalle.reduce((sum, t) => sum + t.diasTotal, 0);
    const promedio = ticketsConDetalle.length > 0 ? (suma / ticketsConDetalle.length).toFixed(1) : 0;

    return {
        promedio: parseFloat(promedio),
        ticketsDetalle: ticketsConDetalle,
        total: ticketsConDetalle.length,
    };
}

// ==================== REWORK (REPROCESOS) ====================

/**
 * Calcula reprocesos: tickets que de "In Test" regresaron a "Code Review"
 * @param {Array} tickets - Array de tickets
 * @param {Array} sprintsCalidad - Array de sprints a analizar
 * @returns {Object} Métricas de Rework
 */
function calcularRework(tickets) {
    // Solo Sprint 35
    const SPRINT_REWORK = '35';
    console.log('[Rework] Calculando para Sprint', SPRINT_REWORK, 'con changelog real');

    const ticketsSprint35 = tickets.filter(t => String(t.sprint || '').trim() === SPRINT_REWORK);
    console.log('[Rework] Tickets Sprint 35:', ticketsSprint35.length);

    if (ticketsSprint35.length === 0 || typeof changelogData === 'undefined') {
        return { totalAnalizado: 0, conRework: 0, porcentaje: 0, ciclosTotales: 0, detalle: [] };
    }

    const ESTADO_IN_TEST = 'in test';
    const ESTADO_TEST_ISSUES = 'test issues';

    const detalle = [];

    ticketsSprint35.forEach(ticket => {
        const historial = changelogData[ticket.clave];
        if (!historial || historial.length < 2) return;

        let ciclos = 0;
        const ciclosDetalle = [];

        // Detectar cualquier transición In Test → Test Issues como reproceso.
        // El estado posterior a Test Issues es informativo (puede ser Code Review,
        // In Process, In Test de nuevo, Done, etc.) — lo que importa es que QA
        // encontró un defecto y el ticket salió de In Test hacia Test Issues.
        for (let i = 0; i < historial.length - 1; i++) {
            const estadoActual = (historial[i].estado || '').toLowerCase().trim();
            const estadoSig    = (historial[i + 1].estado || '').toLowerCase().trim();
            const estadoDespues = i + 2 < historial.length
                ? historial[i + 2].estado
                : null;

            if (estadoActual === ESTADO_IN_TEST && estadoSig === ESTADO_TEST_ISSUES) {
                ciclos++;
                ciclosDetalle.push({
                    desde: historial[i].inicio,
                    testIssuesDias: historial[i + 1].dias,
                    vueltaA: estadoDespues || '—',
                });
                i += 1; // avanzar más allá del Test Issues ya procesado
            }
        }

        if (ciclos > 0) {
            detalle.push({
                clave: ticket.clave,
                resumen: ticket.resumen,
                prioridad: ticket.prioridad,
                ciclos,
                ciclosDetalle,
            });
        }
    });

    const conRework = detalle.length;
    const ciclosTotales = detalle.reduce((s, t) => s + t.ciclos, 0);
    const porcentaje = ticketsSprint35.length > 0
        ? ((conRework / ticketsSprint35.length) * 100).toFixed(1)
        : '0.0';

    console.log('[Rework] Tickets con rework:', conRework, '| Ciclos totales:', ciclosTotales);

    return {
        totalAnalizado: ticketsSprint35.length,
        conRework,
        porcentaje: parseFloat(porcentaje),
        ciclosTotales,
        detalle,
    };
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
        <div class="sections-handle-wrap">
            <button class="btn-sections-handle" id="btn-toggle-all-sections" onclick="toggleAllSections()" title="Colapsar todas las secciones">
                <svg id="btn-toggle-all-icon" class="handle-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="7 10 12 5 17 10"></polyline>
                    <polyline points="7 15 12 20 17 15"></polyline>
                </svg>
            </button>
        </div>
        
        ${renderLeadTimeSection(kpis.leadTime, kpis.sprintLeadTime)}
        ${renderCycleTimeSection(kpis.cycleTime)}
        ${renderReworkSection(kpis.rework)}
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
            <div class="kpi-section-avanzado" style="border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; margin-bottom: 20px;">
                <div class="section-header-avanzado collapsible" onclick="toggleSection('leadtime-content')" 
                     style="background: linear-gradient(to right, #F3F4F6, #E5E7EB); padding: 12px 16px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: all 0.3s ease;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span class="collapse-icon" id="icon-leadtime-content" style="color: #6B7280; font-size: 18px; transition: transform 0.3s ease;">▼</span>
                        <svg class="w-5 h-5" style="width: 20px; height: 20px; color: #8B5CF6;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 style="margin: 0; font-size: 16px; font-weight: 600; color: #1F2937;">Lead Time Analysis</h2>
                    </div>
                </div>
                <div class="section-content-avanzado" id="leadtime-content" style="padding: 16px;">
                    <p class="no-data">No hay suficientes datos de tickets finalizados para calcular Lead Time.</p>
                </div>
            </div>
        `;
    }
    
    return `
        <div class="kpi-section-avanzado" style="border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; margin-bottom: 20px;">
            <div class="section-header-avanzado collapsible" onclick="toggleSection('leadtime-content')" 
                 style="background: linear-gradient(to right, #F3F4F6, #E5E7EB); padding: 12px 16px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: all 0.3s ease;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span class="collapse-icon" id="icon-leadtime-content" style="color: #6B7280; font-size: 18px; transition: transform 0.3s ease;">▼</span>
                    <svg class="w-5 h-5" style="width: 20px; height: 20px; color: #8B5CF6;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 style="margin: 0; font-size: 16px; font-weight: 600; color: #1F2937;">Lead Time Analysis</h2>
                </div>
                <span style="background: #EEF2FF; color: #6366F1; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">${leadTime.total} tickets</span>
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
            <div class="kpi-section-avanzado" style="border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; margin-bottom: 20px;">
                <div class="section-header-avanzado collapsible" onclick="toggleSection('edad-content')" 
                     style="background: linear-gradient(to right, #F3F4F6, #E5E7EB); padding: 12px 16px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: all 0.3s ease;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span class="collapse-icon" id="icon-edad-content" style="color: #6B7280; font-size: 18px; transition: transform 0.3s ease;">▼</span>
                        <svg class="w-5 h-5" style="width: 20px; height: 20px; color: #F59E0B;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h2 style="margin: 0; font-size: 16px; font-weight: 600; color: #1F2937;">Edad de Tickets Abiertos</h2>
                    </div>
                </div>
                <div class="section-content-avanzado" id="edad-content" style="padding: 16px;">
                    <p class="no-data">No hay tickets abiertos en los sprints ${edadTickets.sprints.join(', ')} en estados de tracking.</p>
                </div>
            </div>
        `;
    }

    const sprintsText = edadTickets.sprints.length === 1 ? `Sprint ${edadTickets.sprints[0]}` : `Sprints ${edadTickets.sprints.join(', ')}`;
    
    return `
        <div class="kpi-section-avanzado" style="border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; margin-bottom: 20px;">
            <div class="section-header-avanzado collapsible" onclick="toggleSection('edad-content')" 
                 style="background: linear-gradient(to right, #F3F4F6, #E5E7EB); padding: 12px 16px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: all 0.3s ease;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span class="collapse-icon" id="icon-edad-content" style="color: #6B7280; font-size: 18px; transition: transform 0.3s ease;">▼</span>
                    <svg class="w-5 h-5" style="width: 20px; height: 20px; color: #F59E0B;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h2 style="margin: 0; font-size: 16px; font-weight: 600; color: #1F2937;">Edad de Tickets Abiertos</h2>
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <span style="background: #EEF2FF; color: #6366F1; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">${edadTickets.total} tickets</span>
                    <span style="background: #FEF3C7; color: #D97706; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">${sprintsText}</span>
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
        <div class="kpi-section-avanzado" style="border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; margin-bottom: 20px;">
            <div class="section-header-avanzado collapsible" onclick="toggleSection('errores-content')" 
                 style="background: linear-gradient(to right, #F3F4F6, #E5E7EB); padding: 12px 16px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: all 0.3s ease;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span class="collapse-icon" id="icon-errores-content" style="color: #6B7280; font-size: 18px; transition: transform 0.3s ease;">▼</span>
                    <svg class="w-5 h-5" style="width: 20px; height: 20px; color: #EF4444;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 style="margin: 0; font-size: 16px; font-weight: 600; color: #1F2937;">Análisis de Errores vs Funcionalidad</h2>
                </div>
            </div>
            
            <div class="section-content-avanzado" id="errores-content">
                <div class="chart-container-avanzado">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                        <h3 style="margin:0;">Distribución por Sprint</h3>
                        ${analisis.porSprint.some(s => s.spData) ? `
                        <div id="errores-view-tabs" style="display:flex;gap:0;border:1px solid #E5E7EB;border-radius:6px;overflow:hidden;font-size:12px;">
                            <button id="tab-errores-tickets" onclick="switchErroresView('tickets')"
                                style="padding:5px 14px;border:none;background:#243F6B;color:#fff;cursor:pointer;font-weight:600;font-size:12px;transition:all 0.2s;">
                                Tickets
                            </button>
                            <button id="tab-errores-sp" onclick="switchErroresView('sp')"
                                style="padding:5px 14px;border:none;background:#F3F4F6;color:#6B7280;cursor:pointer;font-size:12px;transition:all 0.2s;">
                                Story Points
                            </button>
                        </div>
                        ` : ''}
                    </div>
                    <div id="errores-chart-tickets">
                        ${renderErroresSprintChart(analisis.porSprint, 'tickets')}
                    </div>
                    <div id="errores-chart-sp" style="display:none;">
                        ${renderErroresSprintChart(analisis.porSprint, 'sp')}
                    </div>
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

function renderErroresSprintChart(sprints, mode) {
    const showSP = (mode === 'sp');

    const rows = sprints.map(sprint => {
        if (showSP) {
            if (sprint.spData) {
                const sp = sprint.spData;

                // Construir desglose de bugs ordenados por SP desc
                const bugsSorted = (sprint.bugs.tickets || [])
                    .map(t => ({ clave: t.clave, sp: parseFloat(t.storyPointEstimate) || 0, resumen: t.resumen || '' }))
                    .filter(t => t.sp > 0)
                    .sort((a, b) => b.sp - a.sp);

                const maxBugSP = bugsSorted.length > 0 ? bugsSorted[0].sp : 1;
                const bugRows = bugsSorted.map(t => {
                    const barPct = Math.round((t.sp / maxBugSP) * 100);
                    const resumenCorto = t.resumen.length > 65 ? t.resumen.substring(0, 65) + '…' : t.resumen;
                    return `
                    <div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid #F9FAFB;">
                        <span style="font-size:10px;color:#9CA3AF;width:70px;flex-shrink:0;">${t.clave}</span>
                        <div style="width:80px;height:5px;background:#FEE2E2;border-radius:3px;flex-shrink:0;overflow:hidden;">
                            <div style="width:${barPct}%;height:5px;background:#F44336;border-radius:3px;"></div>
                        </div>
                        <span style="font-size:10px;color:#EF4444;font-weight:600;width:28px;flex-shrink:0;">${t.sp}SP</span>
                        <span style="font-size:11px;color:#374151;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${t.resumen}">${resumenCorto}</span>
                    </div>`;
                }).join('');

                return `
                <div class="stacked-bar-row">
                    <div class="stacked-bar-label">${sprint.sprint}</div>
                    <div class="stacked-bar-container">
                        <div class="stacked-bar-segment" 
                             style="width: ${sp.bugsPct}%; background: #F44336;" 
                             title="Bugs: ${sp.bugsSP}SP (${sp.bugsPct}%)">
                            ${sp.bugsPct}%
                        </div>
                        <div class="stacked-bar-segment" 
                             style="width: ${sp.funcPct}%; background: #4CAF50;" 
                             title="Tasks+Stories: ${sp.funcSP}SP (${sp.funcPct}%)">
                            ${sp.funcPct}%
                        </div>
                        ${sp.otrosSP > 0 ? `
                            <div class="stacked-bar-segment" 
                                 style="width: ${parseFloat(100 - parseFloat(sp.bugsPct) - parseFloat(sp.funcPct)).toFixed(1)}%; background: #9E9E9E;" 
                                 title="Otros: ${sp.otrosSP}SP">
                            </div>
                        ` : ''}
                    </div>
                    <span style="font-size:10px;color:#6B7280;margin-left:8px;white-space:nowrap;">${sp.bugsSP}SP vs ${sp.funcSP}SP</span>
                </div>
                ${bugsSorted.length > 0 ? `
                <div style="padding:0 0 4px 90px;">
                    <button onclick="(function(btn){
                        var p=document.getElementById('bug-desglose-s35');
                        var open=p.style.display!=='none';
                        p.style.display=open?'none':'block';
                        btn.innerHTML=open?'▶ Ver desglose de bugs (${bugsSorted.length} tickets · ${sp.bugsSP}SP)':'▼ Ocultar desglose';
                    })(this)"
                    style="font-size:11px;color:#9CA3AF;background:none;border:none;cursor:pointer;padding:3px 0;display:flex;align-items:center;gap:4px;transition:color 0.2s;"
                    onmouseover="this.style.color='#EF4444'" onmouseout="this.style.color='#9CA3AF'">
                        ▶ Ver desglose de bugs (${bugsSorted.length} tickets · ${sp.bugsSP}SP)
                    </button>
                    <div id="bug-desglose-s35" style="display:none;margin-top:6px;padding:8px 12px;background:#FFFBFB;border:1px solid #FEE2E2;border-radius:6px;">
                        ${bugRows}
                    </div>
                </div>
                ` : ''}`;
            } else {
                return `
                <div class="stacked-bar-row" style="opacity:0.4;">
                    <div class="stacked-bar-label">${sprint.sprint}</div>
                    <div class="stacked-bar-container" style="background:#F3F4F6;border-radius:4px;height:28px;display:flex;align-items:center;padding-left:10px;">
                        <span style="font-size:11px;color:#9CA3AF;font-style:italic;">Sin datos de Story Points</span>
                    </div>
                </div>`;
            }
        } else {
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
                </div>`;
        }
    }).join('');

    const s35sp = sprints.find(s => s.spData);
    const legend = showSP
        ? `<div class="chart-legend">
            <span class="legend-item"><span class="legend-color" style="background: #F44336;"></span> Bugs (SP)</span>
            <span class="legend-item"><span class="legend-color" style="background: #4CAF50;"></span> Tasks + Stories (SP)</span>
            ${s35sp ? `<span style="font-size:10px;color:#6B7280;margin-left:14px;">Cobertura S35: ${s35sp.spData.coverage}/${s35sp.spData.coverageTotal} tickets con SP estimado</span>` : ''}
           </div>`
        : `<div class="chart-legend">
            <span class="legend-item"><span class="legend-color" style="background: #F44336;"></span> Bugs</span>
            <span class="legend-item"><span class="legend-color" style="background: #4CAF50;"></span> Tasks + Stories</span>
           </div>`;

    return `<div class="stacked-bar-chart">${rows}</div>${legend}`;
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
 * Alterna entre vista Tickets y Story Points en el chart de Análisis de Errores
 */
function switchErroresView(mode) {
    const ticketsChart = document.getElementById('errores-chart-tickets');
    const spChart      = document.getElementById('errores-chart-sp');
    const tabTickets   = document.getElementById('tab-errores-tickets');
    const tabSP        = document.getElementById('tab-errores-sp');
    if (!ticketsChart || !spChart) return;

    if (mode === 'sp') {
        ticketsChart.style.display = 'none';
        spChart.style.display      = 'block';
        if (tabTickets) { tabTickets.style.background = '#F3F4F6'; tabTickets.style.color = '#6B7280'; tabTickets.style.fontWeight = ''; }
        if (tabSP)      { tabSP.style.background      = '#243F6B'; tabSP.style.color      = '#fff';    tabSP.style.fontWeight      = '600'; }
    } else {
        ticketsChart.style.display = 'block';
        spChart.style.display      = 'none';
        if (tabTickets) { tabTickets.style.background = '#243F6B'; tabTickets.style.color = '#fff';    tabTickets.style.fontWeight = '600'; }
        if (tabSP)      { tabSP.style.background      = '#F3F4F6'; tabSP.style.color      = '#6B7280'; tabSP.style.fontWeight      = ''; }
    }
}

/**
 * Muestra popup con los tickets de un rango de percentil SLE
 * pType: 'p50' | 'p90' | 'p95' | 'ciclolargo' | 'sintiempo'
 */
function showSLEPopup(sprintKey, pType) {
    const data = window._sleData && window._sleData[sprintKey];
    if (!data) return;
    const { p50, p90, p95, tickets } = data;
    const SPRINT_DIAS = data.SPRINT_DIAS || 10;

    let filtered, title, subtitle, accentColor;
    if (pType === 'p50') {
        filtered    = tickets.filter(t => (t.diasTotal||0) > 0 && (t.diasTotal||0) <= p50).sort((a,b) => a.diasTotal - b.diasTotal);
        title       = `Ticket típico · P50 — ≤ ${formatTime(p50)}`;
        subtitle    = `La mitad más rápida del sprint. ${filtered.length} tickets cerraron en ${formatTime(p50)} o menos.`;
        accentColor = '#10B981';
    } else if (pType === 'p90') {
        filtered    = tickets.filter(t => (t.diasTotal||0) > p50 && (t.diasTotal||0) <= p90).sort((a,b) => a.diasTotal - b.diasTotal);
        title       = `SLA del equipo · P90 — ${formatTime(p50)} a ${formatTime(p90)}`;
        subtitle    = `Tickets en zona media. ${filtered.length} tickets tardaron entre ${formatTime(p50)} y ${formatTime(p90)}.`;
        accentColor = '#F59E0B';
    } else if (pType === 'p95') {
        filtered    = tickets.filter(t => (t.diasTotal||0) > p90).sort((a,b) => b.diasTotal - a.diasTotal);
        title       = `Zona lenta · P95 — > ${formatTime(p90)}`;
        subtitle    = `Los ${filtered.length} tickets con ciclo más largo del sprint.`;
        accentColor = '#F97316';
    } else if (pType === 'sintiempo') {
        filtered    = tickets.filter(t => (t.diasTotal||0) === 0).sort((a,b) => (a.clave||'').localeCompare(b.clave||''));
        title       = `Sin tiempo en changelog — ${filtered.length} tickets`;
        subtitle    = `No tienen entradas de tiempo en el changelog. No se incluyen en el cálculo de percentiles.`;
        accentColor = '#9CA3AF';
    } else if (pType === 'ciclolargo') {
        filtered    = tickets.filter(t => (t.diasTotal||0) > SPRINT_DIAS).sort((a,b) => b.diasTotal - a.diasTotal);
        title       = `Tickets con ciclo largo — > ${SPRINT_DIAS}d activos`;
        subtitle    = `${filtered.length} ticket${filtered.length!==1?'s':''} del sprint con ciclo de trabajo mayor al sprint (${SPRINT_DIAS}d). Están incluidos en el SLE.`;
        accentColor = '#EF4444';
    } else if (pType === 'zone_green') {
        filtered    = tickets.filter(t => (t.diasTotal||0) > 0 && (t.diasTotal||0) < 5).sort((a,b) => a.diasTotal - b.diasTotal);
        title       = `Excelente · < 5d — ${filtered.length} tickets`;
        subtitle    = `Tickets que cerraron en menos de la mitad del sprint (< 5 días hábiles).`;
        accentColor = '#10B981';
    } else if (pType === 'zone_yellow') {
        filtered    = tickets.filter(t => (t.diasTotal||0) >= 5 && (t.diasTotal||0) <= 10).sort((a,b) => a.diasTotal - b.diasTotal);
        title       = `Normal · 5–10d — ${filtered.length} tickets`;
        subtitle    = `Tickets que cerraron dentro del sprint completo (5 a 10 días hábiles).`;
        accentColor = '#F59E0B';
    } else if (pType === 'zone_red') {
        filtered    = tickets.filter(t => (t.diasTotal||0) > 10).sort((a,b) => b.diasTotal - a.diasTotal);
        title       = `Ciclo largo · > 10d — ${filtered.length} tickets`;
        subtitle    = `Tickets que superaron el sprint completo (> 10 días hábiles de ciclo activo).`;
        accentColor = '#EF4444';
    } else {
        filtered    = tickets.filter(t => (t.diasTotal||0) > p90).sort((a,b) => b.diasTotal - a.diasTotal);
        title       = `Zona lenta — > ${formatTime(p90)}`;
        subtitle    = `${filtered.length} tickets en la zona alta del ciclo.`;
        accentColor = '#F97316';
    }

    const prioColor = (p) => {
        const pl = (p||'').toLowerCase();
        return pl === 'highest' || pl === 'blocker' ? '#EF4444'
             : pl === 'high'                         ? '#F97316'
             : pl === 'medium'                        ? '#F59E0B'
             : '#9CA3AF';
    };

    const rows = filtered.map(t => `
        <div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid #F3F4F6;">
            <span style="font-size:11px;font-weight:700;color:#243F6B;min-width:85px;">${t.clave}</span>
            <span style="flex:1;font-size:11px;color:#374151;line-height:1.3;">${(t.resumen||'').substring(0,70)}${(t.resumen||'').length>70?'\u2026':''}</span>
            <span style="font-size:10px;font-weight:600;color:${prioColor(t.prioridad)};min-width:55px;text-align:center;">${t.prioridad||'\u2014'}</span>
            <span style="font-size:12px;font-weight:700;color:#1F2937;min-width:55px;text-align:right;">${formatTime(t.diasTotal)}</span>
        </div>`).join('');

    const existing = document.getElementById('sle-popup-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'sle-popup-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

    overlay.innerHTML = `
        <div style="background:#fff;border-radius:10px;box-shadow:0 20px 60px rgba(0,0,0,0.25);max-width:660px;width:100%;max-height:78vh;display:flex;flex-direction:column;overflow:hidden;">
            <div style="padding:14px 18px;border-bottom:1px solid #E5E7EB;background:#F9FAFB;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;">
                <div>
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                        <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${accentColor};flex-shrink:0;"></span>
                        <span style="font-size:13px;font-weight:700;color:#1F2937;">${title}</span>
                    </div>
                    <div style="font-size:11px;color:#6B7280;line-height:1.4;">${subtitle}</div>
                </div>
                <button onclick="document.getElementById('sle-popup-overlay').remove()" style="border:none;background:none;cursor:pointer;color:#9CA3AF;font-size:20px;line-height:1;padding:2px 4px;flex-shrink:0;">&#x2715;</button>
            </div>
            <div style="display:flex;align-items:center;gap:10px;padding:6px 12px;background:#F3F4F6;border-bottom:1px solid #E5E7EB;">
                <span style="font-size:9px;font-weight:700;color:#9CA3AF;text-transform:uppercase;min-width:85px;">Ticket</span>
                <span style="flex:1;font-size:9px;font-weight:700;color:#9CA3AF;text-transform:uppercase;">Resumen</span>
                <span style="font-size:9px;font-weight:700;color:#9CA3AF;text-transform:uppercase;min-width:55px;text-align:center;">Prioridad</span>
                <span style="font-size:9px;font-weight:700;color:#9CA3AF;text-transform:uppercase;min-width:55px;text-align:right;">Duración</span>
            </div>
            <div style="overflow-y:auto;flex:1;">
                ${filtered.length === 0
                    ? '<div style="padding:24px;text-align:center;color:#9CA3AF;font-size:12px;">Sin tickets en este rango</div>'
                    : rows}
            </div>
            <div style="padding:8px 16px;background:#F9FAFB;border-top:1px solid #E5E7EB;display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:10px;color:#9CA3AF;">Haz clic fuera del panel para cerrar</span>
                <span style="font-size:10px;font-weight:600;color:#374151;">${filtered.length} ticket${filtered.length !== 1 ? 's' : ''}</span>
            </div>
        </div>`;

    document.body.appendChild(overlay);
}

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

const AVANZADO_SECTIONS = ['leadtime-content', 'cycletime-content', 'rework-content', 'edad-content', 'errores-content'];

function toggleAllSections() {
    const btn = document.getElementById('btn-toggle-all-sections');
    const icon = document.getElementById('btn-toggle-all-icon');
    const anyVisible = AVANZADO_SECTIONS.some(id => {
        const el = document.getElementById(id);
        return el && el.style.display !== 'none';
    });
    AVANZADO_SECTIONS.forEach(id => {
        const content = document.getElementById(id);
        const sectionIcon = document.getElementById('icon-' + id);
        if (anyVisible) {
            if (content) content.style.display = 'none';
            if (sectionIcon) sectionIcon.textContent = '▶';
        } else {
            if (content) content.style.display = 'block';
            if (sectionIcon) sectionIcon.textContent = '▼';
        }
    });
    if (icon) {
        // Rotado = expandir (flechas apuntan afuera), normal = colapsar (flechas apuntan adentro)
        icon.style.transform = anyVisible ? 'rotate(180deg)' : '';
        btn.title = anyVisible ? 'Expandir todas las secciones' : 'Colapsar todas las secciones';
    }
}

window.toggleAllSections = toggleAllSections;

function expandAllSections() {
    AVANZADO_SECTIONS.forEach(id => {
        const content = document.getElementById(id);
        const icon = document.getElementById('icon-' + id);
        if (content) content.style.display = 'block';
        if (icon) icon.textContent = '▼';
    });
}

function collapseAllSections() {
    AVANZADO_SECTIONS.forEach(id => {
        const content = document.getElementById(id);
        const icon = document.getElementById('icon-' + id);
        if (content) content.style.display = 'none';
        if (icon) icon.textContent = '▶';
    });
}

window.expandAllSections = expandAllSections;
window.collapseAllSections = collapseAllSections;

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
        <div class="modal-overlay modal-active" id="tickets-modal" onclick="window.cerrarModalTickets(event)">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2>
                        <span class="modal-title-icon">&#x23F1;</span>
                        Distribución Lead Time &mdash; ${label}
                    </h2>
                    <button class="modal-close" onclick="window.cerrarModalTickets()">&times;</button>
                </div>
                <div class="modal-body">
                    <p style="margin:0 0 14px 0;padding:14px 0 14px 0;border-bottom:1px solid #F3F4F6;font-size:13px;">
                        <span style="color:#6B7280;">Total de tickets:</span>
                        <strong style="color:#1a3a6b;font-size:15px;margin-left:8px;background:#DBEAFE;border:1.5px solid #93C5FD;padding:2px 12px;border-radius:20px;font-weight:700;">${ticketsEnRango.length}</strong>
                    </p>
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
                                        <td><strong style="color:#1a3a6b;font-family:monospace;font-size:13px">${t.clave}</strong></td>
                                        <td style="max-width:320px;">${truncateText(t.resumen, 65)}</td>
                                        <td><span style="color:#6B7280;font-size:13px">${t.tipoIncidencia || t.tipo || '-'}</span></td>
                                        <td><span class="priority-badge priority-${(t.prioridad || 'medium').toLowerCase()}">${t.prioridad || '-'}</span></td>
                                        <td><span style="color:#6B7280;font-size:13px">Sprint ${t.sprint}</span></td>
                                        <td><strong style="color:#1a3a6b">${t.leadTimeDias} días</strong></td>
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
        <div class="modal-overlay modal-active" id="tickets-tipo-modal" onclick="cerrarModalTicketsTipo(event)">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2>
                        <span class="modal-title-icon">&#x1F4CB;</span>
                        ${titulo} &mdash; Sprint ${sprintNum}
                    </h2>
                    <button class="modal-close" onclick="cerrarModalTicketsTipo()">&times;</button>
                </div>
                <div class="modal-body">
                    <p style="margin:0 0 14px 0;padding:14px 0 14px 0;border-bottom:1px solid #F3F4F6;font-size:13px;">
                        <span style="color:#6B7280;">Total de tickets:</span>
                        <strong style="color:#1a3a6b;font-size:15px;margin-left:8px;background:#DBEAFE;border:1.5px solid #93C5FD;padding:2px 12px;border-radius:20px;font-weight:700;">${tickets.length}</strong>
                    </p>
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
                                            <strong class="ticket-link" onclick="mostrarDetalleTicket('${t.clave}', event)" style="cursor:pointer;color:#1a3a6b;font-family:monospace;font-size:13px">
                                                ${t.clave}
                                            </strong>
                                        </td>
                                        <td style="max-width:300px">${t.resumen || t.titulo || '-'}</td>
                                        <td><span style="color:#6B7280;font-size:13px">${t.asignado || 'Sin asignar'}</span></td>
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
    const prioridadClass = `priority-${(ticket.prioridad || 'medium').toLowerCase()}`;
    const modalHTML = `
        <div id="detalle-ticket-modal" class="modal-overlay modal-active" onclick="cerrarDetalleTicket(event)">
            <div class="modal-content-detalle" onclick="event.stopPropagation()">
                <div class="modal-header-detalle">
                    <h2>
                        <span class="modal-title-icon">&#x1F3AB;</span>
                        ${clave}
                    </h2>
                    <button onclick="cerrarDetalleTicket()" class="modal-close-btn">&times;</button>
                </div>
                <div class="modal-body-detalle">
                    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px;">
                        <span class="priority-badge ${prioridadClass}">${ticket.prioridad || 'N/A'}</span>
                        <span class="estado-badge">${ticket.estado || ticket.estadoNormalizado || '-'}</span>
                        ${ticket.asignado ? `<span style="background:#F3F4F6;color:#374151;border:1px solid #E5E7EB;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;">&#128100; ${ticket.asignado}</span>` : ''}
                    </div>
                    <div class="ticket-field">
                        <label><strong>Resumen:</strong></label>
                        <p>${resumen}</p>
                    </div>
                    <div class="ticket-field">
                        <label><strong>Descripci\u00f3n:</strong></label>
                        <p>${descripcion}</p>
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

// ==================== CICLO TIEMPO SECTION ====================

/**
 * Renderiza la sección de Cycle Time (Tiempo de Ciclo)
 */
function renderCycleTimeSection(cycleTime) {
    if (!cycleTime || cycleTime.total === 0) {
        return `
            <div class="kpi-section-avanzado" style="border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; margin-bottom: 20px;">
                <div class="section-header-avanzado collapsible" onclick="toggleSection('cycletime-content')" 
                     style="background: linear-gradient(to right, #F3F4F6, #E5E7EB); padding: 12px 16px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: all 0.3s ease;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span class="collapse-icon" id="icon-cycletime-content" style="color: #6B7280; font-size: 18px; transition: transform 0.3s ease;">▼</span>
                        <svg class="w-5 h-5" style="width: 20px; height: 20px; color: #00B894;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 style="margin: 0; font-size: 16px; font-weight: 600; color: #1F2937;">Tiempo de Ciclo (Cycle Time)</h2>
                    </div>
                    <span style="background: #FEF3C7; color: #D97706; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600;">Sprints 35, 36 | Sin datos</span>
                </div>
            </div>
        `;
    }
    
    const colorClass = cycleTime.promedio <= 7 ? 'kpi-success' : 
                      cycleTime.promedio <= 15 ? 'kpi-warning' : 'kpi-danger';
    
    // formatTime disponible globalmente (ver inicio del archivo)
    
    // Agrupar tickets por sprint
    const ticketsPorSprint = {};
    cycleTime.ticketsDetalle.forEach(ticket => {
        const sprint = ticket.sprint;
        if (!ticketsPorSprint[sprint]) {
            ticketsPorSprint[sprint] = [];
        }
        ticketsPorSprint[sprint].push(ticket);
    });
    
    // Ordenar sprints
    const sprintsOrdenados = Object.keys(ticketsPorSprint).sort((a, b) => Number(a) - Number(b));
    
    // Contar solo tickets del sprint 35
    const ticketsSprint35 = cycleTime.ticketsDetalle.filter(t => t.sprint === '35').length;
    
    return `
        <div class="kpi-section-avanzado" style="border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; margin-bottom: 20px;">
            <div class="section-header-avanzado collapsible" onclick="toggleSection('cycletime-content')" 
                 style="background: linear-gradient(to right, #F3F4F6, #E5E7EB); padding: 12px 16px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: all 0.3s ease;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span class="collapse-icon" id="icon-cycletime-content" style="color: #6B7280; font-size: 18px; transition: transform 0.3s ease;">▼</span>
                    <svg class="w-5 h-5" style="width: 20px; height: 20px; color: #00B894;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 style="margin: 0; font-size: 16px; font-weight: 600; color: #1F2937;">Tiempo de Ciclo (Cycle Time)</h2>
                </div>
                <span style="background: #FEF3C7; color: #D97706; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600;">Sprints 35, 36 | Pipeline de etapas por ticket</span>
            </div>
            
            <div id="cycletime-content" class="section-content-avanzado">
                <!-- Solo Tickets Finalizados Sprint 35 -->
                <div class="kpi-cards-container">
                    <div class="kpi-card-avanzado" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none;">
                        <div class="kpi-content-avanzado" style="color: white;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                                <svg class="w-6 h-6" style="width: 24px; height: 24px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div class="kpi-label-avanzado" style="color: rgba(255,255,255,0.9); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Sprint 35 Completado</div>
                            </div>
                            <div class="kpi-value-large" style="color: white; font-size: 36px; font-weight: bold;">${ticketsSprint35}</div>
                            <div style="color: rgba(255,255,255,0.8); font-size: 11px; margin-top: 4px;">Tickets Finalizados</div>
                        </div>
                    </div>
                </div>
                
                <!-- Pipeline por Sprint (Desplegables) -->
                ${sprintsOrdenados.map(sprint => {
                    const tickets = ticketsPorSprint[sprint];
                    
                    // Promedios por etapa: divide only by tickets that actually passed through each stage
                const stageAvg = (field) => {
                    const active = tickets.filter(t => (t.etapas[field] || 0) > 0);
                    if (active.length === 0) return 0;
                    return active.reduce((s, t) => s + t.etapas[field], 0) / active.length;
                };
                const avgInProcess  = stageAvg('inProcess');
                const avgCodeReview = stageAvg('codeReview');
                const avgInTestDev  = stageAvg('inTestDev');
                const avgInTest     = stageAvg('inTest');
                const avgBlocked    = stageAvg('blocked');
                const avgTestIssue  = stageAvg('testIssue');
                const avgTotal      = tickets.reduce((s, t) => s + (t.diasTotal || 0), 0) / tickets.length;
                const hasBlocked    = tickets.some(t => t.etapas.blocked    > 0);
                const hasTestIssue  = tickets.some(t => t.etapas.testIssue  > 0);

                // ── Flow Efficiency (Touch Time / Total Lead Time) ─────────────
                // Computed at sum level (per ticket) to avoid mixing averages over different subsets.
                // Touch Time = active stages: In Process + Code Review + Test Dev + In Test
                // Wait Time  = impediments:   Blocked + Test Issue
                const sumInProcess  = tickets.reduce((s, t) => s + (t.etapas.inProcess  || 0), 0);
                const sumCodeReview = tickets.reduce((s, t) => s + (t.etapas.codeReview || 0), 0);
                const sumInTestDev  = tickets.reduce((s, t) => s + (t.etapas.inTestDev  || 0), 0);
                const sumInTest     = tickets.reduce((s, t) => s + (t.etapas.inTest     || 0), 0);
                const sumBlocked    = tickets.reduce((s, t) => s + (t.etapas.blocked    || 0), 0);
                const sumTestIssue  = tickets.reduce((s, t) => s + (t.etapas.testIssue  || 0), 0);
                const totalTouchTime   = sumInProcess + sumCodeReview + sumInTestDev + sumInTest;
                const totalLeadTime    = tickets.reduce((s, t) => s + (t.diasTotal || 0), 0);
                const activeAvg        = totalTouchTime / tickets.length;   // for bar widths only
                const waitingAvg       = (sumBlocked + sumTestIssue) / tickets.length;
                const flowEff          = totalLeadTime > 0 ? Math.round((totalTouchTime / totalLeadTime) * 100) : 0;
                const waitEff    = 100 - flowEff;
                // Benchmarks Lean para Touch Time inclusivo (4 etapas activas)
                const flowColor       = flowEff >= 60 ? '#10B981' : flowEff >= 30 ? '#F59E0B' : '#EF4444';
                const flowBg          = flowEff >= 60 ? '#D1FAE5' : flowEff >= 30 ? '#FEF3C7' : '#FEE2E2';
                const flowLabelColor  = flowEff >= 60 ? '#065F46' : flowEff >= 30 ? '#92400E' : '#991B1B';
                const flowLabel       = flowEff >= 60 ? 'Flujo Óptimo' : flowEff >= 30 ? 'Flujo Normal' : 'Flujo Crítico';
                const flowDesc        = flowEff >= 60
                    ? 'El equipo pasa la mayor parte del tiempo en trabajo activo (desarrollo + QA) — rendimiento Lean elite.'
                    : flowEff >= 30
                    ? 'Entre 30-60% de Touch Time es el rango típico de equipos Agile/Kanban maduros.'
                    : 'Menos del 30% de Touch Time: los impedimentos (Blocked / Test Issues) están consumiendo el flujo.';

                // ── Percentiles SLE ──────────────────────────────────────
                const SPRINT_DIAS    = 10; // días hábiles de un sprint de 2 semanas
                const nSinTiempo     = tickets.filter(t => (t.diasTotal||0) === 0).length;
                const nCicloLargo    = tickets.filter(t => (t.diasTotal||0) > SPRINT_DIAS).length;
                // Incluir TODOS los tickets con tiempo registrado (>0), sean del sprint o de ciclo largo
                // Los de ciclo largo se marcan visualmente pero NO se excluyen del SLE
                const sortedDias = tickets.map(t => t.diasTotal || 0).filter(d => d > 0).sort((a, b) => a - b);
                const n = sortedDias.length; // todos los tickets con tiempo (excluye diasTotal=0)
                const calcPct = (p) => {
                    if (n === 0) return 0;
                    const idx = Math.ceil((p / 100) * n) - 1;
                    return sortedDias[Math.max(0, idx)];
                };
                const p50 = calcPct(50);
                const p90 = calcPct(90);
                const p95 = calcPct(95);

                // Guardar datos globalmente para el popup SLE
                if (!window._sleData) window._sleData = {};
                window._sleData[`s${sprint}`] = {
                    p50, p90, p95, n, sortedDias: [...sortedDias],
                    tickets: tickets.map(t => ({
                        clave: t.clave, resumen: t.resumen,
                        diasTotal: t.diasTotal, prioridad: t.prioridad
                    })),
                    nSinTiempo, nCicloLargo, SPRINT_DIAS
                };

                // Semáforo por zone de sprint (2 semanas = 10d hábiles)
                // <5d = Excelente (< mitad sprint) | 5-10d = Normal (dentro del sprint) | >10d = Ciclo largo
                // Referencia: ActionableAgile SLE — los umbrales se anclan al tamaño del sprint
                const pColor = (d) => d < 5  ? '#10B981' : d <= 10 ? '#F59E0B' : '#EF4444';
                const pBg    = (d) => d < 5  ? '#D1FAE5' : d <= 10 ? '#FEF3C7' : '#FEE2E2';
                const pTxt   = (d) => d < 5  ? '#065F46' : d <= 10 ? '#92400E' : '#991B1B';
                const pLabel = (d) => d < 5  ? 'Excelente' : d <= 10 ? 'Normal' : 'Ciclo largo';
                // Zonas sprint-aligned (sortedDias = todos los tickets con tiempo > 0)
                const semGreen  = sortedDias.filter(d => d < 5).length;              // <5d  Excelente
                const semYellow = sortedDias.filter(d => d >= 5 && d <= 10).length;  // 5-10d Normal
                const semRed    = sortedDias.filter(d => d > 10).length;             // >10d  Ciclo largo
                // Valor representativo de cada zona = promedio dentro del rango
                const zoneAvg = (arr) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
                const zoneMaxGreen  = zoneAvg(sortedDias.filter(d => d <  5));
                const zoneMaxYellow = zoneAvg(sortedDias.filter(d => d >= 5 && d <= 10));
                const zoneMaxRed    = zoneAvg(sortedDias.filter(d => d >  10));

                return `
                        <div class="subsection" style="margin-top: 25px; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
                            <!-- Header desplegable -->
                            <div class="collapsible" onclick="toggleSection('sprint-${sprint}-content')" 
                                 style="background: linear-gradient(to right, #F3F4F6, #E5E7EB); padding: 12px 16px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: all 0.3s ease;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <span class="collapse-icon" id="icon-sprint-${sprint}-content" style="color: #6B7280; font-size: 18px; transition: transform 0.3s ease;">▼</span>
                                    <svg class="w-5 h-5" style="width: 20px; height: 20px; color: #6366F1;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                    </svg>
                                    <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #1F2937;">Sprint ${sprint}</h3>
                                </div>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="background: #EEF2FF; color: #6366F1; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">${tickets.length} tickets</span>
                                    <span style="background: #D1FAE5; color: #065F46; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">⌀ ${formatTime(avgTotal)}</span>
                                </div>
                            </div>
                            
                            <!-- Contenido desplegable -->
                            <div id="sprint-${sprint}-content" class="section-content-avanzado" style="padding: 16px;">

                                <!-- Promedio por etapa -->
                                <div style="margin-bottom: 20px; background: #FFFFFF; border-radius: 8px; border: 1px solid #E5E7EB; box-shadow: 0 1px 3px rgba(0,0,0,0.06); overflow: hidden;">
                                    <!-- Encabezado -->
                                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 11px 16px; background: #F9FAFB; border-bottom: 1px solid #E5E7EB;">
                                        <div style="display: flex; align-items: center; gap: 8px;">
                                            <svg style="width:15px;height:15px;color:#243F6B;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                                            </svg>
                                            <span style="font-size: 11px; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.8px;">Promedio por etapa</span>
                                        </div>
                                        <span style="font-size: 11px; color: #9CA3AF; font-weight: 400;">${tickets.length} tickets · Sprint ${sprint}</span>
                                    </div>
                                    <!-- Etapas -->
                                    <div style="display: flex; align-items: stretch; padding: 0; overflow-x: auto;">

                                        <!-- In Process -->
                                        <div style="flex: 1; min-width: 80px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 14px 8px; border-right: 1px solid #F3F4F6; gap: 6px;">
                                            <div style="width: 28px; height: 3px; border-radius: 2px; background: #4B71A1;"></div>
                                            <div style="font-size: 9px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.6px; text-align: center;">In Process</div>
                                            <div style="font-size: 17px; font-weight: 700; color: #4B71A1; letter-spacing: -0.3px;">${formatTime(avgInProcess)}</div>
                                        </div>

                                        <div style="display: flex; align-items: center; padding: 0 2px; color: #D1D5DB; font-size: 13px;">›</div>

                                        <!-- Code Review -->
                                        <div style="flex: 1; min-width: 80px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 14px 8px; border-right: 1px solid #F3F4F6; gap: 6px;">
                                            <div style="width: 28px; height: 3px; border-radius: 2px; background: #4B71A1;"></div>
                                            <div style="font-size: 9px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.6px; text-align: center;">Code Review</div>
                                            <div style="font-size: 17px; font-weight: 700; color: #4B71A1; letter-spacing: -0.3px;">${formatTime(avgCodeReview)}</div>
                                        </div>

                                        <div style="display: flex; align-items: center; padding: 0 2px; color: #D1D5DB; font-size: 13px;">›</div>

                                        <!-- Test Dev -->
                                        <div style="flex: 1; min-width: 80px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 14px 8px; border-right: 1px solid #F3F4F6; gap: 6px;">
                                            <div style="width: 28px; height: 3px; border-radius: 2px; background: #4B71A1;"></div>
                                            <div style="font-size: 9px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.6px; text-align: center;">Test Dev</div>
                                            <div style="font-size: 17px; font-weight: 700; color: #4B71A1; letter-spacing: -0.3px;">${formatTime(avgInTestDev)}</div>
                                        </div>

                                        <div style="display: flex; align-items: center; padding: 0 2px; color: #D1D5DB; font-size: 13px;">›</div>

                                        <!-- In Test -->
                                        <div style="flex: 1; min-width: 80px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 14px 8px; ${hasBlocked || hasTestIssue ? 'border-right: 1px solid #F3F4F6;' : ''} gap: 6px;">
                                            <div style="width: 28px; height: 3px; border-radius: 2px; background: #4B71A1;"></div>
                                            <div style="font-size: 9px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.6px; text-align: center;">In Test</div>
                                            <div style="font-size: 17px; font-weight: 700; color: #4B71A1; letter-spacing: -0.3px;">${formatTime(avgInTest)}</div>
                                        </div>

                                        ${hasBlocked ? `
                                        <div style="display: flex; align-items: center; padding: 0 2px; color: #D1D5DB; font-size: 13px;">›</div>
                                        <!-- Blocked -->
                                        <div style="flex: 1; min-width: 80px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 14px 8px; ${hasTestIssue ? 'border-right: 1px solid #F3F4F6;' : ''} gap: 6px;">
                                            <div style="width: 28px; height: 3px; border-radius: 2px; background: #4B71A1;"></div>
                                            <div style="font-size: 9px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.6px; text-align: center;">Blocked</div>
                                            <div style="font-size: 17px; font-weight: 700; color: #4B71A1; letter-spacing: -0.3px;">${formatTime(avgBlocked)}</div>
                                        </div>
                                        ` : ''}

                                        ${hasTestIssue ? `
                                        <div style="display: flex; align-items: center; padding: 0 2px; color: #D1D5DB; font-size: 13px;">›</div>
                                        <!-- Test Issue -->
                                        <div style="flex: 1; min-width: 80px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 14px 8px; gap: 6px;">
                                            <div style="width: 28px; height: 3px; border-radius: 2px; background: #4B71A1;"></div>
                                            <div style="font-size: 9px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.6px; text-align: center;">Test Issue</div>
                                            <div style="font-size: 17px; font-weight: 700; color: #4B71A1; letter-spacing: -0.3px;">${formatTime(avgTestIssue)}</div>
                                        </div>
                                        ` : ''}

                                        <!-- Divisor total -->
                                        <div style="width: 1px; background: #E5E7EB; margin: 10px 0;"></div>

                                        <!-- Total -->
                                        <div style="min-width: 90px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 14px 14px; background: #F8FAFF; gap: 6px;">
                                            <div style="width: 28px; height: 3px; border-radius: 2px; background: #243F6B;"></div>
                                            <div style="font-size: 9px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.6px; text-align: center;">Promedio</div>
                                            <div style="font-size: 18px; font-weight: 700; color: #243F6B; letter-spacing: -0.5px;">${formatTime(avgTotal)}</div>
                                        </div>
                                    </div>
                                </div>

                                <!-- ══ FLOW ANALYTICS CARD ══════════════════════════════════ -->
                                <div style="margin-bottom:20px;background:#FFFFFF;border-radius:8px;border:1px solid #E5E7EB;box-shadow:0 1px 3px rgba(0,0,0,0.06);overflow:hidden;">
                                    <!-- Header -->
                                    <div style="display:flex;align-items:center;justify-content:space-between;padding:11px 16px;background:#F9FAFB;border-bottom:1px solid #E5E7EB;">
                                        <div style="display:flex;align-items:center;gap:8px;">
                                            <svg style="width:15px;height:15px;color:#243F6B;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                            </svg>
                                            <span style="font-size:11px;font-weight:600;color:#374151;text-transform:uppercase;letter-spacing:0.8px;">Flow Analytics</span>
                                        </div>
                                        <!-- Distribución por velocidad (puntos + números) -->
                                        <div style="display:flex;align-items:center;gap:10px;">
                                            <span style="font-size:10px;color:#6B7280;">${tickets.length} tickets</span>
                                            <div style="display:flex;align-items:center;gap:4px;">
                                                <span style="width:6px;height:6px;border-radius:50%;background:#10B981;display:inline-block;"></span>
                                                <span style="font-size:11px;font-weight:600;color:#374151;">${semGreen}</span>
                                                <span style="font-size:9px;color:#9CA3AF;">&lt;5d</span>
                                            </div>
                                            <div style="display:flex;align-items:center;gap:4px;">
                                                <span style="width:6px;height:6px;border-radius:50%;background:#F59E0B;display:inline-block;"></span>
                                                <span style="font-size:11px;font-weight:600;color:#374151;">${semYellow}</span>
                                                <span style="font-size:9px;color:#9CA3AF;">5–10d</span>
                                            </div>
                                            <div style="display:flex;align-items:center;gap:4px;">
                                                <span style="width:6px;height:6px;border-radius:50%;background:#EF4444;display:inline-block;"></span>
                                                <span style="font-size:11px;font-weight:600;color:#374151;">${semRed}</span>
                                                <span style="font-size:9px;color:#9CA3AF;">&gt;10d</span>
                                            </div>
                                        </div>
                                    </div>
                                    <!-- Cuerpo: dos columnas -->
                                    <div style="display:grid;grid-template-columns:1fr 1px 1fr;">

                                        <!-- COLUMNA 1 — Flow Efficiency desglosado por etapa -->
                                        <div style="padding:16px 20px;">
                                            <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:14px;">
                                                <div style="font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.8px;">Flow Efficiency — desglose por etapa</div>
                                                <div style="display:flex;align-items:center;gap:6px;">
                                                    <span style="font-size:18px;font-weight:800;color:${flowColor};">${flowEff}%</span>
                                                    <span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:10px;background:${flowBg};color:${flowLabelColor};">${flowLabel}</span>
                                                </div>
                                            </div>

                                            <!-- Sección 1 — DESARROLLO -->
                                            <div style="font-size:9px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:6px;display:flex;align-items:center;gap:5px;">
                                                <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#243F6B;"></span> Desarrollo
                                            </div>
                                            ${[
                                                { label:'In Process',  val: avgInProcess,  pct: totalLeadTime > 0 ? Math.round((sumInProcess  / totalLeadTime)*100) : 0 },
                                                { label:'Code Review', val: avgCodeReview, pct: totalLeadTime > 0 ? Math.round((sumCodeReview / totalLeadTime)*100) : 0 }
                                            ].map(e => {
                                                const pctDisplay = (e.pct === 0 && (e.val||0) > 0) ? '<1%' : `${e.pct}%`;
                                                return `
                                                <div style="margin-bottom:7px;">
                                                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
                                                        <span style="font-size:11px;color:#374151;">${e.label}</span>
                                                        <div style="display:flex;align-items:center;gap:6px;">
                                                            <span style="font-size:11px;font-weight:600;color:#374151;">${formatTime(e.val)}</span>
                                                            <span style="font-size:10px;color:#243F6B;font-weight:700;width:32px;text-align:right;">${pctDisplay}</span>
                                                        </div>
                                                    </div>
                                                    <div style="height:7px;background:#E5E7EB;border-radius:4px;overflow:hidden;">
                                                        <div style="height:100%;width:${Math.max(e.pct,((e.val||0)>0?1:0))}%;background:#243F6B;border-radius:4px;"></div>
                                                    </div>
                                                </div>`;
                                            }).join('')}

                                            <!-- Sección 2 — VERIFICACIÓN Y CONTROL -->
                                            <div style="font-size:9px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.6px;margin:10px 0 6px;display:flex;align-items:center;gap:5px;">
                                                <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#64748B;"></span> Verificación y Control
                                            </div>
                                            ${[
                                                { label:'Test Dev', val: avgInTestDev, pct: totalLeadTime > 0 ? Math.round((sumInTestDev / totalLeadTime)*100) : 0 },
                                                { label:'In Test',  val: avgInTest,    pct: totalLeadTime > 0 ? Math.round((sumInTest    / totalLeadTime)*100) : 0 }
                                            ].map(e => {
                                                const pctDisplay = (e.pct === 0 && (e.val||0) > 0) ? '<1%' : `${e.pct}%`;
                                                return `
                                                <div style="margin-bottom:7px;">
                                                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
                                                        <span style="font-size:11px;color:#374151;">${e.label}</span>
                                                        <div style="display:flex;align-items:center;gap:6px;">
                                                            <span style="font-size:11px;font-weight:600;color:#374151;">${formatTime(e.val)}</span>
                                                            <span style="font-size:10px;color:#64748B;font-weight:700;width:32px;text-align:right;">${pctDisplay}</span>
                                                        </div>
                                                    </div>
                                                    <div style="height:7px;background:#E5E7EB;border-radius:4px;overflow:hidden;">
                                                        <div style="height:100%;width:${Math.max(e.pct,((e.val||0)>0?1:0))}%;background:#64748B;border-radius:4px;"></div>
                                                    </div>
                                                </div>`;
                                            }).join('')}

                                            <!-- Sección 3 — IMPEDIMENTOS (solo si hay) -->
                                            ${(avgBlocked > 0 || avgTestIssue > 0) ? `
                                            <div style="font-size:9px;font-weight:700;color:#991B1B;text-transform:uppercase;letter-spacing:0.6px;margin:10px 0 6px;display:flex;align-items:center;gap:5px;">
                                                <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#EF4444;"></span> Impedimentos
                                            </div>
                                            ${[
                                                { label:'Blocked',    val: avgBlocked,   pct: totalLeadTime > 0 ? Math.round((sumBlocked   / totalLeadTime)*100) : 0 },
                                                { label:'Test Issue', val: avgTestIssue, pct: totalLeadTime > 0 ? Math.round((sumTestIssue / totalLeadTime)*100) : 0 }
                                            ].filter(e => e.val > 0).map(e => {
                                                const pctDisplay = (e.pct === 0 && (e.val||0) > 0) ? '<1%' : `${e.pct}%`;
                                                return `
                                                <div style="margin-bottom:7px;">
                                                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
                                                        <span style="font-size:11px;color:#374151;">${e.label}</span>
                                                        <div style="display:flex;align-items:center;gap:6px;">
                                                            <span style="font-size:11px;font-weight:600;color:#374151;">${formatTime(e.val)}</span>
                                                            <span style="font-size:10px;color:#EF4444;font-weight:700;width:32px;text-align:right;">${pctDisplay}</span>
                                                        </div>
                                                    </div>
                                                    <div style="height:7px;background:#E5E7EB;border-radius:4px;overflow:hidden;">
                                                        <div style="height:100%;width:${Math.max(e.pct,1)}%;background:#EF4444;border-radius:4px;"></div>
                                                    </div>
                                                </div>`;
                                            }).join('')}` : ''}

                                            <!-- Benchmarks -->
                                            <div style="margin-top:10px;padding:7px 10px;background:${flowBg};border-radius:6px;border-left:3px solid ${flowColor};">
                                                <div style="font-size:10px;color:${flowLabelColor};line-height:1.5;">${flowDesc}</div>
                                            </div>
                                            <div style="margin-top:6px;display:flex;gap:5px;flex-wrap:wrap;align-items:center;">
                                                <span style="font-size:9px;padding:2px 6px;background:#D1FAE5;color:#065F46;border-radius:4px;">≥60% Óptimo</span>
                                                <span style="font-size:9px;padding:2px 6px;background:#FEF3C7;color:#92400E;border-radius:4px;">30–60% Normal</span>
                                                <span style="font-size:9px;padding:2px 6px;background:#FEE2E2;color:#991B1B;border-radius:4px;">&lt;30% Crítico</span>
                                                <span style="font-size:9px;color:#9CA3AF;">Lean Touch Time · Kanban Guide</span>
                                            </div>
                                        </div>

                                        <!-- Divisor vertical -->
                                        <div style="background:#E5E7EB;"></div>

                                        <!-- COLUMNA 2 — Percentiles SLE visual -->
                                        <div style="padding:16px 20px;">
                                            <div style="font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:14px;">Service Level Expectation</div>

                                            <!-- Barra de distribución de tickets por zona semáforo -->
                                            <div style="margin-bottom:14px;">
                                                <div style="font-size:9px;color:#9CA3AF;margin-bottom:5px;">
                                                    Distribución de los ${n} tickets por ciclo de trabajo
                                                    ${nCicloLargo > 0 ? `<span style="color:#EF4444;"> · ${nCicloLargo} con ciclo &gt;${SPRINT_DIAS}d</span>` : ''}
                                                    ${nSinTiempo > 0 ? `<span style="color:#9CA3AF;"> · ${nSinTiempo} sin tiempo en changelog</span>` : ''}
                                                </div>
                                                    <div style="height:6px;border-radius:6px;overflow:hidden;display:flex;gap:2px;">
                                                    ${semGreen  > 0 ? `<div style="flex:${semGreen};background:#A7F3D0;border-radius:4px 0 0 4px;" title="<5d: ${semGreen} tickets"></div>` : ''}
                                                    ${semYellow > 0 ? `<div style="flex:${semYellow};background:#FDE68A;${semRed===0?'border-radius:0 4px 4px 0;':''}" title="5-10d: ${semYellow} tickets"></div>` : ''}
                                                    ${semRed    > 0 ? `<div style="flex:${semRed};background:#FCA5A5;border-radius:0 4px 4px 0;" title=">10d: ${semRed} tickets"></div>` : ''}
                                                </div>
                                                <div style="display:flex;gap:12px;margin-top:5px;flex-wrap:wrap;">
                                                    ${semGreen  > 0 ? `<span style="font-size:9px;color:#6B7280;display:flex;align-items:center;gap:3px;"><span style='width:5px;height:5px;border-radius:50%;background:#10B981;display:inline-block;'></span>${semGreen} &lt;5d</span>` : ''}
                                                    ${semYellow > 0 ? `<span style="font-size:9px;color:#6B7280;display:flex;align-items:center;gap:3px;"><span style='width:5px;height:5px;border-radius:50%;background:#F59E0B;display:inline-block;'></span>${semYellow} 5–10d</span>` : ''}
                                                    ${semRed    > 0 ? `<span style="font-size:9px;color:#6B7280;display:flex;align-items:center;gap:3px;"><span style='width:5px;height:5px;border-radius:50%;background:#EF4444;display:inline-block;'></span>${semRed} &gt;10d</span>` : ''}
                                                </div>
                                            </div>

                                            <!-- Cards < 5d / 5–10d / > 10d con promedio de zona -->
                                            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px;">
                                                ${[
                                                    { p:'< 5d',  val:zoneMaxGreen,  color:'#10B981', bg:'#D1FAE5', txt:'#065F46', zoneCount:semGreen,  desc:`< 5d · ${semGreen}/${n} tickets`,   key:'zone_green'  },
                                                    { p:'5–10d', val:zoneMaxYellow, color:'#F59E0B', bg:'#FEF3C7', txt:'#92400E', zoneCount:semYellow, desc:`5–10d · ${semYellow}/${n} tickets`, key:'zone_yellow', sla:true },
                                                    { p:'> 10d', val:zoneMaxRed,    color:'#EF4444', bg:'#FEE2E2', txt:'#991B1B', zoneCount:semRed,    desc:`> 10d · ${semRed}/${n} tickets`,   key:'zone_red'    }
                                                ].map(item => `
                                                    <div style="text-align:center;padding:10px 6px;border-radius:8px;background:#FFFFFF;border:1px solid #E5E7EB;border-top:2px solid ${item.color};cursor:pointer;transition:box-shadow 0.15s;position:relative;"
                                                         onclick="showSLEPopup('s${sprint}', '${item.key}')"
                                                         onmouseenter="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.08)';"
                                                         onmouseleave="this.style.boxShadow='none';">
                                                        ${item.sla ? `<div style="position:absolute;top:-1px;left:50%;transform:translateX(-50%);font-size:8px;font-weight:700;background:#243F6B;color:#fff;padding:1px 8px;border-radius:0 0 6px 6px;letter-spacing:0.5px;">SLA</div>` : ''}
                                                        <div style="font-size:9px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;margin-top:${item.sla ? '8px' : '0'};">${item.p}</div>
                                                        <div style="font-size:17px;font-weight:800;color:#1F2937;line-height:1;">${formatTime(item.val)}</div>
                                                        <div style="margin-top:7px;display:flex;align-items:center;justify-content:center;gap:5px;">
                                                            <span style="font-size:10px;font-weight:600;color:${item.txt};background:${item.bg};padding:1px 6px;border-radius:4px;">✓ ${item.zoneCount}/${n}</span>
                                                        </div>
                                                        <div style="font-size:9px;color:#9CA3AF;margin-top:5px;line-height:1.3;">${item.desc}</div>
                                                        <div style="font-size:9px;color:#9CA3AF;margin-top:5px;">Ver tickets →</div>
                                                    </div>`
                                                ).join('')}
                                            </div>

                                            <!-- ── Percentile cards ─────────────────────────────── -->
                                            ${n > 0 ? (() => {
                                                const p50c = Math.round(n * 0.50);
                                                const p90c = Math.round(n * 0.90);
                                                const p95c = Math.round(n * 0.95);
                                                return `
                                            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px;background:#E5E7EB;border-radius:8px;overflow:hidden;margin-bottom:14px;">
                                                ${[
                                                    { label:'P50', val:p50, count:p50c, pct:50,  color:'#059669', bg:'#F0FDF4' },
                                                    { label:'P90', val:p90, count:p90c, pct:90,  color:'#D97706', bg:'#FFFBEB' },
                                                    { label:'P95', val:p95, count:p95c, pct:95,  color:'#DC2626', bg:'#FEF2F2' }
                                                ].map(it => `
                                                    <div style="background:${it.bg};padding:10px 12px;display:flex;flex-direction:column;gap:3px;">
                                                        <span style="font-size:9px;font-weight:700;color:${it.color};text-transform:uppercase;letter-spacing:0.7px;">${it.label}</span>
                                                        <span style="font-size:18px;font-weight:800;color:#1F2937;letter-spacing:-0.5px;line-height:1.1;">${formatTime(it.val)}</span>
                                                        <span style="font-size:9px;color:#6B7280;line-height:1.4;">${it.pct}% cerraron<br>≤ ${formatTime(it.val)} · <strong style="color:#374151;">${it.count}/${n}</strong></span>
                                                    </div>`
                                                ).join('')}
                                            </div>`;
                                            })() : ''}
                                            <!-- ── / Percentile cards ─────────────────────────────── -->

                                            <!-- Nota ciclo largo / sin tiempo -->
                                            ${nCicloLargo > 0 || nSinTiempo > 0 ? `
                                            <div style="margin-bottom:8px;padding:6px 10px;border-radius:6px;background:#F9FAFB;border:1px solid #E5E7EB;">
                                                <div style="font-size:10px;color:#6B7280;margin-bottom:3px;">
                                                    De los <strong>${tickets.length} tickets</strong> del sprint: <strong style="color:#374151;">${n}</strong> con tiempo registrado se usan en el cálculo.
                                                </div>
                                                <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
                                                    ${nCicloLargo > 0 ? `<span style="font-size:10px;color:#EF4444;">&#9888; ${nCicloLargo} con ciclo &gt;${SPRINT_DIAS}d <em style="color:#9CA3AF;">(incluidos en SLE)</em></span>` : ''}
                                                    ${nSinTiempo > 0 ? `<span style="font-size:10px;color:#9CA3AF;">&#9432; ${nSinTiempo} sin tiempo en changelog</span>` : ''}
                                                    ${nCicloLargo > 0 ? `<button onclick="showSLEPopup('s${sprint}', 'ciclolargo')" style="font-size:10px;font-weight:600;color:#EF4444;background:white;border:1px solid #FCA5A5;border-radius:5px;padding:2px 8px;cursor:pointer;">Ver ciclo largo</button>` : ''}
                                                    ${nSinTiempo > 0 ? `<button onclick="showSLEPopup('s${sprint}', 'sintiempo')" style="font-size:10px;font-weight:600;color:#6B7280;background:white;border:1px solid #D1D5DB;border-radius:5px;padding:2px 8px;cursor:pointer;">Ver sin tiempo</button>` : ''}
                                                </div>
                                            </div>` : ''}
                                        </div>
                                    </div>
                                </div>
                                <!-- ══ FIN FLOW ANALYTICS ════════════════════════════════════ -->

                                <!-- Contenedor con scroll para TODOS los tickets -->
                                <div style="max-height: 500px; overflow-y: auto; padding-right: 8px;">
                                    ${tickets.map(ticket => {
                                        const d = ticket.diasTotal || 0;
                                        const semaColor = pColor(d);
                                        return `
                                        <div style="margin-bottom: 12px; padding: 12px; background: white; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 3px solid ${semaColor}; transition: all 0.2s ease;" onmouseover="this.style.boxShadow='0 4px 6px rgba(0,0,0,0.15)'" onmouseout="this.style.boxShadow='0 1px 3px rgba(0,0,0,0.1)'">
                                            <!-- Header del ticket -->
                                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                                <div style="display: flex; align-items: center; gap: 8px;">
                                                    <strong style="font-size: 13px; color: #111827; font-weight: 600;">${ticket.clave}</strong>
                                                    <span style="padding: 2px 8px; background: ${ticket.prioridad === 'High' || ticket.prioridad === 'Highest' ? '#FEE2E2' : '#F3F4F6'}; color: ${ticket.prioridad === 'High' || ticket.prioridad === 'Highest' ? '#B91C1C' : '#4B5563'}; border-radius: 4px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">${ticket.prioridad}</span>
                                                </div>
                                                <div style="display: flex; align-items: center; gap: 6px;">
                                                    <svg class="w-4 h-4" style="width: 16px; height: 16px; color: #10B981;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span style="font-size: 15px; font-weight: 700; color: #10B981;">${formatTime(ticket.diasTotal)}</span>
                                                </div>
                                            </div>
                                            
                                            <div style="color: #6B7280; font-size: 11px; margin-bottom: 12px; line-height: 1.4;">${ticket.resumen.substring(0, 85)}${ticket.resumen.length > 85 ? '...' : ''}</div>
                                            
                                            <!-- Pipeline horizontal simple -->
                                            <div style="display: flex; justify-content: space-between; align-items: center; gap: 6px; padding: 10px; background: linear-gradient(to bottom, #F9FAFB, #F3F4F6); border-radius: 6px; border: 1px solid #E5E7EB;">
                                                
                                                <!-- In Process -->
                                                <div style="text-align: center; flex: 1;">
                                                    <div style="font-size: 9px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; font-weight: 600;">In Process</div>
                                                    <div style="font-size: 14px; font-weight: 700; color: ${(ticket.etapas.inProcess||0) > 0 ? '#06B6D4' : '#D1D5DB'};">${formatTime(ticket.etapas.inProcess)}</div>
                                                </div>

                                                ${[
                                                    { label:'Blocked',     val: ticket.etapas.blocked,    color:'#8B5CF6' },
                                                    { label:'Code Review', val: ticket.etapas.codeReview, color:'#10B981' },
                                                    { label:'Test Dev',    val: ticket.etapas.inTestDev,  color:'#F59E0B' },
                                                    { label:'In Test',     val: ticket.etapas.inTest,     color:'#EC4899' },
                                                    { label:'Test Issue',  val: ticket.etapas.testIssue,  color:'#F97316' }
                                                ].map(e => {
                                                    const hasTime = (e.val || 0) > 0;
                                                    return `
                                                    <svg style="width:14px;height:14px;color:#D1D5DB;flex-shrink:0;" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
                                                    </svg>
                                                    <div style="text-align:center;flex:1;${!hasTime ? 'opacity:0.4;' : ''}">
                                                        <div style="font-size:9px;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;font-weight:600;">${e.label}</div>
                                                        <div style="font-size:14px;font-weight:700;color:${hasTime ? e.color : '#D1D5DB'};">${formatTime(e.val)}</div>
                                                    </div>`;
                                                }).join('')}

                                                <!-- Finalizado -->
                                                <svg style="width:14px;height:14px;color:#D1D5DB;flex-shrink:0;" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
                                                </svg>
                                                <div style="text-align:center;flex:1;">
                                                    <div style="font-size:9px;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;font-weight:600;">Finalizado</div>
                                                    <div style="font-size:13px;font-weight:700;color:#9CA3AF;letter-spacing:1px;">N/A</div>
                                                </div>
                                            </div>
                                        </div>
                                    `; }).join('')}
                                </div>
                                
                                <!-- Contador al final -->
                                <div style="margin-top: 16px; padding: 12px; background: linear-gradient(to right, #EEF2FF, #E0E7FF); border-radius: 6px; text-align: center; border: 1px solid #C7D2FE;">
                                    <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                                        <svg class="w-5 h-5" style="width: 18px; height: 18px; color: #6366F1;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                        </svg>
                                        <span style="color: #4338CA; font-size: 14px; font-weight: 600;">
                                            Total: <strong style="font-size: 16px;">${tickets.length}</strong> tickets en este sprint
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

// ==================== REWORK SECTION ====================

/**
 * Renderiza la sección de Rework (Reprocesos)
 */
function renderReworkSection(rework) {
    // Colores por prioridad
    const PRIO_COLOR = {
        Highest: { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' },
        High:    { bg: '#FFEDD5', text: '#9A3412', dot: '#F97316' },
        Medium:  { bg: '#FEF9C3', text: '#854D0E', dot: '#EAB308' },
        Low:     { bg: '#DCFCE7', text: '#166534', dot: '#22C55E' },
    };
    const prioBadge = (p) => {
        const c = PRIO_COLOR[p] || { bg: '#F3F4F6', text: '#374151', dot: '#9CA3AF' };
        return `<span style="background:${c.bg};color:${c.text};padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;display:inline-flex;align-items:center;gap:4px;"><span style="width:6px;height:6px;border-radius:50%;background:${c.dot};display:inline-block;"></span>${p}</span>`;
    };

    // Header común
    const header = (extraBadge = '') => `
        <div class="section-header-avanzado collapsible" onclick="toggleSection('rework-content')"
             style="background:linear-gradient(to right,#F3F4F6,#E5E7EB);padding:12px 16px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;transition:all 0.3s ease;">
            <div style="display:flex;align-items:center;gap:12px;">
                <span class="collapse-icon" id="icon-rework-content" style="color:#6B7280;font-size:18px;transition:transform 0.3s ease;">▼</span>
                <svg style="width:20px;height:20px;color:#F97316;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                <h2 style="margin:0;font-size:16px;font-weight:600;color:#1F2937;">Reprocesos (Rework)</h2>
            </div>
            <div style="display:flex;gap:8px;align-items:center;">
                <span style="background:#EEF2FF;color:#4F46E5;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;">Sprint 35</span>
                ${extraBadge}
            </div>
        </div>`;

    if (!rework || rework.totalAnalizado === 0) {
        return `
            <div class="kpi-section-avanzado" style="border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;margin-bottom:20px;">
                ${header('<span style="background:#FEF3C7;color:#D97706;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;">Sin datos</span>')}
            </div>`;
    }

    // Umbrales basados en DORA Metrics + Lean/Agile
    // % Rework: ≤5% bueno, 5-10% atención, >10% crítico
    // Ciclos/ticket: ≤1.5 bueno, 1.5-2.5 atención, >2.5 crítico
    const pctStatus = rework.porcentaje <= 5  ? { bg: '#D1FAE5', text: '#065F46', ring: '#6EE7B7', label: 'Bueno',     icon: '✓', barColor: '#10B981' }
                    : rework.porcentaje <= 10 ? { bg: '#FEF3C7', text: '#92400E', ring: '#FCD34D', label: 'Atención',  icon: '⚠', barColor: '#F59E0B' }
                                              : { bg: '#FEE2E2', text: '#991B1B', ring: '#FCA5A5', label: 'Crítico',   icon: '✕', barColor: '#EF4444' };

    const ciclosPorTicket = rework.conRework > 0 ? (rework.ciclosTotales / rework.conRework) : 0;
    const ciclosStatus = ciclosPorTicket <= 1.5 ? { bg: '#D1FAE5', text: '#065F46', ring: '#6EE7B7', label: 'Bueno',    icon: '✓', barColor: '#10B981' }
                       : ciclosPorTicket <= 2.5 ? { bg: '#FEF3C7', text: '#92400E', ring: '#FCD34D', label: 'Atención', icon: '⚠', barColor: '#F59E0B' }
                                                : { bg: '#FEE2E2', text: '#991B1B', ring: '#FCA5A5', label: 'Crítico',  icon: '✕', barColor: '#EF4444' };

    // Barra de umbral visual: 0–20% de ancho máximo, marcadores en 5% y 10%
    const pctBarWidth   = Math.min((rework.porcentaje / 20) * 100, 100);
    const ciclosBarWidth = Math.min((ciclosPorTicket / 3) * 100, 100);

    // Tooltip helper: ⓘ con contenido emergente al hacer hover
    // Tooltip con position:fixed para escapar de contenedores overflow:hidden
    const tooltip = (id, content) =>
        `<span style="display:inline-block;cursor:help;margin-left:5px;vertical-align:middle;"
               onmouseenter="(function(el){var r=el.getBoundingClientRect(),t=document.getElementById('tt-${id}');t.style.display='block';var left=r.left+r.width/2-140;if(left<8)left=8;if(left+280>window.innerWidth-8)left=window.innerWidth-288;t.style.left=left+'px';t.style.top=(r.top-8)+'px';})(this)"
               onmouseleave="document.getElementById('tt-${id}').style.display='none'">
            <svg style="width:13px;height:13px;color:#9CA3AF;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
        </span>
        <div id="tt-${id}" style="display:none;position:fixed;transform:translateY(-100%);
             width:280px;background:#1E293B;color:#F1F5F9;font-size:11px;line-height:1.5;font-weight:400;
             padding:10px 12px;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.3);z-index:99999;pointer-events:none;
             text-align:left;white-space:normal;">
            ${content}
            <div style="position:absolute;top:100%;left:50%;transform:translateX(-50%);
                 width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;
                 border-top:6px solid #1E293B;"></div>
        </div>`;

    const badgeStatus = rework.conRework === 0
        ? '<span style="background:#D1FAE5;color:#065F46;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;">✓ Sin reprocesos</span>'
        : `<span style="background:${pctStatus.bg};color:${pctStatus.text};padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;">${rework.conRework} con reproceso</span>`;

    // Flujo visual
    const flujoHtml = `
        <div style="display:flex;align-items:center;gap:6px;padding:10px 14px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;margin-bottom:16px;flex-wrap:wrap;">
            <span style="font-size:10px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:.5px;">Flujo detectado:</span>
            <span style="background:#DBEAFE;color:#1E40AF;padding:3px 10px;border-radius:6px;font-size:11px;font-weight:600;">In Test</span>
            <svg style="width:14px;height:14px;color:#94A3B8;" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
            <span style="background:#FEE2E2;color:#991B1B;padding:3px 10px;border-radius:6px;font-size:11px;font-weight:600;">Test Issues</span>
            <svg style="width:14px;height:14px;color:#94A3B8;" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
            <span style="background:#ECFDF5;color:#065F46;padding:3px 10px;border-radius:6px;font-size:11px;font-weight:600;">Code Review / In Process</span>
        </div>`;

    // KPI cards con umbrales y tooltips
    const cards = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:20px;">

            <!-- Tickets analizados -->
            <div style="background:white;border:1px solid #E5E7EB;border-radius:10px;padding:16px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,.06);">
                <div style="font-size:11px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;">Tickets analizados</div>
                <div style="font-size:32px;font-weight:800;color:#1F2937;line-height:1;">${rework.totalAnalizado}</div>
                <div style="font-size:10px;color:#9CA3AF;margin-top:4px;">Sprint 35 · Todos los estados</div>
            </div>

            <!-- % con reproceso + umbral DORA -->
            <div style="background:${pctStatus.bg};border:1px solid ${pctStatus.ring};border-radius:10px;padding:16px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,.06);">
                <div style="display:flex;align-items:center;justify-content:center;gap:4px;margin-bottom:6px;">
                    <span style="font-size:11px;color:${pctStatus.text};font-weight:600;text-transform:uppercase;letter-spacing:.5px;">% con reproceso</span>
                    ${tooltip('rework-pct',
                        '<strong style="color:#93C5FD;">DORA · Change Failure Rate</strong><br>' +
                        'Porcentaje de tickets que requirieron retrabajo (regresaron de QA a Dev).<br><br>' +
                        '<span style="color:#86EFAC;">✓ Bueno</span> ≤ 5% · Equipos maduros con DoD sólido<br>' +
                        '<span style="color:#FDE68A;">⚠ Atención</span> 5–10% · Proceso bajo control<br>' +
                        '<span style="color:#FCA5A5;">✕ Crítico</span> > 10% · Problemas sistémicos<br><br>' +
                        '<span style="color:#CBD5E1;">El Change Failure Rate es la métrica DORA más cercana a nuestro % Rework — ambos miden la tasa de trabajo que tuvo que rehacerse por defectos de calidad. Los umbrales (≤5% bueno, >10% crítico) están basados en los benchmarks que DORA publica para equipos Elite/High.</span><br><br>' +
                        '<em style="color:#94A3B8;font-size:10px;">Ref: Accelerate (Forsgren et al.) · DORA 2023</em>'
                    )}
                </div>
                <div style="font-size:32px;font-weight:800;color:${pctStatus.text};line-height:1;">${rework.porcentaje}%</div>
                <div style="font-size:10px;color:${pctStatus.text};opacity:.75;margin-top:4px;">${rework.conRework} / ${rework.totalAnalizado} tickets</div>
                <!-- Barra de umbral -->
                <div style="margin-top:10px;position:relative;height:5px;background:#E5E7EB;border-radius:3px;overflow:hidden;">
                    <div style="position:absolute;left:0;top:0;height:100%;width:${pctBarWidth}%;background:${pctStatus.barColor};border-radius:3px;transition:width .4s ease;"></div>
                    <!-- Marcador 5% -->
                    <div style="position:absolute;left:25%;top:-1px;height:7px;width:1.5px;background:rgba(0,0,0,.2);"></div>
                    <!-- Marcador 10% -->
                    <div style="position:absolute;left:50%;top:-1px;height:7px;width:1.5px;background:rgba(0,0,0,.2);"></div>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:9px;color:${pctStatus.text};opacity:.6;margin-top:3px;">
                    <span>0%</span><span>5%</span><span>10%</span><span>20%</span>
                </div>
                <!-- Estado -->
                <div style="margin-top:8px;display:inline-flex;align-items:center;gap:4px;background:rgba(255,255,255,.5);padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;color:${pctStatus.text};">
                    ${pctStatus.icon} ${pctStatus.label}
                </div>
            </div>

            <!-- Ciclos totales -->
            <div style="background:white;border:1px solid #E5E7EB;border-radius:10px;padding:16px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,.06);">
                <div style="font-size:11px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;">Ciclos totales</div>
                <div style="font-size:32px;font-weight:800;color:#F97316;line-height:1;">${rework.ciclosTotales}</div>
                <div style="font-size:10px;color:#9CA3AF;margin-top:4px;">In Test → Test Issues → Dev</div>
            </div>

            <!-- Ciclos / ticket con reproceso -->
            <div style="background:${ciclosStatus.bg};border:1px solid ${ciclosStatus.ring};border-radius:10px;padding:16px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,.06);">
                <div style="display:flex;align-items:center;justify-content:center;gap:4px;margin-bottom:6px;">
                    <span style="font-size:11px;color:${ciclosStatus.text};font-weight:600;text-transform:uppercase;letter-spacing:.5px;">Ciclos / ticket</span>
                    ${tooltip('rework-ciclos',
                        '<strong style="color:#93C5FD;">Lean · Rework Rate per Item</strong><br>' +
                        'Promedio de veces que un ticket con reproceso rebotó entre QA y Dev. Un valor alto indica defectos recurrentes o criterios de aceptación poco claros.<br><br>' +
                        '<span style="color:#86EFAC;">✓ Bueno</span> ≤ 1.5 ciclos/ticket<br>' +
                        '<span style="color:#FDE68A;">⚠ Atención</span> 1.5–2.5<br>' +
                        '<span style="color:#FCA5A5;">✕ Crítico</span> > 2.5 · Deuda de calidad<br><br>' +
                        '<em style="color:#94A3B8;font-size:10px;">Ref: Lean Software Development · Poppendieck</em>'
                    )}
                </div>
                <div style="font-size:32px;font-weight:800;color:${ciclosStatus.text};line-height:1;">${ciclosPorTicket.toFixed(1)}</div>
                <div style="font-size:10px;color:${ciclosStatus.text};opacity:.75;margin-top:4px;">${rework.ciclosTotales} ciclos · ${rework.conRework} tickets</div>
                <!-- Barra de umbral -->
                <div style="margin-top:10px;position:relative;height:5px;background:#E5E7EB;border-radius:3px;overflow:hidden;">
                    <div style="position:absolute;left:0;top:0;height:100%;width:${ciclosBarWidth}%;background:${ciclosStatus.barColor};border-radius:3px;transition:width .4s ease;"></div>
                    <div style="position:absolute;left:50%;top:-1px;height:7px;width:1.5px;background:rgba(0,0,0,.2);"></div>
                    <div style="position:absolute;left:83.3%;top:-1px;height:7px;width:1.5px;background:rgba(0,0,0,.2);"></div>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:9px;color:${ciclosStatus.text};opacity:.6;margin-top:3px;">
                    <span>0</span><span>1.5</span><span>2.5</span><span>3</span>
                </div>
                <div style="margin-top:8px;display:inline-flex;align-items:center;gap:4px;background:rgba(255,255,255,.5);padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;color:${ciclosStatus.text};">
                    ${ciclosStatus.icon} ${ciclosStatus.label}
                </div>
            </div>

        </div>`;

    // Tabla de tickets con reproceso
    const tablaTickets = rework.conRework === 0
        ? `<div style="text-align:center;padding:24px;background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;">
               <div style="font-size:32px;margin-bottom:8px;">✅</div>
               <div style="font-weight:600;color:#166534;font-size:15px;">Sin reprocesos detectados</div>
               <div style="color:#16A34A;font-size:12px;margin-top:4px;">Todos los tickets completaron el flujo sin regresar al desarrollo</div>
           </div>`
        : `<div style="border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;">
               <table style="width:100%;border-collapse:collapse;font-size:12px;">
                   <thead>
                       <tr style="background:linear-gradient(to right,#1E293B,#334155);color:white;">
                           <th style="padding:10px 14px;text-align:left;font-weight:600;font-size:11px;letter-spacing:.5px;text-transform:uppercase;">Ticket</th>
                           <th style="padding:10px 14px;text-align:left;font-weight:600;font-size:11px;letter-spacing:.5px;text-transform:uppercase;">Resumen</th>
                           <th style="padding:10px 14px;text-align:center;font-weight:600;font-size:11px;letter-spacing:.5px;text-transform:uppercase;">Prioridad</th>
                           <th style="padding:10px 14px;text-align:center;font-weight:600;font-size:11px;letter-spacing:.5px;text-transform:uppercase;">Ciclos</th>
                           <th style="padding:10px 14px;text-align:left;font-weight:600;font-size:11px;letter-spacing:.5px;text-transform:uppercase;">Detalle de ciclos</th>
                       </tr>
                   </thead>
                   <tbody>
                       ${rework.detalle.map((t, idx) => `
                           <tr style="background:${idx % 2 === 0 ? 'white' : '#F9FAFB'};border-bottom:1px solid #F3F4F6;">
                               <td style="padding:10px 14px;font-weight:700;color:#4F46E5;white-space:nowrap;">${t.clave}</td>
                               <td style="padding:10px 14px;color:#374151;max-width:260px;word-break:break-word;">${t.resumen.substring(0, 70)}${t.resumen.length > 70 ? '…' : ''}</td>
                               <td style="padding:10px 14px;text-align:center;">${prioBadge(t.prioridad)}</td>
                               <td style="padding:10px 14px;text-align:center;">
                                   <span style="background:${t.ciclos > 1 ? '#FEE2E2' : '#FFEDD5'};color:${t.ciclos > 1 ? '#991B1B' : '#9A3412'};padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;">${t.ciclos}</span>
                               </td>
                               <td style="padding:10px 14px;">
                                   ${t.ciclosDetalle.map(c => `
                                       <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;flex-wrap:wrap;">
                                           <span style="background:#DBEAFE;color:#1E40AF;padding:1px 7px;border-radius:4px;font-size:10px;font-weight:600;">In Test</span>
                                           <span style="color:#CBD5E1;font-size:10px;">→</span>
                                           <span style="background:#FEE2E2;color:#991B1B;padding:1px 7px;border-radius:4px;font-size:10px;font-weight:600;">Test Issues <em style="font-style:normal;opacity:.75;">(${typeof c.testIssuesDias === 'number' ? c.testIssuesDias.toFixed(1) : c.testIssuesDias}d)</em></span>
                                           <span style="color:#CBD5E1;font-size:10px;">→</span>
                                           <span style="background:#ECFDF5;color:#065F46;padding:1px 7px;border-radius:4px;font-size:10px;font-weight:600;">${c.vueltaA}</span>
                                       </div>`).join('')}
                               </td>
                           </tr>`).join('')}
                   </tbody>
               </table>
           </div>`;

    return `
        <div class="kpi-section-avanzado" style="border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;margin-bottom:20px;">
            ${header(badgeStatus)}
            <div id="rework-content" class="section-content-avanzado" style="padding:16px;">
                ${flujoHtml}
                ${cards}
                <div style="font-size:13px;font-weight:600;color:#374151;margin-bottom:10px;">
                    Tickets con reproceso detectado
                    ${rework.conRework > 0 ? `<span style="background:#EEF2FF;color:#4F46E5;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;margin-left:8px;">${rework.conRework} tickets</span>` : ''}
                </div>
                ${tablaTickets}
            </div>
        </div>`;
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
