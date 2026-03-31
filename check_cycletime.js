const fs = require('fs');

// Load data files
const clContent = fs.readFileSync('dashboard_changelog_data.js', 'utf8');
const dtContent = fs.readFileSync('dashboard_data.js', 'utf8');

// Execute in a context that exposes window-like globals
const vm = require('vm');
const ctx = { window: {}, console };
vm.createContext(ctx);
vm.runInContext(clContent + '\nwindow.changelogData = changelogData;', ctx);
vm.runInContext(dtContent + '\nwindow.ticketsData = ticketsData;', ctx);

const changelogData = ctx.window.changelogData;
const allTickets = ctx.window.ticketsData;

console.log('Total tickets cargados:', allTickets.length);
console.log('Keys changelog:', Object.keys(changelogData).length);

const ignore = new Set(['to do','tareas por hacer','done','finalizada','finalizados','finalizado']);

for (const sprint of ['35','36']) {
    const tickets = allTickets.filter(t => String(t.sprint).trim() === sprint && t.estadoNormalizado === 'Finalizados');
    const withCL  = tickets.filter(t => changelogData[t.clave]);
    
    let totalDias = 0;
    withCL.forEach(t => {
        const hist = changelogData[t.clave];
        let dias = 0;
        hist.forEach(e => {
            const k = (e.estado||'').toLowerCase().trim();
            if (!ignore.has(k)) dias += parseFloat(e.dias)||0;
        });
        totalDias += dias;
    });
    
    const avg = withCL.length > 0 ? totalDias / withCL.length : 0;
    const d = Math.floor(avg);
    const h = Math.round((avg - d) * 9);
    
    console.log(`\nSprint ${sprint}:`);
    console.log(`  Finalizados: ${tickets.length} tickets`);
    console.log(`  Con changelog: ${withCL.length}`);
    console.log(`  Total días acumulados: ${totalDias.toFixed(2)}`);
    console.log(`  Promedio cycle time: ${avg.toFixed(3)}d => ${d}d ${h}h`);
    
    // Breakdown por ticket
    console.log('\n  Top 5 cycle times:');
    const detalles = withCL.map(t => {
        const hist = changelogData[t.clave];
        let dias = 0;
        hist.forEach(e => {
            const k = (e.estado||'').toLowerCase().trim();
            if (!ignore.has(k)) dias += parseFloat(e.dias)||0;
        });
        return { clave: t.clave, dias };
    }).sort((a,b) => b.dias - a.dias);
    detalles.slice(0,5).forEach(x => console.log(`    ${x.clave}: ${x.dias.toFixed(2)}d`));
    console.log('  ...');
    console.log('  Lowest 3:');
    detalles.slice(-3).forEach(x => console.log(`    ${x.clave}: ${x.dias.toFixed(2)}d`));
}
