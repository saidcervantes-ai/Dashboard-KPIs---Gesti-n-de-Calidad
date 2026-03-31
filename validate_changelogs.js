// validate_changelogs.js
// Recalcula tiempos de todos los tickets S35+S36+S37 y compara contra lo almacenado
const fs = require('fs');

// ─── Replica exacta de Get-BusinessDays del script PowerShell ───────────────
// Jornada: 09:00–18:00, solo Lunes–Viernes, divide por 540 min/día
function businessDays(inicioStr, finStr) {
    if (!inicioStr || !finStr || finStr === 'En curso') return null; // skip open

    const parse = (s) => {
        // Format: 'DD/MM/YYYY HH:mm'
        const [datePart, timePart] = s.split(' ');
        const [dd, mm, yyyy] = datePart.split('/');
        const [hh, mi] = timePart.split(':');
        return new Date(parseInt(yyyy), parseInt(mm)-1, parseInt(dd), parseInt(hh), parseInt(mi), 0);
    };

    const inicio = parse(inicioStr);
    const fin    = parse(finStr);

    if (fin <= inicio) return 0.0;

    let totalMin = 0;
    let current  = new Date(inicio);

    while (current < fin) {
        const dow = current.getDay(); // 0=Sun,6=Sat
        if (dow !== 0 && dow !== 6) {
            const y = current.getFullYear(), mo = current.getMonth(), d = current.getDate();
            const labInicio = new Date(y, mo, d, 9,  0, 0);
            const labFin    = new Date(y, mo, d, 18, 0, 0);
            const desde = current > labInicio ? current : labInicio;
            const hasta = fin    < labFin    ? fin    : labFin;
            if (hasta > desde) totalMin += (hasta - desde) / 60000;
        }
        // Avanzar al inicio del siguiente día
        current = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1);
    }
    return Math.round(totalMin / 540 * 10) / 10;
}

// ─── Carga de datos ──────────────────────────────────────────────────────────
const chContent = fs.readFileSync('dashboard_changelog_data.js', 'utf8');
const dataContent = fs.readFileSync('dashboard_data.js', 'utf8');

// Obtener claves de S35, S36, S37
const ticketLines = dataContent.split('\n').filter(l => l.trim().startsWith('{clave:'));
const getField = (line, key) => { const m = line.match(new RegExp(key + ': "([^"]*)"')); return m ? m[1] : ''; };
const sprintTickets = ticketLines.map(l => ({ clave: getField(l,'clave'), sprint: getField(l,'sprint') }));
const targetClaves = new Set(
    sprintTickets.filter(t => ['35','36','37'].includes(t.sprint)).map(t => t.clave)
);

// Parsear changelog: extraer cada entry del objeto JS
// Formato: 'IMS-XXXX': [ {estado: '...', dias: N, inicio: '...', fin: '...'}, ... ]
const entryRegex = /\{estado:\s*'([^']*)',\s*dias:\s*([\d.]+),\s*inicio:\s*'([^']*)',\s*fin:\s*'([^']*)'\}/g;
const ticketBlockRegex = /'(IMS-[\w-]+)':\s*\[([\s\S]*?)\](?=,\s*\n\s*'IMS-|,?\s*\n\};)/g;

let totalChecked = 0;
let totalDiscrepancias = 0;
const discrepancias = [];
const resumen = {};

let blockMatch;
while ((blockMatch = ticketBlockRegex.exec(chContent)) !== null) {
    const clave = blockMatch[1];
    if (!targetClaves.has(clave)) continue;

    const sprint = sprintTickets.find(t => t.clave === clave)?.sprint || '?';
    const blockContent = blockMatch[2];

    let entryMatch;
    const entries = [];
    const entryRegexLocal = /\{estado:\s*'([^']*)',\s*dias:\s*([\d.]+),\s*inicio:\s*'([^']*)',\s*fin:\s*'([^']*)'\}/g;
    while ((entryMatch = entryRegexLocal.exec(blockContent)) !== null) {
        entries.push({
            estado: entryMatch[1],
            diasAlmacenado: parseFloat(entryMatch[2]),
            inicio: entryMatch[3],
            fin:    entryMatch[4]
        });
    }

    let ticketOk = true;
    for (const e of entries) {
        if (e.fin === 'En curso') continue; // no se puede validar

        totalChecked++;
        const diasCalc = businessDays(e.inicio, e.fin);
        const diff = Math.abs(diasCalc - e.diasAlmacenado);

        if (diff > 0.15) { // tolerancia de 0.15 días (~80 min) para redondeo
            totalDiscrepancias++;
            ticketOk = false;
            discrepancias.push({
                clave, sprint,
                estado: e.estado,
                inicio: e.inicio,
                fin: e.fin,
                almacenado: e.diasAlmacenado,
                calculado: diasCalc,
                diff: Math.round(diff * 10) / 10
            });
        }
    }

    resumen[sprint] = resumen[sprint] || { ok: 0, fail: 0 };
    if (ticketOk) resumen[sprint].ok++; else resumen[sprint].fail++;
}

