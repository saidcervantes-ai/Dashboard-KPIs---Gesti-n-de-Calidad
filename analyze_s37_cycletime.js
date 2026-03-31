/**
 * Análisis de Cycle Time - Sprint 37
 * Verifica: pipeline por ticket, Flow Analytics, SLE
 */

// Cargar datos
const fs = require('fs');
const vm = require('vm');

// Leer archivos JS
const dataContent = fs.readFileSync('./dashboard_data.js', 'utf8');
const changelogContent = fs.readFileSync('./dashboard_changelog_data.js', 'utf8');

// VM: reemplazar const/let con var para que las variables queden en el contexto
const ctx = {};
vm.createContext(ctx);
vm.runInContext(dataContent.replace(/\bconst ticketsData\b/, 'var ticketsData'), ctx);
vm.runInContext(changelogContent.replace(/\bconst changelogData\b/, 'var changelogData'), ctx);
const ticketsData = ctx.ticketsData;
const changelogData = ctx.changelogData;

const SPRINT = '37';
const MINS_POR_DIA = 9 * 60; // 540 min = 1 día hábil

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
const estadosIgnorar = new Set(['to do', 'tareas por hacer', 'done', 'finalizada', 'finalizados', 'finalizado', 'closed', 'resolved']);

function parseFecha(fechaStr) {
    if (!fechaStr || fechaStr === 'En curso') return null;
    const [fecha, hora] = String(fechaStr).trim().split(' ');
    if (!fecha) return null;
    const [dd, mm, yyyy] = fecha.split('/').map(Number);
    const [HH, MM] = (hora || '00:00').split(':').map(Number);
    if (!dd || !mm || !yyyy) return null;
    return new Date(yyyy, mm - 1, dd, HH || 0, MM || 0);
}

function minutosHabiles(inicio, fin) {
    if (!inicio || !fin || fin <= inicio) return 0;
    let total = 0;
    let current = new Date(inicio.getTime());
    while (current < fin) {
        const dow = current.getDay();
        if (dow >= 1 && dow <= 5) {
            const y = current.getFullYear(), m = current.getMonth(), d = current.getDate();
            const labInicio = new Date(y, m, d, 8, 0);
            const labFin = new Date(y, m, d, 17, 0);
            const desde = current > labInicio ? current : labInicio;
            const hasta = fin < labFin ? fin : labFin;
            if (hasta > desde) total += (hasta - desde) / 60000;
        }
        current = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1);
    }
    return Math.max(0, Math.round(total));
}

// Filtrar tickets Sprint 37 finalizados
const ticketsS37 = ticketsData.filter(t => String(t.sprint).trim() === SPRINT && t.estadoNormalizado === 'Finalizados');
console.log(`\n${'='.repeat(70)}`);
console.log(`ANÁLISIS CYCLE TIME - SPRINT 37`);
console.log(`Tickets finalizados analizados: ${ticketsS37.length}`);
console.log(`${'='.repeat(70)}\n`);

// ── Con changelog ──────────────────────────────────────────────
let conChangelog = 0, sinChangelog = 0, sinDatos = 0;
const resultados = [];

for (const t of ticketsS37) {
    const historial = changelogData[t.clave] || null;
    const etapasMins = { inProcess: 0, codeReview: 0, inTestDev: 0, inTest: 0, blocked: 0, testIssue: 0 };
    let tieneEntradas = false;

    if (historial && historial.length > 0) {
        conChangelog++;
        historial.forEach(entrada => {
            const key = (entrada.estado || '').toLowerCase().trim();
            if (estadosIgnorar.has(key)) return;
            const etapa = estadoAEtapa[key];
            if (!etapa) return;
            tieneEntradas = true;
            const ini = parseFecha(entrada.inicio);
            const fin = parseFecha(entrada.fin);
            if (ini && fin) {
                etapasMins[etapa] += minutosHabiles(ini, fin);
            } else {
                etapasMins[etapa] += Math.round((parseFloat(entrada.dias) || 0) * MINS_POR_DIA);
            }
        });
    } else {
        sinChangelog++;
    }

    const etapas = {};
    let totalDias = 0;
    for (const [k, v] of Object.entries(etapasMins)) {
        const dias = v / MINS_POR_DIA;
        etapas[k] = parseFloat(dias.toFixed(2));
        totalDias += dias;
    }

    // Fallback si sin datos activos
    if (totalDias === 0) {
        sinDatos++;
        // usar diasResolucionReal si existe
        const drr = parseFloat(t.diasResolucionReal) || 0;
        totalDias = drr;
    }

    resultados.push({
        clave: t.clave,
        resumen: t.resumen.substring(0, 55),
        tieneChangelog: !!historial,
        diasTotal: parseFloat(totalDias.toFixed(2)),
        ...etapas,
        diasResolucionReal: parseFloat(t.diasResolucionReal) || null,
        alerta: null
    });
}

// ── Detectar anomalías ─────────────────────────────────────────
for (const r of resultados) {
    const alertas = [];
    if (r.diasTotal === 0) alertas.push('⚠️  CYCLE TIME = 0 (sin datos)');
    if (r.diasTotal > 30) alertas.push(`🔴 CYCLE TIME MUY ALTO: ${r.diasTotal} días`);
    if (!r.tieneChangelog) alertas.push('❌ SIN CHANGELOG - usa fallback');
    if (r.tieneChangelog && r.diasTotal === 0) alertas.push('🟡 Changelog existe pero tiempo activo = 0');
    if (r.inProcess === 0 && r.tieneChangelog) alertas.push('🟡 Sin tiempo en "In Process"');
    r.alerta = alertas.join(' | ') || '✅ OK';
}

