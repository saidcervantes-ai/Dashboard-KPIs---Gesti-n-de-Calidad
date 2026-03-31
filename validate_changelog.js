const fs = require('fs');
const content = fs.readFileSync('dashboard_changelog_data.js', 'utf8');

// Extract changelogData object
const match = content.match(/const changelogData\s*=\s*(\{[\s\S]*\})/);
eval('var changelogData = ' + match[1]);

const HORAS_DIA = 8;

function diasLaborales(inicioStr, finStr) {
    // Parse "DD/MM/YYYY HH:MM" or Date object
    function parseDate(s) {
        if (!s || s === 'En curso') return null;
        const m = s.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2})/);
        if (!m) return null;
        return new Date(+m[3], +m[2]-1, +m[1], +m[4], +m[5]);
    }
    const inicio = typeof inicioStr === 'string' ? parseDate(inicioStr) : inicioStr;
    const fin    = finStr === 'En curso' ? new Date() : (typeof finStr === 'string' ? parseDate(finStr) : finStr);
    if (!inicio || !fin) return 0;

    let totalMs = 0;
    let cur = new Date(inicio);

    while (cur < fin) {
        const dow = cur.getDay();
        if (dow !== 0 && dow !== 6) {
            const startOfSlot = new Date(cur);
            const endOfDay = new Date(cur);
            endOfDay.setHours(17, 0, 0, 0);
            // cap startOfSlot to 8:00 if before
            if (startOfSlot.getHours() < 8) startOfSlot.setHours(8, 0, 0, 0);
            // cap to 17:00
            const slotEnd = fin < endOfDay ? fin : endOfDay;
            if (slotEnd > startOfSlot) totalMs += slotEnd - startOfSlot;
        }
        // Move to next day 8:00
        cur = new Date(cur);
        cur.setDate(cur.getDate() + 1);
        cur.setHours(8, 0, 0, 0);
    }
    return totalMs / (1000 * 60 * 60 * HORAS_DIA);
}

function fmtD(dias) {
    if (dias <= 0) return '-';
    if (dias >= 1) {
        const d = Math.floor(dias);
        const h = Math.round((dias - d) * HORAS_DIA);
        return h > 0 ? `${d}d ${h}h` : `${d}d`;
    }
    const h = Math.round(dias * HORAS_DIA);
    return h <= 0 ? '<1h' : `${h}h`;
}

const tickets = ['IMS-1078', 'IMS-984', 'IMS-777', 'IMS-999', 'IMS-1071', 'IMS-990', 'IMS-1116', 'IMS-997', 'IMS-1174', 'IMS-1164', 'IMS-1146', 'IMS-1148'];

tickets.forEach(key => {
    const hist = changelogData[key];
    if (!hist) { console.log(key + ': NO CHANGELOG'); return; }
    console.log('\n=== ' + key + ' ===');
    hist.forEach(t => {
        const labs = diasLaborales(t.inicio, t.fin);
        const raw  = t.dias || 0;
        console.log(`  ${(t.estado||'').padEnd(20)} | raw: ${String(raw).padStart(6)} d | laboral: ${fmtD(labs).padStart(8)} | inicio: ${t.inicio} → fin: ${t.fin}`);
    });
});