// ─── Reporte ─────────────────────────────────────────────────────────────────
console.log('='.repeat(70));
console.log('VALIDACIÓN CHANGELOGS  —  Sprints 35, 36, 37');
console.log('Jornada configurada: Lun–Vie  09:00–18:00  (9h/día = 540 min)');
console.log('='.repeat(70));

console.log('\nRESUMEN POR SPRINT:');
for (const sp of ['35','36','37']) {
    const r = resumen[sp] || {ok:0,fail:0};
    const total = r.ok + r.fail;
    console.log(`  Sprint ${sp}: ${total} tickets  ✅ ${r.ok} OK  ${r.fail > 0 ? '❌ ' + r.fail + ' con discrepancias' : ''}`);
}

console.log(`\nEntradasvalidadas: ${totalChecked}  |  Discrepancias (diff > 0.15 días): ${totalDiscrepancias}`);

if (discrepancias.length === 0) {
    console.log('\n✅ TODOS LOS TIEMPOS COINCIDEN con el cálculo L–V 09:00–18:00\n');
} else {
    console.log('\n❌ DISCREPANCIAS ENCONTRADAS:\n');
    discrepancias.forEach(d => {
        const diffMin = Math.round(d.diff * 540);
        console.log(`  ${d.clave} (S${d.sprint}) | ${d.estado}`);
        console.log(`    inicio: ${d.inicio}  fin: ${d.fin}`);
        console.log(`    Almacenado: ${d.almacenado}d  |  Calculado: ${d.calculado}d  |  Diff: ${d.diff}d (~${diffMin} min)`);
    });
}

// ─── Verificación específica de los 3 tickets del screenshot ─────────────────
console.log('\n' + '─'.repeat(70));
console.log('VERIFICACIÓN PUNTUAL (tickets del screenshot):');

const checks = [
    { clave: 'IMS-1127', estado: 'In Test',    inicio: '27/02/2026 09:09', fin: '12/03/2026 11:49', stored: 9.3 },
    { clave: 'IMS-1150', estado: 'IN TEST DEV',inicio: '03/03/2026 19:14', fin: '05/03/2026 17:26', stored: 1.9 },
    { clave: 'IMS-1171', estado: 'In Process', inicio: '09/03/2026 16:40', fin: '09/03/2026 22:37', stored: 0.1 },
    { clave: 'IMS-1171', estado: 'CODE REVIEW', inicio: '09/03/2026 22:37', fin: '11/03/2026 10:35', stored: 1.2 },
];

for (const c of checks) {
    const calc = businessDays(c.inicio, c.fin);
    const totalH = calc * 9;
    const dias   = Math.floor(totalH / 9);
    const horas  = Math.round(totalH % 9);
    const display = dias > 0 && horas > 0 ? `${dias}d ${horas}h` : dias > 0 ? `${dias}d` : `${Math.round(totalH)}h`;
    const ok = Math.abs(calc - c.stored) <= 0.15 ? '✅' : '❌';
    console.log(`  ${ok} ${c.clave} | ${c.estado.padEnd(14)} | ${c.inicio} → ${c.fin}`);
    console.log(`     Almacenado: ${c.stored}d  Calculado: ${calc}d  Display: "${display}"`);
}

console.log('\n' + '─'.repeat(70));
console.log('CONFIGURACIÓN DE JORNADA EN extract_s36_s37.ps1:');
console.log('  Inicio laboral : 09:00');
console.log('  Fin laboral    : 18:00  (NO 20:00)');
console.log('  Horas/día      : 9h (540 min)');
console.log('  Días hábiles   : Lunes–Viernes (sábado y domingo EXCLUIDOS)');
console.log('─'.repeat(70));
