/**
 * Validador de Tickets Críticos
 * Verifica los cálculos de tiempo por estado en la tabla de tickets críticos
 * 
 * Uso: node validate_tickets_criticos.js
 */

// Cargar datos del changelog
const changelogDataContent = require('fs').readFileSync('./dashboard_changelog_data.js', 'utf8');

// Extraer el objeto changelogData del contenido
const changelogMatch = changelogDataContent.match(/const changelogData = ({[\s\S]*});/);
let changelogData = {};
if (changelogMatch) {
    try {
        // Usar Function constructor para evaluar el objeto
        const extractedObj = eval('(' + changelogMatch[1] + ')');
        changelogData = extractedObj;
    } catch (e) {
        console.error('Error al parsear changelog:', e.message);
        process.exit(1);
    }
}

// Función para normalizar estados (copia de dashboard_kpis_avanzados.js)
function normalizarEstado(estado) {
    const estadoLower = (estado || '').toLowerCase().trim();
    const mappings = {
        'to do': 'To do',
        'tareas por hacer': 'To do',
        'backlog': 'Backlog',
        'in progress': 'In Process',
        'in process': 'In Process',
        'en curso': 'In Process',
        'blocked': 'Blocked',
        'bloqueado': 'Blocked',
        'code review': 'CODE REVIEW',
        'in test dev': 'IN TEST DEV',
        'test in dev': 'IN TEST DEV',
        'in test': 'In Test',
        'test issues': 'Test Issues',
        'done': 'Finalizados',
        'finalizados': 'Finalizados',
    };
    return mappings[estadoLower] || estado;
}

// Estados de tracking
const ESTADOS_TRACKING = [
    'To do',
    'In Process',
    'Blocked',
    'CODE REVIEW',
    'IN TEST DEV',
    'In Test',
    'Test Issues'
];

// Función para calcular días por estado (VERSIÓN CORRECTA)
function calcularDiasPorEstadoCorrect(issueKey) {
    if (!changelogData[issueKey]) {
        return {};
    }
    
    const historial = changelogData[issueKey];
    const diasPorEstado = {};
    
    // Inicializar contadores
    ESTADOS_TRACKING.forEach(estado => {
        diasPorEstado[estado] = 0;
    });
    
    // Sumar días de cada transición
    historial.forEach(transition => {
        const estadoNorm = normalizarEstado(transition.estado);
        if (!ESTADOS_TRACKING.includes(estadoNorm)) return;
        
        let dias = transition.dias || 0;
        diasPorEstado[estadoNorm] += dias;
        
        console.log(`  [${issueKey}] ${estadoNorm}: +${dias} días (total: ${diasPorEstado[estadoNorm]})`);
    });
    
    return diasPorEstado;
}

// Formato para mostrar tiempo
function formatTime(dias) {
    if (dias <= 0) return '-';
    const HORAS_DIA = 8;
    if (dias >= 1) {
        const diasEnteros = Math.floor(dias);
        const horasRest = Math.round((dias - diasEnteros) * HORAS_DIA);
        if (horasRest <= 0) return `${diasEnteros}d`;
        return `${diasEnteros}d ${horasRest}h`;
    }
    const horas = Math.round(dias * HORAS_DIA);
    return horas <= 0 ? '<1h' : `${horas}h`;
}

// Tickets críticos (en base a lo visto en la imagen)
const TICKETS_CRITICOS = [
    'IMS-984',
    'IMS-777',
    'IMS-999',
    'IMS-1071',
    'IMS-1078',
    'IMS-1090',
    'IMS-1116',
    'IMS-997',
    'IMS-1174',
    'IMS-1164',
    'IMS-1146',
    'IMS-1148'
];

console.log('\n╔════════════════════════════════════════════════════════════════════╗');
console.log('║           VALIDACIÓN DE CÁLCULOS DE TICKETS CRÍTICOS              ║');
console.log('╚════════════════════════════════════════════════════════════════════╝\n');

TICKETS_CRITICOS.forEach(ticketKey => {
    const changelogEntry = changelogData[ticketKey];
    if (!changelogEntry) {
        console.log(`❌ ${ticketKey}: NO HAY CHANGELOG`);
        return;
    }
    
    console.log(`\n📋 ${ticketKey}:`);
    console.log('─'.repeat(60));
    
    const diasPorEstado = calcularDiasPorEstadoCorrect(ticketKey);
    const totalDias = Object.values(diasPorEstado).reduce((sum, d) => sum + d, 0);
    
    console.log(`\n  📊 RESUMEN POR ESTADO:`);
    ESTADOS_TRACKING.forEach(estado => {
        const dias = diasPorEstado[estado] || 0;
        if (dias > 0) {
            const formatted = formatTime(dias);
            console.log(`     ${estado.padEnd(15)}: ${formatted.padStart(8)} (${dias.toFixed(2)} días)`);
        }
    });
    
    console.log(`\n  ⏱️  TOTAL: ${formatTime(totalDias)} (${totalDias.toFixed(2)} días)`);
    
    // Mostrar el changelog completo para este ticket
    console.log(`\n  📜 HISTORIAL COMPLETO:`);
    changelogEntry.forEach((entry, idx) => {
        const estado = normalizarEstado(entry.estado);
        const dias = entry.dias || 0;
        const inicio = entry.inicio || '?';
        const fin = entry.fin === 'En curso' ? '(aún activo)' : entry.fin || '?';
        console.log(`     [${idx + 1}] ${estado.padEnd(15)} | ${dias.toFixed(1)} días | ${inicio} → ${fin}`);
    });
});

console.log('\n\n╔════════════════════════════════════════════════════════════════════╗');
console.log('║                         CONCLUSIONES                              ║');
console.log('╚════════════════════════════════════════════════════════════════════╝\n');

console.log('✅ El changelog se utilizará CON SUS VALORES TAL COMO ESTÁN');
console.log('⚠️  Los valores mostrados en la tabla son ACUMULADOS por estado');
console.log('⚠️  Si hay múltiples períodos del mismo estado, se suman todos\n');

console.log('PRÓXIMOS PASOS:');
console.log('1. Ejecutar: node .\extract_jira_changelog.ps1');
console.log('2. Verificar que los últimos cambios de estado estén en el changelog');
console.log('3. Actualizar dashboard_changelog_data.js con los nuevos datos\n');
