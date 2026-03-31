// Combina datos historicos S30-S34 (del backup) con nuevos S35-S36-S37
const fs = require('fs');

// Cargar historico (HEAD backup)
let srcHead = fs.readFileSync('dashboard_data_HEAD_backup.js', 'utf8');
srcHead = srcHead.replace('const ticketsData', 'var ticketsDataHead');
eval(srcHead);

// Cargar nuevos (S35+S36+S37 extraidos hoy)
let srcNew = fs.readFileSync('dashboard_data.js', 'utf8');
srcNew = srcNew.replace('const ticketsData', 'var ticketsDataNew');
eval(srcNew);

// Solo conservar S30-S34 del historico
const historicos = ticketsDataHead.filter(t => {
    const s = parseInt(t.sprint);
    return s >= 30 && s <= 34;
});

console.log('Historicos S30-S34 a conservar:', historicos.length);
const byH = {};
historicos.forEach(t => { byH[t.sprint] = (byH[t.sprint] || 0) + 1; });
console.log('Por sprint:', byH);

// Combinar
const combined = historicos.concat(ticketsDataNew);
console.log('Total combinado:', combined.length);

// Generar JS
function esc(v) {
    return String(v || '').replace(/"/g, "'").replace(/\n/g, ' ').replace(/\r/g, '');
}

const lines = combined.map(t =>
    `  {clave: "${esc(t.clave)}", tipoIncidencia: "${esc(t.tipoIncidencia)}", resumen: "${esc(t.resumen)}", asignado: "${esc(t.asignado)}", prioridad: "${esc(t.prioridad)}", estado: "${esc(t.estado)}", estadoNormalizado: "${esc(t.estadoNormalizado)}", creada: "${esc(t.creada)}", actualizada: "${esc(t.actualizada)}", resuelta: "${esc(t.resuelta)}", sprint: "${esc(t.sprint)}", sprints: "${esc(t.sprints)}", diasResolucionReal: "${esc(t.diasResolucionReal)}", storyPointEstimate: "${esc(t.storyPointEstimate)}", desviacion: "${esc(t.desviacion)}"}`
);

const output = `// Dashboard Data - Generated: ${new Date().toISOString().slice(0,10)} (Sprint 30-34 histórico + 35-36 cerrados + 37 activo)\nconst ticketsData = [\n${lines.join(',\n')}\n];`;

fs.writeFileSync('dashboard_data.js', output, 'utf8');
console.log('dashboard_data.js actualizado correctamente');

const bySprint = {};
combined.forEach(t => { bySprint[t.sprint] = (bySprint[t.sprint] || 0) + 1; });
console.log('Distribucion final:', bySprint);