// ── Imprimir pipeline por ticket ───────────────────────────────
console.log('── PIPELINE POR TICKET ──────────────────────────────────────────────');
console.log('Clave      | CycleTime | InProc | CodeRev | InTstDev | InTest | Blocked | TestIssue | Changelog | Alerta');
console.log('-'.repeat(140));

const sorted = [...resultados].sort((a, b) => b.diasTotal - a.diasTotal);
for (const r of sorted) {
    const row = [
        r.clave.padEnd(10),
        String(r.diasTotal).padStart(9),
        String(r.inProcess || 0).padStart(7),
        String(r.codeReview || 0).padStart(8),
        String(r.inTestDev || 0).padStart(9),
        String(r.inTest || 0).padStart(7),
        String(r.blocked || 0).padStart(8),
        String(r.testIssue || 0).padStart(10),
        (r.tieneChangelog ? 'SI' : 'NO').padStart(10),
        ' ' + r.alerta
    ].join(' | ');
    console.log(row);
}

// ── Flow Analytics ─────────────────────────────────────────────
const conDatos = resultados.filter(r => r.diasTotal > 0);
const sinDatosArr = resultados.filter(r => r.diasTotal === 0);
const dias = conDatos.map(r => r.diasTotal).sort((a, b) => a - b);

function percentil(arr, p) {
    if (arr.length === 0) return 0;
    const idx = (p / 100) * (arr.length - 1);
    const lo = Math.floor(idx), hi = Math.ceil(idx);
    return parseFloat((arr[lo] + (arr[hi] - arr[lo]) * (idx - lo)).toFixed(1));
}

const promedio = dias.length > 0 ? parseFloat((dias.reduce((a,b)=>a+b,0)/dias.length).toFixed(1)) : 0;
const mediana = percentil(dias, 50);
const p85 = percentil(dias, 85);
const min = dias.length > 0 ? dias[0] : 0;
const max = dias.length > 0 ? dias[dias.length-1] : 0;

console.log(`\n${'='.repeat(70)}`);
console.log('── FLOW ANALYTICS - SPRINT 37 ──────────────────────────────────────');
console.log(`${'='.repeat(70)}`);
console.log(`  Tickets analizados : ${resultados.length}`);
console.log(`  Con changelog      : ${conChangelog} (${Math.round(conChangelog/resultados.length*100)}%)`);
console.log(`  Sin changelog      : ${sinChangelog} (${Math.round(sinChangelog/resultados.length*100)}%)`);
console.log(`  Con cy=0 (sin datos): ${sinDatosArr.length}`);
console.log(`  Con datos activos  : ${conDatos.length}`);
console.log(``);
console.log(`  Promedio Cycle Time: ${promedio} días`);
console.log(`  Mediana (P50)      : ${mediana} días`);
console.log(`  Percentil 85 (SLE) : ${p85} días`);
console.log(`  Mín                : ${min} días`);
console.log(`  Máx                : ${max} días`);

// Distribución por rangos
const buckets = [
    { label: '0-2 días',   min:0,  max:2  },
    { label: '3-5 días',   min:3,  max:5  },
    { label: '6-10 días',  min:6,  max:10 },
    { label: '11-20 días', min:11, max:20 },
    { label: '>20 días',   min:21, max:9999},
];
console.log(`\n  Distribución:`);
for (const b of buckets) {
    const cnt = conDatos.filter(r => r.diasTotal >= b.min && r.diasTotal <= b.max).length;
    const bar = '█'.repeat(cnt);
    console.log(`    ${b.label.padEnd(12)} : ${String(cnt).padStart(2)} tickets  ${bar}`);
}

// SLE: ¿qué % termina en ≤X días?
console.log(`\n── SERVICE LEVEL EXPECTATION (SLE) ─────────────────────────────────`);
const sleTargets = [5, 7, 10, 14, 21];
for (const target of sleTargets) {
    const pct = Math.round(conDatos.filter(r => r.diasTotal <= target).length / conDatos.length * 100);
    const indicador = pct >= 85 ? '✅' : pct >= 70 ? '🟡' : '🔴';
    console.log(`  ${indicador} ${pct}% completan en ≤${target} días (SLE ${target}d)`);
}

// ── Tickets sin changelog / alertas ───────────────────────────
const alertaTickets = resultados.filter(r => r.alerta !== '✅ OK');
if (alertaTickets.length > 0) {
    console.log(`\n── TICKETS CON ALERTAS (${alertaTickets.length}) ────────────────────────────`);
    for (const r of alertaTickets) {
        console.log(`  ${r.clave} | CycleTime: ${r.diasTotal}d | ${r.alerta}`);
        console.log(`         └─ ${r.resumen}`);
    }
}

// ── Resumen etapas promedio ────────────────────────────────────
console.log(`\n── TIEMPO MEDIO POR ETAPA (solo tickets con changelog) ─────────────`);
const conCL = resultados.filter(r => r.tieneChangelog);
const etapasKeys = ['inProcess','codeReview','inTestDev','inTest','blocked','testIssue'];
for (const k of etapasKeys) {
    const suma = conCL.reduce((acc, r) => acc + (r[k] || 0), 0);
    const avg = conCL.length > 0 ? (suma/conCL.length).toFixed(2) : 0;
    console.log(`  ${k.padEnd(12)}: ${avg} días promedio`);
}

console.log(`\n${'='.repeat(70)}\n`);
