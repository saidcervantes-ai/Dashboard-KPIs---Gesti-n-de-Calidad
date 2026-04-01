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
    
    // Para edad de tickets, mostrar tickets arrastrados del Sprint 37 al 38
    // (tickets que estaban en progreso y no se finalizaron en S37)
    const sprintsAbiertos = ['38'];
    
    // KPIs de calidad: sprints cerrados acumulados (35 + 36 + 37)
    const sprintsCalidad = ['35', '36', '37'];
    
    // Lead Time: sprints cerrados (mismo array que sprintsCalidad)
    const SPRINTS_LEAD_TIME = ['35', '36', '37'];
    
    // Sprints para los nuevos KPIs (31–38, sin el masivo S30)
    const sprintsVelocidad = ['31', '32', '33', '34', '35', '36', '37', '38'];

    return {
        leadTimes: SPRINTS_LEAD_TIME.map(s => ({ sprint: s, data: calcularLeadTime(tickets, s) })),
        edadTickets: calcularEdadTickets(tickets, sprintsAbiertos),
        analisisErrores: calcularAnalisisErrores(tickets),
        cycleTime: calcularCycleTime(tickets, sprintsCalidad),
        rework: calcularRework(tickets, sprintsCalidad),
        cargaPersona: calcularCargaPersona(tickets, sprintsCalidad),
        scopeCreep: calcularScopeCreep(tickets, sprintsVelocidad),
        velocidad: calcularVelocidadSprint(tickets, sprintsVelocidad),
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
/**
 * Devuelve el estado actual real del ticket desde el changelog
 * (la última transición cuyo fin === 'En curso', es decir el estado en el que está ahora)
 */
function obtenerEstadoActualDesdeChangelog(issueKey) {
    if (typeof changelogData === 'undefined' || !changelogData[issueKey]) return null;
    const historial = changelogData[issueKey];
    // Buscar la transición que sigue activa (fin === 'En curso')
    const activa = historial.find(t => t.fin === 'En curso');
    return activa ? activa.estado : null;
}

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
    
    // Sumar días de cada transición - MANTENER VALORES DEL CHANGELOG TAL COMO ESTÁN
    // Los valores de "dias" en el changelog son precisos y ya están calculados correctamente
    historial.forEach(transition => {
        const estadoNorm = normalizarEstado(transition.estado);
        if (!ESTADOS_TRACKING.includes(estadoNorm)) return;

        // Usar SIEMPRE el valor de "dias" del changelog
        // NO recalcular desde "inicio" hacia "hoy", ya que el changelog tiene valores precisos
        let dias = transition.dias || 0;

        diasPorEstado[estadoNorm] += dias;
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
    
    // Filtrar solo tickets abiertos (NO finalizados, NO "Tareas por hacer")
    const EXCLUIR_ESTADOS = ['finalizados', 'tareas por hacer', 'to do', 'backlog'];
    let ticketsAbiertos = tickets.filter(t => {
        const enNorm = (t.estadoNormalizado || '').toLowerCase().trim();
        const enActual = (t.estado || '').toLowerCase().trim();
        return !EXCLUIR_ESTADOS.includes(enNorm) && !EXCLUIR_ESTADOS.includes(enActual) && t.creada;
    });
    
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
    
    // Solo tickets activos en estados de tracking (Finalizados y Tareas por hacer excluidos arriba)
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
        
        // Obtener el estado actual real desde el changelog (no el normalizado "Arrastrado")
        const estadoRealChangelog = obtenerEstadoActualDesdeChangelog(t.clave);
        
        // Debug para primeros 3 tickets
        if (ticketsAbiertos.indexOf(t) < 3) {
            console.log(`[Edad Tickets] Ticket ${t.clave}: diasEnTracking = ${diasEnTracking}`, diasPorEstado, 'estado real:', estadoRealChangelog);
        }
        
        // Si no hay tiempo en changelog (datos desactualizados), usar edad real como fallback
        const diasEnTrackingFinal = diasEnTracking > 0
            ? Math.round(diasEnTracking * 10) / 10
            : Math.max(0, edadDias);

        return {
            ...t,
            edadDias: Math.max(0, edadDias),
            diasPorEstado: diasPorEstado,
            diasEnTracking: diasEnTrackingFinal,
            estadoActualReal: estadoRealChangelog || t.estado || t.estadoNormalizado,
            sinDatosChangelog: diasEnTracking === 0  // flag para indicar que usamos fallback
        };
    })
    .sort((a, b) => b.diasEnTracking - a.diasEnTracking) // Ordenar por días en tracking DESC
    .filter(t => {
        // Excluir tickets cuyo estado actual sea "Tareas por hacer" o "To do"
        const estadoReal = (t.estadoActualReal || '').toLowerCase().trim();
        return !['tareas por hacer', 'to do', 'backlog'].includes(estadoReal);
    });
    
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
    
    // FILTRO CRÍTICO: Solo tickets finalizados o en curso (NO "Tareas por hacer" ni "Arrastrado")
    // "Arrastrado" se excluye porque esos tickets ya se cuentan en el sprint siguiente,
    // incluirlos inflaría el denominador con Features de alto SP y diluiría el % de Bugs.
    const ticketsValidos = tickets.filter(t => {
        const estadoNorm = (t.estadoNormalizado || '').toLowerCase();
        const estadoRaw  = (t.estado || '').toLowerCase();
        const excluirEstados = ['tareas por hacer', 'to do', 'backlog'];
        return !excluirEstados.some(estado => estadoNorm.includes(estado))
            && estadoRaw !== 'arrastrado';
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
            
            // Calcular Story Points para todos los sprints (vista de esfuerzo)
            let spData = null;
            {
                const getSP = (t) => parseFloat(t.storyPointEstimate) || 0;
                const bugsSP    = bugs.reduce((sum, t) => sum + getSP(t), 0);
                const tasksSP   = tasks.reduce((sum, t) => sum + getSP(t), 0);
                const storiesSP = stories.reduce((sum, t) => sum + getSP(t), 0);
                const otrosSP   = otros.reduce((sum, t) => sum + getSP(t), 0);
                const totalSP   = bugsSP + tasksSP + storiesSP + otrosSP;
                const funcSP    = tasksSP + storiesSP;
                // Solo mostrar spData si hay al menos un ticket con SP estimado
                if (totalSP > 0) {
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
                    console.log(`[Sprint ${sprint} SP] Bugs: ${bugsSP}SP (${spData.bugsPct}%), Tasks: ${tasksSP}SP, Stories: ${storiesSP}SP, Total: ${totalSP}SP`);
                }
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
function calcularCycleTime(tickets, sprintsCalidad = ['35', '36', '37']) {
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

    // Helpers locales: calcular minutos hábiles desde inicio/fin en changelog
    const MINS_POR_DIA = 9 * 60; // 540
    const MIN_CARRIL_MINS_S35_S36 = 30; // 0.5h

    function parseFechaChangelog(fechaStr) {
        if (!fechaStr || fechaStr === 'En curso') return null;
        const [fecha, hora] = String(fechaStr).trim().split(' ');
        if (!fecha || !hora) return null;
        const [dd, mm, yyyy] = fecha.split('/').map(Number);
        const [HH, MM] = hora.split(':').map(Number);
        if (!dd || !mm || !yyyy) return null;
        return new Date(yyyy, mm - 1, dd, HH || 0, MM || 0, 0);
    }

    function minutosHabiles(inicio, fin) {
        if (!inicio || !fin || fin <= inicio) return 0;
        let total = 0;
        // iterar día por día (L-V 08:00–17:00)
        let current = new Date(inicio.getTime());
        while (current < fin) {
            const dow = current.getDay(); // 0=Dom..6=Sab
            if (dow >= 1 && dow <= 5) {
                const y = current.getFullYear();
                const m = current.getMonth();
                const d = current.getDate();
                const labInicio = new Date(y, m, d, 8, 0, 0);
                const labFin = new Date(y, m, d, 17, 0, 0);
                const desde = current > labInicio ? current : labInicio;
                const hasta = fin < labFin ? fin : labFin;
                if (hasta > desde) total += (hasta - desde) / 60000;
            }
            current = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1, 0, 0, 0);
        }
        return Math.max(0, Math.round(total));
    }

    function minutosCalendario(inicio, fin) {
        if (!inicio || !fin || fin <= inicio) return 0;
        return Math.max(0, Math.ceil((fin - inicio) / 60000));
    }

    const ticketsConDetalle = ticketsFinalizados.map(t => {
        const historial = (typeof changelogData !== 'undefined') ? changelogData[t.clave] : null;

        const sprintNum = String(t.sprint || '').trim();
        const aplicarMinimoCarril = (sprintNum === '35' || sprintNum === '36');

        const etapasMins = {
            inProcess: 0,
            codeReview: 0,
            inTestDev: 0,
            inTest: 0,
            blocked: 0,
            testIssue: 0,
        };
        // Registra qué etapas fueron realmente visitadas (aunque el tiempo sea 0)
        // para aplicar el mínimo de 0.5h también en transiciones instantáneas/fuera de horario.
        const etapasVisitadas = new Set();

        if (historial && historial.length > 0) {
            historial.forEach(entrada => {
                const key = (entrada.estado || '').toLowerCase().trim();
                if (estadosIgnorar.has(key)) return;
                const etapa = estadoAEtapa[key];
                if (!etapa) return;

                etapasVisitadas.add(etapa); // marcar como visitada independientemente del tiempo

                const ini = parseFechaChangelog(entrada.inicio);
                const fin = parseFechaChangelog(entrada.fin);
                let mins = 0;
                if (ini && fin) {
                    const minsHab = minutosHabiles(ini, fin);
                    mins = minsHab;

                    // Opción C (Sprint 35/36): si la transición fue fuera de horario hábil
                    // pero duró ≤5h en tiempo real, usar el tiempo real.
                    // Esto captura trabajo nocturno corto sin inflar estados largos de fin de semana.
                    // Separado del umbral mínimo de 0.5h que aplica al final del bloque.
                    if (aplicarMinimoCarril && minsHab === 0) {
                        const minsReal = minutosCalendario(ini, fin);
                        if (minsReal > 0 && minsReal <= 300) {
                            mins = minsReal; // usar tiempo real (max 5h)
                        }
                    }
                } else {
                    // Fallback por si falta timestamp (no debería para estados intermedios)
                    const dias = parseFloat(entrada.dias) || 0;
                    mins = Math.round(dias * MINS_POR_DIA);
                }
                if (mins > 0) etapasMins[etapa] += mins;
            });
        }

        // Umbral mínimo por carril SOLO para Sprint 35/36:
        // Aplica si la etapa fue visitada (aunque el tiempo computado sea 0 por transición
        // instantánea o fuera de horario >5h). Etapas no visitadas se quedan en 0h.
        if (aplicarMinimoCarril) {
            Object.keys(etapasMins).forEach(k => {
                const v = etapasMins[k] || 0;
                if (etapasVisitadas.has(k) && v < MIN_CARRIL_MINS_S35_S36) {
                    etapasMins[k] = MIN_CARRIL_MINS_S35_S36;
                }
            });
        }

        const etapas = {};
        let diasActivosTotal = 0;
        Object.keys(etapasMins).forEach(k => {
            const dias = (etapasMins[k] || 0) / MINS_POR_DIA;
            etapas[k] = dias;
            diasActivosTotal += dias;
        });

        // Fallback: si no hay changelog o todo quedó en 0, usar lead time calendario
        if ((!historial || historial.length === 0) || diasActivosTotal === 0) {
            const creada = parsearFechaAvanzada(t.creada);
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
            storyPoints: parseFloat(t.storyPointEstimate) || null,
            diasTotal: diasActivosTotal,
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
function calcularReworkPorSprint(tickets, sprint) {
    const ESTADO_IN_TEST   = 'in test';
    const ESTADO_TEST_ISSUES = 'test issues';

    // Rango de fechas por sprint (para asignar reprocesos al sprint correcto)
    // Sprint 35: 16 Feb 2026 - 02 Mar 2026
    // Sprint 36: 02 Mar 2026 - 16 Mar 2026 (completeDate: 16/03/2026 18:34)
    // Sprint 37: 16 Mar 2026 - 30 Mar 2026 (completeDate: 30/03/2026 12:36)
    // Sprint 38: 29 Mar 2026 - activo (startDate: 29/03/2026 06:00)
    const SPRINT_RANGES = {
        '35': { start: new Date(2026, 1, 16, 0, 0, 0),  end: new Date(2026, 2, 2, 0, 0, 0) },
        '36': { start: new Date(2026, 2, 2, 0, 0, 0),   end: new Date(2026, 2, 16, 7, 0, 0) },
        '37': { start: new Date(2026, 2, 16, 7, 0, 0),  end: new Date(2026, 2, 30, 12, 36, 0) },
        '38': { start: new Date(2026, 2, 29, 6, 0, 0),  end: null },
    };

    function parseFechaChangelog(fechaStr) {
        if (!fechaStr || fechaStr === 'En curso') return null;
        // Formato esperado: dd/MM/yyyy HH:mm
        const [fecha, hora] = String(fechaStr).trim().split(' ');
        if (!fecha || !hora) return null;
        const [dd, mm, yyyy] = fecha.split('/').map(Number);
        const [HH, MM] = hora.split(':').map(Number);
        if (!dd || !mm || !yyyy) return null;
        return new Date(yyyy, mm - 1, dd, HH || 0, MM || 0, 0);
    }

    function fechaEnSprint(fecha, sprintNum) {
        if (!fecha) return false;
        const r = SPRINT_RANGES[String(sprintNum)];
        if (!r) return false;
        if (r.end) return fecha >= r.start && fecha < r.end;
        return fecha >= r.start;
    }

    // Solo tickets Finalizados del sprint (excluye En curso, Tareas por hacer, Arrastrado)
    const ticketsSprint = tickets.filter(t =>
        String(t.sprint || '').trim() === sprint && t.estadoNormalizado === 'Finalizados'
    );
    console.log('[Rework] Sprint', sprint, ':', ticketsSprint.length, 'tickets (solo Finalizados)');

    if (ticketsSprint.length === 0 || typeof changelogData === 'undefined') {
        return { sprint, totalAnalizado: 0, conRework: 0, porcentaje: 0, ciclosTotales: 0, detalle: [] };
    }

    const detalle = [];

    ticketsSprint.forEach(ticket => {
        const historial = changelogData[ticket.clave];
        if (!historial || historial.length < 2) return;

        let ciclos = 0;
        const ciclosDetalle = [];

        for (let i = 0; i < historial.length - 1; i++) {
            const estadoActual = (historial[i].estado || '').toLowerCase().trim();
            const estadoSig    = (historial[i + 1].estado || '').toLowerCase().trim();
            const estadoDespues = i + 2 < historial.length ? historial[i + 2].estado : null;

            if (estadoActual === ESTADO_IN_TEST && estadoSig === ESTADO_TEST_ISSUES) {
                // Asignar el ciclo al sprint según la fecha en que entra a Test Issues
                const fechaCiclo = parseFechaChangelog(historial[i + 1].inicio);
                if (!fechaEnSprint(fechaCiclo, sprint)) {
                    i += 1;
                    continue;
                }
                ciclos++;
                ciclosDetalle.push({
                    desde: historial[i].inicio,
                    testIssuesDias: historial[i + 1].dias,
                    vueltaA: estadoDespues || '—',
                });
                i += 1;
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
    const porcentaje = ticketsSprint.length > 0
        ? ((conRework / ticketsSprint.length) * 100).toFixed(1)
        : '0.0';

    console.log('[Rework] Sprint', sprint, '- con rework:', conRework, '| ciclos:', ciclosTotales);

    return {
        sprint,
        totalAnalizado: ticketsSprint.length,
        conRework,
        porcentaje: parseFloat(porcentaje),
        ciclosTotales,
        detalle,
    };
}

function calcularRework(tickets, sprintsCalidad) {
    const sprints = sprintsCalidad || ['35', '36'];
    return sprints.map(sp => calcularReworkPorSprint(tickets, sp));
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
        
        ${renderLeadTimeSection(kpis.leadTimes)}
        ${renderCycleTimeSection(kpis.cycleTime)}
        ${renderReworkSection(kpis.rework)}
        ${renderEdadTicketsSection(kpis.edadTickets)}
        ${renderAnalisisErroresSection(kpis.analisisErrores)}
        ${renderCargaPersonaSection(kpis.cargaPersona)}
    `;
    
    container.innerHTML = html;
    
    // Inicializar iconos de Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    console.log('[KPIs Avanzados] Renderizado completado');
}

// ==================== SECCIÓN LEAD TIME ====================

function renderLeadTimeSection(leadTimesArray) {
    const items = Array.isArray(leadTimesArray) ? leadTimesArray : [leadTimesArray];

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

            <div class="section-content-avanzado" id="leadtime-content">
                ${items.map(({ sprint, data }) => {
                    if (!data || data.total === 0) return `
                        <div style="padding: 16px; color: #6B7280; font-size: 13px;">Sprint ${sprint}: Sin datos de tickets finalizados.</div>`;

                    return `
                        <div class="subsection" style="margin: 16px 16px 0; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
                            <!-- Header desplegable por sprint -->
                            <div class="collapsible" onclick="toggleSection('leadtime-sprint-${sprint}-content')"
                                 style="background: linear-gradient(to right, #F3F4F6, #E5E7EB); padding: 12px 16px; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: all 0.3s ease;">
                                <span class="collapse-icon" id="icon-leadtime-sprint-${sprint}-content" style="color: #6B7280; font-size: 18px; transition: transform 0.3s ease;">▼</span>
                                <svg style="width: 20px; height: 20px; color: #8B5CF6; flex-shrink:0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                </svg>
                                <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #1F2937;">Sprint ${sprint}</h3>
                            </div>

                            <!-- Contenido del sprint -->
                            <div id="leadtime-sprint-${sprint}-content" class="section-content-avanzado" style="padding: 16px;">

                                <!-- Tarjeta resumen sprint -->
                                <div style="display: flex; align-items: center; gap: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 14px 20px; margin-bottom: 16px;">
                                    <svg style="width: 22px; height: 22px; flex-shrink: 0;" fill="none" stroke="white" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <div style="color: rgba(255,255,255,0.85); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;">Sprint ${sprint} Completado</div>
                                        <div style="color: white; font-size: 22px; font-weight: 700; line-height: 1.2;">${data.total} <span style="font-size: 13px; font-weight: 400; opacity: 0.85;">tickets finalizados</span></div>
                                    </div>
                                    <div style="margin-left: auto; text-align: right;">
                                        <div style="color: rgba(255,255,255,0.7); font-size: 10px;">Lead Time promedio</div>
                                        <div style="color: white; font-size: 18px; font-weight: 700;">${data.promedio} días</div>
                                    </div>
                                </div>

                                <!-- Prioridades -->
                                <div class="kpi-cards-grid-3" style="margin-bottom: 16px;">
                                    ${renderLeadTimePorPrioridad(data.porPrioridad)}
                                </div>

                                <!-- Gráfico por sprint (barras) -->
                                <div class="chart-container-avanzado">
                                    <h3>Lead Time por Sprint</h3>
                                    ${renderLeadTimeSprintChart(data.porSprint)}
                                </div>

                                <!-- Distribución -->
                                <div class="chart-container-avanzado">
                                    <h3>Distribución de Lead Time</h3>
                                    ${renderLeadTimeDistribucionChart(data.distribucion, data.ticketsConLeadTime, sprint)}
                                </div>
                            </div>
                        </div>`;
                }).join('')}
                <div style="height: 16px;"></div>
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

/**
 * Formatea días de tracking: si >= 1 día muestra "X.X días", si < 1 convierte a horas (8h = 1 día)
 */
function fmtTracking(dias) {
    if (dias <= 0) return '-';
    const HORAS_DIA = 8;
    if (dias >= 1) {
        const diasEnteros = Math.floor(dias);
        const horasRest = Math.round((dias - diasEnteros) * HORAS_DIA);
        if (horasRest <= 0) return `${diasEnteros}d`;
        return `${diasEnteros}d ${horasRest}h`;
    }
    // Menos de 1 día → mostrar en horas (8h laborales = 1 día)
    const horas = Math.round(dias * HORAS_DIA);
    return horas <= 0 ? '<1h' : `${horas}h`;
}

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
            </div>
            
            <div class="section-content-avanzado" id="edad-content">
                <div class="kpi-cards-grid-4">
                    <div class="kpi-card-avanzado">
                        <div class="kpi-content-avanzado">
                            <div class="kpi-label-avanzado">Promedio en Tracking</div>
                            <div class="kpi-value-medium">${fmtTracking(parseFloat(edadTickets.promedio))}</div>
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
                    <table class="w-full border-collapse" style="table-layout:fixed;width:100%;">
                        <thead>
                            <tr class="bg-gray-50 border-b border-gray-200">
                                <th class="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider" style="width:82px">Ticket</th>
                                <th class="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider" style="width:120px">Asignado</th>
                                <th class="text-center py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider" style="width:62px">Total</th>
                                <th class="text-center py-3 px-4 text-xs font-semibold text-indigo-700 uppercase tracking-wider" style="width:40px" title="Story Points estimados">SP</th>
                                ${estados.map(estado => `<th class="text-center py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider" style="width:72px">${estado.replace('CODE REVIEW', 'Code Review').replace('IN TEST DEV', 'Test in Dev')}</th>`).join('')}
                                <th class="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider" style="width:110px">Estado Actual</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            ${tickets.map(t => {
                                const totalDias = t.diasEnTracking || 0;
                                const rowClass = totalDias >= 15 ? 'bg-red-50 hover:bg-red-100' : totalDias >= 8 ? 'bg-yellow-50 hover:bg-yellow-100' : 'hover:bg-gray-50';
                                // Mostrar solo primer nombre para mantener columna compacta
                                const nombreCorto = (t.asignado || 'Sin asignar').split(' ')[0];
                                const nombreCompleto = t.asignado || 'Sin asignar';
                                
                                return `
                                    <tr class="${rowClass} transition-colors duration-150">
                                        <td class="py-3 px-4 font-semibold" style="overflow:hidden;white-space:nowrap;"><a href="#" onclick="mostrarDetalleTicket('${t.clave}', event); return false;" class="text-blue-600 hover:text-blue-800 no-underline cursor-pointer">${t.clave}</a></td>
                                        <td class="py-3 px-4 text-gray-700" style="overflow:hidden;white-space:nowrap;text-overflow:ellipsis;" title="${nombreCompleto}">${nombreCompleto}</td>
                                        <td class="py-3 px-4 text-center font-bold text-gray-900">${fmtTracking(totalDias)}</td>
                                        ${(() => {
                                            const sp = parseFloat(t.storyPointEstimate) || null;
                                            if (sp == null) return `<td class="py-3 px-4 text-center text-gray-400 text-xs">—</td>`;
                                            return `<td class="py-3 px-4 text-center"><span style="display:inline-block;padding:1px 7px;background:#EEF2FF;color:#4338CA;border-radius:4px;font-size:11px;font-weight:700;">${sp}</span></td>`;
                                        })()} 
                                        ${estados.map(estado => {
                                            const dias = t.diasPorEstado[estado] || 0;
                                            const sp = parseFloat(t.storyPointEstimate) || null;
                                            const isInProcess = estado === 'In Process';
                                            const over = isInProcess && sp != null && dias >= 1 && (Math.round(dias * 10) / 10) > sp;
                                            const label = fmtTracking(dias);
                                            if (over) {
                                                return `<td class="py-3 px-4 text-center" style="background:#FEF3C7;" title="In Process ${label} supera el estimado de ${sp} SP"><span style="font-weight:700;color:#B45309;">${label} ⚠</span></td>`;
                                            }
                                            const cellClass = dias > 0 ? 'bg-green-100 font-semibold text-green-800' : 'bg-gray-50 text-gray-400';
                                            return `<td class="py-3 px-4 text-center ${cellClass}">${label}</td>`;
                                        }).join('')}
                                        <td class="py-3 px-4"><span class="inline-block px-3 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded">${t.estadoActualReal || t.estado || t.estadoNormalizado}</span></td>
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

                // Construir desglose de bugs ordenados por SP desc (incluye bugs sin SP)
                const bugsSorted = (sprint.bugs.tickets || [])
                    .map(t => ({ clave: t.clave, sp: parseFloat(t.storyPointEstimate) || 0, resumen: t.resumen || '' }))
                    .sort((a, b) => b.sp - a.sp);

                const maxBugSP = bugsSorted.filter(t => t.sp > 0).length > 0 ? bugsSorted.find(t => t.sp > 0).sp : 1;
                const bugRows = bugsSorted.map(t => {
                    const barPct = t.sp > 0 ? Math.round((t.sp / maxBugSP) * 100) : 0;
                    const resumenCorto = t.resumen.length > 65 ? t.resumen.substring(0, 65) + '…' : t.resumen;
                    const spLabel = t.sp > 0 ? `${t.sp}SP` : '—';
                    const spColor = t.sp > 0 ? '#EF4444' : '#9CA3AF';
                    return `
                    <div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid #F9FAFB;">
                        <span style="font-size:10px;color:#9CA3AF;width:70px;flex-shrink:0;">${t.clave}</span>
                        <div style="width:80px;height:5px;background:#FEE2E2;border-radius:3px;flex-shrink:0;overflow:hidden;">
                            <div style="width:${barPct}%;height:5px;background:#F44336;border-radius:3px;"></div>
                        </div>
                        <span style="font-size:10px;color:${spColor};font-weight:600;width:28px;flex-shrink:0;">${spLabel}</span>
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
                        var p=document.getElementById('bug-desglose-s${sprint.sprintNum}');
                        var open=p.style.display!=='none';
                        p.style.display=open?'none':'block';
                        btn.innerHTML=open?'▶ Ver desglose de bugs (${bugsSorted.length} tickets · ${sp.bugsSP}SP)':'▼ Ocultar desglose';
                    })(this)"
                    style="font-size:11px;color:#9CA3AF;background:none;border:none;cursor:pointer;padding:3px 0;display:flex;align-items:center;gap:4px;transition:color 0.2s;"
                    onmouseover="this.style.color='#EF4444'" onmouseout="this.style.color='#9CA3AF'">
                        ▶ Ver desglose de bugs (${bugsSorted.length} tickets · ${sp.bugsSP}SP)
                    </button>
                    <div id="bug-desglose-s${sprint.sprintNum}" style="display:none;margin-top:6px;padding:8px 12px;background:#FFFBFB;border:1px solid #FEE2E2;border-radius:6px;">
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
            ${s35sp ? `<span style="font-size:10px;color:#6B7280;margin-left:14px;">Cobertura ${s35sp.sprint}: ${s35sp.spData.coverage}/${s35sp.spData.coverageTotal} tickets con SP estimado</span>` : ''}
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

    let filtered, title, subtitle, accentColor, stageField = null;
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
    } else if (pType.startsWith('stage_')) {
        const stageMap = {
            stage_inProcess:  { field:'inProcess',  label:'In Process',  color:'#243F6B', section:'Desarrollo' },
            stage_codeReview: { field:'codeReview', label:'Code Review', color:'#4B71A1', section:'Desarrollo' },
            stage_inTest:     { field:'inTest',     label:'In Test',     color:'#64748B', section:'Verificación y Control' },
            stage_inTestDev:  { field:'inTestDev',  label:'Test Dev',    color:'#EF4444', section:'Impedimento' },
            stage_blocked:    { field:'blocked',    label:'Blocked',     color:'#EF4444', section:'Impedimento' },
            stage_testIssue:  { field:'testIssue',  label:'Test Issue',  color:'#EF4444', section:'Impedimento' },
        };
        const sm = stageMap[pType] || { field:'inProcess', label:pType, color:'#6B7280', section:'' };
        stageField  = sm.field;
        filtered    = tickets.filter(t => (t.etapas?.[sm.field]||0) > 0).sort((a,b) => (b.etapas?.[sm.field]||0) - (a.etapas?.[sm.field]||0));
        title       = `${sm.label} · ${sm.section} — ${filtered.length} tickets`;
        subtitle    = `Tickets con tiempo registrado en la etapa "${sm.label}", ordenados de mayor a menor.`;
        accentColor = sm.color;
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

    const rows = filtered.map(t => {
        const timeVal = stageField ? (t.etapas?.[stageField] || 0) : t.diasTotal;
        return `
        <div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid #F3F4F6;">
            <span style="font-size:11px;font-weight:700;color:#243F6B;min-width:85px;">${t.clave}</span>
            <span style="flex:1;font-size:11px;color:#374151;line-height:1.3;">${(t.resumen||'').substring(0,70)}${(t.resumen||'').length>70?'\u2026':''}</span>
            <span style="font-size:10px;font-weight:600;color:${prioColor(t.prioridad)};min-width:55px;text-align:center;">${t.prioridad||'\u2014'}</span>
            <span style="font-size:12px;font-weight:700;color:#1F2937;min-width:55px;text-align:right;">${formatTime(timeVal)}</span>
        </div>`;
    }).join('');

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
                </div>
            </div>
        `;
    }
    
    const colorClass = cycleTime.promedio <= 7 ? 'kpi-success' : 
                      cycleTime.promedio <= 15 ? 'kpi-warning' : 'kpi-danger';
    
    // Formateador local para Cycle Time (permite incrementos de 0.5h)
    function formatTimeCT(dias) {
        if (!dias || dias === 0) return '0h';
        const MINS_POR_DIA = 9 * 60; // 540
        const totalMins = Math.round(dias * MINS_POR_DIA);
        if (totalMins <= 0) return '0h';

        // Redondear SIEMPRE hacia arriba a bloques de 30 minutos
        const halfHours = Math.ceil(totalMins / 30);
        const totalHoras = halfHours * 0.5;

        if (totalHoras < 9) {
            const h = Number.isInteger(totalHoras) ? String(totalHoras) : totalHoras.toFixed(1);
            return `${h}h`;
        }

        const diasEnteros = Math.floor(totalHoras / 9);
        const horasRestantes = totalHoras - (diasEnteros * 9);
        if (horasRestantes === 0) return `${diasEnteros}d`;
        const hr = Number.isInteger(horasRestantes) ? String(horasRestantes) : horasRestantes.toFixed(1);
        return `${diasEnteros}d ${hr}h`;
    }
    
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
            </div>
            
            <div id="cycletime-content" class="section-content-avanzado">
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
                const totalTouchTime   = sumInProcess + sumCodeReview + sumInTest;
                const totalLeadTime    = tickets.reduce((s, t) => s + (t.diasTotal || 0), 0);
                const activeAvg        = totalTouchTime / tickets.length;   // for bar widths only
                const waitingAvg       = (sumInTestDev + sumBlocked + sumTestIssue) / tickets.length;
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
                    : 'Menos del 30% de Touch Time: los impedimentos (Test Dev / Blocked / Test Issues) están consumiendo el flujo.';

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
                        diasTotal: t.diasTotal, prioridad: t.prioridad,
                        storyPoints: t.storyPoints,
                        etapas: t.etapas || {}
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
                            </div>
                            
                            <!-- Contenido desplegable -->
                            <div id="sprint-${sprint}-content" class="section-content-avanzado" style="padding: 16px;">

                                <!-- Tickets Finalizados del Sprint -->
                                <div style="display: flex; align-items: center; gap: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 14px 20px; margin-bottom: 16px;">
                                    <svg style="width: 22px; height: 22px; flex-shrink: 0;" fill="none" stroke="white" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <div style="color: rgba(255,255,255,0.85); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;">Sprint ${sprint} Completado</div>
                                        <div style="color: white; font-size: 22px; font-weight: 700; line-height: 1.2;">${tickets.length} <span style="font-size: 13px; font-weight: 400; opacity: 0.85;">tickets finalizados</span></div>
                                    </div>
                                    <div style="margin-left: auto; text-align: right;">
                                        <div style="color: rgba(255,255,255,0.7); font-size: 10px;">Cycle Time promedio</div>
                                        <div style="color: white; font-size: 18px; font-weight: 700;">${formatTimeCT(avgTotal)}</div>
                                    </div>
                                </div>

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
                                            <div style="font-size: 17px; font-weight: 700; color: #4B71A1; letter-spacing: -0.3px;">${formatTimeCT(avgInProcess)}</div>
                                        </div>

                                        <div style="display: flex; align-items: center; padding: 0 2px; color: #D1D5DB; font-size: 13px;">›</div>

                                        <!-- Code Review -->
                                        <div style="flex: 1; min-width: 80px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 14px 8px; border-right: 1px solid #F3F4F6; gap: 6px;">
                                            <div style="width: 28px; height: 3px; border-radius: 2px; background: #4B71A1;"></div>
                                            <div style="font-size: 9px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.6px; text-align: center;">Code Review</div>
                                            <div style="font-size: 17px; font-weight: 700; color: #4B71A1; letter-spacing: -0.3px;">${formatTimeCT(avgCodeReview)}</div>
                                        </div>

                                        <div style="display: flex; align-items: center; padding: 0 2px; color: #D1D5DB; font-size: 13px;">›</div>

                                        <!-- Test Dev -->
                                        <div style="flex: 1; min-width: 80px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 14px 8px; border-right: 1px solid #F3F4F6; gap: 6px;">
                                            <div style="width: 28px; height: 3px; border-radius: 2px; background: #4B71A1;"></div>
                                            <div style="font-size: 9px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.6px; text-align: center;">Test Dev</div>
                                            <div style="font-size: 17px; font-weight: 700; color: #4B71A1; letter-spacing: -0.3px;">${formatTimeCT(avgInTestDev)}</div>
                                        </div>

                                        <div style="display: flex; align-items: center; padding: 0 2px; color: #D1D5DB; font-size: 13px;">›</div>

                                        <!-- In Test -->
                                        <div style="flex: 1; min-width: 80px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 14px 8px; ${hasBlocked || hasTestIssue ? 'border-right: 1px solid #F3F4F6;' : ''} gap: 6px;">
                                            <div style="width: 28px; height: 3px; border-radius: 2px; background: #4B71A1;"></div>
                                            <div style="font-size: 9px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.6px; text-align: center;">In Test</div>
                                            <div style="font-size: 17px; font-weight: 700; color: #4B71A1; letter-spacing: -0.3px;">${formatTimeCT(avgInTest)}</div>
                                        </div>

                                        ${hasBlocked ? `
                                        <div style="display: flex; align-items: center; padding: 0 2px; color: #D1D5DB; font-size: 13px;">›</div>
                                        <!-- Blocked -->
                                        <div style="flex: 1; min-width: 80px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 14px 8px; ${hasTestIssue ? 'border-right: 1px solid #F3F4F6;' : ''} gap: 6px;">
                                            <div style="width: 28px; height: 3px; border-radius: 2px; background: #4B71A1;"></div>
                                            <div style="font-size: 9px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.6px; text-align: center;">Blocked</div>
                                            <div style="font-size: 17px; font-weight: 700; color: #4B71A1; letter-spacing: -0.3px;">${formatTimeCT(avgBlocked)}</div>
                                        </div>
                                        ` : ''}

                                        ${hasTestIssue ? `
                                        <div style="display: flex; align-items: center; padding: 0 2px; color: #D1D5DB; font-size: 13px;">›</div>
                                        <!-- Test Issue -->
                                        <div style="flex: 1; min-width: 80px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 14px 8px; gap: 6px;">
                                            <div style="width: 28px; height: 3px; border-radius: 2px; background: #4B71A1;"></div>
                                            <div style="font-size: 9px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.6px; text-align: center;">Test Issue</div>
                                            <div style="font-size: 17px; font-weight: 700; color: #4B71A1; letter-spacing: -0.3px;">${formatTimeCT(avgTestIssue)}</div>
                                        </div>
                                        ` : ''}

                                        <!-- Divisor total -->
                                        <div style="width: 1px; background: #E5E7EB; margin: 10px 0;"></div>

                                        <!-- Total -->
                                        <div style="min-width: 90px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 14px 14px; background: #F8FAFF; gap: 6px;">
                                            <div style="width: 28px; height: 3px; border-radius: 2px; background: #243F6B;"></div>
                                            <div style="font-size: 9px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.6px; text-align: center;">Promedio</div>
                                            <div style="font-size: 18px; font-weight: 700; color: #243F6B; letter-spacing: -0.5px;">${formatTimeCT(avgTotal)}</div>
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
                                                { label:'In Process',  val: avgInProcess,  pct: totalLeadTime > 0 ? Math.round((sumInProcess  / totalLeadTime)*100) : 0, key:'stage_inProcess'  },
                                                { label:'Code Review', val: avgCodeReview, pct: totalLeadTime > 0 ? Math.round((sumCodeReview / totalLeadTime)*100) : 0, key:'stage_codeReview' }
                                            ].map(e => {
                                                const pctDisplay = (e.pct === 0 && (e.val||0) > 0) ? '<1%' : `${e.pct}%`;
                                                return `
                                                <div onclick="showSLEPopup('s${sprint}','${e.key}')" style="margin-bottom:7px;cursor:pointer;padding:4px 6px;border-radius:5px;transition:background 0.15s;" onmouseover="this.style.background='#F1F5F9'" onmouseout="this.style.background='transparent'">
                                                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
                                                        <span style="font-size:11px;color:#374151;">${e.label}</span>
                                                        <div style="display:flex;align-items:center;gap:6px;">
                                                            <span style="font-size:11px;font-weight:600;color:#374151;">${formatTimeCT(e.val)}</span>
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
                                                { label:'In Test',  val: avgInTest,    pct: totalLeadTime > 0 ? Math.round((sumInTest    / totalLeadTime)*100) : 0, key:'stage_inTest' }
                                            ].map(e => {
                                                const pctDisplay = (e.pct === 0 && (e.val||0) > 0) ? '<1%' : `${e.pct}%`;
                                                return `
                                                <div onclick="showSLEPopup('s${sprint}','${e.key}')" style="margin-bottom:7px;cursor:pointer;padding:4px 6px;border-radius:5px;transition:background 0.15s;" onmouseover="this.style.background='#F1F5F9'" onmouseout="this.style.background='transparent'">
                                                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
                                                        <span style="font-size:11px;color:#374151;">${e.label}</span>
                                                        <div style="display:flex;align-items:center;gap:6px;">
                                                            <span style="font-size:11px;font-weight:600;color:#374151;">${formatTimeCT(e.val)}</span>
                                                            <span style="font-size:10px;color:#64748B;font-weight:700;width:32px;text-align:right;">${pctDisplay}</span>
                                                        </div>
                                                    </div>
                                                    <div style="height:7px;background:#E5E7EB;border-radius:4px;overflow:hidden;">
                                                        <div style="height:100%;width:${Math.max(e.pct,((e.val||0)>0?1:0))}%;background:#64748B;border-radius:4px;"></div>
                                                    </div>
                                                </div>`;
                                            }).join('')}

                                            <!-- Sección 3 — IMPEDIMENTOS (solo si hay) -->
                                            ${(avgInTestDev > 0 || avgBlocked > 0 || avgTestIssue > 0) ? `
                                            <div style="font-size:9px;font-weight:700;color:#991B1B;text-transform:uppercase;letter-spacing:0.6px;margin:10px 0 6px;display:flex;align-items:center;gap:5px;">
                                                <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#EF4444;"></span> Impedimentos
                                            </div>
                                            ${[
                                                { label:'Test Dev',   val: avgInTestDev, pct: totalLeadTime > 0 ? Math.round((sumInTestDev / totalLeadTime)*100) : 0, key:'stage_inTestDev'  },
                                                { label:'Blocked',    val: avgBlocked,   pct: totalLeadTime > 0 ? Math.round((sumBlocked   / totalLeadTime)*100) : 0, key:'stage_blocked'   },
                                                { label:'Test Issue', val: avgTestIssue, pct: totalLeadTime > 0 ? Math.round((sumTestIssue / totalLeadTime)*100) : 0, key:'stage_testIssue' }
                                            ].filter(e => e.val > 0).map(e => {
                                                const pctDisplay = (e.pct === 0 && (e.val||0) > 0) ? '<1%' : `${e.pct}%`;
                                                return `
                                                <div onclick="showSLEPopup('s${sprint}','${e.key}')" style="margin-bottom:7px;cursor:pointer;padding:4px 6px;border-radius:5px;transition:background 0.15s;" onmouseover="this.style.background='#FEF2F2'" onmouseout="this.style.background='transparent'">
                                                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
                                                        <span style="font-size:11px;color:#374151;">${e.label}</span>
                                                        <div style="display:flex;align-items:center;gap:6px;">
                                                            <span style="font-size:11px;font-weight:600;color:#374151;">${formatTimeCT(e.val)}</span>
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
                                                    ${ticket.storyPoints != null ? `<span title="Story Points estimados" style="padding: 2px 7px; background: #EEF2FF; color: #4338CA; border-radius: 4px; font-size: 10px; font-weight: 700; letter-spacing: 0.3px;">SP&thinsp;${ticket.storyPoints}</span>` : ''}
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
                                                ${(() => {
                                                    const ip = ticket.etapas.inProcess || 0;
                                                    const sp = ticket.storyPoints;
                                                    const over = sp != null && ip > sp;
                                                    return `<div style="text-align:center;flex:1;border-radius:5px;padding:4px 2px;${over ? 'background:#FEF3C7;border:1px solid #FDE68A;' : ''}" ${over ? `title="In Process ${formatTime(ip)} supera el estimado de ${sp} SP"` : ''}>
                                                        <div style="font-size:9px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;font-weight:600;color:${over ? '#92400E' : '#6B7280'};">In Process${over ? ' ⚠' : ''}</div>
                                                        <div style="font-size:14px;font-weight:700;color:${ip > 0 ? (over ? '#B45309' : '#06B6D4') : '#D1D5DB'};">${formatTime(ip)}</div>
                                                        ${over ? `<div style="font-size:8px;color:#D97706;margin-top:2px;">est. ${sp}sp</div>` : ''}
                                                    </div>`;
                                                })()}

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
function renderReworkOneSprint(rework) {
    // Renders the cards + table for a single sprint rework object
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

    // Sprint label badge
    const sprintBadge = `<span style="background:#EEF2FF;color:#4F46E5;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;">Sprint ${rework.sprint}</span>`;

    if (!rework || rework.totalAnalizado === 0) {
        return `<div style="padding:16px;text-align:center;color:#6B7280;font-size:12px;">Sin datos para Sprint ${rework.sprint}</div>`;
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
    void badgeStatus; // used in sub-panel header below

    // Sub-panel header — collapsible per sprint
    const subId = `rework-sprint-${rework.sprint}`;
    const subHeader = `
        <div onclick="toggleSection('${subId}')"
             style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;
                    background:linear-gradient(to right,#F8FAFC,#F1F5F9);
                    border-bottom:1px solid #E2E8F0;border-radius:8px 8px 0 0;
                    cursor:pointer;user-select:none;"
             title="Clic para colapsar/expandir">
            <div style="display:flex;align-items:center;gap:8px;">
                <span class="collapse-icon" id="icon-${subId}" style="color:#6B7280;font-size:14px;transition:transform 0.3s ease;">▼</span>
                ${sprintBadge}
                <span style="font-size:12px;font-weight:600;color:#374151;">Sprint ${rework.sprint}</span>
            </div>
            <div>${badgeStatus}</div>
        </div>`;

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
                <div style="font-size:10px;color:#9CA3AF;margin-top:4px;">Sprint ${rework.sprint} · Solo finalizados</div>
            </div>

            <!-- % con reproceso + umbral DORA -->
            <div style="background:${pctStatus.bg};border:1px solid ${pctStatus.ring};border-radius:10px;padding:16px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,.06);">
                <div style="display:flex;align-items:center;justify-content:center;gap:4px;margin-bottom:6px;">
                    <span style="font-size:11px;color:${pctStatus.text};font-weight:600;text-transform:uppercase;letter-spacing:.5px;">% con reproceso</span>
                    ${tooltip('rework-pct-'+rework.sprint,
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
                    ${tooltip('rework-ciclos-'+rework.sprint,
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
        <div style="border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;margin-bottom:12px;">
            ${subHeader}
            <div id="${subId}" class="section-content-avanzado" style="padding:14px;">
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

function renderReworkSection(reworkArray) {
    // reworkArray: array of per-sprint rework objects
    const items = Array.isArray(reworkArray) ? reworkArray : [reworkArray];
    const totalConRework = items.reduce((s, r) => s + (r.conRework || 0), 0);

    const badgeHeader = totalConRework === 0
        ? '<span style="background:#D1FAE5;color:#065F46;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;">✓ Sin reprocesos</span>'
        : `<span style="background:#FEE2E2;color:#991B1B;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;">${totalConRework} con reproceso</span>`;

    const sprintLabels = items.map(r => `Sprint ${r.sprint}`).join(' · ');

    return `
        <div class="kpi-section-avanzado" style="border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;margin-bottom:20px;">
            <div class="section-header-avanzado collapsible" onclick="toggleSection('rework-content')"
                 style="background:linear-gradient(to right,#F3F4F6,#E5E7EB);padding:12px 16px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;transition:all 0.3s ease;">
                <div style="display:flex;align-items:center;gap:12px;">
                    <span class="collapse-icon" id="icon-rework-content" style="color:#6B7280;font-size:18px;transition:transform 0.3s ease;">▼</span>
                    <svg style="width:20px;height:20px;color:#F97316;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    <h2 style="margin:0;font-size:16px;font-weight:600;color:#1F2937;">Reprocesos (Rework)</h2>
                </div>
            </div>
            <div id="rework-content" class="section-content-avanzado" style="padding:16px;">
                ${items.map(r => renderReworkOneSprint(r)).join('')}
            </div>
        </div>`;
}


// ============================================================================
// KPI: CARGA Y CALIDAD POR PERSONA
// ============================================================================

/**
 * Calcula la distribución de carga de trabajo y calidad individual por miembro.
 * Incluye tickets por tipo, esfuerzo estimado (SP) y regresiones QA→Test Issues.
 */
/**
 * Calcula carga por persona para UN sprint específico.
 * spEstimado = storyPointEstimate (planificado en el planning)
 * spReal     = suma de días en estado 'In Process' + 'Test Issues' del changelog (esfuerzo activo del desarrollador)
 */
function _calcularCargaPersonaSprint(tickets, sprint, clData) {
    const ef = tickets.filter(t => String(t.sprint) === String(sprint) && t.estado !== 'Arrastrado');
    const personas = {};

    ef.forEach(t => {
        const p = t.asignado || 'Sin asignar';
        if (!personas[p]) personas[p] = {
            errores: 0, tareas: 0, historias: 0, total: 0,
            spEstimado: 0, spReal: 0,
            spEstBugs: 0, spEstTareas: 0, spEstHistorias: 0,
            spRealBugs: 0, spRealTareas: 0, spRealHistorias: 0,
            testIssues: 0,
            capacidadComp: 0,
            tkAll: [], tkBugs: [], tkTareas: [], tkHistorias: [], tkTI: [], tkCompromiso: []
        };
        const spEst  = parseFloat(t.storyPointEstimate) || 0;
        // Días activos: QA → 'In Test' + 'Test Issues'; Dev → 'In Process' + 'Test Issues'
        const QA_MEMBERS = new Set(['Said Cervantes Correa']);
        const isQA = QA_MEMBERS.has(p);
        const hist = clData[t.clave];
        let spReal = 0;
        if (hist && Array.isArray(hist)) {
            const activeStates = hist.filter(h =>
                isQA
                    ? (h.estado === 'In Test' || h.estado === 'Test Issues')
                    : (h.estado === 'In Process' || h.estado === 'Test Issues')
            );
            const totalDays = activeStates.reduce((sum, h) => sum + (parseFloat(h.dias) || 0), 0);
            // Si pasó por el estado activo pero duró < 0.5 días, asignar 0.5 (medio día mínimo)
            spReal = activeStates.length > 0 && totalDays === 0 ? 0.5 : parseFloat(totalDays.toFixed(1));
        }
        const tipo = (t.tipoIncidencia || '').toLowerCase();
        const d = personas[p];
        const tkEntry = { c: t.clave, r: (t.resumen || '').slice(0, 80), t: t.tipoIncidencia || '', se: spEst, sr: spReal, e: t.estadoNormalizado || t.estado || '' };
        
        // Calcular capacidad comprometida (SP estimado de TODOS los tickets del sprint)
        d.capacidadComp += spEst;
        d.tkCompromiso.push(tkEntry);
        
        d.total++;
        d.spEstimado += spEst;
        d.spReal     += spReal;
        d.tkAll.push(tkEntry);
        if (tipo.includes('error') || tipo.includes('bug')) {
            d.errores++;
            d.spEstBugs  += spEst;
            d.spRealBugs += spReal;
            d.tkBugs.push(tkEntry);
        } else if (tipo.includes('histor')) {
            d.historias++;
            d.spEstHistorias  += spEst;
            d.spRealHistorias += spReal;
            d.tkHistorias.push(tkEntry);
        } else {
            d.tareas++;
            d.spEstTareas  += spEst;
            d.spRealTareas += spReal;
            d.tkTareas.push(tkEntry);
        }
    });

    // Regresiones QA → Test Issues
    const QA_MEMBERS_TI = new Set(['Said Cervantes Correa']);
    ef.forEach(t => {
        const hist = clData[t.clave];
        if (!hist || !Array.isArray(hist)) return;
        if (hist.some(h => (h.estado || '') === 'Test Issues')) {
            const p = t.asignado || 'Sin asignar';
            if (personas[p]) {
                personas[p].testIssues++;
                const spEst2 = parseFloat(t.storyPointEstimate) || 0;
                const hist2 = clData[t.clave];
                const isQA2 = QA_MEMBERS_TI.has(p);
                const spReal2 = hist2 ? parseFloat(hist2.filter(h =>
                    isQA2
                        ? (h.estado === 'In Test' || h.estado === 'Test Issues')
                        : (h.estado === 'In Process' || h.estado === 'Test Issues')
                ).reduce((s,h)=>s+(parseFloat(h.dias)||0),0).toFixed(1)) : 0;
                personas[p].tkTI.push({ c: t.clave, r: (t.resumen||'').slice(0,80), t: t.tipoIncidencia||'', se: spEst2, sr: spReal2, e: t.estadoNormalizado||t.estado||'' });
            }
        }
    });

    // Añadir tickets Arrastrados al cómputo de CC (no cuentan para spEstimado/spReal)
    const arrastrados = tickets.filter(t => String(t.sprint) === String(sprint) && t.estado === 'Arrastrado');
    arrastrados.forEach(t => {
        const p = t.asignado || 'Sin asignar';
        if (!personas[p]) personas[p] = {
            errores: 0, tareas: 0, historias: 0, total: 0,
            spEstimado: 0, spReal: 0,
            spEstBugs: 0, spEstTareas: 0, spEstHistorias: 0,
            spRealBugs: 0, spRealTareas: 0, spRealHistorias: 0,
            testIssues: 0,
            capacidadComp: 0,
            tkAll: [], tkBugs: [], tkTareas: [], tkHistorias: [], tkTI: [], tkCompromiso: []
        };
        const spEst = parseFloat(t.storyPointEstimate) || 0;
        const tkEntry = { c: t.clave, r: (t.resumen || '').slice(0, 80), t: t.tipoIncidencia || '', se: spEst, sr: 0, e: 'Arrastrado' };
        personas[p].capacidadComp += spEst;
        personas[p].tkCompromiso.push(tkEntry);
    });

    const fmt = v => parseFloat(v.toFixed(1));
    const ordenadas = Object.entries(personas)
        .filter(([nombre]) => nombre !== 'Sin asignar')
        .sort((a, b) => b[1].total - a[1].total)
        .map(([nombre, d]) => ({
            nombre,
            errores: d.errores, tareas: d.tareas, historias: d.historias, total: d.total,
            spEstimado:      fmt(d.spEstimado),
            spReal:          fmt(d.spReal),
            capacidadComp:   fmt(d.capacidadComp),
            spEstBugs:       fmt(d.spEstBugs),
            spEstTareas:     fmt(d.spEstTareas),
            spEstHistorias:  fmt(d.spEstHistorias),
            spRealBugs:      fmt(d.spRealBugs),
            spRealTareas:    fmt(d.spRealTareas),
            spRealHistorias: fmt(d.spRealHistorias),
            testIssues:      d.testIssues,
            pctTestIssues:   d.total > 0 ? fmt((d.testIssues / d.total) * 100) : 0,
            desviacion:      fmt(d.spReal - d.spEstimado),
            tkAll:       d.tkAll,
            tkBugs:      d.tkBugs,
            tkTareas:    d.tkTareas,
            tkHistorias: d.tkHistorias,
            tkTI:        d.tkTI,
            tkCompromiso: d.tkCompromiso
        }));

    return { sprint, personas: ordenadas, totalTickets: ef.length };
}

function calcularCargaPersona(tickets, sprints) {
    // eslint-disable-next-line no-undef
    const clData = (typeof changelogData !== 'undefined') ? changelogData : {};
    // Retornar array de objetos, uno por sprint (igual que Lead Time / Cycle Time)
    return sprints.map(s => _calcularCargaPersonaSprint(tickets, s, clData));
}

// ── FUNCIONES GLOBALES PARA EL POPUP ─────────────────────────────────
// Estas se ejecutan cuando el usuario hace clic en las celdas de la tabla
window.showCargaPopup = function(key, label) {
    const el = document.getElementById('tkdata-' + key);
    if (!el) { console.warn('No data found for key: ' + key); return; }
    const tickets = JSON.parse(el.textContent);
    const overlay = document.getElementById('carga-popup-overlay');
    if (!overlay) { console.warn('Popup overlay not found'); return; }
    document.getElementById('carga-popup-title').textContent = label + ' — ' + tickets.length + ' ticket' + (tickets.length !== 1 ? 's' : '');
    const rows = tickets.map(tk => {
        const srTxt = tk.sr > 0 ? tk.sr + 'd' : '—';
        const seTxt = tk.se > 0 ? tk.se + ' SP' : '—';
        const eBg = tk.e === 'Done' || tk.e === 'Cerrado' ? '#D1FAE5' : tk.e === 'In Test' || tk.e === 'IN TEST DEV' ? '#DBEAFE' : '#F3F4F6';
        const eColor = tk.e === 'Done' || tk.e === 'Cerrado' ? '#065F46' : tk.e === 'In Test' || tk.e === 'IN TEST DEV' ? '#1E40AF' : '#374151';
        return '<tr style="border-top:1px solid #F3F4F6;">'
            + '<td style="padding:8px 10px;font-size:11px;font-weight:600;color:#4338CA;white-space:nowrap;">' + tk.c + '</td>'
            + '<td style="padding:8px 10px;font-size:11px;color:#374151;max-width:340px;">' + tk.r + (tk.r.length >= 80 ? '…' : '') + '</td>'
            + '<td style="padding:8px 10px;font-size:11px;color:#6B7280;white-space:nowrap;">' + tk.t + '</td>'
            + '<td style="padding:8px 6px;text-align:center;"><span style="background:' + eBg + ';color:' + eColor + ';padding:2px 7px;border-radius:6px;font-size:10px;font-weight:500;white-space:nowrap;">' + tk.e + '</span></td>'
            + '<td style="padding:8px 8px;text-align:center;font-size:11px;color:#4338CA;font-weight:600;">' + seTxt + '</td>'
            + '<td style="padding:8px 8px;text-align:center;font-size:11px;color:#065F46;font-weight:600;">' + srTxt + '</td>'
            + '</tr>';
    }).join('');
    document.getElementById('carga-popup-body').innerHTML = tickets.length === 0
        ? '<p style="color:#9CA3AF;font-size:12px;padding:10px 0;">Sin tickets en esta categoría.</p>'
        : '<table style="width:100%;border-collapse:collapse;">'
            + '<thead><tr style="background:#F9FAFB;">'
            + '<th style="padding:7px 10px;text-align:left;font-size:10px;font-weight:700;color:#374151;letter-spacing:0.06em;text-transform:uppercase;border-bottom:2px solid #E5E7EB;">Clave</th>'
            + '<th style="padding:7px 10px;text-align:left;font-size:10px;font-weight:700;color:#374151;letter-spacing:0.06em;text-transform:uppercase;border-bottom:2px solid #E5E7EB;">Resumen</th>'
            + '<th style="padding:7px 10px;text-align:left;font-size:10px;font-weight:700;color:#374151;letter-spacing:0.06em;text-transform:uppercase;border-bottom:2px solid #E5E7EB;">Tipo</th>'
            + '<th style="padding:7px 6px;text-align:center;font-size:10px;font-weight:700;color:#374151;letter-spacing:0.06em;text-transform:uppercase;border-bottom:2px solid #E5E7EB;">Estado</th>'
            + '<th style="padding:7px 8px;text-align:center;font-size:10px;font-weight:700;color:#4338CA;letter-spacing:0.06em;text-transform:uppercase;border-bottom:2px solid #E5E7EB;">SP Est.</th>'
            + '<th style="padding:7px 8px;text-align:center;font-size:10px;font-weight:700;color:#065F46;letter-spacing:0.06em;text-transform:uppercase;border-bottom:2px solid #E5E7EB;">SP Real</th>'
            + '</tr></thead><tbody>' + rows + '</tbody></table>';
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
};

window.closeCargaPopup = function() {
    const overlay = document.getElementById('carga-popup-overlay');
    if (overlay) {
        overlay.style.display = 'none';
        document.body.style.overflow = '';
    }
};

document.addEventListener('keydown', function(e) { if (e.key === 'Escape') window.closeCargaPopup(); });

function renderCargaPersonaSection(dataArray) {
    // dataArray: [{sprint, personas: [], totalTickets}, ...]
    const items = Array.isArray(dataArray) ? dataArray : [dataArray];
    const validos = items.filter(d => d && d.personas && d.personas.length > 0);

    if (validos.length === 0) {
        return `<div class="kpi-section-avanzado" style="border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;margin-bottom:20px;">
            <div class="section-header-avanzado" style="background:#F9FAFB;border-bottom:1px solid #E5E7EB;padding:12px 16px;">
                <h2 style="margin:0;font-size:15px;font-weight:600;color:#111827;">Carga y Calidad por Miembro del Equipo</h2>
            </div>
            <div style="padding:20px;color:#9CA3AF;font-size:13px;">Sin datos suficientes para este análisis.</div>
        </div>`;
    }

    const sprintLabel = validos.map(d => `Sprint ${d.sprint}`).join(' · ');

    // ── Render de un sub-panel por sprint ──────────────────────────────────
    function renderSprintPanel(d) {
        const { sprint, personas } = d;
        const subId = `carga-persona-sprint-${sprint}-content`;
        const totalTickets  = personas.reduce((s, p) => s + p.total, 0);
        const totalBugs     = personas.reduce((s, p) => s + p.errores, 0);
        const totalTareas   = personas.reduce((s, p) => s + p.tareas, 0);
        const totalHistorias= personas.reduce((s, p) => s + p.historias, 0);
        const totalSpEst    = parseFloat(personas.reduce((s, p) => s + p.spEstimado, 0).toFixed(1));
        const totalSpReal   = parseFloat(personas.reduce((s, p) => s + p.spReal, 0).toFixed(1));
        const totalDesv     = parseFloat((totalSpReal - totalSpEst).toFixed(1));
        const totalCC       = parseFloat(personas.reduce((s, p) => s + p.capacidadComp, 0).toFixed(1));

        // ── 3 summary cards: Bugs, Tareas, Historias ──
        const resumenMini = `
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;">
                <div style="background:#fff;border:1px solid #E5E7EB;border-radius:8px;padding:14px 12px;text-align:center;">
                    <div style="font-size:22px;font-weight:700;color:#111827;line-height:1;">${totalBugs}</div>
                    <div style="font-size:10px;color:#6B7280;margin-top:5px;font-weight:500;letter-spacing:0.06em;text-transform:uppercase;">Bugs</div>
                </div>
                <div style="background:#fff;border:1px solid #E5E7EB;border-radius:8px;padding:14px 12px;text-align:center;">
                    <div style="font-size:22px;font-weight:700;color:#111827;line-height:1;">${totalTareas}</div>
                    <div style="font-size:10px;color:#6B7280;margin-top:5px;font-weight:500;letter-spacing:0.06em;text-transform:uppercase;">Tareas</div>
                </div>
                <div style="background:#fff;border:1px solid #E5E7EB;border-radius:8px;padding:14px 12px;text-align:center;">
                    <div style="font-size:22px;font-weight:700;color:#111827;line-height:1;">${totalHistorias}</div>
                    <div style="font-size:10px;color:#6B7280;margin-top:5px;font-weight:500;letter-spacing:0.06em;text-transform:uppercase;">Historias</div>
                </div>
            </div>`;

        // Registrar datos del popup como JSON puro (script[type=application/json] sí funciona en innerHTML)
        const popupDataScript = personas.map(p => {
            const pk = `${sprint}-${p.nombre.replace(/[^a-zA-Z0-9]/g, '_')}`;
            return `<script type="application/json" id="tkdata-${pk}-all">${JSON.stringify(p.tkAll)}<\/script>`
                 + `<script type="application/json" id="tkdata-${pk}-bugs">${JSON.stringify(p.tkBugs)}<\/script>`
                 + `<script type="application/json" id="tkdata-${pk}-tareas">${JSON.stringify(p.tkTareas)}<\/script>`
                 + `<script type="application/json" id="tkdata-${pk}-historias">${JSON.stringify(p.tkHistorias)}<\/script>`
                 + `<script type="application/json" id="tkdata-${pk}-ti">${JSON.stringify(p.tkTI)}<\/script>`
                 + `<script type="application/json" id="tkdata-${pk}-cc">${JSON.stringify(p.tkCompromiso)}<\/script>`;
        }).join('');

        const filas = personas.map((p, idx) => {
            const desv = parseFloat((p.spReal - p.spEstimado).toFixed(1));
            const rowBg = idx % 2 === 0 ? '#fff' : '#F9FAFB';
            const dStyle = desv > 0
                ? 'color:#92400E;font-weight:700;'
                : desv < 0
                    ? 'color:#065F46;font-weight:700;'
                    : 'color:#6B7280;font-weight:600;';
            const tiVal = p.testIssues > 0 ? p.testIssues + ' (' + p.pctTestIssues + '%)' : '—';
            const tiStyle = p.testIssues === 0
                ? 'color:#9CA3AF;'
                : p.pctTestIssues >= 20
                    ? 'color:#B91C1C;font-weight:700;'
                    : 'color:#92400E;font-weight:600;';
            const pk = `${sprint}-${p.nombre.replace(/[^a-zA-Z0-9]/g, '_')}`;
            const clickStyle = 'cursor:pointer;text-decoration:underline dotted;text-underline-offset:2px;';
            return `
            <tr style="background:${rowBg};border-top:1px solid #F3F4F6;">
                <td style="padding:10px 14px;font-size:12px;color:#111827;white-space:nowrap;">
                    <div style="display:flex;align-items:center;gap:9px;">
                        <div style="width:26px;height:26px;border-radius:50%;background:#E5E7EB;display:flex;align-items:center;justify-content:center;color:#374151;font-size:10px;font-weight:700;flex-shrink:0;">
                            ${p.nombre.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}
                        </div>
                        <span onclick="showCargaPopup('${pk}-all','${p.nombre} — Todos')" style="font-weight:500;${clickStyle}">${p.nombre}</span>
                    </div>
                </td>
                <td style="padding:10px 8px;text-align:center;font-size:12px;color:#374151;">
                    <span onclick="showCargaPopup('${pk}-bugs','${p.nombre} — Bugs')" style="${p.errores > 0 ? clickStyle : ''}">${p.errores}</span>
                </td>
                <td style="padding:10px 8px;text-align:center;font-size:12px;color:#374151;">
                    <span onclick="showCargaPopup('${pk}-tareas','${p.nombre} — Tareas')" style="${p.tareas > 0 ? clickStyle : ''}">${p.tareas}</span>
                </td>
                <td style="padding:10px 8px;text-align:center;font-size:12px;color:#374151;">
                    <span onclick="showCargaPopup('${pk}-historias','${p.nombre} — Historias')" style="${p.historias > 0 ? clickStyle : ''}">${p.historias}</span>
                </td>
                <td style="padding:10px 8px;text-align:center;font-size:12px;font-weight:600;color:#111827;">
                    <span onclick="showCargaPopup('${pk}-all','${p.nombre} — Todos')" style="${clickStyle}">${p.total}</span>
                </td>
                <td style="padding:10px 10px;text-align:center;font-size:12px;color:#D97706;font-weight:600;">
                    <span onclick="${p.capacidadComp > 0 ? `showCargaPopup('${pk}-cc','${p.nombre} — Capacidad Comprometida')` : ''}" style="${p.capacidadComp > 0 ? clickStyle : 'color:#9CA3AF;'}">${p.capacidadComp > 0 ? p.capacidadComp+' SP' : '—'}</span>
                </td>
                <td style="padding:10px 10px;text-align:center;font-size:12px;color:#4338CA;font-weight:600;">
                    <span onclick="showCargaPopup('${pk}-all','${p.nombre} — SP Est. (todos)')" style="${p.spEstimado > 0 ? clickStyle : ''}">${p.spEstimado > 0 ? p.spEstimado+' SP' : '—'}</span>
                </td>
                <td style="padding:10px 10px;text-align:center;font-size:12px;color:#065F46;font-weight:600;">
                    <span onclick="showCargaPopup('${pk}-all','${p.nombre} — SP Real (todos)')" style="${p.spReal > 0 ? clickStyle : ''}">${p.spReal > 0 ? p.spReal+'d' : '—'}</span>
                </td>
                <td style="padding:10px 8px;text-align:center;font-size:12px;${dStyle}">
                    ${desv === 0 ? '—' : (desv > 0 ? '+' : '') + desv + 'd'}
                </td>
                <td style="padding:10px 8px;text-align:center;font-size:12px;color:#374151;">
                    <span onclick="showCargaPopup('${pk}-bugs','${p.nombre} — Bugs / SP Est.')" style="${p.spEstimado > 0 ? clickStyle : ''}">${p.spEstimado > 0 ? Math.round(p.spEstBugs / p.spEstimado * 100) + '%' : '—'}</span>
                </td>
                <td style="padding:10px 8px;text-align:center;font-size:12px;color:#374151;">
                    <span onclick="showCargaPopup('${pk}-bugs','${p.nombre} — Bugs / SP Real')" style="${p.spReal > 0 ? clickStyle : ''}">${p.spReal > 0 ? Math.round(p.spRealBugs / p.spReal * 100) + '%' : '—'}</span>
                </td>
                <td style="padding:10px 8px;text-align:center;font-size:12px;${tiStyle}">
                    <span onclick="showCargaPopup('${pk}-ti','${p.nombre} — QA→Test Issue')" style="${p.testIssues > 0 ? clickStyle : ''}">${tiVal}</span>
                </td>
            </tr>`;
        }).join('');

        return `
            <div style="border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;margin-bottom:12px;">
                <div class="collapsible" onclick="toggleSection('${subId}')"
                     style="background:#F9FAFB;border-bottom:1px solid #E5E7EB;padding:10px 16px;cursor:pointer;display:flex;align-items:center;gap:10px;user-select:none;">
                    <span class="collapse-icon" id="icon-${subId}" style="color:#9CA3AF;font-size:13px;transition:transform 0.3s ease;">▼</span>
                    <span style="font-size:13px;font-weight:600;color:#111827;">Sprint ${sprint}</span>
                </div>
                <div id="${subId}" class="section-content-avanzado" style="padding:16px 14px;">
                    ${popupDataScript}
                    ${resumenMini}
                    <div style="overflow-x:auto;">
                        <table style="width:100%;border-collapse:collapse;font-size:12px;">
                            <thead>
                                <tr>
                                    <th style="padding:9px 14px;text-align:left;font-weight:700;color:#F9FAFB;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;white-space:nowrap;background:#374151;border-bottom:2px solid #4B5563;">Miembro</th>
                                    <th style="padding:9px 8px;text-align:center;font-weight:700;color:#F9FAFB;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;background:#374151;border-bottom:2px solid #4B5563;">Bugs</th>
                                    <th style="padding:9px 8px;text-align:center;font-weight:700;color:#F9FAFB;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;background:#374151;border-bottom:2px solid #4B5563;">Tareas</th>
                                    <th style="padding:9px 8px;text-align:center;font-weight:700;color:#F9FAFB;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;background:#374151;border-bottom:2px solid #4B5563;">Historias</th>
                                    <th style="padding:9px 8px;text-align:center;font-weight:700;color:#F9FAFB;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;background:#374151;border-bottom:2px solid #4B5563;">Total</th>
                                    <th style="padding:9px 8px;text-align:center;font-weight:700;color:#FCD34D;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;background:#374151;border-bottom:2px solid #4B5563;">CC</th>
                                    <th style="padding:9px 10px;text-align:center;font-weight:700;color:#A5B4FC;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;background:#374151;border-bottom:2px solid #4B5563;">SP Est.</th>
                                    <th style="padding:9px 10px;text-align:center;font-weight:700;color:#6EE7B7;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;background:#374151;border-bottom:2px solid #4B5563;">SP Real</th>
                                    <th style="padding:9px 8px;text-align:center;font-weight:700;color:#F9FAFB;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;background:#374151;border-bottom:2px solid #4B5563;">Desviación</th>
                                    <th style="padding:9px 8px;text-align:center;font-weight:700;color:#FCA5A5;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;background:#374151;border-bottom:2px solid #4B5563;white-space:nowrap;">% Bugs / SP Est.</th>
                                    <th style="padding:9px 8px;text-align:center;font-weight:700;color:#FCA5A5;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;background:#374151;border-bottom:2px solid #4B5563;white-space:nowrap;">% Bugs / SP Real</th>
                                    <th style="padding:9px 8px;text-align:center;font-weight:700;color:#F9FAFB;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;background:#374151;border-bottom:2px solid #4B5563;white-space:nowrap;">QA → Test Issue</th>
                                </tr>
                            </thead>
                            <tbody>${filas}</tbody>
                            <tfoot>
                                <tr style="background:#F3F4F6;border-top:2px solid #D1D5DB;">
                                    <td style="padding:10px 14px;font-size:12px;font-weight:700;color:#111827;">TOTAL</td>
                                    <td style="padding:10px 8px;text-align:center;font-size:12px;color:#6B7280;">—</td>
                                    <td style="padding:10px 8px;text-align:center;font-size:12px;color:#6B7280;">—</td>
                                    <td style="padding:10px 8px;text-align:center;font-size:12px;color:#6B7280;">—</td>
                                    <td style="padding:10px 8px;text-align:center;font-size:12px;color:#6B7280;">—</td>
                                    <td style="padding:10px 10px;text-align:center;font-size:12px;color:#D97706;font-weight:700;">${totalCC > 0 ? totalCC + ' SP' : '—'}</td>
                                    <td style="padding:10px 10px;text-align:center;font-size:12px;color:#4338CA;font-weight:700;">${totalSpEst > 0 ? totalSpEst + ' SP' : '—'}</td>
                                    <td style="padding:10px 10px;text-align:center;font-size:12px;color:#065F46;font-weight:700;">${totalSpReal > 0 ? totalSpReal + 'd' : '—'}</td>
                                    <td style="padding:10px 8px;text-align:center;font-size:12px;color:#6B7280;">—</td>
                                    <td style="padding:10px 8px;text-align:center;font-size:12px;color:#6B7280;">—</td>
                                    <td style="padding:10px 8px;text-align:center;font-size:12px;color:#6B7280;">—</td>
                                    <td style="padding:10px 8px;text-align:center;font-size:12px;color:#6B7280;">—</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    <div style="margin-top:12px;padding:9px 12px;background:#F9FAFB;border:1px solid #E5E7EB;border-radius:6px;font-size:11px;color:#6B7280;line-height:1.5;">
                        <strong style="color:#D97706;">CC (Capacidad Comprometida):</strong> SP estimados de todos los tickets del sprint (finalizados + arrastrados al siguiente).
                        &nbsp;·&nbsp; <strong style="color:#374151;">SP Real:</strong> días en estado <em>In Process</em> + <em>Test Issues</em> (devs) · <em>In Test</em> + <em>Test Issues</em> (QA: Said Cervantes Correa).
                        &nbsp;·&nbsp; <strong style="color:#374151;">Desviación:</strong> SP Real − SP Est. (positivo = tardó más que lo planificado).
                        &nbsp;·&nbsp; <strong style="color:#374151;">QA → Test Issue:</strong> tickets que regresaron a corrección durante QA (&gt;20% = área de mejora).
                    </div>
                </div>
            </div>`;
    }

    // ── Modal popup (sólo el div, sin script) ──────────────────────
    const popupHTML = `
        <div id="carga-popup-overlay" onclick="if(event.target===this)closeCargaPopup()" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:99999;align-items:center;justify-content:center;">
            <div style="background:#fff;border-radius:10px;box-shadow:0 20px 60px rgba(0,0,0,0.25);width:min(860px,95vw);max-height:80vh;display:flex;flex-direction:column;overflow:hidden;">
                <div style="padding:14px 18px;border-bottom:1px solid #E5E7EB;display:flex;align-items:center;justify-content:space-between;background:#F9FAFB;">
                    <div id="carga-popup-title" style="font-size:13px;font-weight:600;color:#111827;"></div>
                    <button onclick="closeCargaPopup()" style="background:none;border:none;cursor:pointer;font-size:18px;color:#6B7280;line-height:1;padding:2px 6px;border-radius:4px;">&times;</button>
                </div>
                <div id="carga-popup-body" style="overflow-y:auto;padding:14px 18px;"></div>
            </div>
        </div>`;

    return popupHTML + `
        <div class="kpi-section-avanzado" style="border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;margin-bottom:20px;">
            <div class="section-header-avanzado collapsible" onclick="toggleSection('carga-persona-content')"
                 style="background:#F9FAFB;border-bottom:1px solid #E5E7EB;padding:12px 16px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;transition:background 0.2s ease;user-select:none;">
                <div style="display:flex;align-items:center;gap:10px;">
                    <span class="collapse-icon" id="icon-carga-persona-content" style="color:#9CA3AF;font-size:14px;transition:transform 0.3s ease;">▼</span>
                    <svg style="width:18px;height:18px;flex-shrink:0;" fill="none" stroke="#6B7280" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    <h2 style="margin:0;font-size:14px;font-weight:600;color:#111827;">Carga y Calidad por Miembro del Equipo</h2>
                </div>
                <span style="font-size:11px;color:#9CA3AF;">${sprintLabel}</span>
            </div>
            <div id="carga-persona-content" class="section-content-avanzado" style="padding:16px;">
                ${validos.map(d => renderSprintPanel(d)).join('')}
            </div>
        </div>`;
}


// ============================================================================
// KPI: CAPACIDAD AÑADIDA POR SPRINT (SCOPE CREEP)
// ============================================================================

/**
 * Calcula el porcentaje de tickets incorporados después del inicio del sprint.
 * Usa la fecha de creación más temprana del sprint como referencia de inicio.
 * Tickets creados > 2 días después del inicio se consideran capacidad añadida.
 */
function calcularScopeCreep(tickets, sprintsTarget) {
    const result = [];
    sprintsTarget.forEach(s => {
        const ts = tickets.filter(t => String(t.sprint) === String(s) && t.estado !== 'Arrastrado');
        if (ts.length === 0) { result.push({ sprint: s, planificados: 0, añadidos: 0, pct: 0, total: 0, inicioEstimado: '—' }); return; }

        const fechas = ts.map(t => parsearFechaAvanzada(t.creada)).filter(f => f);
        if (fechas.length === 0) { result.push({ sprint: s, planificados: ts.length, añadidos: 0, pct: 0, total: ts.length, inicioEstimado: '—' }); return; }

        fechas.sort((a, b) => a - b);
        const inicioSprint = fechas[0];
        // Ventana de planificación: hasta 2 días después de la primera tarea creada
        const umbral = new Date(inicioSprint.getTime() + 2 * 24 * 60 * 60 * 1000);

        const ticketsPlanificados = ts.filter(t => { const f = parsearFechaAvanzada(t.creada); return f && f <= umbral; });
        const ticketsAñadidos    = ts.filter(t => { const f = parsearFechaAvanzada(t.creada); return f && f > umbral; });

        const pct = parseFloat(((ticketsAñadidos.length / ts.length) * 100).toFixed(1));
        const spPlan = parseFloat(ticketsPlanificados.reduce((sum, t) => sum + (parseFloat(t.storyPointEstimate) || 0), 0).toFixed(1));
        const spAñad = parseFloat(ticketsAñadidos.reduce((sum, t) => sum + (parseFloat(t.storyPointEstimate) || 0), 0).toFixed(1));

        result.push({
            sprint: s,
            planificados: ticketsPlanificados.length, añadidos: ticketsAñadidos.length,
            total: ts.length, pct,
            spPlanificados: spPlan, spAñadidos: spAñad,
            spTotal: parseFloat((spPlan + spAñad).toFixed(1)),
            inicioEstimado: inicioSprint.toLocaleDateString('es-ES', { day:'2-digit', month:'short', year:'2-digit' }),
            umbralEstimado: umbral.toLocaleDateString('es-ES', { day:'2-digit', month:'short', year:'2-digit' })
        });
    });
    return result;
}

function renderScopeCreepSection(data) {
    if (!data || data.length === 0) return '';
    const validos = data.filter(d => d.total > 0);
    if (validos.length === 0) return '';

    const avgPct = parseFloat((validos.reduce((s, d) => s + d.pct, 0) / validos.length).toFixed(1));
    const maxAñadidos = Math.max(...validos.map(d => d.añadidos), 1);
    const totalAñadidos = validos.reduce((s, d) => s + d.añadidos, 0);

    const statusColor = avgPct <= 10 ? '#D1FAE5' : avgPct <= 20 ? '#FEF3C7' : '#FEE2E2';
    const statusTextColor = avgPct <= 10 ? '#065F46' : avgPct <= 20 ? '#92400E' : '#991B1B';
    const statusLabel = avgPct <= 10 ? '✓ Controlado' : avgPct <= 20 ? '⚠ Revisar' : '✗ Crítico';

    const resumenCards = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:20px;">
            <div style="background:#F8F7FF;border:1px solid #E8E6FF;border-radius:8px;padding:14px;text-align:center;">
                <div style="font-size:24px;font-weight:700;color:#6C63FF;">${avgPct}%</div>
                <div style="font-size:11px;color:#64748B;margin-top:4px;font-weight:500;">SCOPE CREEP PROMEDIO</div>
            </div>
            <div style="background:#FFF5F5;border:1px solid #FED7D7;border-radius:8px;padding:14px;text-align:center;">
                <div style="font-size:24px;font-weight:700;color:#E53E3E;">${totalAñadidos}</div>
                <div style="font-size:11px;color:#64748B;margin-top:4px;font-weight:500;">TICKETS AÑADIDOS</div>
            </div>
            <div style="background:#F0F9FF;border:1px solid #BAE6FD;border-radius:8px;padding:14px;text-align:center;">
                <div style="font-size:24px;font-weight:700;color:#0284C7;">${validos.reduce((s,d)=>s+d.planificados,0)}</div>
                <div style="font-size:11px;color:#64748B;margin-top:4px;font-weight:500;">TICKETS PLANIFICADOS</div>
            </div>
            <div style="background:${statusColor};border:1px solid ${statusColor};border-radius:8px;padding:14px;text-align:center;">
                <div style="font-size:18px;font-weight:700;color:${statusTextColor};">${statusLabel}</div>
                <div style="font-size:11px;color:#64748B;margin-top:4px;font-weight:500;">META: &lt; 10%</div>
            </div>
        </div>`;

    const barras = validos.map(d => {
        const widthPlan = d.total > 0 ? ((d.planificados / d.total) * 100).toFixed(1) : 0;
        const widthAñad = d.total > 0 ? ((d.añadidos / d.total) * 100).toFixed(1) : 0;
        const alertColor = d.pct <= 10 ? '#10B981' : d.pct <= 20 ? '#F59E0B' : '#EF4444';
        return `
        <div style="margin-bottom:16px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
                <span style="font-size:13px;font-weight:600;color:#1F2937;">Sprint ${d.sprint}</span>
                <div style="display:flex;align-items:center;gap:8px;">
                    <span style="font-size:11px;color:#6B7280;">Inicio est.: ${d.inicioEstimado}</span>
                    <span style="background:${alertColor}22;color:${alertColor};padding:2px 8px;border-radius:10px;font-size:12px;font-weight:700;">${d.pct}% añadido</span>
                </div>
            </div>
            <div style="height:28px;background:#F3F4F6;border-radius:6px;overflow:hidden;display:flex;">
                <div style="width:${widthPlan}%;background:linear-gradient(to right,#6C63FF,#818CF8);display:flex;align-items:center;justify-content:center;transition:width 0.6s ease;">
                    ${d.planificados > 0 ? `<span style="font-size:11px;font-weight:600;color:#fff;white-space:nowrap;padding:0 6px;">${d.planificados} plan.</span>` : ''}
                </div>
                <div style="width:${widthAñad}%;background:linear-gradient(to right,#F97316,#FB923C);display:flex;align-items:center;justify-content:center;transition:width 0.6s ease;">
                    ${d.añadidos > 0 ? `<span style="font-size:11px;font-weight:600;color:#fff;white-space:nowrap;padding:0 6px;">${d.añadidos} añad.</span>` : ''}
                </div>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:11px;color:#9CA3AF;margin-top:3px;">
                <span>${d.planificados} tickets · ${d.spPlanificados} SP planificados</span>
                <span>${d.añadidos} tickets · ${d.spAñadidos} SP añadidos</span>
            </div>
        </div>`;
    }).join('');

    const tablaFilas = validos.map(d => {
        const alertColor = d.pct <= 10 ? '#D1FAE5' : d.pct <= 20 ? '#FEF3C7' : '#FEE2E2';
        const alertText = d.pct <= 10 ? '#065F46' : d.pct <= 20 ? '#92400E' : '#991B1B';
        return `
        <tr style="border-top:1px solid #F3F4F6;">
            <td style="padding:10px 12px;font-size:13px;font-weight:600;color:#1F2937;">Sprint ${d.sprint}</td>
            <td style="padding:10px 8px;text-align:center;font-size:13px;color:#374151;">${d.total}</td>
            <td style="padding:10px 8px;text-align:center;font-size:13px;color:#6C63FF;font-weight:600;">${d.planificados}</td>
            <td style="padding:10px 8px;text-align:center;font-size:13px;color:#F97316;font-weight:600;">${d.añadidos}</td>
            <td style="padding:10px 8px;text-align:center;">
                <span style="background:${alertColor};color:${alertText};padding:3px 10px;border-radius:10px;font-size:12px;font-weight:700;">${d.pct}%</span>
            </td>
            <td style="padding:10px 8px;text-align:center;font-size:12px;color:#6B7280;">${d.spPlanificados} SP</td>
            <td style="padding:10px 8px;text-align:center;font-size:12px;color:#6B7280;">${d.spAñadidos} SP</td>
            <td style="padding:10px 12px;font-size:11px;color:#9CA3AF;">${d.inicioEstimado}</td>
        </tr>`;
    }).join('');

    return `
        <div class="kpi-section-avanzado" style="border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;margin-bottom:20px;">
            <div class="section-header-avanzado collapsible" onclick="toggleSection('scope-creep-content')"
                 style="background:linear-gradient(to right,#F3F4F6,#E5E7EB);padding:12px 16px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;transition:all 0.3s ease;">
                <div style="display:flex;align-items:center;gap:12px;">
                    <span class="collapse-icon" id="icon-scope-creep-content" style="color:#6B7280;font-size:18px;transition:transform 0.3s ease;">▼</span>
                    <svg style="width:20px;height:20px;" fill="none" stroke="#F97316" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <h2 style="margin:0;font-size:16px;font-weight:600;color:#1F2937;">Capacidad Añadida por Sprint (Scope Creep)</h2>
                </div>
                <span style="font-size:11px;color:#9CA3AF;font-weight:500;">Sprints ${validos.map(d=>'S'+d.sprint).join('–')}</span>
            </div>
            <div id="scope-creep-content" class="section-content-avanzado" style="padding:16px;">
                ${resumenCards}
                <div style="margin-bottom:20px;">
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
                        <h3 style="margin:0;font-size:14px;font-weight:600;color:#374151;">Distribución Planificado vs Añadido</h3>
                        <div style="display:flex;align-items:center;gap:12px;font-size:11px;color:#6B7280;">
                            <span><span style="display:inline-block;width:10px;height:10px;background:#6C63FF;border-radius:2px;margin-right:4px;vertical-align:middle;"></span>Planificado</span>
                            <span><span style="display:inline-block;width:10px;height:10px;background:#F97316;border-radius:2px;margin-right:4px;vertical-align:middle;"></span>Añadido durante sprint</span>
                        </div>
                    </div>
                    ${barras}
                </div>
                <div style="overflow-x:auto;">
                    <table style="width:100%;border-collapse:collapse;font-size:12px;">
                        <thead>
                            <tr style="background:#FFF8F3;">
                                <th style="padding:10px 12px;text-align:left;font-weight:600;color:#374151;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">Sprint</th>
                                <th style="padding:10px 8px;text-align:center;font-weight:600;color:#374151;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">Total</th>
                                <th style="padding:10px 8px;text-align:center;font-weight:600;color:#6C63FF;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">Planificados</th>
                                <th style="padding:10px 8px;text-align:center;font-weight:600;color:#F97316;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">Añadidos</th>
                                <th style="padding:10px 8px;text-align:center;font-weight:600;color:#374151;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">% Scope Creep</th>
                                <th style="padding:10px 8px;text-align:center;font-weight:600;color:#6B7280;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">SP Plan.</th>
                                <th style="padding:10px 8px;text-align:center;font-weight:600;color:#6B7280;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">SP Añad.</th>
                                <th style="padding:10px 12px;text-align:left;font-weight:600;color:#9CA3AF;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">Inicio Est.</th>
                            </tr>
                        </thead>
                        <tbody>${tablaFilas}</tbody>
                    </table>
                </div>
                <div style="margin-top:12px;padding:10px 14px;background:#FFF8F0;border-left:3px solid #F97316;border-radius:0 6px 6px 0;font-size:11px;color:#92400E;">
                    <strong>Metodología:</strong> Se establece el inicio del sprint en la fecha de creación del primer ticket del sprint.
                    Tickets creados más de 2 días después se clasifican como capacidad añadida. Meta recomendada: <strong>&lt;10%</strong> de scope creep por sprint.
                </div>
            </div>
        </div>`;
}


// ============================================================================
// KPI: VELOCIDAD Y MÁXIMO TEÓRICO POR SPRINT
// ============================================================================

/**
 * Calcula la velocidad real (SP entregados) vs máximo teórico (SP comprometidos)
 * por sprint, con desglose por tipo de ticket.
 */
function calcularVelocidadSprint(tickets, sprintsTarget) {
    return sprintsTarget.map(s => {
        const ts = tickets.filter(t => String(t.sprint) === String(s) && t.estado !== 'Arrastrado');
        const entregados = ts.filter(t => t.estadoNormalizado === 'Finalizados');

        const spComprometido = parseFloat(ts.reduce((sum, t) => sum + (parseFloat(t.storyPointEstimate) || 0), 0).toFixed(1));
        const spEntregado    = parseFloat(entregados.reduce((sum, t) => sum + (parseFloat(t.storyPointEstimate) || 0), 0).toFixed(1));
        const eficiencia     = spComprometido > 0 ? parseFloat(((spEntregado / spComprometido) * 100).toFixed(1)) : 0;

        const byTipo = { Error: {n:0,sp:0}, Tarea: {n:0,sp:0}, Historia: {n:0,sp:0}, Otro: {n:0,sp:0} };
        entregados.forEach(t => {
            const tipo = (t.tipoIncidencia || '').toLowerCase();
            const sp = parseFloat(t.storyPointEstimate) || 0;
            if      (tipo.includes('error') || tipo.includes('bug')) { byTipo.Error.n++;    byTipo.Error.sp    += sp; }
            else if (tipo.includes('histor'))                         { byTipo.Historia.n++; byTipo.Historia.sp += sp; }
            else if (tipo.includes('tarea') || tipo.includes('spike')){ byTipo.Tarea.n++;   byTipo.Tarea.sp    += sp; }
            else                                                      { byTipo.Otro.n++;    byTipo.Otro.sp     += sp; }
        });
        Object.keys(byTipo).forEach(k => { byTipo[k].sp = parseFloat(byTipo[k].sp.toFixed(1)); });

        return { sprint: s, total: ts.length, entregados: entregados.length, spComprometido, spEntregado, eficiencia, byTipo };
    });
}

function renderVelocidadSection(data) {
    if (!data || data.length === 0) return '';
    const validos = data.filter(d => d.total > 0);
    if (validos.length === 0) return '';

    const sprintsCerrados = validos.filter(d => d.eficiencia >= 90);
    const avgVelocidad = validos.length > 0 ? parseFloat((validos.reduce((s, d) => s + d.spEntregado, 0) / validos.length).toFixed(1)) : 0;
    const maxVelocidad = Math.max(...validos.map(d => d.spEntregado), 0);
    const avgEficiencia = validos.length > 0 ? parseFloat((validos.reduce((s, d) => s + d.eficiencia, 0) / validos.length).toFixed(1)) : 0;
    const maxSPBar = Math.max(...validos.map(d => d.spComprometido), 1);

    const resumenCards = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:20px;">
            <div style="background:#F8F7FF;border:1px solid #E8E6FF;border-radius:8px;padding:14px;text-align:center;">
                <div style="font-size:24px;font-weight:700;color:#6C63FF;">${avgVelocidad}</div>
                <div style="font-size:11px;color:#64748B;margin-top:4px;font-weight:500;">SP PROMEDIO / SPRINT</div>
            </div>
            <div style="background:#F0FFF4;border:1px solid #C6F6D5;border-radius:8px;padding:14px;text-align:center;">
                <div style="font-size:24px;font-weight:700;color:#276749;">${maxVelocidad}</div>
                <div style="font-size:11px;color:#64748B;margin-top:4px;font-weight:500;">MÁXIMO ALCANZADO</div>
            </div>
            <div style="background:#EEF2FF;border:1px solid #C7D2FE;border-radius:8px;padding:14px;text-align:center;">
                <div style="font-size:24px;font-weight:700;color:#4338CA;">${avgEficiencia}%</div>
                <div style="font-size:11px;color:#64748B;margin-top:4px;font-weight:500;">EFICIENCIA PROMEDIO</div>
            </div>
            <div style="background:#F0F9FF;border:1px solid #BAE6FD;border-radius:8px;padding:14px;text-align:center;">
                <div style="font-size:24px;font-weight:700;color:#0284C7;">${sprintsCerrados.length}/${validos.length}</div>
                <div style="font-size:11px;color:#64748B;margin-top:4px;font-weight:500;">SPRINTS ≥ 90% EFIC.</div>
            </div>
        </div>`;

    const barChart = `
        <div style="margin-bottom:20px;">
            <h3 style="font-size:14px;font-weight:600;color:#374151;margin-bottom:14px;display:flex;align-items:center;gap:8px;">
                Velocidad Real vs Máximo Teórico
                <div style="display:flex;align-items:center;gap:10px;font-size:11px;font-weight:400;color:#6B7280;">
                    <span><span style="display:inline-block;width:10px;height:10px;background:#6C63FF;border-radius:2px;margin-right:4px;vertical-align:middle;"></span>SP Entregados</span>
                    <span><span style="display:inline-block;width:10px;height:10px;background:#E5E7EB;border:1px solid #D1D5DB;border-radius:2px;margin-right:4px;vertical-align:middle;"></span>SP Comprometidos</span>
                </div>
            </h3>
            ${validos.map(d => {
                const pctE = ((d.spEntregado / maxSPBar) * 100).toFixed(1);
                const pctC = ((d.spComprometido / maxSPBar) * 100).toFixed(1);
                const efColor = d.eficiencia >= 90 ? '#10B981' : d.eficiencia >= 70 ? '#F59E0B' : '#EF4444';
                return `
                <div style="margin-bottom:14px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
                        <span style="font-size:13px;font-weight:600;color:#1F2937;">Sprint ${d.sprint}</span>
                        <span style="font-size:12px;color:${efColor};font-weight:700;">${d.eficiencia}% eficiencia · ${d.entregados}/${d.total} tickets</span>
                    </div>
                    <div style="position:relative;height:32px;background:#F3F4F6;border-radius:6px;overflow:hidden;">
                        <div style="position:absolute;top:0;left:0;width:${pctC}%;height:100%;background:#E8E6FF;border-radius:6px;"></div>
                        <div style="position:absolute;top:4px;left:0;width:${pctE}%;height:24px;background:linear-gradient(to right,#6C63FF,#818CF8);border-radius:5px;display:flex;align-items:center;justify-content:flex-end;padding-right:8px;transition:width 0.6s ease;">
                            <span style="font-size:12px;font-weight:700;color:#fff;white-space:nowrap;">${d.spEntregado} SP</span>
                        </div>
                    </div>
                    <div style="font-size:11px;color:#9CA3AF;margin-top:3px;text-align:right;">Comprometido: ${d.spComprometido} SP</div>
                </div>`;
            }).join('')}
        </div>`;

    const tablaFilas = validos.map(d => {
        const efColor = d.eficiencia >= 90 ? '#D1FAE5' : d.eficiencia >= 70 ? '#FEF3C7' : '#FEE2E2';
        const efText  = d.eficiencia >= 90 ? '#065F46' : d.eficiencia >= 70 ? '#92400E' : '#991B1B';
        const tipos = [
            d.byTipo.Error.n > 0    ? `🐛 ${d.byTipo.Error.n} (${d.byTipo.Error.sp}SP)`       : null,
            d.byTipo.Tarea.n > 0    ? `⚙️ ${d.byTipo.Tarea.n} (${d.byTipo.Tarea.sp}SP)`       : null,
            d.byTipo.Historia.n > 0 ? `📖 ${d.byTipo.Historia.n} (${d.byTipo.Historia.sp}SP)` : null,
            d.byTipo.Otro.n > 0     ? `📌 ${d.byTipo.Otro.n} (${d.byTipo.Otro.sp}SP)`         : null,
        ].filter(Boolean).join('<br>');
        return `
        <tr style="border-top:1px solid #F3F4F6;">
            <td style="padding:10px 12px;font-size:13px;font-weight:600;color:#1F2937;">Sprint ${d.sprint}</td>
            <td style="padding:10px 8px;text-align:center;font-size:13px;color:#374151;">${d.total}</td>
            <td style="padding:10px 8px;text-align:center;font-size:13px;font-weight:600;color:#6C63FF;">${d.entregados}</td>
            <td style="padding:10px 8px;text-align:center;font-size:13px;color:#374151;">${d.spComprometido} SP</td>
            <td style="padding:10px 8px;text-align:center;font-size:13px;font-weight:700;color:#6C63FF;">${d.spEntregado} SP</td>
            <td style="padding:10px 8px;text-align:center;">
                <span style="background:${efColor};color:${efText};padding:3px 10px;border-radius:10px;font-size:12px;font-weight:700;">${d.eficiencia}%</span>
            </td>
            <td style="padding:10px 12px;font-size:11px;color:#6B7280;line-height:1.6;">${tipos || '—'}</td>
        </tr>`;
    }).join('');

    return `
        <div class="kpi-section-avanzado" style="border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;margin-bottom:20px;">
            <div class="section-header-avanzado collapsible" onclick="toggleSection('velocidad-content')"
                 style="background:linear-gradient(to right,#F3F4F6,#E5E7EB);padding:12px 16px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;transition:all 0.3s ease;">
                <div style="display:flex;align-items:center;gap:12px;">
                    <span class="collapse-icon" id="icon-velocidad-content" style="color:#6B7280;font-size:18px;transition:transform 0.3s ease;">▼</span>
                    <svg style="width:20px;height:20px;" fill="none" stroke="#10B981" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                    </svg>
                    <h2 style="margin:0;font-size:16px;font-weight:600;color:#1F2937;">Velocidad del Equipo y Máximo Teórico por Sprint</h2>
                </div>
                <span style="font-size:11px;color:#9CA3AF;font-weight:500;">Sprints ${validos.map(d=>'S'+d.sprint).join('–')}</span>
            </div>
            <div id="velocidad-content" class="section-content-avanzado" style="padding:16px;">
                ${resumenCards}
                ${barChart}
                <div style="overflow-x:auto;">
                    <table style="width:100%;border-collapse:collapse;font-size:12px;">
                        <thead>
                            <tr style="background:#F0FFF4;">
                                <th style="padding:10px 12px;text-align:left;font-weight:600;color:#374151;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">Sprint</th>
                                <th style="padding:10px 8px;text-align:center;font-weight:600;color:#374151;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">Tickets</th>
                                <th style="padding:10px 8px;text-align:center;font-weight:600;color:#6C63FF;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">Entregados</th>
                                <th style="padding:10px 8px;text-align:center;font-weight:600;color:#9CA3AF;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">SP Comprometido</th>
                                <th style="padding:10px 8px;text-align:center;font-weight:600;color:#6C63FF;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">SP Entregado</th>
                                <th style="padding:10px 8px;text-align:center;font-weight:600;color:#374151;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">Eficiencia</th>
                                <th style="padding:10px 12px;text-align:left;font-weight:600;color:#6B7280;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">Desglose Entregado</th>
                            </tr>
                        </thead>
                        <tbody>${tablaFilas}</tbody>
                    </table>
                </div>
                <div style="margin-top:12px;padding:10px 14px;background:#F0FFF4;border-left:3px solid #10B981;border-radius:0 6px 6px 0;font-size:11px;color:#065F46;">
                    <strong>Velocidad = SP entregados</strong> (tickets en estado Finalizados al cierre del sprint, excluyendo Arrastrado).
                    El <strong>Máximo Teórico</strong> es la suma de todos los SP comprometidos. La <strong>Eficiencia</strong> mide qué porcentaje de lo comprometido fue completado.
                    Una eficiencia estable &gt;80% indica un equipo con estimaciones fiables.
                </div>
            </div>
        </div>`;
}


// ==================== EVOLUCIÓN KPIs AVANZADOS (EXECUTIVE VIEW) ====================

let _evolChartInstances = {};

/**
 * Renderiza la sección de evolución histórica de KPIs avanzados (S32→S37)
 * Diseñada para presentación ejecutiva/junta directiva
 */
function renderEvolucionKPIsAvanzados() {
    const container = document.getElementById('evolucion-kpis-avanzados');
    if (!container || typeof allTickets === 'undefined' || !allTickets.length) return;

    Object.values(_evolChartInstances).forEach(c => { try { c.dispose(); } catch(e) {} });
    Object.keys(_evolChartInstances).forEach(k => delete _evolChartInstances[k]);

    const SPRINTS    = ['32', '33', '34', '35', '36', '37'];
    const SPRINTS_CL = ['35', '36', '37'];
    const LABELS     = SPRINTS.map(s => 'S' + s);
    const LABELS_CL  = SPRINTS_CL.map(s => 'S' + s);
    const clData     = (typeof changelogData !== 'undefined') ? changelogData : {};

    // ── DATOS ────────────────────────────────────────────────────────────────

    // 1. Lead Time
    const leadArr = SPRINTS.map(s => {
        const r = calcularLeadTime(allTickets, s);
        return { sprint: s, avg: (r && r.total > 0) ? parseFloat(r.promedio) : null, total: r ? r.total : 0 };
    });

    // 2. Cycle Time
    const cycleArr = SPRINTS_CL.map(s => {
        const r = calcularCycleTime(allTickets, [s]);
        const dets = r.ticketsDetalle || [];
        const n = Math.max(dets.length, 1);
        const sumOf = key => dets.reduce((acc, t) => acc + (t.etapas[key] || 0), 0);
        const touch  = sumOf('inProcess') + sumOf('codeReview') + sumOf('inTest');
        const lead   = dets.reduce((acc, t) => acc + (t.diasTotal || 0), 0);
        const flowEff = lead > 0 ? Math.round((touch / lead) * 100) : 0;
        return {
            sprint: s, avg: r.promedio || 0, total: r.total || 0, flowEff,
            stages: {
                inProcess:  parseFloat((sumOf('inProcess')  / n).toFixed(2)),
                codeReview: parseFloat((sumOf('codeReview') / n).toFixed(2)),
                inTest:     parseFloat((sumOf('inTest')     / n).toFixed(2)),
                inTestDev:  parseFloat((sumOf('inTestDev')  / n).toFixed(2)),
                blocked:    parseFloat((sumOf('blocked')    / n).toFixed(2)),
                testIssue:  parseFloat((sumOf('testIssue')  / n).toFixed(2)),
            }
        };
    });

    // 3. SLE
    const sleArr = SPRINTS_CL.map(s => {
        const r = calcularCycleTime(allTickets, [s]);
        const sorted = (r.ticketsDetalle || []).map(t => t.diasTotal || 0).filter(d => d > 0).sort((a, b) => a - b);
        const n = sorted.length;
        const pct = p => n === 0 ? null : sorted[Math.max(0, Math.ceil(p / 100 * n) - 1)];
        return { sprint: s, p50: pct(50), p90: pct(90), p95: pct(95), n };
    });

    // 4. Rework
    const reworkArr = SPRINTS_CL.map(s => {
        const r = calcularReworkPorSprint(allTickets, s);
        return { sprint: s, pct: parseFloat(r.porcentaje) || 0, con: r.conRework || 0, total: r.totalAnalizado || 0 };
    });

    // 5. Críticos
    const criticosArr = SPRINTS.map(s => {
        const ts = allTickets.filter(t => String(t.sprint) === s);
        const criticos = ts.filter(t => { const p = (t.prioridad || '').toLowerCase(); return p === 'highest' || p === 'critical'; });
        const cerrados = criticos.filter(t => t.estadoNormalizado === 'Finalizados');
        return { sprint: s, total: criticos.length, cerrados: cerrados.length, abiertos: criticos.length - cerrados.length };
    });

    // 6. Bugs vs Funcionalidad (misma lógica que calcularAnalisisErrores)
    const erroresArr = SPRINTS.map(s => {
        // Filtrar tickets del sprint excluyendo Arrastrado, Por hacer
        const ts = allTickets.filter(t => {
            if (String(t.sprint) !== s) return false;
            const estadoRaw = (t.estado || '').toLowerCase();
            const estadoNorm = (t.estadoNormalizado || '').toLowerCase();
            if (estadoRaw === 'arrastrado') return false;
            if (['tareas por hacer', 'to do', 'backlog'].some(e => estadoNorm.includes(e))) return false;
            return true;
        });
        // Excluir Epics, Spikes, Subtareas (igual que calcularAnalisisErrores)
        const ticketsReales = ts.filter(t => {
            const tipo = (t.tipoIncidencia || '').toLowerCase();
            return !tipo.includes('epic') && !tipo.includes('spike') && !tipo.includes('subtarea');
        });
        
        const bugs = ticketsReales.filter(t => {
            const tp = (t.tipoIncidencia || '').toLowerCase();
            return tp.includes('bug') || tp.includes('error') || tp === 'defect';
        });
        const tareas = ticketsReales.filter(t => {
            const tp = (t.tipoIncidencia || '').toLowerCase();
            return tp.includes('tarea') || tp.includes('task');
        });
        const hists = ticketsReales.filter(t => {
            const tp = (t.tipoIncidencia || '').toLowerCase();
            return tp.includes('histor') || tp.includes('story');
        });
        const otros = ticketsReales.filter(t => !bugs.includes(t) && !tareas.includes(t) && !hists.includes(t));
        
        const getSP = t => parseFloat(t.storyPointEstimate) || 0;
        const spBugs   = parseFloat(bugs.reduce((a, t) => a + getSP(t), 0).toFixed(1));
        const spTareas = parseFloat(tareas.reduce((a, t) => a + getSP(t), 0).toFixed(1));
        const spHists  = parseFloat(hists.reduce((a, t) => a + getSP(t), 0).toFixed(1));
        const spOtros  = parseFloat(otros.reduce((a, t) => a + getSP(t), 0).toFixed(1));
        const spFunc   = spTareas + spHists;
        const spTotal  = spBugs + spTareas + spHists + spOtros;
        
        const total = ticketsReales.length;
        const funcCount = tareas.length + hists.length;
        const pctBugs = total > 0 ? parseFloat(((bugs.length / total) * 100).toFixed(1)) : 0;
        const pctFunc = total > 0 ? parseFloat(((funcCount / total) * 100).toFixed(1)) : 0;
        const pctOtros = total > 0 ? parseFloat(((otros.length / total) * 100).toFixed(1)) : 0;
        const pctSpBugs = spTotal > 0 ? parseFloat(((spBugs / spTotal) * 100).toFixed(1)) : 0;
        const pctSpFunc = spTotal > 0 ? parseFloat(((spFunc / spTotal) * 100).toFixed(1)) : 0;
        const pctSpOtros = spTotal > 0 ? parseFloat(((spOtros / spTotal) * 100).toFixed(1)) : 0;
        
        return {
            sprint: s,
            bugs: bugs.length, func: funcCount, otros: otros.length, total,
            pctBugs, pctFunc, pctOtros,
            spBugs, spFunc, spOtros, spTotal,
            pctSpBugs, pctSpFunc, pctSpOtros
        };
    });

    // 7. Carga
    const cargaArr = SPRINTS.map(s => _calcularCargaPersonaSprint(allTickets, s, clData));

    // ── HELPERS ───────────────────────────────────────────────────────────────
    const ltLast  = leadArr.filter(d => d.avg !== null).slice(-1)[0];
    const ltPrev  = leadArr.filter(d => d.avg !== null).slice(-2, -1)[0];
    const cwLast  = cycleArr.slice(-1)[0];
    const cwPrev  = cycleArr.slice(-2, -1)[0];
    const sleLast = sleArr.slice(-1)[0];
    const rwLast  = reworkArr.slice(-1)[0];
    const rwPrev  = reworkArr.slice(-2, -1)[0];
    const crLast  = criticosArr.slice(-1)[0];
    const errLast = erroresArr.slice(-1)[0];
    const errPrev = erroresArr.slice(-2, -1)[0];

    // Delta badge — mismo estilo que el módulo existente
    function deltaBadge(curr, prev, lowerBetter) {
        if (curr == null || prev == null) return '';
        const d = curr - prev;
        if (Math.abs(d) < 0.05) return '<span style="font-size:11px;color:#9CA3AF;">Sin cambio</span>';
        const pct   = Math.abs((d / (Math.abs(prev) || 1)) * 100).toFixed(0);
        const good  = lowerBetter ? d < 0 : d > 0;
        const col   = good ? '#FFFFFF' : '#FFFFFF';
        const bg    = good ? '#10B981' : '#EF4444';
        const arrow = d > 0 ? '▲' : '▼';
        const sign  = d > 0 ? '+' : '';
        return '<span style="background:' + bg + ';color:' + col + ';padding:3px 9px;border-radius:4px;font-size:11px;font-weight:600;">'
            + arrow + ' ' + sign + d.toFixed(1) + ' (' + pct + '%)</span>';
    }

    // Status badge — estilo badge del módulo
    function statusBadge(val, goodT, warnT, lower) {
        if (val == null) return '<span style="background:#F3F4F6;color:#6B7280;padding:4px 10px;border-radius:4px;font-size:11px;font-weight:600;">Sin datos</span>';
        const good = lower ? +val <= goodT : +val >= goodT;
        const warn = lower ? +val <= warnT : +val >= warnT;
        if (good) return '<span style="background:#10B981;color:#FFFFFF;padding:4px 10px;border-radius:4px;font-size:11px;font-weight:600;">✓ Cumple objetivo</span>';
        if (warn) return '<span style="background:#F59E0B;color:#FFFFFF;padding:4px 10px;border-radius:4px;font-size:11px;font-weight:600;">⚠ Revisar</span>';
        return '<span style="background:#DC2626;color:#FFFFFF;padding:4px 10px;border-radius:4px;font-size:11px;font-weight:600;">✗ Fuera de objetivo</span>';
    }

    // Tarjeta KPI — diseño idéntico al módulo existente
    function kpiSection(id, icon_svg, title, subtitle, accentColor, bodyHtml) {
        return '<div style="background:#FFFFFF;border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;margin-bottom:20px;box-shadow:0 1px 3px rgba(0,0,0,.08);">'
            + '<div style="background:linear-gradient(to right,#F3F4F6,#E5E7EB);padding:12px 16px;display:flex;align-items:center;gap:12px;border-left:4px solid ' + accentColor + ';">'
            + icon_svg
            + '<div><div style="font-size:15px;font-weight:600;color:#1F2937;">' + title + '</div>'
            + '<div style="font-size:12px;color:#6B7280;margin-top:1px;">' + subtitle + '</div></div>'
            + '</div>'
            + '<div style="padding:16px;">' + bodyHtml + '</div>'
            + '</div>';
    }

    // Mini stat card — estilo kpi-card-avanzado del módulo
    function miniStat(label, val, unit, col) {
        return '<div style="flex:1;min-width:120px;background:#FFFFFF;border:1px solid #E5E7EB;border-radius:8px;padding:14px 16px;box-shadow:0 1px 3px rgba(0,0,0,.06);">'
            + '<div style="font-size:11px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;">' + label + '</div>'
            + '<div style="display:flex;align-items:baseline;gap:4px;">'
            + '<span style="font-size:28px;font-weight:700;color:' + col + ';line-height:1;">' + (val != null ? val : '—') + '</span>'
            + '<span style="font-size:12px;color:#9CA3AF;">' + unit + '</span>'
            + '</div>'
            + '</div>';
    }

    // Tabla helper
    function TH(txt, col, al) { return '<th style="padding:9px 12px;font-size:10px;font-weight:700;color:' + (col || '#6B7280') + ';text-transform:uppercase;letter-spacing:.5px;text-align:' + (al || 'center') + ';border-bottom:2px solid #E5E7EB;white-space:nowrap;">' + txt + '</th>'; }
    function TD(val, col)     { return '<td style="padding:8px 12px;font-size:12px;font-weight:600;color:' + (col || '#374151') + ';text-align:center;border-bottom:1px solid #F3F4F6;">' + val + '</td>'; }
    function TDL(val)         { return '<td style="padding:8px 12px;font-size:12px;font-weight:700;color:#243F6B;white-space:nowrap;border-bottom:1px solid #F3F4F6;">Sprint ' + val + '</td>'; }
    function TABLE(head, body) {
        return '<div style="overflow-x:auto;margin-top:12px;"><table style="width:100%;border-collapse:collapse;font-family:inherit;">'
            + '<thead><tr style="background:#F9FAFB;">' + head + '</tr></thead>'
            + '<tbody>' + body + '</tbody>'
            + '</table></div>';
    }

    // SVG icons tiny
    const icoFlow  = '<svg style="width:18px;height:18px;flex-shrink:0;color:#4B71A1;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>';
    const icoClock = '<svg style="width:18px;height:18px;flex-shrink:0;color:#243F6B;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
    const icoSLE   = '<svg style="width:18px;height:18px;flex-shrink:0;color:#059669;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
    const icoRW    = '<svg style="width:18px;height:18px;flex-shrink:0;color:#DC2626;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>';
    const icoBug   = '<svg style="width:18px;height:18px;flex-shrink:0;color:#F44336;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
    const icoAlert = '<svg style="width:18px;height:18px;flex-shrink:0;color:#D97706;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>';
    const icoTeam  = '<svg style="width:18px;height:18px;flex-shrink:0;color:#4B71A1;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>';

    // ── TABLAS ────────────────────────────────────────────────────────────────

    const ctTableHtml = TABLE(
        TH('Sprint', null, 'left') + TH('Ciclo Prom.','#243F6B') + TH('Flow Eff.','#4B71A1') + TH('In Process') + TH('Code Review') + TH('In Test') + TH('Blocked','#DC2626') + TH('Test Issues','#DC2626') + TH('Tickets','#6B7280'),
        cycleArr.map(c =>
            '<tr>' + TDL(c.sprint)
            + TD(c.avg + 'd', '#243F6B')
            + TD(c.flowEff + '%', c.flowEff >= 60 ? '#10B981' : c.flowEff >= 40 ? '#D97706' : '#DC2626')
            + TD(c.stages.inProcess + 'd')
            + TD(c.stages.codeReview + 'd')
            + TD(c.stages.inTest + 'd')
            + TD(c.stages.blocked > 0 ? c.stages.blocked + 'd' : '—', c.stages.blocked > 0.4 ? '#DC2626' : '#9CA3AF')
            + TD(c.stages.testIssue > 0 ? c.stages.testIssue + 'd' : '—', c.stages.testIssue > 0.2 ? '#DC2626' : '#9CA3AF')
            + TD(c.total + '', '#6B7280')
            + '</tr>'
        ).join('')
    );

    // Tabla Carga por Sprint
    function renderCargaTable(s) {
        const d = cargaArr.find(c => String(c.sprint) === String(s));
        if (!d || !d.personas.length)
            return '<p style="padding:16px;color:#9CA3AF;font-style:italic;font-size:13px;">Sin datos para Sprint ' + s + '</p>';
        
        // Obtener sprint anterior para comparar Test Issues
        const sIdx = SPRINTS.indexOf(String(s));
        const prevSprintData = sIdx > 0 ? cargaArr.find(c => String(c.sprint) === SPRINTS[sIdx - 1]) : null;
        
        const rows = d.personas.map(p => {
            // Calcular tendencia Test Issues vs sprint anterior
            let tiTrend = '';
            if (prevSprintData) {
                const prevP = prevSprintData.personas.find(pp => pp.nombre === p.nombre);
                const prevTI = prevP ? (prevP.testIssues || 0) : 0;
                const currTI = p.testIssues || 0;
                const diff = currTI - prevTI;
                if (diff > 0) {
                    tiTrend = ' <span style="color:#DC2626;font-size:10px;font-weight:700;" title="Aumentó +' + diff + ' vs S' + SPRINTS[sIdx - 1] + '">▲</span>';
                } else if (diff < 0) {
                    tiTrend = ' <span style="color:#10B981;font-size:10px;font-weight:700;" title="Disminuyó ' + diff + ' vs S' + SPRINTS[sIdx - 1] + '">▼</span>';
                } else if (currTI > 0) {
                    tiTrend = ' <span style="color:#9CA3AF;font-size:10px;font-weight:700;" title="Sin cambio vs S' + SPRINTS[sIdx - 1] + '">=</span>';
                }
            }
            
            return '<tr>'
            + '<td style="padding:8px 12px;font-size:12px;font-weight:700;color:#243F6B;white-space:nowrap;border-bottom:1px solid #F3F4F6;">' + p.nombre.split(' ').slice(0, 3).join(' ') + '</td>'
            + TD(p.capacidadComp, '#4B71A1')
            + TD(p.spEstimado, '#374151')
            + TD(p.spReal, '#374151')
            + TD((p.desviacion > 0 ? '+' : '') + p.desviacion, p.desviacion <= 0 ? '#10B981' : '#DC2626')
            + TD(p.total + '', '#374151')
            + TD(p.errores > 0 ? p.errores + '' : '—', p.errores > 0 ? '#F44336' : '#9CA3AF')
            + TD(p.tareas + '', '#374151')
            + TD(p.historias + '', '#374151')
            + '<td style="padding:8px 12px;font-size:12px;text-align:center;border-bottom:1px solid #F3F4F6;color:' + (p.testIssues > 0 ? '#D97706' : '#9CA3AF') + ';">' + (p.testIssues > 0 ? p.testIssues + tiTrend : '—') + '</td>'
            + '</tr>';
        }).join('');
        return '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-family:inherit;">'
            + '<thead><tr style="background:#F9FAFB;">'
            + TH('Miembro', null, 'left') + TH('CC','#4B71A1') + TH('SP Est.') + TH('SP Real') + TH('Desv.')
            + TH('Total') + TH('Bugs','#F44336') + TH('Tareas') + TH('Historias') + TH('Test Issues','#D97706')
            + '</tr></thead><tbody>' + rows + '</tbody></table></div>';
    }

    // Tabs carga
    const cargaTabs = SPRINTS.map((s, i) =>
        '<button onclick="window._evCargaTab(\'' + s + '\')" id="evol-carga-tab-' + s + '" '
        + 'style="padding:5px 14px;border-radius:4px;border:none;cursor:pointer;font-size:12px;font-weight:600;transition:all .2s;'
        + (i === SPRINTS.length - 1 ? 'background:#243F6B;color:#FFFFFF;' : 'background:#F3F4F6;color:#6B7280;') + '">'
        + 'S' + s + '</button>'
    ).join('');

    // ── KPI 01: Lead Time ──────────────────────────────────────────────────────
    const kpi01 = kpiSection('kpi01', icoClock,
        'KPI 01 · Lead Time por Sprint',
        'Días promedio desde creación hasta resolución · Sprints 32 → 37',
        '#243F6B',
        '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:14px;">'
        + '<div style="display:flex;align-items:baseline;gap:6px;">'
        + '<span style="font-size:36px;font-weight:700;color:#243F6B;line-height:1;">' + (ltLast?.avg?.toFixed(1) ?? '—') + '</span>'
        + '<span style="font-size:13px;color:#6B7280;">días · Sprint 37</span>'
        + '</div>'
        + '<div style="display:flex;align-items:center;gap:8px;">'
        + deltaBadge(ltLast?.avg, ltPrev?.avg, true)
        + statusBadge(ltLast?.avg, 10, 15, true)
        + '</div>'
        + '</div>'
        + '<div id="evol-ch-leadtime" style="width:100%;height:200px;"></div>'
    );

    // ── KPI 02: Cycle Time ────────────────────────────────────────────────────
    const kpi02 = kpiSection('kpi02', icoFlow,
        'KPI 02 · Cycle Time · Eficiencia de Flujo',
        'Días promedio de ciclo y % Flow Efficiency · Sprints 35 → 37 (requiere changelog)',
        '#4B71A1',
        '<div id="evol-ch-cycletime" style="width:100%;height:180px;"></div>'
    );

    // ── KPI 04: Rework ────────────────────────────────────────────────────────
    const kpi04 = kpiSection('kpi04', icoRW,
        'KPI 04 · Rework — Reprocesos por Sprint',
        'Tickets con retrocesos detectados (In Test → Test Issues) · Sprints 35 → 37',
        '#DC2626',
        '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:14px;">'
        + '<div style="display:flex;align-items:baseline;gap:6px;">'
        + '<span style="font-size:36px;font-weight:700;color:#DC2626;line-height:1;">' + (rwLast?.pct?.toFixed(1) ?? '—') + '</span>'
        + '<span style="font-size:13px;color:#6B7280;">% · ' + (rwLast?.con ?? 0) + ' de ' + (rwLast?.total ?? 0) + ' tickets · Sprint 37</span>'
        + '</div>'
        + '<div style="display:flex;align-items:center;gap:8px;">'
        + deltaBadge(rwLast?.pct, rwPrev?.pct, true)
        + '<span style="position:relative;display:inline-block;cursor:help;" onmouseenter="this.querySelector(\'.tooltip-umbrales\').style.display=\'block\'" onmouseleave="this.querySelector(\'.tooltip-umbrales\').style.display=\'none\'">'
        + statusBadge(rwLast?.pct, 5, 10, true)
        + '<div class="tooltip-umbrales" style="display:none;position:absolute;top:calc(100% + 8px);right:0;background:#1F2937;color:#fff;padding:10px 14px;border-radius:8px;font-size:11px;white-space:nowrap;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,.25);">'
        + '<div style="font-weight:700;margin-bottom:8px;color:#D1D5DB;">Umbrales DORA % Rework</div>'
        + '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;"><span style="width:10px;height:10px;background:#10B981;border-radius:50%;"></span> ≤ 5% Bueno</div>'
        + '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;"><span style="width:10px;height:10px;background:#F59E0B;border-radius:50%;"></span> 5% - 10% Atención</div>'
        + '<div style="display:flex;align-items:center;gap:6px;"><span style="width:10px;height:10px;background:#DC2626;border-radius:50%;"></span> > 10% Crítico</div>'
        + '<div style="position:absolute;top:-6px;right:16px;width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:6px solid #1F2937;"></div>'
        + '</div>'
        + '</span>'
        + '</div>'
        + '</div>'
        + '<div id="evol-ch-rework" style="width:100%;height:200px;"></div>'
    );

    // ── KPI 06: Bugs vs Func ──────────────────────────────────────────────────
    const kpi06 = kpiSection('kpi06', icoBug,
        'KPI 06 · Esfuerzo en Bugs vs Funcionalidad por Sprint',
        'Proporción de Story Points dedicados a corrección de errores · Sprints 32 → 37',
        '#DC2626',
        '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:14px;">'
        + '<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">'
        + '<div><span style="font-size:11px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:.4px;">% Esfuerzo Bugs S37</span><br>'
        + '<span style="font-size:36px;font-weight:700;color:' + ((errLast?.pctSpBugs || 0) <= 30 ? '#10B981' : (errLast?.pctSpBugs || 0) <= 50 ? '#D97706' : '#DC2626') + ';line-height:1.1;">' + (errLast?.pctSpBugs?.toFixed?.(1) ?? errLast?.pctSpBugs ?? '—') + '%</span>'
        + '</div>'
        + '<div style="width:1px;height:36px;background:#E5E7EB;"></div>'
        + '<div><span style="font-size:11px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:.4px;">SP Bugs / SP Total</span><br>'
        + '<span style="font-size:22px;font-weight:700;color:#374151;line-height:1.1;">' + (errLast?.spBugs ?? '—') + '<span style="font-size:13px;color:#9CA3AF;"> / ' + (errLast?.spTotal ?? '—') + ' SP</span></span>'
        + '</div>'
        + '</div>'
        + '<div style="display:flex;align-items:center;gap:8px;">'
        + deltaBadge(errLast?.pctSpBugs, errPrev?.pctSpBugs, true)
        + '<span style="position:relative;display:inline-block;cursor:help;" onmouseenter="this.querySelector(\'.tooltip-umbrales\').style.display=\'block\'" onmouseleave="this.querySelector(\'.tooltip-umbrales\').style.display=\'none\'">'
        + statusBadge(errLast?.pctSpBugs, 30, 50, true)
        + '<div class="tooltip-umbrales" style="display:none;position:absolute;bottom:calc(100% + 8px);right:0;background:#1F2937;color:#fff;padding:10px 14px;border-radius:8px;font-size:11px;white-space:nowrap;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,.25);">'
        + '<div style="font-weight:700;margin-bottom:8px;color:#D1D5DB;">Umbrales % Esfuerzo Bugs</div>'
        + '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;"><span style="width:10px;height:10px;background:#10B981;border-radius:50%;"></span> ≤ 30% Bueno</div>'
        + '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;"><span style="width:10px;height:10px;background:#F59E0B;border-radius:50%;"></span> 30% - 50% Atención</div>'
        + '<div style="display:flex;align-items:center;gap:6px;"><span style="width:10px;height:10px;background:#DC2626;border-radius:50%;"></span> > 50% Crítico</div>'
        + '<div style="position:absolute;bottom:-6px;right:16px;width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:6px solid #1F2937;"></div>'
        + '</div>'
        + '</span>'
        + '</div>'
        + '</div>'
        + '<div id="evol-ch-errores" style="width:100%;height:200px;"></div>'
    );

    // ── KPI 07: Carga por Miembro ─────────────────────────────────────────────
    const kpi07 = '<div style="background:#FFFFFF;border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;margin-bottom:20px;box-shadow:0 1px 3px rgba(0,0,0,.08);">'
        + '<div style="background:linear-gradient(to right,#F3F4F6,#E5E7EB);padding:12px 16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;border-left:4px solid #4B71A1;">'
        + '<div style="display:flex;align-items:center;gap:12px;">'
        + icoTeam
        + '<div>'
        + '<div style="font-size:15px;font-weight:600;color:#1F2937;">KPI 07 · Carga y Calidad por Miembro del Equipo</div>'
        + '<div style="font-size:12px;color:#6B7280;margin-top:1px;">CC · SP Estimado · SP Real · Desviación · Bugs · Test Issues por persona · por sprint</div>'
        + '</div></div>'
        + '<div style="display:flex;gap:6px;flex-wrap:wrap;">' + cargaTabs + '</div>'
        + '</div>'
        + '<div id="evol-carga-body" style="padding:16px;">' + renderCargaTable(SPRINTS[SPRINTS.length - 1]) + '</div>'
        + '</div>';

    // ── NOTA ──────────────────────────────────────────────────────────────────
    const nota = '<div style="padding:12px 16px;background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;font-size:11px;color:#6B7280;line-height:1.8;">'
        + '<strong style="color:#374151;">Notas metodológicas:</strong> '
        + 'Cycle Time, SLE y Rework requieren changelog (disponible desde S35). '
        + 'Lead Time = días entre creación y resolución (tickets Finalizados). '
        + 'CC = Capacidad Comprometida incluyendo tickets Arrastrados. '
        + 'Flow Efficiency = tiempo productivo / tiempo total de ciclo. '
        + 'Críticos = prioridad "Highest" en Jira.'
        + '</div>';

    container.innerHTML = kpi01 + kpi02 + kpi04 + kpi06 + kpi07 + nota;

    // Tab handler carga
    window._evCargaTab = function(s) {
        SPRINTS.forEach(sp => {
            const btn = document.getElementById('evol-carga-tab-' + sp);
            if (btn) {
                btn.style.background = sp === s ? '#243F6B' : '#F3F4F6';
                btn.style.color      = sp === s ? '#FFFFFF' : '#6B7280';
            }
        });
        const body = document.getElementById('evol-carga-body');
        if (body) body.innerHTML = '<div style="padding:0 0 4px;">' + renderCargaTable(s) + '</div>';
    };

    requestAnimationFrame(() => {
        _initEvolLineChart('evol-ch-leadtime',   LABELS,    leadArr.map(d => d.avg),    '#243F6B', 'días', true,  10, 15);
        _initCycleTimeEvolChart('evol-ch-cycletime', LABELS_CL, cycleArr);
        _initReworkEvolChart('evol-ch-rework', LABELS_CL, reworkArr);
        _initBugsEvolChart('evol-ch-errores',   LABELS,   erroresArr);
    });
}

// ─── Chart helpers — tema consistente con el módulo ───────────────────────────

/**
 * Rework Chart con tooltip detallado (DORA thresholds: 5% / 10%)
 */
function _initReworkEvolChart(id, labels, data) {
    const el = document.getElementById(id);
    if (!el || typeof echarts === 'undefined') return;
    if (_evolChartInstances[id]) { try { _evolChartInstances[id].dispose(); } catch(e) {} }

    const chart = echarts.init(el, null, { renderer: 'canvas' });
    _evolChartInstances[id] = chart;

    const color = '#DC2626';
    const values = data.map(d => d.pct);
    const valid = values.filter(v => v !== null && v !== undefined);
    const minV  = valid.length ? Math.min(...valid) : 0;
    const maxV  = valid.length ? Math.max(...valid) : 1;
    const pad   = Math.max((maxV - minV) * 0.3, 2);

    chart.setOption({
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis',
            appendToBody: true,
            confine: false,
            backgroundColor: '#FFFFFF',
            borderColor: '#E5E7EB',
            borderWidth: 1,
            padding: [12, 16],
            extraCssText: 'box-shadow:0 4px 12px rgba(0,0,0,.12);border-radius:8px;z-index:9999;',
            formatter: params => {
                const p = params[0];
                const idx = p.dataIndex;
                const d = data[idx];
                const statusCol = d.pct <= 5 ? '#059669' : d.pct <= 10 ? '#D97706' : '#DC2626';
                const statusBg  = d.pct <= 5 ? '#D1FAE5' : d.pct <= 10 ? '#FEF3C7' : '#FEE2E2';
                const statusLbl = d.pct <= 5 ? '✓ Bueno' : d.pct <= 10 ? '⚠ Atención' : '✗ Crítico';
                
                return '<div style="min-width:180px;">'
                    + '<div style="font-size:12px;color:#6B7280;font-weight:600;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid #E5E7EB;">' + p.name + '</div>'
                    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">'
                    + '<span style="font-size:28px;font-weight:700;color:' + color + ';">' + d.pct.toFixed(1) + '%</span>'
                    + '<span style="font-size:10px;font-weight:600;padding:4px 10px;border-radius:10px;background:' + statusBg + ';color:' + statusCol + ';">' + statusLbl + '</span>'
                    + '</div>'
                    + '<div style="display:flex;gap:16px;">'
                    + '<div style="flex:1;text-align:center;padding:8px;background:#FEF2F2;border-radius:6px;">'
                    + '<div style="font-size:9px;color:#991B1B;font-weight:600;text-transform:uppercase;letter-spacing:.4px;">Reprocesados</div>'
                    + '<div style="font-size:18px;font-weight:700;color:#DC2626;">' + d.con + '</div>'
                    + '</div>'
                    + '<div style="flex:1;text-align:center;padding:8px;background:#F3F4F6;border-radius:6px;">'
                    + '<div style="font-size:9px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:.4px;">Analizados</div>'
                    + '<div style="font-size:18px;font-weight:700;color:#374151;">' + d.total + '</div>'
                    + '</div>'
                    + '</div>'
                    + '</div>';
            }
        },
        grid: { left: 8, right: 80, top: 28, bottom: 24, containLabel: true },
        xAxis: {
            type: 'category', data: labels, boundaryGap: false,
            axisLine: { lineStyle: { color: '#E5E7EB' } },
            axisTick: { show: false },
            axisLabel: { fontSize: 11, fontWeight: 600, color: '#6B7280' }
        },
        yAxis: {
            type: 'value',
            name: '%',
            nameTextStyle: { color: '#9CA3AF', fontSize: 11, fontWeight: 600, padding: [0, 28, 0, 0] },
            min: 0, max: Math.max(maxV + pad, 12),
            splitLine: { lineStyle: { color: '#F3F4F6', type: 'dashed' } },
            axisLine: { show: false }, axisTick: { show: false },
            axisLabel: { fontSize: 10, color: '#9CA3AF', formatter: '{value}' }
        },
        series: [{
            type: 'line',
            data: values,
            smooth: 0.3, symbol: 'circle', symbolSize: 8,
            lineStyle: { color, width: 2.5 },
            itemStyle: { color, borderColor: '#FFFFFF', borderWidth: 2.5 },
            label: { show: false },
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: color + '50' },
                    { offset: 1, color: color + '08' }
                ])
            },
            markLine: {
                silent: true, symbol: ['none', 'none'],
                animation: false,
                data: [
                    {
                        yAxis: 5,
                        lineStyle: { color: '#10B981', type: 'dashed', width: 1.5, opacity: 0.85 },
                        label: {
                            formatter: '✓ Objetivo  5%',
                            fontSize: 10, fontWeight: 700, color: '#059669',
                            position: 'insideEndTop',
                            backgroundColor: '#F0FDF4', padding: [3, 6],
                            borderRadius: 3
                        }
                    },
                    {
                        yAxis: 10,
                        lineStyle: { color: '#D97706', type: 'dashed', width: 1.5, opacity: 0.85 },
                        label: {
                            formatter: '⚠ Límite  10%',
                            fontSize: 10, fontWeight: 700, color: '#D97706',
                            position: 'insideEndTop',
                            backgroundColor: '#FFFBEB', padding: [3, 6],
                            borderRadius: 3
                        }
                    }
                ]
            }
        }]
    });
    window.addEventListener('resize', () => { try { chart.resize(); } catch(e) {} });
}

/**
 * Línea + área — colores del módulo existente
 * Lead Time (navy)
 */
function _initEvolLineChart(id, labels, data, color, unit, lowerIsBetter, goodThresh, warnThresh) {
    const el = document.getElementById(id);
    if (!el || typeof echarts === 'undefined') return;
    if (_evolChartInstances[id]) { try { _evolChartInstances[id].dispose(); } catch(e) {} }

    const chart = echarts.init(el, null, { renderer: 'canvas' });
    _evolChartInstances[id] = chart;

    const valid = data.filter(v => v !== null && v !== undefined);
    const minV  = valid.length ? Math.min(...valid) : 0;
    const maxV  = valid.length ? Math.max(...valid) : 1;
    const pad   = Math.max((maxV - minV) * 0.3, 1);

    chart.setOption({
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis',
            backgroundColor: '#FFFFFF',
            borderColor: '#E5E7EB',
            borderWidth: 1,
            padding: [10, 14],
            textStyle: { color: '#1F2937', fontSize: 13, fontWeight: 600 },
            extraCssText: 'box-shadow:0 4px 12px rgba(0,0,0,.12);',
            formatter: params => {
                const p = params[0];
                return '<div style="font-size:11px;color:#6B7280;margin-bottom:4px;font-weight:600;">' + p.name + '</div>'
                    + '<div style="display:flex;align-items:baseline;gap:4px;">'
                    + '<span style="font-size:20px;font-weight:700;color:' + color + ';">'
                    + (p.value !== null && p.value !== undefined ? p.value : '—')
                    + '</span>'
                    + '<span style="font-size:12px;color:#9CA3AF;">' + unit + '</span>'
                    + '</div>';
            }
        },
        grid: { left: 8, right: 80, top: 28, bottom: 24, containLabel: true },
        xAxis: {
            type: 'category', data: labels, boundaryGap: false,
            axisLine: { lineStyle: { color: '#E5E7EB' } },
            axisTick: { show: false },
            axisLabel: { fontSize: 11, fontWeight: 600, color: '#6B7280' }
        },
        yAxis: {
            type: 'value',
            name: unit,
            nameTextStyle: { color: '#9CA3AF', fontSize: 11, fontWeight: 600, padding: [0, 28, 0, 0] },
            min: Math.max(0, minV - pad), max: maxV + pad,
            splitLine: { lineStyle: { color: '#F3F4F6', type: 'dashed' } },
            axisLine: { show: false }, axisTick: { show: false },
            axisLabel: { fontSize: 10, color: '#9CA3AF', formatter: '{value}' }
        },
        series: [{
            type: 'line',
            data: data.map(v => (v !== null && v !== undefined) ? v : null),
            smooth: 0.3, symbol: 'circle', symbolSize: 8,
            lineStyle: { color, width: 2.5 },
            itemStyle: { color, borderColor: '#FFFFFF', borderWidth: 2.5 },
            label: { show: false },
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: color + '50' },
                    { offset: 1, color: color + '08' }
                ])
            },
            connectNulls: false,
            markLine: {
                silent: true, symbol: ['none', 'none'],
                animation: false,
                data: [
                    {
                        yAxis: goodThresh,
                        lineStyle: { color: '#10B981', type: 'dashed', width: 1.5, opacity: 0.85 },
                        label: {
                            formatter: '✓ Objetivo  ' + goodThresh + unit,
                            fontSize: 10, fontWeight: 700, color: '#059669',
                            position: 'insideEndTop',
                            backgroundColor: '#F0FDF4', padding: [3, 6],
                            borderRadius: 3
                        }
                    },
                    {
                        yAxis: warnThresh,
                        lineStyle: { color: '#D97706', type: 'dashed', width: 1.5, opacity: 0.85 },
                        label: {
                            formatter: '⚠ Límite  ' + warnThresh + unit,
                            fontSize: 10, fontWeight: 700, color: '#D97706',
                            position: 'insideEndTop',
                            backgroundColor: '#FFFBEB', padding: [3, 6],
                            borderRadius: 3
                        }
                    }
                ]
            }
        }]
    });
    window.addEventListener('resize', () => { try { chart.resize(); } catch(e) {} });
}

/**
 * Cycle Time — barras simples con etiqueta de Flow Efficiency
 * Sin eje dual (demasiado confuso), sin superposición
 */
function _initCycleTimeEvolChart(id, labels, data) {
    const dom = document.getElementById(id);
    if (!dom || typeof echarts === 'undefined') return;
    if (_evolChartInstances[id]) { try { _evolChartInstances[id].dispose(); } catch(e) {} }

    const chart = echarts.init(dom, null, { renderer: 'canvas' });
    _evolChartInstances[id] = chart;

    // Helper: format time
    const fmt = v => (v != null && v > 0) ? (v < 0.5 ? Math.round(v * 24) + 'h' : v.toFixed(1) + 'd') : '—';

    // Stages definition (left to right in stack)
    const STAGES = [
        { key: 'inProcess',  name: 'In Process',  color: '#243F6B' },
        { key: 'codeReview', name: 'Code Review', color: '#4B71A1' },
        { key: 'inTest',     name: 'In Test',     color: '#64748B' },
        { key: 'inTestDev',  name: 'Test Dev',    color: '#F97316' },
        { key: 'blocked',    name: 'Blocked',     color: '#EF4444' },
        { key: 'testIssue',  name: 'Test Issue',  color: '#F59E0B' }
    ];

    // Build series for each stage (horizontal bars)
    const series = STAGES.map((st, idx) => ({
        name: st.name,
        type: 'bar',
        stack: 'cycle',
        barWidth: 28,
        itemStyle: { 
            color: st.color,
            borderRadius: idx === STAGES.length - 1 ? [0, 4, 4, 0] : 0
        },
        emphasis: { itemStyle: { opacity: 0.85 } },
        data: data.map(d => d.stages[st.key] || 0)
    }));

    // Add invisible series for right-side labels (Ciclo + Flow Eff + badge)
    series.push({
        name: '_label',
        type: 'bar',
        stack: 'cycle',
        barWidth: 28,
        itemStyle: { color: 'transparent' },
        label: {
            show: true,
            position: 'right',
            distance: 12,
            formatter: (p) => {
                const d = data[p.dataIndex];
                const effCol = d.flowEff >= 60 ? '#059669' : d.flowEff >= 40 ? '#D97706' : '#DC2626';
                const badge = d.flowEff >= 60 ? '●' : d.flowEff >= 40 ? '○' : '○';
                return '{total|' + d.avg.toFixed(1) + 'd}  {eff|' + d.flowEff + '%} {badge|' + badge + '}';
            },
            rich: {
                total: { fontSize: 14, fontWeight: 700, color: '#1F2937' },
                eff: { fontSize: 13, fontWeight: 600, color: '#6B7280' },
                badge: { fontSize: 10, color: '#059669' }
            }
        },
        data: data.map(() => 0)
    });

    chart.setOption({
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            appendToBody: true,
            confine: false,
            backgroundColor: '#FFFFFF',
            borderColor: '#E5E7EB',
            borderWidth: 1,
            padding: [12, 16],
            extraCssText: 'box-shadow:0 4px 12px rgba(0,0,0,0.1);border-radius:8px;z-index:9999;',
            textStyle: { color: '#374151', fontSize: 12 },
            formatter: params => {
                const idx = params[0].dataIndex;
                const d = data[idx];
                const effCol = d.flowEff >= 60 ? '#059669' : d.flowEff >= 40 ? '#D97706' : '#DC2626';
                let h = '<div style="font-weight:700;font-size:13px;color:#1F2937;margin-bottom:8px;">' + labels[idx] + '</div>';
                h += '<div style="display:flex;gap:16px;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid #E5E7EB;">';
                h += '<div><span style="font-size:10px;color:#6B7280;">Ciclo</span><br><strong style="font-size:16px;color:#243F6B;">' + d.avg.toFixed(1) + 'd</strong></div>';
                h += '<div><span style="font-size:10px;color:#6B7280;">Flow Eff.</span><br><strong style="font-size:16px;color:' + effCol + ';">' + d.flowEff + '%</strong></div>';
                h += '<div><span style="font-size:10px;color:#6B7280;">Tickets</span><br><strong style="font-size:16px;color:#374151;">' + d.total + '</strong></div>';
                h += '</div>';
                params.filter(p => p.seriesName !== '_label' && p.value > 0).forEach(p => {
                    const pct = d.avg > 0 ? Math.round((p.value / d.avg) * 100) : 0;
                    h += '<div style="display:flex;align-items:center;gap:6px;margin:4px 0;">';
                    h += '<span style="width:10px;height:10px;border-radius:2px;background:' + p.color + ';"></span>';
                    h += '<span style="flex:1;">' + p.seriesName + '</span>';
                    h += '<strong>' + fmt(p.value) + '</strong>';
                    h += '<span style="color:#9CA3AF;font-size:11px;">' + pct + '%</span>';
                    h += '</div>';
                });
                return h;
            }
        },
        legend: {
            bottom: 0,
            textStyle: { color: '#6B7280', fontSize: 11, fontWeight: 500 },
            icon: 'roundRect',
            itemWidth: 12,
            itemHeight: 8,
            itemGap: 16,
            data: STAGES.map(s => s.name)
        },
        grid: { left: 50, right: 120, top: 16, bottom: 50, containLabel: false },
        yAxis: {
            type: 'category',
            data: labels,
            inverse: true,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { fontSize: 13, fontWeight: 700, color: '#243F6B' }
        },
        xAxis: {
            type: 'value',
            name: 'días',
            nameLocation: 'end',
            nameTextStyle: { color: '#9CA3AF', fontSize: 10 },
            splitLine: { lineStyle: { color: '#F3F4F6', type: 'dashed' } },
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { fontSize: 10, color: '#9CA3AF', formatter: '{value}' }
        },
        series
    });

    window.addEventListener('resize', () => { try { chart.resize(); } catch(e) {} });
}

/**
 * SLE — 3 líneas P50 / P90 / P95
 * Etiquetas solo en los puntos (sin superposición)
 */
function _initSLEEvolChart(id, labels, data) {
    const dom = document.getElementById(id);
    if (!dom || typeof echarts === 'undefined') return;
    if (_evolChartInstances[id]) { try { _evolChartInstances[id].dispose(); } catch(e) {} }

    const chart = echarts.init(dom, null, { renderer: 'canvas' });
    _evolChartInstances[id] = chart;

    function mkSerie(name, key, color, dashed) {
        return {
            name, type: 'line', symbol: 'circle', symbolSize: 8,
            lineStyle: { width: 2.5, color, type: dashed ? 'dashed' : 'solid' },
            itemStyle: { color, borderColor: '#FFFFFF', borderWidth: 2 },
            label: { show: false },
            connectNulls: false,
            data: data.map(d => d[key] != null ? +d[key].toFixed(1) : null)
        };
    }

    chart.setOption({
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis', backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderWidth: 1, padding: [10, 14],
            extraCssText: 'box-shadow:0 4px 12px rgba(0,0,0,0.08);border-radius:8px;',
            textStyle: { color: '#374151', fontSize: 12 },
            formatter: params => {
                let h = '<div style="font-size:11px;color:#6B7280;margin-bottom:6px;font-weight:700;">' + params[0].axisValue + '</div>';
                params.forEach(p => { h += '<div style="margin:3px 0;color:#374151;">' + p.marker + ' ' + p.seriesName + ': <strong>' + (p.value != null ? p.value + 'd' : '—') + '</strong></div>'; });
                return h;
            }
        },
        legend: {
            bottom: 4, textStyle: { color: '#6B7280', fontSize: 11, fontWeight: 500 },
            icon: 'circle', itemWidth: 8, itemHeight: 8
        },
        grid: { left: 8, right: 16, top: 28, bottom: 40, containLabel: true },
        xAxis: {
            type: 'category', data: labels,
            axisLine: { lineStyle: { color: '#E5E7EB' } }, axisTick: { show: false },
            axisLabel: { fontSize: 12, fontWeight: 600, color: '#374151' }
        },
        yAxis: {
            type: 'value',
            splitLine: { lineStyle: { color: '#F3F4F6', type: 'dashed' } },
            axisLine: { show: false }, axisTick: { show: false },
            axisLabel: { fontSize: 10, color: '#9CA3AF', formatter: '{value}d' }
        },
        series: [
            mkSerie('P50 — Mediana', 'p50', '#10B981', false),
            mkSerie('P90 — SLA',     'p90', '#D97706', false),
            mkSerie('P95 — Outlier', 'p95', '#DC2626', true)
        ]
    });
    window.addEventListener('resize', () => { try { chart.resize(); } catch(e) {} });
}

/**
 * Tickets Críticos — barras agrupadas limpias
 */
function _initCriticosEvolChart(id, labels, data) {
    const dom = document.getElementById(id);
    if (!dom || typeof echarts === 'undefined') return;
    if (_evolChartInstances[id]) { try { _evolChartInstances[id].dispose(); } catch(e) {} }

    const chart = echarts.init(dom, null, { renderer: 'canvas' });
    _evolChartInstances[id] = chart;

    chart.setOption({
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis', axisPointer: { type: 'shadow' },
            backgroundColor: '#1F2937', borderWidth: 0, padding: [10, 14],
            textStyle: { color: '#F9FAFB', fontSize: 12 }
        },
        legend: {
            bottom: 4, textStyle: { color: '#6B7280', fontSize: 11, fontWeight: 500 },
            icon: 'circle', itemWidth: 8, itemHeight: 8
        },
        grid: { left: 8, right: 16, top: 16, bottom: 40, containLabel: true },
        xAxis: {
            type: 'category', data: labels,
            axisLine: { lineStyle: { color: '#E5E7EB' } }, axisTick: { show: false },
            axisLabel: { fontSize: 11, fontWeight: 600, color: '#374151' }
        },
        yAxis: {
            type: 'value', minInterval: 1,
            splitLine: { lineStyle: { color: '#F3F4F6', type: 'dashed' } },
            axisLine: { show: false }, axisTick: { show: false },
            axisLabel: { fontSize: 10, color: '#9CA3AF' }
        },
        series: [
            {
                name: 'Total', type: 'bar', barMaxWidth: 28, barGap: '10%',
                itemStyle: { color: '#4B71A1', borderRadius: [3, 3, 0, 0] },
                label: { show: true, position: 'top', fontSize: 10, fontWeight: 700, color: '#374151' },
                data: data.map(d => d.total)
            },
            {
                name: 'Cerrados', type: 'bar', barMaxWidth: 28,
                itemStyle: { color: '#4CAF50', borderRadius: [3, 3, 0, 0] },
                label: { show: true, position: 'top', fontSize: 10, fontWeight: 700, color: '#374151' },
                data: data.map(d => d.cerrados)
            },
            {
                name: 'Abiertos', type: 'bar', barMaxWidth: 28,
                itemStyle: { color: '#F44336', borderRadius: [3, 3, 0, 0] },
                label: { show: true, position: 'top', fontSize: 10, fontWeight: 700, color: '#374151' },
                data: data.map(d => d.abiertos)
            }
        ]
    });
    window.addEventListener('resize', () => { try { chart.resize(); } catch(e) {} });
}

/**
 * Bugs vs Funcionalidad — barras apiladas con % como etiqueta de la barra total
 * Mismo esquema de colores que el módulo existente: rojo/#F44336 bugs, verde/#4CAF50 func
 */
function _initBugsEvolChart(id, labels, data) {
    const dom = document.getElementById(id);
    if (!dom || typeof echarts === 'undefined') return;
    if (_evolChartInstances[id]) { try { _evolChartInstances[id].dispose(); } catch(e) {} }

    const chart = echarts.init(dom, null, { renderer: 'canvas' });
    _evolChartInstances[id] = chart;

    chart.setOption({
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis', axisPointer: { type: 'shadow' },
            appendToBody: true,
            confine: false,
            backgroundColor: '#FFFFFF',
            borderColor: '#E5E7EB',
            borderWidth: 1,
            padding: [12, 16],
            extraCssText: 'box-shadow:0 4px 12px rgba(0,0,0,.12);border-radius:8px;z-index:9999;',
            formatter: params => {
                const idx = labels.indexOf(params[0].axisValue);
                const d = data[idx >= 0 ? idx : 0];
                if (!d) return '';
                const statusCol = d.pctSpBugs <= 30 ? '#059669' : d.pctSpBugs <= 50 ? '#D97706' : '#DC2626';
                const statusBg  = d.pctSpBugs <= 30 ? '#D1FAE5' : d.pctSpBugs <= 50 ? '#FEF3C7' : '#FEE2E2';
                const statusLbl = d.pctSpBugs <= 30 ? '✓ Bueno' : d.pctSpBugs <= 50 ? '⚠ Atención' : '✗ Alto';
                
                return '<div style="min-width:220px;">'
                    + '<div style="font-size:12px;color:#6B7280;font-weight:600;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid #E5E7EB;">Sprint ' + d.sprint + '</div>'
                    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">'
                    + '<span style="font-size:28px;font-weight:700;color:#DC2626;">' + d.pctSpBugs.toFixed(1) + '%</span>'
                    + '<span style="font-size:10px;font-weight:600;padding:4px 10px;border-radius:10px;background:' + statusBg + ';color:' + statusCol + ';">' + statusLbl + '</span>'
                    + '</div>'
                    + '<div style="font-size:10px;color:#6B7280;font-weight:600;text-transform:uppercase;margin-bottom:6px;">Distribución SP</div>'
                    + '<div style="display:flex;gap:8px;margin-bottom:10px;">'
                    + '<div style="flex:1;text-align:center;padding:6px;background:#FEF2F2;border-radius:6px;">'
                    + '<div style="font-size:14px;font-weight:700;color:#DC2626;">' + d.spBugs + '</div>'
                    + '<div style="font-size:9px;color:#991B1B;">Bugs</div>'
                    + '</div>'
                    + '<div style="flex:1;text-align:center;padding:6px;background:#F0FDF4;border-radius:6px;">'
                    + '<div style="font-size:14px;font-weight:700;color:#10B981;">' + d.spFunc + '</div>'
                    + '<div style="font-size:9px;color:#065F46;">Func.</div>'
                    + '</div>'
                    + (d.spOtros > 0 ? '<div style="flex:1;text-align:center;padding:6px;background:#F3F4F6;border-radius:6px;">'
                    + '<div style="font-size:14px;font-weight:700;color:#6B7280;">' + d.spOtros + '</div>'
                    + '<div style="font-size:9px;color:#6B7280;">Otros</div>'
                    + '</div>' : '')
                    + '</div>'
                    + '<div style="padding-top:8px;border-top:1px solid #E5E7EB;font-size:10px;color:#6B7280;">'
                    + '<div style="display:flex;justify-content:space-between;margin-bottom:2px;">'
                    + '<span><span style="color:#DC2626;font-weight:600;">●</span> ' + d.bugs + ' bugs</span>'
                    + '<span><span style="color:#10B981;font-weight:600;">●</span> ' + d.func + ' funcionalidad</span>'
                    + (d.otros > 0 ? '<span><span style="color:#6B7280;font-weight:600;">●</span> ' + d.otros + ' otros</span>' : '')
                    + '</div>'
                    + '<div style="text-align:right;margin-top:4px;font-weight:600;">Total: ' + d.total + ' tickets · ' + d.spTotal + ' SP</div>'
                    + '</div>'
                    + '</div>';
            }
        },
        legend: {
            bottom: 4, textStyle: { color: '#6B7280', fontSize: 11, fontWeight: 500 },
            icon: 'circle', itemWidth: 8, itemHeight: 8,
            data: ['Bugs', 'Funcionalidad']
        },
        grid: { left: 8, right: 16, top: 24, bottom: 40, containLabel: true },
        xAxis: {
            type: 'category', data: labels,
            axisLine: { lineStyle: { color: '#E5E7EB' } }, axisTick: { show: false },
            axisLabel: { fontSize: 11, fontWeight: 600, color: '#374151' }
        },
        yAxis: {
            type: 'value', max: 100,
            splitLine: { lineStyle: { color: '#F3F4F6', type: 'dashed' } },
            axisLine: { show: false }, axisTick: { show: false },
            axisLabel: { fontSize: 10, color: '#9CA3AF', formatter: '{value}%' }
        },
        series: [
            {
                name: 'Bugs', type: 'bar', stack: 'total', barMaxWidth: 80,
                itemStyle: { color: '#DC2626' },
                data: data.map(d => d.pctSpBugs),
                markLine: {
                    silent: true,
                    symbol: 'none',
                    lineStyle: { type: 'dashed', width: 1.5 },
                    label: { show: true, position: 'insideEndTop', fontSize: 10, fontWeight: 600 },
                    data: [
                        { yAxis: 30, lineStyle: { color: '#10B981' }, label: { formatter: '✓ 30%', color: '#10B981' } },
                        { yAxis: 50, lineStyle: { color: '#F59E0B' }, label: { formatter: '⚠ 50%', color: '#F59E0B' } }
                    ]
                }
            },
            {
                name: 'Funcionalidad', type: 'bar', stack: 'total',
                itemStyle: { color: '#10B981', borderRadius: [3, 3, 0, 0] },
                label: {
                    show: true, position: 'top', fontWeight: 700, fontSize: 11, color: '#374151',
                    formatter: p => {
                        const d = data[p.dataIndex];
                        return d ? d.pctSpBugs.toFixed(1) + '% bugs' : '';
                    },
                    distance: 5
                },
                data: data.map(d => d.pctSpFunc)
            }
        ]
    });
    window.addEventListener('resize', () => { try { chart.resize(); } catch(e) {} });
}

// _initEvolAreaChart — compatibilidad con código existente
function _initEvolAreaChart(id, labels, data, color, unit, lowerIsBetter, goodThresh, warnThresh) {
    _initEvolLineChart(id, labels, data, color, unit, lowerIsBetter, goodThresh, warnThresh);
}

/**
 * Sparkline compacto — sin ejes
 */
function _initEvolSparkline(id, labels, data, color, unit) {
    const el = document.getElementById(id);
    if (!el || typeof echarts === 'undefined') return;
    if (_evolChartInstances[id]) { try { _evolChartInstances[id].dispose(); } catch(e) {} }

    const chart = echarts.init(el, null, { renderer: 'canvas' });
    _evolChartInstances[id] = chart;

    chart.setOption({
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis', backgroundColor: '#1F2937', borderWidth: 0, padding: [8, 12],
            textStyle: { color: '#F9FAFB', fontSize: 12, fontWeight: 600 },
            formatter: params => params[0].name + ': <b>' + (params[0].value !== null ? params[0].value + unit : '—') + '</b>'
        },
        grid: { left: 0, right: 0, top: 4, bottom: 0 },
        xAxis: { type: 'category', data: labels, show: false, boundaryGap: false },
        yAxis: { type: 'value', show: false },
        series: [{
            type: 'line', data: data.map(v => v !== null ? v : null),
            smooth: 0.4, symbol: 'circle', symbolSize: 5,
            lineStyle: { color, width: 2 },
            itemStyle: { color, borderColor: '#FFFFFF', borderWidth: 1.5 },
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: color + '60' }, { offset: 1, color: color + '05' }
                ])
            },
            connectNulls: false
        }]
    });
    window.addEventListener('resize', () => { try { chart.resize(); } catch(e) {} });
}

window.calcularKPIsAvanzados = calcularKPIsAvanzados;
window.renderKPIsAvanzados = renderKPIsAvanzados;
window.renderEvolucionKPIsAvanzados = renderEvolucionKPIsAvanzados;
window.actualizarKPIsAvanzados = actualizarKPIsAvanzados;
window.toggleSection = toggleSection;
window.mostrarTicketsRango = mostrarTicketsRango;
window.cerrarModalTickets = cerrarModalTickets;
window.mostrarDetalleTicket = mostrarDetalleTicket;
window.cerrarDetalleTicket = cerrarDetalleTicket;
window.mostrarTicketsPorTipo = mostrarTicketsPorTipo;
window.cerrarModalTicketsTipo = cerrarModalTicketsTipo;

console.log('[KPIs Avanzados] Módulo cargado correctamente');
