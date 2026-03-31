// Script para actualizar el campo estadoNormalizado en dashboard_data.js
// usando los estados reales del changelog de JIRA
const fs = require('fs');

// Load changelog data
const clCode = fs.readFileSync('./dashboard_changelog_data.js', 'utf8');
const clFn = new Function(clCode + '\nreturn changelogData;');
const changelogData = clFn();

// Read dashboard_data.js raw
let dataContent = fs.readFileSync('./dashboard_data.js', 'utf8');

// Parse tickets
const dataFn = new Function(dataContent + '\nreturn ticketsData;');
const tickets = dataFn();

// Mapping from JIRA changelog states to estadoNormalizado values
function mapEstadoToNormalizado(estado) {
    const e = (estado || '').toLowerCase().trim();
    if (e === 'finalizados' || e === 'done' || e === 'cerrado' || e === 'closed') return 'Finalizados';
    if (e === 'in process' || e === 'in progress') return 'En curso';
    if (e === 'in test' || e === 'in test dev' || e === 'test in dev') return 'En curso';
    if (e === 'code review') return 'En curso';
    if (e === 'blocked') return 'En curso'; // Blocked = still in progress
    if (e === 'test issues' || e === 'test issue') return 'En curso';
    if (e === 'to do' || e === 'backlog') return 'Tareas por hacer';
    return null; // No mapping - keep original
}

console.log('=== ACTUALIZANDO estadoNormalizado CON DATOS REALES DEL CHANGELOG ===\n');

let cambios = 0;
let sinCambio = 0;

tickets.forEach(t => {
    const cl = changelogData[t.clave];
    if (!cl || cl.length === 0) return;
    
    // Get the last state from changelog
    const ultimoEstado = cl[cl.length - 1].estado;
    const nuevoNormalizado = mapEstadoToNormalizado(ultimoEstado);
    
    if (!nuevoNormalizado) return;
    
    if (nuevoNormalizado !== t.estadoNormalizado) {
        // Also update 'estado' and 'resuelta' fields
        const oldEstado = t.estado;
        const oldNorm = t.estadoNormalizado;
        
        // Build the old pattern to find in the file
        // Update estadoNormalizado
        const oldPattern = `clave: "${t.clave}"`;
        const lineIdx = dataContent.indexOf(oldPattern);
        if (lineIdx === -1) {
            console.log(`  WARN: No encontré ${t.clave} en el archivo`);
            return;
        }
        
        // Find the end of this ticket's entry (next closing brace)
        const lineEnd = dataContent.indexOf('},', lineIdx);
        if (lineEnd === -1) return;
        
        let ticketStr = dataContent.substring(lineIdx, lineEnd);
        let newTicketStr = ticketStr;
        
        // Replace estadoNormalizado
        newTicketStr = newTicketStr.replace(
            /estadoNormalizado: "[^"]*"/,
            `estadoNormalizado: "${nuevoNormalizado}"`
        );
        
        // If ticket is now Finalizados, update the 'estado' field too
        if (nuevoNormalizado === 'Finalizados') {
            newTicketStr = newTicketStr.replace(
                /estado: "[^"]*"/,
                `estado: "Finalizados"`
            );
            
            // If resuelta is empty, try to get the date from changelog
            if (t.resuelta === '' || !t.resuelta) {
                const finTransicion = cl.find(c => c.estado === 'Finalizados' || c.estado === 'Done');
                if (finTransicion && finTransicion.inicio) {
                    // The inicio of Finalizados is when it entered that state
                    // Convert from "DD/MM/YYYY HH:mm" to "DD/Mon/YY"
                    const parts = finTransicion.inicio.match(/(\d+)\/(\d+)\/(\d+)/);
                    if (parts) {
                        const meses = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        const dia = parts[1];
                        const mes = meses[parseInt(parts[2])];
                        const anio = parts[3].slice(-2);
                        const fechaResuelta = `${dia}/${mes}/${anio}`;
                        newTicketStr = newTicketStr.replace(
                            /resuelta: ""/,
                            `resuelta: "${fechaResuelta}"`
                        );
                    }
                }
            }
        }
        
        if (ticketStr !== newTicketStr) {
            dataContent = dataContent.replace(ticketStr, newTicketStr);
            cambios++;
            console.log(`  ${t.clave}: ${oldNorm} → ${nuevoNormalizado} (changelog: ${ultimoEstado})`);
        }
    } else {
        sinCambio++;
    }
});

console.log(`\n✓ ${cambios} tickets actualizados`);
console.log(`✓ ${sinCambio} tickets sin cambio (ya correctos)`);

// Verify final counts
const newFn = new Function(dataContent + '\nreturn ticketsData;');
const newTickets = newFn();
const s35new = newTickets.filter(t => t.sprint === '35');
const porEstado = {};
s35new.forEach(t => { porEstado[t.estadoNormalizado] = (porEstado[t.estadoNormalizado] || 0) + 1; });
console.log('\n=== Sprint 35 - NUEVOS ESTADOS ===');
Object.entries(porEstado).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(`  ${k}: ${v}`));

// Also check Sprint 36
const s36new = newTickets.filter(t => t.sprint === '36');
const porEstado36 = {};
s36new.forEach(t => { porEstado36[t.estadoNormalizado] = (porEstado36[t.estadoNormalizado] || 0) + 1; });
console.log('\n=== Sprint 36 - NUEVOS ESTADOS ===');
Object.entries(porEstado36).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(`  ${k}: ${v}`));

// Write the updated file
fs.writeFileSync('./dashboard_data.js', dataContent, 'utf8');
console.log('\n✓ dashboard_data.js actualizado con estados reales');
