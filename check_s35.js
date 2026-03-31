const fs = require('fs');
const code = fs.readFileSync('./dashboard_data.js', 'utf8');

// Parse tickets using Function constructor
const fn = new Function(code + '\nreturn ticketsData;');
let tickets;
try {
    tickets = fn();
} catch(e) {
    // Try alternate approach - extract and eval
    const globalThis2 = {};
    try {
        eval(code);
        tickets = ticketsData;
    } catch(e2) {
        console.log('Error:', e2.message);
        process.exit(1);
    }
}

const s35 = tickets.filter(t => t.sprint === '35');
console.log('=== SPRINT 35 ===');
console.log('Total tickets:', s35.length);

const porEstado = {};
s35.forEach(t => { porEstado[t.estadoNormalizado] = (porEstado[t.estadoNormalizado] || 0) + 1; });
console.log('Por estadoNormalizado:', JSON.stringify(porEstado, null, 2));

const finalizados = s35.filter(t => t.estadoNormalizado === 'Finalizados');
console.log('\nFinalizados (' + finalizados.length + '):');
finalizados.forEach(t => console.log(' ', t.clave, '-', t.asignado, '-', t.resumen.slice(0,50)));

// Also check sprints field (some tickets have multi-sprint values)
const s35bySprints = tickets.filter(t => t.sprints && t.sprints.toString().includes('35'));
console.log('\nTickets con sprint 35 en campo sprints:', s35bySprints.length);
const diff = s35bySprints.filter(t => t.sprint !== '35');
if (diff.length > 0) {
    console.log('Tickets en sprints=35 pero sprint!=35:', diff.map(t => t.clave + ' sprint=' + t.sprint).join(', '));
}
