// Check real state of Sprint 35 tickets using changelog + static data
const fs = require('fs');

// Load dashboard_data.js
const dataCode = fs.readFileSync('./dashboard_data.js', 'utf8');
const dataFn = new Function(dataCode + '\nreturn ticketsData;');
const tickets = dataFn();

// Load changelog - use Function to avoid strict mode issues
const clCode = fs.readFileSync('./dashboard_changelog_data.js', 'utf8');
const clFn = new Function(clCode + '\nreturn changelogData;');
const changelogData = clFn();

const s35 = tickets.filter(t => t.sprint === '35');
console.log('=== SPRINT 35: ANALISIS COMPLETO ===');
console.log('Total tickets:', s35.length);
console.log();

// For each S35 ticket, check if it has "Finalizados" in changelog
const estadoReal = {};
const detalles = [];
let finalizadosReal = 0;

s35.forEach(t => {
    const cl = changelogData[t.clave];
    let ultimoEstado = t.estadoNormalizado; // fallback to static
    let tieneFinalizados = false;
    
    if (cl && cl.length > 0) {
        // Find last transition - it tells us current state
        const ultimaTransicion = cl[cl.length - 1];
        // Check if any transition ends in "Finalizados"
        const finTrans = cl.filter(c => c.estado === 'Finalizados' || c.estado === 'Done' || c.estado === 'Cerrado');
        if (finTrans.length > 0) {
            tieneFinalizados = true;
        }
        // The "fin" field that equals "En curso" means that transition is still active
        // But the last estado in the array generally indicates the current state
        // Check for Finalizados in any way
        const lastEstado = cl[cl.length-1].estado;
        if (lastEstado === 'Finalizados' || lastEstado === 'Done') {
            ultimoEstado = 'Finalizados';
        } else {
            ultimoEstado = lastEstado;
        }
    }
    
    if (ultimoEstado === 'Finalizados' || tieneFinalizados) finalizadosReal++;
    
    estadoReal[ultimoEstado] = (estadoReal[ultimoEstado] || 0) + 1;
    
    if (ultimoEstado !== t.estadoNormalizado) {
        detalles.push(`${t.clave}: static=${t.estadoNormalizado} → real=${ultimoEstado}`);
    }
});

console.log('Estado en dashboard_data.js:');
const porEstado = {};
s35.forEach(t => { porEstado[t.estadoNormalizado] = (porEstado[t.estadoNormalizado] || 0) + 1; });
Object.entries(porEstado).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(`  ${k}: ${v}`));

console.log('\nEstado real (ultimo estado en changelog):');
Object.entries(estadoReal).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(`  ${k}: ${v}`));

console.log('\nTickets con estado cambiado:', detalles.length);
detalles.forEach(d => console.log('  ', d));

console.log('\nFinalizados reales (con transición a Finalizados):', finalizadosReal);

// Show S35 tickets without changelog
const sinCL = s35.filter(t => !changelogData[t.clave]);
console.log('\nS35 sin changelog:', sinCL.length);
sinCL.forEach(t => console.log('  ', t.clave, t.estadoNormalizado, t.resumen.slice(0,50)));
